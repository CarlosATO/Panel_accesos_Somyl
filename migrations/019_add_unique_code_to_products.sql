-- Para que el UPSERT funcione usando 'code' como conflicto, debe existir una restricción UNIQUE.
ALTER TABLE public.products ADD CONSTRAINT products_code_key UNIQUE (code);
