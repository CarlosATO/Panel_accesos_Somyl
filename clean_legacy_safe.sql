-- Script seguro para limpiar datos legacy SOLO SI las tablas existen
-- Este script verifica primero si las tablas existen antes de intentar limpiar

DO $$
BEGIN
    -- Verificar si las tablas legacy existen
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logis_outbound_documents') THEN
        RAISE NOTICE 'Tabla logis_outbound_documents existe, procediendo con limpieza...';

        -- Paso 1: Ver qué documentos legacy existen
        RAISE NOTICE 'Documentos legacy encontrados:';
        PERFORM
            schemaname, tablename
        FROM pg_tables
        WHERE tablename LIKE '%outbound%' OR tablename LIKE '%logis%';

        -- Paso 2: LIMPIAR - Eliminar items primero (por foreign key)
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

        -- Paso 3: LIMPIAR - Eliminar documentos legacy sin movimientos correspondientes
        DELETE FROM logis_outbound_documents
        WHERE NOT EXISTS (
            SELECT 1 FROM movements m
            WHERE m.document_number = logis_outbound_documents.document_number
            AND m.type = 'OUTBOUND'
        );

        -- Verificación final
        RAISE NOTICE 'Limpieza completada. Documentos restantes: %, Items restantes: %',
            (SELECT COUNT(*) FROM logis_outbound_documents),
            (SELECT COUNT(*) FROM logis_outbound_items);

    ELSE
        RAISE NOTICE 'Las tablas legacy no existen, no hay nada que limpiar.';
    END IF;
END $$;