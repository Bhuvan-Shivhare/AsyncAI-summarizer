const prisma = require('./prisma');

/**
 * Checks database connectivity without querying any tables.
 * This is a safe connection test that works even with an empty schema.
 */
async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

module.exports = {
  checkDatabaseConnection,
};

