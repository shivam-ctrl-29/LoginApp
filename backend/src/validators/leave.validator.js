const Joi = require('joi');

const applyLeaveSchema = Joi.object({
  leaveTypeId: Joi.number().integer().optional(),
  leave_type_id: Joi.alternatives().try(Joi.number().integer(), Joi.string()).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  from_date: Joi.alternatives().try(Joi.date(), Joi.string()).optional(),
  to_date: Joi.alternatives().try(Joi.date(), Joi.string()).optional(),
  reason: Joi.string().min(3).max(500).required(),
}).unknown(true);

const approveLeaveSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').optional(),
  action: Joi.string().valid('approved', 'rejected').optional(),
  comments: Joi.string().max(500).optional().allow('', null),
  remarks: Joi.string().max(500).optional().allow('', null),
}).unknown(true);

module.exports = { applyLeaveSchema, approveLeaveSchema };
