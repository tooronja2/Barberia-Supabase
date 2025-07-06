-- Update barbers table to add email column and insert barber data
-- Execute this script in the Supabase SQL Editor

-- Add email column to barbers table
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

-- Insert barber data if not exists
INSERT INTO barbers (name, specialty, photo_url, email, is_active) 
VALUES 
  ('Héctor Medina', 'Especialista en cortes clásicos y modernos', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', 'hector@barberiacentral.com', true),
  ('Lucas Peralta', 'Experto en barbas y diseños creativos', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', 'lucas@barberiacentral.com', true),
  ('Camila González', 'Maestra en colorimetría y estilos únicos', 'https://images.unsplash.com/photo-1494790108755-2616b332c5bd?w=400&h=400&fit=crop&crop=face', 'camila@barberiacentral.com', true)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  specialty = EXCLUDED.specialty,
  photo_url = EXCLUDED.photo_url,
  is_active = EXCLUDED.is_active;

-- Add email column to existing records if they don't have it
UPDATE barbers SET email = 'hector@barberiacentral.com' WHERE id = 1 AND email IS NULL;
UPDATE barbers SET email = 'lucas@barberiacentral.com' WHERE id = 2 AND email IS NULL;
UPDATE barbers SET email = 'camila@barberiacentral.com' WHERE id = 3 AND email IS NULL;

-- Insert barber schedules for all barbers (Sunday to Saturday - 7 days)
INSERT INTO barber_schedules (barber_id, day_of_week, morning_start, morning_end, afternoon_start, afternoon_end, is_active)
SELECT 
  b.id,
  d.day_of_week,
  '09:00'::TIME as morning_start,
  '12:00'::TIME as morning_end,
  '14:00'::TIME as afternoon_start,
  CASE 
    -- Friday and Saturday until 17:00
    WHEN d.day_of_week IN (5, 6) THEN '17:00'::TIME
    -- Other days until 19:00
    ELSE '19:00'::TIME
  END as afternoon_end,
  true
FROM barbers b
CROSS JOIN (
  SELECT generate_series(0, 6) as day_of_week  -- Sunday (0) to Saturday (6) - ALL 7 DAYS
) d
WHERE b.is_active = true
ON CONFLICT (barber_id, day_of_week) DO UPDATE SET
  morning_start = EXCLUDED.morning_start,
  morning_end = EXCLUDED.morning_end,
  afternoon_start = EXCLUDED.afternoon_start,
  afternoon_end = EXCLUDED.afternoon_end,
  is_active = EXCLUDED.is_active;

-- Insert services if they don't exist
INSERT INTO services (name, description, price, duration_minutes, is_active)
VALUES 
  ('Corte de pelo', 'Corte de pelo clásico y moderno', 3500.00, 15, true),
  ('Corte de barba', 'Arreglo y diseño de barba', 2500.00, 15, true),
  ('Corte de pelo y barba', 'Servicio completo de corte y barba', 5500.00, 30, true),
  ('Corte todo máquina', 'Corte rápido con máquina', 2800.00, 15, true),
  ('Diseños y dibujos', 'Diseños creativos en cabello', 4500.00, 30, true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  duration_minutes = EXCLUDED.duration_minutes,
  is_active = EXCLUDED.is_active;

-- Verify the data
SELECT 'Barbers with emails:' as info;
SELECT id, name, email, is_active FROM barbers WHERE email IS NOT NULL;

SELECT 'Services available:' as info;
SELECT id, name, price, duration_minutes FROM services WHERE is_active = true;

SELECT 'Barber schedules:' as info;
SELECT bs.barber_id, b.name, bs.day_of_week, bs.morning_start, bs.afternoon_end 
FROM barber_schedules bs 
JOIN barbers b ON bs.barber_id = b.id 
WHERE bs.is_active = true 
ORDER BY bs.barber_id, bs.day_of_week;