require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const session = require('express-session');
const path = require('path');

const authRoutes  = require('./backend/routes/auth');
const userRoutes  = require('./backend/routes/users');
const orderRoutes = require('./backend/routes/orders');
const { requireAuth, requireAdmin } = require('./backend/middleware/auth');

const app = express();

app.use(express.static(path.join(__dirname, '..')))

app.use(cors());
app.use(session({
  secret: process.env.SESSION_SECRET || 'haine', 
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 15 * 60 * 1000, httpOnly: false, sameSite: 'lax', secure: false } 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/auth', authRoutes);

app.use('/api/orders', requireAuth, orderRoutes);

app.use('/api/users',  requireAuth, requireAdmin, userRoutes);

app.use('/api/orders', require('./backend/routes/orders'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
