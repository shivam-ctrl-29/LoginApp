const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const findPayroll = async (userId, month, year) => {
  return prisma.payrollRecord.findUnique({
    where: { userId_month_year: { userId, month, year } },
    include: { user: { select: { id: true, name: true, email: true } }, salarySlip: true }
  });
};

const findAllPayrolls = async (month, year) => {
  return prisma.payrollRecord.findMany({
    where: { month, year },
    include: { user: { select: { id: true, name: true, email: true } }, salarySlip: true },
    orderBy: { netSalary: 'desc' }
  });
};

const createPayroll = async (data) => {
  return prisma.payrollRecord.create({
    data,
    include: { user: { select: { id: true, name: true, email: true } } }
  });
};

const updatePayroll = async (id, data) => {
  return prisma.payrollRecord.update({ where: { id }, data });
};

const createSalarySlip = async (payrollRecordId, slipNumber) => {
  return prisma.salarySlip.create({ data: { payrollRecordId, slipNumber } });
};

const findUserPayrolls = async (userId) => {
  return prisma.payrollRecord.findMany({
    where: { userId },
    include: { salarySlip: true },
    orderBy: [{ year: 'desc' }, { month: 'desc' }]
  });
};

module.exports = {
  findPayroll,
  findAllPayrolls,
  createPayroll,
  updatePayroll,
  createSalarySlip,
  findUserPayrolls
};
