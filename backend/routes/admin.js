const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const users = await pool.query('SELECT id, name, email, role, verified FROM users ORDER BY id ASC');
    res.json(users.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/users/:id', auth, authorize('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM approval_history WHERE approved_by = $1', [id]);
    await pool.query('DELETE FROM password_reset WHERE user_id = $1', [id]);
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
