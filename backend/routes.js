// backend/routes.js
const express = require('express');
const router = express.Router();
const c = require('./controllers');
const { verifyUser, verifyAdmin } = require('./auth');

// PUBLIC
router.post('/auth/register', c.register);
router.post('/auth/login', c.login);
router.get('/questions', c.getQuestions);

// GUEST FEEDBACK – PUBLIC
router.post('/feedback/guest', c.submitFeedback);

// PROTECTED (USER)
router.post('/feedback', verifyUser, c.submitFeedback);
router.get('/feedback/user/:id', verifyUser, c.getUserFeedbacks);
router.get('/analytics', verifyUser, c.getUserAnalytics);

// ADMIN ONLY
router.get('/admin/analytics', verifyAdmin, c.getAnalytics);
router.get('/admin/feedbacks', verifyAdmin, c.getAllFeedbacks);
router.delete('/feedback/:id', verifyAdmin, c.deleteFeedback);

module.exports = router;