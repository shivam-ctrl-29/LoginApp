const Joi = require('joi');

const createAssetSchema = Joi.object({
  assetCode: Joi.string().max(50).required(),
  assetName: Joi.string().min(2).max(100).required(),
  assetType: Joi.string().required(),
  purchaseDate: Joi.alternatives().try(Joi.date(), Joi.string()).optional().allow('', null),
  purchaseCost: Joi.alternatives().try(Joi.number().min(0), Joi.string()).optional().allow('', null),
  status: Joi.string().valid('available', 'allocated', 'returned', 'damaged', 'lost').default('available'),
}).unknown(true);

const updateAssetSchema = Joi.object({
  assetCode: Joi.string().max(50).optional(),
  assetName: Joi.string().min(2).max(100).optional(),
  assetType: Joi.string().optional(),
  purchaseDate: Joi.alternatives().try(Joi.date(), Joi.string()).optional().allow('', null),
  purchaseCost: Joi.alternatives().try(Joi.number().min(0), Joi.string()).optional().allow('', null),
  status: Joi.string().valid('available', 'allocated', 'returned', 'damaged', 'lost').optional(),
}).unknown(true);

const allocateAssetSchema = Joi.object({
  employeeId: Joi.alternatives().try(Joi.number().integer(), Joi.string()).required(),
  assetId: Joi.alternatives().try(Joi.number().integer(), Joi.string()).required(),
  remarks: Joi.string().max(500).optional().allow('', null),
}).unknown(true);

module.exports = { createAssetSchema, updateAssetSchema, allocateAssetSchema };
