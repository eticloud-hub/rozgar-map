const axios = require('axios');
const logger = require('../utils/logger');
const booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default;
const point = require('@turf/helpers').point;
const { getDB } = require('../config/database');

class GeolocationService {
  constructor() {
    this.maharashtraGeoJSON = null;
    this.loadGeoJSON();
  }

  loadGeoJSON() {
    try {
      // Load Maharashtra GeoJSON (FREE - included in repo)
      // For demo, we'll use hardcoded districts
      this.districts = [
        { name: 'Pune', coords: [[73.4, 18.4], [74.2, 18.9]] },
        { name: 'Nashik', coords: [[73.7, 19.8], [74.9, 20.2]] },
        { name: 'Nagpur', coords: [[78.7, 20.7], [79.8, 21.5]] },
        // Add all 36 districts with rough bounding boxes
      ];
      logger.info('✅ GeoJSON districts loaded');
    } catch (error) {
      logger.error('Failed to load GeoJSON:', error);
    }
  }

  // Primary: Browser GPS coordinates
  async resolveByCoordinates(lat, lon) {
    logger.info(`📍 Resolving coordinates: ${lat}, ${lon}`);

    try {
      // Point-in-polygon using Turf.js (100% FREE, runs locally)
      const userPoint = point([lon, lat]);

      for (const district of this.districts) {
        // Simple bounding box check (can enhance with turf.js polygon)
        const [minLon, minLat] = district.coords[0];
        const [maxLon, maxLat] = district.coords[1];

        if (lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat) {
          const db = getDB();
          const districtRecord = db.prepare(
            'SELECT id, district_code FROM districts WHERE district_name = ?'
          ).get(district.name);

          if (districtRecord) {
            return {
              district_id: districtRecord.id,
              district_name: district.name,
              confidence: 95,
              method: 'gps'
            };
          }
        }
      }

      // If not found, return nearest district
      return this.findNearestDistrict(lat, lon);
    } catch (error) {
      logger.error('Error in resolveByCoordinates:', error);
      throw error;
    }
  }

  findNearestDistrict(lat, lon) {
    // Simple distance calculation
    let nearest = null;
    let minDistance = Infinity;

    for (const district of this.districts) {
      const [centerLon, centerLat] = [
        (district.coords[0][0] + district.coords[1][0]) / 2,
        (district.coords[0][1] + district.coords[1][1]) / 2
      ];

      const distance = Math.sqrt(
        Math.pow(lat - centerLat, 2) + Math.pow(lon - centerLon, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = district;
      }
    }

    return {
      district_name: nearest.name,
      confidence: Math.max(50, 100 - Math.min(distance, 5) * 10),
      method: 'nearest',
      note: 'User coordinates outside known districts'
    };
  }

  // Fallback: IP-based geolocation (FREE - 45 requests/min)
  async resolveByIP(ip) {
    logger.info(`🌐 Resolving by IP: ${ip}`);

    try {
      // FREE IP geolocation API: 45 requests/minute
      const response = await axios.get(`http://ip-api.com/json/${ip}`, {
        timeout: 5000
      });

      if (response.data.status === 'success') {
        logger.info(`✅ IP resolved to ${response.data.city}, ${response.data.regionName}`);
        
        // Now use GPS resolution with IP coordinates
        return this.resolveByCoordinates(response.data.lat, response.data.lon);
      } else {
        throw new Error('IP geolocation service returned failure');
      }
    } catch (error) {
      logger.warn(`⚠️ IP geolocation failed: ${error.message}`);
      return null;
    }
  }
}

module.exports = new GeolocationService();
