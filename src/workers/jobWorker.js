require('dotenv').config();
const { Worker } = require('bullmq');
const { redisClient, ensureConnected } = require('../lib/redis');
const prisma = require('../lib/prisma');

const QUEUE_NAME = 'summarization-jobs';
const PROCESSING_DELAY_MS = 2000; // Simulate 2 seconds of AI processing
const CACHE_TTL_SECONDS = 3600; // Cache for 1 hour
const CACHE_KEY_PREFIX = 'summary:'; // Redis key prefix

/**
 * Simulate summarization for text input
 * Returns first ~20 words as a summary
 */
function summarizeText(text) {
  const words = text.trim().split(/\s+/);
  const summaryWords = words.slice(0, 20);
  return summaryWords.join(' ') + (words.length > 20 ? '...' : '');
}

/**
 * Simulate summarization for URL input
 * Returns a placeholder summary
 */
function summarizeUrl(url) {
  return `Summary of content from ${url}: This is a placeholder summary generated for demonstration purposes.`;
}

/**
 * Get cache key from inputHash
 */
function getCacheKey(inputHash) {
  return `${CACHE_KEY_PREFIX}${inputHash}`;
}

/**
 * Check Redis cache for existing summary
 * Returns summary if found, null otherwise
 */
async function getCachedSummary(inputHash) {
  try {
    const connected = await ensureConnected();
    if (!connected) {
      return null;
    }

    const cacheKey = getCacheKey(inputHash);
    const cachedSummary = await redisClient.get(cacheKey);
    
    if (cachedSummary) {
      console.log(`[Worker] Cache HIT for inputHash: ${inputHash.substring(0, 8)}...`);
      return cachedSummary;
    }
    
    console.log(`[Worker] Cache MISS for inputHash: ${inputHash.substring(0, 8)}...`);
    return null;
  } catch (error) {
    // Redis failure should not crash the worker
    console.error('[Worker] Redis cache read error (continuing without cache):', error.message);
    return null;
  }
}

/**
 * Store summary in Redis cache
 */
async function setCachedSummary(inputHash, summary) {
  try {
    const connected = await ensureConnected();
    if (!connected) {
      return;
    }

    const cacheKey = getCacheKey(inputHash);
    await redisClient.setEx(cacheKey, CACHE_TTL_SECONDS, summary);
    console.log(`[Worker] Cached summary for inputHash: ${inputHash.substring(0, 8)}... (TTL: ${CACHE_TTL_SECONDS}s)`);
  } catch (error) {
    // Redis failure should not crash the worker
    console.error('[Worker] Redis cache write error (continuing without cache):', error.message);
  }
}

/**
 * Process a single job: generate summary and update database
 */
async function processJob(job) {
  try {
    console.log(`[Worker] Processing job ${job.id} (${job.inputType})`);

    let summary;

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, PROCESSING_DELAY_MS));

    // Generate summary based on input type
    if (job.inputType === 'text') {
      if (!job.originalText) {
        throw new Error('Missing originalText for text input type');
      }
      summary = summarizeText(job.originalText);
    } else if (job.inputType === 'url') {
      if (!job.originalUrl) {
        throw new Error('Missing originalUrl for url input type');
      }
      summary = summarizeUrl(job.originalUrl);
    } else {
      throw new Error(`Unknown input type: ${job.inputType}`);
    }

    // Update job with summary and mark as completed
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: 'completed',
        summary: summary,
      },
    });

    // Store summary in cache for future use
    if (job.inputHash) {
      await setCachedSummary(job.inputHash, summary);
    }

    console.log(`[Worker] Job ${job.id} completed successfully`);
  } catch (error) {
    console.error(`[Worker] Error processing job ${job.id}:`, error.message);

    // Update job with error and mark as failed
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: 'failed',
        errorMessage: error.message || 'Unknown error occurred during processing',
      },
    });

    console.log(`[Worker] Job ${job.id} marked as failed`);
    throw error; // Re-throw so BullMQ can handle retries if needed
  }
}

/**
 * Start the BullMQ worker
 */
async function startWorker() {
  // Connect to Redis first
  try {
    await ensureConnected();
  } catch (error) {
    console.error('[Worker] Redis connection failed, continuing without cache:', error.message);
  }

  console.log('[Worker] Starting background job worker...');

  // Create BullMQ Worker
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { jobId } = job.data;
      
      console.log(`[Worker] Processing job ${jobId} from queue`);

      // Fetch job from database
      const dbJob = await prisma.job.findUnique({
        where: { id: jobId },
        select: {
          id: true,
          inputType: true,
          inputHash: true,
          originalUrl: true,
          originalText: true,
          status: true,
        },
      });

      if (!dbJob) {
        throw new Error(`Job ${jobId} not found in database`);
      }

      // Update status to "processing"
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'processing',
        },
      });

      // Check cache before processing
      if (dbJob.inputHash) {
        const cachedSummary = await getCachedSummary(dbJob.inputHash);
        
        if (cachedSummary) {
          // Cache hit: use cached summary, skip processing
          console.log(`[Worker] Using cached summary for job ${jobId}`);
          
          await prisma.job.update({
            where: { id: jobId },
            data: {
              status: 'completed',
              summary: cachedSummary,
            },
          });
          
          console.log(`[Worker] Job ${jobId} completed using cache`);
          return;
        }
      }

      // Cache miss: process the job normally
      await processJob(dbJob);
    },
    {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
      },
      concurrency: 1, // Process one job at a time
    }
  );

  // Worker event handlers
  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id || 'unknown'} failed:`, err.message);
    
    // Mark job as failed in database if jobId is available
    if (job?.data?.jobId) {
      prisma.job.update({
        where: { id: job.data.jobId },
        data: {
          status: 'failed',
          errorMessage: err.message || 'Job processing failed',
        },
      }).catch((error) => {
        console.error('[Worker] Failed to update job status:', error.message);
      });
    }
  });

  worker.on('error', (err) => {
    console.error('[Worker] Worker error:', err.message);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('[Worker] Shutting down...');
    await worker.close();
    await prisma.$disconnect();
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
    console.log('[Worker] Disconnected from database and Redis');
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  console.log('[Worker] Worker started and listening for jobs');
}

// Start the worker if this file is run directly
if (require.main === module) {
  startWorker().catch((error) => {
    console.error('[Worker] Failed to start worker:', error);
    process.exit(1);
  });
}

module.exports = { startWorker };
