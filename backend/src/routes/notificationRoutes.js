const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');
const verifyToken = require('../../middleware/auth');

router.get('/', verifyToken, controller.getMyNotifications);
router.put('/:id/read', verifyToken, controller.markAsRead);
router.put('/read-all', verifyToken, controller.markAllAsRead);
router.delete('/:id', verifyToken, controller.deleteNotification);

module.exports = router;
