const Joi = require('joi');

const applyLeaveSchema = Joi.object({
  leaveTypeId: Joi.number().integer().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required().messages({
    'date.min': 'End date must be after or equal to start date'
  }),
  reason: Joi.string().min(10).max(500).required().messages({
    'string.min': 'Reason must be at least 10 characters'
  })
});

const approveLeaveSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').optional(),
  action: Joi.string().valid('approved', 'rejected').optional(),
  comments: Joi.string().max(500).optional(),
  remarks: Joi.string().max(500).optional()
}).or('status', 'action');

module.exports = { applyLeaveSchema, approveLeaveSchema };
