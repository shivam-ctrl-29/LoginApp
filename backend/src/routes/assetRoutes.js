const express = require('express');
const router = express.Router();
const controller = require('../controllers/assetController');
const verifyToken = require('../../middleware/auth');
const validate = require('../middleware/validate');
const { createAssetSchema, updateAssetSchema, allocateAssetSchema } = require('../validators/asset.validator');

router.get('/',          verifyToken, controller.getAllAssets);
router.get('/:id',       verifyToken, controller.getAssetById);
router.post('/',         verifyToken, validate(createAssetSchema), controller.createAsset);
router.put('/:id',       verifyToken, validate(updateAssetSchema), controller.updateAsset);
router.delete('/:id',    verifyToken, controller.deleteAsset);
router.post('/allocate', verifyToken, validate(allocateAssetSchema), controller.allocateAsset);
router.post('/return',   verifyToken, controller.returnAsset);

module.exports = router;
