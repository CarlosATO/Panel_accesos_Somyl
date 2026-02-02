-- Agregar columnas faltantes a la tabla rrhh_turnos
-- Se usa IF NOT EXISTS para evitar errores si ya existen

DO $$ 
BEGIN 
    -- 1. Columna break_minutes (Minutos de Colación)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rrhh_turnos' AND column_name = 'break_minutes') THEN
        ALTER TABLE public.rrhh_turnos ADD COLUMN break_minutes INTEGER DEFAULT 60;
    END IF;

    -- 2. Columna tolerance_minutes (Minutos de Tolerancia)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rrhh_turnos' AND column_name = 'tolerance_minutes') THEN
        ALTER TABLE public.rrhh_turnos ADD COLUMN tolerance_minutes INTEGER DEFAULT 15;
    END IF;

    -- 3. Columna work_days (Días Laborales - Array de Enteros 1-7)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rrhh_turnos' AND column_name = 'work_days') THEN
        ALTER TABLE public.rrhh_turnos ADD COLUMN work_days INTEGER[] DEFAULT '{1,2,3,4,5}';
    END IF;

    -- 4. Columna active (Por si acaso no existe)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rrhh_turnos' AND column_name = 'active') THEN
        ALTER TABLE public.rrhh_turnos ADD COLUMN active BOOLEAN DEFAULT TRUE;
    END IF;

END $$;
