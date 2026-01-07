-- Debug version of dispatch_materials RPC with logging

CREATE OR REPLACE FUNCTION dispatch_materials_debug(
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
    item_record RECORD;
    product_id_val UUID;
    quantity_val INTEGER;
    is_rack_val BOOLEAN;
    source_id_val UUID;
BEGIN
    -- Process each item in the dispatch
    FOR item_record IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Extract values for debugging
        product_id_val := (item_record.value->>'productId')::UUID;
        quantity_val := (item_record.value->>'quantity')::INTEGER;
        is_rack_val := (item_record.value->>'isRack')::BOOLEAN;
        source_id_val := (item_record.value->>'sourceId')::UUID;

        RAISE NOTICE 'Processing item: product_id=%, quantity=%, is_rack=%, source_id=%',
            product_id_val, quantity_val, is_rack_val, source_id_val;

        -- Log the outbound movement
        INSERT INTO movements (
            warehouse_id,
            product_id,
            type,
            quantity,
            document_number,
            user_email,
            project_id,
            other_data
        ) VALUES (
            p_warehouse_id,
            product_id_val,
            'OUTBOUND',
            quantity_val,
            p_document_number,
            p_user_email,
            p_project_id,
            jsonb_build_object(
                'is_rack', is_rack_val,
                'source_id', source_id_val,
                'project_id', p_project_id,
                'receiver_name', p_receiver_name,
                'receiver_rut', p_receiver_rut,
                'receiver_stage', p_receiver_stage
            )
        );

        -- Update stock based on whether it's from a rack or general stock
        IF is_rack_val = true THEN
            RAISE NOTICE 'Updating rack location: source_id=%, quantity=%', source_id_val, quantity_val;

            -- Update specific rack location
            UPDATE product_locations
            SET quantity = quantity - quantity_val
            WHERE id = source_id_val
              AND quantity >= quantity_val;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Insufficient stock in rack location % for product %',
                    source_id_val, product_id_val;
            END IF;

            RAISE NOTICE 'Rack location updated successfully';

            -- Also update the general product stock
            RAISE NOTICE 'Updating general product stock: product_id=%, quantity=%', product_id_val, quantity_val;

            UPDATE products
            SET current_stock = current_stock - quantity_val
            WHERE id = product_id_val
              AND current_stock >= quantity_val;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Insufficient general stock for product %',
                    product_id_val;
            END IF;

            RAISE NOTICE 'General product stock updated successfully';

        ELSE
            RAISE NOTICE 'Updating general stock only: product_id=%, quantity=%', product_id_val, quantity_val;

            -- Update general stock only
            UPDATE products
            SET current_stock = current_stock - quantity_val
            WHERE id = product_id_val
              AND current_stock >= quantity_val;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Insufficient stock for product %',
                    product_id_val;
            END IF;

            RAISE NOTICE 'General stock updated successfully';
        END IF;
    END LOOP;

EXCEPTION
    WHEN OTHERS THEN
        -- Rollback will happen automatically
        RAISE EXCEPTION 'Error procesando despacho: %', SQLERRM;
END;
$$;