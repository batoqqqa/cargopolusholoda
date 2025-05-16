const pool = require('../db');

/**
 *
 * @param {Object} data — из body формы:
 *   userId, from, to, size, section,
 *   length, width, height, weight, volume,
 *   rate, cost, description, quantity,
 *   recipientName, recipientPhone, address
 */
async function createOrder(data) {
  const {
    userId,
    from, to, size, section,
    length, width, height, weight, volume,
    rate, cost, description, quantity,
    recipientName, recipientPhone, address
  } = data;

  const [result] = await pool.execute(
    `INSERT INTO orders
      (user_id,
       from_location, to_location, size_category, section_type,
       length_cm, width_cm, height_cm, weight_kg, volume_m3,
       rate, cost, description, quantity,
       recipient_name, recipient_phone, address)
     VALUES (?,      ?,             ?,             ?,            ?,
             ?,         ?,         ?,           ?,         ?,
             ?,    ?,     ?,           ?,
             ?,               ?,         ?)`,
    [
      userId,
      from, to, size, section,
      length, width, height, weight, volume,
      rate, cost, description, quantity,
      recipientName, recipientPhone, address
    ]
  );

  const [rows] = await pool.execute(
    `SELECT *
       FROM orders
      WHERE id = ?`,
    [result.insertId]
  );

  return rows[0];
}

async function getOrdersByUserId(userId) {
  const [rows] = await pool.execute(
    `SELECT
       id,
       from_location   AS \`from\`,
       to_location     AS \`to\`,
       size_category   AS size,
       section_type    AS section,
       length_cm       AS length,
       width_cm        AS width,
       height_cm       AS height,
       weight_kg       AS weight,
       volume_m3       AS volume,
       rate,
       cost,
       description,
       quantity,
       recipient_name  AS recipientName,
       recipient_phone AS recipientPhone,
       address,
       status,
       created_at      AS date
     FROM orders
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

async function getAllOrders() {
  const [rows] = await pool.execute(
    `SELECT
       o.id,
       u.name              AS userName,
       o.from_location     AS \`from\`,
       o.to_location       AS \`to\`,
       o.size_category     AS size,
       o.section_type      AS section,
       o.rate,
       o.cost,
       o.description,
       o.quantity,
       o.recipient_name    AS recipientName,
       o.recipient_phone   AS recipientPhone,
       o.address,
       o.status,
       o.created_at        AS date
     FROM orders o
     JOIN users u ON o.user_id = u.id
     ORDER BY o.created_at DESC`
  );
  return rows;
}

async function updateOrderStatus(id, status) {
  await pool.execute(
    `UPDATE orders
        SET status = ?
      WHERE id = ?`,
    [status, id]
  );
  const [rows] = await pool.execute(
    `SELECT * FROM orders WHERE id = ?`,
    [id]
  );
  return rows[0];
}

async function deleteOrder(id) {
  await pool.execute(
    `DELETE FROM orders WHERE id = ?`,
    [id]
  );
}

async function updateOrder(id, fields) {
  const {
    from_, to_, size, section,
    length, width, height, weight,
    cost, status,
    description, quantity,
    recipientName, recipientPhone, address
  } = fields;

  const query = `
    UPDATE orders SET
      from_location   = ?,
      to_location     = ?,
      size_category   = ?,
      section_type    = ?,
      length_cm       = ?,
      width_cm        = ?,
      height_cm       = ?,
      weight_kg       = ?,
      cost            = ?,
      status          = ?,
      description     = ?,
      quantity        = ?,
      recipient_name  = ?,
      recipient_phone = ?,
      address         = ?
    WHERE id = ?
  `;
  await pool.execute(query, [
    from_, to_, size, section,
    length, width, height, weight,
    cost, status,
    description, quantity,
    recipientName, recipientPhone, address,
    id
  ]);
}

async function getOrderById(id) {
  const [rows] = await pool.execute(
    `SELECT
       id,
       user_id        AS userId,
       from_location  AS \`from\`,
       to_location    AS \`to\`,
       size_category  AS size,
       section_type   AS section,
       length_cm      AS length,
       width_cm       AS width,
       height_cm      AS height,
       weight_kg      AS weight,
       volume_m3      AS volume,
       rate,
       cost,
       description,
       quantity,
       recipient_name  AS recipientName,
       recipient_phone AS recipientPhone,
       address,
       status,
       created_at     AS date
     FROM orders
     WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  createOrder,
  getOrdersByUserId,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  updateOrder,
  getOrderById
};
