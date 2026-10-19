// ══════════════════════════════════════════════════════════════════════════
// SRM R&D DASHBOARD — SUPABASE CLIENT & UNIFIED DATA SERVICE
// ══════════════════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://pndvjkcoroadxonvpphb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZHZqa2Nvcm9hZHhvbnZwcGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMjgzNzcsImV4cCI6MjEwNzkwNDM3N30.WldmanFbo1gME0qwZOyb4R-eN8SdiLM-WVkJ2t0XIUE';

// Initialize Supabase Client safely
try {
  if (typeof supabase !== 'undefined' && supabase && supabase.createClient) {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    window.supabaseClient = null;
  }
} catch (e) {
  console.warn('Supabase client init note:', e.message);
  window.supabaseClient = null;
}

// Faculty counts mapping: group -> year -> dept -> count
window.SRM_FACULTY_COUNTS = {
  'E&T': { 2024: {}, 2025: {}, 2026: {} },
  'FLABS': { 2024: {}, 2025: {}, 2026: {} },
  'Management': { 2024: { 'MBA': 18, 'BBA': 22 }, 2025: { 'MBA': 18, 'BBA': 22 }, 2026: { 'MBA': 18, 'BBA': 22 } }
};

window.SupabaseDataService = {
  isLive: false,
  isReady: false,
  isSyncing: false,

  // ─── UI Status Indicator (Minimal, Non-Intrusive, Always Verifiable) ──────
  renderBadge(status, text) {
    var existing = document.getElementById('supabase-sync-badge');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'supabase-sync-badge';
      existing.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:14px;font-size:11.5px;font-weight:600;margin-left:14px;letter-spacing:0.01em;transition:all .3s ease;';
      var userBar = document.getElementById('user-bar');
      if (userBar && userBar.parentNode) {
        userBar.parentNode.insertBefore(existing, userBar);
      } else {
        var headerNav = document.querySelector('.site-header nav');
        if (headerNav && headerNav.parentNode) {
          headerNav.parentNode.insertBefore(existing, headerNav.nextSibling);
        }
      }
    }

    if (status === 'loading') {
      existing.style.background = 'rgba(14,165,233,0.18)';
      existing.style.color = '#38bdf8';
      existing.style.border = '1px solid rgba(56,189,248,0.4)';
      existing.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#38bdf8;box-shadow:0 0 8px #38bdf8;display:inline-block;animation:pulse 1s infinite alternate;"></span> ' + (text || 'Connecting to Supabase...');
      existing.style.opacity = '1';
    } else if (status === 'connected') {
      existing.style.background = 'rgba(16,185,129,0.18)';
      existing.style.color = '#34d399';
      existing.style.border = '1px solid rgba(52,211,153,0.4)';
      existing.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#34d399;box-shadow:0 0 8px #34d399;display:inline-block;"></span> ' + (text || 'Supabase Connected · 3,532 Records Live');
      existing.style.opacity = '1';
    } else if (status === 'offline') {
      existing.style.background = 'rgba(239,68,68,0.18)';
      existing.style.color = '#f87171';
      existing.style.border = '1px solid rgba(239,68,68,0.4)';
      existing.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#ef4444;display:inline-block;"></span> ' + (text || 'Backend Offline');
      existing.style.opacity = '1';
    }
  },

  // ─── Initialize Datasets Directly From Supabase Cloud ─────────────────────
  async init() {
    this.renderBadge('loading', 'Connecting to Supabase Cloud...');
    console.log('[Supabase Cloud] ⚡ Initializing connection to ' + SUPABASE_URL);

    if (!window.supabaseClient) {
      console.error('[Supabase Cloud] Client not found.');
      this.renderBadge('offline', 'Supabase Client Missing');
      return;
    }

    try {
      var startTime = performance.now();
      var counts = await this.syncRemoteData();
      var elapsed = ((performance.now() - startTime) / 1000).toFixed(2);

      this.isReady = true;
      this.isLive = true;

      console.log(`[Supabase Cloud] ✅ Live data fetched directly from Supabase Cloud in ${elapsed}s!`);
      console.log(`[Supabase Cloud] 8 Tables Loaded:`, counts);

      this.renderBadge('connected', `Supabase Connected · ${counts.total.toLocaleString()} Records Live`);
    } catch (err) {
      console.error('[Supabase Cloud] Connection failed:', err);
      this.renderBadge('offline', 'Supabase Connection Error');
    }

    // Trigger dashboard refresh with live backend data
    if (typeof window._SRM_DASHBOARD_REFRESH === 'function') {
      window._SRM_DASHBOARD_REFRESH();
    }
  },

  // ─── Populate In-Memory Datasets ──────────────────────────────────────────
  populateLocalDatasets(data) {
    if (!data) return;

    // Faculty counts
    if (data.faculty_counts) {
      data.faculty_counts.forEach(function (fc) {
        var g = fc.business_unit;
        var y = fc.year;
        var d = fc.department;
        var c = fc.faculty_count;
        if (!window.SRM_FACULTY_COUNTS[g]) window.SRM_FACULTY_COUNTS[g] = {};
        if (!window.SRM_FACULTY_COUNTS[g][y]) window.SRM_FACULTY_COUNTS[g][y] = {};
        window.SRM_FACULTY_COUNTS[g][y][d] = c;
      });
    }

    // ─── E&T DATASETS ────────────────────────────────────────────────────────
    var etPubs = (data.publications || []).filter(function (r) { return r.business_unit === 'E&T'; });
    window.ET_PUBLICATIONS_2024 = etPubs.filter(function (r) { return r.year === 2024; }).map(this.mapPublication);
    window.ET_PUBLICATIONS_2025 = etPubs.filter(function (r) { return r.year === 2025; }).map(this.mapPublication);
    window.ET_PUBLICATIONS_2026 = etPubs.filter(function (r) { return r.year === 2026; }).map(this.mapPublication);

    var etPats = (data.patents || []).filter(function (r) { return r.business_unit === 'E&T'; });
    window.ET_PATENTS = etPats.map(this.mapPatent);

    var etFund = (data.funded_projects || []).filter(function (r) { return r.business_unit === 'E&T'; });
    window.ET_FUNDED_PROJECTS = etFund.map(this.mapFunded);

    var etCons = (data.consultancy_projects || []).filter(function (r) { return r.business_unit === 'E&T'; });
    window.ET_CONSULTANCY_PROJECTS = { records: etCons.map(this.mapConsultancy) };

    var etSchs = (data.research_scholars || []).filter(function (r) { return r.business_unit === 'E&T'; });
    var etSups = (data.research_supervisors || []).filter(function (r) { return r.business_unit === 'E&T'; });
    
    window.ET_SUPERVISORS_SCHOLARS = {
      yearlyData: {
        2024: { records: etSchs.filter(function (r) { return r.year === 2024; }).map(this.mapScholar), scholarCount: etSchs.filter(function (r) { return r.year === 2024; }).length, supervisorCount: etSups.filter(function (r) { return r.year === 2024; }).length },
        2025: { records: etSchs.filter(function (r) { return r.year === 2025; }).map(this.mapScholar), scholarCount: etSchs.filter(function (r) { return r.year === 2025; }).length, supervisorCount: etSups.filter(function (r) { return r.year === 2025; }).length },
        2026: { records: etSchs.filter(function (r) { return r.year === 2026; }).map(this.mapScholar), scholarCount: etSchs.filter(function (r) { return r.year === 2026; }).length, supervisorCount: etSups.filter(function (r) { return r.year === 2026; }).length }
      }
    };

    // ─── FLABS DATASETS ──────────────────────────────────────────────────────
    var flabsPubs = (data.publications || []).filter(function (r) { return r.business_unit === 'FLABS'; }).map(this.mapPublication);
    var flabsPats = (data.patents || []).filter(function (r) { return r.business_unit === 'FLABS'; }).map(this.mapPatent);
    var flabsFund = (data.funded_projects || []).filter(function (r) { return r.business_unit === 'FLABS'; }).map(this.mapFunded);
    var flabsSchs = (data.research_scholars || []).filter(function (r) { return r.business_unit === 'FLABS'; }).map(this.mapScholar);
    var flabsAwds = (data.research_awards || []).filter(function (r) { return r.business_unit === 'FLABS'; }).map(this.mapAward);

    if (!window.RESEARCH_DATA) {
      window.RESEARCH_DATA = {
        publications: flabsPubs,
        patents: flabsPats,
        funded: flabsFund,
        scholars: flabsSchs,
        awards: flabsAwds
      };
    } else {
      window.RESEARCH_DATA.publications = flabsPubs;
      window.RESEARCH_DATA.patents = flabsPats;
      window.RESEARCH_DATA.funded = flabsFund;
      window.RESEARCH_DATA.scholars = flabsSchs;
      window.RESEARCH_DATA.awards = flabsAwds;
    }

    // ─── MANAGEMENT DATASETS ─────────────────────────────────────────────────
    var mgmtPubs = (data.publications || []).filter(function (r) { return r.business_unit === 'Management'; }).map(this.mapPublication);
    var mgmtPats = (data.patents || []).filter(function (r) { return r.business_unit === 'Management'; }).map(this.mapPatent);
    var mgmtFund = (data.funded_projects || []).filter(function (r) { return r.business_unit === 'Management'; }).map(this.mapFunded);
    var mgmtSups = (data.research_supervisors || []).filter(function (r) { return r.business_unit === 'Management'; }).map(this.mapSupervisor);
    var mgmtSchs = (data.research_scholars || []).filter(function (r) { return r.business_unit === 'Management'; }).map(this.mapScholar);
    var mgmtAwds = (data.research_awards || []).filter(function (r) { return r.business_unit === 'Management'; }).map(this.mapAward);

    if (!window.MANAGEMENT_RESEARCH_DATA) {
      window.MANAGEMENT_RESEARCH_DATA = {
        scope: 'Faculty of Management',
        departments: ['BBA', 'MBA'],
        publications: mgmtPubs,
        patents: mgmtPats,
        fundedProjects: mgmtFund,
        supervisors: mgmtSups,
        scholars: mgmtSchs,
        awards: mgmtAwds
      };
    } else {
      window.MANAGEMENT_RESEARCH_DATA.publications = mgmtPubs;
      window.MANAGEMENT_RESEARCH_DATA.patents = mgmtPats;
      window.MANAGEMENT_RESEARCH_DATA.fundedProjects = mgmtFund;
      window.MANAGEMENT_RESEARCH_DATA.supervisors = mgmtSups;
      window.MANAGEMENT_RESEARCH_DATA.scholars = mgmtSchs;
      window.MANAGEMENT_RESEARCH_DATA.awards = mgmtAwds;
    }
  },

  // ─── Remote Sync from Supabase Cloud ──────────────────────────────────────
  async fetchAllRows(table) {
    if (!window.supabaseClient) return [];
    var allRows = [];
    var from = 0;
    var step = 1000;
    while (true) {
      var res = await window.supabaseClient.from(table).select('*').range(from, from + step - 1);
      if (res.error) {
        console.error(`[Supabase Cloud] Error fetching table '${table}':`, res.error);
        break;
      }
      if (!res.data || res.data.length === 0) break;
      allRows = allRows.concat(res.data);
      if (res.data.length < step) break;
      from += step;
    }
    return allRows;
  },

  async syncRemoteData() {
    try {
      var self = this;
      console.log('[Supabase Cloud] 📥 Fetching all 8 database tables concurrently...');
      var [pubs, pats, funds, cons, sups, schs, awds, facs] = await Promise.all([
        self.fetchAllRows('publications'),
        self.fetchAllRows('patents'),
        self.fetchAllRows('funded_projects'),
        self.fetchAllRows('consultancy_projects'),
        self.fetchAllRows('research_supervisors'),
        self.fetchAllRows('research_scholars'),
        self.fetchAllRows('research_awards'),
        self.fetchAllRows('faculty_counts')
      ]);

      var totalRecords = (pubs ? pubs.length : 0) +
                         (pats ? pats.length : 0) +
                         (funds ? funds.length : 0) +
                         (cons ? cons.length : 0) +
                         (sups ? sups.length : 0) +
                         (schs ? schs.length : 0) +
                         (awds ? awds.length : 0) +
                         (facs ? facs.length : 0);

      var remotePayload = {
        publications: pubs || [],
        patents: pats || [],
        funded_projects: funds || [],
        consultancy_projects: cons || [],
        research_supervisors: sups || [],
        research_scholars: schs || [],
        research_awards: awds || [],
        faculty_counts: facs || []
      };

      self.populateLocalDatasets(remotePayload);

      return {
        total: totalRecords,
        publications: pubs ? pubs.length : 0,
        patents: pats ? pats.length : 0,
        funded_projects: funds ? funds.length : 0,
        consultancy_projects: cons ? cons.length : 0,
        research_supervisors: sups ? sups.length : 0,
        research_scholars: schs ? schs.length : 0,
        research_awards: awds ? awds.length : 0,
        faculty_counts: facs ? facs.length : 0
      };
    } catch (e) {
      console.warn('Sync remote data warning:', e);
      throw e;
    }
  },

  // ─── Insert Record (Used by + Add Data Form) ──────────────────────────────
  async insertRecord(type, raw, group) {
    if (!group) group = 'FLABS';
    var year = parseInt(raw.year || raw.year_of_enrollment || new Date().getFullYear(), 10);
    var dept = (raw.department || '').trim();

    var table = '';
    var row = {
      business_unit: group,
      department: dept,
      year: year,
      raw_data: raw
    };

    if (type === 'publication') {
      table = 'publications';
      row.paper_title = raw.paper_title || raw.title || '—';
      row.author = raw.author || raw.author_s_ || raw.authors || '—';
      row.publication_date = raw.publication_date || '';
      row.indexing_type = raw.indexing_type || 'Scopus';
      row.quartile = raw.quartile || '';
      row.impact_factor = raw.impact_factor || '';
      row.doi = raw.doi || '';
      row.publication_link = raw.publication_link || raw.link || '';
      row.publisher = raw.publisher || raw.journal_name || raw.journal || '—';
      row.issn = raw.issn || '';
    } else if (type === 'patent') {
      table = 'patents';
      row.patent_title = raw.patent_title || raw.title || '—';
      row.applicant_name = raw.applicant_name || '';
      row.inventors = raw.inventor_s_ || raw.inventors || '—';
      row.patent_category = raw.patent_category || 'Utility';
      row.patent_status = raw.patent_status || raw.status || 'Published';
      row.patent_filing_date = raw.patent_filing_date || raw.filingDate || '';
      row.patent_published_date = raw.patent_published_date || '';
      row.granted_date = raw.granted_date || '';
      row.status_of_commercialization = raw.status_of_commercialization || 'No';
      row.proof_link = raw.proof___document_link || raw.proofLink || '';
    } else if (type === 'funded') {
      table = 'funded_projects';
      row.project_title = raw.project_title || raw.title || '—';
      row.principal_investigator = raw.principal_investigator || raw.principalInvestigator || raw.pi || '—';
      row.co_investigators = raw.co_principal_investigator___co_investigator || raw.coPi || '';
      row.funding_agency = raw.funding_agency || raw.fundingAgency || raw.agency || '—';
      row.amount = raw.amount || '—';
      row.duration = raw.duration___period || raw.duration || '';
      row.status = raw.status || 'Sanctioned';
      row.scheme = raw.scheme || '';
    } else if (type === 'consultancy') {
      table = 'consultancy_projects';
      row.project_title = raw.project___consultancy_title || raw.title || '—';
      row.faculty_name = raw.faculty_name || raw.faculty || '—';
      row.faculty_designation = raw.faculty_designation || '';
      row.faculty_erp_id = raw.faculty_erp_id || '';
      row.client_name = raw.client_name || raw.agency || '—';
      row.funding_agency = raw.funding___consultancy_agency || raw.client_name || raw.agency || '—';
      row.amount = raw.amount_of_consultancy || raw.amount || '—';
      row.start_date = raw.start_date || '';
      row.end_date = raw.end_date || '';
      row.status = raw.status || 'Ongoing';
    } else if (type === 'supervisor') {
      table = 'research_supervisors';
      row.employee_id = raw.employee_id || raw.supervisor_id___employee_code || '';
      row.supervisor_name = raw.supervisor_name || raw.name || '—';
      row.year_of_phd = raw.year_of_phd || '';
      row.discipline = raw.discipline || '';
      row.research_area = raw.research_area || '';
      row.proof_link = raw.proof_link___upload || '';
    } else if (type === 'scholar') {
      table = 'research_scholars';
      row.register_number = raw.register_number || raw.application_number || '';
      row.application_number = raw.application_number || '';
      row.scholar_name = raw.scholar_name || raw.name || '—';
      row.programme = raw.programme || 'Ph.D';
      row.supervisor_name = raw.supervisor_name || raw.supervisor || '—';
      row.year_of_enrollment = parseInt(raw.year_of_enrollment || raw.year || year, 10);
      row.category = raw.category || 'Full-time';
      row.research_area = raw.research_area || '';
      row.status = raw.status || 'Ongoing';
      row.proof_link = raw.proof_link___upload || '';
    } else if (type === 'award') {
      table = 'research_awards';
      row.award_id = raw.award_id || '';
      row.faculty_name = raw.faculty_name || raw.faculty || '—';
      row.award_name = raw.award_name || raw.title || '—';
      row.awarding_org = raw.awarding_organization || '—';
      row.award_category = raw.award_category || 'State';
      row.proof_link = raw.proof___document_link || '';
    }

    if (!table) return { success: false, error: 'Unknown type: ' + type };

    try {
      var res = await window.supabaseClient.from(table).insert([row]).select();
      if (res.error) {
        console.warn('Supabase remote insert error:', res.error);
      }
      return { success: true, data: res.data };
    } catch (e) {
      console.warn('Supabase insert exception:', e);
      return { success: false, error: e.message };
    }
  },

  // ─── Field Mappers for Dashboard Uniformity ───────────────────────────────
  mapPublication(r) {
    return {
      year: parseInt(r.year || 2024, 10),
      department: r.department || '',
      departmentGroup: r.department || '',
      authors: r.author || r.authors || '—',
      title: r.paper_title || r.title || '—',
      journal: r.publisher || r.journal_name || r.journal || '—',
      link: r.publication_link || r.link || '',
      indexing: r.indexing_type || 'Scopus',
      quartile: r.quartile || '',
      impactFactor: r.impact_factor || '',
      doi: r.doi || '',
      raw: r
    };
  },

  mapPatent(r) {
    return {
      id: r.id || 'PAT-' + Math.random().toString(36).substr(2, 6),
      year: parseInt(r.year || 2024, 10),
      department: r.department || '',
      departmentGroup: r.department || '',
      title: r.patent_title || r.title || '—',
      inventors: r.inventors || '—',
      applicant: r.applicant_name || '',
      category: r.patent_category || 'Utility',
      status: r.patent_status || r.status || 'Published',
      filingDate: r.patent_filing_date || '',
      publishedDate: r.patent_published_date || '',
      grantedDate: r.granted_date || '',
      commercialized: r.status_of_commercialization || 'No',
      proofLink: r.proof_link || '',
      raw: r
    };
  },

  mapFunded(r) {
    return {
      year: parseInt(r.year || 2024, 10),
      department: r.department || '',
      departmentGroup: r.department || '',
      title: r.project_title || r.title || '—',
      principalInvestigator: r.principal_investigator || r.principalInvestigator || '—',
      coInvestigator: r.co_investigators || '',
      agency: r.funding_agency || r.agency || '—',
      amount: r.amount || '—',
      duration: r.duration || '',
      status: r.status || 'Sanctioned',
      scheme: r.scheme || '',
      raw: r
    };
  },

  mapConsultancy(r) {
    return {
      year: parseInt(r.year || 2024, 10),
      department: r.department || '',
      departmentGroup: r.department || '',
      title: r.project_title || r.title || '—',
      faculty: r.faculty_name || r.faculty || '—',
      agency: r.funding_agency || r.client_name || r.agency || '—',
      amount: r.amount || '—',
      startDate: r.start_date || '',
      endDate: r.end_date || '',
      status: r.status || 'Ongoing',
      raw: r
    };
  },

  mapScholar(r) {
    return {
      year: parseInt(r.year || r.year_of_enrollment || 2024, 10),
      name: r.scholar_name || r.scholar || r.name || '—',
      scholar: r.scholar_name || r.scholar || r.name || '—',
      registration: r.register_number || r.application_number || '—',
      applicationNo: r.application_number || r.register_number || '—',
      department: r.department || '',
      departmentGroup: r.department || '',
      supervisor: r.supervisor_name || r.supervisor || '—',
      program: r.programme || 'Ph.D',
      category: r.category || 'Full-time',
      status: r.status || 'Ongoing',
      researchArea: r.research_area || '',
      raw: r
    };
  },

  mapSupervisor(r) {
    return {
      year: parseInt(r.year || 2024, 10),
      name: r.supervisor_name || r.name || '—',
      supervisor: r.supervisor_name || r.name || '—',
      employeeCode: r.employee_id || '',
      department: r.department || '',
      departmentGroup: r.department || '',
      discipline: r.discipline || '',
      researchArea: r.research_area || '',
      raw: r
    };
  },

  mapAward(r) {
    return {
      year: parseInt(r.year || 2024, 10),
      department: r.department || '',
      departmentGroup: r.department || '',
      awardId: r.award_id || '',
      faculty: r.faculty_name || '—',
      title: r.award_name || '—',
      organization: r.awarding_org || '—',
      category: r.award_category || 'State',
      proofLink: r.proof_link || '',
      raw: r
    };
  }
};

// Backwards compatibility for existing Management service calls
window.SupabaseMgmtService = {
  getSummary: function (year) {
    return window.MANAGEMENT_RESEARCH_DATA || { publications: [], patents: [], fundedProjects: [], supervisors: [], scholars: [], awards: [] };
  },
  getAllRecords: function (table) {
    return [];
  },
  insertRecord: function (type, record) {
    return window.SupabaseDataService.insertRecord(type, record, 'Management');
  }
};

// ─── Initialize Supabase Cloud Connectivity Exclusively ───────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () { window.SupabaseDataService.init(); });
} else {
  window.SupabaseDataService.init();
}
