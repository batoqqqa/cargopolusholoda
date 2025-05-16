require('dotenv').config();
const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const {createUser, findUserByEmail } = require('../models/user');

const session = require('express-session');
const router = express.Router();
const JWT_SECRET   = process.env.JWT_SECRET;
const SALT_ROUNDS  = parseInt(process.env.SALT_ROUNDS, 10) || 10;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// GET /api/auth/captcha
router.get('/captcha', (req, res) => {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  req.session.captchaSum = a + b;  
  res.json({ a, b });
});


// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Все поля обязательны' });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Пароль должен быть ≥8 символов, содержать заглавную и строчную букву и цифру.'
      });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Пользователь уже существует' });
    }

    const newUser = await createUser({ name, email, password });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id:    newUser.id,
        name:  newUser.name,
        email: newUser.email,
        role:  newUser.role
      },
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Ошибка регистрации', error: JSON.stringify(err)  });
  }
});


// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {

    const { email, password, captchaAnswer} = req.body;
    const expected = req.session.captchaSum;

    if (Number(captchaAnswer) !== expected) {
      return res.status(400).json({ message: 'Неверная капча' });
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Неверные данные' });
    }

    const userHash = user.password || user.passwordHash;

    const valid = await bcrypt.compare(password, userHash);

    if (!valid) {
      return res.status(401).json({ message: 'Неверные данные' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role
      },
      token, 
      success:true
    });

  } catch (err) {
    console.error('🔥 Login error stack:', err);
    res.status(500).json({ message: 'Ошибка логина', error: err.message });
  }
});

module.exports = router;
