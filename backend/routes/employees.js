const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { files: 5 }
});

// POST create employee
router.post('/', auth, async (req, res) => {
  const { department_id, phone, address, designation, salary, skill_ids } = req.body;
  const user_id = req.user.id;
  try {
    // Create employee profile
    const result = await pool.query(
      `INSERT INTO employee_profiles
       (user_id, department_id, phone, address, designation, salary)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, department_id, phone, address, designation, salary]
    );
    const employee = result.rows[0];

    // Add skills
    if (skill_ids && skill_ids.length > 0) {
      for (const skill_id of skill_ids) {
        await pool.query(
          'INSERT INTO employee_skills (employee_id, skill_id) VALUES ($1, $2)',
          [employee.id, skill_id]
        );
      }
    }

    res.status(201).json({ message: 'Employee created!', employee });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET all employees with JOIN
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ep.id,
        u.name,
        u.email,
        d.department_name,
        ep.phone,
        ep.designation,
        ep.salary,
        ep.created_at
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      INNER JOIN departments d ON ep.department_id = d.id
      ORDER BY ep.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET single employee
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    // Get employee details
    const empResult = await pool.query(`
      SELECT
        ep.*,
        u.name,
        u.email,
        d.department_name
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      INNER JOIN departments d ON ep.department_id = d.id
      WHERE ep.id = $1
    `, [id]);

    if (empResult.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Get skills
    const skillsResult = await pool.query(`
      SELECT s.skill_name
      FROM employee_skills es
      INNER JOIN skills s ON es.skill_id = s.id
      WHERE es.employee_id = $1
    `, [id]);

    // Get images
    const imagesResult = await pool.query(
      'SELECT * FROM employee_images WHERE employee_id = $1', [id]
    );

    res.json({
      ...empResult.rows[0],
      skills: skillsResult.rows,
      images: imagesResult.rows
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update employee
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { department_id, phone, address, designation, salary, skill_ids } = req.body;
  try {
    await pool.query(`
      UPDATE employee_profiles
      SET department_id=$1, phone=$2, address=$3, designation=$4, salary=$5
      WHERE id=$6
    `, [department_id, phone, address, designation, salary, id]);

    // Update skills - delete old and add new
    await pool.query('DELETE FROM employee_skills WHERE employee_id = $1', [id]);
    if (skill_ids && skill_ids.length > 0) {
      for (const skill_id of skill_ids) {
        await pool.query(
          'INSERT INTO employee_skills (employee_id, skill_id) VALUES ($1, $2)',
          [id, skill_id]
        );
      }
    }

    res.json({ message: 'Employee updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE employee
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM employee_skills WHERE employee_id = $1', [id]);
    await pool.query('DELETE FROM employee_images WHERE employee_id = $1', [id]);
    await pool.query('DELETE FROM employee_profiles WHERE id = $1', [id]);
    res.json({ message: 'Employee deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST upload images
router.post('/upload/:id', auth, upload.array('images', 5), async (req, res) => {
  const { id } = req.params;
  try {
    const imageUrls = [];
    for (const file of req.files) {
      const imageUrl = `/uploads/${file.filename}`;
      await pool.query(
        'INSERT INTO employee_images (employee_id, image_url) VALUES ($1, $2)',
        [id, imageUrl]
      );
      imageUrls.push(imageUrl);
    }
    res.json({ message: 'Images uploaded!', images: imageUrls });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET dashboard stats
router.get('/stats/dashboard', auth, async (req, res) => {
  try {
    const employees = await pool.query('SELECT COUNT(*) FROM employee_profiles');
    const departments = await pool.query('SELECT COUNT(*) FROM departments');
    const skills = await pool.query('SELECT COUNT(*) FROM skills');
    const images = await pool.query('SELECT COUNT(*) FROM employee_images');

    res.json({
      totalEmployees: employees.rows[0].count,
      totalDepartments: departments.rows[0].count,
      totalSkills: skills.rows[0].count,
      totalImages: images.rows[0].count
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;