-- ══════════════════════════════════════════════════════════════════════════
-- SRM R&D DASHBOARD — SUPABASE TABLE SCHEMAS & POLICIES (RUN THIS IN SQL EDITOR)
-- Project: https://supabase.com/dashboard/project/pndvjkcoroadxonvpphb/sql/new
-- ══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Publications Table
DROP TABLE IF EXISTS public.publications CASCADE;
CREATE TABLE public.publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_unit TEXT NOT NULL,
    department TEXT NOT NULL,
    year INTEGER NOT NULL,
    paper_title TEXT NOT NULL,
    author TEXT,
    publication_date TEXT,
    indexing_type TEXT DEFAULT 'Scopus',
    quartile TEXT,
    impact_factor TEXT,
    doi TEXT,
    publication_link TEXT,
    publisher TEXT,
    issn TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_publications_bu_dept_year ON public.publications(business_unit, department, year);

-- 2. Patents Table
DROP TABLE IF EXISTS public.patents CASCADE;
CREATE TABLE public.patents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_unit TEXT NOT NULL,
    department TEXT NOT NULL,
    year INTEGER NOT NULL,
    patent_title TEXT NOT NULL,
    applicant_name TEXT,
    inventors TEXT,
    patent_category TEXT DEFAULT 'Utility',
    patent_status TEXT DEFAULT 'Published',
    patent_filing_date TEXT,
    patent_published_date TEXT,
    granted_date TEXT,
    status_of_commercialization TEXT DEFAULT 'No',
    proof_link TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_patents_bu_dept_year ON public.patents(business_unit, department, year);

-- 3. Funded Projects Table
DROP TABLE IF EXISTS public.funded_projects CASCADE;
CREATE TABLE public.funded_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_unit TEXT NOT NULL,
    department TEXT NOT NULL,
    year INTEGER NOT NULL,
    project_title TEXT NOT NULL,
    principal_investigator TEXT,
    co_investigators TEXT,
    funding_agency TEXT,
    amount TEXT,
    duration TEXT,
    status TEXT DEFAULT 'Sanctioned',
    scheme TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_funded_bu_dept_year ON public.funded_projects(business_unit, department, year);

-- 4. Consultancy Projects Table
DROP TABLE IF EXISTS public.consultancy_projects CASCADE;
CREATE TABLE public.consultancy_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_unit TEXT NOT NULL,
    department TEXT NOT NULL,
    year INTEGER NOT NULL,
    project_title TEXT NOT NULL,
    faculty_name TEXT,
    faculty_designation TEXT,
    faculty_erp_id TEXT,
    client_name TEXT,
    funding_agency TEXT,
    amount TEXT,
    start_date TEXT,
    end_date TEXT,
    status TEXT DEFAULT 'Ongoing',
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_consultancy_bu_dept_year ON public.consultancy_projects(business_unit, department, year);

-- 5. Research Supervisors Table
DROP TABLE IF EXISTS public.research_supervisors CASCADE;
CREATE TABLE public.research_supervisors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_unit TEXT NOT NULL,
    department TEXT NOT NULL,
    year INTEGER NOT NULL,
    employee_id TEXT,
    supervisor_name TEXT NOT NULL,
    year_of_phd TEXT,
    discipline TEXT,
    research_area TEXT,
    proof_link TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_supervisors_bu_dept_year ON public.research_supervisors(business_unit, department, year);

-- 6. Research Scholars Table
DROP TABLE IF EXISTS public.research_scholars CASCADE;
CREATE TABLE public.research_scholars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_unit TEXT NOT NULL,
    department TEXT NOT NULL,
    year INTEGER NOT NULL,
    register_number TEXT,
    application_number TEXT,
    scholar_name TEXT NOT NULL,
    programme TEXT DEFAULT 'Ph.D',
    supervisor_name TEXT,
    year_of_enrollment INTEGER,
    category TEXT DEFAULT 'Full-time',
    research_area TEXT,
    status TEXT DEFAULT 'Ongoing',
    proof_link TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_scholars_bu_dept_year ON public.research_scholars(business_unit, department, year);

-- 7. Research Awards Table
DROP TABLE IF EXISTS public.research_awards CASCADE;
CREATE TABLE public.research_awards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_unit TEXT NOT NULL,
    department TEXT NOT NULL,
    year INTEGER NOT NULL,
    award_id TEXT,
    faculty_name TEXT NOT NULL,
    award_name TEXT NOT NULL,
    awarding_org TEXT,
    award_category TEXT DEFAULT 'State',
    proof_link TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_awards_bu_dept_year ON public.research_awards(business_unit, department, year);

-- 8. Faculty Counts Table
DROP TABLE IF EXISTS public.faculty_counts CASCADE;
CREATE TABLE public.faculty_counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_unit TEXT NOT NULL,
    department TEXT NOT NULL,
    year INTEGER NOT NULL,
    faculty_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_unit, department, year)
);

-- Enable RLS and create permissive policies for dashboard reads & writes
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('publications', 'patents', 'funded_projects', 'consultancy_projects', 
                           'research_supervisors', 'research_scholars', 'research_awards', 'faculty_counts')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('DROP POLICY IF EXISTS "Public full access on %I" ON public.%I;', t, t);
        EXECUTE format('CREATE POLICY "Public full access on %I" ON public.%I FOR ALL USING (true) WITH CHECK (true);', t, t);
    END LOOP;
END $$;
