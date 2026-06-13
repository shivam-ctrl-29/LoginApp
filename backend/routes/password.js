const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
  await transporter.sendMail({ from: `"i-SOFTZONE HRMS" <${process.env.EMAIL_USER}>`, to, subject, html });
};

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Delete old tokens for this user
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id }
    });

    // Save new token
    await prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt }
    });

    const resetLink = `${FRONTEND_URL}/reset-password/${token}`;

    // Respond immediately — don't make user wait for email
    res.json({ message: 'Reset link sent to your email!' });

    // Send email in background
    sendEmail(email, 'Password Reset Request', `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f0f1a;border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
        <h2 style="color:#f8fafc;font-size:22px;margin-bottom:8px;">Password Reset</h2>
        <p style="color:#94a3b8;margin-bottom:24px;">Click the button below to reset your password. This link expires in <b style="color:#f8fafc;">15 minutes</b>.</p>
        <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
          Reset Password
        </a>
        <p style="color:#475569;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `).catch(err => console.error('[EMAIL] Forgot password email failed:', err.message));

  } catch (err) {
    console.error('FORGOT PASSWORD ERROR:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// RESET PASSWORD
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const entry = await prisma.passwordReset.findFirst({
      where: { token }
    });

    if (!entry) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (new Date() > new Date(entry.expiresAt)) {
      await prisma.passwordReset.delete({ where: { id: entry.id } });
      return res.status(400).json({ message: 'Token expired. Please request again.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: entry.userId },
      data: { password: hashedPassword }
    });

    await prisma.passwordReset.delete({ where: { id: entry.id } });

    res.json({ message: 'Password reset successful! Please login.' });

  } catch (err) {
    console.error('RESET PASSWORD ERROR:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;