const repo = require('../repositories/attendanceRepository');
const createNotification = require('../utils/notificationHelper');

const LATE_HOUR = 10;
const LATE_MINUTE = 15;

const checkIn = async (userId) => {
  const existing = await repo.findTodayAttendance(userId);
  if (existing && existing.checkIn) {
    throw { statusCode: 400, message: 'Already checked in today' };
  }

  const now = new Date();
  const isLate = now.getHours() > LATE_HOUR || 
    (now.getHours() === LATE_HOUR && now.getMinutes() > LATE_MINUTE);
  const status = isLate ? 'late' : 'present';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let attendance;
  if (existing) {
    attendance = await repo.updateAttendance(existing.id, { checkIn: now, status });
  } else {
    attendance = await repo.createAttendance({
      userId,
      date: today,
      checkIn: now,
      status
    });
  }

  if (isLate) {
    await createNotification({
      userId,
      title: 'Late Check-in Recorded',
      message: `You checked in at ${now.toLocaleTimeString()}. This will be marked as late.`,
    });
  }

  return { attendance, status, checkInTime: now };
};

const checkOut = async (userId) => {
  const existing = await repo.findTodayAttendance(userId);
  if (!existing || !existing.checkIn) {
    throw { statusCode: 400, message: 'No check-in found for today' };
  }
  if (existing.checkOut) {
    throw { statusCode: 400, message: 'Already checked out today' };
  }

  const now = new Date();
  const workHours = (now - existing.checkIn) / (1000 * 60 * 60);

  const attendance = await repo.updateAttendance(existing.id, {
    checkOut: now,
    workHours: parseFloat(workHours.toFixed(2))
  });

  return { attendance, checkOutTime: now, workHours };
};

const getMyAttendance = async (userId, month, year) => {
  const m = month || new Date().getMonth() + 1;
  const y = year || new Date().getFullYear();
  return repo.getAttendanceSummary(userId, m, y);
};

const getTodayStatus = async (userId) => {
  const attendance = await repo.findTodayAttendance(userId);
  return attendance || { status: 'not_checked_in', checkIn: null, checkOut: null };
};

const getAllAttendance = async (month, year) => {
  const m = month || new Date().getMonth() + 1;
  const y = year || new Date().getFullYear();
  return repo.findAllMonthlyAttendance(m, y);
};

module.exports = { checkIn, checkOut, getMyAttendance, getTodayStatus, getAllAttendance };
