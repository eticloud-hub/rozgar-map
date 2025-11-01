const express = require('express');
const { verifyAdminToken } = require('../middleware/auth');
const { writeLimiter } = require('../middleware/rateLimiter');
const { getDB } = require('../config/database');
const { startScheduler } = require('../services/etl/scheduler');
const logger = require('../utils/logger');

const router = express.Router();

// Protect all admin routes
router.use(verifyAdminToken);
router.use(writeLimiter);

// POST /api/v1/admin/run-etl - Manually trigger ETL
router.post('/run-etl', async (req, res) => {
  try {
    logger.info('🚀 Manual ETL trigger by admin');
    
    // Run ETL in background
    startScheduler(); // This will run immediately if called

    res.json({
      status: 'triggered',
      message: 'ETL job started',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error triggering ETL:', error);
    res.status(500).json({ error: 'Failed to trigger ETL' });
  }
});

// GET /api/v1/admin/stats - Statistics
router.get('/stats', (req, res) => {
  try {
    const db = getDB();

    const stats = {
      total_districts: db.prepare('SELECT COUNT(*) as count FROM districts').get().count,
      total_metrics: db.prepare('SELECT COUNT(*) as count FROM district_metrics').get().count,
      stale_metrics: db.prepare(
        'SELECT COUNT(*) as count FROM district_metrics WHERE is_stale = 1'
      ).get().count,
      total_reports: db.prepare('SELECT COUNT(*) as count FROM citizen_reports').get().count,
      etl_runs: db.prepare('SELECT COUNT(*) as count FROM etl_logs').get().count,
      failed_etls: db.prepare(
        "SELECT COUNT(*) as count FROM etl_logs WHERE status = 'failed'"
      ).get().count
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
