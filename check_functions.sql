-- Ver qué funciones dispatch_materials existen
SELECT
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    obj_description(p.oid, 'pg_proc') as description
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'dispatch_materials'
AND n.nspname = 'public';

-- Si hay funciones existentes, eliminarlas primero
-- DROP FUNCTION IF EXISTS dispatch_materials(uuid, integer, text, text, text, text, text, jsonb);
-- DROP FUNCTION IF EXISTS dispatch_materials(uuid, integer, text, text, text, jsonb, text, text);