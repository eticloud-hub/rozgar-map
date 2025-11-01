const express = require('express');
const cache = require('../config/cache');
const { getDB } = require('../config/database');
const logger = require('../utils/logger');
const { validateDistrictId, handleValidationErrors } = require('../middleware/validator');

const router = express.Router();

// GET /api/v1/districts - List all districts
router.get('/', (req, res) => {
  try {
    const cacheKey = 'all_districts';
    
    // Check cache first
    if (cache.has(cacheKey)) {
      logger.info('📦 Serving districts from cache');
      return res.json(cache.get(cacheKey));
    }

    const db = getDB();
    const districts = db.prepare(`
      SELECT id, district_code, district_name, state_code, state_name
      FROM districts
      ORDER BY district_name
    `).all();

    // Cache for 1 hour
    cache.set(cacheKey, districts, { ttl: 3600000 });

    res.json({
      count: districts.length,
      data: districts
    });
  } catch (error) {
    logger.error('Error fetching districts:', error);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

// GET /api/v1/districts/:id/summary - Latest metrics
router.get('/:id/summary', validateDistrictId, handleValidationErrors, (req, res) => {
  try {
    const cacheKey = `district_summary_${req.params.id}`;

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      cached.served_from_cache = true;
      return res.json(cached);
    }

    const db = getDB();
    
    // Get latest metrics
    const metrics = db.prepare(`
      SELECT 
        m.*,
        d.district_name,
        CASE WHEN julianday('now') - julianday(m.updated_at) > 30 THEN 1 ELSE 0 END as is_stale,
        julianday('now') - julianday(m.updated_at) as days_old
      FROM district_metrics m
      JOIN districts d ON m.district_id = d.id
      WHERE m.district_id = ?
      ORDER BY m.month DESC
      LIMIT 1
    `).get(req.params.id);

    if (!metrics) {
      return res.status(404).json({ error: 'District not found' });
    }

    const payload = {
      district_id: req.params.id,
      district_name: metrics.district_name,
      latest_month: metrics.month,
      metrics: {
        households: metrics.households,
        persondays: metrics.persondays,
        expenditure: metrics.expenditure,
        avg_wage: metrics.avg_wage,
        payments_on_time: metrics.payments_on_time,
        complaints: metrics.complaints,
        works_completed: metrics.works_completed
      },
      freshness: {
        updated_at: metrics.updated_at,
        days_old: Math.round(metrics.days_old),
        is_stale: metrics.is_stale === 1
      }
    };

    cache.set(cacheKey, payload, { ttl: 900000 }); // 15 min cache

    res.json(payload);
  } catch (error) {
    logger.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// GET /api/v1/districts/:id/timeseries?months=12 - Last N months
router.get('/:id/timeseries', validateDistrictId, handleValidationErrors, (req, res) => {
  try {
    const months = Math.min(parseInt(req.query.months) || 12, 60); // Max 60 months
    const cacheKey = `timeseries_${req.params.id}_${months}`;

    if (cache.has(cacheKey)) {
      return res.json(cache.get(cacheKey));
    }

    const db = getDB();
    const data = db.prepare(`
      SELECT month, households, persondays, expenditure, avg_wage, payments_on_time, complaints
      FROM district_metrics
      WHERE district_id = ?
      ORDER BY month DESC
      LIMIT ?
    `).all(req.params.id, months);

    const payload = {
      district_id: req.params.id,
      months: months,
      data: data.reverse() // Chronological order
    };

    cache.set(cacheKey, payload, { ttl: 1800000 }); // 30 min cache

    res.json(payload);
  } catch (error) {
    logger.error('Error fetching timeseries:', error);
    res.status(500).json({ error: 'Failed to fetch timeseries' });
  }
});

// GET /api/v1/districts/:id/compare?compare_with=state_avg
router.get('/:id/compare', validateDistrictId, handleValidationErrors, (req, res) => {
  try {
    const db = getDB();
    const compareWith = req.query.compare_with || 'state_avg';

    const current = db.prepare(`
      SELECT households, persondays, expenditure, avg_wage FROM district_metrics
      WHERE district_id = ? ORDER BY month DESC LIMIT 1
    `).get(req.params.id);

    if (!current) {
      return res.status(404).json({ error: 'No data for this district' });
    }

    let comparison = {};

    if (compareWith === 'state_avg') {
      // Get state average
      const stateAvg = db.prepare(`
        SELECT 
          AVG(households) as avg_households,
          AVG(persondays) as avg_persondays,
          AVG(expenditure) as avg_expenditure,
          AVG(avg_wage) as avg_avg_wage
        FROM district_metrics
        WHERE month = (SELECT MAX(month) FROM district_metrics)
      `).get();

      comparison = {
        current_district: current,
        state_average: stateAvg,
        percentile_rank: {
          households: Math.round((current.households / stateAvg.avg_households) * 100),
          persondays: Math.round((current.persondays / stateAvg.avg_persondays) * 100),
          expenditure: Math.round((current.expenditure / stateAvg.avg_expenditure) * 100)
        }
      };
    }

    res.json(comparison);
  } catch (error) {
    logger.error('Error in comparison:', error);
    res.status(500).json({ error: 'Failed to compare' });
  }
});

module.exports = router;
