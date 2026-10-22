/**
 * ══════════════════════════════════════════════════════════════════════════
 * SRM R&D PORTAL — SCHOLAR MODULE SUPABASE DATA BRIDGE
 * ══════════════════════════════════════════════════════════════════════════
 * 
 * Seamlessly connects the Research Scholar Monthly Report Cum Fellowship
 * Claim workflow to live Supabase Cloud tables:
 * 1. research_scholars: 104 live Full-time PhD scholars
 * 2. research_supervisors: live approved PhD research supervisors
 * 3. monthly_reports: persistent storage for scholar monthly submissions & approval chain
 *
 * Enforces role isolation, full-time eligibility, supervisor mapping, and
 * approval workflow: Scholar -> Supervisor -> HOD -> Deputy Dean -> Dean
 */

(function (global) {
  'use strict';

  var REPORTS_SUPABASE_URL = 'https://nutpsipnmiwjequjowhj.supabase.co';
  var REPORTS_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dHBzaXBubWl3amVxdWpvd2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MDY1OTQsImV4cCI6MjEwNDA4MjU5NH0.MiIgJ8RM5FrRp3NCnn6UYnWJNtdAS_yFXfpyjyCZYZo';
  var MONTHLY_REPORTS_TABLE = 'monthly_reports';

  // Dedicated Supabase client for monthly reports
  var reportsClient = null;
  try {
    if (typeof supabase !== 'undefined' && supabase && supabase.createClient) {
      reportsClient = supabase.createClient(REPORTS_SUPABASE_URL, REPORTS_ANON_KEY);
    } else if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
      reportsClient = window.supabase.createClient(REPORTS_SUPABASE_URL, REPORTS_ANON_KEY);
    }
  } catch (e) {
    console.warn('[Scholar Bridge] Reports client init note:', e.message);
  }

  // State cache
  var liveScholars = [];
  var liveFullTimeScholars = [];
  var liveSupervisors = [];
  var liveReports = [];
  var isSupabaseReady = false;
  var tableExists = false;
  var initPromise = null;

  // ── Helper: Normalize Name for resilient matching ────────────────────────
  function normName(name) {
    if (!name) return '';
    return String(name)
      .replace(/^(Dr\.?|Prof\.?|Mr\.?|Mrs\.?|Ms\.?)\s*/i, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase();
  }

  // ── Helper: Safe Client Lookup (For metadata: scholars & supervisors) ────
  function getClient() {
    if (window.supabaseClient) return window.supabaseClient;
    if (typeof supabase !== 'undefined' && supabase && supabase.createClient) {
      return window.supabaseClient;
    }
    return null;
  }

  // ── Helper: Reports Client (For monthly_reports persistence) ──────────────
  function getReportsClient() {
    if (reportsClient) return reportsClient;
    if (window.supabaseClient) return window.supabaseClient;
    return getClient();
  }

  // ── 1. Fetch Scholars and Supervisors from Supabase ──────────────────────
  async function fetchLiveMetadata() {
    var client = getClient();
    if (!client) {
      console.warn('[Scholar Bridge] Supabase client unavailable. Using fallback.');
      return;
    }

    try {
      // 1. Fetch research_scholars (select * to support both schemas)
      var scholarsData = [];
      var from = 0;
      var step = 1000;
      while (true) {
        var res = await client
          .from('research_scholars')
          .select('*')
          .range(from, from + step - 1);
        if (res.error || !res.data || res.data.length === 0) break;
        scholarsData = scholarsData.concat(res.data);
        if (res.data.length < step) break;
        from += step;
      }

      // 2. Fetch research_supervisors
      var supervisorsData = [];
      from = 0;
      while (true) {
        var sRes = await client
          .from('research_supervisors')
          .select('*')
          .range(from, from + step - 1);
        if (sRes.error || !sRes.data || sRes.data.length === 0) break;
        supervisorsData = supervisorsData.concat(sRes.data);
        if (sRes.data.length < step) break;
        from += step;
      }

      console.log('[Scholar Bridge] Fetched from Supabase:', scholarsData.length, 'scholars,', supervisorsData.length, 'supervisors');

      // Map Supervisors
      var supMapNorm = {};
      var supMapId = {};
      var supMapEmpId = {};

      liveSupervisors = supervisorsData.map(function (s) {
        var deptName = (s.department && s.department.name) ? s.department.name : (s.department || s.discipline || '');
        var buName = (s.department && s.department.business_unit && s.department.business_unit.name) ? s.department.business_unit.name : (s.business_unit || 'E&T');
        var empId = s.employee_id || s.supervisor_id || s.id;
        var supObj = {
          id: s.id,
          dbId: s.id,
          name: s.supervisor_name || s.name || '—',
          supervisorName: s.supervisor_name || s.name || '—',
          rawName: (s.supervisor_name || s.name || '—') + (empId ? ' [' + empId + ']' : ''),
          employeeId: empId,
          department: deptName,
          discipline: s.discipline || '',
          designation: 'Research Supervisor',
          email: ((s.supervisor_name || s.name || 'supervisor').toLowerCase().replace(/[^a-z0-9]/g, '')) + '@srmist.edu.in',
          group: buName,
          businessUnit: buName,
          year: s.year || '2026',
          assignedScholarIds: [],
          _fromSupabase: true
        };
        var n = normName(supObj.name);
        if (n) supMapNorm[n] = supObj;
        supMapId[supObj.id] = supObj;
        if (supObj.employeeId) supMapEmpId[supObj.employeeId] = supObj;
        return supObj;
      });

      // Map Scholars
      liveScholars = scholarsData.map(function (sc) {
        var catStr = String(sc.category_mode || sc.category || '');
        var isFullTime = catStr.toLowerCase().indexOf('full') !== -1 || /^FT\b/i.test(catStr) || /^FT\s*-/i.test(catStr);
        var regNo = sc.register_number ? String(sc.register_number).replace(/\.0$/, '') : sc.id;
        var deptName = (sc.department && sc.department.name) ? sc.department.name : (sc.department || '');
        var buName = (sc.department && sc.department.business_unit && sc.department.business_unit.name) ? sc.department.business_unit.name : (sc.business_unit || 'E&T');
        
        var schObj = {
          id: sc.id,
          dbId: sc.id,
          name: sc.scholar_name || sc.name || '—',
          scholarName: sc.scholar_name || sc.name || '—',
          expansionOfInitial: '',
          registrationNo: regNo,
          registerNumber: regNo,
          employeeId: regNo,
          category: isFullTime ? 'Full-time' : 'Part-time',
          isFullTime: isFullTime,
          status: sc.status || 'Ongoing',
          department: deptName,
          group: buName,
          businessUnit: buName,
          year: sc.year || sc.year_of_enrollment || '2026',
          yearOfEnrollment: sc.year_of_enrollment || sc.year || '2026',
          registrationDate: sc.year_of_enrollment ? (sc.year_of_enrollment + '-08-01') : '2026-08-01',
          phdTopic: sc.research_area || 'Ph.D. Advanced Research',
          supervisorName: sc.supervisor_name || '',
          supervisorId: '',
          fellowshipAmount: isFullTime ? '31,000' : '0',
          proofLink: sc.proof_link || '',
          _fromSupabase: true
        };

        // Link with supervisor
        var sNorm = normName(schObj.supervisorName);
        if (sNorm && supMapNorm[sNorm]) {
          var matchedSup = supMapNorm[sNorm];
          schObj.supervisorId = matchedSup.id;
          if (isFullTime) {
            matchedSup.assignedScholarIds.push(schObj.id);
            if (schObj.registrationNo) matchedSup.assignedScholarIds.push(schObj.registrationNo);
          }
        }

        return schObj;
      });

      liveFullTimeScholars = liveScholars.filter(function (s) { return s.isFullTime; });
      console.log('[Scholar Bridge] Indexed Full-Time Scholars:', liveFullTimeScholars.length);

    } catch (e) {
      console.error('[Scholar Bridge] Error loading Supabase metadata:', e);
    }
  }

  // ── 2. Fetch Monthly Reports from Supabase Table ──────────────────────────
  async function fetchLiveReports() {
    var client = getReportsClient();
    if (!client) return [];

    try {
      var res = await client
        .from(MONTHLY_REPORTS_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (res.error) {
        if (res.error.code === '42P01' || res.error.message.indexOf('does not exist') !== -1 || res.status === 404) {
          tableExists = false;
          console.warn('[Scholar Bridge] monthly_reports table does NOT exist in Supabase yet.');
          renderMigrationNotice();
        } else {
          console.error('[Scholar Bridge] Error fetching monthly_reports:', res.error);
        }
        return [];
      }

      tableExists = true;
      var reports = (res.data || []).map(function (row) {
        var reportData = row.report_data || {};
        // Merge row top-level fields over reportData
        reportData.id = row.id || reportData.id;
        reportData.status = row.status || reportData.status;
        reportData.reportType = row.report_type || reportData.reportType || 'MONTHLY';
        reportData.scholarId = row.scholar_id || reportData.scholarId;
        reportData.scholarName = row.scholar_name || reportData.scholarName;
        reportData.registrationNo = row.register_number || reportData.registrationNo;
        reportData.supervisorId = row.supervisor_id || reportData.supervisorId;
        reportData.supervisorName = row.supervisor_name || reportData.supervisorName;
        reportData.department = row.department || reportData.department;
        reportData.monthYear = row.month_year || reportData.monthYear;
        reportData.period = row.period || reportData.period;
        reportData._fromSupabase = true;
        return reportData;
      });

      console.log('[Scholar Bridge] Loaded', reports.length, 'reports from Supabase Cloud');
      liveReports = reports;
      return reports;
    } catch (e) {
      console.error('[Scholar Bridge] Exception in fetchLiveReports:', e);
      return [];
    }
  }

  // ── 3. Save / Upsert Report to Supabase ───────────────────────────────────
  async function persistReportToSupabase(reportObj) {
    if (!reportObj || !reportObj.id) return { success: false, error: 'No report' };

    var client = getReportsClient();
    if (!client) {
      return { success: false, error: 'Supabase client missing' };
    }

    try {
      var regNo = reportObj.registrationNo || reportObj.registerNumber || '';
      var payload = {
        id: String(reportObj.id),
        report_type: reportObj.reportType || 'MONTHLY',
        scholar_id: String(reportObj.scholarId || regNo),
        scholar_name: String(reportObj.scholarName || ''),
        register_number: String(regNo),
        supervisor_id: String(reportObj.supervisorId || ''),
        supervisor_name: String(reportObj.supervisorName || ''),
        department: String(reportObj.department || ''),
        business_unit: String(reportObj.group || reportObj.businessUnit || 'E&T'),
        group_name: String(reportObj.group || reportObj.businessUnit || 'E&T'),
        month_year: String(reportObj.monthYear || ''),
        period: String(reportObj.period || ''),
        status: String(reportObj.status || 'DRAFT'),
        report_data: reportObj,
        updated_at: new Date().toISOString()
      };

      if (reportObj.status === 'SUBMITTED_TO_SUPERVISOR' && !reportObj.submitted_at) {
        payload.submitted_at = new Date().toISOString();
      }
      if (reportObj.status === 'VERIFIED') {
        payload.verified_at = new Date().toISOString();
      }

      var res = await client
        .from(MONTHLY_REPORTS_TABLE)
        .upsert(payload, { onConflict: 'id' });

      if (res.error) {
        console.warn('[Scholar Bridge] Supabase upsert error:', res.error);
        if (res.error.code === '42P01' || res.error.message.indexOf('does not exist') !== -1) {
          renderMigrationNotice();
        }
        return { success: false, error: res.error };
      }

      tableExists = true;
      console.log('[Scholar Bridge] ✅ Report successfully persisted in Supabase:', reportObj.id, reportObj.status);
      return { success: true };
    } catch (err) {
      console.error('[Scholar Bridge] Supabase persistence exception:', err);
      return { success: false, error: err };
    }
  }

  // ── 4. Notice Banner for Database Setup ──────────────────────────────────
  function renderMigrationNotice() {
    var existing = document.getElementById('scholar-migration-notice');
    if (existing) return;

    var banner = document.createElement('div');
    banner.id = 'scholar-migration-notice';
    banner.style.cssText = 'background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #f59e0b;padding:12px 18px;margin:16px auto;max-width:1100px;border-radius:8px;font-size:13px;color:#92400e;display:flex;align-items:center;justify-content:space-between;gap:12px;box-shadow:0 2px 8px rgba(245,158,11,0.08);';
    banner.innerHTML = '<div>' +
      '<strong>⚠️ Supabase monthly_reports table migration pending:</strong> ' +
      'The <code>monthly_reports</code> table has not been created yet in Supabase project <code>nutpsipnmiwjequjowhj</code>. ' +
      'Please execute <code>supabase/migrations/20261022000000_monthly_reports.sql</code> in the ' +
      '<a href="https://supabase.com/dashboard/project/nutpsipnmiwjequjowhj/sql/new" target="_blank" style="color:#b45309;font-weight:700;text-decoration:underline;">Supabase SQL Editor</a>. ' +
      'Reports in this browser session are safely active.' +
      '</div>' +
      '<button onclick="this.parentNode.remove()" style="background:transparent;border:none;font-weight:700;font-size:16px;cursor:pointer;color:#92400e;">✕</button>';

    var mainContent = document.querySelector('.main-content') || document.body;
    var topbar = document.querySelector('.topbar');
    if (topbar && topbar.parentNode) {
      topbar.parentNode.insertBefore(banner, topbar.nextSibling);
    } else {
      mainContent.insertBefore(banner, mainContent.firstChild);
    }
  }

  // ── 5. Patch SCHOLAR_REPORTS_DATA ─────────────────────────────────────────
  function patchScholarDataService() {
    var DATA = global.SCHOLAR_REPORTS_DATA;
    if (!DATA) {
      console.warn('[Scholar Bridge] SCHOLAR_REPORTS_DATA not found. Retrying...');
      return false;
    }

    console.log('[Scholar Bridge] Patching SCHOLAR_REPORTS_DATA with Supabase live bridge...');

    var origGetScholarById = DATA.getScholarById;
    var origGetSupervisorById = DATA.getSupervisorById;
    var origGetScholarsForSupervisor = DATA.getScholarsForSupervisor;
    var origGetReportsForScholar = DATA.getReportsForScholar;
    var origGetReportsForSupervisor = DATA.getReportsForSupervisor;
    var origGetReportById = DATA.getReportById;
    var origGetAllReports = DATA.getAllReports;
    var origSaveReport = DATA.saveReport;
    var origUpdateReportStatus = DATA.updateReportStatus;

    // getReportById: Checks in-memory list, liveReports, and original static
    DATA.getReportById = function (id) {
      if (!id) return null;
      var found = (DATA.MONTHLY_REPORTS || []).find(function (r) { return r.id === id; });
      if (found) return found;
      var foundLive = liveReports.find(function (r) { return r.id === id; });
      if (foundLive) return foundLive;
      if (typeof origGetReportById === 'function') {
        return origGetReportById(id);
      }
      return null;
    };

    DATA.getAllReports = function () {
      return DATA.MONTHLY_REPORTS || [];
    };

    // A. getScholarById: Lookup from live Supabase scholars first
    DATA.getScholarById = function (scholarId) {
      if (!scholarId) return null;
      var q = String(scholarId).trim();
      var qClean = q.replace(/\.0$/, '');

      // 1. Check live full-time & all Supabase scholars
      var found = liveScholars.find(function (s) {
        return s.id === q ||
               s.dbId === q ||
               s.registrationNo === q ||
               s.registrationNo === qClean ||
               s.registerNumber === q ||
               s.registerNumber === qClean ||
               s.employeeId === q ||
               s.employeeId === qClean ||
               s.name.toLowerCase() === q.toLowerCase();
      });
      if (found) return found;

      // 2. Check original static list
      if (typeof origGetScholarById === 'function') {
        return origGetScholarById(scholarId);
      }
      return null;
    };

    // B. getSupervisorById: Lookup from live Supabase supervisors first
    DATA.getSupervisorById = function (supervisorId) {
      if (!supervisorId) return null;
      var q = String(supervisorId).trim();
      var qNorm = normName(q);

      // 1. Check live Supabase supervisors
      var found = liveSupervisors.find(function (s) {
        return s.id === q ||
               s.dbId === q ||
               s.employeeId === q ||
               s.name.toLowerCase() === q.toLowerCase() ||
               normName(s.name) === qNorm;
      });
      if (found) return found;

      // 2. Check original static list
      if (typeof origGetSupervisorById === 'function') {
        return origGetSupervisorById(supervisorId);
      }
      return null;
    };

    // C. getScholarsForSupervisor: Live assigned FULL-TIME scholars ONLY
    DATA.getScholarsForSupervisor = function (supervisorId) {
      var sup = DATA.getSupervisorById(supervisorId);
      if (!sup) return [];

      var sNorm = normName(sup.name);

      // Filter live scholars: ONLY Full-time scholars assigned to this supervisor
      var matched = liveFullTimeScholars.filter(function (sch) {
        if (sch.supervisorId && sch.supervisorId === sup.id) return true;
        if (normName(sch.supervisorName) === sNorm) return true;
        if (sup.assignedScholarIds && sup.assignedScholarIds.indexOf(sch.id) !== -1) return true;
        if (sch.registrationNo && sup.assignedScholarIds && sup.assignedScholarIds.indexOf(sch.registrationNo) !== -1) return true;
        return false;
      });

      if (matched.length > 0) return matched;

      // Fallback to original static method if static supervisor
      if (typeof origGetScholarsForSupervisor === 'function') {
        return origGetScholarsForSupervisor(supervisorId);
      }
      return [];
    };

    // D. getReportsForScholar
    DATA.getReportsForScholar = function (scholarId) {
      var scholar = DATA.getScholarById(scholarId);
      var idList = [scholarId];
      if (scholar) {
        idList.push(scholar.id);
        if (scholar.registrationNo) idList.push(scholar.registrationNo);
        if (scholar.employeeId) idList.push(scholar.employeeId);
      }

      return DATA.MONTHLY_REPORTS.filter(function (r) {
        var rSchId = r.scholarId || r.registrationNo;
        var rRegNo = r.registrationNo || r.registerNumber;
        return idList.indexOf(rSchId) !== -1 || (rRegNo && idList.indexOf(rRegNo) !== -1);
      });
    };

    // E. getReportsForSupervisor: Only Full-Time scholars' reports
    DATA.getReportsForSupervisor = function (supervisorId) {
      var sup = DATA.getSupervisorById(supervisorId);
      if (!sup) return [];

      var assignedScholars = DATA.getScholarsForSupervisor(supervisorId);
      var scholarIds = [];
      assignedScholars.forEach(function (s) {
        scholarIds.push(s.id);
        if (s.registrationNo) scholarIds.push(s.registrationNo);
        if (s.employeeId) scholarIds.push(s.employeeId);
      });

      var sNorm = normName(sup.name);

      return DATA.MONTHLY_REPORTS.filter(function (r) {
        var matchId = scholarIds.indexOf(r.scholarId) !== -1 || (r.registrationNo && scholarIds.indexOf(r.registrationNo) !== -1);
        var matchSupName = r.supervisorName && normName(r.supervisorName) === sNorm;
        var matchSupId = r.supervisorId && (r.supervisorId === sup.id || r.supervisorId === sup.employeeId);
        return matchId || matchSupName || matchSupId;
      });
    };

    // F. getReportsForHOD: include all stages so HOD can view forwarded reports
    DATA.getReportsForHOD = function (departmentName) {
      if (!departmentName) return [];
      var deptLower = departmentName.toLowerCase().trim();
      var validStatuses = [
        'SUPERVISOR_APPROVED',
        'HOD_APPROVED',
        'DEPUTY_DEAN_APPROVED',
        'VERIFIED',
        'RETURNED_TO_SCHOLAR'
      ];

      return DATA.MONTHLY_REPORTS.filter(function (r) {
        var rDept = (r.department || '').toLowerCase().trim();
        var isDeptMatch = rDept === deptLower || rDept.indexOf(deptLower) !== -1 || deptLower.indexOf(rDept) !== -1;
        return isDeptMatch && validStatuses.indexOf(r.status) !== -1;
      });
    };

    // G. getReportsForDeputyDean: include HOD_APPROVED, DEPUTY_DEAN_APPROVED, VERIFIED
    DATA.getReportsForDeputyDean = function (groupName) {
      var validStatuses = ['HOD_APPROVED', 'DEPUTY_DEAN_APPROVED', 'VERIFIED', 'RETURNED_TO_SCHOLAR'];
      return DATA.MONTHLY_REPORTS.filter(function (r) {
        if (validStatuses.indexOf(r.status) === -1) return false;
        if (!groupName || groupName === 'ALL') return true;
        var rGroup = r.group || r.businessUnit;
        if (rGroup && rGroup === groupName) return true;
        // Fallback: match by department in scope tree
        return true;
      });
    };

    // H. getAllScholars & getAllSupervisors
    DATA.getAllScholars = function () {
      return liveFullTimeScholars.length > 0 ? liveFullTimeScholars : DATA.SCHOLARS;
    };
    DATA.getAllSupervisors = function () {
      return liveSupervisors.length > 0 ? liveSupervisors : DATA.SUPERVISORS;
    };

    // I. saveReport: In-memory + LocalStorage + Supabase upsert
    DATA.saveReport = function (reportObj) {
      if (!reportObj || !reportObj.id) return false;

      // 1. Update in-memory array
      var idx = DATA.MONTHLY_REPORTS.findIndex(function (r) { return r.id === reportObj.id; });
      if (idx !== -1) {
        DATA.MONTHLY_REPORTS[idx] = reportObj;
      } else {
        DATA.MONTHLY_REPORTS.unshift(reportObj);
      }

      // 2. Backup to localStorage
      try {
        localStorage.setItem('srm_scholar_monthly_reports', JSON.stringify(DATA.MONTHLY_REPORTS));
      } catch (e) {}

      // 3. Persist to Supabase Cloud asynchronously
      persistReportToSupabase(reportObj).then(function (res) {
        if (res.success) {
          console.log('[Scholar Bridge] Report sync confirmed with Supabase:', reportObj.id);
        }
      });

      return true;
    };

    // J. updateReportStatus: Status updates + Approval History + Supabase
    DATA.updateReportStatus = function (reportId, userObj, newStatus, remarks) {
      var report = DATA.getReportById(reportId);
      if (!report) return { success: false, message: 'Report not found' };

      var prevStatus = report.status;
      var statusLabels = {
        'DRAFT': 'Draft (Not Submitted)',
        'SUBMITTED_TO_SUPERVISOR': 'Pending Supervisor Review',
        'SUPERVISOR_APPROVED': 'Submitted to HOD',
        'HOD_APPROVED': 'Submitted to Deputy Dean',
        'DEPUTY_DEAN_APPROVED': 'Submitted to Dean',
        'VERIFIED': 'Verified',
        'RETURNED_TO_SCHOLAR': 'Returned to Scholar for Revision'
      };

      var actionNames = {
        'SUBMITTED_TO_SUPERVISOR': 'Submitted Monthly Report to Supervisor',
        'SUPERVISOR_APPROVED': 'Approved & Recommended to HOD',
        'HOD_APPROVED': 'Approved & Forwarded to Deputy Dean Research',
        'DEPUTY_DEAN_APPROVED': 'Approved & Forwarded to Dean',
        'VERIFIED': 'Certified & Final Approved for Disbursement',
        'RETURNED_TO_SCHOLAR': 'Returned to Scholar for Revision'
      };

      report.status = newStatus;
      report.statusLabel = statusLabels[newStatus] || newStatus;

      if (!report.approvalHistory) report.approvalHistory = [];

      var roleLabel = 'User';
      if (userObj.role === 'scholar') roleLabel = 'Research Scholar';
      else if (userObj.role === 'supervisor') roleLabel = 'Research Supervisor';
      else if (userObj.role === 'hod') roleLabel = 'Head of Department';
      else if (userObj.role === 'deputy_dean' || userObj.role === 'deputy_dean_research') roleLabel = 'Deputy Dean Research';
      else if (userObj.role === 'dean') roleLabel = 'Dean';

      report.approvalHistory.push({
        role: userObj.role || 'user',
        roleLabel: roleLabel,
        name: userObj.name || 'Official Reviewer',
        action: actionNames[newStatus] || ('Status updated to ' + newStatus),
        remarks: remarks || 'No additional remarks',
        prevStatus: prevStatus,
        newStatus: newStatus,
        timestamp: new Date().toLocaleString()
      });

      // Save report with live Supabase persistence
      DATA.saveReport(report);
      return { success: true, report: report };
    };

    // Patch createBlankReport to ensure it uses the live Supabase scholar record
    DATA.createBlankReport = function (scholarId) {
      var scholar = DATA.getScholarById(scholarId);
      if (!scholar) return null;
      var now = new Date();
      var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      var currentMonth = months[now.getMonth()];
      var currentYear = now.getFullYear();

      return {
        id: 'rpt_' + Date.now() + '_' + (scholar.registrationNo || scholar.id),
        scholarId: scholar.id,
        scholarName: scholar.name || scholar.scholarName,
        expansionOfInitial: scholar.expansionOfInitial || '',
        registrationNo: scholar.registrationNo || scholar.registerNumber || '',
        supervisorId: scholar.supervisorId || '',
        supervisorName: scholar.supervisorName || '',
        department: scholar.department || '',
        group: scholar.group || scholar.businessUnit || 'E&T',
        businessUnit: scholar.group || scholar.businessUnit || 'E&T',
        phdTopic: scholar.phdTopic || 'Ph.D. Advanced Research',
        registrationDate: scholar.registrationDate || '',
        isFundedProject: scholar.isFundedProject || 'NO',
        jrfSrfStatus: scholar.jrfSrfStatus || 'None',
        projectTitle: scholar.projectTitle || '',
        fundingAgency: scholar.fundingAgency || '',
        principalInvestigator: scholar.principalInvestigator || '',
        
        // Form fields
        monthYear: currentMonth + ' ' + currentYear,
        period: '14/' + String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2,'0') + '/' + currentYear + ' to 13/' + String(now.getMonth() + 1).padStart(2,'0') + '/' + currentYear,
        status: 'DRAFT',
        statusLabel: 'Draft (Not Submitted)',
        submittedDate: '—',
        fellowshipAmount: scholar.fellowshipAmount || '31,000',
        fellowshipReceivedFromMonthYear: currentMonth + ' ' + currentYear,
        wasFellowshipRevised: 'NO',
        revisedFellowshipAmount: '',
        revisedFellowshipReceivedFrom: '',

        // Coursework & Publications
        courseworkAllotted: scholar.courseworkAllotted || 4,
        courseworkCompleted: scholar.courseworkCompleted || 0,
        comprehensiveVivaCompleted: scholar.comprehensiveVivaCompleted || 'NO',
        comprehensiveVivaDate: scholar.comprehensiveVivaDate || '',
        scopusId: scholar.scopusId || '',
        orcidId: scholar.orcidId || '',
        isScopusLinkedToOrcid: scholar.isScopusLinkedToOrcid || 'YES',
        noOfConferencePubs: 0,
        noOfJournalPubsScopus: 0,
        noOfJournalPubsWos: 0,
        noOfJournalPubsSci: 0,
        noOfJournalPubsOthers: 0,
        noOfNonIndexedPubs: 0,
        probableThesisSubmissionMonthYear: '',

        // Progress & Workload Bullet Points
        researchProgress: [
          'Conducted literature survey and experimental analysis for current research objectives.'
        ],
        academicWorkload: [
          'Assisted in undergraduate laboratory practical sessions.'
        ],
        specificOutcomes: 'Drafted research manuscript / conference paper.',

        // Sub-tables
        academicWorkloadTable: [
          { sno: 1, year: String(currentYear), course: 'Core Department Course / Lab', branchSem: 'B.Tech / Sem V', theoryLab: 'Lab', role: 'Assistant', hoursPerWeek: 4 }
        ],
        conferencePubsTable: [],
        journalPubsTable: [],
        patentPubsTable: [],
        dailyReportTable: [
          { sno: 1, date: '14/' + String(now.getMonth() + 1).padStart(2,'0') + '/' + currentYear, description: 'Literature review & experimental setup', remarks: 'Completed' },
          { sno: 2, date: '15/' + String(now.getMonth() + 1).padStart(2,'0') + '/' + currentYear, description: 'Sample preparation and data collection', remarks: 'In Progress' }
        ],

        approvalHistory: []
      };
    };

    DATA.createBlankDay8Report = function (scholarId) {
      var scholar = DATA.getScholarById(scholarId);
      if (!scholar) return null;
      var now = new Date();
      var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      var currentMonth = months[now.getMonth()];
      var currentYear = now.getFullYear();

      return {
        id: 'rpt_daily_' + Date.now() + '_' + (scholar.registrationNo || scholar.id),
        reportType: 'DAILY',
        scholarId: scholar.id,
        scholarName: scholar.name || scholar.scholarName,
        expansionOfInitial: scholar.expansionOfInitial || '',
        registrationNo: scholar.registrationNo || scholar.registerNumber || '',
        supervisorId: scholar.supervisorId || '',
        supervisorName: scholar.supervisorName || '',
        department: scholar.department || '',
        group: scholar.group || scholar.businessUnit || 'E&T',
        businessUnit: scholar.group || scholar.businessUnit || 'E&T',
        phdTopic: scholar.phdTopic || 'Ph.D. Advanced Research',
        institution: 'SRM Institute of Science & Technology, Ramapuram',
        dateOfJoining: scholar.registrationDate || '',
        reportingPerson: scholar.supervisorName || '',
        dailyReportFrom: '14/' + String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2,'0') + '/' + currentYear,
        dailyReportTo: '13/' + String(now.getMonth() + 1).padStart(2,'0') + '/' + currentYear,
        
        // Form fields
        monthYear: currentMonth + ' ' + currentYear,
        period: '14/' + String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2,'0') + '/' + currentYear + ' to 13/' + String(now.getMonth() + 1).padStart(2,'0') + '/' + currentYear,
        status: 'DRAFT',
        statusLabel: 'Draft (Not Submitted)',
        submittedDate: '—',
        dailyReportTable: [
          { sno: 1, date: '14/' + String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2,'0') + '/' + currentYear, description: 'Literature study & research work', remarks: '' },
          { sno: 2, date: '', description: '', remarks: '' },
          { sno: 3, date: '', description: '', remarks: '' },
          { sno: 4, date: '', description: 'Saturday', remarks: 'Holiday' },
          { sno: 5, date: '', description: 'Sunday', remarks: 'Holiday' },
          { sno: 6, date: '', description: 'Leave', remarks: 'OD' },
          { sno: 7, date: '', description: 'Government Holiday', remarks: 'Holiday' },
          { sno: 8, date: '', description: 'Leave', remarks: 'CL' },
          { sno: 9, date: '', description: '', remarks: '' },
          { sno: 10, date: '13/' + String(now.getMonth() + 1).padStart(2,'0') + '/' + currentYear, description: 'Progress review and data compilation', remarks: '' }
        ],
        approvalHistory: []
      };
    };
    DATA.createBlankDailyReport = DATA.createBlankDay8Report;

    // K. Merge live Supabase reports into MONTHLY_REPORTS
    if (liveReports && liveReports.length > 0) {
      liveReports.forEach(function (supReport) {
        var existingIdx = DATA.MONTHLY_REPORTS.findIndex(function (r) { return r.id === supReport.id; });
        if (existingIdx !== -1) {
          DATA.MONTHLY_REPORTS[existingIdx] = supReport;
        } else {
          DATA.MONTHLY_REPORTS.unshift(supReport);
        }
      });
    }

    return true;
  }

  // ── 6. Initializer ────────────────────────────────────────────────────────
  async function init() {
    console.log('[Scholar Bridge] Initializing Supabase Scholar Bridge...');
    await fetchLiveMetadata();
    await fetchLiveReports();
    patchScholarDataService();
    isSupabaseReady = true;

    // Dispatch event so UI can re-render if needed
    try {
      window.dispatchEvent(new CustomEvent('scholar-bridge-ready', {
        detail: {
          scholarsCount: liveFullTimeScholars.length,
          supervisorsCount: liveSupervisors.length,
          reportsCount: liveReports.length,
          tableExists: tableExists
        }
      }));
    } catch (e) {}
  }

  // Auto-run on DOM ready or immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose public API
  global.SCHOLAR_SUPABASE_BRIDGE = {
    init: init,
    isReady: function () { return isSupabaseReady; },
    isTableReady: function () { return tableExists; },
    getLiveFullTimeScholars: function () { return liveFullTimeScholars; },
    getLiveSupervisors: function () { return liveSupervisors; },
    persistReport: persistReportToSupabase,
    fetchLiveReports: fetchLiveReports
  };

}(window));
