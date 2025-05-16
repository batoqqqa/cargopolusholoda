const bcrypt = require('bcrypt');
const pool   = require('../db'); 

/**
 * @param {{ name: string, email: string, password: string }} userData
 * @returns {Promise<{ id: number, name: string, email: string, role: string }>}
 */
async function createUser({ name, email, password }) {
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(
    `INSERT INTO users (name, email, password, role)
     VALUES (?,      ?,     ?,        ?)`,
    [name, email, hash, 'user']
  );

  return {
    id: result.insertId,
    name,
    email,
    role: 'user'
  };
}
 
/**
 * @param {string} email
 * @returns {Promise<{ id: number, name: string, email: string, password: string, role: string }?>}
 */


async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT id, name, email, password, role
       FROM users
      WHERE email = ?`,
    [email]
  );
  return rows[0];      
}


/**
 * @param {number} id
 * @returns {Promise<{ id: number, name: string, email: string, role: string }?>}
 */
async function findUserById(id) {
  const [rows] = await pool.execute(
    `SELECT id, name, email, role
     FROM users
     WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

/**
 * @returns {Promise<Array<{ id: number, name: string, email: string, role: string }>>}
 */
async function getAllUsers() {
  const [rows] = await pool.execute(
    `SELECT id, name, email, role
     FROM users
     ORDER BY id DESC`
  );
  return rows;
}

async function updateUser(id, { name, email, role }) {
  const [result] = await pool.execute(
    `UPDATE users
       SET name = ?, email = ?, role = ?
     WHERE id = ?`,
    [name, email, role, id]
  );
  return result;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  updateUser
};
