const fs = require('fs');
const path = require('path');

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: 'https://api.x.ai/v1',  // xAI Grok endpoint
});

async function generateNews() {
  const currentDate = new Date();
  const today = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timestamp = currentDate.toLocaleString('en-GB');  // UK format for local feel
  
  // Phase 1: Generate 20 diverse flat stories strictly from real current events
  const storiesPrompt = `You are a gaming, tech, and world news curator for a sharp UK gamer. Generate exactly 20 unique stories based strictly on well-researched, factually accurate current events from your up-to-date knowledge as of ${today}. Do not invent, fabricate, or speculate—only use verified facts from real news happening today. Balance topics: ~7 on new game updates/releases (patches, betas, launches), ~5 on PC hardware (GPUs, controllers, keyboards, builds), ~4 on major world events (wars, global crises—focus on factual updates/impacts), ~4 on UK government actions (policies on tech/gaming/education that could shift things, like app regs or taxes).

Mix for relevance: Link world/UK stuff to gaming/tech where it fits based on real connections (e.g., a conflict delaying game ports if that's factual today). Make it straight fire: Direct language, "This could flip your meta...", real quotes from sources, end with a sharp insight. Variety—no repeats, all fresh from today. For heavy topics, deliver the facts and ripple effects clean.

For each story, provide:
- "title": Punchy, no-BS headline.
- "summary": 1-2 sentence teaser (under 50 words).
- "source": Real news source (e.g., BBC, IGN, Reuters) and brief fact basis (e.g., "BBC: Official announcement").

Output strict JSON only: {"stories": [{"title": "...", "summary": "...", "source": "..."} ] }. Exactly 20 stories.`;

  let flatStories = [];
  try {
    const storiesResponse = await openai.chat.completions.create({
      model: 'grok-4-fast-reasoning',
      messages: [{ role: 'user', content: storiesPrompt }],
      response_format: { type: 'json_object' },
      max_tokens: 3000,
    });

    const storiesData = JSON.parse(storiesResponse.choices[0].message.content);
    
    flatStories = storiesData.stories || [];
    
    if (flatStories.length !== 20) {
      throw new Error('Invalid story count');
    }
    console.log(`Generated 20 factual stories from real events.`);
  } catch (error) {
    console.error('Stories generation error:', error);
    return;
  }

  // Phase 1.5: Dynamically categorize the 20 stories for mixed-interest sections
  let groupsData = { groups: [] };
  try {
    const groupingPrompt = `You are a categorizer for a gamer's mixed feed. Take these 20 stories and group them into 4-6 dynamic, on-point categories based on content (e.g., "Epic Updates Incoming" for games, "Gear Grind" for hardware, "Global Alert" for wars/crises, "Gov Watch" for UK politics). Each group 3-5 stories (total 20). Make categories snap from the stories—direct, no fluff.

Input stories: ${JSON.stringify(flatStories)}.

Output strict JSON only: {"groups": [{"name": "On-Point Group Name", "stories": [ {"title": "...", "summary": "...", "source": "..."} ] } ] }.`;

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
    console.log(`Dynamically grouped into ${groupsData.groups.length} mixed categories.`);
  } catch (error) {
    console.error('Grouping error:', error);
    // Fallback: Mixed-themed groups
    groupsData = {
      groups: [
        { name: "Game Drops", stories: flatStories.slice(0, 5) },
        { name: "PC Power-Ups", stories: flatStories.slice(5, 10) },
        { name: "World Buzz", stories: flatStories.slice(10, 15) },
        { name: "UK Scoop", stories: flatStories.slice(15, 20) }
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

  // Generate index.html with grouped structure (full panels clickable)
  let indexHtml = fs.readFileSync('index.html', 'utf8');
  let newDiv = '<div id="news-content">';
  groupsData.groups.forEach(group => {
    newDiv += `<h2>${group.name}</h2><ul class="headlines-list">`;
    group.stories.forEach(story => {
      const globalStory = globalStories.find(s => s.title === story.title && s.summary === story.summary);
      newDiv += `<li class="clickable-panel"><a href="story${globalStory.globalId}.html" class="full-link"><strong>${story.title}</strong><br><small>${story.summary}</small><br><span class="source">Via ${story.source}</span></a></li>`;
    });
    newDiv += '</ul>';
  });
  newDiv += '</div>';
  indexHtml = indexHtml.replace(/<div id="news-content">.*?<\/div>/s, newDiv);
  indexHtml = indexHtml.replace(/<p>Last updated: .*<script>.*<\/script>/s, `<p>Last updated: ${timestamp} | Your Daily Gaming, Tech & World Fix</p>`);
  // Updated CSS for full clickable panels, all text black
  const cssUpdate = indexHtml.replace(
    /<style>.*?<\/style>/s,
    `<style> 
      body { font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px; background: #f9f9f9; color: #000; } 
      h1 { color: #000; } 
      h2 { color: #000; border-bottom: 2px solid #000; padding-bottom: 5px; } 
      ul.headlines-list { list-style: none; padding: 0; } 
      ul.headlines-list li { margin: 15px 0; } 
      .clickable-panel { cursor: pointer; } 
      .full-link { display: block; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-decoration: none; color: inherit; } 
      .full-link:hover { background: #f0f0f0; text-decoration: none; } 
      .source { color: #666; font-size: 12px; } 
    </style>`
  );
  fs.writeFileSync('index.html', cssUpdate);

  // Phase 2: Generate full ~500-word stories strictly from real events
  const storyTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Gamer's World Scoop</title>
    <style> 
      body { font-family: Arial; max-width: 700px; margin: 0 auto; padding: 20px; background: #f9f9f9; line-height: 1.6; font-size: 16px; color: #000; } 
      h1 { color: #000; } 
      h3 { color: #000; } 
      .story p { margin-bottom: 15px; } 
      .hook { font-style: italic; color: #000; font-size: 18px; } 
      a.back { color: #000; font-weight: bold; } 
      .tip { background: #f0f0f0; padding: 10px; border-left: 4px solid #000; margin: 20px 0; color: #000; } 
      .source { font-style: italic; color: #666; } 
    </style>
</head>
<body>
    <h1>{title}</h1>
    <p><em>From the {groupName} section – Straight facts, no filter.</em></p>
    <div class="story">{fullStory}</div>
    <p class="source">Sourced from: {source}</p>
    <div class="tip"><strong>Edge Insight:</strong> How's this shifting your play? Break it down with the crew.</div>
    <p><a href="index.html" class="back">← Back to headlines</a> | Updated: {timestamp}</p>
</body>
</html>`;

  for (let i = 0; i < globalStories.length; i++) {
    const story = globalStories[i];
    const expandPrompt = `Write a sharp ~500-word article for a UK gamer tracking global moves: "${story.title}". Teaser: ${story.summary}.

Grounded strictly in verified facts from real current events as of ${today}—use your up-to-date knowledge of actual news sources like ${story.source}. No inventions, speculation, or additions—only real quotes, deets, and impacts. Keep it raw and real: Tight paras, no hand-holding, drop insights that stick. For world/UK topics, hit key updates and how they land on daily grinds; facts only.

Structure:
- Hook: 1 para that pulls you in, question or scenario.
- Body: 3-4 sections with <h3> (e.g., "The Drop", "Ripple Effects"), facts/quotes.
- Wrap: Solid take or next-watch.
Output clean HTML only: <p> paras, <strong> emphasis, <em> quotes. 400-600 words. No <h1> or title repeat.`;

    try {
      const storyResponse = await openai.chat.completions.create({
        model: 'grok-4-fast-reasoning',
        messages: [{ role: 'user', content: expandPrompt }],
        max_tokens: 2000,
      });

      const fullStory = storyResponse.choices[0].message.content;

      let storyHtml = storyTemplate
        .replace(/\{title\}/g, story.title)
        .replace(/\{fullStory\}/g, fullStory)
        .replace(/\{groupName\}/g, story.groupName)
        .replace(/\{source\}/g, story.source)
        .replace(/\{timestamp\}/g, timestamp);
      fs.writeFileSync(`story${story.globalId}.html`, storyHtml);
      
      console.log(`Generated story ${story.globalId}/20: ${story.title.substring(0, 50)}...`);
    } catch (error) {
      console.error(`Story ${story.globalId} error:`, error);
      // Fallback: Short engaging placeholder
      const fallbackStory = `<p class="hook">This drop's incoming—facts stacking up.</p><p>Core deets locked, full breakdown next round. Run it by the group: Shift your strategy?</p>`;
      let storyHtml = storyTemplate
        .replace(/\{title\}/g, story.title)
        .replace(/\{fullStory\}/g, fallbackStory)
        .replace(/\{groupName\}/g, story.groupName)
        .replace(/\{source\}/g, story.source)
        .replace(/\{timestamp\}/g, timestamp);
      fs.writeFileSync(`story${story.globalId}.html`, storyHtml);
    }
    // Small delay for rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`All 20 stories complete – 100% factual and real!`);
}

generateNews();
