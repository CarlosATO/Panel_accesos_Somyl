-- Script AGRESIVO para limpiar TODOS los datos legacy de despachos
-- ⚠️  ATENCIÓN: Esto elimina TODOS los registros de las tablas legacy
-- Solo ejecutar si estás seguro de que no necesitas ningún dato legacy

-- Paso 1: Eliminar todos los items
DELETE FROM logis_outbound_items;

-- Paso 2: Eliminar todos los documentos
DELETE FROM logis_outbound_documents;

-- Verificación
SELECT 'Documentos restantes:' as info, COUNT(*) as count FROM logis_outbound_documents;
SELECT 'Items restantes:' as info, COUNT(*) as count FROM logis_outbound_items;