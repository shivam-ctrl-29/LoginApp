const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── Job 1: Daily Notification Cleanup (runs every day at midnight) ───
// Deletes read notifications older than 30 days
cron.schedule('0 0 * * *', async () => {
  console.log('[CRON] Running notification cleanup...');
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const deleted = await prisma.notification.deleteMany({
      where: { isRead: true, createdAt: { lt: thirtyDaysAgo } }
    });
    console.log(`[CRON] Notification cleanup done. Deleted: ${deleted.count}`);
  } catch (err) {
    console.error('[CRON] Notification cleanup failed:', err.message);
  }
});

// ─── Job 2: Daily Leave Report (runs every day at 8am) ───
// Logs a summary of pending leaves
cron.schedule('0 8 * * *', async () => {
  console.log('[CRON] Running daily leave report...');
  try {
    const [pending, approved, rejected] = await Promise.all([
      prisma.leaveRequest.count({ where: { status: 'pending' } }),
      prisma.leaveRequest.count({ where: { status: 'approved' } }),
      prisma.leaveRequest.count({ where: { status: 'rejected' } }),
    ]);
    console.log(`[CRON] Leave Report — Pending: ${pending} | Approved: ${approved} | Rejected: ${rejected}`);
  } catch (err) {
    console.error('[CRON] Leave report failed:', err.message);
  }
});

// ─── Job 3: Daily Audit Log Cleanup (runs every Sunday at 1am) ───
// Deletes audit logs older than 90 days
cron.schedule('0 1 * * 0', async () => {
  console.log('[CRON] Running audit log cleanup...');
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const deleted = await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: ninetyDaysAgo } }
    });
    console.log(`[CRON] Audit log cleanup done. Deleted: ${deleted.count}`);
  } catch (err) {
    console.error('[CRON] Audit log cleanup failed:', err.message);
  }
});

console.log('[CRON] All background jobs scheduled.');
