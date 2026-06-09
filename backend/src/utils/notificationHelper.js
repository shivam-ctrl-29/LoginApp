const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createNotification = async ({ userId, title, message }) => {
  try {
    await prisma.notification.create({
      data: { userId, title, message },
    });
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
};

module.exports = createNotification;
