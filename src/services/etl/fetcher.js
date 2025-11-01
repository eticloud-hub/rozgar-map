const axios = require('axios');
const logger = require('../../utils/logger');
const { retryWithBackoff } = require('../../utils/retry');
const constants = require('../../config/constants');

// FREE data.gov.in API endpoint for MGNREGA
// Register free key at: https://data.gov.in
const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY || 'dummy-key';
const DATA_GOV_BASE_URL = 'https://api.data.gov.in/resource';

class MGNREGAFetcher {
  async fetchDistrictData(districtCode, month) {
    const resourceId = '28e54ed5-9fa1-46f6-b82f-96236bf20c42'; // MGNREGA sample (FREE)

    const url = `${DATA_GOV_BASE_URL}/${resourceId}?api-key=${DATA_GOV_API_KEY}&filters[district]=${districtCode}&filters[month]=${month}&format=json&limit=1`;

    return retryWithBackoff(
      async () => {
        logger.info(`📡 Fetching data for district ${districtCode} month ${month}`);
        
        const response = await axios.get(url, {
          timeout: constants.API_TIMEOUT,
          headers: {
            'User-Agent': 'Rozgar-Map-Backend/1.0'
          }
        });

        if (!response.data || response.data.count === 0) {
          throw new Error(`No data found for district ${districtCode} month ${month}`);
        }

        logger.info(`✅ Successfully fetched data for ${districtCode}`);
        return response.data;
      },
      `fetchDistrictData(${districtCode}, ${month})`
    );
  }

  async fetchAllDistricts(month) {
    const results = [];
    const districts = constants.MAHARASHTRA_DISTRICTS;

    logger.info(`📊 Starting batch fetch for ${districts.length} districts for month ${month}`);

    for (let i = 0; i < districts.length; i += constants.ETL_BATCH_SIZE) {
      const batch = districts.slice(i, i + constants.ETL_BATCH_SIZE);
      
      const batchResults = await Promise.allSettled(
        batch.map(d => this.fetchDistrictData(d.code, month))
      );

      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        const district = batch[j];
        
        if (result.status === 'fulfilled') {
          results.push({
            district: district,
            data: result.value,
            status: 'success'
          });
        } else {
          results.push({
            district: district,
            error: result.reason.message,
            status: 'failed'
          });
        }
      }

      // Small delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }
}

module.exports = new MGNREGAFetcher();
