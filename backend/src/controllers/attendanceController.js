const service = require('../services/attendanceService');

const checkIn = async (req, res, next) => {
  try {
    const result = await service.checkIn(req.user.id);
    res.json({ success: true, message: `Checked in successfully! Status: ${result.status}`, ...result });
  } catch (err) { next(err); }
};

const checkOut = async (req, res, next) => {
  try {
    const result = await service.checkOut(req.user.id);
    res.json({ success: true, message: `Checked out! Work hours: ${result.workHours}hrs`, ...result });
  } catch (err) { next(err); }
};

const getMyAttendance = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const result = await service.getMyAttendance(req.user.id, parseInt(month), parseInt(year));
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getTodayStatus = async (req, res, next) => {
  try {
    const result = await service.getTodayStatus(req.user.id);
    res.json({ success: true, attendance: result });
  } catch (err) { next(err); }
};

const getAllAttendance = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const result = await service.getAllAttendance(parseInt(month), parseInt(year));
    res.json({ success: true, attendance: result });
  } catch (err) { next(err); }
};

module.exports = { checkIn, checkOut, getMyAttendance, getTodayStatus, getAllAttendance };
