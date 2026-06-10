const Joi = require('joi');

const createEmployeeSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid('admin', 'manager', 'hr', 'employee').default('employee'),
  departmentId: Joi.number().integer().optional(),
  department_id: Joi.number().integer().optional(),
  designation: Joi.string().max(100).optional().allow('', null),
  phone: Joi.string().optional().allow('', null),
  address: Joi.string().max(255).optional().allow('', null),
  salary: Joi.alternatives().try(Joi.number().min(0), Joi.string()).optional().allow('', null),
  joiningDate: Joi.date().optional().allow('', null),
  joining_date: Joi.date().optional().allow('', null),
  skills: Joi.array().items(Joi.string()).optional(),
  skill_ids: Joi.alternatives().try(Joi.array(), Joi.string(), Joi.number()).optional().allow('', null),
}).unknown(true);

const updateEmployeeSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  departmentId: Joi.number().integer().optional(),
  department_id: Joi.number().integer().optional(),
  designation: Joi.string().max(100).optional().allow('', null),
  phone: Joi.string().optional().allow('', null),
  address: Joi.string().max(255).optional().allow('', null),
  salary: Joi.alternatives().try(Joi.number().min(0), Joi.string()).optional().allow('', null),
  joiningDate: Joi.date().optional().allow('', null),
  joining_date: Joi.date().optional().allow('', null),
  skills: Joi.array().items(Joi.string()).optional(),
  skill_ids: Joi.alternatives().try(Joi.array(), Joi.string(), Joi.number()).optional().allow('', null),
}).unknown(true);

module.exports = { createEmployeeSchema, updateEmployeeSchema };
