-- Migration 001: Add is_superuser column to usuarios_sso
-- Run this in Supabase SQL editor or via psql connected to your Supabase DB
-- NOTE: Review and run in a safe environment (backup recommended).

ALTER TABLE public.usuarios_sso
  ADD COLUMN IF NOT EXISTS is_superuser boolean DEFAULT false;

-- Optional: Backfill existing admins if desired (change email to your superuser)
-- Uncomment and run the backfill you need
-- Backfill by environment/set_admin (recommended):
-- UPDATE public.usuarios_sso SET is_superuser = TRUE WHERE email = 'carlosalegria@me.com';

-- Or backfill from existing rol_admin true values
-- UPDATE public.usuarios_sso SET is_superuser = TRUE WHERE rol_admin IS TRUE;