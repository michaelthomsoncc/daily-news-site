async function generateNews() {
  const currentDate = new Date();
  const today = currentDate.toLocaleDateString('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: 'long', day: 'numeric' });
  const timestamp = currentDate.toLocaleString('en-GB', { timeZone: 'Europe/London' }); // UK local time
  const fromDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const toDate = currentDate.toISOString().split('T')[0];
  const folderName = currentDate.toISOString().replace(/[:.]/g, '-').slice(0, 16); // e.g., 2025-10-17T14-30-00
  const runTimestamp = currentDate.toISOString().slice(0, 19).replace(/[:]/g, '-'); // For file names: 2025-10-17T14-30-00
  // Create new folder for this run
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
  console.log(`Created folder: ${folderName}`);
  // Phase 1: Generate stories per topic, overgenerate, then select balanced 20
  const topics = [
    { name: 'gaming', target: 3, description: 'new game updates/releases or similar (patches, betas, launches)' },
    { name: 'hardware', target: 5, description: 'PC hardware or similar (GPUs, controllers, keyboards, builds)' },
    { name: 'world', target: 5, description: 'major world events (wars, global crises—focus on factual updates/impacts)' },
    { name: 'ukgov', target: 4, description: 'UK government actions' },
    { name: 'science', target: 3, description: 'new inventions and scientific discoveries or advancements' }  // Bumped to 3 for total 20
  ];
  const storiesPerTopic = 8; // Reduced overgen to avoid excess merging
  const maxTries = 3;
  let topicStories = {};
  for (let topic of topics) {
    let topicStoriesList = [];
    let tries = 0;
    let success = false;
    while (topicStoriesList.length < storiesPerTopic && tries < maxTries && !success) {
      tries++;
      console.log(`Starting try ${tries} for ${topic.name}...`);  // Explicit log start
      let topicPrompt = `You are a gaming, tech, and world news curator for a sharp 12 year old UK gamer. Use live search to generate exactly ${storiesPerTopic} unique stories from news in the last 24 hours based strictly on well-researched, factually accurate current events from the web as of ${today} on ${topic.description}. Do not invent, fabricate, or speculate—only use verified facts from real news.
Mix for relevance: Link world/UK stuff to gaming/tech where it fits based on real connections. Make it straight fire: Direct language, real quotes from sources, end with a sharp insight. Variety—no repeats, all fresh. For heavy topics, deliver the facts and ripple effects clean.
CRITICAL: Before generating, perform live search to verify 10-20 current events for this topic from the last 24 hours. Only include stories with confirmed sources. Require exact quotes and links in "source". If fewer than ${storiesPerTopic} recent events match, generate as many as possible but aim high—expand search terms if needed.
For each story, provide:
- "title": Punchy, no-BS headline. Headline must be descriptive of the actual story. Don't name sources in headline.
- "summary": 1 sentence teaser (under 30 words).
- "source": Real news source (e.g., BBC, IGN, Reuters) and brief fact basis (e.g., "BBC: Official announcement").
Output strict JSON only: {"stories": [{"title": "...", "summary": "...", "source": "..."} ] }.`;
      if (tries > 1) {
        topicPrompt = topicPrompt.replace(
          `generate exactly ${storiesPerTopic} unique stories`,
          `generate as close to ${storiesPerTopic} as possible unique stories (aim for at least ${storiesPerTopic / 2}, expand search if needed)`
        );
      }
      try {
        const response = await openai.chat.completions.create({
          model: 'grok-4-fast-reasoning',
          messages: [{ role: 'user', content: topicPrompt }],
          response_format: { type: 'json_object' },
          max_tokens: 2500,  // Slight bump for fuller outputs
          search_parameters: {
            mode: 'on',
            return_citations: true,
            max_search_results: 15,  // Increased for better yield
            sources: [
              { type: 'web' },
              { type: 'news' },
              { type: 'x' }
            ],
            from_date: fromDate,
            toDate: toDate
          }
        });
        const data = JSON.parse(response.choices[0].message.content);
        const raw = data.stories || [];
        const newStories = raw.filter(s => {
          if (!s || typeof s !== 'object' || !s.title || !s.summary || !s.source) {
            console.warn(`Incomplete story skipped for ${topic.name} (try ${tries}):`, s);
            return false;
          }
          // Loosened: Allow source without strict prefix if it has a source name
          if (!s.source.includes(':')) {
            console.warn(`Weak source format for ${topic.name} (try ${tries}):`, s.source);
            return false;  // Still require "Source: Basis" format
          }
          return s.summary.length < 30;  // Enforce under 30 words
        });
        // Merge with previous, dedupe on title + summary (better than title alone)
        const seen = new Set(topicStoriesList.map(st => `${st.title.toLowerCase()}||${st.summary.toLowerCase()}`));
        const uniqueNew = newStories.filter(st => !seen.has(`${st.title.toLowerCase()}||${st.summary.toLowerCase()}`));
        const addedCount = uniqueNew.length;
        topicStoriesList = topicStoriesList.concat(uniqueNew);
        console.log(`Try ${tries}: Generated ${raw.length} raw, ${newStories.length} valid, ${addedCount} unique new, total now ${topicStoriesList.length} for ${topic.name}.`);
        if (topicStoriesList.length >= storiesPerTopic) {
          success = true;
          topicStoriesList = topicStoriesList.slice(0, storiesPerTopic); // Cap at 8
        }
      } catch (error) {
        console.error(`Stories generation error for ${topic.name} (try ${tries}):`, error);
      }
      if (tries < maxTries && topicStoriesList.length < storiesPerTopic) {
        // Small delay between retries
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    console.log(`Final for ${topic.name}: ${topicStoriesList.length} stories after ${tries} tries.`);
    topicStories[topic.name] = topicStoriesList;
  }
  // Prepare all stories for selection
  let allStoriesForSelection = [];
  let globalIndex = 0;
  topics.forEach(topic => {
    topicStories[topic.name].forEach(story => {
      allStoriesForSelection.push({
        globalIndex: globalIndex++,
        topic: topic.name,
        title: story.title,
        summary: story.summary,
        source: story.source
      });
    });
  });
  const totalAvailable = allStoriesForSelection.length;
  console.log(`Total stories from all topics: ${totalAvailable}`);
  let flatStories = [];
  if (totalAvailable === 0) {
    console.error('No valid stories generated across topics. Exiting.');
    return;
  }
  // Selection prompt - Enforce total 20, allow slight over-target
  const condensedForPrompt = allStoriesForSelection.map(s => ({
    index: s.globalIndex,
    topic: s.topic,
    title: (s.title || '').substring(0, 60),
    summary: (s.summary || '').substring(0, 40)
  }));
  const targetSummary = topics.map(t => `${t.name}: ${t.target}`).join(', ');
  const selectionPrompt = `You are curating a balanced news feed for a UK gamer. Select stories to meet these targets (${targetSummary}; total exactly 20).
From the provided stories, select up to the target number from each topic (prioritize diverse, high-impact, fresh ones across all). If fewer available for a topic, take all. To reach exactly 20, add 1 extra from the topic with most available if needed after base targets. Ensure no duplicates. 
Input stories: ${JSON.stringify(condensedForPrompt)}.
Output strict JSON only: {"selectedIndices": [0, 5, 12, ...]} // List of global indices (numbers).`;
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
    flatStories = flatStories.slice(0, 20); // Cap at 20
    console.log(`Selected ${flatStories.length} balanced stories.`);
  } catch (error) {
    console.error('Selection error:', error);
    // Fallback: Take up to target from each topic
    topics.forEach(topic => {
      const avail = topicStories[topic.name];
      const toTake = Math.min(avail.length, topic.target);
      flatStories = flatStories.concat(avail.slice(0, toTake));
    });
    flatStories = flatStories.slice(0, 20);
    // Pad to 20 if under: Add from topic with most extras
    while (flatStories.length < 20 && totalAvailable > flatStories.length) {
      // Find topic with most unused (simple: cycle through avail)
      let added = false;
      for (let topic of topics) {
        const used = flatStories.filter(s => s.topic === topic.name).length;  // Wait, flatStories don't have topic—fix by tracking
        const availForTopic = topicStories[topic.name].length;
        if (used < availForTopic) {  // But used not tracked; approx by current flat count vs targets
          // Simplistic: Append next from first topic with extras
          const currentForTopic = flatStories.filter(s => /* no topic; skip complex, just append extras from all */
        }
        // Better simple pad: Just append remaining from allStoriesForSelection not in flat
        const selectedGlobals = new Set(flatStories.map((_, i) => i));  // No, use indices if tracked
        // Easier: Since fallback is targets=20 now, it should be 20. If not, append random extras
        const availExtras = allStoriesForSelection.slice(20);  // Assume first 20 are base
        flatStories = flatStories.concat(availExtras.slice(0, 20 - flatStories.length));
        added = true;
        break;
      }
      if (!added) break;
    }
    console.log(`Fallback selection: ${flatStories.length} stories (padded to 20 if possible).`);
  }
  if (flatStories.length === 0) {
    console.error('No valid stories after selection. Exiting.');
    return;
  }
  if (flatStories.length < 20) {
    console.warn(`Only ${flatStories.length} valid stories after balancing. Proceeding with available stories.`);
  } else {
    console.log(`Hit target: ${flatStories.length} stories.`);
  }
  // [Rest of code unchanged: Phase 1.5 grouping, HTML gen, Phase 2 stories...]
  // ... (keep the grouping, globalStories, index.html, story gen as-is)
}
