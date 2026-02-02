-- Agregar columna 'images' si no existe
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Asegurar que image_url también exista (usado para la imagen principal)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
