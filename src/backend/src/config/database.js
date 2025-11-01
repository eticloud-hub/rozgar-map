const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const schema = require('./schema');

const dbPath = path.join(__dirname, '../../data/db.sqlite');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

function getDB() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

async function initializeDatabase() {
  try {
    const database = getDB();
    
    // Execute schema
    const schemaSQL = require('./schema');
    database.exec(schemaSQL);
    
    logger.info('✅ Database initialized successfully');
    return database;
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    throw error;
  }
}

function closeDB() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  getDB,
  initializeDatabase,
  closeDB
};
