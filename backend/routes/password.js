const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');

    // Set expiry to 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Delete any old tokens for this user
    await pool.query(
      'DELETE FROM password_reset WHERE user_id = $1',
      [user.rows[0].id]
    );

    // Save new token
    await pool.query(
      'INSERT INTO password_reset (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.rows[0].id, token, expiresAt]
    );

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password.</p>
        <p>This link expires in 15 minutes.</p>
        <a href="${resetLink}">Reset Password</a>
      `
    });

    res.json({ message: 'Reset link sent to your email!' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// RESET PASSWORD
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Find token in database
    const result = await pool.query(
      'SELECT * FROM password_reset WHERE token = $1', [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const resetEntry = result.rows[0];

    // Check if token is expired
    if (new Date() > new Date(resetEntry.expires_at)) {
      await pool.query(
        'DELETE FROM password_reset WHERE token = $1', [token]
      );
      return res.status(400).json({ message: 'Token expired. Please request again.' });
    }

    // Encrypt new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password in users table
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, resetEntry.user_id]
    );

    // Delete used token
    await pool.query(
      'DELETE FROM password_reset WHERE token = $1', [token]
    );

    res.json({ message: 'Password reset successful! Please login.' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;