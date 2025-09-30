CREATE DATABASE box_bot;

\c box_bot

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  from_email VARCHAR(255) NOT NULL,
  sent_at VARCHAR(255),
  subject TEXT,
  body TEXT,
  claude_response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
