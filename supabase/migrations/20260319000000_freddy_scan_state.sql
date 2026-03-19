-- Track Freddy's email scan state
CREATE TABLE IF NOT EXISTS freddy_scan_state (
  id VARCHAR(50) PRIMARY KEY,
  last_scanned_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO freddy_scan_state (id, last_scanned_at)
VALUES ('gmail_scan', NOW())
ON CONFLICT DO NOTHING;
