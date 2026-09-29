-- Add application tracking fields to jobs table
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS application_status TEXT DEFAULT 'not_applied',
ADD COLUMN IF NOT EXISTS browserbase_session_id TEXT,
ADD COLUMN IF NOT EXISTS required_fields JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS missing_fields JSONB DEFAULT '{}'::jsonb;

-- Ensure application_status is one of the allowed values
ALTER TABLE public.jobs
ADD CONSTRAINT valid_application_status 
CHECK (application_status IN ('not_applied', 'detecting_fields', 'missing_info', 'applying', 'applied', 'failed'));
