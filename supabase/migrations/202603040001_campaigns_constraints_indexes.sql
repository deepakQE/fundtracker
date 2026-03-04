-- FundTracker: campaigns table constraints and indexes
-- Safe to run multiple times (idempotent where possible)

-- 1) Ensure external_id column exists for provider-level deduplication
ALTER TABLE IF EXISTS public.campaigns
ADD COLUMN IF NOT EXISTS external_id text;

-- Optional backfill for existing GlobalGiving rows that use gg- prefixed ids
UPDATE public.campaigns
SET external_id = REPLACE(id, 'gg-', '')
WHERE external_id IS NULL
  AND id LIKE 'gg-%';

-- 2) Ensure campaigns.id is NOT NULL
ALTER TABLE IF EXISTS public.campaigns
ALTER COLUMN id SET NOT NULL;

-- 3) Ensure campaigns.id is PRIMARY KEY
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'campaigns_pkey'
      AND conrelid = 'public.campaigns'::regclass
  ) THEN
    ALTER TABLE public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);
  END IF;
END $$;

-- 4) Ensure UNIQUE constraint for external_id when duplicate-free
--    If duplicates exist, migration will skip adding the unique constraint and emit a notice.
DO $$
DECLARE
  has_duplicates boolean;
BEGIN
  SELECT EXISTS (
    SELECT external_id
    FROM public.campaigns
    WHERE external_id IS NOT NULL
    GROUP BY external_id
    HAVING COUNT(*) > 1
  ) INTO has_duplicates;

  IF has_duplicates THEN
    RAISE NOTICE 'Skipping campaigns_external_id_key creation: duplicate external_id values exist.';
  ELSIF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'campaigns_external_id_key'
      AND conrelid = 'public.campaigns'::regclass
  ) THEN
    ALTER TABLE public.campaigns
    ADD CONSTRAINT campaigns_external_id_key UNIQUE (external_id);
  END IF;
END $$;

-- 5) Indexes for sorting/filtering
CREATE INDEX IF NOT EXISTS campaigns_trend_score_idx
  ON public.campaigns (trend_score DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS campaigns_category_idx
  ON public.campaigns (category);

CREATE INDEX IF NOT EXISTS campaigns_created_at_idx
  ON public.campaigns (created_at DESC NULLS LAST);
