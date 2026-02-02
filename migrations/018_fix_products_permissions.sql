-- Habilitar RLS en tabla products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública o autenticada
CREATE POLICY "Lectura products" ON public.products
FOR SELECT TO authenticated, anon USING (true);

-- Permitir inserción/actualización a usuarios autenticados
CREATE POLICY "Escritura products" ON public.products
FOR ALL TO authenticated USING (true) 
WITH CHECK (true);

-- Otorgar permisos
GRANT ALL ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;
