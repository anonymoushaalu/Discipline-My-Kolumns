-- Phase 1: Database Setup for Discipline-My-Kolumns (MDM)
-- Creates mdm_db and all required tables

-- Create tables (database must exist first)
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    job_name TEXT,
    status TEXT,
    total_rows INT,
    clean_rows INT,
    quarantined_rows INT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rules (
    id SERIAL PRIMARY KEY,
    column_name TEXT,
    rule_type TEXT,
    rule_value TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS clean_data (
    id SERIAL PRIMARY KEY,
    job_id INT,
    name TEXT,
    age INT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quarantine_data (
    id SERIAL PRIMARY KEY,
    job_id INT,
    name TEXT,
    age INT,
    error_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    job_id INT,
    row_number INT,
    column_name TEXT,
    original_value TEXT,
    final_value TEXT,
    status_color TEXT,
    rule_applied TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS etl_runs (
    id SERIAL PRIMARY KEY,
    status TEXT,
    started_at TIMESTAMP,
    finished_at TIMESTAMP
);

-- Verify tables created
\dt
