-- SOLUCIÓN: Resolver conflicto de funciones dispatch_materials
-- Ejecuta este script COMPLETO en Supabase SQL Editor

-- Paso 1: Eliminar funciones existentes que causan conflicto
DROP FUNCTION IF EXISTS dispatch_materials(uuid, integer, text, text, text, text, text, jsonb);
DROP FUNCTION IF EXISTS dispatch_materials(uuid, integer, text, text, text, jsonb, text, text);

-- Paso 2: Crear la función correcta con la firma que espera el frontend
CREATE OR REPLACE FUNCTION dispatch_materials(
    p_warehouse_id UUID,
    p_project_id INTEGER,
    p_document_number TEXT,
    p_receiver_name TEXT,
    p_user_email TEXT,
    p_items JSONB,
    p_receiver_rut TEXT DEFAULT '',
    p_receiver_stage TEXT DEFAULT ''
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    item_record JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    v_is_rack BOOLEAN;
    v_source_id TEXT;
    v_current_stock INTEGER;
    v_new_stock INTEGER;
BEGIN
    -- Validar que todos los parámetros requeridos estén presentes
    IF p_warehouse_id IS NULL OR p_project_id IS NULL OR p_document_number IS NULL OR p_user_email IS NULL THEN
        RAISE EXCEPTION 'Parámetros requeridos faltantes';
    END IF;

    -- Procesar cada item del despacho
    FOR item_record IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Extraer datos del item
        v_product_id := (item_record->>'productId')::UUID;
        v_quantity := (item_record->>'quantity')::INTEGER;
        v_is_rack := (item_record->>'isRack')::BOOLEAN;
        v_source_id := item_record->>'sourceId';

        -- Validar datos del item
        IF v_product_id IS NULL OR v_quantity IS NULL OR v_quantity <= 0 THEN
            RAISE EXCEPTION 'Datos de item inválidos: productId=%, quantity=%', v_product_id, v_quantity;
        END IF;

        -- Si es de rack, actualizar stock en product_locations
        IF v_is_rack THEN
            -- Obtener stock actual
            SELECT quantity INTO v_current_stock
            FROM product_locations
            WHERE id = v_source_id::UUID;

            IF v_current_stock IS NULL THEN
                RAISE EXCEPTION 'Ubicación de rack no encontrada: %', v_source_id;
            END IF;

            IF v_current_stock < v_quantity THEN
                RAISE EXCEPTION 'Stock insuficiente en rack. Disponible: %, Solicitado: %', v_current_stock, v_quantity;
            END IF;

            -- Calcular nuevo stock
            v_new_stock := v_current_stock - v_quantity;

            -- Actualizar o eliminar el registro de ubicación
            IF v_new_stock <= 0 THEN
                DELETE FROM product_locations WHERE id = v_source_id::UUID;
            ELSE
                UPDATE product_locations SET quantity = v_new_stock WHERE id = v_source_id::UUID;
            END IF;
        END IF;

        -- Registrar movimiento OUTBOUND
        INSERT INTO movements (
            type,
            warehouse_id,
            product_id,
            quantity,
            document_number,
            authorized_by,
            project_origin,
            project_destination,
            other_data,
            user_email,
            created_at
        ) VALUES (
            'OUTBOUND',
            p_warehouse_id,
            v_product_id,
            v_quantity,
            p_document_number,
            p_receiver_name,
            'Bodega', -- Origen es bodega
            'Proyecto Externo', -- Destino es proyecto externo
            jsonb_build_object(
                'receiver_name', p_receiver_name,
                'receiver_rut', p_receiver_rut,
                'receiver_stage', p_receiver_stage,
                'project_id', p_project_id,
                'is_rack', v_is_rack,
                'source_id', v_source_id
            ),
            p_user_email,
            NOW()
        );

    END LOOP;

    -- Log de auditoría (opcional)
    RAISE NOTICE 'Despacho procesado exitosamente: % items, documento: %', jsonb_array_length(p_items), p_document_number;

EXCEPTION
    WHEN OTHERS THEN
        -- Revertir cualquier cambio en caso de error (gracias a la transacción)
        RAISE EXCEPTION 'Error procesando despacho: %', SQLERRM;
END;
$$;

-- Verificación final
SELECT '✅ Función dispatch_materials corregida exitosamente' as status;