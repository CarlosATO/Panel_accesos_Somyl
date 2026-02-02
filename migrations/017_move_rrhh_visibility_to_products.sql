-- Mover el flag de visibilidad a la tabla 'products' que gestiona atributos locales de TODOS los items (Compras y Asignados)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_rrhh_visible BOOLEAN DEFAULT FALSE;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_products_rrhh_visible ON public.products(is_rrhh_visible);

-- (Opcional) Migrar datos si alguien ya usó la otra tabla (aunque acabamos de crearla)
-- UPDATE public.products p SET is_rrhh_visible = am.is_rrhh_visible 
-- FROM public.assigned_materials am WHERE p.code = am.code;
