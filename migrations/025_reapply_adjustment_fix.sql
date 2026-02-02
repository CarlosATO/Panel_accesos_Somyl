-- Migration: Force Fix process_inventory_adjustment RPC
-- Description: Re-applies the function definition to use 'created_at' instead of 'movement_date'.
-- This is necessary because 024 seemingly didn't apply or persisted an old version.

CREATE OR REPLACE FUNCTION public.process_inventory_adjustment(
    p_warehouse_id UUID,
    p_product_id BIGINT,
    p_qty NUMERIC,
    p_type TEXT,
    p_reason TEXT,
    p_location_id BIGINT,
    p_comments TEXT,
    p_user_email TEXT,
    p_project_id TEXT, -- Puede venir como string desde frontend
    p_evidence_url TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_type TEXT;
    v_document_number TEXT;
    v_current_qty NUMERIC;
    v_project_id BIGINT;
BEGIN
    -- 1. Validar / Convertir Inputs
    IF p_type = 'INCREASE' THEN
        v_type := 'INBOUND';
    ELSIF p_type = 'DECREASE' THEN
        v_type := 'OUTBOUND';
    ELSE
        RAISE EXCEPTION 'Tipo de ajuste inválido: %', p_type;
    END IF;

    -- Generar un número de documento automático para el ajuste
    v_document_number := 'ADJ-' || to_char(now(), 'YYYYMMDDHH24MISS');

    -- Convertir project_id a BIGINT si es posible
    IF p_project_id IS NULL OR p_project_id = '' OR p_project_id = 'null' THEN
        v_project_id := NULL;
    ELSE
        BEGIN
            v_project_id := p_project_id::BIGINT;
        EXCEPTION WHEN OTHERS THEN
             v_project_id := NULL;
        END;
    END IF;


    -- 2. Insertar en MOVEMENTS
    -- CORRECCION: Usamos 'created_at'
    INSERT INTO public.movements (
        created_at,
        warehouse_id,
        product_id,
        type,
        quantity,
        document_number,
        project_id,
        user_id, 
        comments
    ) VALUES (
        now(),
        p_warehouse_id,
        p_product_id,
        v_type,
        p_qty, 
        v_document_number,
        v_project_id,
        (SELECT id FROM auth.users WHERE email = p_user_email LIMIT 1),
        'AJUSTE [' || p_reason || ']: ' || p_comments || ' (Evidencia: ' || COALESCE(p_evidence_url, 'N/A') || ')'
    );

    -- 3. Actualizar PRODUCT_LOCATIONS (Stock Físico en Racks)
    SELECT quantity INTO v_current_qty
    FROM public.product_locations
    WHERE warehouse_id = p_warehouse_id
      AND location_id = p_location_id
      AND product_id = p_product_id;

    IF v_current_qty IS NULL THEN
        -- No existe, creamos.
        IF v_type = 'OUTBOUND' THEN
             RAISE EXCEPTION 'No se puede descontar stock de una ubicación donde no existe el producto.';
        END IF;

        INSERT INTO public.product_locations (
            warehouse_id,
            location_id,
            product_id,
            quantity
        ) VALUES (
            p_warehouse_id,
            p_location_id,
            p_product_id,
            p_qty
        );
    ELSE
        -- Existe, actualizamos
        IF v_type = 'INBOUND' THEN
            UPDATE public.product_locations
            SET quantity = quantity + p_qty
            WHERE warehouse_id = p_warehouse_id 
              AND location_id = p_location_id 
              AND product_id = p_product_id;
        ELSE -- OUTBOUND
            -- Validar no quedar en negativo
            IF (v_current_qty - p_qty) < 0 THEN
                RAISE EXCEPTION 'Stock insuficiente en la ubicación seleccionada. Disponible: %, Solicitado: %', v_current_qty, p_qty;
            END IF;

            UPDATE public.product_locations
            SET quantity = quantity - p_qty
            WHERE warehouse_id = p_warehouse_id 
              AND location_id = p_location_id 
              AND product_id = p_product_id;
        END IF;
    END IF;

END;
$$;
