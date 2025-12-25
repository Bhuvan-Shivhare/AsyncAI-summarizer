const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

/**
 * Validate UUID format
 * Returns true if valid UUID, false otherwise
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * GET /result/:jobId
 * Fetches the result of a job by its ID
 * Returns different responses based on job status
 */
router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    // Validate UUID format
    if (!isValidUUID(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format. Must be a valid UUID.' });
    }

    // Fetch job from database
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        status: true,
        summary: true,
        errorMessage: true,
        updatedAt: true,
      },
    });

    // Check if job exists
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Handle response based on job status
    if (job.status === 'queued' || job.status === 'processing') {
      // Job is still being processed
      return res.status(202).json({
        jobId: job.id,
        status: job.status,
        message: 'Job is still being processed',
      });
    }

    if (job.status === 'completed') {
      // Job completed successfully
      return res.status(200).json({
        jobId: job.id,
        status: 'completed',
        summary: job.summary,
        completedAt: job.updatedAt.toISOString(),
      });
    }

    if (job.status === 'failed') {
      // Job failed
      return res.status(200).json({
        jobId: job.id,
        status: 'failed',
        error: job.errorMessage || 'Job processing failed',
      });
    }

    // Fallback for unexpected status (should not happen)
    return res.status(500).json({ error: 'Unexpected job status.' });
  } catch (error) {
    // Log error for debugging (in production, use proper logging)
    console.error('Error fetching job result:', error);

    // Return generic error to client
    res.status(500).json({ error: 'Failed to fetch job result. Please try again.' });
  }
});

module.exports = router;

