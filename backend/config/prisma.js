const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error'],
});

async function connectDB() {
  try {
    await prisma.$connect();
    console.log('Prisma connected successfully!');
  } catch (err) {
    console.error('Prisma connection error:', err.message);
  }
}

connectDB();

module.exports = prisma;