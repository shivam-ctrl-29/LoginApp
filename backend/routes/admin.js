const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// GET all users
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update user role
router.put('/users/:id/role', auth, authorize('admin'), async (req, res) => {
  const { role } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { role },
    });
    res.json({ message: 'Role updated!', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE user
router.delete('/users/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'User deleted!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const [totalEmployees, totalDepartments, pendingLeaves, approvedLeaves] = await Promise.all([
      prisma.employeeProfile.count(),
      prisma.department.count(),
      prisma.leaveRequest.count({ where: { status: 'pending' } }),
      prisma.leaveRequest.count({ where: { status: 'approved' } }),
    ]);
    res.json({ totalEmployees, totalDepartments, pendingLeaves, approvedLeaves });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
