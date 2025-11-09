// auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function getToken(req) {
  const h = req.headers.authorization;
  if (!h) return null;
  const parts = h.split(' ');
  return parts.length === 2 ? parts[1] : null;
}

function verifyUser(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: 'No token' });
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = payload;
    next();
  });
}

function verifyAdmin(req, res, next) {
  verifyUser(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    next();
  });
}

module.exports = { verifyUser, verifyAdmin };
