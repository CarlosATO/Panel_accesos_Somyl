-- Habilitar RLS en tabla proveedores (por si acaso)
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública (o auth)
CREATE POLICY "Lectura proveedores" ON public.proveedores
FOR SELECT USING (true);

-- Permitir inserción a todos (anon y auth) ya que el backend usa la key anonima
CREATE POLICY "Inserción proveedores" ON public.proveedores
FOR INSERT WITH CHECK (true);

-- Permitir actualización a todos
CREATE POLICY "Actualización proveedores" ON public.proveedores
FOR UPDATE USING (true);

-- Otorgar permisos
GRANT ALL ON public.proveedores TO anon;
GRANT ALL ON public.proveedores TO authenticated;
GRANT ALL ON public.proveedores TO service_role;
