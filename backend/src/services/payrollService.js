const repo = require('../repositories/payrollRepository');
const attendanceRepo = require('../repositories/attendanceRepository');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const WORKING_DAYS = 26;
const PF_RATE = 0.12;
const ESIC_RATE = 0.0075;
const BASIC_RATE = 0.4; // Basic = 40% of gross

const generatePayroll = async (userId, month, year) => {
  // Get employee profile
  const profile = await prisma.employeeProfile.findUnique({
    where: { userId },
    include: { user: { select: { id: true, name: true, email: true } } }
  });
  if (!profile) throw { statusCode: 404, message: 'Employee profile not found' };
  if (!profile.salary) throw { statusCode: 400, message: 'Employee salary not set' };

  // Get attendance summary
  const summary = await attendanceRepo.getAttendanceSummary(userId, month, year);
  const grossSalary = profile.salary;
  const perDaySalary = grossSalary / WORKING_DAYS;

  // Calculate deductions
  const absentDays = summary.absent;
  const lateDays = summary.late;
  const presentDays = summary.present;

  const absentDeduction = perDaySalary * absentDays;
  const lateDeduction = (perDaySalary * 0.5) * lateDays;
  const basicSalary = grossSalary * BASIC_RATE;
  const pfDeduction = basicSalary * PF_RATE;
  const esicDeduction = grossSalary * ESIC_RATE;
  const totalDeductions = absentDeduction + lateDeduction + pfDeduction + esicDeduction;
  const netSalary = grossSalary - totalDeductions;

  // Check if payroll already exists
  const existing = await repo.findPayroll(userId, month, year);
  if (existing) {
    const updated = await repo.updatePayroll(existing.id, {
      grossSalary, presentDays, absentDays, lateDays,
      absentDeduction, lateDeduction, pfDeduction, esicDeduction,
      totalDeductions, netSalary: Math.max(0, netSalary), status: 'generated'
    });
    return updated;
  }

  const payroll = await repo.createPayroll({
    userId, month, year, grossSalary,
    workingDays: WORKING_DAYS,
    presentDays, absentDays, lateDays,
    absentDeduction, lateDeduction, pfDeduction, esicDeduction,
    totalDeductions, netSalary: Math.max(0, netSalary), status: 'generated'
  });

  // Generate slip number
  const slipNumber = `SLIP-${year}${String(month).padStart(2, '0')}-${String(userId).padStart(4, '0')}`;
  await repo.createSalarySlip(payroll.id, slipNumber);

  return payroll;
};

const generateAllPayrolls = async (month, year) => {
  const profiles = await prisma.employeeProfile.findMany({
    where: { salary: { not: null } },
    include: { user: true }
  });

  const results = [];
  for (const profile of profiles) {
    try {
      const payroll = await generatePayroll(profile.userId, month, year);
      results.push({ success: true, userId: profile.userId, name: profile.user.name, payroll });
    } catch (err) {
      results.push({ success: false, userId: profile.userId, name: profile.user.name, error: err.message });
    }
  }
  return results;
};

const getPayrollReport = async (month, year) => {
  return repo.findAllPayrolls(month, year);
};

const getMyPayrolls = async (userId) => {
  return repo.findUserPayrolls(userId);
};

const markAsPaid = async (userId, month, year) => {
  const payroll = await repo.findPayroll(userId, month, year);
  if (!payroll) throw { statusCode: 404, message: 'Payroll not found' };
  return repo.updatePayroll(payroll.id, { status: 'paid', paidAt: new Date() });
};

module.exports = { generatePayroll, generateAllPayrolls, getPayrollReport, getMyPayrolls, markAsPaid };
