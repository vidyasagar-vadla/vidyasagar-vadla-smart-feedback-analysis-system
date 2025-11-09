// backend/controllers.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const analyzeText = require('./sentiment');
require('dotenv').config();

async function findUserByEmail(email) {
  const [rows] = await db.query('SELECT * FROM users WHERE email=?', [email]);
  return rows[0];
}

// REGISTER
async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email already in use' });
    const hash = await bcrypt.hash(password, 10);
    const [r] = await db.query('INSERT INTO users(username, email, password_hash, role) VALUES(?,?,?,?)', [username, email, hash, 'user']);
    res.json({ message: 'Registered', userId: r.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
}

// LOGIN
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.user_id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, role: user.role, username: user.username, id: user.user_id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET QUESTIONS
async function getQuestions(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM questions WHERE active=1 ORDER BY question_id');
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
}


/**
 * Enhanced Feedback Submission with Weighted Sentiment
 * - Neutral zone ±0.2
 * - Weighted rating & choice answers
 */
async function submitFeedback(req, res) {
  const { submitter_type, submitter_id, answers } = req.body;

  if (!submitter_type || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  if (!['guest', 'user'].includes(submitter_type)) {
    return res.status(400).json({ message: 'Invalid submitter_type' });
  }

  if (submitter_type === 'user' && !submitter_id) {
    return res.status(400).json({ message: 'User ID required for user submissions' });
  }

  const validSubmitterId = submitter_type === 'user' ? submitter_id : null;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Create feedback entry
    const [feedbackResult] = await connection.query(
      'INSERT INTO feedback (submitter_type, submitter_id) VALUES (?, ?)',
      [submitter_type, validSubmitterId]
    );
    const feedbackId = feedbackResult.insertId;

    let weightedSum = 0;
    let weightTotal = 0;

    for (const ans of answers) {
      const { question_id, answer_text } = ans;
      if (!question_id || answer_text === undefined) continue;

      const [q] = await connection.query(
        'SELECT question_type, options FROM questions WHERE question_id = ?',
        [question_id]
      );
      if (!q[0]) continue;

      const type = q[0].question_type;
      let sentiment = { score: 0, label: 'neutral' };
      let weight = 1; // default

      // 🗣️ Text-based (Open-ended)
      if (type === 'text' && answer_text.trim() !== '') {
        sentiment = analyzeText(answer_text);
        weight = 1; // lighter influence
      }

      // ⭐ Rating (1–5)
      else if (type === 'rating') {
        const rating = parseInt(answer_text);
        if (rating >= 1 && rating <= 5) {
          sentiment.score = (rating - 3) / 2; // maps 1→-1, 3→0, 5→+1
          weight = 1.5; // stronger influence

          if (sentiment.score > 0.2) sentiment.label = 'positive';
          else if (sentiment.score < -0.2) sentiment.label = 'negative';
        }
      }

      // ✅ Choice-based (Yes/No/Sometimes/Partially)
      else if (type === 'choice') {
        let answer = answer_text.toLowerCase();
        weight = 1.2;

        if (answer.includes('yes')) {
          sentiment.score = 1;
          sentiment.label = 'positive';
        } else if (answer.includes('no')) {
          sentiment.score = -1;
          sentiment.label = 'negative';
        } else if (
          answer.includes('sometimes') ||
          answer.includes('partially') ||
          answer.includes('not sure')
        ) {
          sentiment.score = 0;
          sentiment.label = 'neutral';
        } else {
          // fallback: option order logic
          let options = [];
          try {
            options = Array.isArray(q[0].options)
              ? q[0].options
              : JSON.parse(q[0].options);
          } catch {
            options = q[0].options.split(',').map((s) => s.trim());
          }
          const idx = options.indexOf(answer_text);
          if (idx >= 0 && options.length > 1) {
            sentiment.score = (idx / (options.length - 1)) * 2 - 1;
          }
        }
      }

      // 💾 Insert into DB
      await connection.query(
        `INSERT INTO feedback_answers 
         (feedback_id, question_id, answer_text, sentiment_score, sentiment_label)
         VALUES (?, ?, ?, ?, ?)`,
        [feedbackId, question_id, answer_text, sentiment.score, sentiment.label]
      );

      weightedSum += sentiment.score * weight;
      weightTotal += weight;
    }

    // 🧮 Compute overall weighted average
    const overallScore = weightTotal > 0 ? weightedSum / weightTotal : 0;
    const overallLabel =
      overallScore > 0.2 ? 'positive' :
      overallScore < -0.2 ? 'negative' : 'neutral';

    await connection.query(
      'UPDATE feedback SET overall_sentiment_score=?, overall_sentiment_label=? WHERE feedback_id=?',
      [overallScore, overallLabel, feedbackId]
    );

    await connection.commit();

    res.json({
      message: '✅ Feedback submitted successfully',
      feedbackId,
      overall_sentiment_score: overallScore,
      overall_sentiment_label: overallLabel,
    });

  } catch (err) {
    await connection.rollback();
    console.error('❌ Feedback submission error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
}



// GET USER'S FEEDBACKS (SUMMARY ONLY)
async function getUserFeedbacks(req, res) {
  try {
    const { id } = req.params;
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [feedbacks] = await db.query(`
      SELECT 
        f.feedback_id,
        f.overall_sentiment_score,
        f.overall_sentiment_label,
        f.created_at
      FROM feedback f
      WHERE f.submitter_type = 'user' AND f.submitter_id = ?
      ORDER BY f.created_at DESC
    `, [id]);

    res.json(feedbacks);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
}

// USER ANALYTICS
async function getUserAnalytics(req, res) {
  try {
    const [pie] = await db.query(`
      SELECT overall_sentiment_label AS label, COUNT(*) AS count 
      FROM feedback 
      WHERE submitter_type='user' AND submitter_id=?
      GROUP BY overall_sentiment_label
    `, [req.user.id]);

    const [bar] = await db.query(`
      SELECT q.question_id, q.question_text, AVG(fa.sentiment_score) AS avg_score
      FROM feedback_answers fa 
      JOIN questions q ON fa.question_id = q.question_id
      JOIN feedback f ON fa.feedback_id = f.feedback_id
      WHERE f.submitter_type='user' AND f.submitter_id=?
      GROUP BY q.question_id ORDER BY q.question_id
    `, [req.user.id]);

    const [line] = await db.query(`
      SELECT DATE(created_at) AS day, AVG(overall_sentiment_score) AS avg_score 
      FROM feedback 
      WHERE submitter_type='user' AND submitter_id=?
      GROUP BY DATE(created_at) ORDER BY day
    `, [req.user.id]);

    res.json({ pie, bar, line });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
}

// ADMIN: GLOBAL ANALYTICS
async function getAnalytics(req, res) {
  try {
    const [pie] = await db.query(`
      SELECT overall_sentiment_label AS label, COUNT(*) AS count 
      FROM feedback 
      GROUP BY overall_sentiment_label
    `);

    const [bar] = await db.query(`
      SELECT q.question_id, q.question_text, AVG(fa.sentiment_score) AS avg_score
      FROM feedback_answers fa 
      JOIN questions q ON fa.question_id = q.question_id
      JOIN feedback f ON fa.feedback_id = f.feedback_id
      GROUP BY q.question_id ORDER BY q.question_id
    `);

    const [line] = await db.query(`
      SELECT DATE(created_at) AS day, AVG(overall_sentiment_score) AS avg_score 
      FROM feedback 
      GROUP BY DATE(created_at) ORDER BY day
    `);

    res.json({ pie, bar, line });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
}

// ADMIN: ALL FEEDBACKS
async function getAllFeedbacks(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT f.*, u.username 
      FROM feedback f 
      LEFT JOIN users u ON f.submitter_id = u.user_id AND f.submitter_type='user'
      ORDER BY f.created_at DESC
    `);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE FEEDBACK (ADMIN)
async function deleteFeedback(req, res) {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM feedback WHERE feedback_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json({ message: 'Feedback deleted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  register,
  login,
  getQuestions,
  submitFeedback,
  getUserFeedbacks,
  getUserAnalytics,
  getAnalytics,
  getAllFeedbacks,
  deleteFeedback
};