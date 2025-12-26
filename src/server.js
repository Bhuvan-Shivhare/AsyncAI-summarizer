require('dotenv').config();

const app = require('./app');
const { ensureConnected } = require('./lib/redis');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Ensure Redis is connected for caching info
    await ensureConnected();
    console.log('[Server] Redis connection established');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Server] Failed to connect to Redis:', err.message);
    // Continue even if Redis fails, but log it
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (Redis unavailable)`);
    });
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

