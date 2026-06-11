const express = require('express');
const router = express.Router();
const controller = require('../controllers/attendanceController');
const auth = require('../../middleware/auth');

router.post('/checkin',    auth, controller.checkIn);
router.post('/checkout',   auth, controller.checkOut);
router.get('/today',       auth, controller.getTodayStatus);
router.get('/my',          auth, controller.getMyAttendance);
router.get('/all',         auth, controller.getAllAttendance);

module.exports = router;
