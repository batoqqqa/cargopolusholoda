const jwt     = require('jsonwebtoken');
const User    = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET;

async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.split(' ')[1];
    if (!token) throw new Error('Нет токена');
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findUserById(payload.id);
    if (!user) throw new Error('Пользователь не найден');
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Не авторизован' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
