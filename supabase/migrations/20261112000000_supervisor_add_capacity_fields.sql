-- Migration: Add Designation and Scholar Capacity Fields to research_supervisors table
-- Phase 1 Enhancement: Additive changes only. Preserves all existing records, keys, and relations.

ALTER TABLE public.research_supervisors
  ADD COLUMN IF NOT EXISTS designation TEXT,
  ADD COLUMN IF NOT EXISTS maximum_scholar_capacity INTEGER,
  ADD COLUMN IF NOT EXISTS current_scholar_count INTEGER,
  ADD COLUMN IF NOT EXISTS available_vacancies INTEGER;

-- Comment on columns for schema clarity
COMMENT ON COLUMN public.research_supervisors.designation IS 'Supervisor designation (e.g., Assistant Professor, Associate Professor, Professor)';
COMMENT ON COLUMN public.research_supervisors.maximum_scholar_capacity IS 'Maximum scholar supervision capacity';
COMMENT ON COLUMN public.research_supervisors.current_scholar_count IS 'Current number of scholars under supervision';
COMMENT ON COLUMN public.research_supervisors.available_vacancies IS 'Remaining available scholar vacancies';
