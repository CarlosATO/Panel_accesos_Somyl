-- Add Audit Columns to Attendance Logs
ALTER TABLE rrhh_attendance_logs 
ADD COLUMN IF NOT EXISTS edit_reason TEXT,
ADD COLUMN IF NOT EXISTS edited_by UUID, -- Can be linked to auth.users or usuarios_sso
ADD COLUMN IF NOT EXISTS is_modified BOOLEAN DEFAULT FALSE;

-- Optional: If we want to strictly link edited_by to a user table
-- ALTER TABLE rrhh_attendance_logs 
-- ADD CONSTRAINT fk_edited_by FOREIGN KEY (edited_by) REFERENCES auth.users(id);
