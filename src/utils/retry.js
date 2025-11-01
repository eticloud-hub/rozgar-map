const logger = require('./logger');
const constants = require('../config/constants');

async function retryWithBackoff(fn, fnName = 'operation') {
  let lastError;
  
  for (let attempt = 1; attempt <= constants.MAX_RETRIES; attempt++) {
    try {
      logger.info(`🔄 Attempt ${attempt}/${constants.MAX_RETRIES} for ${fnName}`);
      return await fn();
    } catch (error) {
      lastError = error;
      logger.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < constants.MAX_RETRIES) {
        const backoffMs = constants.INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
        logger.info(`⏳ Waiting ${backoffMs}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }
  
  throw lastError;
}

module.exports = { retryWithBackoff };
