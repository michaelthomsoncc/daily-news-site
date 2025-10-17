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
  
  const prompt = `Provide the top 5 news stories for today (${today}) in JSON array format. Each story object: {
    "title": "Engaging headline",
    "summary": "2-3 sentence teaser for index page",
    "fullStory": "Detailed 200-300 word article in clean HTML (<p>, <strong>, etc.). Neutral, engaging tone."
  }. Focus on global top stories (world, tech, politics, etc.).`;

  try {
    const response = await openai.chat.completions.create({
      model: 'grok-4-fast-reasoning',  // Your fast Grok-4 variant
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },  // Enforce JSON
    });

    const jsonStr = response.choices[0].message.content;
    const stories = JSON.parse(jsonStr).stories || [];  // Assume root has 'stories' array

    if (stories.length === 0) throw new Error('No stories generated');

    // Clear old story files
    const storyFiles = fs.readdirSync('.').filter(f => f.startsWith('story') && f.endsWith('.html'));
    storyFiles.forEach(file => fs.unlinkSync(file));

    // Generate index.html
    let indexHtml = fs.readFileSync('index.html', 'utf8');
    let newsList = '<ul>';
    stories.forEach((story, i) => {
      newsList += `<li><a href="story${i+1}.html">${story.title}</a>: ${story.summary}</li>`;
    });
    newsList += '</ul><p>Last updated: ' + timestamp + '</p>';
    indexHtml = indexHtml.replace('<div id="news-content">Loading...</div>', `<div id="news-content">${newsList}</div>`);
    fs.writeFileSync('index.html', indexHtml);

    // Generate story pages
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

    stories.forEach((story, i) => {
      let storyHtml = storyTemplate
        .replace('{title}', story.title)
        .replace('{fullStory}', story.fullStory)
        .replace('{timestamp}', timestamp);
      fs.writeFileSync(`story${i+1}.html`, storyHtml);
    });

    console.log(`Generated ${stories.length} stories!`);
  } catch (error) {
    console.error('Error:', error);
  }
}

generateNews();
