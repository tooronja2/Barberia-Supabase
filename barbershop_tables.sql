-- Barbershop Database Schema
-- Execute this script in the Supabase SQL Editor
-- URL: https://app.supabase.com/project/aooxkgxqdzddwfojfipd/editor

-- 1. Create barbers table
CREATE TABLE IF NOT EXISTS barbers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  specialty VARCHAR(200),
  photo_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create services table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- 3. Create barber_schedules table
CREATE TABLE IF NOT EXISTS barber_schedules (
  id SERIAL PRIMARY KEY,
  barber_id INTEGER REFERENCES barbers(id),
  day_of_week INTEGER NOT NULL,
  morning_start TIME,
  morning_end TIME,
  afternoon_start TIME,
  afternoon_end TIME,
  is_active BOOLEAN DEFAULT true
);

-- 4. Create barber_days_off table
CREATE TABLE IF NOT EXISTS barber_days_off (
  id SERIAL PRIMARY KEY,
  barber_id INTEGER REFERENCES barbers(id),
  off_date DATE NOT NULL,
  reason VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  observations TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  barber_id INTEGER REFERENCES barbers(id),
  service_type VARCHAR(100) NOT NULL,
  service_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmado',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_days_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for public read access
CREATE POLICY "Enable read access for all users" ON barbers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON services FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON barber_schedules FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON barber_days_off FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON appointments FOR SELECT USING (true);

-- Create policies for insert/update/delete (you may want to restrict these based on your auth requirements)
CREATE POLICY "Enable insert for authenticated users" ON barbers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON barbers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON barbers FOR DELETE USING (true);

CREATE POLICY "Enable insert for authenticated users" ON services FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON services FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON services FOR DELETE USING (true);

CREATE POLICY "Enable insert for authenticated users" ON barber_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON barber_schedules FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON barber_schedules FOR DELETE USING (true);

CREATE POLICY "Enable insert for authenticated users" ON barber_days_off FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON barber_days_off FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON barber_days_off FOR DELETE USING (true);

CREATE POLICY "Enable insert for authenticated users" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON appointments FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON appointments FOR DELETE USING (true);

-- Create some useful indexes for performance
CREATE INDEX idx_barbers_active ON barbers(is_active);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_barber_schedules_barber_id ON barber_schedules(barber_id);
CREATE INDEX idx_barber_schedules_day ON barber_schedules(day_of_week);
CREATE INDEX idx_barber_days_off_barber_id ON barber_days_off(barber_id);
CREATE INDEX idx_barber_days_off_date ON barber_days_off(off_date);
CREATE INDEX idx_appointments_barber_id ON appointments(barber_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Comments for documentation
COMMENT ON TABLE barbers IS 'Stores information about barbers working at the barbershop';
COMMENT ON TABLE services IS 'Stores available services and their pricing';
COMMENT ON TABLE barber_schedules IS 'Stores working schedules for each barber';
COMMENT ON TABLE barber_days_off IS 'Stores days when barbers are not available';
COMMENT ON TABLE appointments IS 'Stores customer appointments with barbers';

COMMENT ON COLUMN barber_schedules.day_of_week IS 'Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday';
COMMENT ON COLUMN appointments.status IS 'Appointment status: confirmado, cancelado, completado';