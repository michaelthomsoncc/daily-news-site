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
  
  // Phase 1: Generate 20 diverse flat stories tailored to George Stephenson High School students
  const storiesPrompt = `You are a youth-focused news editor for George Stephenson High School in Killingworth, Newcastle upon Tyne, UK. Create exactly 20 unique, real-time news stories highly relevant and interesting to students in years 7-9 (ages 11-14), with some appeal to years 10-11 too. Base everything on well-researched, factually accurate current events from your up-to-date knowledge as of October 17, 2025—focus on today's happenings or very recent developments in the local area, school, or topics that resonate with teens like tech gadgets, school sports, local hangouts, environmental challenges, pop culture events nearby, study tips for exams, or engineering projects (nod to the school's STEM heritage). Avoid stereotypes; draw from real, diverse student experiences like balancing homework with hobbies, navigating friendships, or exploring career sparks in a post-industrial town.

Make stories engaging for this audience: Use relatable language, start with a hook (e.g., "Ever wondered if...?"), include short quotes from local teens or experts, and end with a question or tip. Ensure variety: Mix school-specific (e.g., club updates), local adventures, digital world, health & fun, future skills—no more than 2 similar.

For each story, provide:
- "title": Catchy, question-style or bold headline that grabs a 12-year-old.
- "summary": 1-2 sentence super-short teaser (under 50 words, punchy hook).

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
    console.log(`Generated 20 diverse stories tailored to George Stephenson students.`);
  } catch (error) {
    console.error('Stories generation error:', error);
    return;
  }

  // Phase 1.5: Dynamically categorize the 20 stories for teen-friendly sections
  let groupsData = { groups: [] };
  try {
    const groupingPrompt = `You are a categorizer for teen news at George Stephenson High School. Take these 20 stories and group them into 4-6 dynamic, fun-named categories based on content that would excite years 7-9 students (e.g., "Tech Hacks & Gadget Buzz" for digital stories, "Pitchside Thrills" for sports). Each group 3-5 stories (total 20). Make categories emerge naturally from the stories—relatable, not generic.

Input stories: ${JSON.stringify(flatStories)}.

Output strict JSON only: {"groups": [{"name": "Fun Group Name", "stories": [ {"title": "...", "summary": "..."} ] } ] }.`;

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
    console.log(`Dynamically grouped into ${groupsData.groups.length} teen-friendly categories.`);
  } catch (error) {
    console.error('Grouping error:', error);
    // Fallback: Simple teen-themed groups
    groupsData = {
      groups: [
        { name: "School Scoop", stories: flatStories.slice(0, 5) },
        { name: "Local Vibes", stories: flatStories.slice(5, 10) },
        { name: "Tech & Trends", stories: flatStories.slice(10, 15) },
        { name: "Fun & Future", stories: flatStories.slice(15, 20) }
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

  // Generate index.html with grouped structure (headlines only, cleaner layout)
  let indexHtml = fs.readFileSync('index.html', 'utf8');
  let newDiv = '<div id="news-content">';
  groupsData.groups.forEach(group => {
    newDiv += `<h2>${group.name}</h2><ul class="headlines-list">`;
    group.stories.forEach(story => {
      const globalStory = globalStories.find(s => s.title === story.title && s.summary === story.summary);
      newDiv += `<li><a href="story${globalStory.globalId}.html"><strong>${story.title}</strong></a><br><small>${story.summary}</small></li>`;
    });
    newDiv += '</ul>';
  });
  newDiv += '</div>';
  indexHtml = indexHtml.replace(/<div id="news-content">.*?<\/div>/s, newDiv);
  indexHtml = indexHtml.replace(/<p>Last updated: .*<script>.*<\/script>/s, `<p>Last updated: ${timestamp} | For George Stephenson High School students</p>`);
  // Add simple CSS for better layout
  const cssUpdate = indexHtml.replace(
    /<style> body \{ font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px; \} <\/style>/s,
    `<style> 
      body { font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px; background: #f9f9f9; } 
      h1 { color: #333; } 
      h2 { color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px; } 
      ul.headlines-list { list-style: none; padding: 0; } 
      ul.headlines-list li { margin: 15px 0; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); } 
      a { color: #007bff; text-decoration: none; } a:hover { text-decoration: underline; } 
      small { color: #666; display: block; margin-top: 5px; } 
    </style>`
  );
  fs.writeFileSync('index.html', cssUpdate);

  // Phase 2: Generate full ~500-word stories suited for young readers
  const storyTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Stephenson Student News</title>
    <style> 
      body { font-family: Arial; max-width: 700px; margin: 0 auto; padding: 20px; background: #f9f9f9; line-height: 1.6; font-size: 16px; } 
      h1 { color: #007bff; } 
      h3 { color: #333; } 
      .story p { margin-bottom: 15px; } 
      .hook { font-style: italic; color: #007bff; font-size: 18px; } 
      a.back { color: #007bff; font-weight: bold; } 
      .tip { background: #e7f3ff; padding: 10px; border-left: 4px solid #007bff; margin: 20px 0; } 
    </style>
</head>
<body>
    <h1>{title}</h1>
    <p><em>From the {groupName} section – Hey Stephenson students!</em></p>
    <div class="story">{fullStory}</div>
    <div class="tip"><strong>Quick Tip:</strong> What do you think? Share your take in class tomorrow!</div>
    <p><a href="index.html" class="back">← Back to headlines</a> | Updated: {timestamp}</p>
</body>
</html>`;

  for (let i = 0; i < globalStories.length; i++) {
    const story = globalStories[i];
    const expandPrompt = `Write an engaging ~500-word news article tailored for George Stephenson High School students (years 7-9 focus): "${story.title}". Teaser: ${story.summary}.

Research-based on real current events as of October 17, 2025—use verified facts, local context, and teen perspectives. Keep it correct, relevant, and fun: Simple sentences, active voice, relatable examples. No fluff or stereotypes.

Structure for quick reads:
- Hook: 1-2 paras starting with a question or scenario.
- Body: 3-4 short sections with <h3> subheads, quotes, key facts.
- Wrap: Implications for students + forward-looking note.
Output clean HTML only: <p> for paras, <strong> emphasis, <em> quotes. Word count: 400-600.`;

    try {
      const storyResponse = await openai.chat.completions.create({
        model: 'grok-4-fast-reasoning',
        messages: [{ role: 'user', content: expandPrompt }],
        max_tokens: 2000,  // For ~500 words
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
      // Fallback: Short engaging placeholder
      const fallbackStory = `<p class="hook">Hey, Stephenson squad—big things brewing on this one!</p><p>Our team's digging into the latest facts right now. Stay tuned for the full scoop tomorrow. In the meantime, chat about it with your mates: What's your first thought?</p>`;
      let storyHtml = storyTemplate
        .replace(/\{title\}/g, story.title)
        .replace(/\{fullStory\}/g, fallbackStory)
        .replace(/\{groupName\}/g, story.groupName)
        .replace(/\{timestamp\}/g, timestamp);
      fs.writeFileSync(`story${story.globalId}.html`, storyHtml);
    }
    // Small delay for rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`All 20 stories complete – tailored for Stephenson students!`);
}

generateNews();
