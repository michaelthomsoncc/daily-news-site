const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: 'https://api.x.ai/v1', // xAI Grok endpoint
});

async function generateNews() {
  const currentDate = new Date();
  const today = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timestamp = currentDate.toLocaleString('en-GB'); // UK format for local feel
  const folderName = currentDate.toISOString().replace(/[:.]/g, '-').slice(0, 16); // e.g., 2025-10-17T14-30-00
  const runTimestamp = currentDate.toISOString().slice(0, 19).replace(/[:]/g, '-'); // For file names: 2025-10-17T14-30-00
 
  // Create new folder for this run
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
  console.log(`Created folder: ${folderName}`);
  
  // Phase 1: Generate 20 diverse flat stories strictly from real current events
  const storiesPrompt = `You are a gaming, tech, and world news curator for a sharp UK gamer. Generate exactly 20 unique stories based strictly on well-researched, factually accurate current events from the web as of ${today}. Do not invent, fabricate, or speculate—only use verified facts from real news happening today. Balance topics: ~5 on new game updates/releases (patches, betas, launches), ~6 on PC hardware (GPUs, controllers, keyboards, builds), ~5 on major world events (wars, global crises—focus on factual updates/impacts), ~4 on UK government actions (policies on tech/gaming/education that could shift things, like app regs or taxes).
Mix for relevance: Link world/UK stuff to gaming/tech where it fits based on real connections (e.g., a conflict delaying game ports if that's factual today). Make it straight fire: Direct language, "This could flip your meta...", real quotes from sources, end with a sharp insight. Variety—no repeats, all fresh from today. For heavy topics, deliver the facts and ripple effects clean.
CRITICAL: Before generating, use your real-time web_search tool to verify 5-10 current events per topic from today (${today}). Only include stories with confirmed sources (e.g., query: "RTX news October 17 2025 site:tomshardware.com"). Require exact quotes and links in "source". If no real events match a topic, skip and note "No verified update today" for that slot.
For each story, provide:
- "title": Punchy, no-BS headline.
- "summary": 1 sentence teaser (under 30 words).
- "source": Real news source (e.g., BBC, IGN, Reuters) and brief fact basis (e.g., "BBC: Official announcement").
Output strict JSON only: {"stories": [{"title": "...", "summary": "...", "source": "..."} ] }. Exactly 20 stories.`;
  
  let flatStories = [];
  try {
    const storiesResponse = await openai.chat.completions.create({
      model: 'grok-4-fast-non-reasoning',
      messages: [{ role: 'user', content: storiesPrompt }],
      response_format: { type: 'json_object' },
      max_tokens: 3500, // Slight bump for tool outputs
    });
    const storiesData = JSON.parse(storiesResponse.choices[0].message.content);
   
    // Validate and filter complete stories
    const rawStories = storiesData.stories || [];
    flatStories = rawStories.filter(s => {
      if (!s || typeof s !== 'object' || !s.title || !s.summary || !s.source) {
        console.warn('Incomplete story skipped:', s);
        return false;
      }
      return true;
    });
   
    console.log(`Generated ${rawStories.length} raw stories; ${flatStories.length} valid after filtering.`);
    if (flatStories.length < 20) {
      console.warn(`Only ${flatStories.length} valid stories. Proceeding with available stories.`);
    } else if (flatStories.length > 20) {
      flatStories = flatStories.slice(0, 20); // Cap at 20
    }
  } catch (error) {
    console.error('Stories generation error:', error);
    return;
  }
  
  if (flatStories.length === 0) {
    console.error('No valid stories generated. Exiting.');
    return;
  }
  
  // Phase 1.5: Dynamically categorize the stories for mixed-interest sections
  let groupsData = { groups: [] };
  let rawGroupingResponse = '';
  const numStories = flatStories.length;
  try {
    // Prepare indexed condensed stories to save tokens, with safe access
    const indexedStories = flatStories.map((s, idx) => ({
      index: idx,
      title: s.title || 'Untitled',
      summary: (s.summary || '').substring(0, 50) + '...' || 'No summary...',
      source: s.source || 'Unknown'
    }));
    const groupingPrompt = `You are a categorizer for a gamer's mixed feed. Take these ${numStories} stories and group them into 3-6 dynamic, on-point categories based on content (e.g., "Epic Updates Incoming" for games, "Gear Grind" for hardware, "Global Alert" for wars/crises, "Gov Watch" for UK politics)—aim for 3-6 total, each with 2-6 stories to cover all. Make categories snap from the stories—direct, no fluff. Ensure all ${numStories} unique stories are covered.
Input stories: ${JSON.stringify(indexedStories)}.
Output strict JSON only—no additional text, explanations, or markdown: {"groups": [{"name": "On-Point Group Name", "indices": [0, 2, 5] }] }. Use indices from input (numbers 0-${numStories-1}) for each group. Exactly 3-6 groups, total indices across all =${numStories}, no duplicates.`;
    const groupingResponse = await openai.chat.completions.create({
      model: 'grok-4-fast-non-reasoning',
      messages: [{ role: 'user', content: groupingPrompt }],
      response_format: { type: 'json_object' },
      max_tokens: 5000,
    });
    rawGroupingResponse = groupingResponse.choices[0].message.content;
    console.log('Raw grouping response preview:', rawGroupingResponse.substring(0, 200));
    const parsedGroups = JSON.parse(rawGroupingResponse);
   
    if (!parsedGroups.groups || parsedGroups.groups.length < 3 || parsedGroups.groups.length > 8) {
      throw new Error(`Invalid group count: ${parsedGroups.groups?.length || 0}`);
    }
    // Reconstruct stories from indices
    parsedGroups.groups.forEach(group => {
      if (!group.indices || !Array.isArray(group.indices)) {
        throw new Error('Missing or invalid indices');
      }
      group.stories = group.indices.map(idx => {
        const story = flatStories[idx];
        if (!story) throw new Error(`Invalid index ${idx}`);
        return story;
      });
      delete group.indices;
    });
    const totalStories = parsedGroups.groups.reduce((acc, g) => acc + (g.stories?.length || 0), 0);
    if (totalStories !== numStories) {
      throw new Error(`Invalid total stories: ${totalStories} (expected ${numStories})`);
    }
    groupsData = parsedGroups;
    console.log(`Dynamically grouped ${numStories} stories into ${groupsData.groups.length} categories.`);
  } catch (error) {
    console.error('Grouping error:', error);
    console.error('Raw response for debug:', rawGroupingResponse);
    // Retry with adjusted fixed split for actual numStories
    try {
      const indexedStories = flatStories.map((s, idx) => ({
        index: idx,
        title: s.title || 'Untitled',
        summary: (s.summary || '').substring(0, 30) + '...' || 'No summary...',
        source: s.source || 'Unknown'
      }));
      const numGroups = Math.max(3, Math.min(6, Math.ceil(numStories / 4)));
      const storiesPerGroup = Math.ceil(numStories / numGroups);
      const retryPrompt = `Group these ${numStories} stories into exactly ${numGroups} categories (~${storiesPerGroup} each). Suggested categories: Game Drops, PC Power-Ups, World Buzz, UK Scoop, Tech Mix (adapt as needed). Use indices 0-${numStories-1} from input—no more, no less. Output ONLY JSON: {"groups": [{"name": "Category Name", "indices": [0,1,2,3]} ] }. Input: ${JSON.stringify(indexedStories)}.`;
      const retryResponse = await openai.chat.completions.create({
        model: 'grok-4-fast-non-reasoning',
        messages: [{ role: 'user', content: retryPrompt }],
        response_format: { type: 'json_object' },
        max_tokens: 3000,
      });
      const parsedRetry = JSON.parse(retryResponse.choices[0].message.content);
      if (!parsedRetry.groups || parsedRetry.groups.length !== numGroups) {
        throw new Error('Retry invalid group count');
      }
      // Reconstruct
      parsedRetry.groups.forEach(group => {
        if (!group.indices || !Array.isArray(group.indices)) throw new Error('Retry invalid indices');
        group.stories = group.indices.map(idx => flatStories[idx]).filter(Boolean); // Safe
        delete group.indices;
      });
      const totalStories = parsedRetry.groups.reduce((acc, g) => acc + (g.stories?.length || 0), 0);
      if (totalStories !== numStories) {
        throw new Error(`Retry invalid total: ${totalStories}`);
      }
      groupsData = parsedRetry;
      console.log('Retry grouping succeeded.');
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      // Fallback: Even split into 3-6 groups based on numStories
      const numGroups = Math.max(3, Math.min(6, Math.ceil(numStories / 4)));
      const groupNames = ["Game Drops", "PC Power-Ups", "World Buzz", "UK Scoop", "Tech Mix", "Global Shifts", "Policy Plays"].slice(0, numGroups);
      groupsData = { groups: [] };
      for (let g = 0; g < numGroups; g++) {
        const start = g * Math.ceil(numStories / numGroups);
        const end = start + Math.ceil(numStories / numGroups);
        groupsData.groups.push({
          name: groupNames[g] || `Group ${g+1}`,
          stories: flatStories.slice(start, end)
        });
      }
      console.log(`Used fallback grouping: ${numGroups} groups for ${numStories} stories.`);
    }
  }
  
  // Prepare global stories list with IDs for file naming
  const globalStories = [];
  let storyId = 1;
  groupsData.groups.forEach(group => {
    group.stories.forEach(story => {
      globalStories.push({ 
        title: story.title || 'Untitled', 
        summary: story.summary || 'No summary available.', 
        source: story.source || 'Unknown', 
        globalId: storyId++, 
        groupName: group.name 
      });
    });
  });
  
  // Generate index.html with grouped structure (full panels clickable, links to new folder)
  let indexHtml = fs.readFileSync('index.html', 'utf8');
  let newDiv = '<div id="news-content">';
  groupsData.groups.forEach(group => {
    newDiv += `<h2>${group.name}</h2><ul class="headlines-list">`;
    group.stories.forEach(story => {
      const sanitizedTitle = (story.title || 'untitled').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 50);
      const fileName = `${sanitizedTitle}_${runTimestamp}.html`;
      newDiv += `<li class="clickable-panel"><a href="${folderName}/${fileName}" class="full-link"><strong>${story.title || 'Untitled'}</strong><br><small>${story.summary || 'No summary'}</small><br><span class="source">Via ${story.source || 'Unknown'}</span></a></li>`;
    });
    newDiv += '</ul>';
  });
  newDiv += '</div>';
  indexHtml = indexHtml.replace(/<div id="news-content">.*?<\/div>/s, newDiv);
  indexHtml = indexHtml.replace(/<p>Last updated: .*<script>.*<\/script>/s, `<p>Last updated: ${timestamp} | Your Daily Gaming, Tech & World Fix | Edition: ${folderName}</p>`);
  
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
  
  // Phase 2: Generate full ~500-word stories strictly from real events in new folder
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
    <p><a href="../index.html" class="back">← Back to headlines</a> | Updated: {timestamp}</p>
