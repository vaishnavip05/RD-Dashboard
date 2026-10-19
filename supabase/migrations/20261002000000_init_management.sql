-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Business Units
CREATE TABLE public.business_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL
);

-- Departments
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_unit_id UUID REFERENCES public.business_units(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    UNIQUE (business_unit_id, name)
);

-- Publications
CREATE TABLE public.publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_unit_id UUID REFERENCES public.business_units(id),
    department_id UUID REFERENCES public.departments(id),
    year INTEGER NOT NULL,
    department TEXT, -- as a string for easy matching
    authors TEXT,
    title TEXT,
    journal_name TEXT,
    indexing_type TEXT,
    quartile TEXT,
    impact_factor TEXT,
    doi TEXT,
    publication_link TEXT,
    publication_status TEXT,
    source_id TEXT UNIQUE, -- a hash or unique identifier to prevent duplicates
    raw_data JSONB, -- store the rest of the columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patents
CREATE TABLE public.patents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_unit_id UUID REFERENCES public.business_units(id),
    department_id UUID REFERENCES public.departments(id),
    year INTEGER NOT NULL,
    department TEXT,
    title TEXT,
    inventors TEXT,
    application_number TEXT,
    date_of_filing TEXT,
    date_of_publication TEXT,
    date_of_grant TEXT,
    status TEXT,
    source_id TEXT UNIQUE,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Funded Projects
CREATE TABLE public.funded_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_unit_id UUID REFERENCES public.business_units(id),
    department_id UUID REFERENCES public.departments(id),
    year INTEGER NOT NULL,
    department TEXT,
    project_title TEXT,
    principal_investigator TEXT,
    funding_agency TEXT,
    amount TEXT,
    duration TEXT,
    status TEXT,
    source_id TEXT UNIQUE,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supervisors
CREATE TABLE public.supervisors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_unit_id UUID REFERENCES public.business_units(id),
    department_id UUID REFERENCES public.departments(id),
    year INTEGER NOT NULL,
    department TEXT,
    supervisor_name TEXT,
    employee_code TEXT,
    discipline TEXT,
    research_area TEXT,
    source_id TEXT UNIQUE,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scholars
CREATE TABLE public.scholars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_unit_id UUID REFERENCES public.business_units(id),
    department_id UUID REFERENCES public.departments(id),
    year INTEGER NOT NULL, -- enrollment year
    department TEXT,
    scholar_name TEXT,
    register_number TEXT,
    supervisor_name TEXT,
    research_area TEXT,
    status TEXT,
    source_id TEXT UNIQUE,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial Data
INSERT INTO public.business_units (name) VALUES ('Management');
-- We'll insert Departments (MBA, BBA) dynamically or manually during import.
