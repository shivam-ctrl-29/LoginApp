const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/auth');
const cache = require('../src/utils/cache');

// GET all departments - PUBLIC (cached)
router.get('/', async (req, res) => {
  try {
    const cached = cache.get('departments');
    if (cached) {
      console.log('Cache HIT: departments');
      return res.json(cached);
    }
    const departments = await prisma.department.findMany({
      orderBy: { departmentName: 'asc' },
    });
    const mapped = departments.map(d => ({
      id: d.id,
      department_name: d.departmentName,
      created_at: d.createdAt,
    }));
    cache.set('departments', mapped);
    console.log('Cache SET: departments');
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST create department (invalidate cache)
router.post('/', auth, async (req, res) => {
  const { departmentName, department_name } = req.body;
  try {
    const dept = await prisma.department.create({
      data: { departmentName: departmentName || department_name }
    });
    cache.del('departments');
    res.status(201).json({ message: 'Department created!', dept });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update department (invalidate cache)
router.put('/:id', auth, async (req, res) => {
  const { departmentName, department_name } = req.body;
  try {
    const dept = await prisma.department.update({
      where: { id: parseInt(req.params.id) },
      data: { departmentName: departmentName || department_name }
    });
    cache.del('departments');
    res.json({ message: 'Department updated!', dept });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE department (invalidate cache)
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.department.delete({ where: { id: parseInt(req.params.id) } });
    cache.del('departments');
    res.json({ message: 'Department deleted!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
