-- Add capability fields to suppliers for better matching
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS voltage_min integer;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS voltage_max integer;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS cooling_types text[] DEFAULT '{}';
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS transformer_types text[] DEFAULT '{}';
