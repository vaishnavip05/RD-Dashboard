(function () {
  'use strict';

  // ─── STORAGE KEY ────────────────────────────────────────────────────────────
  var STORAGE_KEY = 'SRM_RD_COORDINATOR_RECORDS';

  // ─── REQUIRED FIELDS PER FORM TYPE ──────────────────────────────────────────
  // Only these exact field names are required (browser will block submit if empty)
  var REQUIRED_FIELDS = {
    publication: [
      'Publication ID / SRM Indexed No.', 'Department', 'Year', 'Author(s)', 'Paper Title', 'Journal Name', 'Faculty First Author', 'Author ID / Scopus Author ID'
    ],
    patent: [
      'Department', 'Year', 'Patent Title', 'Inventor(s)', 'Patent ID / Application Number'
    ],
    funded: [
      'Department', 'Year', 'Project Title', 'Principal Investigator', 'Funding Agency'
    ],
    consultancy: [
      'Department', 'Year', 'Project / Consultancy Title', 'Faculty Name', 'Client Name'
    ],
    supervisor: [
      'Department', 'Year', 'Supervisor Name', 'Supervisor ID / Employee Code'
    ],
    scholar: [
      'Department', 'Scholar Name', 'Register Number / Application Number', 'Supervisor Name'
    ],
    award: [
      'Department', 'Year', 'Faculty Name', 'Award Name', 'Awarding Organization'
    ]
  };

  // ─── ALL FORM FIELDS ─────────────────────────────────────────────────────────
  var FORM_FIELDS = {
    publication: [
      "Publication ID / SRM Indexed No.", "Year", "Department", "Author(s)", "Paper Title",
      "Journal Name", "Publication Month", "Indexing Type", "Quartile", "Impact Factor", "DOI",
      "Publication Link", "Publication Status", "Author ID / Scopus Author ID", "Faculty First Author",
      "Faculty Second Author", "Faculty Third Author", "Faculty Corresponding Author",
      "Student First Author", "PhD Scholar First Author", "PhD Supervisor", "Volume", "Issue",
      "Article Number", "Page Start", "Page End", "Page Count", "Citations / Cited By", "Publisher",
      "ISSN", "ISBN", "PubMed ID", "Document Type", "Publication Stage", "Open Access", "Source",
      "EID", "Author Affiliations", "Proof / Drive Link", "Verification Status", "Verification Remarks"
    ],
    patent: [
      "Patent ID / Application Number", "Year", "Department", "Patent Title", "Inventor(s)",
      "Inventor Type", "Patent Authority", "Patent Category", "Patent Status", "Patent Filing Date",
      "Patent Application Number", "Proof / Document Link"
    ],
    funded: [
      "Project ID", "Year", "Department", "Project Title", "Principal Investigator",
      "Co-Principal Investigator / Co-Investigator", "Funding Agency", "Amount", "Duration / Period",
      "Status", "Scheme", "Letter Reference Number", "Date of Application", "Date of Sanction",
      "Amount of Fund Claimed", "Extended Activities", "Remarks", "Verification Status"
    ],
    consultancy: [
      "Project ID", "Year", "Department", "Project / Consultancy Title", "Faculty Name",
      "Faculty Designation", "Faculty ERP ID", "Client Name", "Funding / Consultancy Agency",
      "Amount of Consultancy", "Start Date", "End Date", "Faculty Share (80%)", "Institute Share (20%)",
      "Status", "Remarks", "Verification Status"
    ],
    supervisor: [
      "Supervisor ID / Employee Code", "Supervisor Name", "Department", "Year", "Year of PhD",
      "Discipline", "Research Area", "Verification Status"
    ],
    scholar: [
      "Scholar ID", "Scholar Name", "Register Number / Application Number", "Department",
      "Programme", "Supervisor Name", "Year of Enrollment", "Joining Date", "Category / Mode",
      "Research Area", "Status", "Verification Status"
    ],
    award: [
      "Award ID", "Year", "Department", "Faculty Name", "Award Name", "Awarding Organization",
      "Award Category", "Proof / Document Link", "Verification Status"
    ]
  };

  // ─── LOAD SAVED RECORDS FROM LOCALSTORAGE AND MERGE INTO LIVE DATASETS ───────
  function loadAndMergePersistedRecords() {
    var saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (e) { saved = {}; }

    Object.keys(saved).forEach(function (storeKey) {
      var records = saved[storeKey];
      if (!Array.isArray(records) || !records.length) return;
      injectRecordsIntoDataset(storeKey, records);
    });
  }

  // Map storeKey → live array, and push records in without duplicates
  function injectRecordsIntoDataset(storeKey, records) {
    var target = getTargetArray(storeKey);
    if (!target) return;

    records.forEach(function (rec) {
      // Deduplicate by a simple fingerprint (type+dept+title)
      var fp = rec._fp;
      if (fp && target.some(function (r) { return r._fp === fp; })) return;
      target.push(rec);
    });
  }

  function getTargetArray(storeKey) {
    switch (storeKey) {
      case 'flabs_publications':
        return window.RESEARCH_DATA && window.RESEARCH_DATA.publications;
      case 'flabs_patents':
        return window.RESEARCH_DATA && window.RESEARCH_DATA.patents;
      case 'flabs_fundedProjects':
        return window.RESEARCH_DATA && window.RESEARCH_DATA.fundedProjects;
      case 'flabs_awards':
        return window.RESEARCH_DATA && window.RESEARCH_DATA.awards;
      case 'flabs_supervisors':
        return window.RESEARCH_DATA && window.RESEARCH_DATA.supervisors;
      case 'flabs_scholars':
        return window.RESEARCH_DATA && window.RESEARCH_DATA.scholars;
      case 'mgmt_publications':
        return window.SRM_MGMT_DATA && window.SRM_MGMT_DATA.publications;
      case 'mgmt_patents':
        return window.SRM_MGMT_DATA && window.SRM_MGMT_DATA.patents;
      case 'mgmt_funded_projects':
        return window.SRM_MGMT_DATA && window.SRM_MGMT_DATA.funded_projects;
      case 'mgmt_awards':
        return window.SRM_MGMT_DATA && window.SRM_MGMT_DATA.awards;
      case 'mgmt_supervisors':
        return window.SRM_MGMT_DATA && window.SRM_MGMT_DATA.supervisors;
      case 'mgmt_scholars':
        return window.SRM_MGMT_DATA && window.SRM_MGMT_DATA.scholars;
      case 'et_publications':
        return window.ET_PUBLICATIONS_DATA;
      case 'et_patents':
        return window.ET_PATENTS_DATA;
      case 'et_funded':
        return window.ET_FUNDED_PROJECTS_DATA;
      case 'et_consultancy':
        return window.ET_CONSULTANCY_PROJECTS_DATA;
      case 'et_supervisors':
        return window.ET_SUPERVISORS_DATA;
      case 'et_scholars':
        return window.ET_SCHOLARS_DATA;
      default:
        return null;
    }
  }

  function getStoreKey(type, group) {
    var prefix = group === 'FLABS' ? 'flabs' : group === 'Management' ? 'mgmt' : 'et';
    var suffix = {
      publication: group === 'FLABS' ? 'publications' : group === 'Management' ? 'publications' : 'publications',
      patent: group === 'FLABS' ? 'patents' : group === 'Management' ? 'patents' : 'patents',
      funded: group === 'FLABS' ? 'fundedProjects' : group === 'Management' ? 'funded_projects' : 'funded',
      consultancy: group === 'FLABS' ? 'consultancyProjects' : group === 'Management' ? 'consultancy_projects' : 'consultancy',
      supervisor: group === 'FLABS' ? 'supervisors' : group === 'Management' ? 'supervisors' : 'supervisors',
      scholar: group === 'FLABS' ? 'scholars' : group === 'Management' ? 'scholars' : 'scholars',
      award: group === 'FLABS' ? 'awards' : group === 'Management' ? 'awards' : 'awards'
    };
    return prefix + '_' + suffix[type];
  }

  // ─── PERSIST A RECORD TO LOCALSTORAGE ────────────────────────────────────────
  function persistRecord(storeKey, record) {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { saved = {}; }
    if (!saved[storeKey]) saved[storeKey] = [];
    saved[storeKey].push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }

  // ─── DEPARTMENT LIST FROM SCOPE TREE ─────────────────────────────────────────
  function getDepartmentsByGroup(group) {
    if (window.SRM_SCOPE) {
      var tree = window.SRM_SCOPE.getTree();
      var groupNode = window.SRM_SCOPE.findNodeByKey(tree, group) ||
                      window.SRM_SCOPE.findNodeByLabel(tree, group);
      if (groupNode && groupNode.children) {
        return groupNode.children.filter(function (c) { return c.type === 'dept'; }).map(function (c) { return c.label; });
      }
    }
    return [];
  }

  // ─── SIDEBAR ADD-DATA BUTTONS ─────────────────────────────────────────────────
  function initAddDataFeature() {
    var AUTH = window.SRM_AUTH;
    if (!AUTH) return;

    var user = AUTH.getCurrentUser();
    if (!user || user.role !== 'rd_coordinator') return;

    // Load any previously saved records into live data arrays
    loadAndMergePersistedRecords();

    var sidebarPanel = document.getElementById('scope-sidebar');
    if (!sidebarPanel) return;

    // Avoid duplicate injection
    if (document.getElementById('rd-coordinator-add-data')) return;

    var addDataContainer = document.createElement('div');
    addDataContainer.id = 'rd-coordinator-add-data';
    addDataContainer.style.cssText = 'padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 16px;';
    addDataContainer.innerHTML =
      '<div style="color:#8ab4f8;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;">Add Data (' + (user.group || '') + ')</div>' +
      makeBtn('publication', '+ Add Publication') +
      makeBtn('patent',      '+ Add Patent') +
      makeBtn('funded',      '+ Add Funded Project') +
      makeBtn('consultancy', '+ Add Consultancy Project') +
      makeBtn('supervisor',  '+ Add Research Supervisor') +
      makeBtn('scholar',     '+ Add Research Scholar') +
      makeBtn('award',       '+ Add Research Award');

    sidebarPanel.parentNode.appendChild(addDataContainer);

    addDataContainer.querySelectorAll('.add-data-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openFormModal(btn.dataset.type, user.group);
      });
    });

    injectModalStyles();
  }

  function makeBtn(type, label) {
    return '<button class="add-data-btn" data-type="' + type + '" style="display:block;width:100%;text-align:left;background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.1);padding:8px 12px;margin-bottom:7px;border-radius:6px;cursor:pointer;font-size:13px;">' + label + '</button>';
  }

  // ─── OPEN FORM MODAL ──────────────────────────────────────────────────────────
  function openFormModal(type, group) {
    var modal = document.getElementById('rd-data-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'rd-data-modal';
      modal.className = 'rd-modal-overlay';
      document.body.appendChild(modal);
    }

    var depts = getDepartmentsByGroup(group);
    var fields = FORM_FIELDS[type];
    var required = REQUIRED_FIELDS[type] || [];

    var typeLabels = {
      publication: 'Publication', patent: 'Patent', funded: 'Funded Project',
      consultancy: 'Consultancy Project', supervisor: 'Research Supervisor',
      scholar: 'Research Scholar', award: 'Research Award'
    };
    var title = 'Add ' + (typeLabels[type] || type);

    var rows = '';
    fields.forEach(function (f) {
      var fieldName = f.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      var isReq = required.indexOf(f) !== -1;
      var asterisk = isReq ? ' <span style="color:red;">*</span>' : '';
      var inputHtml = '';

      if (f === 'Department') {
        inputHtml = '<select name="' + fieldName + '" ' + (isReq ? 'required' : '') + ' style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;">' +
          '<option value="">Select Department...</option>' +
          depts.map(function (d) { return '<option value="' + d + '">' + d + '</option>'; }).join('') +
          '</select>';
      } else if (f === 'Year') {
        inputHtml = '<select name="' + fieldName + '" ' + (isReq ? 'required' : '') + ' style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;">' +
          '<option value="2024">2024</option><option value="2025">2025</option><option value="2026" selected>2026</option>' +
          '</select>';
      } else {
        inputHtml = '<input type="text" name="' + fieldName + '" ' + (isReq ? 'required' : '') + ' placeholder="' + f + '" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;">';
      }

      rows += '<div style="display:flex;flex-direction:column;">' +
        '<label style="font-size:12px;font-weight:600;color:#475569;margin-bottom:4px;">' + f + asterisk + '</label>' +
        inputHtml + '</div>';
    });

    modal.innerHTML =
      '<div class="rd-modal-content">' +
        '<h2 style="margin-top:0;color:#1e293b;font-size:18px;margin-bottom:4px;">' + title + '</h2>' +
        '<p style="margin:0 0 18px;color:#64748b;font-size:13px;">Group: <strong>' + group + '</strong> &nbsp;|&nbsp; <span style="color:red;">*</span> Required fields</p>' +
        '<form id="rd-data-form">' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">' + rows + '</div>' +
          '<div id="rd-modal-msg" style="margin-top:14px;font-weight:600;color:green;min-height:20px;"></div>' +
          '<div style="margin-top:18px;display:flex;justify-content:flex-end;gap:10px;">' +
            '<button type="button" id="rd-cancel-btn" style="padding:8px 18px;border:1px solid #cbd5e1;background:#fff;border-radius:5px;cursor:pointer;font-size:13px;">Cancel</button>' +
            '<button type="submit" style="padding:8px 18px;border:none;background:#0ea5e9;color:#fff;border-radius:5px;cursor:pointer;font-weight:600;font-size:13px;">Submit</button>' +
          '</div>' +
        '</form>' +
      '</div>';

    modal.style.display = 'flex';

    document.getElementById('rd-cancel-btn').addEventListener('click', function () {
      modal.style.display = 'none';
    });

    document.getElementById('rd-data-form').addEventListener('submit', function (e) {
      e.preventDefault();
      saveRecord(type, group, new FormData(e.target));
    });
  }

  // ─── SAVE RECORD ─────────────────────────────────────────────────────────────
  function saveRecord(type, group, formData) {
    var record = {};
    formData.forEach(function (value, key) { record[key] = value; });

    // Normalise year to integer
    if (record.year) record.year = parseInt(record.year, 10);

    // Build a canonical title so dashboard list views can render it
    record.title = record.paper_title || record.patent_title || record.project_title ||
                   record.project___consultancy_title || record.award_name ||
                   record.supervisor_name || record.scholar_name || '';

    // Fingerprint for deduplication across reloads
    record._fp = type + '|' + group + '|' + record.department + '|' + record.title + '|' + Date.now();

    // Mark the record's group so the app can scope it correctly
    record._group = group;
    record._type  = type;

    // Push into the live in-memory dataset
    var storeKey = getStoreKey(type, group);
    var target = getTargetArray(storeKey);
    if (target) {
      target.push(record);
    } else {
      // Fallback: create the array if missing
      if (group === 'FLABS' && window.RESEARCH_DATA) {
        var fk = type === 'funded' ? 'fundedProjects' : type + 's';
        window.RESEARCH_DATA[fk] = window.RESEARCH_DATA[fk] || [];
        window.RESEARCH_DATA[fk].push(record);
      } else if (group === 'Management' && window.SRM_MGMT_DATA) {
        var mk = type === 'funded' ? 'funded_projects' : type + 's';
        window.SRM_MGMT_DATA[mk] = window.SRM_MGMT_DATA[mk] || [];
        window.SRM_MGMT_DATA[mk].push(record);
      }
    }

    // ── Persist to localStorage so data survives sign-out / page refresh ───────
    persistRecord(storeKey, record);

    var msgEl = document.getElementById('rd-modal-msg');
    if (msgEl) msgEl.textContent = '✓ Record added successfully!';

    setTimeout(function () {
      var modal = document.getElementById('rd-data-modal');
      if (modal) modal.style.display = 'none';

      // Refresh current dashboard view
      var activeNav = document.querySelector('.nav-link.active');
      if (activeNav) activeNav.click();
    }, 900);
  }

  // ─── STYLES ──────────────────────────────────────────────────────────────────
  function injectModalStyles() {
    if (document.getElementById('rd-modal-styles')) return;
    var s = document.createElement('style');
    s.id = 'rd-modal-styles';
    s.innerHTML =
      '.rd-modal-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,23,42,.8);display:none;justify-content:center;align-items:center;z-index:10000;}' +
      '.rd-modal-content{background:#fff;padding:26px;border-radius:8px;width:82%;max-width:820px;max-height:90vh;overflow-y:auto;box-shadow:0 12px 32px rgba(0,0,0,.25);font-family:"Inter",sans-serif;}' +
      '.rd-modal-content *{box-sizing:border-box;}' +
      '.add-data-btn:hover{background:rgba(255,255,255,.12)!important;}';
    document.head.appendChild(s);
  }

  // ─── BOOT ─────────────────────────────────────────────────────────────────────
  // Non-coordinator roles: just load persisted records into live data so they see the counts
  window.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      loadAndMergePersistedRecords();   // always runs – all roles benefit
      initAddDataFeature();             // only adds buttons if rd_coordinator
    }, 1000);
  });

})();
