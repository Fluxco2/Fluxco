-- Version history for customer projects
-- Snapshots the spec each time a customer saves changes
CREATE TABLE IF NOT EXISTS customer_project_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES customer_projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,

  -- Snapshot of spec state at this version
  name VARCHAR(255),
  spec_mode VARCHAR(10),
  rated_power_kva NUMERIC(12,2),
  primary_voltage NUMERIC(12,2),
  secondary_voltage NUMERIC(12,2),
  frequency INTEGER,
  phases INTEGER,
  design_requirements JSONB,
  pro_spec JSONB,
  estimated_cost NUMERIC(12,2),

  -- Change metadata
  change_summary TEXT, -- auto-generated description of what changed
  changed_by VARCHAR(100), -- 'customer' or 'admin' or email
  status VARCHAR(20), -- status at time of snapshot

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, version)
);

-- Add version column to the main projects table
ALTER TABLE customer_projects ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Index for fast lookups
CREATE INDEX idx_project_versions_project_id ON customer_project_versions(project_id);
CREATE INDEX idx_project_versions_created ON customer_project_versions(created_at DESC);
