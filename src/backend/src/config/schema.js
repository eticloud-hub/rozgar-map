module.exports = `
-- Districts master table
CREATE TABLE IF NOT EXISTS districts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    district_code TEXT UNIQUE NOT NULL,
    district_name TEXT NOT NULL,
    state_code TEXT NOT NULL DEFAULT 'MH',
    state_name TEXT NOT NULL DEFAULT 'Maharashtra',
    region TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_districts_code ON districts(district_code);

-- Normalized metrics table
CREATE TABLE IF NOT EXISTS district_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    district_id INTEGER NOT NULL,
    month TEXT NOT NULL,
    households INTEGER DEFAULT 0,
    persondays INTEGER DEFAULT 0,
    expenditure REAL DEFAULT 0.0,
    avg_wage REAL DEFAULT 0.0,
    payments_on_time INTEGER DEFAULT 0,
    complaints INTEGER DEFAULT 0,
    works_completed INTEGER DEFAULT 0,
    is_stale INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
    UNIQUE(district_id, month)
);

CREATE INDEX IF NOT EXISTS idx_metrics_district_month ON district_metrics(district_id, month DESC);

-- Snapshots metadata
CREATE TABLE IF NOT EXISTS snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    district_id INTEGER NOT NULL,
    month TEXT NOT NULL,
    file_path TEXT NOT NULL,
    fetched_at TEXT DEFAULT (datetime('now')),
    etag TEXT,
    status TEXT DEFAULT 'success',
    error_message TEXT,
    file_size_bytes INTEGER,
    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
    UNIQUE(district_id, month)
);

-- ETL logs
CREATE TABLE IF NOT EXISTS etl_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_name TEXT NOT NULL,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    status TEXT DEFAULT 'running',
    records_processed INTEGER DEFAULT 0,
    records_success INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_details TEXT,
    duration_ms INTEGER
);

-- Citizen reports
CREATE TABLE IF NOT EXISTS citizen_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    district_id INTEGER,
    message TEXT NOT NULL,
    photo_path TEXT,
    ip_address TEXT,
    user_agent TEXT,
    submitted_at TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON citizen_reports(status);

-- System metadata
CREATE TABLE IF NOT EXISTS system_metadata (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO system_metadata (key, value) VALUES 
    ('last_etl_run', NULL),
    ('db_version', '1.0.0');
`;
