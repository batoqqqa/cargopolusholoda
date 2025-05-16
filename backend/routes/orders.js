const express = require('express');
const {
  createOrder,
  getOrdersByUserId,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  updateOrder,
  getOrderById
} = require('../models/order');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders/createOrder
router.post('/', requireAuth, async (req, res) => {
  try {
    const order = await createOrder({ userId: req.user.id, ...req.body });
    res.status(201).json(order);
  } catch (err) {
    console.error('Ошибка создания заказа:', err);
    res.status(400).json({ message: 'Ошибка создания заказа', error: err.message });
  }
});

// GET /api/orders/mine
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const orders = await getOrdersByUserId(req.user.id);
    res.json(orders);
  } catch (err) {
    console.error('Ошибка получения своих заказов:', err);
    res.status(500).json({ message: 'Ошибка получения заказов', error: err.message });
  }
});

// DELETE /api/orders/deleteOrder
router.delete('/:id', async (req, res) => {
  try {
    await deleteOrder(req.params.id);
    res.json({ message: 'Заказ удалён' });
  } catch (err) {
    console.error('Ошибка удаления заказа:', err);
    res.status(500).json({ message: 'Ошибка удаления заказа', error: err.message });
  }
});

router.use(requireAuth, requireAdmin);

  // GET /api/orders/getAllOrders
  router.get('/', async (req, res) => {
  try {
    const orders = await getAllOrders();
    res.json(orders);
  } catch (err) {
    console.error('Ошибка получения всех заказов:', err);
    res.status(500).json({ message: 'Ошибка получения заказов', error: err.message });
  }
});

// PATCH /api/orders/updateOrderStatus
router.patch('/:id/status', async (req, res) => {
  try {
    const updated = await updateOrderStatus(req.params.id, req.body.status);
    res.json(updated);
  } catch (err) {
    console.error('Ошибка обновления статуса:', err);
    res.status(400).json({ message: 'Ошибка обновления статуса', error: err.message });
  }
});

// PUT /api/orders/updateOrder
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = req.params.id;
  const fields = req.body;
  try {
    await updateOrder(id, fields);

    const updated = await getOrderById(id);
    res.json({ updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не удалось обновить заказ' });
  }
});

// GET /api/orders/getOrderById
router.get('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
