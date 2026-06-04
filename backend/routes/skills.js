const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// GET all skills - PUBLIC (no auth needed)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM skills ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST create skill - Protected
router.post('/', auth, async (req, res) => {
  const { skill_name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO skills (skill_name) VALUES ($1) RETURNING *',
      [skill_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;