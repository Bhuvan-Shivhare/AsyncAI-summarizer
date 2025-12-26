const { query } = require('./pg');

/**
 * Checks database connectivity without querying any tables.
 */
async function checkDatabaseConnection() {
  try {
    await query('SELECT 1');
    return { connected: true };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

module.exports = {
  checkDatabaseConnection,
};

