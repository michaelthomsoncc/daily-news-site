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
  
  // Phase 1: Generate 20 diverse flat stories from Grok's knowledge with refined tone
  const storiesPrompt = `You are a sharp-eyed strategist for the Northumbria Herald, a no-nonsense regional outlet for the Northumbria area (North East England: Northumberland, Tyne and Wear, County Durham, etc.). Your mission: Relentless pursuit of the region's best path forward—expose flaws in politics and business, advocate smarter alternatives, and drive constructive change. Focus heavily on substantive issues: policy reforms, economic strategies, infrastructure upgrades, corporate accountability, regulatory shifts. Sideline feelgood fluff; prioritize what truly impacts growth and resilience.

Stories must be concise, direct—no fluffy padding. Base on verifiable, real-time events/trends as of today (${today}). Ensure diversity: 40% politics, 40% business, 20% other high-stakes. No more than 2 similar; all fresh, actionable.

For each: 
- "title": Punchy headline.
- "summary": 1-2 tight sentences: Key facts + strategic critique/takeaway.

Output strict JSON only: {"stories": [{"title": "...", "summary": "..."} ] }. Exactly 20 stories.`;

  let flatStories = [];
  try {
    const storiesResponse = await openai.chat.completions.create({
      model: 'grok-4-fast-reasoning',
      messages: [{ role: 'user', content: storiesPrompt }],
      response_format: { type: 'json_object' },
      max_tokens: 2000,  // Trimmed for conciseness
    });

    const storiesData = JSON.parse(storiesResponse.choices[0].message.content);
    
    flatStories = storiesData.stories || [];
    
    if (flatStories.length !== 20) {
      throw new Error('Invalid story count');
    }
    console.log(`Generated 20 substantive stories with strategic edge.`);
  } catch (error) {
    console.error('Stories generation error:', error);
    return;
  }

  // Phase 1.5: Dynamically categorize the 20 stories
  let groupsData = { groups: [] };
  try {
    const groupingPrompt = `You are a strategic categorizer for the Northumbria Herald. Group these 20 high-impact stories into 4-6 thematic categories that spotlight paths to regional improvement. 3-5 stories per group (total 20). Draw from content: Emphasize politics/business clusters. Names: Bold, action-oriented.

Input stories: ${JSON.stringify(flatStories)}.

Output strict JSON only: {"groups": [{"name": "Group Name", "stories": [ {"title": "...", "summary": "..."} ] } ] }.`;

    const groupingResponse = await openai.chat.completions.create({
      model: 'grok-4-fast-reasoning',
      messages: [{ role: 'user', content: groupingPrompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1200,
    });

    groupsData = JSON.parse(groupingResponse.choices[0].message.content);
    
    if (!groupsData.groups || groupsData.groups.length < 4 || groupsData.groups.length > 6 || groupsData.groups.reduce((acc, g) => acc + (g.stories?.length || 0), 0) !== 20) {
      throw new Error('Invalid grouping structure or count');
    }
    console.log(`Dynamically grouped into ${groupsData.groups.length} strategic categories.`);
  } catch (error) {
    console.error('Grouping error:', error);
    // Fallback: Strategic defaults
    groupsData = {
      groups: [
        { name: "Political Power Plays", stories: flatStories.slice(0, 5) },
        { name: "Business Breakthroughs", stories: flatStories.slice(5, 10) },
        { name: "Economic Edge", stories: flatStories.slice(10, 15) },
        { name: "Strategic Shifts", stories: flatStories.slice(15, 20) }
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

  // Phase 2: Generate full ~600-word stories one by one, with concise strategic tone
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
    const expandPrompt = `You are a strategist for the Northumbria Herald. Write a tight, ~600-word article on: "${story.title}". Context: ${story.summary}.

Pursue the best regional path relentlessly: Critique weak politics/business moves, push alternatives with data-backed rationale. Stay positive/constructive—frame fixes as winnable gains. Heavy on politics and business. Cut fluff: Direct facts, sharp analysis, no padding.

Base on verifiable events as of today (${today})—real-time details, quotes, implications. Understated agenda: Improve Northumbria via smarter choices.

Structure: Crisp intro (core issue + fix hook), 3-4 sections (<h3> subheads) with critiques/tips, conclusion (actionable next steps). HTML only: <p>, <strong>, <em>. Words: 500-700.`;

    try {
      const storyResponse = await openai.chat.completions.create({
        model: 'grok-4-fast-reasoning',
        messages: [{ role: 'user', content: expandPrompt }],
        max_tokens: 2200,  // For ~600 words
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
      // Fallback aligned to tone
      const fallbackStory = '<p><strong>Strategic Alert:</strong> Key developments here demand review—watch for critiques and better paths ahead.</p>';
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

  console.log(`All 20 stories complete with concise, strategic tone!`);
}

generateNews();
