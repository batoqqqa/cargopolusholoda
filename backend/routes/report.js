const express = require('express');
const router = express.Router();
const { getOrdersReport } = require('../models/report');

router.get('/orders-report', async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Укажите начальную и конечную даты.' });
  }
  try {
    const report = await getOrdersReport({ startDate, endDate });
    res.json(report);
  } catch (err) {
    console.error('ERROR in /orders-report:', err); 
    res.status(500).json({ error: 'Ошибка генерации отчёта.', details: err.message });
  }
});


module.exports = router;