const Joi = require('joi');

const createEmployeeSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'manager', 'hr', 'employee').default('employee'),
  departmentId: Joi.number().integer().optional(),
  designation: Joi.string().max(100).optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
    'string.pattern.base': 'Phone must be a 10-digit number'
  }),
  address: Joi.string().max(255).optional(),
  salary: Joi.number().min(0).optional(),
  joiningDate: Joi.date().optional(),
  skills: Joi.array().items(Joi.string()).optional()
});

const updateEmployeeSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  departmentId: Joi.number().integer().optional(),
  designation: Joi.string().max(100).optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
    'string.pattern.base': 'Phone must be a 10-digit number'
  }),
  address: Joi.string().max(255).optional(),
  salary: Joi.number().min(0).optional(),
  joiningDate: Joi.date().optional(),
  skills: Joi.array().items(Joi.string()).optional()
});

module.exports = { createEmployeeSchema, updateEmployeeSchema };
