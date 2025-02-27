-- Create the database
CREATE DATABASE IF NOT EXISTS envelope;
USE envelope;

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_text TEXT NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_hash VARCHAR(64) -- Store hashed IP for moderation purposes only
);

-- Create an index for searching by recipient name
CREATE INDEX idx_recipient ON messages(recipient_name);

-- Create an index for filtering by category
CREATE INDEX idx_category ON messages(category);