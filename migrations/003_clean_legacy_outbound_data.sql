-- Script para limpiar datos legacy de despachos que no se registraron correctamente
-- Versión segura que verifica si las tablas existen

DO $$
BEGIN
    -- Verificar si las tablas legacy existen
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logis_outbound_documents')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logis_outbound_items') THEN

        RAISE NOTICE 'Tablas legacy encontradas, procediendo con limpieza inteligente...';

        -- Mostrar qué documentos existen antes de limpiar
        RAISE NOTICE 'Documentos legacy antes de limpieza:';
        FOR doc IN
            SELECT document_number, receiver_name, created_at::date as fecha
            FROM logis_outbound_documents
            ORDER BY created_at DESC
            LIMIT 5
        LOOP
            RAISE NOTICE '  - %: % (%s)', doc.document_number, doc.receiver_name, doc.fecha;
        END LOOP;

        -- LIMPIAR - Eliminar items primero (por foreign key)
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

        -- LIMPIAR - Eliminar documentos legacy sin movimientos correspondientes
        DELETE FROM logis_outbound_documents
        WHERE NOT EXISTS (
            SELECT 1 FROM movements m
            WHERE m.document_number = logis_outbound_documents.document_number
            AND m.type = 'OUTBOUND'
        );

        -- Verificación final
        RAISE NOTICE 'Limpieza completada exitosamente.';
        RAISE NOTICE 'Documentos restantes en legacy: %', (SELECT COUNT(*) FROM logis_outbound_documents);
        RAISE NOTICE 'Items restantes en legacy: %', (SELECT COUNT(*) FROM logis_outbound_items);

    ELSE
        RAISE NOTICE 'Las tablas legacy (logis_outbound_documents, logis_outbound_items) no existen en la base de datos.';
        RAISE NOTICE 'No hay datos legacy que limpiar.';
    END IF;
END $$;