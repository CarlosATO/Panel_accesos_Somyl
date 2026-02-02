-- Actualizar nombres y apellidos a mayúsculas
-- Se aplica tanto a rrhh_employees como a employees por seguridad

DO $$
BEGIN
    -- 1. Actualizar rrhh_employees
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'rrhh_employees') THEN
        UPDATE public.rrhh_employees
        SET first_name = UPPER(first_name),
            last_name = UPPER(last_name);
    END IF;

    -- 2. Actualizar employees
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'employees') THEN
        UPDATE public.employees
        SET first_name = UPPER(first_name),
            last_name = UPPER(last_name);
    END IF;
END $$;
