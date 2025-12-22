-- Script para limpiar datos legacy de despachos que no se registraron correctamente
-- Esto elimina registros de logis_outbound_* que no tienen movimientos OUTBOUND correspondientes

-- Paso 1: Ver qué documentos legacy existen
SELECT
    lod.id,
    lod.document_number,
    lod.receiver_name,
    lod.created_at,
    COUNT(loi.id) as items_count
FROM logis_outbound_documents lod
LEFT JOIN logis_outbound_items loi ON lod.id = loi.document_id
GROUP BY lod.id, lod.document_number, lod.receiver_name, lod.created_at
ORDER BY lod.created_at DESC;

-- Paso 2: Verificar cuáles NO tienen movimientos OUTBOUND correspondientes
-- (Comentado para que puedas revisar primero)
-- SELECT
--     lod.document_number,
--     lod.receiver_name,
--     COUNT(loi.id) as items_count
-- FROM logis_outbound_documents lod
-- LEFT JOIN logis_outbound_items loi ON lod.id = loi.document_id
-- WHERE NOT EXISTS (
--     SELECT 1 FROM movements m
--     WHERE m.document_number = lod.document_number
--     AND m.type = 'OUTBOUND'
-- )
-- GROUP BY lod.id, lod.document_number, lod.receiver_name;

-- Paso 3: LIMPIAR - Eliminar items primero (por foreign key)
DELETE FROM logis_outbound_items
WHERE document_id IN (
    SELECT lod.id
    FROM logis_outbound_documents lod
    WHERE NOT EXISTS (
        SELECT 1 FROM movements m
        WHERE m.document_number = lod.document_number
        AND m.type = 'OUTBOUND'
    )
);

-- Paso 4: LIMPIAR - Eliminar documentos legacy sin movimientos correspondientes
DELETE FROM logis_outbound_documents
WHERE NOT EXISTS (
    SELECT 1 FROM movements m
    WHERE m.document_number = logis_outbound_documents.document_number
    AND m.type = 'OUTBOUND'
);

-- Verificación final
SELECT 'Documentos restantes en legacy:' as info, COUNT(*) as count FROM logis_outbound_documents;
SELECT 'Items restantes en legacy:' as info, COUNT(*) as count FROM logis_outbound_items;