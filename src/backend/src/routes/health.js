const express = require('express');
const { getDB } = require('../config/database');
const logger = require('../utils/logger');
const os = require('os');
const fs = require('fs');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = getDB();
    
    // Check DB
    const dbHealth = db.prepare('SELECT COUNT(*) as count FROM districts').get();
    
    // Check disk space
    const dataDir = 'data';
    const diskUsage = fs.existsSync(dataDir)
      ? fs.statSync(dataDir).size
      : 0;

    // Get last ETL run
    const lastETL = db.prepare(
      'SELECT * FROM etl_logs ORDER BY started_at DESC LIMIT 1'
    ).get();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: 'connected',
        districts: dbHealth.count,
        lastUpdated: lastETL?.completed_at || 'never'
      },
      etl: {
        lastRun: lastETL?.started_at || 'never',
        status: lastETL?.status || 'not_run',
        recordsProcessed: lastETL?.records_processed || 0
      },
      system: {
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB'
        },
        disk: {
          dataSize: Math.round(diskUsage / 1024 / 1024),
          unit: 'MB'
        },
        cpuCount: os.cpus().length
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;
