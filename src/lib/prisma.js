const { PrismaClient } = require('@prisma/client');

// Singleton Prisma Client instance
// This ensures we reuse the same connection pool across the application,
// which is critical for both API routes and background workers in async job processing.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Graceful shutdown: disconnect Prisma Client when the process exits
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;

