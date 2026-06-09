const service = require('../services/assetService');

const getAllAssets = async (req, res, next) => {
  try {
    const result = await service.getAllAssets(req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getAssetById = async (req, res, next) => {
  try {
    const asset = await service.getAssetById(req.params.id);
    res.json({ success: true, asset });
  } catch (err) { next(err); }
};

const createAsset = async (req, res, next) => {
  try {
    const asset = await service.createAsset(req.body, req.user.id);
    res.status(201).json({ success: true, asset });
  } catch (err) { next(err); }
};

const updateAsset = async (req, res, next) => {
  try {
    const asset = await service.updateAsset(req.params.id, req.body, req.user.id);
    res.json({ success: true, asset });
  } catch (err) { next(err); }
};

const deleteAsset = async (req, res, next) => {
  try {
    await service.deleteAsset(req.params.id, req.user.id);
    res.json({ success: true, message: 'Asset deleted' });
  } catch (err) { next(err); }
};

const allocateAsset = async (req, res, next) => {
  try {
    const { assetId, employeeId } = req.body;
    const allocation = await service.allocateAsset({ assetId, employeeId, allocatedById: req.user.id });
    res.json({ success: true, allocation });
  } catch (err) { next(err); }
};

const returnAsset = async (req, res, next) => {
  try {
    const { assetId, employeeId } = req.body;
    await service.returnAsset({ assetId, employeeId, returnedById: req.user.id });
    res.json({ success: true, message: 'Asset returned successfully' });
  } catch (err) { next(err); }
};

module.exports = { getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset, allocateAsset, returnAsset };
