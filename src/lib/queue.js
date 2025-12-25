const { Queue } = require('bullmq');

// Queue name for job processing
const QUEUE_NAME = 'summarization-jobs';

// Create BullMQ queue instance
// Uses Redis connection from environment variables
const queue = new Queue(QUEUE_NAME, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
  },
});

// Log queue events
queue.on('error', (error) => {
  console.error('[Queue] Error:', error.message);
});

module.exports = queue;

