const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/auth');
const emailService = require("../src/utils/emailService");
const createNotification = require('../src/utils/notificationHelper');
const validate = require('../src/middleware/validate');
const { applyLeaveSchema, approveLeaveSchema } = require('../src/validators/leave.validator');

const mapLeave = (l) => ({
  ...l,
  from_date: l.startDate,
  to_date: l.endDate,
  leave_type_id: l.leaveTypeId,
  user_id: l.userId,
  leave_name: l.leaveType?.name || '',
  employee_name: l.user?.name || '',
  days: l.days,
  total_days: l.days,
});

const approveLeave = async (req, res) => {
  const status = req.body.status || req.body.action;
  const comments = req.body.comments || req.body.remarks || '';
  try {
    const leave = await prisma.leaveRequest.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      include: { user: true, leaveType: true }
    });
    await prisma.leaveApproval.create({
      data: {
        leaveRequestId: parseInt(req.params.id),
        approverId: req.user.id,
        approverRole: req.user.role,
        status,
        comments,
      }
    });
    await createNotification({
      userId: leave.userId,
      title: `Leave ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your leave request has been ${status}.${comments ? ' Comment: ' + comments : ''}`,
    });
    // Send email notification
    try {
      await emailService.sendLeaveStatusEmail({
        name: leave.user.name,
        email: leave.user.email,
        status,
        leaveType: leave.leaveType.name,
        startDate: leave.startDate,
        endDate: leave.endDate,
        comments,
      });
      console.log(`[EMAIL] Leave ${status} email sent to ${leave.user.email}`);
    } catch (emailErr) {
      console.error('[EMAIL] Failed to send leave email:', emailErr.message);
    }
    res.json({ message: `Leave ${status}!`, leave });
  } catch (err) {
    console.error('APPROVE ERROR:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET leave types
router.get('/types', async (req, res) => {
  try {
    const types = await prisma.leaveType.findMany();
    res.json(types.map(t => ({ id: t.id, leave_name: t.name, max_days: t.maxDays })));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET leave balance
router.get('/balance', auth, async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const balances = await prisma.leaveBalance.findMany({
      where: { userId: req.user.id, year },
    });
    res.json(balances);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET leave stats
router.get('/stats', auth, async (req, res) => {
  try {
    const [pending, approved, rejected, total] = await Promise.all([
      prisma.leaveRequest.count({ where: { status: 'pending' } }),
      prisma.leaveRequest.count({ where: { status: 'approved' } }),
      prisma.leaveRequest.count({ where: { status: 'rejected' } }),
      prisma.leaveRequest.count(),
    ]);
    res.json({ pending, approved, rejected, total });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET leave type breakdown
router.get('/stats/by-type', auth, async (req, res) => {
  try {
    const types = await prisma.leaveType.findMany({
      include: { leaveRequests: true },
    });
    const data = types.map(t => ({ name: t.name, value: t.leaveRequests.length }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST apply leave
router.post('/apply', auth, validate(applyLeaveSchema), async (req, res) => {
  const { leave_type_id, from_date, to_date, reason } = req.body;
  try {
    const start = new Date(from_date);
    const end = new Date(to_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const request = await prisma.leaveRequest.create({
      data: {
        userId: req.user.id,
        leaveTypeId: parseInt(leave_type_id),
        startDate: start,
        endDate: end,
        days,
        reason,
        status: 'pending',
      },
      include: { leaveType: true },
    });
    await createNotification({
      userId: req.user.id,
      title: 'Leave Request Submitted',
      message: `Your leave request for ${days} day(s) has been submitted.`,
    });
    res.status(201).json({ message: 'Leave applied!', request: mapLeave(request) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET my leaves
router.get('/my', auth, async (req, res) => {
  try {
    const leaves = await prisma.leaveRequest.findMany({
      where: { userId: req.user.id },
      include: { leaveType: true, approvals: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(leaves.map(mapLeave));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET all leaves
router.get('/all', auth, async (req, res) => {
  try {
    const leaves = await prisma.leaveRequest.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        leaveType: true,
        approvals: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(leaves.map(mapLeave));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT approve/reject
router.put('/:id/approve', auth, validate(approveLeaveSchema), approveLeave);
router.put('/action/:id', auth, validate(approveLeaveSchema), approveLeave);

module.exports = router;
