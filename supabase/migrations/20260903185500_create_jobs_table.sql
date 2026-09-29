-- Create jobs table to cache scraped job postings
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    company_logo TEXT,
    location TEXT NOT NULL,
    salary TEXT,
    job_type TEXT,
    experience_level TEXT,
    description TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    match_score NUMERIC DEFAULT 0,
    job_url TEXT NOT NULL,
    source_url TEXT,
    applied_status BOOLEAN DEFAULT FALSE,
    saved_status BOOLEAN DEFAULT FALSE,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own jobs."
    ON public.jobs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs."
    ON public.jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs."
    ON public.jobs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs."
    ON public.jobs FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster querying by user_id and fetched_at
CREATE INDEX IF NOT EXISTS jobs_user_id_fetched_at_idx ON public.jobs (user_id, fetched_at DESC);
