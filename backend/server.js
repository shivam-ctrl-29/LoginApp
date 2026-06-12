const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const passwordRoutes = require('./routes/password');
const adminRoutes = require('./routes/admin');
const departmentRoutes = require('./routes/departments');
const skillRoutes = require('./routes/skills');
const employeeRoutes = require('./routes/employees');
const leaveRoutes = require('./routes/leave');
const errorHandler = require('./src/middleware/errorHandler');
const assetRoutes = require('./src/routes/assetRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const auditRoutes = require('./src/routes/auditRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const payrollRoutes = require('./src/routes/payrollRoutes');

require("./src/jobs/cronJobs");


const app = express();

// Security
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  validate: { xForwardedForHeader: false },
  windowMs: 15 * 60 * 1000,
  max: 500
});
app.use(limiter);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// ─── V1 Routes ───────────────────────────────────────────────
app.use('/api/v1/auth',          authRoutes);
app.use('/api/v1/user',          userRoutes);
app.use('/api/v1/auth',          passwordRoutes);
app.use('/api/v1/admin',         adminRoutes);
app.use('/api/v1/departments',   departmentRoutes);
app.use('/api/v1/skills',        skillRoutes);
app.use('/api/v1/employees',     employeeRoutes);
app.use('/api/v1/leave',         leaveRoutes);
app.use('/api/v1/assets',        assetRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/audit',         auditRoutes);
app.use('/api/v1/attendance',    attendanceRoutes);
app.use('/api/v1/payroll',       payrollRoutes);

// ─── Email Test ───────────────────────────────────────────────
app.get('/api/v1/test-email', async (req, res) => {
  const emailService = require('./src/utils/emailService');
  try {
    await emailService.sendLeaveStatusEmail({
      name: 'Test User',
      email: process.env.EMAIL_USER,
      status: 'approved',
      leaveType: 'Casual Leave',
      startDate: new Date(),
      endDate: new Date(),
      comments: 'Test email from HRMS',
    });
    res.json({ success: true, sentTo: process.env.EMAIL_USER });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/v1/health', async (req, res) => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  let dbStatus = 'UP';
  let userCount = 0;
  try {
    userCount = await prisma.user.count();
  } catch (e) {
    dbStatus = 'DOWN';
  } finally {
    await prisma.$disconnect();
  }
  res.json({
    status: 'UP',
    db: dbStatus,
    totalUsers: userCount,
    timestamp: new Date().toISOString(),
    version: 'v1',
    uptime: `${Math.floor(process.uptime())}s`
  });
});

// ─── Backward Compatibility Redirects (old /api/ → /api/v1/) ──
const legacyRoutes = [
  'auth', 'user', 'admin', 'departments',
  'skills', 'employees', 'leave', 'assets',
  'notifications', 'audit'
];
legacyRoutes.forEach(route => {
  app.use(`/api/${route}`, (req, res) => {
    res.redirect(307, `/api/v1/${route}${req.path}`);
  });
});

// ─── Error Handler ────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught error:', err.message);
});