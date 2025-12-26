const express = require('express');
const { query } = require('../lib/pg');

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
 * GET /status/:jobId
 * Fetches the status of a job by its ID
 */
router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    // Validate UUID format
    if (!isValidUUID(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format. Must be a valid UUID.' });
    }

    // Fetch job from database
    const sql = `
      SELECT id, status, "isCacheHit", "createdAt", "updatedAt"
      FROM jobs
      WHERE id = $1
    `;
    const result = await query(sql, [jobId]);
    const job = result.rows[0];

    // Check if job exists
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Return job status
    res.status(200).json({
      jobId: job.id,
      status: job.status,
      isCacheHit: job.isCacheHit,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    });
  } catch (error) {
    // Log error for debugging (in production, use proper logging)
    console.error('Error fetching job status:', error);

    // Return generic error to client
    res.status(500).json({ error: 'Failed to fetch job status. Please try again.' });
  }
});

module.exports = router;

