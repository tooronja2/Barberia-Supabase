-- DIAGNÓSTICO DE HORARIOS DE BARBEROS
-- Ejecutar en Supabase SQL Editor para ver el estado actual

-- 1. Ver qué días tiene cada barbero
SELECT 
    b.name as barbero,
    bs.day_of_week as dia_numero,
    CASE bs.day_of_week
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Lunes'
        WHEN 2 THEN 'Martes'
        WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves'
        WHEN 5 THEN 'Viernes'
        WHEN 6 THEN 'Sábado'
    END as dia_nombre,
    bs.morning_start,
    bs.morning_end,
    bs.afternoon_start,
    bs.afternoon_end,
    bs.is_active
FROM barbers b
LEFT JOIN barber_schedules bs ON b.id = bs.barber_id AND bs.is_active = true
ORDER BY b.id, bs.day_of_week;

-- 2. Verificar qué días faltan por barbero
SELECT 
    'Resumen de días por barbero:' as info;

SELECT 
    b.name as barbero,
    COUNT(bs.day_of_week) as dias_configurados,
    ARRAY_AGG(bs.day_of_week ORDER BY bs.day_of_week) as dias_existentes
FROM barbers b
LEFT JOIN barber_schedules bs ON b.id = bs.barber_id AND bs.is_active = true
GROUP BY b.id, b.name
ORDER BY b.id;

-- 3. Identificar días faltantes específicos
SELECT 
    'Días faltantes por barbero:' as info;

WITH dias_completos AS (
    SELECT generate_series(0, 6) as dia
),
barberos_activos AS (
    SELECT id, name FROM barbers WHERE is_active = true
)
SELECT 
    ba.name as barbero,
    dc.dia as dia_faltante,
    CASE dc.dia
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Lunes'  
        WHEN 2 THEN 'Martes'
        WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves'
        WHEN 5 THEN 'Viernes'
        WHEN 6 THEN 'Sábado'
    END as nombre_dia_faltante
FROM barberos_activos ba
CROSS JOIN dias_completos dc
LEFT JOIN barber_schedules bs ON ba.id = bs.barber_id AND dc.dia = bs.day_of_week AND bs.is_active = true
WHERE bs.day_of_week IS NULL
ORDER BY ba.id, dc.dia;

-- 4. Verificar si hoy es sábado y está configurado
SELECT 
    'Estado de hoy (sábado = día 6):' as info;

SELECT 
    b.name as barbero,
    CASE WHEN bs.day_of_week IS NOT NULL THEN 'Configurado' ELSE 'FALTA' END as estado_sabado,
    bs.morning_start,
    bs.afternoon_end
FROM barbers b
LEFT JOIN barber_schedules bs ON b.id = bs.barber_id AND bs.day_of_week = 6 AND bs.is_active = true
WHERE b.is_active = true
ORDER BY b.id;

-- 5. Verificar si domingo está configurado
SELECT 
    'Estado de domingo (día 0):' as info;

SELECT 
    b.name as barbero,
    CASE WHEN bs.day_of_week IS NOT NULL THEN 'Configurado' ELSE 'FALTA' END as estado_domingo,
    bs.morning_start,
    bs.afternoon_end
FROM barbers b
LEFT JOIN barber_schedules bs ON b.id = bs.barber_id AND bs.day_of_week = 0 AND bs.is_active = true
WHERE b.is_active = true
ORDER BY b.id;