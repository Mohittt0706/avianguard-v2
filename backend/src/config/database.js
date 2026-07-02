const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
});

prisma.$on('error', (e) => {
  console.error('Prisma error:', e);
});

module.exports = prisma;
