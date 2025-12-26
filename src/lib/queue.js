const { Queue } = require('bullmq');

// Queue name for job processing
const QUEUE_NAME = 'summarization-jobs';

// Connection details for BullMQ
const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
  };

/**
 * Reusable queue instance for adding jobs
 */
const queue = new Queue(QUEUE_NAME, { connection });

// Log queue errors
queue.on('error', (error) => {
  console.error(`[Queue] Global Error: ${error.message}`);
});

module.exports = {
  queue,
  QUEUE_NAME,
  connection,
};
