-- Update Service Durations Script
-- Execute this in Supabase SQL Editor
-- URL: https://app.supabase.com/project/aooxkgxqdzddwfojfipd/editor

-- First, let's insert/update services with correct durations and images

-- Insert services with correct durations
INSERT INTO services (name, description, price, duration_minutes, is_active) VALUES
('Corte de barba', 'Perfilado y arreglo profesional de barba con técnicas tradicionales', 6500, 15, true),
('Corte de pelo', 'Corte de pelo personalizado según tu estilo y preferencias', 8500, 15, true),
('Corte todo máquina', 'Rapado a máquina profesional en todo el cabello', 8000, 15, true),
('Corte de pelo y barba', 'Servicio completo: corte personalizado + arreglo de barba', 9500, 30, true),
('Diseños y dibujos', 'Arte y creatividad en tu corte con patrones únicos', 6500, 30, true)
ON CONFLICT (name) 
DO UPDATE SET 
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  duration_minutes = EXCLUDED.duration_minutes,
  is_active = EXCLUDED.is_active;

-- Verify the updates
SELECT id, name, description, price, duration_minutes, is_active 
FROM services 
WHERE is_active = true 
ORDER BY name;

-- Alternative: If the above INSERT ON CONFLICT doesn't work, use individual UPDATEs:

-- Update service durations individually
-- UPDATE services SET duration_minutes = 15 WHERE name = 'Corte de barba';
-- UPDATE services SET duration_minutes = 30 WHERE name = 'Corte de pelo';
-- UPDATE services SET duration_minutes = 30 WHERE name = 'Corte todo máquina';
-- UPDATE services SET duration_minutes = 30 WHERE name = 'Corte de pelo y barba';
-- UPDATE services SET duration_minutes = 15 WHERE name = 'Diseños y dibujos';

-- Insert barbers if not exists
INSERT INTO barbers (name, specialty, photo_url, is_active) VALUES
('Héctor Medina', 'Especialista en cortes clásicos y arreglo de barba tradicional. 15 años de experiencia.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', true),
('Lucas Peralta', 'Experto en estilos modernos, degradados y tendencias actuales. Especializado en jóvenes.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face', true),
('Camila González', 'Especialista en tratamientos capilares, coloración y cuidado integral del cabello.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face', true)
ON CONFLICT (name) 
DO UPDATE SET 
  specialty = EXCLUDED.specialty,
  photo_url = EXCLUDED.photo_url,
  is_active = EXCLUDED.is_active;

-- Insert basic barber schedules (Monday to Friday: 9:00-12:00, 14:00-18:00, Saturday: 9:00-16:00)
INSERT INTO barber_schedules (barber_id, day_of_week, morning_start, morning_end, afternoon_start, afternoon_end, is_active)
SELECT 
  b.id,
  generate_series(1, 5) as day_of_week, -- Monday to Friday
  '09:00'::time as morning_start,
  '12:00'::time as morning_end,
  '14:00'::time as afternoon_start,
  '18:00'::time as afternoon_end,
  true as is_active
FROM barbers b
WHERE b.is_active = true
ON CONFLICT (barber_id, day_of_week) 
DO NOTHING;

-- Saturday schedules (9:00-16:00, no afternoon break)
INSERT INTO barber_schedules (barber_id, day_of_week, morning_start, morning_end, afternoon_start, afternoon_end, is_active)
SELECT 
  b.id,
  6 as day_of_week, -- Saturday
  '09:00'::time as morning_start,
  '16:00'::time as morning_end,
  NULL as afternoon_start,
  NULL as afternoon_end,
  true as is_active
FROM barbers b
WHERE b.is_active = true
ON CONFLICT (barber_id, day_of_week) 
DO NOTHING;

-- Verify everything is set up correctly
SELECT 'Services with durations:' as section;
SELECT name, duration_minutes, price FROM services WHERE is_active = true ORDER BY name;

SELECT 'Barbers:' as section;
SELECT name, specialty FROM barbers WHERE is_active = true ORDER BY name;

SELECT 'Barber schedules:' as section;
SELECT 
  b.name, 
  bs.day_of_week,
  bs.morning_start,
  bs.morning_end,
  bs.afternoon_start,
  bs.afternoon_end
FROM barber_schedules bs
JOIN barbers b ON bs.barber_id = b.id
WHERE bs.is_active = true
ORDER BY b.name, bs.day_of_week;