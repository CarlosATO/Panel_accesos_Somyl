-- Create table for Evaluations (Header)
CREATE TABLE IF NOT EXISTS rrhh_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES rrhh_employees(id) ON DELETE CASCADE,
    period TEXT NOT NULL, -- e.g., '2026-Q1'
    evaluator_id UUID, -- References auth.users or local user ID depending on auth setup
    general_feedback TEXT,
    average_score NUMERIC(3, 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for Evaluation Skills (Details)
CREATE TABLE IF NOT EXISTS rrhh_evaluation_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID REFERENCES rrhh_evaluations(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    score INTEGER CHECK (score >= 1 AND score <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE rrhh_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rrhh_evaluation_skills ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow all authenticated users for now, can be refined later)
CREATE POLICY "Enable read/write for authenticated users" ON rrhh_evaluations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable read/write for authenticated users" ON rrhh_evaluation_skills
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
