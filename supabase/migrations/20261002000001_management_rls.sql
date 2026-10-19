-- Enable RLS on all tables
ALTER TABLE public.business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funded_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholars ENABLE ROW LEVEL SECURITY;

-- Create Policies for Business Units
CREATE POLICY "Allow public read for business_units" ON public.business_units
    FOR SELECT USING (true); -- business units are public reference data

-- Create Policies for Departments
CREATE POLICY "Allow public read for departments" ON public.departments
    FOR SELECT USING (true); -- departments are public reference data

-- Create a helper function to get the current user's group and department
-- This will read from the JWT claims (user_metadata)
CREATE OR REPLACE FUNCTION get_jwt_group() RETURNS text AS $$
    SELECT (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'group')::text;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_jwt_department() RETURNS text AS $$
    SELECT (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'department')::text;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_jwt_scope() RETURNS text AS $$
    SELECT (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'scope')::text;
$$ LANGUAGE sql STABLE;

-- Create Policies for Publications
CREATE POLICY "RLS for publications" ON public.publications
    FOR SELECT USING (
        (get_jwt_group() = 'Management' AND business_unit_id IN (SELECT id FROM public.business_units WHERE name = 'Management'))
        AND (
            get_jwt_scope() = 'GROUP_ALL_DEPARTMENTS' 
            OR 
            (get_jwt_scope() = 'DEPARTMENT_ONLY' AND department = get_jwt_department())
        )
    );

-- Create Policies for Patents
CREATE POLICY "RLS for patents" ON public.patents
    FOR SELECT USING (
        (get_jwt_group() = 'Management' AND business_unit_id IN (SELECT id FROM public.business_units WHERE name = 'Management'))
        AND (
            get_jwt_scope() = 'GROUP_ALL_DEPARTMENTS' 
            OR 
            (get_jwt_scope() = 'DEPARTMENT_ONLY' AND department = get_jwt_department())
        )
    );

-- Create Policies for Funded Projects
CREATE POLICY "RLS for funded_projects" ON public.funded_projects
    FOR SELECT USING (
        (get_jwt_group() = 'Management' AND business_unit_id IN (SELECT id FROM public.business_units WHERE name = 'Management'))
        AND (
            get_jwt_scope() = 'GROUP_ALL_DEPARTMENTS' 
            OR 
            (get_jwt_scope() = 'DEPARTMENT_ONLY' AND department = get_jwt_department())
        )
    );

-- Create Policies for Supervisors
CREATE POLICY "RLS for supervisors" ON public.supervisors
    FOR SELECT USING (
        (get_jwt_group() = 'Management' AND business_unit_id IN (SELECT id FROM public.business_units WHERE name = 'Management'))
        AND (
            get_jwt_scope() = 'GROUP_ALL_DEPARTMENTS' 
            OR 
            (get_jwt_scope() = 'DEPARTMENT_ONLY' AND department = get_jwt_department())
        )
    );

-- Create Policies for Scholars
CREATE POLICY "RLS for scholars" ON public.scholars
    FOR SELECT USING (
        (get_jwt_group() = 'Management' AND business_unit_id IN (SELECT id FROM public.business_units WHERE name = 'Management'))
        AND (
            get_jwt_scope() = 'GROUP_ALL_DEPARTMENTS' 
            OR 
            (get_jwt_scope() = 'DEPARTMENT_ONLY' AND department = get_jwt_department())
        )
    );
