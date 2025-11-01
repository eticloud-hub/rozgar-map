const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDB } = require('../config/database');
const { writeLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');

const router = express.Router();

// POST /api/v1/report - Submit citizen complaint
router.post('/', writeLimiter, [
  body('message').trim().isLength({ min: 10, max: 500 }).withMessage('Message must be 10-500 chars'),
  body('district_id').optional().isInt({ min: 1 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = getDB();
    const { message, district_id } = req.body;
    const ip = req.ip;
    const userAgent = req.get('user-agent');

    const stmt = db.prepare(`
      INSERT INTO citizen_reports (district_id, message, ip_address, user_agent, status)
      VALUES (?, ?, ?, ?, 'pending')
    `);

    const result = stmt.run(district_id || null, message, ip, userAgent);

    logger.info(`📝 New citizen report submitted by ${ip}`);

    res.status(201).json({
      id: result.lastInsertRowid,
      status: 'submitted',
      message: 'Thank you for your report. We will review it shortly.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error submitting report:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

module.exports = router;
