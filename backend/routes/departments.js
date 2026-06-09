const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all departments - PUBLIC (no auth needed)
router.get('/', async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { departmentName: 'asc' },
    });
    const mapped = departments.map(d => ({
      id: d.id,
      department_name: d.departmentName,
      created_at: d.createdAt,
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST create department
const auth = require('../middleware/auth');
router.post('/', auth, async (req, res) => {
  const { departmentName, department_name } = req.body;
  try {
    const dept = await prisma.department.create({
      data: { departmentName: departmentName || department_name }
    });
    res.status(201).json({ message: 'Department created!', dept });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update department
router.put('/:id', auth, async (req, res) => {
  const { departmentName, department_name } = req.body;
  try {
    const dept = await prisma.department.update({
      where: { id: parseInt(req.params.id) },
      data: { departmentName: departmentName || department_name }
    });
    res.json({ message: 'Department updated!', dept });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE department
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.department.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Department deleted!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
