const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = createClient({
  url: redisUrl,
});

let isConnected = false;

redisClient.on('error', (err) => {
  console.error('[Redis] Client Error:', err.message);
  isConnected = false;
});

redisClient.on('ready', () => {
  console.log('Redis connected');
  isConnected = true;
});

// Lazy connection helper
async function ensureConnected() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient.isOpen;
}

// Export client directly as requested by worker template
module.exports = redisClient;

// Also attach properties for those who need them
module.exports.ensureConnected = ensureConnected;
