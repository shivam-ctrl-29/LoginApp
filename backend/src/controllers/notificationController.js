const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });
    res.json({ success: true, notifications, unreadCount });
  } catch (err) { next(err); }
};

const markAsRead = async (req, res, next) => {
  try {
    await prisma.notification.update({
      where: { id: parseInt(req.params.id) },
      data: { isRead: true },
    });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) { next(err); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

const deleteNotification = async (req, res, next) => {
  try {
    await prisma.notification.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) { next(err); }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead, deleteNotification };
