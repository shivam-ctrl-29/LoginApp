const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const findTodayAttendance = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return prisma.attendance.findFirst({
    where: { userId, date: { gte: today, lt: tomorrow } }
  });
};

const createAttendance = async (data) => {
  return prisma.attendance.create({ data });
};

const updateAttendance = async (id, data) => {
  return prisma.attendance.update({ where: { id }, data });
};

const findMonthlyAttendance = async (userId, month, year) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return prisma.attendance.findMany({
    where: { userId, date: { gte: start, lt: end } },
    orderBy: { date: 'asc' }
  });
};

const findAllAttendanceByDate = async (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return prisma.attendance.findMany({
    where: { date: { gte: start, lt: end } },
    include: { user: { select: { id: true, name: true, email: true } } }
  });
};

const findAllMonthlyAttendance = async (month, year) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return prisma.attendance.findMany({
    where: { date: { gte: start, lt: end } },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { date: 'asc' }
  });
};

const getAttendanceSummary = async (userId, month, year) => {
  const records = await findMonthlyAttendance(userId, month, year);
  const present = records.filter(r => r.status === 'present').length;
  const late = records.filter(r => r.status === 'late').length;
  const absent = records.filter(r => r.status === 'absent').length;
  return {
    present,
    late,
    absent,
    totalPresent: present + late, // late counts as present
    total: records.length,
    records
  };
};

module.exports = {
  findTodayAttendance,
  createAttendance,
  updateAttendance,
  findMonthlyAttendance,
  findAllAttendanceByDate,
  findAllMonthlyAttendance,
  getAttendanceSummary
};
