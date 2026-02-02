-- Habilitar permisos para tabla proveedores
-- Necesario para que el módulo de RRHH pueda leer/escribir contratistas

DO $$ 
BEGIN 
    -- Verificar si la tabla existe
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'proveedores') THEN
        
        -- Habilitar RLS si no está habilitado (aunque por defecto suele estarlo o no)
        ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;

        -- Política para SELECT (Ver proveedores)
        DROP POLICY IF EXISTS "Permitir lectura a autenticados" ON public.proveedores;
        CREATE POLICY "Permitir lectura a autenticados" ON public.proveedores FOR SELECT TO authenticated USING (true);

        -- Política para INSERT (Crear proveedores/contratistas)
        DROP POLICY IF EXISTS "Permitir creación a autenticados" ON public.proveedores;
        CREATE POLICY "Permitir creación a autenticados" ON public.proveedores FOR INSERT TO authenticated WITH CHECK (true);

        -- Política para UPDATE (Marcar/Desmarcar subcontrato)
        DROP POLICY IF EXISTS "Permitir edición a autenticados" ON public.proveedores;
        CREATE POLICY "Permitir edición a autenticados" ON public.proveedores FOR UPDATE TO authenticated USING (true);

    END IF;
END $$;
