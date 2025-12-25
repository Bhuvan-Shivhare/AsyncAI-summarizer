const express = require('express');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const queue = require('../lib/queue');

const router = express.Router();

/**
 * Generate a deterministic hash for input content
 * Same input always produces the same hash for idempotency
 */
function generateInputHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Validate and normalize request body
 * Returns { valid: boolean, error?: string, inputType?: string, input?: string }
 */
function validateInput(body) {
  const { url, text } = body;

  // Check if both are provided
  if (url !== undefined && text !== undefined) {
    return { valid: false, error: 'Cannot provide both url and text. Provide exactly one.' };
  }

  // Check if neither is provided
  if (url === undefined && text === undefined) {
    return { valid: false, error: 'Either url or text must be provided.' };
  }

  // Validate url
  if (url !== undefined) {
    const trimmedUrl = typeof url === 'string' ? url.trim() : '';
    if (!trimmedUrl) {
      return { valid: false, error: 'url cannot be empty or contain only whitespace.' };
    }
    return { valid: true, inputType: 'url', input: trimmedUrl };
  }

  // Validate text
  if (text !== undefined) {
    const trimmedText = typeof text === 'string' ? text.trim() : '';
    if (!trimmedText) {
      return { valid: false, error: 'text cannot be empty or contain only whitespace.' };
    }
    return { valid: true, inputType: 'text', input: trimmedText };
  }

  return { valid: false, error: 'Either url or text must be provided.' };
}

/**
 * POST /submit
 * Creates a new summarization job
 */
router.post('/', async (req, res) => {
  try {
    // Validate input
    const validation = validateInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { inputType, input } = validation;

    // Generate input hash for idempotency
    const inputHash = generateInputHash(input);

    // Create job record
    const jobData = {
      inputType,
      inputHash,
      status: 'queued',
    };

    // Set the appropriate input field based on type
    if (inputType === 'url') {
      jobData.originalUrl = input;
    } else {
      jobData.originalText = input;
    }

    const job = await prisma.job.create({
      data: jobData,
    });

    // Add job to BullMQ queue for processing
    try {
      await queue.add('process-summary', {
        jobId: job.id,
      });
      console.log(`[API] Job ${job.id} added to queue`);
    } catch (error) {
      // Log error but don't fail the request
      // Job is already in DB, worker can pick it up later
      console.error('[API] Failed to add job to queue:', error.message);
    }

    // Return job ID and status
    res.status(201).json({
      jobId: job.id,
      status: job.status,
    });
  } catch (error) {
    // Log error for debugging (in production, use proper logging)
    console.error('Error creating job:', error);

    // Return generic error to client
    res.status(500).json({ error: 'Failed to create job. Please try again.' });
  }
});

module.exports = router;

