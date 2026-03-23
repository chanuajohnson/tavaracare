ALTER TABLE profiles ADD COLUMN IF NOT EXISTS drivers_license boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS own_transportation boolean DEFAULT false;