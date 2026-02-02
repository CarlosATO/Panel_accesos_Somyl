-- Agregar columnas nuevas a la tabla de empleados (rrhh_employees y/o employees)
-- Se intenta aplicar a ambas opciones por consistencia

DO $$ 
BEGIN 
    -- 1. Intentar en 'rrhh_employees' (Nombre usado por la app actualmente)
    -- Verificar si la tabla existe primero
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'rrhh_employees') THEN
        
        -- Nacionalidad
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rrhh_employees' AND column_name = 'nationality') THEN
            ALTER TABLE public.rrhh_employees ADD COLUMN nationality TEXT DEFAULT 'Chilena';
        END IF;

        -- Fecha Nacimiento
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rrhh_employees' AND column_name = 'birth_date') THEN
            ALTER TABLE public.rrhh_employees ADD COLUMN birth_date DATE;
        END IF;

        -- Fecha Término Contrato
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rrhh_employees' AND column_name = 'termination_date') THEN
            ALTER TABLE public.rrhh_employees ADD COLUMN termination_date DATE;
        END IF;

    END IF;

    -- 2. Intentar en 'employees' (Nombre alternativo o base)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'employees') THEN
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'nationality') THEN
            ALTER TABLE public.employees ADD COLUMN nationality TEXT DEFAULT 'Chilena';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'birth_date') THEN
            ALTER TABLE public.employees ADD COLUMN birth_date DATE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'termination_date') THEN
            ALTER TABLE public.employees ADD COLUMN termination_date DATE;
        END IF;

    END IF;

END $$;
