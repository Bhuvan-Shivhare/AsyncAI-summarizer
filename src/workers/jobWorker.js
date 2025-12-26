require('dotenv').config();
const { Worker } = require('bullmq');
const { query, pool } = require('../lib/pg');
const redisClient = require('../lib/redis');
const { connection, QUEUE_NAME } = require('../lib/queue');
const { ensureConnected } = require('../lib/redis');
const { summarizeTextWithLLM } = require('../lib/llm');
const { fetchURLContent } = require('../lib/urlFetcher');


console.log('[Worker] Initializing BullMQ worker...');

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { jobId } = job.data;
    console.log(`[Worker] Picked job from queue: ${jobId}`);

    try {
      // Ensure Redis is connected
      await ensureConnected();

      // Fetch job details from DB
      const result = await query(`SELECT * FROM jobs WHERE id = $1`, [jobId]);
      const dbJob = result.rows[0];

      if (!dbJob) {
        console.error(`[Worker] Job ${jobId} not found in database`);
        return;
      }

      // 1. Redis Cache HIT logic
      try {
        const cachedSummary = await redisClient.get(dbJob.inputHash);
        if (cachedSummary) {
          console.log(`[Worker] Cache HIT for job ${jobId}`);
          await query(
            `UPDATE jobs SET status = 'completed', summary = $1, "isCacheHit" = TRUE, "updatedAt" = NOW() WHERE id = $2`,
            [cachedSummary, jobId]
          );
          return;
        }
      } catch (redisErr) {
        console.error(`[Worker] Redis cache check failed: ${redisErr.message}`);
        // Continue even if Redis fails (process the job normally)
      }

      // 2. Redis Cache MISS logic
      console.log(`[Worker] Cache MISS for job ${jobId}`);

      // Mark job as processing
      await query(
        `UPDATE jobs SET status = 'processing', "updatedAt" = NOW() WHERE id = $1`,
        [jobId]
      );

      // Generate summary using LLM
      let summary;
      if (dbJob.inputType === 'text') {
        summary = await summarizeTextWithLLM(dbJob.originalText);
      } else {
        // Fetch URL content and extract text
        const extractedText = await fetchURLContent(dbJob.originalUrl);
        // Summarize the extracted content
        summary = await summarizeTextWithLLM(extractedText);
      }

      // Save to Redis cache (expire in 1 hour)
      try {
        await redisClient.set(dbJob.inputHash, summary, { EX: 3600 });
      } catch (redisErr) {
        console.error(`[Worker] Failed to save to Redis: ${redisErr.message}`);
      }

      // Mark as completed in DB
      await query(
        `UPDATE jobs SET status = 'completed', summary = $1, "isCacheHit" = FALSE, "updatedAt" = NOW() WHERE id = $2`,
        [summary, jobId]
      );

      console.log(`[Worker] Job ${jobId} completed`);
    } catch (err) {
      console.error(`[Worker] Job ${jobId} failed:`, err.message);

      // Gracefully handle failure and update DB
      try {
        await query(
          `UPDATE jobs SET status = 'failed', "errorMessage" = $1, "updatedAt" = NOW() WHERE id = $2`,
          [err.message, jobId]
        );
      } catch (dbErr) {
        console.error(`[Worker] Failed to update job status to failed: ${dbErr.message}`);
      }
    }
  },
  {
    connection,
    concurrency: 1, // Process jobs one by one
  }
);

// Worker event handlers
worker.on('ready', () => {
  console.log('[Worker] Worker started and listening for jobs');
});

worker.on('error', (err) => {
  console.error('[Worker] Worker error:', err.message);
});

worker.on('failed', (job, err) => {
  if (job) {
    console.error(`[Worker] Job ${job.id} failed in queue:`, err.message);
  }
});

// Graceful shutdown
const shutdown = async () => {
  console.log('[Worker] Shutting down...');
  try {
    await worker.close();
    await pool.end(); // Close PG pool
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
    console.log('[Worker] Shutdown complete');
    process.exit(0);
  } catch (err) {
    console.error('[Worker] Error during shutdown:', err.message);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
