const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// GET leave types - PUBLIC
router.get('/types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leave_types ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET my leave balance
router.get('/balance', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT lb.*, lt.leave_name, lt.total_days
      FROM leave_balance lb
      INNER JOIN leave_types lt ON lb.leave_type_id = lt.id
      WHERE lb.employee_id = $1
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST apply leave
router.post('/apply', auth, async (req, res) => {
  const { leave_type_id, from_date, to_date, reason } = req.body;
  const employee_id = req.user.id;

  try {
    // Calculate total days
    const from = new Date(from_date);
    const to = new Date(to_date);
    const total_days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

    // Check leave balance
    const balance = await pool.query(
      'SELECT * FROM leave_balance WHERE employee_id = $1 AND leave_type_id = $2',
      [employee_id, leave_type_id]
    );

    if (balance.rows.length > 0 && balance.rows[0].available_days < total_days) {
      return res.status(400).json({ message: 'Insufficient leave balance!' });
    }

    // Apply leave
    const result = await pool.query(`
      INSERT INTO leave_applications
      (employee_id, leave_type_id, from_date, to_date, total_days, reason, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *
    `, [employee_id, leave_type_id, from_date, to_date, total_days, reason]);

    res.status(201).json({
      message: 'Leave applied successfully!',
      leave: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET my leave applications
router.get('/my', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT la.*, lt.leave_name, u.name as employee_name
      FROM leave_applications la
      INNER JOIN leave_types lt ON la.leave_type_id = lt.id
      INNER JOIN users u ON la.employee_id = u.id
      WHERE la.employee_id = $1
      ORDER BY la.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET all leave applications - Manager/HR/Admin
router.get('/all', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT la.*, lt.leave_name, u.name as employee_name, u.email
      FROM leave_applications la
      INNER JOIN leave_types lt ON la.leave_type_id = lt.id
      INNER JOIN users u ON la.employee_id = u.id
      ORDER BY la.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT approve/reject leave - Manager/HR/Admin only
router.put('/action/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { action, remarks } = req.body;
  const approved_by = req.user.id;
  const role = req.user.role;

  if (!['admin', 'hr', 'manager'].includes(role)) {
    return res.status(403).json({ message: 'Not authorized!' });
  }

  const client = await pool.connect();

  try {
    // Start transaction
    await client.query('BEGIN');

    // Get leave application
    const leaveResult = await client.query(
      'SELECT * FROM leave_applications WHERE id = $1', [id]
    );

    if (leaveResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Leave not found' });
    }

    const leave = leaveResult.rows[0];

    // Update leave status
    await client.query(
      'UPDATE leave_applications SET status = $1 WHERE id = $2',
      [action, id]
    );

    // If approved - deduct leave balance
    if (action === 'approved') {
      const balanceCheck = await client.query(
        'SELECT * FROM leave_balance WHERE employee_id = $1 AND leave_type_id = $2',
        [leave.employee_id, leave.leave_type_id]
      );

      if (balanceCheck.rows.length > 0) {
        await client.query(
          'UPDATE leave_balance SET available_days = available_days - $1 WHERE employee_id = $2 AND leave_type_id = $3',
          [leave.total_days, leave.employee_id, leave.leave_type_id]
        );
      }
    }

    // Insert audit log
    await client.query(`
      INSERT INTO approval_history (leave_id, approved_by, action, remarks)
      VALUES ($1, $2, $3, $4)
    `, [id, approved_by, action, remarks]);

    // Commit transaction
    await client.query('COMMIT');

    res.json({ message: `Leave ${action} successfully!` });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    client.release();
  }
});

// GET dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM leave_applications');
    const pending = await pool.query("SELECT COUNT(*) FROM leave_applications WHERE status = 'pending'");
    const approved = await pool.query("SELECT COUNT(*) FROM leave_applications WHERE status = 'approved'");
    const rejected = await pool.query("SELECT COUNT(*) FROM leave_applications WHERE status = 'rejected'");

    res.json({
      total: total.rows[0].count,
      pending: pending.rows[0].count,
      approved: approved.rows[0].count,
      rejected: rejected.rows[0].count
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET approval history for a leave
router.get('/history/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT ah.*, u.name as approver_name
      FROM approval_history ah
      INNER JOIN users u ON ah.approved_by = u.id
      WHERE ah.leave_id = $1
      ORDER BY ah.created_at DESC
    `, [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;