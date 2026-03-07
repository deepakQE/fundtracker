-- FundTracker: blog + NGO discovery schema
-- Safe to run multiple times where possible

-- 1) NGO master table
CREATE TABLE IF NOT EXISTS public.ngos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  website TEXT,
  logo TEXT,
  trust_score NUMERIC(5,2) DEFAULT 70,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ngos_trust_score_idx
  ON public.ngos (trust_score DESC);

-- 2) Campaign to NGO linkage
ALTER TABLE IF EXISTS public.campaigns
ADD COLUMN IF NOT EXISTS ngo_id BIGINT;

ALTER TABLE IF EXISTS public.campaigns
ADD COLUMN IF NOT EXISTS ngo_name TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'campaigns_ngo_id_fkey'
      AND conrelid = 'public.campaigns'::regclass
  ) THEN
    ALTER TABLE public.campaigns
      ADD CONSTRAINT campaigns_ngo_id_fkey
      FOREIGN KEY (ngo_id) REFERENCES public.ngos(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS campaigns_ngo_id_idx
  ON public.campaigns (ngo_id);

CREATE INDEX IF NOT EXISTS campaigns_ngo_name_idx
  ON public.campaigns (ngo_name);

-- 3) Blog posts table for SEO content
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS blog_posts_created_at_idx
  ON public.blog_posts (created_at DESC);

-- 4) Ensure newsletter subscribers table exists
CREATE TABLE IF NOT EXISTS public.subscribers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
