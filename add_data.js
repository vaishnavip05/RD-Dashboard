(function () {
  'use strict';

  // ─── STORAGE KEY ────────────────────────────────────────────────────────────
  var STORAGE_KEY = 'SRM_RD_COORDINATOR_RECORDS';

  // ─── REQUIRED FIELDS PER FORM TYPE ──────────────────────────────────────────
  var REQUIRED_FIELDS = {
    publication: [
      'Department', 'Year', 'Paper Title', 'Author', 'DOI', 'Publisher', 'ISSN'
    ],
    patent: [
      'Department', 'Year', 'Patent Title', 'Applicant Name', 'Inventor(s)',
      'Patent Category', 'Patent Status', 'Patent Filing Date', 'Status of Commercialization'
    ],
    funded: [
      'Department', 'Year', 'Project Title', 'Principal Investigator',
      'Funding Agency', 'Amount', 'Status'
    ],
    consultancy: [
      'Department', 'Year', 'Project / Consultancy Title', 'Faculty Name',
      'Faculty Designation', 'Faculty ERP ID', 'Client Name',
      'Funding / Consultancy Agency', 'Amount of Consultancy', 'Start Date',
      'End Date', 'Faculty Share (80%)', 'Institute Share (20%)', 'Status'
    ],
    supervisor: [
      'Employee ID', 'Supervisor Name', 'Department', 'Year', 'Year of PhD',
      'Discipline', 'Research Area', 'Proof Link / Upload'
    ],
    scholar: [
      'Register Number', 'Application Number', 'Scholar Name', 'Department',
      'Programme', 'Supervisor Name', 'Year of Enrollment', 'Joining Date',
      'Category', 'Research Area', 'Status', 'Proof Link / Upload'
    ],
    award: [
      'Award ID', 'Year', 'Department', 'Faculty Name', 'Award Name',
      'Awarding Organization', 'Award Category'
    ]
  };

  // ─── ALL FORM FIELDS ─────────────────────────────────────────────────────────
  var FORM_FIELDS = {
    publication: [
      "Department", "Year", "Paper Title", "Author", "Publication Date",
      "Indexing Type", "Quartile", "Impact Factor", "DOI", "Publication Link",
      "Publisher", "ISSN", "ISBN", "Author ID / Scopus Author ID",
      "Total Number of Authors", "SRM Claiming Author Name",
      "SRM Author Position in the Paper", "SRM Author Affiliation",
      "Non-SRM Authors' Affiliations", "Claiming Author Scopus ID",
      "Scopus Proof – Upload/Link", "Volume", "Issue", "Article Number",
      "Page Start", "Page End", "Page Count", "Document Type", "Open Access",
      "Author Affiliations", "Proof / Drive Link"
    ],
    patent: [
      "Department", "Year", "Patent Title", "Applicant Name", "Inventor(s)",
      "Inventor Type", "Patent Authority", "Patent Category", "Patent Status",
      "Patent Filing Date", "Patent Published Date", "Granted Date",
      "Status of Commercialization", "Product License Number", "Technology Transfer Document",
      "Proof / Document Link"
    ],
    funded: [
      "Department", "Year", "Project Title", "Principal Investigator",
      "Co-Principal Investigator / Co-Investigator", "Funding Agency", "Amount",
      "Duration / Period", "Status", "Scheme", "Letter Reference Number",
      "Date of Application", "Date of Sanction", "Amount of Fund Claimed",
      "Extended Activities", "Remarks"
    ],
    consultancy: [
      "Department", "Year", "Project / Consultancy Title", "Faculty Name",
      "Faculty Designation", "Faculty ERP ID", "Client Name",
      "Funding / Consultancy Agency", "Amount of Consultancy", "Start Date",
      "End Date", "Faculty Share (80%)", "Institute Share (20%)", "Status", "Remarks"
    ],
    supervisor: [
      "Employee ID", "Supervisor Name", "Department", "Year", "Year of PhD",
      "Discipline", "Research Area", "Proof Link / Upload"
    ],
    scholar: [
      "Register Number", "Application Number", "Scholar Name", "Department",
      "Programme", "Supervisor Name", "Year of Enrollment", "Joining Date",
      "Category", "Research Area", "Status", "Proof Link / Upload"
    ],
    award: [
      "Award ID", "Year", "Department", "Faculty Name", "Award Name",
      "Awarding Organization", "Award Category", "Proof / Document Link"
    ]
  };

  // ─── CANONICAL NORMALIZATION ────────────────────────────────────────────────
  function normalizeRecord(type, group, raw) {
    var rec = Object.assign({}, raw);
    rec.year = parseInt(raw.year || raw.year_of_enrollment || 2026, 10);
    rec.department = (raw.department || '').trim();
    rec.departmentGroup = rec.department;
    rec.dept = rec.department;
    rec._source_department = rec.department;

    if (type === 'publication') {
      rec.title = raw.paper_title || raw.title || '—';
      rec['Title of the paper'] = rec.title;
      rec.authors = raw.author || raw.author_s_ || raw.authors || '—';
      rec['Authors (ALL)'] = rec.authors;
      rec.journal = raw.publisher || raw.journal_name || raw.journal || '—';
      rec['Journal Name'] = rec.journal;
      rec.link = raw.publication_link || raw.link || '';
      rec['Paper Link'] = rec.link;
      rec.status = 'Published';
      rec.indexing = raw.indexing_type || 'Scopus';
      rec.quartile = raw.quartile || '';
      rec.doi = raw.doi || '';
      rec.publisher = raw.publisher || '';
      rec.issn = raw.issn || '';
      rec.scopusId = raw.claiming_author_scopus_id || raw.author_id___scopus_author_id || '';
    } else if (type === 'patent') {
      rec.title = raw.patent_title || raw.title || '—';
      rec['Patent title'] = rec.title;
      rec.applicant = raw.applicant_name || '';
      rec.inventors = raw.inventor_s_ || raw.inventors || '—';
      rec['Inventor(s)'] = rec.inventors;
      rec.category = raw.patent_category || 'Utility';
      rec.status = raw.patent_status || 'Filed';
      rec.filingDate = raw.patent_filing_date || raw.filingDate || '—';
      rec.publishedDate = raw.patent_published_date || '';
      rec.grantedDate = raw.granted_date || '';
      rec.commercialized = raw.status_of_commercialization || 'No';
      rec.licenseNumber = raw.product_license_number || '';
      rec.techTransferDoc = raw.technology_transfer_document || '';
      rec.proofLink = raw.proof___document_link || raw.proofLink || '';
    } else if (type === 'funded') {
      rec.title = raw.project_title || raw.title || '—';
      rec['Project Title'] = rec.title;
      rec.principalInvestigator = raw.principal_investigator || raw.principalInvestigator || raw.pi || '—';
      rec['Principal Investigator'] = rec.principalInvestigator;
      rec.coPi = raw.co_principal_investigator___co_investigator || raw.coPi || '';
      rec.agency = raw.funding_agency || raw.fundingAgency || raw.agency || '—';
      rec['Funding Agency'] = rec.agency;
      rec.amount = raw.amount || '—';
      rec.duration = raw.duration___period || raw.duration || '—';
      rec.status = raw.status || 'Submitted';
    } else if (type === 'consultancy') {
      rec.title = raw.project___consultancy_title || raw.title || '—';
      rec.faculty = raw.faculty_name || raw.faculty || '—';
      rec.facultyDesignation = raw.faculty_designation || '';
      rec.facultyErpId = raw.faculty_erp_id || '';
      rec.client = raw.client_name || '';
      rec.agency = raw.funding___consultancy_agency || raw.client_name || raw.agency || '—';
      rec.amount = raw.amount_of_consultancy || raw.amount || '—';
      rec.startDate = raw.start_date || '';
      rec.endDate = raw.end_date || '';
      rec.facultyShare = raw.faculty_share__80__ || '';
      rec.instituteShare = raw.institute_share__20__ || '';
      rec.status = raw.status || 'Ongoing';
    } else if (type === 'supervisor') {
      rec.name = raw.supervisor_name || raw.name || '—';
      rec.supervisor = rec.name;
      rec.employeeCode = raw.employee_id || raw.supervisor_id___employee_code || '';
      rec.yearOfPhd = raw.year_of_phd || '';
      rec.discipline = raw.discipline || '';
      rec.researchArea = raw.research_area || '';
      rec.proofLink = raw.proof_link___upload || '';
    } else if (type === 'scholar') {
      rec.name = raw.scholar_name || raw.name || '—';
      rec.scholar = rec.name;
      rec.registration = raw.register_number || raw.application_number || '';
      rec.applicationNumber = raw.application_number || '';
      rec.supervisor = raw.supervisor_name || raw.supervisor || '';
      rec.program = raw.programme || 'Ph.D';
      rec.mode = raw.category || 'Full-time';
      rec.category = rec.mode;
      rec.status = raw.status || 'Ongoing';
      rec.researchArea = raw.research_area || '';
      rec.joiningDate = raw.joining_date || '';
      rec.proofLink = raw.proof_link___upload || '';
    } else if (type === 'award') {
      rec.awardId = raw.award_id || '';
      rec.title = raw.award_name || raw.title || '—';
      rec.faculty = raw.faculty_name || raw.faculty || '—';
      rec.organization = raw.awarding_organization || '—';
      rec.category = raw.award_category || 'State';
      rec.proofLink = raw.proof___document_link || '';
    }

    rec._type = type;
    rec._group = group;
    if (!rec._fp) {
      rec._fp = type + '|' + group + '|' + rec.department + '|' + (rec.title || rec.name) + '|' + rec.year + '|' + Date.now();
    }
    return rec;
  }

  // ─── INJECT RECORD INTO ACTIVE DATASETS ──────────────────────────────────────
  function injectRecordIntoLiveState(type, group, rec) {
    if (!rec) return;
    var yr = rec.year || 2026;
    var fp = rec._fp;

    if (group === 'FLABS') {
      if (!window.RESEARCH_DATA) return;
      var arr = null;
      if (type === 'publication') arr = window.RESEARCH_DATA.publications;
      else if (type === 'patent') arr = window.RESEARCH_DATA.patents;
      else if (type === 'funded') arr = window.RESEARCH_DATA.funded;
      else if (type === 'scholar') arr = window.RESEARCH_DATA.scholars;
      else if (type === 'award') arr = window.RESEARCH_DATA.awards;

      if (arr) {
        if (!arr.some(function (r) { return r._fp === fp; })) {
          arr.unshift(rec);
        }
      }
    } else if (group === 'E&T') {
      if (type === 'publication') {
        var pArr = yr === 2024 ? window.ET_PUBLICATIONS_2024 : yr === 2025 ? window.ET_PUBLICATIONS_2025 : window.ET_PUBLICATIONS_2026;
        if (pArr && !pArr.some(function (r) { return r._fp === fp; })) {
          pArr.unshift(rec);
        }
      } else if (type === 'patent') {
        if (window.ET_PATENTS && !window.ET_PATENTS.some(function (r) { return r._fp === fp; })) {
          window.ET_PATENTS.unshift(rec);
        }
      } else if (type === 'funded') {
        if (window.ET_FUNDED_PROJECTS && !window.ET_FUNDED_PROJECTS.some(function (r) { return r._fp === fp; })) {
          window.ET_FUNDED_PROJECTS.unshift(rec);
        }
      } else if (type === 'consultancy') {
        if (window.ET_CONSULTANCY_PROJECTS && window.ET_CONSULTANCY_PROJECTS.records) {
          if (!window.ET_CONSULTANCY_PROJECTS.records.some(function (r) { return r._fp === fp; })) {
            window.ET_CONSULTANCY_PROJECTS.records.unshift(rec);
          }
        }
      } else if (type === 'scholar' || type === 'supervisor') {
        if (window.ET_SUPERVISORS_SCHOLARS && window.ET_SUPERVISORS_SCHOLARS.yearlyData && window.ET_SUPERVISORS_SCHOLARS.yearlyData[yr]) {
          var sRecs = window.ET_SUPERVISORS_SCHOLARS.yearlyData[yr].records;
          if (sRecs && !sRecs.some(function (r) { return r._fp === fp; })) {
            sRecs.unshift(rec);
            if (type === 'scholar') window.ET_SUPERVISORS_SCHOLARS.yearlyData[yr].scholarCount = (window.ET_SUPERVISORS_SCHOLARS.yearlyData[yr].scholarCount || 0) + 1;
            if (type === 'supervisor') window.ET_SUPERVISORS_SCHOLARS.yearlyData[yr].supervisorCount = (window.ET_SUPERVISORS_SCHOLARS.yearlyData[yr].supervisorCount || 0) + 1;
          }
        }
      }
    } else if (group === 'Management') {
      if (window.MANAGEMENT_RESEARCH_DATA) {
        var mArr = null;
        if (type === 'publication') mArr = window.MANAGEMENT_RESEARCH_DATA.publications;
        else if (type === 'patent') mArr = window.MANAGEMENT_RESEARCH_DATA.patents;
        else if (type === 'funded') mArr = window.MANAGEMENT_RESEARCH_DATA.fundedProjects;
        else if (type === 'supervisor') mArr = window.MANAGEMENT_RESEARCH_DATA.supervisors;
        else if (type === 'scholar') mArr = window.MANAGEMENT_RESEARCH_DATA.scholars;

        if (mArr && !mArr.some(function (r) { return r._fp === fp; })) {
          mArr.unshift(rec);
        }
      }
    }
  }

  // ─── LOAD PERSISTED RECORDS ─────────────────────────────────────────────────
  function loadAndMergePersistedRecords() {
    var saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (e) { saved = {}; }

    Object.keys(saved).forEach(function (storeKey) {
      var records = saved[storeKey];
      if (!Array.isArray(records) || !records.length) return;
      records.forEach(function (rawRec) {
        var norm = normalizeRecord(rawRec._type, rawRec._group, rawRec);
        injectRecordIntoLiveState(rawRec._type, rawRec._group, norm);
      });
    });
  }

  function getStoreKey(type, group) {
    var prefix = group === 'FLABS' ? 'flabs' : group === 'Management' ? 'mgmt' : 'et';
    return prefix + '_' + type;
  }

  function persistRecord(storeKey, record) {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { saved = {}; }
    if (!saved[storeKey]) saved[storeKey] = [];
    saved[storeKey].push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }

  // ─── DEPARTMENT LIST FROM SCOPE TREE (SORTED ALPHABETICALLY) ─────────────────
  function getDepartmentsByGroup(group) {
    if (group === 'Management') {
      return ['BBA', 'MBA'];
    }
    if (group === 'E&T') {
      return [
        'AIML & AI', 'BDA&CC', 'BIOTECH', 'BME', 'CHEM', 'CIVIL', 'CSE', 'CSE-CS',
        'CSE-GT', 'ECE', 'EEE', 'EFL', 'IOT&CSBS', 'IT', 'MATHS', 'MECH'
      ];
    }
    if (group === 'FLABS') {
      return [
        'AI & ML', 'BCA & BCA Gen AI', 'Biotechnology & Psychology', 'Commerce A & F',
        'Commerce General (Batch I)', 'Commerce General & CS (Batch II)', 'Commerce PA & ISM',
        'Computer Science', 'Computer Science (Batch II)', 'Cyber Security', 'Data Science',
        'Fashion Designing', 'LCS', 'Mathematics', 'MCA & MCA Gen AI', 'Visual Communication'
      ];
    }
    if (window.SRM_SCOPE) {
      var tree = window.SRM_SCOPE.getTree();
      var groupNode = window.SRM_SCOPE.findNodeByKey(tree, group) ||
                      window.SRM_SCOPE.findNodeByLabel(tree, group);
      if (groupNode && groupNode.children) {
        var list = groupNode.children.filter(function (c) { return c.type === 'dept'; }).map(function (c) { return c.label; });
        return list.slice().sort(function (a, b) { return a.localeCompare(b); });
      }
    }
    return [];
  }

  // ─── SIDEBAR ADD-DATA BUTTONS ─────────────────────────────────────────────────
  function initAddDataFeature() {
    var AUTH = window.SRM_AUTH;
    if (!AUTH) return;

    var user = AUTH.getCurrentUser();
    if (!user) return;
    var allowedRoles = ['rd_coordinator', 'chairman', 'director', 'admin'];
    if (!allowedRoles.includes(user.role)) return;

    // Load any previously saved records into live data arrays
    loadAndMergePersistedRecords();

    var sidebarPanel = document.getElementById('scope-sidebar');
    if (!sidebarPanel) return;

    // Detect active group from user or current scope
    var activeGroup = user.group;
    if (!activeGroup && window.SRM_SCOPE) {
      var selNode = window.SRM_SCOPE.getSelectedNode();
      if (selNode) {
        if (selNode.key === 'Management' || selNode.groupKey === 'Management') activeGroup = 'Management';
        else if (selNode.key === 'FLABS' || selNode.groupKey === 'FLABS') activeGroup = 'FLABS';
        else activeGroup = 'E&T';
      } else {
        activeGroup = 'E&T';
      }
    }
    if (!activeGroup) activeGroup = 'E&T';

    var existingContainer = document.getElementById('rd-coordinator-add-data');
    if (existingContainer) existingContainer.remove();

    var addDataContainer = document.createElement('div');
    addDataContainer.id = 'rd-coordinator-add-data';
    addDataContainer.style.cssText = 'padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 16px;';
    addDataContainer.innerHTML =
      '<div style="color:#8ab4f8;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;">UPLOAD NEW DATA</div>' +
      makeBtn('publication', '+ Publication') +
      makeBtn('patent',      '+ Patent') +
      makeBtn('funded',      '+ Funded Project') +
      (activeGroup === 'E&T' ? makeBtn('consultancy', '+ Consultancy Project') : '') +
      makeBtn('supervisor',  '+ Research Supervisor') +
      makeBtn('scholar',     '+ Research Scholar') +
      (activeGroup === 'FLABS' ? makeBtn('award', '+ Research Award') : '');

    sidebarPanel.parentNode.appendChild(addDataContainer);

    addDataContainer.querySelectorAll('.add-data-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openFormModal(btn.dataset.type, activeGroup);
      });
    });

    injectModalStyles();
  }

  window.openAddDataModal = function (type, group) {
    if (!group && window.SRM_SCOPE) {
      var node = window.SRM_SCOPE.getSelectedNode();
      group = (node && (node.groupKey || node.key)) || 'E&T';
    }
    openFormModal(type, group || 'E&T');
  };

  function makeBtn(type, label) {
    return '<button class="add-data-btn" data-type="' + type + '" style="display:block;width:100%;text-align:left;background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.1);padding:8px 12px;margin-bottom:7px;border-radius:6px;cursor:pointer;font-size:13px;transition:background .2s;">' + label + '</button>';
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
      var extraAttr = '';
      var containerStyle = 'display:flex;flex-direction:column;';
      var containerId = 'field_wrap_' + fieldName;

      // Conditional logic for Patent Commercialization fields
      if (type === 'patent' && (f === 'Product License Number' || f === 'Technology Transfer Document')) {
        containerStyle += 'display:none;';
      }

      if (f === 'Department') {
        var currentScopeDept = (window.SRM_SCOPE && window.SRM_SCOPE.getSelectedDept()) ? window.SRM_SCOPE.getSelectedDept().label : '';
        inputHtml = '<select name="' + fieldName + '" ' + (isReq ? 'required' : '') + ' style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;">' +
          '<option value="">Select Department...</option>' +
          depts.map(function (d) {
            var sel = (d === currentScopeDept || depts.length === 1) ? ' selected' : '';
            return '<option value="' + d + '"' + sel + '>' + d + '</option>';
          }).join('') +
          '</select>';
      } else if (f === 'Year' || f === 'Year of Enrollment') {
        inputHtml = '<select name="' + fieldName + '" ' + (isReq ? 'required' : '') + ' style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;">' +
          '<option value="2024">2024</option><option value="2025">2025</option><option value="2026" selected>2026</option>' +
          '</select>';
      } else if (f === 'Publication Date' || f === 'Patent Filing Date' || f === 'Patent Published Date' || f === 'Granted Date' || f === 'Date of Application' || f === 'Date of Sanction' || f === 'Start Date' || f === 'End Date' || f === 'Joining Date') {
        inputHtml = '<input type="date" name="' + fieldName + '" ' + (isReq ? 'required' : '') + ' style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;">';
      } else if (f === 'Indexing Type') {
        inputHtml = '<select name="' + fieldName + '" ' + (isReq ? 'required' : '') + ' style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;">' +
          '<option value="">Select option...</option><option value="Scopus" selected>Scopus</option><option value="Web of Science">Web of Science</option><option value="UGC Care">UGC Care</option><option value="Other">Other</option>' +
          '</select>';
      } else if (f === 'Quartile') {
        inputHtml = '<select name="' + fieldName + '" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;">' +
          '<option value="">Select option...</option><option value="Q1">Q1</option><option value="Q2">Q2</option><option value="Q3">Q3</option><option value="Q4">Q4</option>' +
          '</select>';
      } else if (f === 'Patent Category') {
        inputHtml = '<select name="' + fieldName + '" ' + (isReq ? 'required' : '') + ' style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;">' +
          '<option value="">Select option...</option><option value="Utility" selected>Utility</option><option value="Design">Design</option><option value="Plant">Plant</option>' +
          '</select>';
      } else if (f === 'Patent Status') {
        inputHtml = '<select name="' + fieldName + '" ' + (isReq ? 'required' : '') + ' style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;">' +
          '<option value="">Select option...</option><option value="Filed" selected>Filed</option><option value="Published">Published</option><option value="Granted">Granted</option>' +
          '</select>';
      } else if (f === 'Status of Commercialization') {
        inputHtml = '<select id="patent_comm_select" name="' + fieldName + '" ' + (isReq ? 'required' : '') + ' style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;">' +
          '<option value="No" selected>No</option><option value="Yes">Yes</option>' +
          '</select>';
      } else if (f === 'Status' && type === 'funded') {
        inputHtml = '<select name="' + fieldName + '" ' + (isReq ? 'required' : '') + ' style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;">' +
          '<option value="">Select option...</option><option value="Submitted" selected>Submitted</option><option value="PAC Level">PAC Level</option><option value="Sanctioned">Sanctioned</option>' +
          '</select>';
      } else if (f === 'Category' && type === 'scholar') {
        inputHtml = '<select name="' + fieldName + '" ' + (isReq ? 'required' : '') + ' style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;">' +
          '<option value="">Select option...</option><option value="Full-time" selected>Full-time</option><option value="Part-time Internal">Part-time Internal</option><option value="Part-time External">Part-time External</option>' +
          '</select>';
      } else if (f === 'Status' && type === 'scholar') {
        inputHtml = '<select name="' + fieldName + '" ' + (isReq ? 'required' : '') + ' style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;">' +
          '<option value="">Select option...</option><option value="Ongoing" selected>Ongoing</option><option value="Completed">Completed</option>' +
          '</select>';
      } else if (f === 'Award Category' && type === 'award') {
        inputHtml = '<select name="' + fieldName + '" ' + (isReq ? 'required' : '') + ' style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;">' +
          '<option value="">Select option...</option><option value="State" selected>State</option><option value="National">National</option><option value="International">International</option>' +
          '</select>';
      } else if (f.toLowerCase().includes('proof') || f.toLowerCase().includes('link')) {
        inputHtml = '<input type="text" name="' + fieldName + '" ' + (isReq ? 'required' : '') + ' placeholder="Paste link or drive URL..." style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;">';
      } else {
        inputHtml = '<input type="text" name="' + fieldName + '" ' + (isReq ? 'required' : '') + ' placeholder="' + f + '" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;">';
      }

      rows += '<div id="' + containerId + '" style="' + containerStyle + '">' +
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
            '<button type="submit" id="rd-submit-btn" style="padding:8px 18px;border:none;background:#0ea5e9;color:#fff;border-radius:5px;cursor:pointer;font-weight:600;font-size:13px;">Submit</button>' +
          '</div>' +
        '</form>' +
      '</div>';

    modal.style.display = 'flex';

    // Hook Commercialization Toggle for Patent
    var commSelect = document.getElementById('patent_comm_select');
    if (commSelect) {
      var wrapLic = document.getElementById('field_wrap_product_license_number');
      var wrapDoc = document.getElementById('field_wrap_technology_transfer_document');
      var inputLic = wrapLic ? wrapLic.querySelector('input') : null;
      var inputDoc = wrapDoc ? wrapDoc.querySelector('input') : null;

      function updateCommVisibility() {
        var isYes = commSelect.value === 'Yes';
        if (wrapLic) wrapLic.style.display = isYes ? 'flex' : 'none';
        if (wrapDoc) wrapDoc.style.display = isYes ? 'flex' : 'none';
        if (inputLic) inputLic.required = isYes;
        if (inputDoc) inputDoc.required = isYes;
      }
      commSelect.addEventListener('change', updateCommVisibility);
      updateCommVisibility();
    }

    document.getElementById('rd-cancel-btn').addEventListener('click', function () {
      modal.style.display = 'none';
    });

    document.getElementById('rd-data-form').addEventListener('submit', function (e) {
      e.preventDefault();
      saveRecord(type, group, new FormData(e.target));
    });
  }

  // ─── SAVE RECORD ─────────────────────────────────────────────────────────────
  async function saveRecord(type, group, formData) {
    var raw = {};
    formData.forEach(function (value, key) { raw[key] = value; });

    var record = normalizeRecord(type, group, raw);

    var submitBtn = document.getElementById('rd-submit-btn');
    var msgEl = document.getElementById('rd-modal-msg');
    if (submitBtn) {
      submitBtn.textContent = 'Saving…';
      submitBtn.disabled = true;
    }

    // 1. Save to Supabase for all groups (E&T, FLABS, Management)
    if (window.SupabaseDataService && typeof window.SupabaseDataService.insertRecord === 'function') {
      try {
        var sbRes = await window.SupabaseDataService.insertRecord(type, raw, group);
        if (sbRes && !sbRes.success) {
          console.warn('Supabase insert note:', sbRes.error);
        }
      } catch (err) {
        console.error('Supabase insert failed:', err);
      }
    } else if (group === 'Management' && window.SupabaseMgmtService && typeof window.SupabaseMgmtService.insertRecord === 'function') {
      try {
        await window.SupabaseMgmtService.insertRecord(type, raw);
      } catch (err) {
        console.error('Supabase insert failed:', err);
      }
    }

    // 2. Inject into live active in-memory datasets
    injectRecordIntoLiveState(type, group, record);

    // 3. Persist to localStorage
    var storeKey = getStoreKey(type, group);
    persistRecord(storeKey, record);

    if (msgEl) msgEl.textContent = '✓ Record added successfully!';

    setTimeout(function () {
      var modal = document.getElementById('rd-data-modal');
      if (modal) modal.style.display = 'none';

      // 4. Trigger live dynamic update of dashboard home stats & charts
      if (typeof window._SRM_DASHBOARD_REFRESH === 'function') {
        window._SRM_DASHBOARD_REFRESH();
      } else {
        var activeNav = document.querySelector('.nav-link.active');
        if (activeNav) activeNav.click();
      }
    }, 600);
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
  // 1. Immediately load any persisted records into live memory
  loadAndMergePersistedRecords();

  function bootAddData() {
    loadAndMergePersistedRecords();
    var attempts = 0;
    var timer = setInterval(function () {
      attempts++;
      var container = document.getElementById('scope-sidebar');
      if (container || attempts >= 15) {
        clearInterval(timer);
        initAddDataFeature();
        if (typeof window._SRM_DASHBOARD_REFRESH === 'function') {
          window._SRM_DASHBOARD_REFRESH();
        }
      }
    }, 200);
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', bootAddData);
  } else {
    bootAddData();
  }

  // Also hook into scope change so sidebar buttons re-appear if sidebar DOM is updated
  setTimeout(function () {
    if (window.SRM_SCOPE && typeof window.SRM_SCOPE.onChange === 'function') {
      window.SRM_SCOPE.onChange(function () {
        setTimeout(initAddDataFeature, 100);
      });
    }
  }, 500);

})();

