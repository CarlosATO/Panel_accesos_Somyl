-- Corregir tabla de parámetros de remuneraciones
-- Agregar columnas faltantes (topes imponibles)

DO $$ 
BEGIN 
    -- Verificar si la tabla existe
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'rrhh_payroll_parameters') THEN
        
        -- Columna Tope AFP (UF)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rrhh_payroll_parameters' AND column_name = 'top_limit_afp') THEN
            ALTER TABLE public.rrhh_payroll_parameters ADD COLUMN top_limit_afp NUMERIC(10, 2) DEFAULT 84.3;
        END IF;

        -- Columna Tope Cesantía (UF)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rrhh_payroll_parameters' AND column_name = 'top_limit_cesantia') THEN
            ALTER TABLE public.rrhh_payroll_parameters ADD COLUMN top_limit_cesantia NUMERIC(10, 2) DEFAULT 126.6;
        END IF;

        -- Asegurar otras columnas básicas
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rrhh_payroll_parameters' AND column_name = 'uf_value') THEN
            ALTER TABLE public.rrhh_payroll_parameters ADD COLUMN uf_value NUMERIC(10, 2) DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rrhh_payroll_parameters' AND column_name = 'utm_value') THEN
            ALTER TABLE public.rrhh_payroll_parameters ADD COLUMN utm_value NUMERIC(10, 2) DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rrhh_payroll_parameters' AND column_name = 'min_wage') THEN
            ALTER TABLE public.rrhh_payroll_parameters ADD COLUMN min_wage NUMERIC(12, 0) DEFAULT 500000;
        END IF;

    ELSE
        -- Si la tabla NO existe, crearla desde cero
        CREATE TABLE public.rrhh_payroll_parameters (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            period_date DATE NOT NULL UNIQUE, -- Un registro por mes (2025-01-01)
            
            uf_value NUMERIC(10, 2) DEFAULT 0,
            utm_value NUMERIC(10, 2) DEFAULT 0,
            min_wage NUMERIC(12, 0) DEFAULT 500000,
            
            top_limit_afp NUMERIC(10, 2) DEFAULT 84.3,
            top_limit_cesantia NUMERIC(10, 2) DEFAULT 126.6,
            
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Habilitar RLS
        ALTER TABLE public.rrhh_payroll_parameters ENABLE ROW LEVEL SECURITY;
        
        -- Políticas permisivas
        CREATE POLICY "Lectura Payroll Params" ON public.rrhh_payroll_parameters FOR SELECT TO authenticated USING (true);
        CREATE POLICY "Escritura Payroll Params" ON public.rrhh_payroll_parameters FOR ALL TO authenticated USING (true);
    END IF;

END $$;
