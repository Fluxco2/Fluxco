-- Link marketplace listings back to customer projects
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS customer_project_id UUID REFERENCES customer_projects(id);
CREATE INDEX IF NOT EXISTS idx_marketplace_customer_project ON marketplace_listings(customer_project_id);

-- Q&A for marketplace listings
CREATE TABLE IF NOT EXISTS listing_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,

  -- Who asked
  asked_by_supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  asked_by_name VARCHAR(255) NOT NULL,
  asked_by_company VARCHAR(255),

  question TEXT NOT NULL,

  -- Answer (null until answered)
  answer TEXT,
  answered_by_type VARCHAR(20), -- 'customer', 'fluxco'
  answered_by_name VARCHAR(255),
  answered_at TIMESTAMPTZ,

  is_public BOOLEAN DEFAULT TRUE, -- visible to all OEMs or just the asker

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_questions_listing ON listing_questions(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_questions_supplier ON listing_questions(asked_by_supplier_id);

-- Add marketplace_listing_id to customer_projects for back-reference
ALTER TABLE customer_projects ADD COLUMN IF NOT EXISTS marketplace_listing_id UUID REFERENCES marketplace_listings(id);
