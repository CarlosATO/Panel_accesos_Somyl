-- Agregar columna supervisor_id para el organigrama
-- Esta columna es una auto-referencia a la misma tabla de empleados

DO $$ 
BEGIN 
    -- 1. Intentar en 'rrhh_employees'
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'rrhh_employees') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rrhh_employees' AND column_name = 'supervisor_id') THEN
            ALTER TABLE public.rrhh_employees ADD COLUMN supervisor_id UUID REFERENCES public.rrhh_employees(id);
        END IF;
    END IF;

    -- 2. Intentar en 'employees'
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'employees') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'supervisor_id') THEN
            ALTER TABLE public.employees ADD COLUMN supervisor_id UUID REFERENCES public.employees(id);
        END IF;
    END IF;
END $$;
