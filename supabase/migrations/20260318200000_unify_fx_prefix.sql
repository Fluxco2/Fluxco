-- Unify all serial numbers to FX- prefix (matching customer project numbers)
UPDATE marketplace_listings
SET serial_number = REPLACE(serial_number, 'FLUX-', 'FX-')
WHERE serial_number LIKE 'FLUX-%';

-- Update the trigger function to use FX- prefix
CREATE OR REPLACE FUNCTION set_serial_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.serial_number IS NULL THEN
    NEW.serial_number := 'FX-' || LPAD(nextval('marketplace_serial_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
