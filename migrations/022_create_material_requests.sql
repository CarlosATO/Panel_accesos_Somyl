CREATE TABLE IF NOT EXISTS public.material_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL, -- Referencia a auth.users o public.users (donde esten los empleados) -> En este proyecto employees estan en public.users o rrhh_employees??
    -- Revisando EmployeeList.jsx: usa `rrhh_employees` (NO, usa `users` o `rrhh_employees`?)
    -- EmployeeList hace fetch a `rrhh_employees`? No, linea 66: `rrhh_employee_certifications` con `employee_id`. 
    -- Linea 533 filter `allEmployees`.
    -- Voy a asumir UUID por ahora, sin FK estricta para no romper si borran user, o FK a public.users si existe.
    product_code TEXT NOT NULL, -- Link a products.code
    quantity INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'DELIVERED')),
    requested_by UUID, -- Quien pidio (RRHH)
    processed_by UUID, -- Quien aprobo (Bodega)
    signed_receipt_url TEXT, -- URL del PDF firmado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_material_requests_employee ON public.material_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_material_requests_status ON public.material_requests(status);

-- RLS
ALTER TABLE public.material_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura Requests" ON public.material_requests FOR SELECT USING (true);
CREATE POLICY "Escritura Requests" ON public.material_requests FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON public.material_requests TO authenticated;
GRANT ALL ON public.material_requests TO anon;
