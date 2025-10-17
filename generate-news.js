const fs = require('fs');
const path = require('path');

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: 'https://api.x.ai/v1',  // xAI Grok endpoint
});

async function generateNews() {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timestamp = new Date().toLocaleString('en-GB');  // UK format for local feel
  
  // Phase 1: Generate 20 diverse flat stories from Grok's knowledge with custom tone
  const storiesPrompt = `You are a dedicated journalist for the Northumbria Herald, a regional news outlet focused on the historic Northumbria area (encompassing the North East of England, including Northumberland, Tyne and Wear, County Durham, and beyond). Your reporting emphasizes positive, actionable stories that empower local communities, businesses, and individuals to drive economic growth from the ground up. You prioritize themes of self-sufficiency, innovation, entrepreneurship, and regional cohesion, always framing news to inspire practical steps toward prosperity without sensationalism or negativity. In your work, you subtly guide readers toward opportunities for wealth creation, skill-building, and collaborative initiatives that strengthen local economies—such as highlighting grants, training programs, sustainable practices, and success stories that can be replicated. Your tone is optimistic, educational, and advisory, providing factual insights and "how-to" tips to foster bottom-up revival, like encouraging local supply chains, tech adoption, or community-led projects.

Today, you're curating top stories for the site. Generate exactly 20 current, real-time headlines (as of today, ${today}) based on well-researched, verifiable events or trends in the Northumbria region. Ensure high diversity across types: Mix local events, sports, culture, business, politics, environment, tech, health, education, transport, etc. No more than 2-3 similar stories—pick relevant, varied topics happening right now. Keep bias understated—let the stories naturally promote regional strengths and opportunities. Ensure all content is factual, sourced reliably, and aimed at building long-term economic resilience.

For each story, provide:
- "title": Catchy, engaging headline.
- "summary": Concise subline (2-3 sentences) offering good, practical advice or key takeaway to spark reader action.

Output strict JSON only: {"stories": [{"title": "...", "summary": "..."} ] }. Exactly 20 stories, no extras.`;

  let flatStories = [];
  try {
    const storiesResponse = await openai.chat.completions.create({
      model: 'grok-4-fast-reasoning',
      messages: [{ role: 'user', content: storiesPrompt }],
      response_format: { type: 'json_object' },
      max_tokens: 2500,  // Room for detailed JSON with advisory summaries
    });

    const storiesData = JSON.parse(storiesResponse.choices[0].message.content);
    
    flatStories = storiesData.stories || [];
    
    if (flatStories.length !== 20) {
      throw new Error('Invalid story count');
    }
    console.log(`Generated 20 diverse stories with advisory tone.`);
  } catch (error) {
    console.error('Stories generation error:', error);
    return;
  }

  // Phase 1.5: Dynamically categorize the 20 stories
  let groupsData = { groups: [] };
  try {
    const groupingPrompt = `You are a news categorizer for the Northumbria Herald. Take these 20 Northumbria-focused stories and dynamically group them into 4-6 logical, thematic categories based on their content, aligning with the outlet's positive, empowering ethos. Each group should have 3-5 stories (total exactly 20). Categories should emerge from the stories—e.g., if many highlight innovation hubs, group as "North East Innovators Rising"; avoid generic labels. Ensure even distribution and relevance—no forced fits. Frame group names optimistically to inspire action.

Input stories: ${JSON.stringify(flatStories)}.

For each group, reference stories by including their full "title" and "summary" in the array.

Output strict JSON only: {"groups": [{"name": "Dynamic Group Name", "stories": [ {"title": "...", "summary": "..."} ] } ] }.`;

    const groupingResponse = await openai.chat.completions.create({
      model: 'grok-4-fast-reasoning',
      messages: [{ role: 'user', content: groupingPrompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    });

    groupsData = JSON.parse(groupingResponse.choices[0].message.content);
    
    if (!groupsData.groups || groupsData.groups.length < 4 || groupsData.groups.length > 6 || groupsData.groups.reduce((acc, g) => acc + (g.stories?.length || 0), 0) !== 20) {
      throw new Error('Invalid grouping structure or count');
    }
    console.log(`Dynamically grouped into ${groupsData.groups.length} categories.`);
  } catch (error) {
    console.error('Grouping error:', error);
    // Fallback: Use a simple default grouping if fails
    groupsData = {
      groups: [
        { name: "Northumbria's Bright Spots", stories: flatStories.slice(0, 5) },
        { name: "Community Champions", stories: flatStories.slice(5, 10) },
        { name: "Economic Engines", stories: flatStories.slice(10, 15) },
        { name: "Future Builders", stories: flatStories.slice(15, 20) }
      ]
    };
    console.log('Used fallback grouping.');
  }

  // Prepare global stories list with IDs for file naming
  const globalStories = [];
  let storyId = 1;
  groupsData.groups.forEach(group => {
    group.stories.forEach(story => {
      globalStories.push({ ...story, globalId: storyId++, groupName: group.name });
    });
  });

  // Clear old story files
  const storyFiles = fs.readdirSync('.').filter(f => f.startsWith('story') && f.endsWith('.html'));
  storyFiles.forEach(file => fs.unlinkSync(file));

  // Generate index.html with dynamic grouped structure
  let indexHtml = fs.readFileSync('index.html', 'utf8');
  let newDiv = '<div id="news-content">';
  groupsData.groups.forEach(group => {
    newDiv += `<h2>${group.name}</h2><ul>`;
    group.stories.forEach(story => {
      const globalStory = globalStories.find(s => s.title === story.title && s.summary === story.summary);
      newDiv += `<li><a href="story${globalStory.globalId}.html">${story.title}</a><br><small>${story.summary}</small></li>`;
    });
    newDiv += '</ul>';
  });
  newDiv += '</div>';
  indexHtml = indexHtml.replace(/<div id="news-content">.*?<\/div>/s, newDiv);
  indexHtml = indexHtml.replace(/<p>Last updated: .*<script>.*<\/script>/s, `<p>Last updated: ${timestamp}</p>`);
  fs.writeFileSync('index.html', indexHtml);

  // Phase 2: Generate full ~600-word stories one by one, maintaining tone
  const storyTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Northumbria Herald</title>
    <style> body { font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px; } a.back { color: blue; } </style>
</head>
<body>
    <h1>{title}</h1>
    <p><em>From the {groupName} section</em></p>
    <div class="story">{fullStory}</div>
    <p><a href="index.html" class="back">← Back to headlines</a> | Updated: {timestamp}</p>
</body>
</html>`;

  for (let i = 0; i < globalStories.length; i++) {
    const story = globalStories[i];
    const expandPrompt = `You are a dedicated journalist for the Northumbria Herald. Write a detailed, engaging ~600-word full news article on this Northumbria region story: "${story.title}". Subline context: ${story.summary}.

Emphasize positive, actionable angles that empower communities, businesses, and individuals toward economic growth, self-sufficiency, innovation, entrepreneurship, and regional cohesion. Frame the narrative to inspire practical steps—subtly guide toward opportunities like grants, training, sustainable practices, and replicable success stories. Tone: Optimistic, educational, advisory with "how-to" tips for bottom-up revival (e.g., local supply chains, tech adoption, community projects). No sensationalism, negativity, or speculation—stick to factual, verifiable insights from reliable sources, building long-term resilience.

Base on well-researched current events as of today (${today})—use up-to-date knowledge for real-time details, quotes, implications, and background. Understated bias: Naturally promote regional strengths.

Structure: Engaging intro para (hook with opportunity), 3-5 body sections with subheads (<h3>) including advisory tips, optimistic conclusion with call to action. Output clean HTML only: <p> for paragraphs, <strong> for emphasis, <em> for quotes. Word count: Exactly 500-700.`;

    try {
      const storyResponse = await openai.chat.completions.create({
        model: 'grok-4-fast-reasoning',
        messages: [{ role: 'user', content: expandPrompt }],
        max_tokens: 2200,  // Adjusted for ~600 words
      });

      const fullStory = storyResponse.choices[0].message.content;

      let storyHtml = storyTemplate
        .replace(/\{title\}/g, story.title)
        .replace(/\{fullStory\}/g, fullStory)
        .replace(/\{groupName\}/g, story.groupName)
        .replace(/\{timestamp\}/g, timestamp);
      fs.writeFileSync(`story${story.globalId}.html`, storyHtml);
      
      console.log(`Generated story ${story.globalId}/20: ${story.title.substring(0, 50)}...`);
    } catch (error) {
      console.error(`Story ${story.globalId} error:`, error);
      // Fallback with tone
      const fallbackStory = '<p><strong>Opportunity Alert:</strong> Exciting developments are unfolding in this story—stay tuned for actionable insights and tips to get involved and thrive locally!</p>';
      let storyHtml = storyTemplate
        .replace(/\{title\}/g, story.title)
        .replace(/\{fullStory\}/g, fallbackStory)
        .replace(/\{groupName\}/g, story.groupName)
        .replace(/\{timestamp\}/g, timestamp);
      fs.writeFileSync(`story${story.globalId}.html`, storyHtml);
    }
    // Small delay to respect any rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`All 20 stories complete with Northumbria Herald tone and dynamic groupings!`);
}

generateNews();
