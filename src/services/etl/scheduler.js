const cron = require('node-cron');
const logger = require('../../utils/logger');
const fetcher = require('./fetcher');
const parser = require('./parser');
const { getDB } = require('../../config/database');
const constants = require('../../config/constants');

class ETLScheduler {
  startScheduler() {
    logger.info(`⏰ ETL Scheduler starting. Schedule: ${constants.ETL_CRON_SCHEDULE}`);

    // Run daily at 2 AM
    cron.schedule(constants.ETL_CRON_SCHEDULE, async () => {
      await this.runETL();
    });

    // Also run on startup
    logger.info('🚀 Running initial ETL...');
    this.runETL().catch(error => {
      logger.error('Initial ETL failed:', error);
    });
  }

  async runETL() {
    const db = getDB();
    const startTime = new Date();
    const logId = db.prepare(
      'INSERT INTO etl_logs (job_name, started_at, status) VALUES (?, ?, ?)'
    ).run('daily_mgnrega_fetch', startTime.toISOString(), 'running').lastInsertRowid;

    let successCount = 0;
    let failureCount = 0;

    try {
      logger.info('📊 Starting ETL job...');
      
      // Get current month
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // Fetch all districts
      const results = await fetcher.fetchAllDistricts(month);

      for (const result of results) {
        if (result.status === 'success') {
          try {
            // Ensure district exists
            const districtStmt = db.prepare(
              'INSERT OR IGNORE INTO districts (district_code, district_name, state_code, state_name) VALUES (?, ?, ?, ?)'
            );
            districtStmt.run(result.district.code, result.district.name, 'MH', 'Maharashtra');

            // Get district ID
            const district = db.prepare('SELECT id FROM districts WHERE district_code = ?').get(result.district.code);
            
            if (district) {
              const metrics = parser.parseMetrics(result.data);
              parser.saveToDatabase(district.id, month, metrics);
              successCount++;
            }
          } catch (error) {
            logger.error(`Failed to process ${result.district.name}:`, error);
            failureCount++;
          }
        } else {
          failureCount++;
          logger.warn(`Failed to fetch ${result.district.name}: ${result.error}`);
        }
      }

      // Update ETL log
      const duration = new Date() - startTime;
      db.prepare(
        'UPDATE etl_logs SET status = ?, completed_at = ?, records_success = ?, records_failed = ?, duration_ms = ? WHERE id = ?'
      ).run('success', new Date().toISOString(), successCount, failureCount, duration, logId);

      logger.info(`✅ ETL completed. Success: ${successCount}, Failed: ${failureCount}, Duration: ${duration}ms`);

    } catch (error) {
      logger.error('❌ ETL failed:', error);
      db.prepare(
        'UPDATE etl_logs SET status = ?, completed_at = ?, error_details = ? WHERE id = ?'
      ).run('failed', new Date().toISOString(), error.message, logId);
    }
  }
}

function startScheduler() {
  const scheduler = new ETLScheduler();
  scheduler.startScheduler();
}

module.exports = { startScheduler };
