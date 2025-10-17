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
  
  // Phase 1: Generate 20 diverse flat stories from Grok's knowledge
  const storiesPrompt = `You are a professional Newcastle upon Tyne news editor. Generate exactly 20 unique, real-time news stories focused on Newcastle upon Tyne, UK, as of today (October 17, 2025). Base all on well-researched, factually accurate current events from your up-to-date knowledge—stick to happenings from today or very recent, avoiding any repeats from prior days. Make them engaging, neutral, and captivating.

Ensure high diversity across types: Mix local events, sports, culture, business, politics, environment, tech, health, education, transport, etc. No more than 2-3 similar stories—pick relevant, varied topics happening right now.

For each story, provide:
- "title": Catchy, engaging headline.
- "summary": 2-3 sentence teaser (engaging hook).

Output strict JSON only: {"stories": [{"title": "...", "summary": "..."} ] }. Exactly 20 stories, no extras.`;

  let flatStories = [];
  try {
    const storiesResponse = await openai.chat.completions.create({
      model: 'grok-4-fast-reasoning',
      messages: [{ role: 'user', content: storiesPrompt }],
      response_format: { type: 'json_object' },
      max_tokens: 2000,  // Room for detailed JSON
    });

    const storiesData = JSON.parse(storiesResponse.choices[0].message.content);
    
    flatStories = storiesData.stories || [];
    
    if (flatStories.length !== 20) {
      throw new Error('Invalid story count');
    }
    console.log(`Generated 20 diverse stories.`);
  } catch (error) {
    console.error('Stories generation error:', error);
    return;
  }

  // Phase 1.5: Dynamically categorize the 20 stories
  let groupsData = { groups: [] };
  try {
    const groupingPrompt = `You are a news categorizer. Take these 20 Newcastle upon Tyne stories and dynamically group them into 4-6 logical, thematic categories based on their content. Each group should have 3-5 stories (total exactly 20). Categories should emerge from the stories—e.g., if many are about transport disruptions, group as "City Mobility Updates"; avoid generic labels like "Local News". Ensure even distribution and relevance—no forced fits.

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
        { name: "Today's Highlights", stories: flatStories.slice(0, 5) },
        { name: "Community Buzz", stories: flatStories.slice(5, 10) },
        { name: "City Developments", stories: flatStories.slice(10, 15) },
        { name: "Geordie Vibes", stories: flatStories.slice(15, 20) }
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
      newDiv += `<li><a href="story${globalStory.globalId}.html">${story.title}</a>: ${story.summary}</li>`;
    });
    newDiv += '</ul>';
  });
  newDiv += '</div>';
  indexHtml = indexHtml.replace(/<div id="news-content">.*?<\/div>/s, newDiv);
  indexHtml = indexHtml.replace(/<p>Last updated: .*<script>.*<\/script>/s, `<p>Last updated: ${timestamp}</p>`);
  fs.writeFileSync('index.html', indexHtml);

  // Phase 2: Generate full ~1000-word stories one by one
  const storyTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Newcastle Daily Grok News</title>
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
    const expandPrompt = `Write a detailed, engaging ~1000-word full news article on this Newcastle upon Tyne story: "${story.title}". Summary context: ${story.summary}.

Base it strictly on factually accurate, well-researched current events as of October 17, 2025—use your up-to-date knowledge for real-time details, quotes, implications, and background. Keep neutral, captivating tone: Hook the reader, build narrative, end with forward look. No speculation.

Structure: Intro para, 4-6 body sections with subheads (<h3>), conclusion. Output clean HTML only: <p> for paragraphs, <strong> for emphasis, <em> for quotes. Word count: Exactly 900-1100.`;

    try {
      const storyResponse = await openai.chat.completions.create({
        model: 'grok-4-fast-reasoning',
        messages: [{ role: 'user', content: expandPrompt }],
        max_tokens: 3500,  // Generous for 1000 words
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
      // Fallback
      const fallbackStory = '<p><strong>Update incoming:</strong> Our team is compiling the latest details on this story—refresh soon for the full report!</p>';
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

  console.log(`All 20 stories complete with dynamic groupings!`);
}

generateNews();
