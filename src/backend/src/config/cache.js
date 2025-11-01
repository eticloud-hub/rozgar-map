const LRU = require('lru-cache');
const logger = require('../utils/logger');

const cache = new LRU({
  max: 500, // Max 500 items
  maxSize: 10 * 1024 * 1024, // 10MB max
  ttl: 1000 * 60 * 15, // 15 minutes default
  sizeCalculation: (n) => JSON.stringify(n).length,
  allowStale: true, // Return stale data while refreshing
  updateAgeOnGet: true
});

cache.on('evict', () => {
  logger.debug('Cache evicted due to size limit');
});

module.exports = cache;
