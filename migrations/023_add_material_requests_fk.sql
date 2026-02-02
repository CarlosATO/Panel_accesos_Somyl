-- Add Foreign Key to material_requests
-- This fixes the Supabase 400 error when joining with products table

DO $$ 
BEGIN
  -- Check if constraint exists effectively (or just try to add it, ignoring if exists)
  -- But standard way:
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_material_requests_product') THEN
      ALTER TABLE public.material_requests
      ADD CONSTRAINT fk_material_requests_product
      FOREIGN KEY (product_code)
      REFERENCES public.products (code);
  END IF;
END $$;
