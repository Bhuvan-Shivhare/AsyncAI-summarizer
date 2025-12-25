const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

let isConnected = false;

redisClient.on('error', (err) => {
  console.error('[Redis] Client Error:', err.message);
  isConnected = false;
});

redisClient.on('connect', () => {
  console.log('[Redis] Connecting...');
});

redisClient.on('ready', () => {
  console.log('Redis connected');
  isConnected = true;
});

redisClient.on('end', () => {
  console.log('[Redis] Connection ended');
  isConnected = false;
});

// Lazy connection - connect when first used
async function ensureConnected() {
  if (!isConnected && !redisClient.isOpen) {
    try {
      await redisClient.connect();
    } catch (error) {
      console.error('[Redis] Failed to connect:', error.message);
      isConnected = false;
    }
  }
  return isConnected || redisClient.isOpen;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
});

module.exports = { redisClient, ensureConnected };
