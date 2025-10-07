require('dotenv').config();
const request = require('supertest');
const { Pool } = require('pg');

// Mock the Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockImplementation(({ system }) => {
        // Return different responses based on which system prompt is used
        if (system.includes('Categorization')) {
          return Promise.resolve({
            content: [{
              text: JSON.stringify({
                category: 'email-mismatch',
                confidence: 'high',
                summary: 'Test categorization summary'
              })
            }]
          });
        } else {
          return Promise.resolve({
            content: [{
              text: 'This is the main agent response'
            }]
          });
        }
      })
    }
  }));
});

// We need to require the app AFTER mocking Anthropic
const express = require('express');
const app = require('./server');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

describe('POST /message', () => {
  beforeAll(async () => {
    // Drop and recreate tables for clean test environment
    await pool.query('DROP TABLE IF EXISTS messages CASCADE');
    await pool.query('DROP TABLE IF EXISTS emails CASCADE');

    await pool.query(`
      CREATE TABLE emails (
        id SERIAL PRIMARY KEY,
        from_email VARCHAR(255) NOT NULL,
        sent_at TIMESTAMP NOT NULL,
        subject TEXT,
        body TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE messages (
        id SERIAL PRIMARY KEY,
        email_id INTEGER NOT NULL REFERENCES emails(id),
        agent_name VARCHAR(50) NOT NULL,
        request TEXT NOT NULL,
        response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });

  beforeEach(async () => {
    // Clean up database before each test
    await pool.query('DELETE FROM messages');
    await pool.query('DELETE FROM emails');
  });

  afterAll(async () => {
    // Close database connection
    await pool.end();
  });

  it('should create one email record and two message records', async () => {
    const testEmail = {
      from: 'test@example.com',
      sent_at: '2025-10-06T10:00:00Z',
      subject: 'Test Subject',
      body: 'Test email body'
    };

    // Make the POST request
    const response = await request(app)
      .post('/message')
      .send(testEmail);

    if (response.status !== 200) {
      console.error('Error response:', response.body);
    }
    expect(response.status).toBe(200);

    // Verify response structure
    expect(response.body).toHaveProperty('email_id');
    expect(response.body).toHaveProperty('category');
    expect(response.body).toHaveProperty('response');

    const emailId = response.body.email_id;

    // Verify email record was created
    const emailResult = await pool.query('SELECT * FROM emails WHERE id = $1', [emailId]);
    expect(emailResult.rows).toHaveLength(1);
    expect(emailResult.rows[0].from_email).toBe(testEmail.from);
    expect(emailResult.rows[0].subject).toBe(testEmail.subject);
    expect(emailResult.rows[0].body).toBe(testEmail.body);

    // Verify two message records were created
    const messagesResult = await pool.query(
      'SELECT * FROM messages WHERE email_id = $1 ORDER BY created_at',
      [emailId]
    );
    expect(messagesResult.rows).toHaveLength(2);

    // Verify categorization message
    const categorizationMessage = messagesResult.rows[0];
    expect(categorizationMessage.agent_name).toBe('categorization');
    expect(categorizationMessage.request).toContain(testEmail.from);
    expect(categorizationMessage.request).toContain(testEmail.subject);
    expect(categorizationMessage.response).toContain('email-mismatch');

    // Verify conductor agent message
    const conductorMessage = messagesResult.rows[1];
    expect(conductorMessage.agent_name).toBe('conductor');
    expect(conductorMessage.request).toContain(testEmail.from);
    expect(conductorMessage.request).toContain('Category: email-mismatch');
    expect(conductorMessage.response).toBe('This is the main agent response');
  });

  it('should return messages with associated email data from GET /messages', async () => {
    // First, create a test email via POST
    const testEmail = {
      from: 'get-test@example.com',
      sent_at: '2025-10-06T11:00:00Z',
      subject: 'GET Test Subject',
      body: 'GET test email body'
    };

    await request(app)
      .post('/message')
      .send(testEmail)
      .expect(200);

    // Now GET the messages
    const response = await request(app)
      .get('/messages')
      .expect(200);

    // Should have 2 messages (categorization + main)
    expect(response.body).toHaveLength(2);

    // Both messages should have the email data joined
    const [firstMessage, secondMessage] = response.body;

    // Check first message (most recent, so main agent)
    expect(firstMessage).toHaveProperty('id');
    expect(firstMessage).toHaveProperty('email_id');
    expect(firstMessage).toHaveProperty('agent_name');
    expect(firstMessage).toHaveProperty('request');
    expect(firstMessage).toHaveProperty('response');
    expect(firstMessage).toHaveProperty('from_email', testEmail.from);
    expect(firstMessage).toHaveProperty('subject', testEmail.subject);
    expect(firstMessage).toHaveProperty('body', testEmail.body);

    // Check second message
    expect(secondMessage).toHaveProperty('from_email', testEmail.from);
    expect(secondMessage).toHaveProperty('subject', testEmail.subject);
    expect(secondMessage).toHaveProperty('body', testEmail.body);

    // Verify both messages reference the same email
    expect(firstMessage.email_id).toBe(secondMessage.email_id);

    // Verify we have both agent types
    const agentNames = [firstMessage.agent_name, secondMessage.agent_name].sort();
    expect(agentNames).toEqual(['categorization', 'conductor']);
  });
});
