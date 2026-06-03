const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Email sender helper
const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
};

// SIGNUP
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [name, email, hashedPassword]
    );
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await pool.query(
      'INSERT INTO password_reset (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [newUser.rows[0].id, token, expiresAt]
    );
    const verifyLink = `http://localhost:3000/verify-email/${token}`;
    await sendEmail(email, 'Verify Your Email', `
      <h2>Welcome ${name}!</h2>
      <p>Please verify your email by clicking the link below.</p>
      <a href="${verifyLink}" style="background:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
        Verify Email
      </a>
    `);
    res.status(201).json({ message: 'Registered! Please check your email to verify your account.' });
  } catch (error) {
    console.error('SIGNUP ERROR:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// VERIFY EMAIL
router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM password_reset WHERE token = $1', [token]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired link' });
    }
    const entry = result.rows[0];
    if (new Date() > new Date(entry.expires_at)) {
      await pool.query('DELETE FROM password_reset WHERE token = $1', [token]);
      return res.status(400).json({ message: 'Link expired. Please register again.' });
    }
    await pool.query('UPDATE users SET verified = TRUE WHERE id = $1', [entry.user_id]);
    await pool.query('DELETE FROM password_reset WHERE token = $1', [token]);
    res.json({ message: 'Email verified successfully! You can now login.' });
  } catch (err) {
    console.error('VERIFY ERROR:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Login attempt for:', email);

    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }
    if (!user.rows[0].verified) {
      return res.status(400).json({ message: 'Please verify your email before logging in!' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Wrong password' });
    }

    // Access token includes role ← important for Phase 7
    const accessToken = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Refresh token
    const refreshToken = jwt.sign(
      { id: user.rows[0].id },
      process.env.REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)',
      [user.rows[0].id, refreshToken]
    );

    res.json({
      message: 'Login successful!',
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('LOGIN ERROR:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// REFRESH TOKEN
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1', [refreshToken]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error('REFRESH ERROR:', err.message);
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});

// LOGOUT
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  try {
    await pool.query(
      'DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]
    );
    res.json({ message: 'Logged out successfully!' });
  } catch (err) {
    console.error('LOGOUT ERROR:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;