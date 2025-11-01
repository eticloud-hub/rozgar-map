const logger = require('../../utils/logger');
const { getDB } = require('../../config/database');

class DataParser {
  parseMetrics(rawData) {
    try {
      // Map raw API response to normalized schema
      const record = rawData.records?.[0];
      
      if (!record) {
        throw new Error('No records in response');
      }

      return {
        households: parseInt(record.households_worked) || 0,
        persondays: parseInt(record.person_days_generated) || 0,
        expenditure: parseFloat(record.total_expenditure) || 0.0,
        avg_wage: parseFloat(record.avg_wage_per_person_day) || 0.0,
        payments_on_time: parseInt(record.workers_paid_within_15_days) || 0,
        complaints: parseInt(record.complaints_received) || 0,
        works_completed: parseInt(record.works_completed) || 0
      };
    } catch (error) {
      logger.error('Failed to parse metrics:', error);
      throw error;
    }
  }

  saveToDatabase(districtId, month, metrics) {
    const db = getDB();
    
    try {
      const stmt = db.prepare(`
        INSERT INTO district_metrics 
        (district_id, month, households, persondays, expenditure, avg_wage, payments_on_time, complaints, works_completed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(district_id, month) DO UPDATE SET
          households = excluded.households,
          persondays = excluded.persondays,
          expenditure = excluded.expenditure,
          avg_wage = excluded.avg_wage,
          payments_on_time = excluded.payments_on_time,
          complaints = excluded.complaints,
          works_completed = excluded.works_completed,
          updated_at = datetime('now')
      `);

      stmt.run(
        districtId,
        month,
        metrics.households,
        metrics.persondays,
        metrics.expenditure,
        metrics.avg_wage,
        metrics.payments_on_time,
        metrics.complaints,
        metrics.works_completed
      );

      logger.info(`✅ Saved metrics for district ${districtId} month ${month}`);
      return true;
    } catch (error) {
      logger.error('Failed to save metrics:', error);
      throw error;
    }
  }
}

module.exports = new DataParser();
