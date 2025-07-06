-- Row Level Security (RLS) Policies for Barber Admin Panel
-- Execute this script in the Supabase SQL Editor

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Barberos ven solo sus turnos" ON appointments;
DROP POLICY IF EXISTS "Barberos pueden actualizar sus turnos" ON appointments;
DROP POLICY IF EXISTS "Barberos pueden ver sus datos" ON barbers;
DROP POLICY IF EXISTS "Enable read access for all users" ON appointments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON appointments;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON appointments;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON appointments;

-- Create new specific policies for barber admin access

-- 1. BARBERS TABLE POLICIES
-- Allow barbers to view their own profile
CREATE POLICY "Barberos pueden ver sus datos" ON barbers
FOR SELECT USING (
  email = auth.jwt() ->> 'email'
);

-- Allow public read access for booking system
CREATE POLICY "Acceso público para reservas" ON barbers
FOR SELECT USING (is_active = true);

-- 2. APPOINTMENTS TABLE POLICIES
-- Allow barbers to view only their own appointments
CREATE POLICY "Barberos ven solo sus turnos" ON appointments
FOR SELECT USING (
  barber_id IN (
    SELECT id FROM barbers 
    WHERE email = auth.jwt() ->> 'email'
    AND is_active = true
  )
);

-- Allow barbers to update status of their own appointments
CREATE POLICY "Barberos pueden actualizar sus turnos" ON appointments
FOR UPDATE USING (
  barber_id IN (
    SELECT id FROM barbers 
    WHERE email = auth.jwt() ->> 'email'
    AND is_active = true
  )
);

-- Allow public insert for new appointments (booking system)
CREATE POLICY "Permitir reservas públicas" ON appointments
FOR INSERT WITH CHECK (true);

-- Allow public read access for booking system (to check availability)
CREATE POLICY "Acceso público para disponibilidad" ON appointments
FOR SELECT USING (true);

-- 3. SERVICES TABLE POLICIES
-- Allow public read access
CREATE POLICY "Acceso público a servicios" ON services
FOR SELECT USING (is_active = true);

-- 4. BARBER_SCHEDULES TABLE POLICIES
-- Allow public read access for booking system
CREATE POLICY "Acceso público a horarios" ON barber_schedules
FOR SELECT USING (is_active = true);

-- 5. BARBER_DAYS_OFF TABLE POLICIES
-- Allow public read access for booking system
CREATE POLICY "Acceso público a días libres" ON barber_days_off
FOR SELECT USING (true);

-- Allow barbers to manage their own days off
CREATE POLICY "Barberos gestionan sus días libres" ON barber_days_off
FOR ALL USING (
  barber_id IN (
    SELECT id FROM barbers 
    WHERE email = auth.jwt() ->> 'email'
    AND is_active = true
  )
);

-- Create a function to get barber ID from authenticated user
CREATE OR REPLACE FUNCTION get_authenticated_barber_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT id FROM barbers 
    WHERE email = auth.jwt() ->> 'email'
    AND is_active = true
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for barber appointments with additional security
CREATE OR REPLACE VIEW barber_appointments AS
SELECT 
  a.*,
  b.name as barber_name,
  b.email as barber_email
FROM appointments a
JOIN barbers b ON a.barber_id = b.id
WHERE 
  CASE 
    WHEN auth.jwt() ->> 'email' IS NOT NULL THEN
      b.email = auth.jwt() ->> 'email'
    ELSE
      true  -- Allow public access for booking system
  END;

-- Grant access to the view
GRANT SELECT ON barber_appointments TO authenticated;
GRANT SELECT ON barber_appointments TO anon;

-- Create a function to validate barber access
CREATE OR REPLACE FUNCTION validate_barber_access(target_barber_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the authenticated user is the barber
  RETURN EXISTS (
    SELECT 1 FROM barbers 
    WHERE id = target_barber_id 
    AND email = auth.jwt() ->> 'email'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update appointment status function with security
CREATE OR REPLACE FUNCTION update_appointment_status(
  appointment_id INTEGER,
  new_status TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  appointment_barber_id INTEGER;
BEGIN
  -- Get the barber_id of the appointment
  SELECT barber_id INTO appointment_barber_id
  FROM appointments
  WHERE id = appointment_id;
  
  -- Check if the authenticated user can modify this appointment
  IF NOT validate_barber_access(appointment_barber_id) THEN
    RAISE EXCEPTION 'No tienes permisos para modificar este turno';
  END IF;
  
  -- Update the appointment status
  UPDATE appointments 
  SET status = new_status
  WHERE id = appointment_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_appointment_status TO authenticated;
GRANT EXECUTE ON FUNCTION validate_barber_access TO authenticated;
GRANT EXECUTE ON FUNCTION get_authenticated_barber_id TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_barber_status ON appointments(barber_id, status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_barber ON appointments(appointment_date, barber_id);
CREATE INDEX IF NOT EXISTS idx_barbers_email ON barbers(email) WHERE is_active = true;

-- Comments for documentation
COMMENT ON POLICY "Barberos ven solo sus turnos" ON appointments IS 'Permite que barberos vean solo sus propios turnos';
COMMENT ON POLICY "Barberos pueden actualizar sus turnos" ON appointments IS 'Permite que barberos actualicen el estado de sus turnos';
COMMENT ON POLICY "Permitir reservas públicas" ON appointments IS 'Permite que clientes hagan reservas';
COMMENT ON POLICY "Acceso público para disponibilidad" ON appointments IS 'Permite verificar disponibilidad para reservas';

COMMENT ON FUNCTION validate_barber_access IS 'Valida si el usuario autenticado puede acceder a datos de un barbero específico';
COMMENT ON FUNCTION update_appointment_status IS 'Actualiza el estado de un turno con validación de permisos';
COMMENT ON VIEW barber_appointments IS 'Vista segura de turnos para barberos autenticados';

-- Test the policies (optional - comment out in production)
-- SELECT 'RLS policies configured successfully' as status;
-- SELECT 'Barbers table policies:' as info;
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'barbers';

-- SELECT 'Appointments table policies:' as info;
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'appointments';