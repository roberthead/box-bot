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

const conductorPrompt = fs.readFileSync(path.join(__dirname, 'conductor_prompt.md'), 'utf-8');
const categorizationPrompt = fs.readFileSync(path.join(__dirname, 'categorization_prompt.md'), 'utf-8');

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
    const result = await pool.query(`
      SELECT
        messages.*,
        emails.from_email,
        emails.sent_at,
        emails.subject,
        emails.body
      FROM messages
      JOIN emails ON messages.email_id = emails.id
      ORDER BY messages.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/message', async (req, res) => {
  const { from, sent_at, subject, body } = req.body;

  try {
    // Save email to database
    const emailResult = await pool.query(
      'INSERT INTO emails (from_email, sent_at, subject, body) VALUES ($1, $2, $3, $4) RETURNING id',
      [from, sent_at, subject, body]
    );
    const emailId = emailResult.rows[0].id;

    // Step 1: Categorize the email
    const categorizationRequest = `From: ${from}
Sent: ${sent_at}
Subject: ${subject}

${body}`;

    const categorizationMessage = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 256,
      system: categorizationPrompt,
      messages: [{
        role: 'user',
        content: categorizationRequest
      }]
    });

    const categorizationResponse = categorizationMessage.content[0].text;

    // Save categorization to messages table
    await pool.query(
      'INSERT INTO messages (email_id, agent_name, request, response) VALUES ($1, $2, $3, $4)',
      [emailId, 'categorization', categorizationRequest, categorizationResponse]
    );

    let category, confidence, summary;
    try {
      const parsed = JSON.parse(categorizationResponse);
      category = parsed.category;
      confidence = parsed.confidence;
      summary = parsed.summary;
    } catch (e) {
      category = 'other';
      confidence = 'low';
      summary = 'Failed to parse categorization';
    }

    // Step 2: Process with conductor agent
    const conductorRequest = `From: ${from}
Sent: ${sent_at}
Subject: ${subject}
Category: ${category} (${confidence} confidence)

${body}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: conductorPrompt,
      messages: [{
        role: 'user',
        content: conductorRequest
      }]
    });

    const conductorResponse = message.content[0].text;

    // Save conductor agent response to messages table
    await pool.query(
      'INSERT INTO messages (email_id, agent_name, request, response) VALUES ($1, $2, $3, $4)',
      [emailId, 'conductor', conductorRequest, conductorResponse]
    );

    res.json({
      email_id: emailId,
      original: req.body,
      category: category,
      confidence: confidence,
      summary: summary,
      response: conductorResponse
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
