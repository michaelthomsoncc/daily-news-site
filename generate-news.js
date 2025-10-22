const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: 'https://api.x.ai/v1', // xAI Grok endpoint
});
const TOPICS = [
  { name: 'gaming', target: 3, description: 'new game updates/releases or similar, or other, focusing on Minecraft, Fortnite, Skate, Roblox or similar' },
  { name: 'hardware', target: 4, description: 'PC hardware or similar (GPUs, controllers, keyboards, builds)' },
  { name: 'world', target: 5, description: 'major world events (wars, global crises—focus on factual updates/impacts)' },
  { name: 'ukgov', target: 4, description: 'UK government actions' },
  { name: 'science', target: 4, description: 'new inventions and scientific discoveries or advancements' } // Bumped to 3 for total 20
];
const STORIES_PER_TOPIC = 10;
const MAX_TRIES = 3;
const TARGET_TOTAL_STORIES = 20;
async function generateNews() {
  // Get current date and time details
  const currentDate = new Date();
  const today = currentDate.toLocaleDateString('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: 'long', day: 'numeric' });
  const timestamp = currentDate.toLocaleString('en-GB', { timeZone: 'Europe/London' });
  const fromDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const toDate = currentDate.toISOString().split('T')[0];
  const folderName = currentDate.toISOString().replace(/[:.]/g, '-').slice(0, 16); // e.g., 2025-10-17T14-30-00
  const runTimestamp = currentDate.toISOString().slice(0, 19).replace(/[:]/g, '-'); // For file names: 2025-10-17T14-30-00
  const history = getHistory(currentDate);
  // Create folder for this run
  createFolder(folderName);
  // Phase 1: Generate stories for each topic
  const topicStories = await generateStoriesByTopic(TOPICS, today, fromDate, toDate, folderName, runTimestamp, history);
  // Prepare all stories for selection
  const allStoriesForSelection = prepareStoriesForSelection(topicStories, TOPICS);
  if (allStoriesForSelection.length === 0) {
    console.error('No valid stories generated across topics. Exiting.');
    return;
  }
  // Select balanced stories
  let selectedStories = await selectBalancedStories(allStoriesForSelection, TOPICS, today, history);
  if (selectedStories.length === 0) {
    console.error('No valid stories after selection. Exiting.');
    return;
  }
  if (selectedStories.length < TARGET_TOTAL_STORIES) {
    console.warn(`Only ${selectedStories.length} valid stories after balancing. Proceeding with available stories.`);
  } else {
    console.log(`Hit target: ${selectedStories.length} stories.`);
  }
  // Phase 1.5: Group stories into categories
  const groupedStories = await groupStories(selectedStories);
  // Assign global IDs and group names to stories
  const globalStories = assignGlobalIdsAndGroups(groupedStories);
  // Update index.html with grouped stories
  updateIndexHtml(folderName, runTimestamp, timestamp, groupedStories);
  // Copy index.html to the day folder for archiving
  fs.copyFileSync('index.html', path.join(folderName, 'index.html'));
  console.log(`Copied index.html to ${folderName}/index.html for archiving.`);
  // Generate daily summary
  const dailySummary = await generateDailySummary(selectedStories, today, history);
  // Update archive.html with the new day's entry
  updateArchive(folderName, today, dailySummary);
  // Phase 2: Generate full story HTML files
  await generateFullStoryFiles(globalStories, folderName, runTimestamp, today, fromDate, toDate, timestamp, history);
  console.log(`All ${globalStories.length} stories complete – 100% factual and archived in ${folderName}!`);
}
// Helper function to create the output folder
function createFolder(folderName) {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
  console.log(`Created folder: ${folderName}`);
}
// New function to get history from last 14 days
function getHistory(currentDate) {
  let history = '';
  for (let d = 1; d <= 14; d++) {
    const pastDate = new Date(currentDate.getTime() - d * 24 * 60 * 60 * 1000);
    const dateStr = pastDate.toISOString().slice(0, 10); // YYYY-MM-DD
    const folders = fs.readdirSync('.').filter(f => f.startsWith(dateStr) && fs.statSync(f).isDirectory());
    if (folders.length === 0) continue;
    folders.sort((a, b) => b.localeCompare(a)); // Descending for latest
    const latestFolder = folders[0];
    const indexPath = path.join(latestFolder, 'index.html');
    if (!fs.existsSync(indexPath)) continue;
    const html = fs.readFileSync(indexPath, 'utf8');
    const $ = cheerio.load(html);
    let dayHistory = `Day ${dateStr}:\n`;
    $('#news-content h2').each((i, el) => {
      const group = $(el).text().trim();
      dayHistory += `Group: ${group}\n`;
      const ul = $(el).next('ul.headlines-list');
      ul.find('li').each((j, liEl) => {
        const title = $(liEl).find('strong').text().trim();
        const summary = $(liEl).find('small').text().trim();
        dayHistory += `- Title: ${title}, Summary: ${summary}\n`;
      });
    });
    if (dayHistory !== `Day ${dateStr}:\n`) {
      history += dayHistory + '\n';
    }
  }
  console.log(`Collected history length: ${history.length} characters.`);
  return history;
}
// Phase 1: Generate overgenerated stories for each topic with retries
async function generateStoriesByTopic(topics, today, fromDate, toDate, folderName, runTimestamp, history) {
  const topicStories = {};
  for (const topic of topics) {
    topicStories[topic.name] = await generateStoriesForTopic(topic, today, fromDate, toDate, history);
  }
  return topicStories;
}
async function generateStoriesForTopic(topic, today, fromDate, toDate, history) {
  let topicStoriesList = [];
  let tries = 0;
  let success = false;
  while (topicStoriesList.length < STORIES_PER_TOPIC && tries < MAX_TRIES && !success) {
    tries++;
    console.log(`Starting try ${tries} for ${topic.name}...`);
    let topicPrompt = `You are a gaming, tech, and world news curator for a sharp 12 year old UK gamer. Use live search to generate exactly ${STORIES_PER_TOPIC} unique stories from news in the last 24 hours based strictly on well-researched, factually accurate current events from the web as of ${today} on ${topic.description}. Do not invent, fabricate, or speculate—only use verified facts from real news.\nWe aim to be maximally engaging, interesting, informative. We want all articles to have substance, no filler.\nUse your knowlege to add your own background but be careful to not make up things.\n Mix for relevance: Link world/UK stuff to gaming/tech where it fits based on real connections. Make it straight fire: Direct language, real quotes from sources, end with a sharp insight. Variety—no repeats, all fresh. For heavy topics, deliver the facts and ripple effects clean.\nCRITICAL: Before generating, perform live search to verify 10-20 current events for this topic from the last 24 hours. Only include stories with confirmed sources. Require exact quotes and links in "source". If fewer than ${STORIES_PER_TOPIC} recent events match, generate as many as possible but aim high—expand search terms if needed.\nFor each story, provide:\n- "title": Punchy, no-BS headline. Headline must be descriptive of the actual story. Don't name sources in headline.\n- "summary": 1 sentence teaser (under 30 words).\n- "source": Real news source (e.g., BBC, IGN, Reuters) and brief fact basis (e.g., "BBC: Official announcement").\nOutput strict JSON only: {"stories": [{"title": "...", "summary": "...", "source": "..."} ] }.\nPrevious history from last 14 days:\n${history}\nAvoid repeating exact same stories from history unless there is significant new development. If it's an update or evolution, generate it as such and briefly mention what's new in the summary (e.g., 'Update: Following yesterday's announcement, ...').`;
    if (tries > 1) {
      topicPrompt = topicPrompt.replace(
        `generate exactly ${STORIES_PER_TOPIC} unique stories`,
        `generate as close to ${STORIES_PER_TOPIC} as possible unique stories (aim for at least ${STORIES_PER_TOPIC / 2}, expand search if needed)`
      );
    }
    try {
      const response = await openai.chat.completions.create({
        model: 'grok-4-fast-reasoning',
        messages: [{ role: 'user', content: topicPrompt }],
        response_format: { type: 'json_object' },
        max_tokens: 2500,
        search_parameters: {
          mode: 'on',
          return_citations: true,
          max_search_results: 10,
          sources: [{ type: 'news' }],
          from_date: fromDate,
          toDate: toDate
        }
      });
      const data = JSON.parse(response.choices[0].message.content);
      const rawStories = data.stories || [];
      console.log(`Raw stories count for ${topic.name} try ${tries}: ${rawStories.length}`);
      const validatedStories = validateAndTrimStories(rawStories, topic.name);
      console.log(`Post-validation for ${topic.name} try ${tries}: Valid now: ${validatedStories.length}`);
      const uniqueNewStories = deduplicateStories(topicStoriesList, validatedStories);
      const addedCount = uniqueNewStories.length;
      topicStoriesList = topicStoriesList.concat(uniqueNewStories);
      console.log(`Try ${tries}: Generated ${rawStories.length} raw, ${validatedStories.length} valid, ${addedCount} unique new, total now ${topicStoriesList.length} for ${topic.name}.`);
      if (topicStoriesList.length >= STORIES_PER_TOPIC) {
        success = true;
        topicStoriesList = topicStoriesList.slice(0, STORIES_PER_TOPIC);
      }
    } catch (error) {
      console.error(`Stories generation error for ${topic.name} (try ${tries}):`, error);
    }
    if (tries < MAX_TRIES && topicStoriesList.length < STORIES_PER_TOPIC - 3) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  console.log(`Final for ${topic.name}: ${topicStoriesList.length} stories after ${tries} tries.`);
  return topicStoriesList;
}
// Helper to validate and trim stories
function validateAndTrimStories(rawStories, topicName) {
  return rawStories.map((story, index) => {
    if (!story || typeof story !== 'object') {
      console.warn(`Null story #${index} skipped for ${topicName}`);
      return null;
    }
    const trimmedTitle = story.title ? story.title.trim() : null;
    const trimmedSummary = story.summary ? story.summary.trim() : null;
    const trimmedSource = story.source ? story.source.trim() : null;
    if (!trimmedTitle || !trimmedSummary || !trimmedSource) {
      console.warn(`Missing fields after trim for #${index} in ${topicName}: title=${!!trimmedTitle}, summary=${!!trimmedSummary}, source=${!!trimmedSource}`);
      return null;
    }
    return {
      title: trimmedTitle,
      summary: trimmedSummary,
      source: trimmedSource
    };
  }).filter(Boolean);
}
// Helper to deduplicate stories based on title and summary
function deduplicateStories(existingStories, newStories) {
  const seen = new Set(existingStories.map(st => `${st.title.toLowerCase()}||${st.summary.toLowerCase()}`));
  return newStories.filter(st => !seen.has(`${st.title.toLowerCase()}||${st.summary.toLowerCase()}`));
}
// Prepare flat list of stories with global indices
function prepareStoriesForSelection(topicStories, topics) {
  const allStories = [];
  let globalIndex = 0;
  topics.forEach(topic => {
    topicStories[topic.name].forEach(story => {
      allStories.push({
        globalIndex: globalIndex++,
        topic: topic.name,
        title: story.title,
        summary: story.summary,
        source: story.source
      });
    });
  });
  console.log(`Total stories from all topics: ${allStories.length}`);
  return allStories;
}
// Select balanced stories using AI or fallback
async function selectBalancedStories(allStoriesForSelection, topics, today, history) {
  let flatStories = [];
  const condensedForPrompt = allStoriesForSelection.map(s => ({
    index: s.globalIndex,
    topic: s.topic,
    title: (s.title || '').substring(0, 60),
    summary: (s.summary || '').substring(0, 40)
  }));
  const targetSummary = topics.map(t => `${t.name}: ${t.target}`).join(', ');
  const selectionPrompt = `You are curating a balanced news feed for a UK gamer. Select stories to meet these targets (${targetSummary}; total exactly 20).\nFrom the provided stories, select up to the target number from each topic (prioritize diverse, high-impact, fresh ones across all). If fewer available for a topic, take all. To reach exactly 20, add 1 extra from the topic with most available if needed after base targets. Ensure no duplicates.\nInput stories: ${JSON.stringify(condensedForPrompt)}.\nOutput strict JSON only: {"selectedIndices": [0, 5, 12, ...]} // List of global indices (numbers).\nPrevious history from last 14 days:\n${history}\nPrioritize fresh stories or meaningful updates; avoid direct repeats from history.`;
  try {
    const selResponse = await openai.chat.completions.create({
      model: 'grok-4-fast-reasoning',
      messages: [{ role: 'user', content: selectionPrompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    });
    const selData = JSON.parse(selResponse.choices[0].message.content);
    const selectedIndices = selData.selectedIndices || [];
    flatStories = selectedIndices
      .map(idx => allStoriesForSelection.find(s => s.globalIndex === parseInt(idx)))
      .filter(Boolean)
      .map(s => ({ title: s.title, summary: s.summary, source: s.source }));
    flatStories = flatStories.slice(0, TARGET_TOTAL_STORIES);
    console.log(`Selected ${flatStories.length} balanced stories.`);
  } catch (error) {
    console.error('Selection error:', error);
    flatStories = fallbackSelectStories(allStoriesForSelection, topics);
  }
  return flatStories;
}
// Fallback selection logic
function fallbackSelectStories(allStoriesForSelection, topics) {
  let flatStories = [];
  // Take up to target from each topic
  topics.forEach(topic => {
    const avail = allStoriesForSelection.filter(s => s.topic === topic.name);
    const toTake = Math.min(avail.length, topic.target);
    flatStories = flatStories.concat(avail.slice(0, toTake).map(s => ({ title: s.title, summary: s.summary, source: s.source })));
  });
  flatStories = flatStories.slice(0, TARGET_TOTAL_STORIES);
  // Pad to 20 if under
  while (flatStories.length < TARGET_TOTAL_STORIES && allStoriesForSelection.length > flatStories.length) {
    const availExtras = allStoriesForSelection.slice(TARGET_TOTAL_STORIES);
    flatStories = flatStories.concat(availExtras.slice(0, TARGET_TOTAL_STORIES - flatStories.length).map(s => ({ title: s.title, summary: s.summary, source: s.source })));
    break;
  }
  console.log(`Fallback selection: ${flatStories.length} stories (padded to 20 if possible).`);
  return flatStories;
}
// Group stories into dynamic categories
async function groupStories(selectedStories) {
  let groupsData = { groups: [] };
  let rawGroupingResponse = '';
  const numStories = selectedStories.length;
  try {
    const indexedStories = selectedStories.map((s, idx) => ({
      index: idx,
      title: s.title || 'Untitled',
      summary: (s.summary || '').substring(0, 50) + '...' || 'No summary...',
      source: s.source || 'Unknown'
    }));
    const groupingPrompt = `You are a categorizer for a gamer's mixed feed. Take these ${numStories} stories and group them into 3-6 dynamic, on-point categories based on content — aim for 3-6 total, each with 2-6 stories to cover all. Make categories snap from the stories—direct, no fluff. Ensure all ${numStories} unique stories are covered.\nInput stories: ${JSON.stringify(indexedStories)}.\nOutput strict JSON only—no additional text, explanations, or markdown: {"groups": [{"name": "On-Point Group Name", "indices": [0, 2, 5] }] }. Use indices from input (numbers 0-${numStories-1}) for each group. Exactly 3-6 groups, total indices across all =${numStories}, no duplicates.`;
    const groupingResponse = await openai.chat.completions.create({
      model: 'grok-4-fast-reasoning',
      messages: [{ role: 'user', content: groupingPrompt }],
      response_format: { type: 'json_object' },
      max_tokens: 5000,
    });
    rawGroupingResponse = groupingResponse.choices[0].message.content;
    console.log(`Raw grouping response preview: ${rawGroupingResponse.substring(0, 200)}`);
    const parsedGroups = JSON.parse(rawGroupingResponse);
    if (!parsedGroups.groups || parsedGroups.groups.length < 3 || parsedGroups.groups.length > 8) {
      throw new Error(`Invalid group count: ${parsedGroups.groups ? parsedGroups.groups.length : 0}`);
    }
    parsedGroups.groups.forEach(group => {
      if (!group.indices || !Array.isArray(group.indices)) {
        throw new Error('Missing or invalid indices');
      }
      group.stories = group.indices.map(idx => {
        const story = selectedStories[idx];
        if (!story) throw new Error(`Invalid index ${idx}`);
        return story;
      });
      delete group.indices;
    });
    const totalStoriesInGroups = parsedGroups.groups.reduce((acc, g) => acc + (g.stories ? g.stories.length : 0), 0);
    if (totalStoriesInGroups !== numStories) {
      throw new Error(`Invalid total stories: ${totalStoriesInGroups} (expected ${numStories})`);
    }
    groupsData = parsedGroups;
    console.log(`Dynamically grouped ${numStories} stories into ${groupsData.groups.length} categories.`);
  } catch (error) {
    console.error('Grouping error:', error);
    console.error('Raw response for debug:', rawGroupingResponse);
    groupsData = await retryGroupStories(selectedStories, numStories);
  }
  return groupsData;
}
// Retry grouping with fixed suggestions
async function retryGroupStories(selectedStories, numStories) {
  let groupsData = { groups: [] };
  try {
    const indexedStories = selectedStories.map((s, idx) => ({
      index: idx,
      title: s.title || 'Untitled',
      summary: (s.summary || '').substring(0, 30) + '...' || 'No summary...',
      source: s.source || 'Unknown'
    }));
    const numGroups = Math.max(3, Math.min(6, Math.ceil(numStories / 4)));
    const storiesPerGroup = Math.ceil(numStories / numGroups);
    const retryPrompt = `Group these ${numStories} stories into exactly ${numGroups} categories (~${storiesPerGroup} each). Suggested categories: Game Drops, PC Power-Ups, World Buzz, UK Scoop, Tech Mix (adapt as needed). Use indices 0-${numStories-1} from input—no more, no less. Output ONLY JSON: {"groups": [{"name": "Category Name", "indices": [0,1,2,3]} ] }. Input: ${JSON.stringify(indexedStories)}.`;
    const retryResponse = await openai.chat.completions.create({
      model: 'grok-4-fast-reasoning',
      messages: [{ role: 'user', content: retryPrompt }],
      response_format: { type: 'json_object' },
      max_tokens: 3000,
    });
    const parsedRetry = JSON.parse(retryResponse.choices[0].message.content);
    if (!parsedRetry.groups || parsedRetry.groups.length !== numGroups) {
      throw new Error('Retry invalid group count');
    }
    parsedRetry.groups.forEach(group => {
      if (!group.indices || !Array.isArray(group.indices)) throw new Error('Retry invalid indices');
      group.stories = group.indices.map(idx => selectedStories[idx]).filter(Boolean);
      delete group.indices;
    });
    const totalStoriesInGroups = parsedRetry.groups.reduce((acc, g) => acc + (g.stories ? g.stories.length : 0), 0);
    if (totalStoriesInGroups !== numStories) {
      throw new Error(`Retry invalid total: ${totalStoriesInGroups}`);
    }
    groupsData = parsedRetry;
    console.log('Retry grouping succeeded.');
  } catch (retryError) {
    console.error('Retry failed:', retryError);
    groupsData = fallbackGroupStories(selectedStories, numStories);
  }
  return groupsData;
}
// Fallback even split grouping
function fallbackGroupStories(selectedStories, numStories) {
  const numGroups = Math.max(3, Math.min(6, Math.ceil(numStories / 4)));
  const groupNames = ["Game Drops", "PC Power-Ups", "World Buzz", "UK Scoop", "Tech Mix", "Global Shifts", "Policy Plays"].slice(0, numGroups);
  const groupsData = { groups: [] };
  for (let g = 0; g < numGroups; g++) {
    const start = g * Math.ceil(numStories / numGroups);
    const end = start + Math.ceil(numStories / numGroups);
    groupsData.groups.push({
      name: groupNames[g] || `Group ${g + 1}`,
      stories: selectedStories.slice(start, end)
    });
  }
  console.log(`Used fallback grouping: ${numGroups} groups for ${numStories} stories.`);
  return groupsData;
}
// Assign global IDs and group names
function assignGlobalIdsAndGroups(groupedStories) {
  const globalStories = [];
  let storyId = 1;
  groupedStories.groups.forEach(group => {
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
  return globalStories;
}
// Update index.html
function updateIndexHtml(folderName, runTimestamp, timestamp, groupedStories) {
  let indexHtml = fs.readFileSync('index.html', 'utf8');
  let newDiv = '<div id="news-content">';
  groupedStories.groups.forEach(group => {
    newDiv += `<h2>${group.name}</h2><ul class="headlines-list">`;
    group.stories.forEach(story => {
      const sanitizedTitle = (story.title || 'untitled').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 50);
      const fileName = `${sanitizedTitle}_${runTimestamp}.html`;
      newDiv += `<li class="clickable-panel"><a href="/${folderName}/${fileName}" class="full-link"><strong>${story.title || 'Untitled'}</strong><br><small>${story.summary || 'No summary'}</small></a></li>`;
    });
    newDiv += '</ul>';
  });
  newDiv += '</div>';
  indexHtml = indexHtml.replace(/<div id="news-content">.*?<\/div>/s, newDiv);
  indexHtml = indexHtml.replace(/<p>Last updated: .*?<\/p>/s, `<p>Last updated: ${timestamp} | Your Daily Gaming, Tech & World Fix | Edition: ${folderName} | <a href="/archive.html">View Archive</a></p>`);
  const cssUpdate = indexHtml.replace(
    /<style>.*?<\/style>/s,
    '<style>\n body { font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px; background: #f9f9f9; color: #000; }\n h1 { color: #000; }\n h2 { color: #000; border-bottom: 2px solid #000; padding-bottom: 5px; }\n ul.headlines-list { list-style: none; padding: 0; }\n ul.headlines-list li { margin: 15px 0; }\n .clickable-panel { cursor: pointer; }\n .full-link { display: block; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-decoration: none; color: inherit; }\n .full-link:hover { background: #f0f0f0; text-decoration: none; }\n .source { color: #666; font-size: 12px; }\n </style>'
  );
  fs.writeFileSync('index.html', cssUpdate);
}
// Generate daily summary
async function generateDailySummary(selectedStories, today, history) {
  const summaryPrompt = `You are a news summarizer for a sharp 12 year old UK gamer. Create a single punchy headline that references 2-3 of the most important stories from today's news, based strictly on the provided stories, focusing solely on what happened without any speculation, slang, engagement hooks, or audience-specific language. Stick strictly to verified facts from the provided stories. Stories: ${JSON.stringify(selectedStories.map(s => ({title: s.title, summary: s.summary})))}\nPrevious history from last 14 days:\n${history}\nBuild on evolving stories from history without repeating old details; reference ongoing narratives if relevant (e.g., 'Building on last week's developments...').`;
  try {
    const response = await openai.chat.completions.create({
      model: 'grok-4-fast-reasoning',
      messages: [{ role: 'user', content: summaryPrompt }],
      max_tokens: 500,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Summary generation error:', error);
    return 'Summary generation failed. Check logs.';
  }
}
// Update archive.html
function updateArchive(folderName, today, dailySummary) {
  const archivePath = 'archive.html';
  const newEntry = `<li><strong>${today}</strong> - <a href="${folderName}/index.html">View Details</a><p class="summary">${dailySummary}</p></li>`;
  let archiveHtml;
  if (!fs.existsSync(archivePath)) {
    archiveHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>News Archive</title>
  <style>
    body { font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px; background: #f9f9f9; color: #000; }
    h1 { color: #000; }
    ul.archive-list { list-style: none; padding: 0; }
    ul.archive-list li { margin: 20px 0; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    ul.archive-list li a { color: #000; font-weight: bold; text-decoration: none; }
    ul.archive-list li a:hover { text-decoration: underline; }
    .summary { color: #333; }
  </style>
</head>
<body>
  <h1>News Archive</h1>
  <ul class="archive-list" id="archive-list">
    ${newEntry}
  </ul>
  <p><a href="index.html">Back to Today's News</a></p>
</body>
</html>`;
  } else {
    archiveHtml = fs.readFileSync(archivePath, 'utf8');
    if (archiveHtml.includes(`<strong>${today}</strong>`)) {
      console.log('Entry for today already exists in archive, skipping.');
      return;
    }
    archiveHtml = archiveHtml.replace(/<ul class="archive-list" id="archive-list">\s*/, `$&\n${newEntry}`);
  }
  fs.writeFileSync(archivePath, archiveHtml);
  console.log(`Updated archive with entry for ${today}`);
}
// Generate full story files
async function generateFullStoryFiles(globalStories, folderName, runTimestamp, today, fromDate, toDate, timestamp, history) {
  const storyTemplate = `<!DOCTYPE html>\n<html lang="en">\n<head>\n <meta charset="UTF-8">\n <meta name="viewport" content="width=device-width, initial-scale=1.0">\n <title>{title} | Gamer's World Scoop</title>\n <style>\n body { font-family: Arial; max-width: 700px; margin: 0 auto; padding: 20px; background: #f9f9f9; line-height: 1.6; font-size: 16px; color: #000; }\n h1 { color: #000; }\n h3 { color: #000; }\n .story p { margin-bottom: 15px; }\n .hook { font-style: italic; color: #000; font-size: 18px; }\n a.back { color: #000; font-weight: bold; }\n .tip { background: #f0f0f0; padding: 10px; border-left: 4px solid #000; margin: 20px 0; color: #000; }\n .source { font-style: italic; color: #666; }\n </style>\n</head>\n<body>\n <h1>{title}</h1>\n <p><em>From the {groupName} section – Straight facts, no filter.</em></p>\n <div class="story">{fullStory}</div>\n <p class="source">Sourced from: {source}</p>\n <div class="tip"><strong>Edge Insight:</strong> How's this shifting your play? Break it down with the crew.</div>\n <p><a href="../index.html" class="back">← Back to headlines</a> | Updated: {timestamp}</p>\n</body>\n</html>`;
  for (let i = 0; i < globalStories.length; i++) {
    const story = globalStories[i];
    const sanitizedTitle = (story.title || 'untitled').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 50);
    const fileName = `${sanitizedTitle}_${runTimestamp}.html`;
    const filePath = path.join(folderName, fileName);
    const expandPrompt = `Write a sharp ~500-word article for a 12 year old UK gamer tracking global moves: "${story.title}". Teaser: ${story.summary}.\nGrounded strictly in verified facts from real current events in the last 24 hours as of ${today}—use live search. No inventions, speculation, or additions—only real quotes, deets, and impacts. Keep it raw and real: Tight paras, no hand-holding, drop insights that stick. For world/UK topics, hit key updates and how they land on daily grinds; facts only.\nMANDATORY: Perform live search on "${story.source}" for recent facts (query: "${story.title} ${fromDate} to ${toDate}"). Base EVERY detail on results. But no inline citations though.\nStructure:\n- Hook: 1 para.\n- Body: 3-4 sections with <h3>, facts/quotes.\n- Wrap: Solid take or next-watch.\nOutput clean HTML only: <p> paras, <strong> emphasis, <em> quotes. 400-600 words. No <h1> or title repeat.\nPrevious history from last 14 days:\n${history}\nIf this story was covered in history, treat it as an update: focus on new developments, and briefly reference prior context in the body (e.g., 'Following previous reports...'). Otherwise, treat as new.`;
    try {
      const storyResponse = await openai.chat.completions.create({
        model: 'grok-4-fast-reasoning',
        messages: [{ role: 'user', content: expandPrompt }],
        max_tokens: 2500,
        search_parameters: {
          mode: 'on',
          return_citations: true,
          max_search_results: 2,
          sources: [{ type: 'news' }],
          from_date: fromDate,
          to_date: toDate
        }
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
      const basicFallback = '<p class="hook">This drop\'s incoming—facts stacking up.</p><p>Core deets locked, full breakdown next round. Run it by the group: Shift your strategy?</p>';
      let storyHtml = storyTemplate
        .replace(/\{title\}/g, story.title)
        .replace(/\{fullStory\}/g, basicFallback)
        .replace(/\{groupName\}/g, story.groupName)
        .replace(/\{source\}/g, story.source)
        .replace(/\{timestamp\}/g, timestamp);
      fs.writeFileSync(filePath, storyHtml);
      console.log(`Fallback placeholder for story ${story.globalId}`);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
generateNews();
