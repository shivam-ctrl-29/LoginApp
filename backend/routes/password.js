const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const emailService = require('../src/utils/emailService');
require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

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
    emailService.sendPasswordResetEmail(email, resetLink).catch(err => console.error('[EMAIL] Forgot password email failed:', err.message));

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