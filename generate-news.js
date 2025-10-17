const fs = require('fs');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: 'https://api.x.ai/v1',  // xAI Grok endpoint
});

async function generateNews() {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const prompt = `Summarize the top 5 news stories for today (${today}) in an engaging, neutral way. Output clean HTML: <ul><li>Story title: Brief summary.</li>...</ul>. Keep it under 800 words.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'grok-4-fast-reasoning',  // Or latest Grok model
      messages: [{ role: 'user', content: prompt }],
    });

    const newsHtml = response.choices[0].message.content;

    // Read template, inject news
    let html = fs.readFileSync('index.html', 'utf8');
    html = html.replace('<div id="news-content">Loading...</div>', `<div id="news-content">${newsHtml}</div>`);

    fs.writeFileSync('index.html', html);
    console.log('News updated!');
  } catch (error) {
    console.error('Error:', error);
    // Fallback: Don't break deployment
  }
}

generateNews();
