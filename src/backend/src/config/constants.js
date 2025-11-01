module.exports = {
  // API limits
  API_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  INITIAL_BACKOFF_MS: 1000,

  // Rate limiting (all FREE)
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  RATE_LIMIT_WRITE_MAX: 10,

  // Cache
  CACHE_TTL_SHORT: 5 * 60 * 1000, // 5 minutes
  CACHE_TTL_LONG: 60 * 60 * 1000, // 1 hour

  // ETL
  ETL_CRON_SCHEDULE: '0 2 * * *', // 2 AM daily
  ETL_BATCH_SIZE: 10,

  // Geolocation
  IP_API_LIMIT: 45, // Free tier
  IP_API_WINDOW: 60000, // per minute

  // Data directories
  DATA_DIR: 'data',
  SNAPSHOTS_DIR: 'data/snapshots',
  GEOJSON_DIR: 'data/geojson',

  // MGNREGA Districts (Maharashtra - Free from data.gov.in)
  MAHARASHTRA_DISTRICTS: [
    { code: '27', name: 'Pune', region: 'Western' },
    { code: '28', name: 'Nashik', region: 'North' },
    { code: '29', name: 'Nagpur', region: 'Vidarbha' },
    { code: '30', name: 'Ahmednagar', region: 'Western' },
    { code: '31', name: 'Aurangabad', region: 'Marathwada' },
    { code: '32', name: 'Bid', region: 'Marathwada' },
    // Add all 36 districts
  ]
};
