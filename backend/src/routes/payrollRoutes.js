const express = require('express');
const router = express.Router();
const controller = require('../controllers/payrollController');
const auth = require('../../middleware/auth');

router.get('/my',              auth, controller.getMyPayrolls);
router.get('/report',          auth, controller.getPayrollReport);
router.post('/generate',       auth, controller.generatePayroll);
router.post('/generate-all',   auth, controller.generateAllPayrolls);
router.post('/mark-paid',      auth, controller.markAsPaid);

module.exports = router;
