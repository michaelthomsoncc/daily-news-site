const fs = require('fs');
const path = require('path');

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: 'https://api.x.ai/v1',  // xAI Grok endpoint
});

async function generateNews() {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timestamp = new Date().toLocaleString();
  
  // Phase 1: Get headlines and summaries
  const headlinesPrompt = `Provide the top 5 news stories for today (${today}) in JSON array format. Each story object: {
    "title": "Engaging headline",
    "summary": "2-3 sentence teaser for index page"
  }. Focus on global top stories (world, tech, politics, etc.). Output as {"stories": [array]}.`;

  let stories = [];
  try {
    const headlinesResponse = await openai.chat.completions.create({
      model: 'grok-4-fast-reasoning',
      messages: [{ role: 'user', content: headlinesPrompt }],
      response_format: { type: 'json_object' },
    });

    const headlinesJson = JSON.parse(headlinesResponse.choices[0].message.content);
    stories = headlinesJson.stories || [];
    
    if (stories.length === 0) throw new Error('No headlines generated');
    console.log(`Generated ${stories.length} headlines.`);
  } catch (error) {
    console.error('Headlines error:', error);
    return;
  }

  // Clear old story files
  const storyFiles = fs.readdirSync('.').filter(f => f.startsWith('story') && f.endsWith('.html'));
  storyFiles.forEach(file => fs.unlinkSync(file));

  // Generate index.html
  let indexHtml = fs.readFileSync('index.html', 'utf8');
  const newDiv = `<div id="news-content"><ul>${stories.map((story, i) => 
    `<li><a href="story${i+1}.html">${story.title}</a>: ${story.summary}</li>`
  ).join('')}</ul></div>`;
  indexHtml = indexHtml.replace(/<div id="news-content">.*?<\/div>/s, newDiv);
  indexHtml = indexHtml.replace(/<p>Last updated: .*<script>.*<\/script>/s, `<p>Last updated: ${timestamp}</p>`);
  fs.writeFileSync('index.html', indexHtml);

  // Phase 2: Generate full stories one by one
  const storyTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Daily Grok News</title>
    <style> body { font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px; } a.back { color: blue; } </style>
</head>
<body>
    <h1>{title}</h1>
    <div class="story">{fullStory}</div>
    <p><a href="index.html" class="back">← Back to headlines</a> | Updated: {timestamp}</p>
</body>
</html>`;

  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];
    const expandPrompt = `Expand this news headline "${story.title}" and teaser "${story.summary}" into a detailed 200-300 word full story. Use neutral, engaging tone. Output clean HTML only: <p> paragraphs, <strong> for emphasis, etc.`;

    try {
      const storyResponse = await openai.chat.completions.create({
        model: 'grok-4-fast-reasoning',
        messages: [{ role: 'user', content: expandPrompt }],
        max_tokens: 800,  // Cap for story length
      });

      story.fullStory = storyResponse.choices[0].message.content;

      let storyHtml = storyTemplate
        .replace(/\{title\}/g, story.title)
        .replace(/\{fullStory\}/g, story.fullStory)
        .replace(/\{timestamp\}/g, timestamp);
      fs.writeFileSync(`story${i+1}.html`, storyHtml);
      
      console.log(`Generated story ${i+1}: ${story.title}`);
    } catch (error) {
      console.error(`Story ${i+1} error:`, error);
      // Fallback: Empty story to avoid breaking
      story.fullStory = '<p>Story generation failed—check back later.</p>';
    }
  }

  console.log(`All ${stories.length} stories complete!`);
}

generateNews();