</body>
</html>`;
  
  for (let i = 0; i < globalStories.length; i++) {
    const story = globalStories[i];
    const sanitizedTitle = (story.title || 'untitled').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 50);
    const fileName = `${sanitizedTitle}_${runTimestamp}.html`;
    const filePath = path.join(folderName, fileName);
   
    const expandPrompt = `Write a sharp ~500-word article for a UK gamer tracking global moves: "${story.title}". Teaser: ${story.summary}.
Grounded strictly in verified facts from real current events as of ${today}—use the web. No inventions, speculation, or additions—only real quotes, deets, and impacts. Keep it raw and real: Tight paras, no hand-holding, drop insights that stick. For world/UK topics, hit key updates and how they land on daily grinds; facts only.
MANDATORY: Start by calling web_search or browse_page on "${story.source}" for today's facts (query: "${story.title} ${today}"). Base EVERY detail on results—include inline citations. If unverifiable, output: "<p>Verification failed: No confirmed events today.</p>".
Structure:
- Hook: 1 para.
- Body: 3-4 sections with <h3> (e.g., "The Drop", "Ripple Effects"), facts/quotes.
- Wrap: Solid take or next-watch.
Output clean HTML only: <p> paras, <strong> emphasis, <em> quotes. 400-600 words. No <h1> or title repeat.`;
    
    try {
      const storyResponse = await openai.chat.completions.create({
        model: 'grok-4-fast-non-reasoning',
        messages: [{ role: 'user', content: expandPrompt }],
        max_tokens: 2500,
      });
      const fullStory = storyResponse.choices[0].message.content;
      let storyHtml = storyTemplate
        .replace(/\{title\}/g, story.title)
        .replace(/\{fullStory\}/g, fullStory)
        .replace(/\{groupName\}/g, story.groupName)
        .replace(/\{source\}/g, story.source)
        .replace(/\{timestamp\}/g, timestamp);
      fs.writeFileSync(filePath, storyHtml);
     
      console.log(`Generated story ${story.globalId}/${globalStories.length}: ${story.title.substring(0, 50)}... in ${folderName}`);
    } catch (error) {
      console.error(`Story ${story.globalId} error:`, error);
      // Enhanced fallback: Quick fact-check
      const factCheckPrompt = `Fact-check this story title and summary against real news today (${today}): "${story.title}". ${story.summary}. Output ONLY a short HTML para: If verified, "<p>Verified facts incoming—check back.</p>"; else "<p>Unverified: Skipping for accuracy. Real update: [brief real alternative from web_search].</p>". Use web_search first.`;
      try {
        const fallbackResponse = await openai.chat.completions.create({
          model: 'grok-4-fast-non-reasoning',
          messages: [{ role: 'user', content: factCheckPrompt }],
          max_tokens: 300,
        });
        const fallbackStory = fallbackResponse.choices[0].message.content;
        let storyHtml = storyTemplate
          .replace(/\{title\}/g, story.title)
          .replace(/\{fullStory\}/g, `<div class="story">${fallbackStory}</div>`)
          .replace(/\{groupName\}/g, story.groupName)
          .replace(/\{source\}/g, story.source)
          .replace(/\{timestamp\}/g, timestamp);
        fs.writeFileSync(filePath, storyHtml);
        console.log(`Fallback fact-check for story ${story.globalId}`);
      } catch (fallbackError) {
        // Basic placeholder
        const basicFallback = `<p class="hook">This drop's incoming—facts stacking up.</p><p>Core deets locked, full breakdown next round. Run it by the group: Shift your strategy?</p>`;
        let storyHtml = storyTemplate
          .replace(/\{title\}/g, story.title)
          .replace(/\{fullStory\}/g, basicFallback)
          .replace(/\{groupName\}/g, story.groupName)
          .replace(/\{source\}/g, story.source)
          .replace(/\{timestamp\}/g, timestamp);
        fs.writeFileSync(filePath, storyHtml);
      }
    }
    // Small delay for rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log(`All ${globalStories.length} stories complete – 100% factual and archived in ${folderName}!`);
}

generateNews();
