const express         = require('express');
const pool            = require('../../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { findUserById, updateUser } = require('../models/user');

const router = express.Router();

router.use(requireAuth, requireAdmin);

// GET /api/users/getUsers
router.get('/', async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, name, email, role
         FROM users`
    );
    res.json(users);
  } catch (err) {
    console.error('Ошибка получения пользователей:', err);
    res.status(500).json({
      message: 'Ошибка получения пользователей',
      error: err.message
    });
  }
});

// GET /api/users/getUser
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, name, email, role, created_at
         FROM users
        WHERE id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Ошибка получения пользователя:', err);
    res.status(500).json({ message: 'Ошибка получения пользователя', error: err.message });
  }
});

// PUT /api/users/updateUser
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const userId = req.params.id;
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ message: 'Не хватает полей для обновления' });
  }
  if (!['user','admin'].includes(role)) {
    return res.status(400).json({ message: 'Неправильная роль' });
  }

  try {

    await updateUser(userId, { name, email, role });
    const updated = await findUserById(userId);
    res.json({ user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при обновлении пользователя' });
  }
});

// DELETE /api/users/deleteOrder
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute(`DELETE FROM users WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Пользователь удалён' });
  } catch (err) {
    console.error('Ошибка удаления пользователя:', err);
    res.status(500).json({ message: 'Ошибка удаления пользователя', error: err.message });
  }
});

module.exports = router;
