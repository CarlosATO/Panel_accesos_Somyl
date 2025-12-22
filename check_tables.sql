-- Script para verificar qué tablas existen en la base de datos
-- Ejecuta esto primero para ver las tablas disponibles

SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- También buscar tablas que contengan "outbound" o "logis"
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
AND (tablename LIKE '%outbound%' OR tablename LIKE '%logis%')
ORDER BY tablename;