import os
import glob
import openpyxl
import json
import re

BASE_DIR = '/Users/vishalyadav/Projects/RD-Dashboard/Backend/RD new cleaned data'
OUT_DIR = '/Users/vishalyadav/Projects/RD-Dashboard'

def clean_val(v):
    if v is None:
        return ''
    s = str(v).strip()
    if s.lower() in ['none', 'nan', 'null', 'nil']:
        return ''
    return s

def clean_year(v, default=2024):
    if v is None:
        return default
    m = re.search(r'(202[3-6])', str(v))
    if m:
        return int(m.group(1))
    try:
        f = float(v)
        if 2000 <= int(f) <= 2030:
            return int(f)
    except:
        pass
    return default

def get_sheet_data(wb, sheet_name):
    if sheet_name not in wb.sheetnames:
        return []
    sheet = wb[sheet_name]
    rows = list(sheet.iter_rows(values_only=True))
    if not rows or len(rows) < 2:
        return []
    
    # Clean header: strip leading * and spaces
    headers = [str(c).strip().lstrip('*').strip() if c is not None else f'col_{i}' for i, c in enumerate(rows[0])]
    
    data = []
    for r in rows[1:]:
        if not any(c is not None and str(c).strip() != '' for c in r):
            continue
        row_dict = {}
        for h, c in zip(headers, r):
            row_dict[h] = clean_val(c)
        data.append(row_dict)
    return data

def parse_faculty_counts():
    fac_records = []
    
    # 1. E&T Faculty
    et_path = os.path.join(BASE_DIR, 'ET', 'E&T_Faculty_Count_Final.xlsx')
    if os.path.exists(et_path):
        wb = openpyxl.load_workbook(et_path, data_only=True)
        for yr_str in ['2024', '2025', '2026']:
            if yr_str in wb.sheetnames:
                rows = list(wb[yr_str].iter_rows(values_only=True))
                for r in rows[1:]:
                    if len(r) >= 2 and r[0] and r[1] is not None:
                        dname = clean_val(r[0])
                        try:
                            cnt = int(float(r[1]))
                            fac_records.append({
                                'business_unit': 'E&T',
                                'department': dname,
                                'year': int(yr_str),
                                'faculty_count': cnt
                            })
                        except:
                            pass

    # 2. FLABS Faculty
    flabs_path = os.path.join(BASE_DIR, 'Flabs', 'FLABS_Faculty_Count.xlsx')
    if os.path.exists(flabs_path):
        wb = openpyxl.load_workbook(flabs_path, data_only=True)
        for yr_str in ['2024', '2025', '2026']:
            if yr_str in wb.sheetnames:
                rows = list(wb[yr_str].iter_rows(values_only=True))
                # Header is at row index 2 in FLABS_Faculty_Count.xlsx
                data_rows = rows[3:] if len(rows) > 3 else rows[1:]
                for r in data_rows:
                    if len(r) >= 2 and r[0] and r[1] is not None:
                        dname = clean_val(r[0])
                        if 'department name' in dname.lower() or 'source' in dname.lower():
                            continue
                        try:
                            cnt = int(float(r[1]))
                            fac_records.append({
                                'business_unit': 'FLABS',
                                'department': dname,
                                'year': int(yr_str),
                                'faculty_count': cnt
                            })
                        except:
                            pass
                            
    # 3. Management Faculty (BBA & MBA: approx 22 & 18)
    for yr in [2024, 2025, 2026]:
        fac_records.append({'business_unit': 'Management', 'department': 'MBA', 'year': yr, 'faculty_count': 18})
        fac_records.append({'business_unit': 'Management', 'department': 'BBA', 'year': yr, 'faculty_count': 22})

    return fac_records

