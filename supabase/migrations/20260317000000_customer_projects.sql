-- Customer projects: specs created by customers via the portal spec builder
CREATE TABLE IF NOT EXISTS customer_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_number VARCHAR(20) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL DEFAULT 'Untitled Project',
  spec_mode VARCHAR(10) DEFAULT 'lite',

  -- Core electrical specs (denormalized for quick display)
  rated_power_kva NUMERIC(12,2),
  primary_voltage NUMERIC(12,2),
  secondary_voltage NUMERIC(12,2),
  frequency INTEGER DEFAULT 60,
  phases INTEGER DEFAULT 3,

  -- Full form state (so they can resume editing)
  design_requirements JSONB,
  pro_spec JSONB,

  -- Calculated design output
  design_result JSONB,

  -- Cost
  estimated_cost NUMERIC(12,2),

  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'quoted', 'ordered', 'completed')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate project numbers like FX-10001, FX-10002, etc.
CREATE SEQUENCE IF NOT EXISTS customer_project_number_seq START WITH 10001;

CREATE OR REPLACE FUNCTION generate_project_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_number IS NULL OR NEW.project_number = '' THEN
    NEW.project_number := 'FX-' || nextval('customer_project_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_project_number
  BEFORE INSERT ON customer_projects
  FOR EACH ROW
  EXECUTE FUNCTION generate_project_number();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_customer_project_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_projects_timestamp
  BEFORE UPDATE ON customer_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_project_timestamp();

-- Index for fast lookups by customer
CREATE INDEX idx_customer_projects_customer_id ON customer_projects(customer_id);
CREATE INDEX idx_customer_projects_status ON customer_projects(status);
