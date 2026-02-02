-- Flag para marcar materiales que deben ser visibles en el módulo de RRHH (EPPs, Activos, etc.)
ALTER TABLE public.assigned_materials 
ADD COLUMN IF NOT EXISTS is_rrhh_visible BOOLEAN DEFAULT FALSE;

-- Opcional: Crear índice para búsquedas rápidas desde RRHH
CREATE INDEX IF NOT EXISTS idx_materials_rrhh_visible ON public.assigned_materials(is_rrhh_visible);