def main():
    payload = {
        'publications': [],
        'patents': [],
        'funded_projects': [],
        'consultancy_projects': [],
        'research_supervisors': [],
        'research_scholars': [],
        'research_awards': [],
        'faculty_counts': parse_faculty_counts()
    }

    # ─────────────────────────────────────────────────────────────
    # 1. E&T GROUP
    # ─────────────────────────────────────────────────────────────
    print("Parsing E&T files...")
    et_dir = os.path.join(BASE_DIR, 'ET')
    
    # E&T Publications
    p_path = os.path.join(et_dir, 'E&T_Publications.xlsx')
    if os.path.exists(p_path):
        wb = openpyxl.load_workbook(p_path, data_only=True)
        rows = get_sheet_data(wb, 'Data')
        for r in rows:
            payload['publications'].append({
                'business_unit': 'E&T',
                'department': r.get('Department', ''),
                'year': clean_year(r.get('Year')),
                'paper_title': r.get('Paper Title', '') or '—',
                'author': r.get('Author', '') or '—',
                'publication_date': r.get('Publication Date', ''),
                'indexing_type': r.get('Indexing Type', '') or 'Scopus',
                'quartile': r.get('Quartile', ''),
                'impact_factor': r.get('Impact Factor', ''),
                'doi': r.get('DOI', ''),
                'publication_link': r.get('Publication Link', ''),
                'publisher': r.get('Publisher', '') or r.get('Journal Name', ''),
                'issn': r.get('ISSN', ''),
                'raw_data': r
            })

    # E&T Patents
    p_path = os.path.join(et_dir, 'E&T_Patents.xlsx')
    if os.path.exists(p_path):
        wb = openpyxl.load_workbook(p_path, data_only=True)
        rows = get_sheet_data(wb, 'Template') or get_sheet_data(wb, 'Data') or get_sheet_data(wb, 'Legacy Data')
        for r in rows:
            payload['patents'].append({
                'business_unit': 'E&T',
                'department': r.get('Department', ''),
                'year': clean_year(r.get('Year')),
                'patent_title': r.get('Patent Title', '') or '—',
                'applicant_name': r.get('Applicant Name', ''),
                'inventors': r.get('Inventor(s)', '') or '—',
                'patent_category': r.get('Patent Category', '') or 'Utility',
                'patent_status': r.get('Patent Status', '') or 'Published',
                'patent_filing_date': r.get('Patent Filing Date', ''),
                'patent_published_date': r.get('Patent Published Date', ''),
                'granted_date': r.get('Granted Date', ''),
                'status_of_commercialization': r.get('Status of Commercialization', '') or 'No',
                'proof_link': r.get('Proof / Document Link', ''),
                'raw_data': r
            })

    # E&T Funded Projects
    p_path = os.path.join(et_dir, 'E&T_Funded_Projects.xlsx')
    if os.path.exists(p_path):
        wb = openpyxl.load_workbook(p_path, data_only=True)
        rows = get_sheet_data(wb, 'Data')
        for r in rows:
            payload['funded_projects'].append({
                'business_unit': 'E&T',
                'department': r.get('Department', ''),
                'year': clean_year(r.get('Year')),
                'project_title': r.get('Project Title', '') or '—',
                'principal_investigator': r.get('Principal Investigator', '') or '—',
                'co_investigators': r.get('Co-Principal Investigator / Co-Investigator', ''),
                'funding_agency': r.get('Funding Agency', '') or '—',
                'amount': r.get('Amount', '') or '—',
                'duration': r.get('Duration / Period', ''),
                'status': r.get('Status', '') or 'Sanctioned',
                'scheme': r.get('Scheme', ''),
                'raw_data': r
            })

    # E&T Consultancy Projects
    p_path = os.path.join(et_dir, 'E&T_Consultancy_Projects.xlsx')
    if os.path.exists(p_path):
        wb = openpyxl.load_workbook(p_path, data_only=True)
        rows = get_sheet_data(wb, 'Data')
        for r in rows:
            payload['consultancy_projects'].append({
                'business_unit': 'E&T',
                'department': r.get('Department', ''),
                'year': clean_year(r.get('Year')),
                'project_title': r.get('Project / Consultancy Title', '') or '—',
                'faculty_name': r.get('Faculty Name', '') or '—',
                'faculty_designation': r.get('Faculty Designation', ''),
                'faculty_erp_id': r.get('Faculty ERP ID', ''),
                'client_name': r.get('Client Name', '') or r.get('Funding / Consultancy Agency', '') or '—',
                'funding_agency': r.get('Funding / Consultancy Agency', '') or r.get('Client Name', '') or '—',
                'amount': r.get('Amount of Consultancy', '') or '—',
                'start_date': r.get('Start Date', ''),
                'end_date': r.get('End Date', ''),
                'status': r.get('Status', '') or 'Ongoing',
                'raw_data': r
            })

    # E&T Research Scholars
    p_path = os.path.join(et_dir, 'E&T_Research_Scholars.xlsx')
    if os.path.exists(p_path):
        wb = openpyxl.load_workbook(p_path, data_only=True)
        rows = get_sheet_data(wb, 'Template') or get_sheet_data(wb, 'Data')
        for r in rows:
            payload['research_scholars'].append({
                'business_unit': 'E&T',
                'department': r.get('Department', ''),
                'year': clean_year(r.get('Year of Enrollment') or r.get('Year')),
                'register_number': r.get('Register Number', ''),
                'application_number': r.get('Application Number', ''),
                'scholar_name': r.get('Scholar Name', '') or '—',
                'programme': r.get('Programme', '') or 'Ph.D',
                'supervisor_name': r.get('Supervisor Name', '') or '—',
                'year_of_enrollment': clean_year(r.get('Year of Enrollment')),
                'category': r.get('Category', '') or 'Full-time',
                'research_area': r.get('Research Area', ''),
                'status': r.get('Status', '') or 'Ongoing',
                'raw_data': r
            })

    # E&T Research Supervisors
    p_path = os.path.join(et_dir, 'ET_Research_Supervisors.xlsx')
    if os.path.exists(p_path):
        wb = openpyxl.load_workbook(p_path, data_only=True)
        rows = get_sheet_data(wb, 'Data')
        for r in rows:
            payload['research_supervisors'].append({
                'business_unit': 'E&T',
                'department': r.get('Department', ''),
                'year': clean_year(r.get('Year')),
                'employee_id': r.get('Employee ID', ''),
                'supervisor_name': r.get('Supervisor Name', '') or '—',
                'year_of_phd': r.get('Year of PhD', ''),
                'discipline': r.get('Discipline', ''),
                'research_area': r.get('Research Area', ''),
                'raw_data': r
            })

    # ─────────────────────────────────────────────────────────────
    # 2. FLABS GROUP
    # ─────────────────────────────────────────────────────────────
    print("Parsing FLABS files...")
    flabs_dir = os.path.join(BASE_DIR, 'Flabs')

    # FLABS Publications
    p_path = os.path.join(flabs_dir, 'FLABS_Publications.xlsx')
    if os.path.exists(p_path):
        wb = openpyxl.load_workbook(p_path, data_only=True)
        rows = get_sheet_data(wb, 'Data')
        for r in rows:
            payload['publications'].append({
                'business_unit': 'FLABS',
                'department': r.get('Department', ''),
                'year': clean_year(r.get('Year')),
                'paper_title': r.get('Paper Title', '') or '—',
                'author': r.get('Author', '') or '—',
                'publication_date': r.get('Publication Date', ''),
                'indexing_type': r.get('Indexing Type', '') or 'Scopus',
                'quartile': r.get('Quartile', ''),
                'impact_factor': r.get('Impact Factor', ''),
                'doi': r.get('DOI', ''),
                'publication_link': r.get('Publication Link', ''),
                'publisher': r.get('Publisher', '') or r.get('Journal Name', ''),
                'issn': r.get('ISSN', ''),
                'raw_data': r
            })

    # FLABS Patents
    p_path = os.path.join(flabs_dir, 'FLABS_Patents.xlsx')
    if os.path.exists(p_path):
        wb = openpyxl.load_workbook(p_path, data_only=True)
        rows = get_sheet_data(wb, 'Data')
        for r in rows:
            payload['patents'].append({
                'business_unit': 'FLABS',
                'department': r.get('Department', ''),
                'year': clean_year(r.get('Year')),
                'patent_title': r.get('Patent Title', '') or '—',
                'applicant_name': r.get('Applicant Name', ''),
                'inventors': r.get('Inventor(s)', '') or '—',
                'patent_category': r.get('Patent Category', '') or 'Utility',
                'patent_status': r.get('Patent Status', '') or 'Published',
                'patent_filing_date': r.get('Patent Filing Date', ''),
                'patent_published_date': r.get('Patent Published Date', ''),
                'granted_date': r.get('Granted Date', ''),
                'status_of_commercialization': r.get('Status of Commercialization', '') or 'No',
                'proof_link': r.get('Proof / Document Link', ''),
                'raw_data': r
            })

    # FLABS Funded Projects
    p_path = os.path.join(flabs_dir, 'FLABS_Funded_Projects.xlsx')
    if os.path.exists(p_path):
        wb = openpyxl.load_workbook(p_path, data_only=True)
        rows = get_sheet_data(wb, 'Data')
        for r in rows:
            payload['funded_projects'].append({
                'business_unit': 'FLABS',
                'department': r.get('Department', ''),
                'year': clean_year(r.get('Year')),
                'project_title': r.get('Project Title', '') or '—',
                'principal_investigator': r.get('Principal Investigator', '') or '—',
                'co_investigators': r.get('Co-Principal Investigator / Co-Investigator', ''),
                'funding_agency': r.get('Funding Agency', '') or '—',
                'amount': r.get('Amount', '') or '—',
                'duration': r.get('Duration / Period', ''),
                'status': r.get('Status', '') or 'Sanctioned',
                'scheme': r.get('Scheme', ''),
                'raw_data': r
            })

    # FLABS Research Scholars
    p_path = os.path.join(flabs_dir, 'FLABS_Research_Scholars.xlsx')
    if os.path.exists(p_path):
        wb = openpyxl.load_workbook(p_path, data_only=True)
        rows = get_sheet_data(wb, 'Data')
        for r in rows:
            payload['research_scholars'].append({
                'business_unit': 'FLABS',
                'department': r.get('Department', ''),
                'year': clean_year(r.get('Year of Enrollment') or r.get('Year')),
                'register_number': r.get('Register Number', ''),
                'application_number': r.get('Application Number', ''),
                'scholar_name': r.get('Scholar Name', '') or '—',
                'programme': r.get('Programme', '') or 'Ph.D',
                'supervisor_name': r.get('Supervisor Name', '') or '—',
                'year_of_enrollment': clean_year(r.get('Year of Enrollment')),
                'category': r.get('Category', '') or 'Full-time',
                'research_area': r.get('Research Area', ''),
                'status': r.get('Status', '') or 'Ongoing',
                'raw_data': r
            })

    # FLABS Research Supervisors
    p_path = os.path.join(flabs_dir, 'FLABS_Research_Supervisors.xlsx')
    if os.path.exists(p_path):
        wb = openpyxl.load_workbook(p_path, data_only=True)
        rows = get_sheet_data(wb, 'Data')
        for r in rows:
            payload['research_supervisors'].append({
                'business_unit': 'FLABS',
                'department': r.get('Department', ''),
                'year': clean_year(r.get('Year')),
                'employee_id': r.get('Employee ID', ''),
                'supervisor_name': r.get('Supervisor Name', '') or '—',
                'year_of_phd': r.get('Year of PhD', ''),
                'discipline': r.get('Discipline', ''),
                'research_area': r.get('Research Area', ''),
                'raw_data': r
            })

    # FLABS Research Awards
    p_path = os.path.join(flabs_dir, 'FLABS_Research_Awards.xlsx')
    if os.path.exists(p_path):
        wb = openpyxl.load_workbook(p_path, data_only=True)
        rows = get_sheet_data(wb, 'Data')
        for r in rows:
            payload['research_awards'].append({
                'business_unit': 'FLABS',
                'department': r.get('Department', ''),
                'year': clean_year(r.get('Year')),
                'award_id': r.get('Award ID', ''),
                'faculty_name': r.get('Faculty Name', '') or '—',
                'award_name': r.get('Award Name', '') or '—',
                'awarding_org': r.get('Awarding Organization', '') or '—',
                'award_category': r.get('Award Category', '') or 'State',
                'proof_link': r.get('Proof / Document Link', ''),
                'raw_data': r
            })

    # ─────────────────────────────────────────────────────────────
    # 3. MANAGEMENT GROUP
    # ─────────────────────────────────────────────────────────────
    print("Parsing Management files...")
    mgmt_dir = os.path.join(BASE_DIR, 'Mgmt')

    # Management Publications
    p_path = os.path.join(mgmt_dir, 'Management_Publications.xlsx')
    if os.path.exists(p_path):
        wb = openpyxl.load_workbook(p_path, data_only=True)
        rows = get_sheet_data(wb, 'Data')
        for r in rows:
            payload['publications'].append({
                'business_unit': 'Management',
                'department': r.get('Department', '') or 'MBA',
                'year': clean_year(r.get('Year')),
                'paper_title': r.get('Paper Title', '') or '—',
                'author': r.get('Author', '') or '—',
                'publication_date': r.get('Publication Date', ''),
                'indexing_type': r.get('Indexing Type', '') or 'Scopus',
                'quartile': r.get('Quartile', ''),
                'impact_factor': r.get('Impact Factor', ''),
                'doi': r.get('DOI', ''),
                'publication_link': r.get('Publication Link', ''),
                'publisher': r.get('Publisher', '') or r.get('Journal Name', ''),
                'issn': r.get('ISSN', ''),
                'raw_data': r
            })

    # Management Patents
    p_path = os.path.join(mgmt_dir, 'Management_Patents.xlsx')
    if os.path.exists(p_path):
        wb = openpyxl.load_workbook(p_path, data_only=True)
        rows = get_sheet_data(wb, 'Data')
        for r in rows:
            payload['patents'].append({
                'business_unit': 'Management',
                'department': r.get('Department', '') or 'MBA',
                'year': clean_year(r.get('Year')),
                'patent_title': r.get('Patent Title', '') or '—',
                'applicant_name': r.get('Applicant Name', ''),
                'inventors': r.get('Inventor(s)', '') or '—',
                'patent_category': r.get('Patent Category', '') or 'Utility',
                'patent_status': r.get('Patent Status', '') or 'Published',
                'patent_filing_date': r.get('Patent Filing Date', ''),
                'patent_published_date': r.get('Patent Published Date', ''),
                'granted_date': r.get('Granted Date', ''),
                'status_of_commercialization': r.get('Status of Commercialization', '') or 'No',
                'proof_link': r.get('Proof / Document Link', ''),
                'raw_data': r
            })

    # Management Funded Projects
    p_path = os.path.join(mgmt_dir, 'Management_Funded_Projects.xlsx')
    if os.path.exists(p_path):
        wb = openpyxl.load_workbook(p_path, data_only=True)
        rows = get_sheet_data(wb, 'Data')
        for r in rows:
            payload['funded_projects'].append({
                'business_unit': 'Management',
                'department': r.get('Department', '') or 'MBA',
                'year': clean_year(r.get('Year')),
                'project_title': r.get('Project Title', '') or '—',
                'principal_investigator': r.get('Principal Investigator', '') or '—',
                'co_investigators': r.get('Co-Principal Investigator / Co-Investigator', ''),
                'funding_agency': r.get('Funding Agency', '') or '—',
                'amount': r.get('Amount', '') or '—',
                'duration': r.get('Duration / Period', ''),
                'status': r.get('Status', '') or 'Sanctioned',
                'scheme': r.get('Scheme', ''),
                'raw_data': r
            })

    # Management Research Scholars
    p_path = os.path.join(mgmt_dir, 'Management_Research_Scholars.xlsx')
    if os.path.exists(p_path):
        wb = openpyxl.load_workbook(p_path, data_only=True)
        rows = get_sheet_data(wb, 'Template') or get_sheet_data(wb, 'Data')
        for r in rows:
            payload['research_scholars'].append({
                'business_unit': 'Management',
                'department': r.get('Department', '') or 'MBA',
                'year': clean_year(r.get('Year of Enrollment') or r.get('Year')),
                'register_number': r.get('Register Number', ''),
                'application_number': r.get('Application Number', ''),
                'scholar_name': r.get('Scholar Name', '') or '—',
                'programme': r.get('Programme', '') or 'Ph.D',
                'supervisor_name': r.get('Supervisor Name', '') or '—',
                'year_of_enrollment': clean_year(r.get('Year of Enrollment')),
                'category': r.get('Category', '') or 'Full-time',
                'research_area': r.get('Research Area', ''),
                'status': r.get('Status', '') or 'Ongoing',
                'raw_data': r
            })

    # Management Research Supervisors
    p_path = os.path.join(mgmt_dir, 'Management_Research_Supervisors.xlsx')
    if os.path.exists(p_path):
        wb = openpyxl.load_workbook(p_path, data_only=True)
        rows = get_sheet_data(wb, 'Data')
        for r in rows:
            payload['research_supervisors'].append({
                'business_unit': 'Management',
                'department': r.get('Department', '') or 'MBA',
                'year': clean_year(r.get('Year')),
                'employee_id': r.get('Employee ID', ''),
                'supervisor_name': r.get('Supervisor Name', '') or '—',
                'year_of_phd': r.get('Year of PhD', ''),
                'discipline': r.get('Discipline', ''),
                'research_area': r.get('Research Area', ''),
                'raw_data': r
            })

    # Management Research Awards
    p_path = os.path.join(mgmt_dir, 'Management_Research_Awards.xlsx')
    if os.path.exists(p_path):
        wb = openpyxl.load_workbook(p_path, data_only=True)
        rows = get_sheet_data(wb, 'Template') or get_sheet_data(wb, 'Data')
        for r in rows:
            payload['research_awards'].append({
                'business_unit': 'Management',
                'department': r.get('Department', '') or 'MBA',
                'year': clean_year(r.get('Year')),
                'award_id': r.get('Award ID', ''),
                'faculty_name': r.get('Faculty Name', '') or '—',
                'award_name': r.get('Award Name', '') or '—',
                'awarding_org': r.get('Awarding Organization', '') or '—',
                'award_category': r.get('Award Category', '') or 'State',
                'proof_link': r.get('Proof / Document Link', ''),
                'raw_data': r
            })

    print("\n--- Summary of Cleaned Data ---")
    for k, v in payload.items():
        print(f"  {k}: {len(v)} records")

    # Save to JSON payload
    out_json = os.path.join(OUT_DIR, 'cleaned_dataset.json')
    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    print(f"\nSaved clean JSON payload to: {out_json}")

    # Generate SQL schema & seed script
    generate_sql_schema_and_seed(payload)

