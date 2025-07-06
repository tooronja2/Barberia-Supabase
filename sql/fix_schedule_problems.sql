-- CORRECCIÓN COMPLETA DE HORARIOS DE BARBEROS
-- Este script soluciona todos los problemas identificados
-- Ejecutar en Supabase SQL Editor

-- ========================================
-- PASO 1: CORREGIR MAPEO DE DÍAS EXISTENTES
-- ========================================

-- Según tu descripción, los datos van del 1 al 6
-- Esto significa: 1=Lunes, 2=Martes, ..., 6=Sábado
-- Pero falta el 0=Domingo y el sábado está mal mapeado

SELECT 'Iniciando corrección de horarios...' as mensaje;

-- Primero, creamos una tabla temporal para respaldar datos actuales
CREATE TEMP TABLE backup_schedules AS 
SELECT * FROM barber_schedules WHERE is_active = true;

SELECT 'Respaldo creado. Registros respaldados:', COUNT(*) FROM backup_schedules;

-- ========================================
-- PASO 2: AGREGAR DÍAS FALTANTES
-- ========================================

-- Insertar horarios para TODOS los días de la semana (0=Domingo a 6=Sábado)
-- Para barberos que ya existen pero les faltan días

-- Horario estándar para todos los días:
-- Mañana: 09:00 - 12:00
-- Tarde: 14:00 - 19:00 (algunos días hasta 17:00)

INSERT INTO barber_schedules (barber_id, day_of_week, morning_start, morning_end, afternoon_start, afternoon_end, is_active)
SELECT 
    b.id as barber_id,
    dias.day_of_week,
    '09:00'::TIME as morning_start,
    '12:00'::TIME as morning_end,
    '14:00'::TIME as afternoon_start,
    CASE 
        -- Viernes y sábado hasta las 17:00
        WHEN dias.day_of_week IN (5, 6) THEN '17:00'::TIME
        -- Resto de días hasta las 19:00  
        ELSE '19:00'::TIME
    END as afternoon_end,
    true as is_active
FROM barbers b
CROSS JOIN (
    -- TODOS los días de la semana: 0=Domingo, 1=Lunes, ..., 6=Sábado
    SELECT generate_series(0, 6) as day_of_week
) dias
WHERE b.is_active = true
ON CONFLICT (barber_id, day_of_week) DO UPDATE SET
    morning_start = EXCLUDED.morning_start,
    morning_end = EXCLUDED.morning_end,
    afternoon_start = EXCLUDED.afternoon_start,
    afternoon_end = EXCLUDED.afternoon_end,
    is_active = EXCLUDED.is_active;

-- ========================================
-- PASO 3: VERIFICAR RESULTADOS
-- ========================================

SELECT 'Verificando resultados después de la corrección...' as mensaje;

-- Ver resumen por barbero
SELECT 
    b.name as barbero,
    COUNT(bs.day_of_week) as dias_configurados,
    ARRAY_AGG(
        CASE bs.day_of_week
            WHEN 0 THEN 'Dom'
            WHEN 1 THEN 'Lun'
            WHEN 2 THEN 'Mar'
            WHEN 3 THEN 'Mié'
            WHEN 4 THEN 'Jue'
            WHEN 5 THEN 'Vie'
            WHEN 6 THEN 'Sáb'
        END ORDER BY bs.day_of_week
    ) as dias_nombres
FROM barbers b
LEFT JOIN barber_schedules bs ON b.id = bs.barber_id AND bs.is_active = true
WHERE b.is_active = true
GROUP BY b.id, b.name
ORDER BY b.id;

-- ========================================
-- PASO 4: CONFIGURACIÓN ESPECÍFICA POR BARBERO
-- ========================================

-- Ajustar horarios específicos si algunos barberos tienen horarios diferentes
-- Esto lo puedes personalizar según las necesidades reales

-- Ejemplo: Si Camila (barbero 3) solo trabaja algunos días:
-- UPDATE barber_schedules 
-- SET is_active = false 
-- WHERE barber_id = 3 AND day_of_week IN (0, 6); -- No trabaja domingos ni sábados

-- ========================================
-- PASO 5: VERIFICACIÓN FINAL ESPECÍFICA PARA HOY
-- ========================================

SELECT 'Estado de SÁBADO (día 6) - HOY:' as mensaje;

SELECT 
    b.name as barbero,
    bs.day_of_week,
    CASE WHEN bs.day_of_week IS NOT NULL THEN 'CONFIGURADO ✅' ELSE 'FALTA ❌' END as estado,
    bs.morning_start || ' - ' || bs.morning_end as turno_mañana,
    bs.afternoon_start || ' - ' || bs.afternoon_end as turno_tarde
FROM barbers b
LEFT JOIN barber_schedules bs ON b.id = bs.barber_id AND bs.day_of_week = 6 AND bs.is_active = true
WHERE b.is_active = true
ORDER BY b.id;

SELECT 'Estado de DOMINGO (día 0):' as mensaje;

SELECT 
    b.name as barbero,
    bs.day_of_week,
    CASE WHEN bs.day_of_week IS NOT NULL THEN 'CONFIGURADO ✅' ELSE 'FALTA ❌' END as estado,
    bs.morning_start || ' - ' || bs.morning_end as turno_mañana,
    bs.afternoon_start || ' - ' || bs.afternoon_end as turno_tarde
FROM barbers b
LEFT JOIN barber_schedules bs ON b.id = bs.barber_id AND bs.day_of_week = 0 AND bs.is_active = true
WHERE b.is_active = true
ORDER BY b.id;

-- ========================================
-- PASO 6: VERIFICAR TABLA COMPLETA
-- ========================================

SELECT 'Horarios completos por barbero y día:' as mensaje;

SELECT 
    b.name as barbero,
    bs.day_of_week as dia_num,
    CASE bs.day_of_week
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Lunes'
        WHEN 2 THEN 'Martes'
        WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves'
        WHEN 5 THEN 'Viernes'
        WHEN 6 THEN 'Sábado'
    END as dia_nombre,
    bs.morning_start || ' - ' || bs.morning_end as mañana,
    bs.afternoon_start || ' - ' || bs.afternoon_end as tarde,
    bs.is_active as activo
FROM barbers b
JOIN barber_schedules bs ON b.id = bs.barber_id
WHERE b.is_active = true AND bs.is_active = true
ORDER BY b.id, bs.day_of_week;

-- ========================================
-- RESULTADO ESPERADO
-- ========================================

-- Después de ejecutar este script deberías ver:
-- - Todos los barberos con 7 días configurados (0-6)
-- - Sábado (día 6) disponible para todos
-- - Domingo (día 0) disponible para todos
-- - Horarios: 09:00-12:00 y 14:00-17:00/19:00

SELECT 'Corrección completada. Revisa los resultados arriba.' as mensaje_final;