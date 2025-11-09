const Sentiment = require('sentiment');
const sentiment = new Sentiment();

/**
 * Basic Positive-Leaning Sentiment Analyzer
 * - Very simple logic
 * - Gives more positive results for general/neutral text
 */
function analyzeText(text) {
  if (!text || typeof text !== 'string') {
    return { score: 0, label: 'neutral' };
  }

  const result = sentiment.analyze(text.trim());
  let score = result.score;

  // Simple positivity boost
  score += 1;

  // Normalize (just to keep values reasonable)
  const normalized = Math.max(-1, Math.min(1, score / 3));

  // Simple thresholds — easier positivity
  let label = 'neutral';
  if (normalized > 0) label = 'positive';
  else if (normalized < -0.5) label = 'negative';

  return { score: normalized, label };
}

module.exports = analyzeText;
