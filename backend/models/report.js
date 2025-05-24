const db = require('../../db');

async function getOrdersReport({ startDate, endDate }) {
  const query = `
    SELECT
      o.id,
      o.from_location,
      o.to_location,
      o.size_category,
      o.section_type,
      o.created_at,
      o.length_cm,
      o.width_cm,
      o.height_cm,
      o.weight_kg,
      o.volume_m3,
      o.value,
      o.cost,
      o.description,
      o.quantity,
      o.recipient_name,
      o.recipient_phone,
      o.address,
      o.status,
      u.id AS user_id,
      u.name AS user_name,
      u.email AS user_email,
      u.role AS user_role
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE o.created_at BETWEEN ? AND ?
    ORDER BY o.created_at ASC
  `;
  const [rows] = await db.query(query, [startDate, endDate]);
  return rows;
}

module.exports = { getOrdersReport };

