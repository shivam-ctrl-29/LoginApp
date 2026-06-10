const Joi = require('joi');

const createAssetSchema = Joi.object({
  assetCode: Joi.string().max(50).required(),
  assetName: Joi.string().min(2).max(100).required(),
  assetType: Joi.string().valid('laptop', 'mobile', 'tablet', 'monitor', 'keyboard', 'mouse', 'other').required(),
  purchaseDate: Joi.date().optional(),
  purchaseCost: Joi.number().min(0).optional(),
  status: Joi.string().valid('available', 'allocated', 'returned', 'damaged', 'lost').default('available')
});

const updateAssetSchema = Joi.object({
  assetName: Joi.string().min(2).max(100).optional(),
  assetType: Joi.string().valid('laptop', 'mobile', 'tablet', 'monitor', 'keyboard', 'mouse', 'other').optional(),
  purchaseDate: Joi.date().optional(),
  purchaseCost: Joi.number().min(0).optional(),
  status: Joi.string().valid('available', 'allocated', 'returned', 'damaged', 'lost').optional()
});

const allocateAssetSchema = Joi.object({
  employeeId: Joi.number().integer().required(),
  assetId: Joi.number().integer().required(),
  remarks: Joi.string().max(500).optional()
});

module.exports = { createAssetSchema, updateAssetSchema, allocateAssetSchema };
