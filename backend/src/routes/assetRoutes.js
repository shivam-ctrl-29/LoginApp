const express = require('express');
const router = express.Router();
const controller = require('../controllers/assetController');
const verifyToken = require('../../middleware/auth');

router.get('/', verifyToken, controller.getAllAssets);
router.get('/:id', verifyToken, controller.getAssetById);
router.post('/', verifyToken, controller.createAsset);
router.put('/:id', verifyToken, controller.updateAsset);
router.delete('/:id', verifyToken, controller.deleteAsset);
router.post('/allocate', verifyToken, controller.allocateAsset);
router.post('/return', verifyToken, controller.returnAsset);

module.exports = router;
