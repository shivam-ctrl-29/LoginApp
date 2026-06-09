const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const auditLogger = async ({ tableName, actionType, recordId, oldData = null, newData = null, performedBy }) => {
  try {
    await prisma.auditLog.create({
      data: {
        tableName,
        actionType,
        recordId,
        oldData,
        newData,
        performedBy,
      },
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};

module.exports = auditLogger;
