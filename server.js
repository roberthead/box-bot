require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const systemPrompt = fs.readFileSync(path.join(__dirname, 'system_prompt.md'), 'utf-8');

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/welcome', (req, res) => {
  res.send('hello, world');
});

app.get('/messages', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM messages ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/message', async (req, res) => {
  const { from, sent_at, subject, body } = req.body;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `From: ${from}
Sent: ${sent_at}
Subject: ${subject}

${body}`
      }]
    });

    const claudeResponse = message.content[0].text;

    // Save to database
    await pool.query(
      'INSERT INTO messages (from_email, sent_at, subject, body, claude_response) VALUES ($1, $2, $3, $4, $5)',
      [from, sent_at, subject, body, claudeResponse]
    );

    res.json({
      original: req.body,
      response: claudeResponse
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
