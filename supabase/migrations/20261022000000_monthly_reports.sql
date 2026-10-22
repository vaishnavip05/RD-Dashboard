-- ══════════════════════════════════════════════════════════════════════════
-- SRM R&D PORTAL — MONTHLY REPORTS TABLE
-- Research Scholar Monthly Report cum Fellowship Claim Workflow
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/nutpsipnmiwjequjowhj/sql/new
-- ══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Monthly Reports Table (Scholar Monthly Report / Fellowship Claim)
DROP TABLE IF EXISTS public.monthly_reports CASCADE;
CREATE TABLE public.monthly_reports (
    id TEXT PRIMARY KEY,                       -- e.g. 'rpt_1698765432000_sch_42'
    report_type TEXT DEFAULT 'MONTHLY',        -- 'MONTHLY' | 'DAILY' | 'DAY8'
    scholar_id TEXT NOT NULL,                  -- references research_scholars.register_number or static id
    scholar_name TEXT NOT NULL,
    register_number TEXT,
    supervisor_id TEXT,                        -- supervisor employee_id or static id
    supervisor_name TEXT,
    department TEXT,
    business_unit TEXT DEFAULT 'E&T',         -- 'E&T' | 'FLABS' | 'Management'
    group_name TEXT,

    -- Report period
    month_year TEXT,                           -- e.g. 'October 2026'
    period TEXT,                               -- e.g. '14/09/2026 to 13/10/2026'

    -- Status & approval chain
    status TEXT DEFAULT 'DRAFT',
    -- DRAFT → SUBMITTED_TO_SUPERVISOR → SUPERVISOR_APPROVED → HOD_APPROVED → DEPUTY_DEAN_APPROVED → VERIFIED
    -- Any stage → RETURNED_TO_SCHOLAR

    -- Full report JSON (contains all form fields, sub-tables, approval history)
    report_data JSONB NOT NULL DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_monthly_reports_scholar_id ON public.monthly_reports(scholar_id);
CREATE INDEX idx_monthly_reports_supervisor_id ON public.monthly_reports(supervisor_id);
CREATE INDEX idx_monthly_reports_status ON public.monthly_reports(status);
CREATE INDEX idx_monthly_reports_department ON public.monthly_reports(department);
CREATE INDEX idx_monthly_reports_business_unit ON public.monthly_reports(business_unit);

-- Enable RLS with permissive policy for dashboard reads & writes
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access on monthly_reports" ON public.monthly_reports;
CREATE POLICY "Public full access on monthly_reports"
    ON public.monthly_reports FOR ALL USING (true) WITH CHECK (true);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_monthly_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_monthly_reports_updated_at ON public.monthly_reports;
CREATE TRIGGER trg_monthly_reports_updated_at
    BEFORE UPDATE ON public.monthly_reports
    FOR EACH ROW EXECUTE FUNCTION update_monthly_reports_updated_at();
