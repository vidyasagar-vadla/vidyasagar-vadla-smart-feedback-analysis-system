CREATE DATABASE IF NOT EXISTS feedback_system;
USE feedback_system;

SET SQL_SAFE_UPDATES = 0;

DROP TABLE IF EXISTS feedback_answers;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS users;

CREATE TABLE questions (
  question_id INT AUTO_INCREMENT PRIMARY KEY,
  question_text VARCHAR(500) NOT NULL,
  question_type ENUM('text', 'rating', 'choice') NOT NULL,
  options JSON NULL,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feedback (
  feedback_id INT AUTO_INCREMENT PRIMARY KEY,
  submitter_type ENUM('guest','user') NOT NULL,
  submitter_id INT NULL,
  overall_sentiment_score FLOAT,
  overall_sentiment_label VARCHAR(32),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feedback_answers (
  answer_id INT AUTO_INCREMENT PRIMARY KEY,
  feedback_id INT NOT NULL,
  question_id INT NOT NULL,
  answer_text TEXT,
  sentiment_score FLOAT,
  sentiment_label VARCHAR(32),
  FOREIGN KEY (feedback_id) REFERENCES feedback(feedback_id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);

-- INSERT QUESTIONS WITH VALID JSON
INSERT INTO questions (question_text, question_type, options) VALUES
('What do you like most about working here?', 'text', NULL),
('What one thing would you improve?', 'text', NULL),
('Any additional comments?', 'text', NULL),
('How satisfied are you with communication?', 'rating', NULL),
('Do you feel supported by leadership?', 'choice', JSON_ARRAY('Yes', 'No', 'Sometimes')),
('Is your workload manageable?', 'rating', NULL),
('Do you have growth opportunities?', 'choice', JSON_ARRAY('Yes', 'No', 'Not sure')),
('How would you rate team collaboration?', 'rating', NULL),
('Are tools and resources adequate?', 'choice', JSON_ARRAY('Yes', 'No', 'Partially')),
('How often do you get feedback from your manager?', 'choice', JSON_ARRAY('Weekly', 'Monthly', 'Rarely', 'Never'));

-- USERS TABLE
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('user','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ADMIN USER
INSERT IGNORE INTO users (username, email, password_hash, role)
VALUES ('admin', 'admin1@example.com', '$2b$10$tNqhzRW0uA2/swAwhrnQ8u/nD5Uanth.laiugXchwBGrNhn5lxGHK', 'admin');

SET SQL_SAFE_UPDATES = 1;