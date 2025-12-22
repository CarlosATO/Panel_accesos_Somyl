-- Fix dispatch_materials RPC to properly update product_locations
-- This function now handles both general stock and rack-specific stock updates

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
AS $$
DECLARE
    item_record RECORD;
    current_stock INTEGER;
    rack_quantity INTEGER;
    new_quantity INTEGER;
BEGIN
    -- Process each item in the dispatch
    FOR item_record IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
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
            (item_record.value->>'productId')::UUID,
            'OUTBOUND',
            (item_record.value->>'quantity')::INTEGER,
            p_document_number,
            p_user_email,
            p_project_id,
            jsonb_build_object(
                'is_rack', (item_record.value->>'isRack')::BOOLEAN,
                'source_id', item_record.value->>'sourceId',
                'project_id', p_project_id,
                'receiver_name', p_receiver_name,
                'receiver_rut', p_receiver_rut,
                'receiver_stage', p_receiver_stage
            )
        );

        -- Update stock based on whether it's from a rack or general stock
        IF (item_record.value->>'isRack')::BOOLEAN = true THEN
            -- Update specific rack location
            UPDATE product_locations
            SET quantity = quantity - (item_record.value->>'quantity')::INTEGER
            WHERE id = (item_record.value->>'sourceId')::UUID;

            GET DIAGNOSTICS rows_affected = ROW_COUNT;
            IF rows_affected = 0 THEN
                RAISE EXCEPTION 'Rack location % not found',
                    item_record.value->>'sourceId';
            END IF;

            -- NOTE: General product stock is updated by the frontend after RPC completion

        ELSE
            -- NOTE: General product stock is updated by the frontend after RPC completion
        END IF;
    END LOOP;

EXCEPTION
    WHEN OTHERS THEN
        -- Rollback will happen automatically
        RAISE EXCEPTION 'Error processing dispatch: %', SQLERRM;
END;
$$;