def sql_escape(s):
    if s is None:
        return 'NULL'
    s = str(s).replace("'", "''")
    return f"'{s}'"

def generate_sql_schema_and_seed(payload):
    sql_path = os.path.join(OUT_DIR, 'supabase', 'all_colleges_schema_and_seed.sql')
    os.makedirs(os.path.dirname(sql_path), exist_ok=True)
    
    lines = []
    lines.append("-- ═════════════════════════════════════════════════════════════════")
    lines.append("-- SRM R&D DASHBOARD — COMPLETE DATABASE SCHEMA & DATA MIGRATION")
    lines.append("-- Groups: E&T, FLABS, Management (All 7 Research Modules)")
    lines.append("-- ═════════════════════════════════════════════════════════════════")
    lines.append("")
    lines.append("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
    lines.append("")

    # Drop old tables if replacing
    table_names = [
        'publications', 'patents', 'funded_projects', 'consultancy_projects',
        'research_supervisors', 'research_scholars', 'research_awards', 'faculty_counts'
    ]
    for tbl in table_names:
        lines.append(f"DROP TABLE IF EXISTS public.{tbl} CASCADE;")

    # 1. Publications Table
    lines.append("""
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
""")

    # 2. Patents Table
    lines.append("""
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
""")

    # 3. Funded Projects Table
    lines.append("""
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
""")

    # 4. Consultancy Projects Table
    lines.append("""
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
""")

    # 5. Research Supervisors Table
    lines.append("""
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
""")

    # 6. Research Scholars Table
    lines.append("""
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
""")

    # 7. Research Awards Table
    lines.append("""
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
""")

    # 8. Faculty Counts Table
    lines.append("""
CREATE TABLE public.faculty_counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_unit TEXT NOT NULL,
    department TEXT NOT NULL,
    year INTEGER NOT NULL,
    faculty_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_unit, department, year)
);
""")

    # Enable RLS & open policies for anon & authenticated
    lines.append("-- Enable RLS & set public read/insert policies for Dashboard usage")
    for tbl in table_names:
        lines.append(f"ALTER TABLE public.{tbl} ENABLE ROW LEVEL SECURITY;")
        lines.append(f"CREATE POLICY \"Public read for {tbl}\" ON public.{tbl} FOR SELECT USING (true);")
        lines.append(f"CREATE POLICY \"Public insert for {tbl}\" ON public.{tbl} FOR INSERT WITH CHECK (true);")
        lines.append(f"CREATE POLICY \"Public update for {tbl}\" ON public.{tbl} FOR UPDATE USING (true);")
        lines.append(f"CREATE POLICY \"Public delete for {tbl}\" ON public.{tbl} FOR DELETE USING (true);")
    lines.append("")

    # Helper function to insert JSON raw_data safely
    def json_escape(obj):
        return sql_escape(json.dumps(obj or {}))

    # Add Inserts
    lines.append("-- ── DATA INSERTS ──────────────────────────────────────────")
    
    # Faculty Counts
    lines.append("-- Faculty Counts")
    for r in payload['faculty_counts']:
        lines.append(f"INSERT INTO public.faculty_counts (business_unit, department, year, faculty_count) VALUES ({sql_escape(r['business_unit'])}, {sql_escape(r['department'])}, {r['year']}, {r['faculty_count']}) ON CONFLICT DO NOTHING;")

    # Publications
    lines.append("\n-- Publications")
    for r in payload['publications']:
        lines.append(f"INSERT INTO public.publications (business_unit, department, year, paper_title, author, publication_date, indexing_type, quartile, impact_factor, doi, publication_link, publisher, issn, raw_data) VALUES ({sql_escape(r['business_unit'])}, {sql_escape(r['department'])}, {r['year']}, {sql_escape(r['paper_title'])}, {sql_escape(r['author'])}, {sql_escape(r['publication_date'])}, {sql_escape(r['indexing_type'])}, {sql_escape(r['quartile'])}, {sql_escape(r['impact_factor'])}, {sql_escape(r['doi'])}, {sql_escape(r['publication_link'])}, {sql_escape(r['publisher'])}, {sql_escape(r['issn'])}, {json_escape(r['raw_data'])});")

    # Patents
    lines.append("\n-- Patents")
    for r in payload['patents']:
        lines.append(f"INSERT INTO public.patents (business_unit, department, year, patent_title, applicant_name, inventors, patent_category, patent_status, patent_filing_date, patent_published_date, granted_date, status_of_commercialization, proof_link, raw_data) VALUES ({sql_escape(r['business_unit'])}, {sql_escape(r['department'])}, {r['year']}, {sql_escape(r['patent_title'])}, {sql_escape(r['applicant_name'])}, {sql_escape(r['inventors'])}, {sql_escape(r['patent_category'])}, {sql_escape(r['patent_status'])}, {sql_escape(r['patent_filing_date'])}, {sql_escape(r['patent_published_date'])}, {sql_escape(r['granted_date'])}, {sql_escape(r['status_of_commercialization'])}, {sql_escape(r['proof_link'])}, {json_escape(r['raw_data'])});")

    # Funded Projects
    lines.append("\n-- Funded Projects")
    for r in payload['funded_projects']:
        lines.append(f"INSERT INTO public.funded_projects (business_unit, department, year, project_title, principal_investigator, co_investigators, funding_agency, amount, duration, status, scheme, raw_data) VALUES ({sql_escape(r['business_unit'])}, {sql_escape(r['department'])}, {r['year']}, {sql_escape(r['project_title'])}, {sql_escape(r['principal_investigator'])}, {sql_escape(r['co_investigators'])}, {sql_escape(r['funding_agency'])}, {sql_escape(r['amount'])}, {sql_escape(r['duration'])}, {sql_escape(r['status'])}, {sql_escape(r['scheme'])}, {json_escape(r['raw_data'])});")

    # Consultancy Projects
    lines.append("\n-- Consultancy Projects")
    for r in payload['consultancy_projects']:
        lines.append(f"INSERT INTO public.consultancy_projects (business_unit, department, year, project_title, faculty_name, faculty_designation, faculty_erp_id, client_name, funding_agency, amount, start_date, end_date, status, raw_data) VALUES ({sql_escape(r['business_unit'])}, {sql_escape(r['department'])}, {r['year']}, {sql_escape(r['project_title'])}, {sql_escape(r['faculty_name'])}, {sql_escape(r['faculty_designation'])}, {sql_escape(r['faculty_erp_id'])}, {sql_escape(r['client_name'])}, {sql_escape(r['funding_agency'])}, {sql_escape(r['amount'])}, {sql_escape(r['start_date'])}, {sql_escape(r['end_date'])}, {sql_escape(r['status'])}, {json_escape(r['raw_data'])});")

    # Research Supervisors
    lines.append("\n-- Research Supervisors")
    for r in payload['research_supervisors']:
        lines.append(f"INSERT INTO public.research_supervisors (business_unit, department, year, employee_id, supervisor_name, year_of_phd, discipline, research_area, proof_link, raw_data) VALUES ({sql_escape(r.get('business_unit'))}, {sql_escape(r.get('department'))}, {r.get('year') or 2024}, {sql_escape(r.get('employee_id'))}, {sql_escape(r.get('supervisor_name'))}, {sql_escape(r.get('year_of_phd'))}, {sql_escape(r.get('discipline'))}, {sql_escape(r.get('research_area'))}, {sql_escape(r.get('proof_link', ''))}, {json_escape(r.get('raw_data'))});")

    # Research Scholars
    lines.append("\n-- Research Scholars")
    for r in payload['research_scholars']:
        lines.append(f"INSERT INTO public.research_scholars (business_unit, department, year, register_number, application_number, scholar_name, programme, supervisor_name, year_of_enrollment, category, research_area, status, proof_link, raw_data) VALUES ({sql_escape(r.get('business_unit'))}, {sql_escape(r.get('department'))}, {r.get('year') or 2024}, {sql_escape(r.get('register_number'))}, {sql_escape(r.get('application_number'))}, {sql_escape(r.get('scholar_name'))}, {sql_escape(r.get('programme'))}, {sql_escape(r.get('supervisor_name'))}, {r.get('year_of_enrollment') or 'NULL'}, {sql_escape(r.get('category'))}, {sql_escape(r.get('research_area'))}, {sql_escape(r.get('status'))}, {sql_escape(r.get('proof_link', ''))}, {json_escape(r.get('raw_data'))});")

    # Research Awards
    lines.append("\n-- Research Awards")
    for r in payload['research_awards']:
        lines.append(f"INSERT INTO public.research_awards (business_unit, department, year, award_id, faculty_name, award_name, awarding_org, award_category, proof_link, raw_data) VALUES ({sql_escape(r.get('business_unit'))}, {sql_escape(r.get('department'))}, {r.get('year') or 2024}, {sql_escape(r.get('award_id'))}, {sql_escape(r.get('faculty_name'))}, {sql_escape(r.get('award_name'))}, {sql_escape(r.get('awarding_org'))}, {sql_escape(r.get('award_category'))}, {sql_escape(r.get('proof_link', ''))}, {json_escape(r.get('raw_data'))});")

    with open(sql_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))
    print(f"Generated complete SQL file with schema and all inserts at: {sql_path} (Size: {len(lines)} lines)")

if __name__ == '__main__':
    main()
