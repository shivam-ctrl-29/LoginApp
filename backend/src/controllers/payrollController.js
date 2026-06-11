const service = require('../services/payrollService');

const generatePayroll = async (req, res, next) => {
  try {
    const { userId, month, year } = req.body;
    const result = await service.generatePayroll(parseInt(userId), parseInt(month), parseInt(year));
    res.json({ success: true, payroll: result });
  } catch (err) { next(err); }
};

const generateAllPayrolls = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    const results = await service.generateAllPayrolls(parseInt(month), parseInt(year));
    res.json({ success: true, results });
  } catch (err) { next(err); }
};

const getPayrollReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const result = await service.getPayrollReport(parseInt(month), parseInt(year));
    res.json({ success: true, payrolls: result });
  } catch (err) { next(err); }
};

const getMyPayrolls = async (req, res, next) => {
  try {
    const result = await service.getMyPayrolls(req.user.id);
    res.json({ success: true, payrolls: result });
  } catch (err) { next(err); }
};

const markAsPaid = async (req, res, next) => {
  try {
    const { userId, month, year } = req.body;
    const result = await service.markAsPaid(parseInt(userId), parseInt(month), parseInt(year));
    res.json({ success: true, payroll: result });
  } catch (err) { next(err); }
};

module.exports = { generatePayroll, generateAllPayrolls, getPayrollReport, getMyPayrolls, markAsPaid };
