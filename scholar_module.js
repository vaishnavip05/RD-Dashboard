/**
 * SRM Research Scholar Monthly Report System — Modules 2, 3, 4 & 5
 * Scholar Dashboard · Editable Form · Proof File Uploads · Approval Workflow · PDF Generation
 * Fully standalone — does NOT modify any existing R&D modules.
 */
(function (global) {
  'use strict';

  // ── Utility: HTML-escape
  function E(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Self-contained custom toast function
  function toast(message, color) {
    var container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.position = 'fixed';
      container.style.bottom = '20px';
      container.style.right = '20px';
      container.style.zIndex = '9999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '10px';
      document.body.appendChild(container);
    }
    var el = document.createElement('div');
    el.style.background = color || '#333';
    el.style.color = '#fff';
    el.style.padding = '12px 20px';
    el.style.borderRadius = '8px';
    el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    el.style.fontSize = '14px';
    el.style.fontWeight = '600';
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s ease';
    el.textContent = message;
    container.appendChild(el);
    el.offsetHeight; // trigger reflow
    el.style.opacity = '1';
    setTimeout(function() {
      el.style.opacity = '0';
      setTimeout(function() {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 300);
    }, 3000);
  }

  // ── Status display helpers
  var STATUS_LABELS = {
    'DRAFT':                    'Draft (Not Submitted)',
    'SUBMITTED_TO_SUPERVISOR':  'Pending Supervisor Review',
    'SUPERVISOR_APPROVED':      'Submitted to HOD',
    'HOD_APPROVED':             'Submitted to Deputy Dean',
    'DEPUTY_DEAN_APPROVED':     'Submitted to Dean',
    'VERIFIED':                 'Verified',
    'RETURNED_TO_SCHOLAR':      'Returned to Scholar for Revision'
  };

  var STATUS_COLORS = {
    'DRAFT':                   { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
    'SUBMITTED_TO_SUPERVISOR': { bg: '#fff7ed', color: '#c2410c', border: '#ffedd5' },
    'SUPERVISOR_APPROVED':     { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
    'HOD_APPROVED':            { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    'DEPUTY_DEAN_APPROVED':    { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    'VERIFIED':                { bg: '#f0fdf4', color: '#166534', border: '#86efac' },
    'RETURNED_TO_SCHOLAR':     { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' }
  };

  function statusBadge(status) {
    var label = STATUS_LABELS[status] || status;
    var s = STATUS_COLORS[status] || { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    return '<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:700;background:' + s.bg + ';color:' + s.color + ';border:1px solid ' + s.border + ';">' + E(label) + '</span>';
  }

  function renderReviewActionBarButtons(status) {
    if (status === 'SUPERVISOR_APPROVED') {
      return '<div style="display:flex;align-items:center;gap:10px;"><button disabled style="background:#15803d;color:#fff;border:none;border-radius:6px;padding:8.5px 20px;font-size:13px;font-weight:700;cursor:not-allowed;opacity:0.95;">✅ Submitted to HOD</button></div>';
    } else if (status === 'HOD_APPROVED') {
      return '<div style="display:flex;align-items:center;gap:10px;"><button disabled style="background:#15803d;color:#fff;border:none;border-radius:6px;padding:8.5px 20px;font-size:13px;font-weight:700;cursor:not-allowed;opacity:0.95;">✅ Submitted to Deputy Dean</button></div>';
    } else if (status === 'DEPUTY_DEAN_APPROVED') {
      return '<div style="display:flex;align-items:center;gap:10px;"><button disabled style="background:#15803d;color:#fff;border:none;border-radius:6px;padding:8.5px 20px;font-size:13px;font-weight:700;cursor:not-allowed;opacity:0.95;">✅ Submitted to Dean</button></div>';
    } else if (status === 'VERIFIED') {
      return '<div style="display:flex;align-items:center;gap:10px;"><button disabled style="background:#15803d;color:#fff;border:none;border-radius:6px;padding:8.5px 20px;font-size:13px;font-weight:700;cursor:not-allowed;opacity:0.95;">✅ Verified</button></div>';
    }
    return '<div style="display:flex;align-items:center;gap:8px;">' + statusBadge(status) + '</div>';
  }

  function renderScholarReadOnlyButtons(report) {
    if (report.status === 'SUBMITTED_TO_SUPERVISOR') {
      return '<button disabled style="background:#15803d;color:#fff;border:none;border-radius:6px;padding:8.5px 20px;font-size:13px;font-weight:700;cursor:not-allowed;opacity:0.95;">✅ Submitted to Supervisor</button>';
    } else if (report.status === 'SUPERVISOR_APPROVED') {
      return '<button disabled style="background:#15803d;color:#fff;border:none;border-radius:6px;padding:8.5px 20px;font-size:13px;font-weight:700;cursor:not-allowed;opacity:0.95;">✅ Submitted to HOD</button>';
    } else if (report.status === 'HOD_APPROVED') {
      return '<button disabled style="background:#15803d;color:#fff;border:none;border-radius:6px;padding:8.5px 20px;font-size:13px;font-weight:700;cursor:not-allowed;opacity:0.95;">✅ Submitted to Deputy Dean</button>';
    } else if (report.status === 'DEPUTY_DEAN_APPROVED') {
      return '<button disabled style="background:#15803d;color:#fff;border:none;border-radius:6px;padding:8.5px 20px;font-size:13px;font-weight:700;cursor:not-allowed;opacity:0.95;">✅ Submitted to Dean</button>';
    } else if (report.status === 'VERIFIED') {
      var pdfAction = report.reportType === 'DAILY' || report.reportType === 'DAY8' ? 'btn-ro-daily-pdf' : 'btn-ro-pdf';
      return '<div style="display:flex;gap:10px;align-items:center;">' +
        '<button disabled style="background:#15803d;color:#fff;border:none;border-radius:6px;padding:8.5px 20px;font-size:13px;font-weight:700;cursor:not-allowed;opacity:0.95;">✅ Verified</button>' +
        '<button id="' + pdfAction + '" style="background:#166534;color:#fff;border:none;border-radius:6px;padding:8.5px 18px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 5px rgba(22,101,52,0.3);">Generate PDF 📄</button>' +
      '</div>';
    }
    return '<span style="font-size:12px;color:#64748b;">Read-Only View</span>';
  }

  // ════════════════════════════════════════════════════════════════
  // PROOF FILE VIEWER HELPER (Module 5)
  // ════════════════════════════════════════════════════════════════
  function viewProofFile(fileName, fileData) {
    if (!fileData) {
      alert('No proof document available for this entry.');
      return;
    }
    var win = window.open('', '_blank');
    if (!win) {
      alert('Pop-up blocked. Please allow pop-ups for this site to view proof files.');
      return;
    }

    if (fileData.indexOf('data:image/') === 0) {
      win.document.write('<!DOCTYPE html><html><head><title>Proof — ' + E(fileName) + '</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;background:#0f172a;min-height:100vh;"><img src="' + fileData + '" style="max-width:95%;max-height:95vh;object-fit:contain;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.5);" /></body></html>');
    } else if (fileData.indexOf('data:application/pdf') === 0) {
      win.document.write('<!DOCTYPE html><html><head><title>Proof — ' + E(fileName) + '</title></head><body style="margin:0;"><iframe src="' + fileData + '" style="width:100vw;height:100vh;border:none;"></iframe></body></html>');
    } else {
      win.document.write('<!DOCTYPE html><html><head><title>Proof — ' + E(fileName) + '</title></head><body style="font-family:sans-serif;padding:30px;background:#f8fafc;"><h2 style="color:#0f172a;">📄 ' + E(fileName) + '</h2><p style="color:#475569;">Proof document attached.</p><a href="' + fileData + '" download="' + E(fileName) + '" style="display:inline-block;padding:10px 20px;background:#0284c7;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;">Download Attachment ⬇</a></body></html>');
    }
    win.document.close();
  }

  // ════════════════════════════════════════════════════════════════
  // PDF GENERATION (Module 4 - Scholar Only)
  // Formats identical to official 6-page SRM Monthly Report Form
  // ════════════════════════════════════════════════════════════════
  function printVerifiedReportPDF(report) {
    if (!report) return;

    var printWin = window.open('', '_blank', 'width=900,height=1000');
    if (!printWin) {
      alert('Pop-up blocked. Please allow pop-ups for this site to download the PDF.');
      return;
    }

    var historyHtml = (report.approvalHistory || []).map(function (h) {
      return '<tr>' +
        '<td><strong>' + E(h.roleLabel || h.role) + '</strong></td>' +
        '<td>' + E(h.name) + '</td>' +
        '<td>' + E(h.action) + '</td>' +
        '<td><em>' + E(h.remarks || '—') + '</em></td>' +
        '<td>' + E(h.timestamp) + '</td>' +
      '</tr>';
    }).join('');

    var workloadRows = (report.academicWorkloadTable || []).map(function (r, i) {
      return '<tr><td style="text-align:center;">' + (i + 1) + '</td><td>' + E(r.year) + '</td><td>' + E(r.course) + '</td><td>' + E(r.branchSem) + '</td><td>' + E(r.theoryLab) + '</td><td>' + E(r.role) + '</td><td style="text-align:center;">' + E(r.hoursPerWeek) + '</td></tr>';
    }).join('') || '<tr><td colspan="7" style="text-align:center;color:#64748b;">No academic workload recorded</td></tr>';

    var confRows = (report.conferencePubsTable || []).map(function (r, i) {
      var proofStr = r.proofFile ? ' 📎 [' + E(r.proofFile.fileName) + ']' : '';
      return '<tr><td style="text-align:center;">' + (i + 1) + '</td><td>' + E(r.title) + proofStr + '</td><td>' + E(r.authors) + '</td><td>' + E(r.name) + '</td><td>' + E(r.organizedBy) + '</td><td>' + E(r.isbn) + '</td><td>' + E(r.monthYear) + '</td></tr>';
    }).join('') || '<tr><td colspan="7" style="text-align:center;color:#64748b;">No conference publications recorded</td></tr>';

    var jnlRows = (report.journalPubsTable || []).map(function (r, i) {
      var proofStr = r.proofFile ? ' 📎 [' + E(r.proofFile.fileName) + ']' : '';
      return '<tr><td style="text-align:center;">' + (i + 1) + '</td><td>' + E(r.title) + proofStr + '</td><td>' + E(r.authors) + '</td><td>' + E(r.details) + '</td><td>' + E(r.indexedIn) + '</td><td>' + E(r.quartile) + '</td><td>' + E(r.issnDate) + '</td><td>' + E(r.status) + '</td></tr>';
    }).join('') || '<tr><td colspan="8" style="text-align:center;color:#64748b;">No journal publications recorded</td></tr>';

    var patRows = (report.patentPubsTable || []).map(function (r, i) {
      var proofStr = r.proofFile ? ' 📎 [' + E(r.proofFile.fileName) + ']' : '';
      return '<tr><td style="text-align:center;">' + (i + 1) + '</td><td>' + E(r.title) + proofStr + '</td><td>' + E(r.inventor) + '</td><td>' + E(r.applicant) + '</td><td>' + E(r.appNo) + '</td><td>' + E(r.monthYear) + '</td><td>' + E(r.status) + '</td></tr>';
    }).join('') || '<tr><td colspan="7" style="text-align:center;color:#64748b;">No patent details recorded</td></tr>';

    var dailyRows = (report.dailyReportTable || []).map(function (r, i) {
      return '<tr><td style="text-align:center;">' + (i + 1) + '</td><td>' + E(r.date) + '</td><td>' + E(r.description) + '</td><td>' + E(r.remarks) + '</td></tr>';
    }).join('') || '<tr><td colspan="4" style="text-align:center;color:#64748b;">No daily log entries recorded</td></tr>';

    var html = '<!DOCTYPE html><html><head>' +
      '<title>Verified Monthly Report — ' + E(report.scholarName) + ' (' + E(report.monthYear) + ')</title>' +
      '<style>' +
        '@page { size: A4 portrait; margin: 12mm; }' +
        'body { font-family: "Segoe UI", Arial, sans-serif; font-size: 11.5px; color: #0f172a; line-height: 1.4; margin: 0; padding: 15px; }' +
        '.watermark { position: fixed; top: 35%; left: 10%; font-size: 52px; color: rgba(22, 101, 52, 0.07); font-weight: 900; transform: rotate(-28deg); text-transform: uppercase; letter-spacing: 6px; pointer-events: none; }' +
        '.header-box { text-align: center; border-bottom: 2.5px solid #0284c7; padding-bottom: 10px; margin-bottom: 14px; }' +
        '.inst-title { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 2px 0; }' +
        '.inst-sub { font-size: 11.5px; font-weight: 600; color: #0369a1; }' +
        '.form-badge { font-size: 12px; font-weight: 700; color: #0f172a; background: #f0f9ff; padding: 4px 10px; border: 1px solid #bae6fd; display: inline-block; margin-top: 6px; border-radius: 4px; }' +
        '.sec-title { background: #0284c7; color: #fff; font-weight: 700; font-size: 11.5px; padding: 5px 10px; margin-top: 14px; border-radius: 3px; }' +
        '.tbl { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }' +
        '.tbl th, .tbl td { border: 1px solid #cbd5e1; padding: 5px 7px; text-align: left; vertical-align: top; }' +
        '.tbl th { background: #f1f5f9; font-weight: 700; color: #1e293b; }' +
        '.lbl-col { background: #f8fafc; font-weight: 600; width: 38%; color: #334155; }' +
        '.sig-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 20px; page-break-inside: avoid; }' +
        '.sig-box { border: 1px dashed #94a3b8; padding: 10px; text-align: center; background: #fafafa; border-radius: 4px; font-size: 10px; }' +
        '.sig-title { font-weight: 700; color: #0f172a; margin-bottom: 6px; }' +
        '.verified-seal { border: 2px solid #166534; color: #166534; background: #f0fdf4; padding: 8px 14px; text-align: center; font-weight: 800; font-size: 12px; border-radius: 6px; margin-top: 15px; }' +
      '</style>' +
      '</head><body>' +
      '<div class="watermark">VERIFIED & APPROVED · DISBURSEMENT CERTIFIED</div>' +

      // Official Header
      '<div class="header-box">' +
        '<div class="inst-title">SRM INSTITUTE OF SCIENCE AND TECHNOLOGY</div>' +
        '<div class="inst-sub">Faculty of Engineering & Technology, Ramapuram</div>' +
        '<div class="form-badge">MONTHLY REPORT CUM FELLOWSHIP CLAIM FORM FOR FULL-TIME RESEARCH SCHOLARS</div>' +
        '<div style="margin-top:8px;font-size:11.5px;"><strong>Month & Year:</strong> ' + E(report.monthYear) + ' &nbsp;|&nbsp; <strong>Claim Period:</strong> ' + E(report.period) + '</div>' +
      '</div>' +

      // Section A
      '<div class="sec-title">A. SCHOLAR DETAILS</div>' +
      '<table class="tbl">' +
        '<tr><td class="lbl-col">1. Name of Research Scholar</td><td><strong>' + E(report.scholarName) + '</strong></td></tr>' +
        '<tr><td class="lbl-col">2. Expansion of Initial</td><td>' + E(report.expansionOfInitial) + '</td></tr>' +
        '<tr><td class="lbl-col">3. Registration No. & Date</td><td>' + E(report.registrationNo) + ' (' + E(report.registrationDate) + ')</td></tr>' +
        '<tr><td class="lbl-col">4. Research Supervisor</td><td>' + E(report.supervisorName) + '</td></tr>' +
        '<tr><td class="lbl-col">5. Department</td><td>' + E(report.department) + '</td></tr>' +
        '<tr><td class="lbl-col">6. Title of PhD Work</td><td>' + E(report.phdTopic) + '</td></tr>' +
        '<tr><td class="lbl-col">7. Funded Project / JRF / SRF?</td><td>' + E(report.isFundedProject) + (report.isFundedProject === 'YES' ? ' — ' + E(report.jrfSrfStatus) + ' / ' + E(report.fundingAgency) : '') + '</td></tr>' +
      '</table>' +

      // Section B
      '<div class="sec-title">B. COURSEWORK & PUBLICATION DETAILS</div>' +
      '<table class="tbl">' +
        '<tr><td class="lbl-col">8. Coursework Allotted / Completed</td><td>' + (report.courseworkAllotted || 0) + ' / ' + (report.courseworkCompleted || 0) + '</td></tr>' +
        '<tr><td class="lbl-col">10. Comprehensive Viva</td><td>' + E(report.comprehensiveVivaCompleted) + (report.comprehensiveVivaDate ? ' (' + E(report.comprehensiveVivaDate) + ')' : '') + '</td></tr>' +
        '<tr><td class="lbl-col">11. Scopus ID / ORCID ID</td><td>' + E(report.scopusId) + ' / ' + E(report.orcidId) + '</td></tr>' +
        '<tr><td class="lbl-col">13. Scopus Linked to ORCID?</td><td>' + E(report.isScopusLinkedToOrcid) + '</td></tr>' +
        '<tr><td class="lbl-col">14. Conference Publications</td><td>' + (report.noOfConferencePubs || 0) + '</td></tr>' +
        '<tr><td class="lbl-col">15. Journal Pubs (Scopus/WoS/SCI/Others)</td><td>' + (report.noOfJournalPubsScopus || 0) + ' / ' + (report.noOfJournalPubsWos || 0) + ' / ' + (report.noOfJournalPubsSci || 0) + ' / ' + (report.noOfJournalPubsOthers || 0) + '</td></tr>' +
        '<tr><td class="lbl-col">17. Probable Thesis Submission</td><td>' + E(report.probableThesisSubmissionMonthYear || '—') + '</td></tr>' +
      '</table>' +

      // Section C
      '<div class="sec-title">C. FELLOWSHIP DETAILS & WORK PROGRESS</div>' +
      '<table class="tbl">' +
        '<tr><td class="lbl-col">18. Monthly Fellowship Claim</td><td><strong>₹' + E(report.fellowshipAmount) + '</strong></td></tr>' +
        '<tr><td class="lbl-col">19. Fellowship Received From</td><td>' + E(report.fellowshipReceivedFromMonthYear) + '</td></tr>' +
        '<tr><td class="lbl-col">21. Research Progress</td><td>' + (report.researchProgress || []).map(function (p) { return '• ' + E(p); }).join('<br>') + '</td></tr>' +
        '<tr><td class="lbl-col">21. Academic Workload Points</td><td>' + (report.academicWorkload || []).map(function (p) { return '• ' + E(p); }).join('<br>') + '</td></tr>' +
        '<tr><td class="lbl-col">22. Specific Outcomes</td><td>' + E(report.specificOutcomes || '—') + '</td></tr>' +
      '</table>' +

      // Workload Table
      '<div class="sec-title">(A) Academic Work Load for Current Semester</div>' +
      '<table class="tbl"><thead><tr><th>S.No</th><th>Year</th><th>Course</th><th>Branch/Sem</th><th>Theory/Lab</th><th>Role</th><th>Hrs/Wk</th></tr></thead><tbody>' + workloadRows + '</tbody></table>' +

      // Conference Table
      '<div class="sec-title">(B) Conference Publications</div>' +
      '<table class="tbl"><thead><tr><th>S.No</th><th>Title of Paper</th><th>Authors</th><th>Conference Name</th><th>Organized By</th><th>Publisher/ISBN</th><th>Month/Year</th></tr></thead><tbody>' + confRows + '</tbody></table>' +

      // Journal Table
      '<div class="sec-title">(C) Journal Publications</div>' +
      '<table class="tbl"><thead><tr><th>S.No</th><th>Title</th><th>Authors</th><th>Journal Details</th><th>Indexed In</th><th>Quartile</th><th>ISSN/Date</th><th>Status</th></tr></thead><tbody>' + jnlRows + '</tbody></table>' +

      // Patent Table
      '<div class="sec-title">(D) Patent Publications</div>' +
      '<table class="tbl"><thead><tr><th>S.No</th><th>Title</th><th>Inventor Name</th><th>Applicant Name</th><th>App. No</th><th>Month/Year</th><th>Status</th></tr></thead><tbody>' + patRows + '</tbody></table>' +

      // Daily Log Table
      '<div class="sec-title">Daily Work Report Log for the Month</div>' +
      '<table class="tbl"><thead><tr><th>S.No</th><th>Date</th><th>Description of Work & Results</th><th>Remarks</th></tr></thead><tbody>' + dailyRows + '</tbody></table>' +

      // Institutional Approval Audit Register
      '<div class="sec-title">Institutional Approval & Certification Audit Trail</div>' +
      '<table class="tbl"><thead><tr><th>Reviewer Level</th><th>Name</th><th>Action Taken</th><th>Official Remarks</th><th>Date & Time</th></tr></thead><tbody>' + historyHtml + '</tbody></table>' +

      // Final Certification Seal
      '<div class="verified-seal">' +
        'OFFICIALLY VERIFIED & APPROVED FOR FELLOWSHIP DISBURSEMENT<br>' +
        '<span style="font-size:10.5px;font-weight:400;">Certified by Deputy Dean Research · SRM Institute of Science and Technology</span>' +
      '</div>' +

      // Signature placeholders
      '<div class="sig-container">' +
        '<div class="sig-box"><div class="sig-title">Scholar Signature</div><br><strong>' + E(report.scholarName) + '</strong><br><small>Submitted</small></div>' +
        '<div class="sig-box"><div class="sig-title">Supervisor Verification</div><br><strong>' + E(report.supervisorName) + '</strong><br><small>Approved</small></div>' +
        '<div class="sig-box"><div class="sig-title">HOD Verification</div><br><strong>HOD ' + E(report.department) + '</strong><br><small>Endorsed</small></div>' +
        '<div class="sig-box"><div class="sig-title">Deputy Dean Certification</div><br><strong>Deputy Dean Research</strong><br><small>Final Verified</small></div>' +
      '</div>' +

      '</body></html>';

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();

    setTimeout(function () {
      printWin.focus();
      printWin.print();
    }, 400);
  }

  function printDailyReportPDF(report) {
    if (!report) return;

    var printWin = window.open('', '_blank', 'width=900,height=1000');
    if (!printWin) {
      alert('Pop-up blocked. Please allow pop-ups for this site to download the PDF.');
      return;
    }

    var historyHtml = (report.approvalHistory || []).map(function (h) {
      return '<tr>' +
        '<td><strong>' + E(h.roleLabel || h.role) + '</strong></td>' +
        '<td>' + E(h.name) + '</td>' +
        '<td>' + E(h.action) + '</td>' +
        '<td><em>' + E(h.remarks || '—') + '</em></td>' +
        '<td>' + E(h.timestamp) + '</td>' +
      '</tr>';
    }).join('');

    var dailyRows = (report.dailyReportTable || []).map(function (r, i) {
      return '<tr><td style="text-align:center;">' + (i + 1) + '</td><td>' + E(r.date) + '</td><td>' + E(r.description) + '</td><td>' + E(r.remarks || '—') + '</td></tr>';
    }).join('') || '<tr><td colspan="4" style="text-align:center;color:#64748b;">No daily log entries recorded</td></tr>';

    var html = '<!DOCTYPE html><html><head>' +
      '<title>Verified Daily Report — ' + E(report.scholarName) + ' (' + E(report.monthYear) + ')</title>' +
      '<style>' +
        '@page { size: A4 portrait; margin: 12mm; }' +
        'body { font-family: "Segoe UI", Arial, sans-serif; font-size: 11.5px; color: #0f172a; line-height: 1.4; margin: 0; padding: 15px; }' +
        '.watermark { position: fixed; top: 35%; left: 10%; font-size: 50px; color: rgba(22, 101, 52, 0.07); font-weight: 900; transform: rotate(-28deg); text-transform: uppercase; letter-spacing: 6px; pointer-events: none; }' +
        '.header-box { text-align: center; border-bottom: 2.5px solid #0284c7; padding-bottom: 10px; margin-bottom: 14px; }' +
        '.inst-title { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 2px 0; }' +
        '.inst-sub { font-size: 11.5px; font-weight: 600; color: #0369a1; }' +
        '.form-badge { font-size: 12px; font-weight: 700; color: #0f172a; background: #f0f9ff; padding: 4px 10px; border: 1px solid #bae6fd; display: inline-block; margin-top: 6px; border-radius: 4px; }' +
        '.sec-title { background: #0284c7; color: #fff; font-weight: 700; font-size: 11.5px; padding: 5px 10px; margin-top: 14px; border-radius: 3px; }' +
        '.tbl { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }' +
        '.tbl th, .tbl td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }' +
        '.tbl th { background: #f1f5f9; font-weight: 700; color: #1e293b; }' +
        '.lbl-col { background: #f8fafc; font-weight: 600; width: 38%; color: #334155; }' +
        '.sig-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 20px; page-break-inside: avoid; }' +
        '.sig-box { border: 1px dashed #94a3b8; padding: 10px; text-align: center; background: #fafafa; border-radius: 4px; font-size: 10px; }' +
        '.sig-title { font-weight: 700; color: #0f172a; margin-bottom: 6px; }' +
        '.verified-seal { border: 2px solid #166534; color: #166534; background: #f0fdf4; padding: 8px 14px; text-align: center; font-weight: 800; font-size: 12px; border-radius: 6px; margin-top: 15px; }' +
      '</style>' +
      '</head><body>' +
      '<div class="watermark">VERIFIED & APPROVED · DISBURSEMENT CERTIFIED</div>' +

      // Official Header
      '<div class="header-box">' +
        '<div class="inst-title">SRM INSTITUTE OF SCIENCE AND TECHNOLOGY</div>' +
        '<div class="inst-sub">Faculty of Engineering & Technology / Liberal Arts and Sciences</div>' +
        '<div class="form-badge">DAILY REPORT — RESEARCH SCHOLAR ATTENDANCE & WORK LOG</div>' +
        '<div style="margin-top:8px;font-size:11.5px;"><strong>Month & Year:</strong> ' + E(report.monthYear) + ' &nbsp;|&nbsp; <strong>Reporting Period:</strong> ' + E(report.period) + '</div>' +
      '</div>' +

      // Scholar Details Table
      '<div class="sec-title">A. SCHOLAR DETAILS</div>' +
      '<table class="tbl">' +
        '<tr><td class="lbl-col">1. Name of Research Scholar</td><td><strong>' + E(report.scholarName) + '</strong></td></tr>' +
        '<tr><td class="lbl-col">2. Expansion of Initial</td><td>' + E(report.expansionOfInitial || '—') + '</td></tr>' +
        '<tr><td class="lbl-col">3. Registration No. & Date</td><td>' + E(report.registrationNo) + ' (' + E(report.registrationDate) + ')</td></tr>' +
        '<tr><td class="lbl-col">4. Research Supervisor</td><td>' + E(report.supervisorName) + '</td></tr>' +
        '<tr><td class="lbl-col">5. Department</td><td>' + E(report.department) + '</td></tr>' +
        '<tr><td class="lbl-col">6. Title of PhD Work</td><td>' + E(report.phdTopic) + '</td></tr>' +
      '</table>' +

      // Daily Log Table
      '<div class="sec-title">B. DAILY WORK REPORT LOG</div>' +
      '<table class="tbl"><thead><tr><th style="width:40px;text-align:center;">S.No</th><th style="width:100px;">Date</th><th>Description of Work & Results Achieved</th><th style="width:130px;">Remarks</th></tr></thead><tbody>' + dailyRows + '</tbody></table>' +

      // Institutional Approval Audit Register
      '<div class="sec-title">C. INSTITUTIONAL APPROVAL AUDIT TRAIL</div>' +
      '<table class="tbl"><thead><tr><th>Reviewer Level</th><th>Name</th><th>Action Taken</th><th>Official Remarks</th><th>Date & Time</th></tr></thead><tbody>' + historyHtml + '</tbody></table>' +

      // Final Certification Seal
      '<div class="verified-seal">' +
        'OFFICIALLY VERIFIED & APPROVED BY DEPUTY DEAN RESEARCH<br>' +
        '<span style="font-size:10.5px;font-weight:400;">SRM Institute of Science and Technology</span>' +
      '</div>' +

      // Signature placeholders
      '<div class="sig-container">' +
        '<div class="sig-box"><div class="sig-title">Scholar Signature</div><br><strong>' + E(report.scholarName) + '</strong><br><small>Submitted</small></div>' +
        '<div class="sig-box"><div class="sig-title">Supervisor Verification</div><br><strong>' + E(report.supervisorName) + '</strong><br><small>Approved</small></div>' +
        '<div class="sig-box"><div class="sig-title">HOD Verification</div><br><strong>HOD ' + E(report.department) + '</strong><br><small>Endorsed</small></div>' +
        '<div class="sig-box"><div class="sig-title">Deputy Dean Certification</div><br><strong>Deputy Dean Research</strong><br><small>Final Verified</small></div>' +
      '</div>' +

      '</body></html>';

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();

    setTimeout(function () {
      printWin.focus();
      printWin.print();
    }, 400);
  }

  // ── Render proof view cell (used in read-only tables for Reviewers & Scholar)
  function renderProofViewCell(r) {
    if (r.proofFile && r.proofFile.fileData) {
      return '<button type="button" class="btn-view-proof" data-filename="' + E(r.proofFile.fileName) + '" data-filedata="' + E(r.proofFile.fileData) + '" style="background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;padding:4px 8px;border-radius:4px;font-size:11.5px;font-weight:700;cursor:pointer;white-space:nowrap;" title="Click to view attached proof">📄 View Proof (' + E(r.proofFile.fileName) + ')</button>';
    }
    return '<span style="color:#94a3b8;font-size:11px;">No Proof</span>';
  }

  // ── Shared: render a read-only report view (used by Scholar, Supervisor, HOD, Deputy Dean)
  // userRole determines if the Generate PDF button is rendered (Scholar ONLY)
  function renderReportReadOnly(report, userRole) {
    var isVerified = report.status === 'VERIFIED';
    var isScholar = userRole === 'scholar';

    return '<div style="max-width:900px;margin:0 auto;">' +

      // Header
      '<div style="text-align:center;border-bottom:2px solid #0284c7;padding-bottom:14px;margin-bottom:20px;">' +
        '<h3 style="margin:0 0 4px 0;font-size:17px;font-weight:800;color:#0f172a;">SRM INSTITUTE OF SCIENCE AND TECHNOLOGY</h3>' +
        '<div style="font-size:12px;color:#0369a1;font-weight:600;">Faculty of Engineering & Technology, Ramapuram</div>' +
        '<div style="margin-top:8px;font-size:13.5px;font-weight:700;color:#0f172a;background:#f0f9ff;padding:5px 10px;border-radius:5px;display:inline-block;border:1px solid #bae6fd;">MONTHLY REPORT CUM FELLOWSHIP CLAIM FORM — ' + E(report.monthYear) + '</div>' +
        '<div style="margin-top:6px;font-size:12.5px;color:#475569;"><strong>Claim Period:</strong> ' + E(report.period) + ' &nbsp;|&nbsp; <strong>Status:</strong> ' + statusBadge(report.status) + '</div>' +
      '</div>' +

      // Verified Banner (PDF button renders ONLY for Scholar login!)
      (isVerified ? (
        '<div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:14px 18px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
          '<div>' +
            '<strong style="color:#166534;font-size:13.5px;">✅ Verified & Approved for Fellowship Disbursement</strong>' +
            '<div style="font-size:12px;color:#15803d;margin-top:2px;">This report has been certified by the Deputy Dean Research and is locked for editing.</div>' +
          '</div>' +
          (isScholar ? '<button id="btn-print-read-only" style="background:#166534;color:#fff;border:none;border-radius:6px;padding:8px 16px;font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:0 2px 5px rgba(22,101,52,0.3);">Generate Verified PDF 📄</button>' : '') +
        '</div>'
      ) : '') +

      // Section A
      sectionHeader('A. SCHOLAR DETAILS') +
      '<table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #cbd5e1;margin-bottom:16px;">' +
        readRow('1. Name of Research Scholar', report.scholarName) +
        readRow('2. Expansion of Initial', report.expansionOfInitial) +
        readRow('3. Date of PhD Registration', report.registrationDate) +
        readRow('4. Supervisor', report.supervisorName) +
        readRow('5. Department', report.department) +
        readRow('6. Title of PhD Work', report.phdTopic) +
        readRow('7. Funded Project / JRF / SRF?', report.isFundedProject +
          (report.isFundedProject === 'YES' ? ' — ' + E(report.jrfSrfStatus) + ' / ' + E(report.fundingAgency) : '')) +
      '</table>' +

      // Section B
      sectionHeader('B. COURSEWORK & PUBLICATION DETAILS') +
      '<table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #cbd5e1;margin-bottom:16px;">' +
        readRow('8. Coursework Allotted / Completed', (report.courseworkAllotted || 0) + ' / ' + (report.courseworkCompleted || 0)) +
        readRow('10. Comprehensive Viva', report.comprehensiveVivaCompleted + (report.comprehensiveVivaDate ? ' (' + report.comprehensiveVivaDate + ')' : '')) +
        readRow('11. Scopus ID', report.scopusId) +
        readRow('12. ORCID ID', report.orcidId) +
        readRow('13. Scopus linked to ORCID?', report.isScopusLinkedToOrcid) +
        readRow('14. Conference Pubs', report.noOfConferencePubs) +
        readRow('15. Journal Pubs (Scopus/WoS/SCI/Others)', (report.noOfJournalPubsScopus || 0) + ' / ' + (report.noOfJournalPubsWos || 0) + ' / ' + (report.noOfJournalPubsSci || 0) + ' / ' + (report.noOfJournalPubsOthers || 0)) +
        readRow('17. Probable Thesis Submission', report.probableThesisSubmissionMonthYear || '—') +
      '</table>' +

      // Section C
      sectionHeader('C. FELLOWSHIP DETAILS & WORK PROGRESS') +
      '<table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #cbd5e1;margin-bottom:16px;">' +
        readRow('18. Fellowship Amount (Rs.)', '₹' + E(report.fellowshipAmount)) +
        readRow('19. Fellowship Received From', report.fellowshipReceivedFromMonthYear) +
        readRow('20. Fellowship Revised?', report.wasFellowshipRevised) +
        readRow('21. Research Progress', (report.researchProgress || []).map(function(p) { return '• ' + p; }).join('<br>')) +
        readRow('21. Academic Workload', (report.academicWorkload || []).map(function(p) { return '• ' + p; }).join('<br>')) +
        readRow('22. Specific Outcomes', report.specificOutcomes || '—') +
      '</table>' +

      // Academic Workload Table
      (report.academicWorkloadTable && report.academicWorkloadTable.length ? (
        darkHeader('(A) Academic Work Load for Current Semester') +
        '<div style="overflow-x:auto;margin-bottom:16px;"><table style="width:100%;border-collapse:collapse;font-size:12.5px;border:1px solid #cbd5e1;">' +
        '<thead><tr style="background:#f1f5f9;">' +
        '<th style="padding:6px;border:1px solid #cbd5e1;">S.No</th><th style="padding:6px;border:1px solid #cbd5e1;">Academic Year</th><th style="padding:6px;border:1px solid #cbd5e1;">Course</th><th style="padding:6px;border:1px solid #cbd5e1;">Branch/Sem</th><th style="padding:6px;border:1px solid #cbd5e1;">Theory/Lab</th><th style="padding:6px;border:1px solid #cbd5e1;">Role</th><th style="padding:6px;border:1px solid #cbd5e1;">Hrs/Wk</th>' +
        '</tr></thead><tbody>' +
        report.academicWorkloadTable.map(function(r, i) {
          return '<tr><td style="padding:6px;border:1px solid #e2e8f0;text-align:center;">' + (i+1) + '</td>' +
            '<td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.year) + '</td>' +
            '<td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.course) + '</td>' +
            '<td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.branchSem) + '</td>' +
            '<td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.theoryLab) + '</td>' +
            '<td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.role) + '</td>' +
            '<td style="padding:6px;border:1px solid #e2e8f0;text-align:center;">' + E(r.hoursPerWeek) + '</td></tr>';
        }).join('') +
        '</tbody></table></div>'
      ) : '') +

      // Conference Pubs Table (with Proof column)
      (report.conferencePubsTable && report.conferencePubsTable.length ? (
        darkHeader('(B) Conference Publications') +
        '<div style="overflow-x:auto;margin-bottom:16px;"><table style="width:100%;border-collapse:collapse;font-size:12.5px;border:1px solid #cbd5e1;">' +
        '<thead><tr style="background:#f1f5f9;"><th style="padding:6px;border:1px solid #cbd5e1;">S.No</th><th style="padding:6px;border:1px solid #cbd5e1;">Title</th><th style="padding:6px;border:1px solid #cbd5e1;">Authors</th><th style="padding:6px;border:1px solid #cbd5e1;">Conference</th><th style="padding:6px;border:1px solid #cbd5e1;">Month/Year</th><th style="padding:6px;border:1px solid #cbd5e1;">Proof Attachment</th></tr></thead><tbody>' +
        report.conferencePubsTable.map(function(r, i) {
          return '<tr><td style="padding:6px;border:1px solid #e2e8f0;text-align:center;">' + (i+1) + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.title) + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.authors) + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.name) + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.monthYear) + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + renderProofViewCell(r) + '</td></tr>';
        }).join('') +
        '</tbody></table></div>'
      ) : '') +

      // Journal Pubs Table (with Proof column)
      (report.journalPubsTable && report.journalPubsTable.length ? (
        darkHeader('(C) Journal Publications') +
        '<div style="overflow-x:auto;margin-bottom:16px;"><table style="width:100%;border-collapse:collapse;font-size:12.5px;border:1px solid #cbd5e1;">' +
        '<thead><tr style="background:#f1f5f9;"><th style="padding:6px;border:1px solid #cbd5e1;">S.No</th><th style="padding:6px;border:1px solid #cbd5e1;">Title</th><th style="padding:6px;border:1px solid #cbd5e1;">Authors</th><th style="padding:6px;border:1px solid #cbd5e1;">Journal</th><th style="padding:6px;border:1px solid #cbd5e1;">Indexed</th><th style="padding:6px;border:1px solid #cbd5e1;">Status</th><th style="padding:6px;border:1px solid #cbd5e1;">Proof Attachment</th></tr></thead><tbody>' +
        report.journalPubsTable.map(function(r, i) {
          return '<tr><td style="padding:6px;border:1px solid #e2e8f0;text-align:center;">' + (i+1) + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.title) + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.authors) + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.details) + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.indexedIn) + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.status) + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + renderProofViewCell(r) + '</td></tr>';
        }).join('') +
        '</tbody></table></div>'
      ) : '') +

      // Patent Table (with Proof column)
      (report.patentPubsTable && report.patentPubsTable.length ? (
        darkHeader('(D) Patent Publications') +
        '<div style="overflow-x:auto;margin-bottom:16px;"><table style="width:100%;border-collapse:collapse;font-size:12.5px;border:1px solid #cbd5e1;">' +
        '<thead><tr style="background:#f1f5f9;"><th style="padding:6px;border:1px solid #cbd5e1;">S.No</th><th style="padding:6px;border:1px solid #cbd5e1;">Title</th><th style="padding:6px;border:1px solid #cbd5e1;">Inventor</th><th style="padding:6px;border:1px solid #cbd5e1;">App No</th><th style="padding:6px;border:1px solid #cbd5e1;">Status</th><th style="padding:6px;border:1px solid #cbd5e1;">Proof Attachment</th></tr></thead><tbody>' +
        report.patentPubsTable.map(function(r, i) {
          return '<tr><td style="padding:6px;border:1px solid #e2e8f0;text-align:center;">' + (i+1) + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.title) + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.inventor) + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.appNo) + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.status) + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + renderProofViewCell(r) + '</td></tr>';
        }).join('') +
        '</tbody></table></div>'
      ) : '') +

      // Daily Log Table
      (report.dailyReportTable && report.dailyReportTable.length ? (
        darkHeader('Daily Work Report Log') +
        '<div style="overflow-x:auto;margin-bottom:16px;"><table style="width:100%;border-collapse:collapse;font-size:12.5px;border:1px solid #cbd5e1;">' +
        '<thead><tr style="background:#f1f5f9;"><th style="padding:6px;border:1px solid #cbd5e1;">S.No</th><th style="padding:6px;border:1px solid #cbd5e1;">Date</th><th style="padding:6px;border:1px solid #cbd5e1;">Description of Work & Results</th><th style="padding:6px;border:1px solid #cbd5e1;">Remarks</th></tr></thead><tbody>' +
        report.dailyReportTable.map(function(r, i) {
          return '<tr><td style="padding:6px;border:1px solid #e2e8f0;text-align:center;">' + (i+1) + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.date) + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.description) + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + E(r.remarks) + '</td></tr>';
        }).join('') +
        '</tbody></table></div>'
      ) : '') +

      // Approval History Audit Register
      (report.approvalHistory && report.approvalHistory.length ? (
        darkHeader('Approval & Audit Trail') +
        '<div style="margin-bottom:20px;">' +
        report.approvalHistory.map(function(h) {
          return '<div style="padding:10px 14px;border-left:4px solid #0284c7;background:#f8fafc;margin-bottom:8px;border-radius:4px;">' +
            '<div style="font-size:12.5px;font-weight:700;color:#0f172a;">' + E(h.roleLabel || h.role) + ' — ' + E(h.name) + '</div>' +
            '<div style="font-size:12px;color:#475569;margin-top:2px;">' + E(h.action) + (h.remarks && h.remarks !== 'No additional remarks' ? ' · Remarks: <em>' + E(h.remarks) + '</em>' : '') + '</div>' +
            '<div style="font-size:11px;color:#94a3b8;margin-top:2px;">' + E(h.timestamp) + (h.prevStatus ? ' &nbsp;|&nbsp; ' + E(h.prevStatus || '') + ' → ' + E(h.newStatus || '') : '') + '</div>' +
          '</div>';
        }).join('') +
        '</div>'
      ) : '') +

    '</div>';
  }

  function sectionHeader(title) {
    return '<div style="background:#0284c7;color:#fff;font-weight:700;font-size:13.5px;padding:8px 14px;border-radius:6px 6px 0 0;margin-top:4px;">' + E(title) + '</div>';
  }

  function darkHeader(title) {
    return '<div style="background:#0f172a;color:#fff;font-weight:700;font-size:13px;padding:7px 14px;border-radius:4px;margin:12px 0 0 0;">' + E(title) + '</div>';
  }

  function readRow(label, value) {
    return '<tr>' +
      '<td style="width:40%;padding:9px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;font-size:13px;color:#334155;vertical-align:top;">' + E(label) + '</td>' +
      '<td style="padding:9px 12px;border:1px solid #e2e8f0;font-size:13px;color:#0f172a;">' + (value == null ? '—' : String(value)) + '</td>' +
    '</tr>';
  }

  // ════════════════════════════════════════════════════════════════
  // DAY 8 REPORT RENDERING & HELPERS
  // ════════════════════════════════════════════════════════════════
  function renderDay8ReportReadOnly(report, userRole) {
    var isVerified = report.status === 'VERIFIED';
    
    // Daily report table rows
    var dailyRows = (report.dailyReportTable || []).map(function (r, i) {
      return '<tr style="background:' + (r.remarks === 'Holiday' || r.remarks === 'Government Holiday' ? '#f8fafc' : '#ffffff') + ';">' +
        '<td style="padding:6px;border:1px solid #000000;text-align:center;font-size:12px;">' + (i + 1) + '.</td>' +
        '<td style="padding:6px;border:1px solid #000000;text-align:center;font-size:12px;font-weight:bold;">' + E(r.date) + '</td>' +
        '<td style="padding:6px;border:1px solid #000000;font-size:12px;' + (r.remarks === 'Holiday' || r.remarks === 'Government Holiday' ? 'font-weight:bold;color:#475569;' : '') + '">' + E(r.description) + '</td>' +
        '<td style="padding:6px;border:1px solid #000000;font-size:12px;' + (r.remarks === 'Holiday' || r.remarks === 'Government Holiday' ? 'font-weight:bold;color:#475569;' : '') + '">' + E(r.remarks) + '</td>' +
        '</tr>';
    }).join('') || '<tr><td colspan="4" style="text-align:center;padding:10px;border:1px solid #000000;">No daily log entries recorded</td></tr>';

    var auditHtml = (report.approvalHistory || []).map(function (h) {
      return '<div style="padding:8px 12px;border-left:3px solid #0284c7;background:#f8fafc;margin-bottom:6px;border-radius:4px;font-size:12px;">' +
        '<strong>' + E(h.roleLabel || h.role) + ' — ' + E(h.name) + '</strong> (' + E(h.timestamp) + ')<br>' +
        'Action: <em>' + E(h.action) + '</em>' + (h.remarks && h.remarks !== 'No additional remarks' ? ' | Remarks: <em>' + E(h.remarks) + '</em>' : '') +
        '</div>';
    }).join('') || '<div style="color:#94a3b8;font-size:12px;">No approval history yet.</div>';

    return '<div style="max-width:850px;margin:0 auto;background:#ffffff;padding:40px;box-shadow:0 0 10px rgba(0,0,0,0.1);font-family:\'Times New Roman\', Times, serif;color:#000000;line-height:1.3;border:1px solid #e2e8f0;position:relative;">' +
      
      // Verified Seal
      (isVerified ? 
        '<div style="border: 3px double #166534; color: #166534; background: rgba(240,253,244,0.9); padding: 10px; text-align: center; font-weight: 800; font-size: 14px; border-radius: 6px; margin-bottom: 20px;">' +
          'VERIFIED & APPROVED FOR DISBURSEMENT<br>' +
          '<span style="font-size:11px;font-weight:400;">Certified by Deputy Dean Research · SRM Institute of Science and Technology</span>' +
        '</div>' : ''
      ) +

      // Official Header Box
      '<table style="width:100%;border-collapse:collapse;border:none;margin-bottom:15px;">' +
        '<tr>' +
          '<td style="width:120px;vertical-align:middle;text-align:left;border:none;">' +
            '<img src="SRMGROUPFINAL-LOGO.png" style="height:70px;object-fit:contain;" alt="SRM Logo" />' +
          '</td>' +
          '<td style="vertical-align:middle;text-align:center;border:none;">' +
            '<h2 style="margin:0;font-size:18px;font-weight:bold;color:#034da2;text-transform:uppercase;font-family:Arial, sans-serif;">SRM Institute of Science and Technology</h2>' +
            '<p style="margin:2px 0 0 0;font-size:12px;font-weight:bold;color:#0369a1;font-family:Arial, sans-serif;">Faculty of Liberal Arts and Business Studies, Ramapuram, Chennai 89.</p>' +
          '</td>' +
        '</tr>' +
      '</table>' +
      
      '<div style="border-top:2px solid #034da2;margin-bottom:15px;"></div>' +
      
      '<div style="text-align:center;margin-bottom:15px;">' +
        '<h3 style="margin:0;font-size:13px;font-weight:bold;color:#000000;text-transform:uppercase;text-decoration:underline;">DAILY REPORT — RESEARCH SCHOLAR ATTENDANCE & WORK LOG</h3>' +
        '<p style="margin:4px 0 0 0;font-size:12px;font-weight:bold;">For the month of <u>' + E(report.monthYear || '___________') + '</u> (' + E(report.period || '14/_/202_ to 13/_/202_') + ')</p>' +
      '</div>' +
      
      // Scholar details table
      '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;border:1px solid #000000;">' +
        '<tr>' +
          '<td colspan="2" style="padding:8px;border:1px solid #000000;text-align:center;font-weight:bold;font-size:13px;background:#f8fafc;">Daily Report for the month <u>' + E(report.monthYear || '___________') + '</u>, 202_</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="width:40%;padding:6px 10px;border:1px solid #000000;font-weight:bold;font-size:12px;">Name of the Scholar</td>' +
          '<td style="padding:6px 10px;border:1px solid #000000;font-size:12px;">' + E(report.scholarName) + '</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="padding:6px 10px;border:1px solid #000000;font-weight:bold;font-size:12px;">Name of the Supervisor</td>' +
          '<td style="padding:6px 10px;border:1px solid #000000;font-size:12px;">' + E(report.supervisorName) + '</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="padding:6px 10px;border:1px solid #000000;font-weight:bold;font-size:12px;">Name of the Department</td>' +
          '<td style="padding:6px 10px;border:1px solid #000000;font-size:12px;">' + E(report.department) + '</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="padding:6px 10px;border:1px solid #000000;font-weight:bold;font-size:12px;">Name of the Institution</td>' +
          '<td style="padding:6px 10px;border:1px solid #000000;font-size:12px;">' + E(report.institution) + '</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="padding:6px 10px;border:1px solid #000000;font-weight:bold;font-size:12px;">Date of Joining</td>' +
          '<td style="padding:6px 10px;border:1px solid #000000;font-size:12px;">' + E(report.dateOfJoining) + '</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="padding:6px 10px;border:1px solid #000000;font-weight:bold;font-size:12px;">Reporting person</td>' +
          '<td style="padding:6px 10px;border:1px solid #000000;font-size:12px;">' + E(report.reportingPerson) + '</td>' +
        '</tr>' +
        '<tr>' +
          '<td rowspan="2" style="padding:6px 10px;border:1px solid #000000;font-weight:bold;font-size:12px;vertical-align:middle;text-align:left;">Daily report</td>' +
          '<td style="padding:4px 10px;border:1px solid #000000;font-size:12px;"><strong>From:</strong> ' + E(report.dailyReportFrom) + '</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="padding:4px 10px;border:1px solid #000000;font-size:12px;"><strong>To:</strong> ' + E(report.dailyReportTo) + '</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="padding:6px 10px;border:1px solid #000000;font-weight:bold;font-size:12px;vertical-align:top;">Title of the PhD work</td>' +
          '<td style="padding:6px 10px;border:1px solid #000000;font-size:12px;white-space:pre-wrap;">' + E(report.phdTopic) + '</td>' +
        '</tr>' +
      '</table>' +
      
      // Daily work table
      '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;border:1px solid #000000;">' +
        '<thead>' +
          '<tr style="background:#f8fafc;">' +
            '<th style="width:50px;padding:6px;border:1px solid #000000;text-align:center;font-size:12px;font-weight:bold;">S.No.</th>' +
            '<th style="width:120px;padding:6px;border:1px solid #000000;text-align:center;font-size:12px;font-weight:bold;">Date</th>' +
            '<th style="padding:6px;border:1px solid #000000;text-align:center;font-size:12px;font-weight:bold;">Description of the work & results achieved</th>' +
            '<th style="width:200px;padding:6px;border:1px solid #000000;text-align:center;font-size:12px;font-weight:bold;">Remarks of the supervisor with Signature</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' + dailyRows + '</tbody>' +
      '</table>' +

      // Declaration text
      '<p style="font-size:12px;font-style:italic;margin-bottom:30px;line-height:1.4;">' +
        'I have personally monitored the activities of the scholar. I will take responsibility if any discrepancy is found.' +
      '</p>' +

      // Signatures
      '<table style="width:100%;border-collapse:collapse;border:none;margin-top:30px;margin-bottom:40px;">' +
        '<tr>' +
          '<td style="width:33%;text-align:center;border:none;vertical-align:top;font-size:12px;font-weight:bold;">' +
            '<div style="height:40px;"></div>' +
            '<div style="border-top:1px dashed #000000;padding-top:4px;width:80%;margin:0 auto;">Signature of the Scholar</div>' +
          '</td>' +
          '<td style="width:33%;text-align:center;border:none;vertical-align:top;font-size:12px;font-weight:bold;">' +
            '<div style="height:40px;">' +
              (report.status !== 'DRAFT' && report.status !== 'SUBMITTED_TO_SUPERVISOR' && report.status !== 'RETURNED_TO_SCHOLAR'
                ? '<span style="color:#15803d;font-weight:bold;font-size:13px;">RECOMMENDED ✔</span>' : ''
              ) +
            '</div>' +
            '<div style="border-top:1px dashed #000000;padding-top:4px;width:80%;margin:0 auto;">Signature of the Supervisor</div>' +
          '</td>' +
          '<td style="width:33%;text-align:center;border:none;vertical-align:top;font-size:12px;font-weight:bold;">' +
            '<div style="height:40px;">' +
              (report.status === 'HOD_APPROVED' || report.status === 'VERIFIED'
                ? '<span style="color:#1d4ed8;font-weight:bold;font-size:13px;">ENDORSED ✔</span>' : ''
              ) +
            '</div>' +
            '<div style="border-top:1px dashed #000000;padding-top:4px;width:85%;margin:0 auto;">Signature of the Head of the Department</div>' +
          '</td>' +
        '</tr>' +
      '</table>' +
      
      // Footer page details
      '<div style="border-top:1px solid #cbd5e1;padding-top:8px;text-align:center;font-size:10px;color:#475569;font-family:Arial, sans-serif;">' +
        'SRM Institute of Science and Technology, Ramapuram<br>' +
        'Monthly Report Form<br>' +
        'Page 6' +
      '</div>' +

      // Audit Trail inside Read Only view
      '<div style="margin-top:40px;border-top:1.5px solid #e2e8f0;padding-top:15px;">' +
        '<h4 style="margin:0 0 10px 0;font-size:13.5px;color:#0f172a;font-family:Arial, sans-serif;">Approval History & Remarks</h4>' +
        auditHtml +
      '</div>' +

    '</div>';
  }

  function renderDay8EditableForm(scholar, report) {
    function inp(id, val, extra) {
      return '<input type="text" id="' + id + '" value="' + E(val) + '" style="width:100%;padding:6px 8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;box-sizing:border-box;' + (extra || '') + '" />';
    }
    function fRow(label, content) {
      return '<tr><td style="width:38%;padding:9px 12px;border:1px solid #cbd5e1;background:#f8fafc;font-weight:600;font-size:12.5px;color:#334155;vertical-align:top;">' + label + '</td><td style="padding:9px 12px;border:1px solid #cbd5e1;">' + content + '</td></tr>';
    }

    var dailyRows = (report.dailyReportTable || []).map(function(r, i) { return day8DailyTR(r, i); }).join('');

    return '<div style="max-width:960px;margin:0 auto;padding-bottom:60px;font-family:sans-serif;">' +

      // Navigation bar
      '<div style="background:#fff;border:1.5px solid #0284c7;border-radius:10px;padding:12px 20px;margin-bottom:20px;box-shadow:0 4px 12px rgba(2,132,199,0.12);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<button id="btn-form-back" style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:6px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;">← Back to Dashboard</button>' +
          '<span style="font-size:12.5px;color:#64748b;">Editing: <strong style="color:#0f172a;">Daily Report (' + E(report.monthYear || 'New') + ')</strong> &nbsp; ' + statusBadge(report.status) + '</span>' +
        '</div>' +
      '</div>' +

      // Form body
      '<div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:10px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">' +

        // Header
        '<div style="text-align:center;border-bottom:2px solid #0284c7;padding-bottom:14px;margin-bottom:22px;">' +
          '<h2 style="margin:0 0 4px 0;font-size:19px;font-weight:800;color:#000000;font-family:Arial, sans-serif;">SRM INSTITUTE OF SCIENCE AND TECHNOLOGY</h2>' +
          '<div style="font-size:12.5px;color:#0369a1;font-weight:600;margin-bottom:8px;">Faculty of Engineering & Technology / Liberal Arts and Sciences</div>' +
          '<div style="font-size:13.5px;font-weight:700;color:#0f172a;background:#f0f9ff;padding:6px 12px;border-radius:5px;display:inline-block;border:1px solid #bae6fd;font-family:Arial, sans-serif;">DAILY REPORT — RESEARCH SCHOLAR ATTENDANCE & WORK LOG</div>' +
          '<div style="margin-top:10px;display:flex;justify-content:center;gap:16px;flex-wrap:wrap;font-size:13px;color:#334155;">' +
            '<div><strong>For the month of:</strong> <input type="text" id="f_monthYear" value="' + E(report.monthYear) + '" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;width:150px;" placeholder="e.g. August 2026" /></div>' +
            '<div><strong>Period:</strong> <input type="text" id="f_period" value="' + E(report.period) + '" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;width:220px;" placeholder="14/07/2026 to 13/08/2026" /></div>' +
          '</div>' +
        '</div>' +

        // Scholar Details Section
        sectionHeader('SCHOLAR & SUPERVISOR DETAILS') +
        '<table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;margin-bottom:20px;font-size:13px;">' +
          fRow('Name of the Scholar', inp('f_scholarName', report.scholarName, 'font-weight:600;')) +
          fRow('Name of the Supervisor', inp('f_supervisorName', report.supervisorName, 'font-weight:600;')) +
          fRow('Name of the Department', inp('f_department', report.department, '')) +
          fRow('Name of the Institution', inp('f_institution', report.institution, '')) +
          fRow('Date of Joining', '<input type="date" id="f_dateOfJoining" value="' + E(report.dateOfJoining) + '" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:4px;" />') +
          fRow('Reporting person', inp('f_reportingPerson', report.reportingPerson, '')) +
          fRow('Daily report Date Range', '<div style="display:flex;align-items:center;gap:8px;">From: <input type="date" id="f_dailyReportFrom" value="' + E(report.dailyReportFrom) + '" style="padding:5px 8px;border:1px solid #cbd5e1;border-radius:4px;" /> To: <input type="date" id="f_dailyReportTo" value="' + E(report.dailyReportTo) + '" style="padding:5px 8px;border:1px solid #cbd5e1;border-radius:4px;" /></div>') +
          fRow('Title of the PhD work', '<textarea id="f_phdTopic" rows="2" style="width:100%;padding:6px 8px;border:1px solid #cbd5e1;border-radius:4px;font-family:inherit;font-size:13px;box-sizing:border-box;">' + E(report.phdTopic) + '</textarea>') +
        '</table>' +

        // Daily Work Log Section
        '<div style="display:flex;justify-content:space-between;align-items:center;background:#0f172a;color:#fff;padding:8px 14px;border-radius:6px 6px 0 0;margin-top:4px;">' +
          '<span style="font-weight:700;font-size:13px;">Daily Work Report Log for the Month</span>' +
          '<button id="btn-add-daily-day8" style="background:#0284c7;color:#fff;border:none;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;">+ Add</button>' +
        '</div>' +
        '<div style="overflow-x:auto;margin-bottom:20px;"><table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:12.5px;">' +
          '<thead><tr style="background:#f1f5f9;text-align:left;"><th style="padding:6px;border:1px solid #cbd5e1;width:50px;text-align:center;">S.No</th><th style="padding:6px;border:1px solid #cbd5e1;width:130px;">Date</th><th style="padding:6px;border:1px solid #cbd5e1;">Description of Work & Results Achieved</th><th style="padding:6px;border:1px solid #cbd5e1;width:180px;">Remarks</th><th style="padding:6px;border:1px solid #cbd5e1;width:40px;"></th></tr></thead>' +
          '<tbody id="tbody-daily-day8">' + dailyRows + '</tbody>' +
        '</table></div>' +

        // Declaration & Signatures info
        '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:18px;margin-top:10px;">' +
          '<div style="font-size:13.5px;font-weight:700;color:#0f172a;margin-bottom:12px;">Declaration & Verification Information</div>' +
          '<p style="font-style:italic;font-size:12.5px;color:#475569;margin-bottom:10px;">"I have personally monitored the activities of the scholar. I will take responsibility if any discrepancy is found."</p>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:12.5px;color:#475569;">' +
            '<div style="border:1px dashed #cbd5e1;padding:12px;border-radius:6px;background:#fff;">' +
              '<strong>Scholar Signature Placement</strong>' +
              '<div style="margin-top:14px;color:#94a3b8;font-weight:600;">Scholar Name: [ ' + E(report.scholarName) + ' ]</div>' +
            '</div>' +
            '<div style="border:1px dashed #cbd5e1;padding:12px;border-radius:6px;background:#fff;">' +
              '<strong>Supervisor & HOD Placement</strong>' +
              '<div style="margin-top:14px;color:#94a3b8;">Review signatures and status endorsements will be rendered dynamically after review.</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

      '</div>' +
      // Action bar at the bottom
      '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;display:flex;justify-content:flex-end;margin-top:20px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<button type="button" id="btn-save-draft" style="background:#f8fafc;color:#0369a1;border:1.5px solid #0284c7;border-radius:6px;padding:8.5px 18px;font-size:13px;font-weight:700;cursor:pointer;">💾 Save Draft</button>' +
          '<button type="button" id="btn-submit-supervisor" style="background:#0284c7;color:#fff;border:none;border-radius:6px;padding:8.5px 20px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 5px rgba(2,132,199,0.3);">🚀 Submit to Supervisor</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function day8DailyTR(r, i) {
    return '<tr><td style="padding:5px;border:1px solid #cbd5e1;text-align:center;">' + (i+1) + '.</td>' +
      '<td style="padding:5px;border:1px solid #cbd5e1;"><input type="text" class="daily-date" value="' + E(r.date) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;text-align:center;" placeholder="DD/MM/YYYY" /></td>' +
      '<td style="padding:5px;border:1px solid #cbd5e1;"><input type="text" class="daily-desc" value="' + E(r.description) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #cbd5e1;"><input type="text" class="daily-remarks" value="' + E(r.remarks) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #cbd5e1;text-align:center;"><button type="button" onclick="this.closest(\'tr\').remove()" style="color:#ef4444;border:none;background:none;cursor:pointer;font-weight:700;font-size:14px;">✕</button></td></tr>';
  }

  function collectDay8Form(report, scholar, targetStatus) {
    function g(id) { var el = document.getElementById(id); return el ? el.value : ''; }

    var daily = [];
    document.querySelectorAll('#tbody-daily-day8 tr').forEach(function(tr, i) {
      daily.push({ 
        sno: i+1, 
        date: tr.querySelector('.daily-date') ? tr.querySelector('.daily-date').value : '', 
        description: tr.querySelector('.daily-desc') ? tr.querySelector('.daily-desc').value : '', 
        remarks: tr.querySelector('.daily-remarks') ? tr.querySelector('.daily-remarks').value : '' 
      });
    });

    var history = report.approvalHistory ? report.approvalHistory.slice() : [];
    if (targetStatus === 'SUBMITTED_TO_SUPERVISOR') {
      history.push({ 
        role: 'scholar', 
        roleLabel: 'Research Scholar', 
        name: scholar.name, 
        action: 'Submitted Daily Report Form', 
        remarks: 'Submitted for Supervisor Review', 
        prevStatus: report.status, 
        newStatus: 'SUBMITTED_TO_SUPERVISOR', 
        timestamp: new Date().toLocaleString() 
      });
    }

    return Object.assign({}, report, {
      scholarName: g('f_scholarName') || report.scholarName,
      supervisorName: g('f_supervisorName') || report.supervisorName,
      department: g('f_department') || report.department,
      institution: g('f_institution') || report.institution,
      dateOfJoining: g('f_dateOfJoining'),
      reportingPerson: g('f_reportingPerson'),
      dailyReportFrom: g('f_dailyReportFrom'),
      dailyReportTo: g('f_dailyReportTo'),
      phdTopic: g('f_phdTopic') || report.phdTopic,
      monthYear: g('f_monthYear') || report.monthYear,
      period: g('f_period') || report.period,
      status: targetStatus,
      statusLabel: STATUS_LABELS[targetStatus] || targetStatus,
      submittedDate: targetStatus === 'SUBMITTED_TO_SUPERVISOR' ? new Date().toISOString().split('T')[0] : report.submittedDate,
      dailyReportTable: daily,
      approvalHistory: history
    });
  }

  function renderDay8SupervisorReviewPanel(report, user) {
    return '<div style="max-width:960px;margin:0 auto;padding-bottom:40px;font-family:sans-serif;">' +
      '<div style="background:#fff;border:1.5px solid #0284c7;border-radius:10px;padding:12px 20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;box-shadow:0 4px 12px rgba(2,132,199,0.12);">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<button id="btn-review-back" style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:6px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;">← Back</button>' +
          '<span id="review-status-span" style="font-size:13px;color:#334155;"><strong>Daily Report Review: ' + E(report.scholarName) + '</strong> — ' + E(report.monthYear) + ' &nbsp; ' + statusBadge(report.status) + '</span>' +
        '</div>' +
        
      '</div>' +

      (report.status === 'SUBMITTED_TO_SUPERVISOR'
        ? '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:16px;margin-bottom:16px;">' +
            '<label for="sup-remarks" style="font-size:13px;font-weight:700;color:#0f172a;display:block;margin-bottom:6px;">Supervisor Remarks / Recommendation:</label>' +
            '<textarea id="sup-remarks" rows="3" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-family:inherit;font-size:13px;box-sizing:border-box;" placeholder="Enter verification remarks and recommendations..."></textarea>' +
          '</div>'
        : ''
      ) +

      '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">' +
        renderDay8ReportReadOnly(report, user.role) +
      '</div>' +
      '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;display:flex;justify-content:flex-end;margin-top:20px;">' +
        '<div id="review-action-area">' +
        (report.status === 'SUBMITTED_TO_SUPERVISOR'
          ? '<div style="display:flex;align-items:center;gap:10px;">' +
              '<button type="button" id="btn-sup-approve" style="background:#15803d;color:#fff;border:none;border-radius:6px;padding:8.5px 20px;font-size:13px;font-weight:700;cursor:pointer;">✅ Approve & Forward to HOD</button>' +
              '<button type="button" id="btn-sup-reject" style="background:#be123c;color:#fff;border:none;border-radius:6px;padding:8.5px 16px;font-size:13px;font-weight:700;cursor:pointer;">❌ Reject & Return</button>' +
            '</div>'
          : renderReviewActionBarButtons(report.status)
        ) +
        '</div>' + '</div>' +
    '</div>';
  }

  function renderDay8HODReviewPanel(report, user) {
    return '<div style="max-width:960px;margin:0 auto;padding-bottom:40px;font-family:sans-serif;">' +
      '<div style="background:#fff;border:1.5px solid #0284c7;border-radius:10px;padding:12px 20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;box-shadow:0 4px 12px rgba(2,132,199,0.12);">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<button id="btn-hod-review-back" style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:6px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;">← Back</button>' +
          '<span id="review-status-span" style="font-size:13px;color:#334155;"><strong>Daily Report Review: ' + E(report.scholarName) + '</strong> — ' + E(report.monthYear) + ' &nbsp; ' + statusBadge(report.status) + '</span>' +
        '</div>' +
        
      '</div>' +
      (report.status === 'SUPERVISOR_APPROVED'
        ? '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:16px;margin-bottom:16px;">' +
            '<label for="hod-remarks" style="font-size:13px;font-weight:700;color:#0f172a;display:block;margin-bottom:6px;">HOD Remarks:</label>' +
            '<textarea id="hod-remarks" rows="3" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-family:inherit;font-size:13px;box-sizing:border-box;" placeholder="Enter HOD approval remarks..."></textarea>' +
          '</div>'
        : ''
      ) +
      '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">' +
        renderDay8ReportReadOnly(report, user.role) +
      '</div>' +
      '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;display:flex;justify-content:flex-end;margin-top:20px;">' +
        '<div id="review-action-area">' +
        (report.status === 'SUPERVISOR_APPROVED'
          ? '<div style="display:flex;align-items:center;gap:10px;">' +
              '<button type="button" id="btn-hod-approve" style="background:#15803d;color:#fff;border:none;border-radius:6px;padding:8.5px 20px;font-size:13px;font-weight:700;cursor:pointer;">✅ Approve & Forward to Deputy Dean</button>' +
              '<button type="button" id="btn-hod-reject" style="background:#be123c;color:#fff;border:none;border-radius:6px;padding:8.5px 16px;font-size:13px;font-weight:700;cursor:pointer;">❌ Reject & Return</button>' +
            '</div>'
          : renderReviewActionBarButtons(report.status)
        ) +
        '</div>' + '</div>' +
    '</div>';
  }
  function renderDay8DeanLevelReviewPanel(report, user) {
    var isDean = user.role === 'dean';
    var targetStatus = isDean ? 'DEPUTY_DEAN_APPROVED' : 'HOD_APPROVED';
    var nextStatusLabel = isDean ? 'Verify & Finalize' : 'Approve & Submit to Dean';
    var remarksLabel = isDean ? 'Dean Remarks:' : 'Deputy Dean Remarks:';

    return '<div style="max-width:960px;margin:0 auto;padding-bottom:40px;font-family:sans-serif;">' +
      '<div style="background:#fff;border:1.5px solid #0284c7;border-radius:10px;padding:12px 20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;box-shadow:0 4px 12px rgba(2,132,199,0.12);">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<button id="btn-ddr-review-back" style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:6px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;">Back</button>' +
          '<span id="review-status-span" style="font-size:13px;color:#334155;"><strong>Daily Report Review: ' + E(report.scholarName) + '</strong> - ' + E(report.monthYear) + ' &nbsp; ' + statusBadge(report.status) + '</span>' +
        '</div>' +
        
      '</div>' +

      (report.status === 'HOD_APPROVED'
        ? '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:16px;margin-bottom:16px;">' +
            '<label for="ddr-remarks" style="font-size:13px;font-weight:700;color:#0f172a;display:block;margin-bottom:6px;">Deputy Dean Research Remarks:</label>' +
            '<textarea id="ddr-remarks" rows="3" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-family:inherit;font-size:13px;box-sizing:border-box;" placeholder="Enter certification remarks..."></textarea>' +
          '</div>'
        : ''
      ) +

      '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">' +
        renderDay8ReportReadOnly(report, user.role) +
      '</div>' +
      '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;display:flex;justify-content:flex-end;margin-top:20px;">' +
        '<div id="review-action-area">' +
        (report.status === targetStatus
          ? '<div style="display:flex;align-items:center;gap:10px;">' +
              '<button type="button" id="btn-ddr-approve" style="background:#15803d;color:#fff;border:none;border-radius:6px;padding:8.5px 20px;font-size:13px;font-weight:700;cursor:pointer;">✅ ' + nextStatusLabel + '</button>' +
              '<button type="button" id="btn-ddr-reject" style="background:#be123c;color:#fff;border:none;border-radius:6px;padding:8.5px 16px;font-size:13px;font-weight:700;cursor:pointer;">❌ Reject & Return</button>' +
            '</div>'
          : renderReviewActionBarButtons(report.status)
        ) +
        '</div>' + '</div>' +
    '</div>';
  }

  // ════════════════════════════════════════════════════════════════
  // SCHOLAR DASHBOARD (Module 5 Scholar Only PDF & Notifications)
  // ════════════════════════════════════════════════════════════════
  function renderScholarDashboard(user) {
    var DATA = global.SCHOLAR_REPORTS_DATA;
    var scholar = DATA ? DATA.getScholarById(user.id || user.employeeId) : null;
    var reports = DATA && scholar ? DATA.getReportsForScholar(scholar.id) : [];
    
    // Separate monthly and Day 8 reports
    var monthlyReports = reports.filter(function (r) { return r.reportType !== 'DAY8'; });
    var dailyReports = reports.filter(function (r) { return r.reportType === 'DAILY' || r.reportType === 'DAY8'; });
    var latestReport = monthlyReports.length > 0 ? monthlyReports[0] : null;

    if (!scholar) {
      return '<div style="padding:40px;text-align:center;color:#64748b;">Scholar record not found for <strong>' + E(user.name) + '</strong>.</div>';
    }

    // ── Notifications
    var verifiedReports = monthlyReports.filter(function (r) { return r.status === 'VERIFIED'; });
    var verifiedNotice = verifiedReports.length > 0
      ? '<div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;padding:16px 20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(22,101,52,0.08);">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
            '<div>' +
              '<span style="display:inline-block;padding:3px 10px;border-radius:20px;background:#dcfce7;color:#166534;font-size:11.5px;font-weight:800;margin-bottom:6px;">🎉 FELLOWSHIP CLAIM VERIFIED</span>' +
              '<h3 style="margin:2px 0 4px 0;font-size:16px;color:#14532d;font-weight:800;">Your Monthly Report for ' + E(verifiedReports[0].monthYear) + ' has been verified by the Deputy Dean Research.</h3>' +
              '<p style="margin:0;font-size:12.5px;color:#166534;">Verification Date: <strong>' + E(verifiedReports[0].submittedDate || 'Recent') + '</strong> &nbsp;|&nbsp; Status: <strong style="color:#15803d;">VERIFIED & APPROVED FOR DISBURSEMENT</strong></p>' +
            '</div>' +
            '<div style="display:flex;gap:10px;">' +
              '<button data-action="view-read-only" data-reportid="' + E(verifiedReports[0].id) + '" style="background:#fff;color:#166534;border:1.5px solid #166534;border-radius:6px;padding:7.5px 14px;font-size:12.5px;font-weight:700;cursor:pointer;">View Report 📄</button>' +
              '<button data-action="download-pdf" data-reportid="' + E(verifiedReports[0].id) + '" style="background:#166534;color:#fff;border:none;border-radius:6px;padding:8px 16px;font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:0 2px 5px rgba(22,101,52,0.3);">Generate PDF 📄</button>' +
            '</div>' +
          '</div>' +
        '</div>'
      : '';

    var returnedReports = monthlyReports.filter(function (r) { return r.status === 'RETURNED_TO_SCHOLAR'; });
    var returnedNotice = returnedReports.length > 0
      ? '<div style="background:#fff1f2;border:1.5px solid #fecdd3;border-radius:10px;padding:16px 20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(190,18,60,0.08);">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
            '<div>' +
              '<span style="display:inline-block;padding:3px 10px;border-radius:20px;background:#ffe4e6;color:#be123c;font-size:11.5px;font-weight:800;margin-bottom:6px;">⚠️ REVISION REQUIRED</span>' +
              '<h3 style="margin:2px 0 4px 0;font-size:16px;color:#881337;font-weight:800;">Your Monthly Report for ' + E(returnedReports[0].monthYear) + ' was returned for revision.</h3>' +
              '<p style="margin:0;font-size:12.5px;color:#9f1239;">Remarks: <em>&ldquo;' + E(returnedReports[0].approvalHistory && returnedReports[0].approvalHistory.length ? returnedReports[0].approvalHistory[returnedReports[0].approvalHistory.length - 1].remarks || 'Please revise form details' : 'Please revise') + '&rdquo;</em></p>' +
            '</div>' +
            '<button data-action="edit" data-reportid="' + E(returnedReports[0].id) + '" style="background:#be123c;color:#fff;border:none;border-radius:6px;padding:8px 16px;font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:0 2px 5px rgba(190,18,60,0.3);">Edit & Resubmit ✏️</button>' +
          '</div>' +
        '</div>'
      : '';

    // Daily Report Notifications
    var verifiedDailyReports = dailyReports.filter(function (r) { return r.status === 'VERIFIED'; });
    var verifiedDailyNotice = verifiedDailyReports.length > 0
      ? '<div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;padding:16px 20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(22,101,52,0.08);">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
            '<div>' +
              '<span style="display:inline-block;padding:3px 10px;border-radius:20px;background:#dcfce7;color:#166534;font-size:11.5px;font-weight:800;margin-bottom:6px;">🎉 DAILY REPORT VERIFIED</span>' +
              '<h3 style="margin:2px 0 4px 0;font-size:16px;color:#14532d;font-weight:800;">Your Daily Report for ' + E(verifiedDailyReports[0].monthYear) + ' has been verified by the Deputy Dean Research.</h3>' +
              '<p style="margin:0;font-size:12.5px;color:#166534;">Verification Date: <strong>' + E(verifiedDailyReports[0].submittedDate || 'Recent') + '</strong> &nbsp;|&nbsp; Status: <strong style="color:#15803d;">VERIFIED</strong></p>' +
            '</div>' +
            '<div style="display:flex;gap:10px;">' +
              '<button data-action="view-day8" data-reportid="' + E(verifiedDailyReports[0].id) + '" style="background:#fff;color:#166534;border:1.5px solid #166534;border-radius:6px;padding:7.5px 14px;font-size:12.5px;font-weight:700;cursor:pointer;">View Report 📄</button>' +
              '<button data-action="download-daily-pdf" data-reportid="' + E(verifiedDailyReports[0].id) + '" style="background:#166534;color:#fff;border:none;border-radius:6px;padding:8px 16px;font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:0 2px 5px rgba(22,101,52,0.3);">Generate PDF 📄</button>' +
            '</div>' +
          '</div>' +
        '</div>'
      : '';

    var returnedDailyReports = dailyReports.filter(function (r) { return r.status === 'RETURNED_TO_SCHOLAR'; });
    var returnedDailyNotice = returnedDailyReports.length > 0
      ? '<div style="background:#fff1f2;border:1.5px solid #fecdd3;border-radius:10px;padding:16px 20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(190,18,60,0.08);">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
            '<div>' +
              '<span style="display:inline-block;padding:3px 10px;border-radius:20px;background:#ffe4e6;color:#be123c;font-size:11.5px;font-weight:800;margin-bottom:6px;">⚠️ DAILY REPORT REVISION REQUIRED</span>' +
              '<h3 style="margin:2px 0 4px 0;font-size:16px;color:#881337;font-weight:800;">Your Daily Report for ' + E(returnedDailyReports[0].monthYear) + ' was returned for revision.</h3>' +
              '<p style="margin:0;font-size:12.5px;color:#9f1239;">Remarks: <em>&ldquo;' + E(returnedDailyReports[0].approvalHistory && returnedDailyReports[0].approvalHistory.length ? returnedDailyReports[0].approvalHistory[returnedDailyReports[0].approvalHistory.length - 1].remarks || 'Please revise form details' : 'Please revise') + '&rdquo;</em></p>' +
            '</div>' +
            '<button data-action="edit-day8" data-reportid="' + E(returnedDailyReports[0].id) + '" style="background:#be123c;color:#fff;border:none;border-radius:6px;padding:8px 16px;font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:0 2px 5px rgba(190,18,60,0.3);">Edit & Resubmit ✏️</button>' +
          '</div>' +
        '</div>'
      : '';

    // Monthly table rows
    var tableRows = monthlyReports.map(function (r) {
      var actionBtn = '';
      if (r.status === 'VERIFIED') {
        actionBtn = '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
          '<button data-action="view-read-only" data-reportid="' + E(r.id) + '" style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:5px;padding:5px 10px;font-size:12px;font-weight:600;cursor:pointer;">View 📄</button>' +
          '<button data-action="download-pdf" data-reportid="' + E(r.id) + '" style="background:#166534;color:#fff;border:none;border-radius:5px;padding:5px 11px;font-size:12px;font-weight:700;cursor:pointer;">Generate PDF 📄</button>' +
        '</div>';
      } else if (r.status === 'DRAFT' || r.status === 'RETURNED_TO_SCHOLAR') {
        actionBtn = '<button data-action="edit" data-reportid="' + E(r.id) + '" style="background:#0284c7;color:#fff;border:none;border-radius:5px;padding:5px 12px;font-size:12px;font-weight:700;cursor:pointer;">' + (r.status === 'RETURNED_TO_SCHOLAR' ? 'Edit & Resubmit ✏️' : 'Edit Draft ✏️') + '</button>';
      } else {
        actionBtn = '<button data-action="view-read-only" data-reportid="' + E(r.id) + '" style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:5px;padding:5px 10px;font-size:12px;cursor:pointer;">View Submitted Report 📄</button>';
      }

      var rejectionNote = (r.status === 'RETURNED_TO_SCHOLAR' && r.approvalHistory && r.approvalHistory.length)
        ? '<br><small style="color:#be123c;font-size:11px;">Returned: ' + E(r.approvalHistory[r.approvalHistory.length - 1].remarks || '') + '</small>'
        : '';

      return '<tr>' +
        '<td style="padding:9px 12px;border:1px solid #e2e8f0;font-weight:700;color:#0f172a;">' + E(r.monthYear) + '</td>' +
        '<td style="padding:9px 12px;border:1px solid #e2e8f0;font-size:12px;color:#475569;">' + E(r.period) + '</td>' +
        '<td style="padding:9px 12px;border:1px solid #e2e8f0;font-weight:700;color:#059669;">₹' + E(r.fellowshipAmount) + '</td>' +
        '<td style="padding:9px 12px;border:1px solid #e2e8f0;font-size:12px;">' + E(r.submittedDate) + '</td>' +
        '<td style="padding:9px 12px;border:1px solid #e2e8f0;">' + statusBadge(r.status) + rejectionNote + '</td>' +
        '<td style="padding:9px 12px;border:1px solid #e2e8f0;">' + actionBtn + '</td>' +
      '</tr>';
    }).join('') || '<tr><td colspan="6" style="padding:20px;text-align:center;color:#94a3b8;">No reports yet. Click &quot;+ Create Monthly Report&quot; to get started.</td></tr>';

    // Daily Report table rows
    var dailyTableRows = dailyReports.map(function (r) {
      var actionBtn = '';
      if (r.status === 'VERIFIED') {
        actionBtn = '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
          '<button data-action="view-day8" data-reportid="' + E(r.id) + '" style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:5px;padding:5px 10px;font-size:12px;font-weight:600;cursor:pointer;">View 📄</button>' +
          '<button data-action="download-daily-pdf" data-reportid="' + E(r.id) + '" style="background:#166534;color:#fff;border:none;border-radius:5px;padding:5px 11px;font-size:12px;font-weight:700;cursor:pointer;">Generate PDF 📄</button>' +
        '</div>';
      } else if (r.status === 'DRAFT' || r.status === 'RETURNED_TO_SCHOLAR') {
        actionBtn = '<button data-action="edit-day8" data-reportid="' + E(r.id) + '" style="background:#0284c7;color:#fff;border:none;border-radius:5px;padding:5px 12px;font-size:12px;font-weight:700;cursor:pointer;">' + (r.status === 'RETURNED_TO_SCHOLAR' ? 'Edit & Resubmit ✏️' : 'Edit Draft ✏️') + '</button>';
      } else {
        actionBtn = '<button data-action="view-day8" data-reportid="' + E(r.id) + '" style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:5px;padding:5px 10px;font-size:12px;cursor:pointer;">View Submitted Report 📄</button>';
      }

      var rejectionNote = (r.status === 'RETURNED_TO_SCHOLAR' && r.approvalHistory && r.approvalHistory.length)
        ? '<br><small style="color:#be123c;font-size:11px;">Returned: ' + E(r.approvalHistory[r.approvalHistory.length - 1].remarks || '') + '</small>'
        : '';

      return '<tr>' +
        '<td style="padding:9px 12px;border:1px solid #e2e8f0;font-weight:700;color:#0f172a;">' + E(r.monthYear) + '</td>' +
        '<td style="padding:9px 12px;border:1px solid #e2e8f0;font-size:12px;color:#475569;">' + E(r.period) + '</td>' +
        '<td style="padding:9px 12px;border:1px solid #e2e8f0;font-size:12px;">' + E(r.submittedDate) + '</td>' +
        '<td style="padding:9px 12px;border:1px solid #e2e8f0;">' + statusBadge(r.status) + rejectionNote + '</td>' +
        '<td style="padding:9px 12px;border:1px solid #e2e8f0;">' + actionBtn + '</td>' +
      '</tr>';
    }).join('') || '<tr><td colspan="5" style="padding:20px;text-align:center;color:#94a3b8;">No Daily Reports yet. Click &quot;+ Create Daily Report&quot; to get started.</td></tr>';

    return '<div style="padding-bottom:40px;">' +

      // Profile card
      '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:20px;margin-bottom:20px;box-shadow:0 1px 4px rgba(0,0,0,0.05);">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">' +
          '<div>' +
            '<span style="display:inline-block;padding:3px 10px;border-radius:20px;background:#e0f2fe;color:#0369a1;font-size:11.5px;font-weight:700;margin-bottom:8px;">Full-Time PhD Research Scholar</span>' +
            '<h2 style="margin:4px 0;font-size:20px;color:#0f172a;font-weight:800;">' + E(scholar.name) + ' <span style="font-size:15px;font-weight:400;color:#64748b;">' + (scholar.expansionOfInitial ? '(' + E(scholar.expansionOfInitial) + ')' : '') + '</span></h2>' +
            '<p style="margin:4px 0;font-size:13px;color:#475569;"><strong>Reg No:</strong> <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;">' + E(scholar.registrationNo) + '</code> &nbsp;|&nbsp; <strong>Dept:</strong> ' + E(scholar.department) + ' &nbsp;|&nbsp; <strong>Supervisor:</strong> ' + E(scholar.supervisorName) + '</p>' +
            '<p style="margin:6px 0 0 0;font-size:13px;color:#1e293b;background:#f8fafc;padding:8px 12px;border-left:4px solid #0284c7;border-radius:4px;"><strong>PhD Topic:</strong> &ldquo;' + E(scholar.phdTopic) + '&rdquo;</p>' +
          '</div>' +
          '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 18px;min-width:250px;">' +
            '<div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Registration & Funding</div>' +
            '<div style="font-size:13px;color:#1e293b;margin-top:4px;"><strong>Registered:</strong> ' + E(scholar.registrationDate) + '</div>' +
            '<div style="font-size:13px;color:#1e293b;margin-top:4px;"><strong>Fellowship:</strong> <strong style="color:#059669;">₹' + E(scholar.fellowshipAmount) + '/month</strong></div>' +
            '<div style="font-size:13px;color:#1e293b;margin-top:4px;"><strong>Funded Project:</strong> ' + E(scholar.isFundedProject) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      // Notifications
      verifiedNotice +
      returnedNotice +
      verifiedDailyNotice +
      returnedDailyNotice +

      // KPI metrics
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:20px;">' +
        kpiCard('Monthly Claim', '₹' + E(scholar.fellowshipAmount), 'Fellowship Amount') +
        kpiCard('Monthly Submissions', monthlyReports.length, 'Claim Forms') +
        kpiCard('Daily Submissions', dailyReports.length, 'Daily Reports') +
        kpiCard('Coursework', (scholar.courseworkCompleted || 0) + ' / ' + (scholar.courseworkAllotted || 0), 'Completed') +
      '</div>' +

      // Submissions container card
      '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.05);">' +
        
        // Navigation Tabs inside card
        '<div style="display:flex;gap:12px;border-bottom:2px solid #e2e8f0;padding-bottom:12px;margin-bottom:16px;">' +
          '<button id="tab-monthly" style="background:#0284c7;color:#fff;border:none;border-radius:6px;padding:8px 16px;font-weight:700;font-size:13px;cursor:pointer;box-shadow:0 2px 6px rgba(2,132,199,0.2);">Monthly Claim Form Submissions</button>' +
          '<button id="tab-daily" style="background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;border-radius:6px;padding:8px 16px;font-weight:700;font-size:13px;cursor:pointer;">Daily Reports</button>' +
        '</div>' +

        // SECTION 1: Monthly Claim Forms
        '<div id="section-monthly">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px;">' +
            '<div><h3 style="margin:0;font-size:15px;color:#0f172a;font-weight:700;">Monthly Report Cum Fellowship Claim</h3><p style="margin:4px 0 0 0;font-size:12px;color:#64748b;">Official monthly progress reports and fellowship disbursement records</p></div>' +
            '<button id="btn-create-report" style="background:#0284c7;color:#fff;border:none;border-radius:7px;padding:9px 18px;font-weight:700;font-size:13px;cursor:pointer;box-shadow:0 2px 6px rgba(2,132,199,0.3);">+ Create Monthly Report</button>' +
          '</div>' +
          '<div style="overflow-x:auto;">' +
            '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
              '<thead><tr style="background:#f8fafc;">' +
                '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;font-weight:700;">Month & Year</th>' +
                '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;font-weight:700;">Period</th>' +
                '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;font-weight:700;">Claim Amount</th>' +
                '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;font-weight:700;">Submitted Date</th>' +
                '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;font-weight:700;">Status</th>' +
                '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;font-weight:700;">Action</th>' +
              '</tr></thead>' +
              '<tbody>' + tableRows + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +

        // SECTION 2: Daily Reports
        '<div id="section-day8" style="display:none;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px;">' +
            '<div><h3 style="margin:0;font-size:15px;color:#0f172a;font-weight:700;">Daily Work Reports</h3><p style="margin:4px 0 0 0;font-size:12px;color:#64748b;">Daily work reports log for full-time research scholars</p></div>' +
            '<button id="btn-create-daily-report" style="background:#0284c7;color:#fff;border:none;border-radius:7px;padding:9px 18px;font-weight:700;font-size:13px;cursor:pointer;box-shadow:0 2px 6px rgba(2,132,199,0.3);">+ Create Daily Report</button>' +
          '</div>' +
          '<div style="overflow-x:auto;">' +
            '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
              '<thead><tr style="background:#f8fafc;">' +
                '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;font-weight:700;">Month & Year</th>' +
                '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;font-weight:700;">Period</th>' +
                '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;font-weight:700;">Submitted Date</th>' +
                '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;font-weight:700;">Status</th>' +
                '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;font-weight:700;">Action</th>' +
              '</tr></thead>' +
              '<tbody>' + dailyTableRows + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +

      '</div>' +

    '</div>';
  }

  function kpiCard(label, value, note, colorScheme) {
    var bg = colorScheme ? colorScheme.bg : '#f8fafc';
    var col = colorScheme ? colorScheme.color : '#0f172a';
    return '<div style="background:' + bg + ';border:1px solid #e2e8f0;border-radius:10px;padding:16px;text-align:center;">' +
      '<div style="font-size:11.5px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:6px;">' + E(label) + '</div>' +
      '<div style="font-size:20px;font-weight:800;color:' + col + ';margin-bottom:4px;">' + E(value) + '</div>' +
      '<div style="font-size:11.5px;color:#94a3b8;">' + E(note) + '</div>' +
    '</div>';
  }

  // ════════════════════════════════════════════════════════════════
  // EDITABLE REPORT FORM (Module 5 Proof Upload Controls)
  // ════════════════════════════════════════════════════════════════
  function renderEditableForm(scholar, report) {
    var rp = (report.researchProgress || []).join('\n');
    var aw = (report.academicWorkload || []).join('\n');

    function inp(id, val, extra) {
      return '<input type="text" id="' + id + '" value="' + E(val) + '" style="width:100%;padding:6px 8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;box-sizing:border-box;' + (extra || '') + '" />';
    }
    function sel(id, selected, options) {
      return '<select id="' + id + '" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;">' +
        options.map(function(o) { return '<option value="' + o + '"' + (selected === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') +
      '</select>';
    }
    function numInp(id, val, w) {
      return '<input type="number" id="' + id + '" value="' + E(val) + '" style="width:' + (w || '90px') + ';padding:6px 8px;border:1px solid #cbd5e1;border-radius:4px;font-size:13px;" />';
    }
    function fRow(label, content) {
      return '<tr><td style="width:42%;padding:9px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;font-size:13px;color:#334155;vertical-align:top;">' + label + '</td><td style="padding:9px 12px;border:1px solid #e2e8f0;">' + content + '</td></tr>';
    }

    var workloadRows = (report.academicWorkloadTable || []).map(function(r, i) { return workloadTR(r, i); }).join('');
    var confRows = (report.conferencePubsTable || []).map(function(r, i) { return confTR(r, i); }).join('');
    var jnlRows = (report.journalPubsTable || []).map(function(r, i) { return jnlTR(r, i); }).join('');
    var patRows = (report.patentPubsTable || []).map(function(r, i) { return patTR(r, i); }).join('');
    var dailyRows = (report.dailyReportTable || []).map(function(r, i) { return dailyTR(r, i); }).join('');

    return '<div style="max-width:960px;margin:0 auto;padding-bottom:60px;">' +

      // Navigation bar
      '<div style="background:#fff;border:1.5px solid #0284c7;border-radius:10px;padding:12px 20px;margin-bottom:20px;box-shadow:0 4px 12px rgba(2,132,199,0.12);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<button id="btn-form-back" style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:6px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;">← Back to Dashboard</button>' +
          '<span style="font-size:12.5px;color:#64748b;">Editing: <strong style="color:#0f172a;">' + E(report.monthYear) + '</strong> &nbsp; ' + statusBadge(report.status) + '</span>' +
        '</div>' +
      '</div>' +

      // Form body
      '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">' +

        // Header
        '<div style="text-align:center;border-bottom:2px solid #0284c7;padding-bottom:14px;margin-bottom:22px;">' +
          '<h2 style="margin:0 0 4px 0;font-size:19px;font-weight:800;color:#0f172a;">SRM INSTITUTE OF SCIENCE AND TECHNOLOGY</h2>' +
          '<div style="font-size:12.5px;color:#0369a1;font-weight:600;margin-bottom:8px;">Faculty of Engineering & Technology, Ramapuram</div>' +
          '<div style="font-size:13.5px;font-weight:700;color:#0f172a;background:#f0f9ff;padding:6px 12px;border-radius:5px;display:inline-block;border:1px solid #bae6fd;">MONTHLY REPORT CUM FELLOWSHIP CLAIM FORM FOR FULL-TIME RESEARCH SCHOLARS</div>' +
          '<div style="margin-top:10px;display:flex;justify-content:center;gap:16px;flex-wrap:wrap;font-size:13px;color:#334155;">' +
            '<div><strong>Month of:</strong> <input type="text" id="f_monthYear" value="' + E(report.monthYear) + '" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;width:150px;" /></div>' +
            '<div><strong>Period:</strong> <input type="text" id="f_period" value="' + E(report.period) + '" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;width:220px;" /></div>' +
          '</div>' +
        '</div>' +

        // Section A
        sectionHeader('A. SCHOLAR DETAILS') +
        '<table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;margin-bottom:20px;font-size:13px;">' +
          fRow('1. Name of Research Scholar', inp('f_scholarName', report.scholarName, 'font-weight:600;')) +
          fRow('2. Expansion of Initial', inp('f_expansionOfInitial', report.expansionOfInitial, '')) +
          fRow('3. Date of PhD Registration', '<input type="date" id="f_registrationDate" value="' + E(report.registrationDate) + '" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:4px;" />') +
          fRow('4. Name of Supervisor', inp('f_supervisorName', report.supervisorName, 'font-weight:600;')) +
          fRow('5. Department', inp('f_department', report.department, '')) +
          fRow('6. Title of PhD Work', '<textarea id="f_phdTopic" rows="2" style="width:100%;padding:6px 8px;border:1px solid #cbd5e1;border-radius:4px;font-family:inherit;font-size:13px;box-sizing:border-box;">' + E(report.phdTopic) + '</textarea>') +
          fRow('7. Funded Project / JRF / SRF?', sel('f_isFundedProject', report.isFundedProject, ['NO', 'YES'])) +
          fRow('7A. If YES — JRF/SRF Status, Funding Agency, Project Title, PI', '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">' + inp('f_jrfSrfStatus', report.jrfSrfStatus, '') + inp('f_fundingAgency', report.fundingAgency, '') + '</div><div style="margin-top:6px;">' + inp('f_projectTitle', report.projectTitle, '') + '</div><div style="margin-top:6px;">' + inp('f_principalInvestigator', report.principalInvestigator, '') + '</div>') +
        '</table>' +

        // Section B
        sectionHeader('B. COURSE WORK & PUBLICATION DETAILS') +
        '<table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;margin-bottom:20px;font-size:13px;">' +
          fRow('8. Coursework Allotted', numInp('f_courseworkAllotted', report.courseworkAllotted)) +
          fRow('9. Coursework Completed', numInp('f_courseworkCompleted', report.courseworkCompleted)) +
          fRow('10. Comprehensive Viva Completed?', sel('f_comprehensiveVivaCompleted', report.comprehensiveVivaCompleted, ['NO', 'YES']) + ' &nbsp; Date: <input type="text" id="f_comprehensiveVivaDate" value="' + E(report.comprehensiveVivaDate) + '" style="padding:5px 8px;border:1px solid #cbd5e1;border-radius:4px;width:160px;" placeholder="e.g. 12/08/2026" />') +
          fRow('11. Scopus ID', inp('f_scopusId', report.scopusId, 'width:240px;')) +
          fRow('12. ORCID ID', inp('f_orcidId', report.orcidId, 'width:240px;')) +
          fRow('13. Scopus linked to ORCID?', sel('f_isScopusLinkedToOrcid', report.isScopusLinkedToOrcid, ['YES', 'NO'])) +
          fRow('14. Conference Publications', numInp('f_noOfConferencePubs', report.noOfConferencePubs)) +
          fRow('15. Journal Pubs (Scopus / WoS / SCI / Others)', '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">Scopus: ' + numInp('f_noOfJournalPubsScopus', report.noOfJournalPubsScopus, '70px') + ' WoS: ' + numInp('f_noOfJournalPubsWos', report.noOfJournalPubsWos, '70px') + ' SCI: ' + numInp('f_noOfJournalPubsSci', report.noOfJournalPubsSci, '70px') + ' Others: ' + numInp('f_noOfJournalPubsOthers', report.noOfJournalPubsOthers, '70px') + '</div>') +
          fRow('16. Non-Indexed Pubs', numInp('f_noOfNonIndexedPubs', report.noOfNonIndexedPubs)) +
          fRow('17. Probable Thesis Submission Month/Year', inp('f_probableThesisSubmissionMonthYear', report.probableThesisSubmissionMonthYear, 'width:200px;')) +
        '</table>' +

        // Section C
        sectionHeader('C. FELLOWSHIP DETAILS & WORK PROGRESS') +
        '<table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;margin-bottom:20px;font-size:13px;">' +
          fRow('18. Fellowship per Month (Rs.)', inp('f_fellowshipAmount', report.fellowshipAmount, 'width:160px;font-weight:700;color:#059669;')) +
          fRow('19. Fellowship Received From (Month & Year)', inp('f_fellowshipReceivedFromMonthYear', report.fellowshipReceivedFromMonthYear, 'width:200px;')) +
          fRow('20. Was Fellowship Revised?', sel('f_wasFellowshipRevised', report.wasFellowshipRevised, ['NO', 'YES']) + ' &nbsp; Revised Amount: ' + inp('f_revisedFellowshipAmount', report.revisedFellowshipAmount, 'width:140px;display:inline-block;') + ' From: ' + inp('f_revisedFellowshipReceivedFrom', report.revisedFellowshipReceivedFrom, 'width:160px;display:inline-block;')) +
          fRow('21A. Research Progress (one per line)', '<textarea id="f_researchProgress" rows="4" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-family:inherit;font-size:13px;box-sizing:border-box;" placeholder="Enter each research activity on a new line">' + E(rp) + '</textarea>') +
          fRow('21B. Academic Workload (one per line)', '<textarea id="f_academicWorkload" rows="3" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-family:inherit;font-size:13px;box-sizing:border-box;" placeholder="Enter each academic workload point on a new line">' + E(aw) + '</textarea>') +
          fRow('22. Specific Outcomes (Publications / Patents)', '<textarea id="f_specificOutcomes" rows="2" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-family:inherit;font-size:13px;box-sizing:border-box;">' + E(report.specificOutcomes) + '</textarea>') +
        '</table>' +

        // (A) Academic Workload Table
        '<div style="display:flex;justify-content:space-between;align-items:center;background:#0f172a;color:#fff;padding:8px 14px;border-radius:6px 6px 0 0;margin-top:4px;">' +
          '<span style="font-weight:700;font-size:13px;">(A) Academic Work Load for Current Semester</span>' +
          '<button id="btn-add-workload" style="background:#0284c7;color:#fff;border:none;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;">+ Add</button>' +
        '</div>' +
        '<div style="overflow-x:auto;margin-bottom:20px;"><table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:12.5px;">' +
          '<thead><tr style="background:#f1f5f9;text-align:left;"><th style="padding:6px;border:1px solid #cbd5e1;">S.No</th><th style="padding:6px;border:1px solid #cbd5e1;">Year</th><th style="padding:6px;border:1px solid #cbd5e1;">Course Handled</th><th style="padding:6px;border:1px solid #cbd5e1;">Branch/Sem/Sec</th><th style="padding:6px;border:1px solid #cbd5e1;">Theory/Lab</th><th style="padding:6px;border:1px solid #cbd5e1;">Role</th><th style="padding:6px;border:1px solid #cbd5e1;">Hrs/Wk</th><th style="padding:6px;border:1px solid #cbd5e1;width:40px;"></th></tr></thead>' +
          '<tbody id="tbody-workload">' + workloadRows + '</tbody>' +
        '</table></div>' +

        // (B) Conference Table (WITH PROOF UPLOAD PER ROW)
        '<div style="display:flex;justify-content:space-between;align-items:center;background:#0f172a;color:#fff;padding:8px 14px;border-radius:6px 6px 0 0;margin-top:4px;">' +
          '<span style="font-weight:700;font-size:13px;">(B) Conference Publications after PhD Registration</span>' +
          '<button id="btn-add-conf" style="background:#0284c7;color:#fff;border:none;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;">+ Add</button>' +
        '</div>' +
        '<div style="overflow-x:auto;margin-bottom:20px;"><table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:12.5px;">' +
          '<thead><tr style="background:#f1f5f9;text-align:left;"><th style="padding:6px;border:1px solid #cbd5e1;">S.No</th><th style="padding:6px;border:1px solid #cbd5e1;">Title of Paper</th><th style="padding:6px;border:1px solid #cbd5e1;">Authors</th><th style="padding:6px;border:1px solid #cbd5e1;">Conference Name</th><th style="padding:6px;border:1px solid #cbd5e1;">Organized By</th><th style="padding:6px;border:1px solid #cbd5e1;">Publisher/ISBN</th><th style="padding:6px;border:1px solid #cbd5e1;">Month & Year</th><th style="padding:6px;border:1px solid #cbd5e1;">Proof Certificate</th><th style="padding:6px;border:1px solid #cbd5e1;width:40px;"></th></tr></thead>' +
          '<tbody id="tbody-conf">' + confRows + '</tbody>' +
        '</table></div>' +

        // (C) Journal Table (WITH PROOF UPLOAD PER ROW)
        '<div style="display:flex;justify-content:space-between;align-items:center;background:#0f172a;color:#fff;padding:8px 14px;border-radius:6px 6px 0 0;margin-top:4px;">' +
          '<span style="font-weight:700;font-size:13px;">(C) Journal Publications after PhD Registration</span>' +
          '<button id="btn-add-journal" style="background:#0284c7;color:#fff;border:none;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;">+ Add</button>' +
        '</div>' +
        '<div style="overflow-x:auto;margin-bottom:20px;"><table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:12.5px;">' +
          '<thead><tr style="background:#f1f5f9;text-align:left;"><th style="padding:6px;border:1px solid #cbd5e1;">S.No</th><th style="padding:6px;border:1px solid #cbd5e1;">Title</th><th style="padding:6px;border:1px solid #cbd5e1;">Authors</th><th style="padding:6px;border:1px solid #cbd5e1;">Journal Details</th><th style="padding:6px;border:1px solid #cbd5e1;">Indexed In</th><th style="padding:6px;border:1px solid #cbd5e1;">Quartile</th><th style="padding:6px;border:1px solid #cbd5e1;">ISSN / Date</th><th style="padding:6px;border:1px solid #cbd5e1;">Status</th><th style="padding:6px;border:1px solid #cbd5e1;">Proof Certificate</th><th style="padding:6px;border:1px solid #cbd5e1;width:40px;"></th></tr></thead>' +
          '<tbody id="tbody-journal">' + jnlRows + '</tbody>' +
        '</table></div>' +

        // (D) Patent Table (WITH PROOF UPLOAD PER ROW)
        '<div style="display:flex;justify-content:space-between;align-items:center;background:#0f172a;color:#fff;padding:8px 14px;border-radius:6px 6px 0 0;margin-top:4px;">' +
          '<span style="font-weight:700;font-size:13px;">(D) Patent Publications after PhD Registration</span>' +
          '<button id="btn-add-patent" style="background:#0284c7;color:#fff;border:none;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;">+ Add</button>' +
        '</div>' +
        '<div style="overflow-x:auto;margin-bottom:20px;"><table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:12.5px;">' +
          '<thead><tr style="background:#f1f5f9;text-align:left;"><th style="padding:6px;border:1px solid #cbd5e1;">S.No</th><th style="padding:6px;border:1px solid #cbd5e1;">Title of Paper/Patent</th><th style="padding:6px;border:1px solid #cbd5e1;">Inventor Name</th><th style="padding:6px;border:1px solid #cbd5e1;">Applicant Name</th><th style="padding:6px;border:1px solid #cbd5e1;">App. No</th><th style="padding:6px;border:1px solid #cbd5e1;">Month & Year</th><th style="padding:6px;border:1px solid #cbd5e1;">Status</th><th style="padding:6px;border:1px solid #cbd5e1;">Proof Certificate</th><th style="padding:6px;border:1px solid #cbd5e1;width:40px;"></th></tr></thead>' +
          '<tbody id="tbody-patent">' + patRows + '</tbody>' +
        '</table></div>' +

        // Daily Log
        '<div style="display:flex;justify-content:space-between;align-items:center;background:#0f172a;color:#fff;padding:8px 14px;border-radius:6px 6px 0 0;margin-top:4px;">' +
          '<span style="font-weight:700;font-size:13px;">Daily Work Report Log for the Month</span>' +
          '<button id="btn-add-daily" style="background:#0284c7;color:#fff;border:none;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;">+ Add</button>' +
        '</div>' +
        '<div style="overflow-x:auto;margin-bottom:20px;"><table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:12.5px;">' +
          '<thead><tr style="background:#f1f5f9;text-align:left;"><th style="padding:6px;border:1px solid #cbd5e1;width:50px;">S.No</th><th style="padding:6px;border:1px solid #cbd5e1;width:120px;">Date</th><th style="padding:6px;border:1px solid #cbd5e1;">Description of Work & Results Achieved</th><th style="padding:6px;border:1px solid #cbd5e1;width:140px;">Remarks</th><th style="padding:6px;border:1px solid #cbd5e1;width:40px;"></th></tr></thead>' +
          '<tbody id="tbody-daily">' + dailyRows + '</tbody>' +
        '</table></div>' +

        // Signature placeholders
        '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:18px;margin-top:10px;">' +
          '<div style="font-size:13.5px;font-weight:700;color:#0f172a;margin-bottom:12px;">Verification & Signature Placeholders</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:12.5px;color:#475569;">' +
            '<div style="border:1px dashed #cbd5e1;padding:12px;border-radius:6px;background:#fff;">' +
              '<strong>Scholar Declaration</strong>' +
              '<p style="margin:6px 0 0 0;font-style:italic;">"Kindly allow my fellowship for the month of ' + E(report.monthYear) + '."</p>' +
              '<div style="margin-top:14px;color:#94a3b8;font-weight:600;">Scholar Signature: [ ' + E(report.scholarName) + ' ]</div>' +
            '</div>' +
            '<div style="border:1px dashed #cbd5e1;padding:12px;border-radius:6px;background:#fff;">' +
              '<strong>Supervisor Verification</strong>' +
              '<div style="margin-top:14px;color:#94a3b8;">Supervisor Remarks & Recommendation will record here after submission.</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

      '</div>' +
      // Action bar at the bottom
      '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;display:flex;justify-content:flex-end;margin-top:20px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<button type="button" id="btn-save-draft" style="background:#f8fafc;color:#0369a1;border:1.5px solid #0284c7;border-radius:6px;padding:8px 18px;font-size:13px;font-weight:700;cursor:pointer;">💾 Save Draft</button>' +
          '<button type="button" id="btn-submit-supervisor" style="background:#0284c7;color:#fff;border:none;border-radius:6px;padding:8.5px 20px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 5px rgba(2,132,199,0.3);">🚀 Submit to Supervisor</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // Sub-table row templates (with proof upload control for conf, jnl, pat)
  function workloadTR(r, i) {
    return '<tr><td style="padding:5px;border:1px solid #e2e8f0;text-align:center;">' + (i+1) + '</td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="wl-year" value="' + E(r.year) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="wl-course" value="' + E(r.course) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="wl-branch" value="' + E(r.branchSem) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="wl-type" value="' + E(r.theoryLab) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="wl-role" value="' + E(r.role) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="number" class="wl-hours" value="' + E(r.hoursPerWeek) + '" style="width:60px;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;text-align:center;"><button type="button" onclick="this.closest(\'tr\').remove()" style="color:#ef4444;border:none;background:none;cursor:pointer;font-weight:700;font-size:14px;">✕</button></td></tr>';
  }

  function proofControlCell(proofFile) {
    var hasProof = proofFile && proofFile.fileName;
    return '<td style="padding:5px;border:1px solid #e2e8f0;white-space:nowrap;">' +
      '<input type="file" accept=".pdf,.jpg,.jpeg,.png" class="proof-file-input" style="display:none;" />' +
      '<button type="button" class="btn-trigger-upload" style="background:' + (hasProof ? '#e0f2fe' : '#f1f5f9') + ';color:' + (hasProof ? '#0369a1' : '#475569') + ';border:1px solid ' + (hasProof ? '#bae6fd' : '#cbd5e1') + ';padding:4px 8px;border-radius:4px;font-size:11.5px;font-weight:600;cursor:pointer;max-width:130px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="' + (hasProof ? E(proofFile.fileName) : 'Upload Proof') + '">' +
        (hasProof ? '📎 ' + E(proofFile.fileName) : '📁 Upload Proof') +
      '</button>' +
      (hasProof && proofFile.fileData ? ' <button type="button" class="btn-view-proof" data-filename="' + E(proofFile.fileName) + '" data-filedata="' + E(proofFile.fileData) + '" style="background:none;border:none;color:#0284c7;cursor:pointer;font-size:12px;" title="Preview Proof">👁️</button>' : '') +
    '</td>';
  }

  function confTR(r, i) {
    return '<tr><td style="padding:5px;border:1px solid #e2e8f0;text-align:center;">' + (i+1) + '</td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="conf-title" value="' + E(r.title) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="conf-authors" value="' + E(r.authors) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="conf-name" value="' + E(r.name) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="conf-org" value="' + E(r.organizedBy) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="conf-isbn" value="' + E(r.isbn || r.publisher) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="conf-date" value="' + E(r.monthYear) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      proofControlCell(r.proofFile) +
      '<td style="padding:5px;border:1px solid #e2e8f0;text-align:center;"><button type="button" onclick="this.closest(\'tr\').remove()" style="color:#ef4444;border:none;background:none;cursor:pointer;font-weight:700;font-size:14px;">✕</button></td></tr>';
  }

  function jnlTR(r, i) {
    return '<tr><td style="padding:5px;border:1px solid #e2e8f0;text-align:center;">' + (i+1) + '</td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="jnl-title" value="' + E(r.title) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="jnl-authors" value="' + E(r.authors) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="jnl-details" value="' + E(r.details) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="jnl-indexed" value="' + E(r.indexedIn) + '" style="width:80px;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="jnl-quartile" value="' + E(r.quartile) + '" style="width:50px;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="jnl-issn" value="' + E(r.issnDate) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="jnl-status" value="' + E(r.status) + '" style="width:90px;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      proofControlCell(r.proofFile) +
      '<td style="padding:5px;border:1px solid #e2e8f0;text-align:center;"><button type="button" onclick="this.closest(\'tr\').remove()" style="color:#ef4444;border:none;background:none;cursor:pointer;font-weight:700;font-size:14px;">✕</button></td></tr>';
  }

  function patTR(r, i) {
    return '<tr><td style="padding:5px;border:1px solid #e2e8f0;text-align:center;">' + (i+1) + '</td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="pat-title" value="' + E(r.title) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="pat-inventor" value="' + E(r.inventor) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="pat-applicant" value="' + E(r.applicant) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="pat-appno" value="' + E(r.appNo) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="pat-date" value="' + E(r.monthYear) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="pat-status" value="' + E(r.status) + '" style="width:90px;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      proofControlCell(r.proofFile) +
      '<td style="padding:5px;border:1px solid #e2e8f0;text-align:center;"><button type="button" onclick="this.closest(\'tr\').remove()" style="color:#ef4444;border:none;background:none;cursor:pointer;font-weight:700;font-size:14px;">✕</button></td></tr>';
  }

  function dailyTR(r, i) {
    return '<tr><td style="padding:5px;border:1px solid #e2e8f0;text-align:center;">' + (i+1) + '</td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="daily-date" value="' + E(r.date) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" placeholder="DD/MM/YYYY" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="daily-desc" value="' + E(r.description) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;"><input type="text" class="daily-remarks" value="' + E(r.remarks) + '" style="width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:3px;" /></td>' +
      '<td style="padding:5px;border:1px solid #e2e8f0;text-align:center;"><button type="button" onclick="this.closest(\'tr\').remove()" style="color:#ef4444;border:none;background:none;cursor:pointer;font-weight:700;font-size:14px;">✕</button></td></tr>';
  }

  // Collect form values including proofFile attachments
  function collectForm(report, scholar, targetStatus) {
    function g(id) { var el = document.getElementById(id); return el ? el.value : ''; }

    var workload = [];
    document.querySelectorAll('#tbody-workload tr').forEach(function(tr, i) {
      workload.push({ sno: i+1, year: tr.querySelector('.wl-year') ? tr.querySelector('.wl-year').value : '', course: tr.querySelector('.wl-course') ? tr.querySelector('.wl-course').value : '', branchSem: tr.querySelector('.wl-branch') ? tr.querySelector('.wl-branch').value : '', theoryLab: tr.querySelector('.wl-type') ? tr.querySelector('.wl-type').value : '', role: tr.querySelector('.wl-role') ? tr.querySelector('.wl-role').value : '', hoursPerWeek: parseInt(tr.querySelector('.wl-hours') ? tr.querySelector('.wl-hours').value : 0) || 0 });
    });

    var conf = [];
    document.querySelectorAll('#tbody-conf tr').forEach(function(tr, i) {
      var existingProof = report.conferencePubsTable && report.conferencePubsTable[i] ? report.conferencePubsTable[i].proofFile : null;
      var proof = tr._proofFile || existingProof || null;
      conf.push({ sno: i+1, title: tr.querySelector('.conf-title') ? tr.querySelector('.conf-title').value : '', authors: tr.querySelector('.conf-authors') ? tr.querySelector('.conf-authors').value : '', name: tr.querySelector('.conf-name') ? tr.querySelector('.conf-name').value : '', organizedBy: tr.querySelector('.conf-org') ? tr.querySelector('.conf-org').value : '', isbn: tr.querySelector('.conf-isbn') ? tr.querySelector('.conf-isbn').value : '', monthYear: tr.querySelector('.conf-date') ? tr.querySelector('.conf-date').value : '', proofFile: proof });
    });

    var jnl = [];
    document.querySelectorAll('#tbody-journal tr').forEach(function(tr, i) {
      var existingProof = report.journalPubsTable && report.journalPubsTable[i] ? report.journalPubsTable[i].proofFile : null;
      var proof = tr._proofFile || existingProof || null;
      jnl.push({ sno: i+1, title: tr.querySelector('.jnl-title') ? tr.querySelector('.jnl-title').value : '', authors: tr.querySelector('.jnl-authors') ? tr.querySelector('.jnl-authors').value : '', details: tr.querySelector('.jnl-details') ? tr.querySelector('.jnl-details').value : '', indexedIn: tr.querySelector('.jnl-indexed') ? tr.querySelector('.jnl-indexed').value : '', quartile: tr.querySelector('.jnl-quartile') ? tr.querySelector('.jnl-quartile').value : '', issnDate: tr.querySelector('.jnl-issn') ? tr.querySelector('.jnl-issn').value : '', status: tr.querySelector('.jnl-status') ? tr.querySelector('.jnl-status').value : '', proofFile: proof });
    });

    var pat = [];
    document.querySelectorAll('#tbody-patent tr').forEach(function(tr, i) {
      var existingProof = report.patentPubsTable && report.patentPubsTable[i] ? report.patentPubsTable[i].proofFile : null;
      var proof = tr._proofFile || existingProof || null;
      pat.push({ sno: i+1, title: tr.querySelector('.pat-title') ? tr.querySelector('.pat-title').value : '', inventor: tr.querySelector('.pat-inventor') ? tr.querySelector('.pat-inventor').value : '', applicant: tr.querySelector('.pat-applicant') ? tr.querySelector('.pat-applicant').value : '', appNo: tr.querySelector('.pat-appno') ? tr.querySelector('.pat-appno').value : '', monthYear: tr.querySelector('.pat-date') ? tr.querySelector('.pat-date').value : '', status: tr.querySelector('.pat-status') ? tr.querySelector('.pat-status').value : '', proofFile: proof });
    });

    var daily = [];
    document.querySelectorAll('#tbody-daily tr').forEach(function(tr, i) {
      daily.push({ sno: i+1, date: tr.querySelector('.daily-date') ? tr.querySelector('.daily-date').value : '', description: tr.querySelector('.daily-desc') ? tr.querySelector('.daily-desc').value : '', remarks: tr.querySelector('.daily-remarks') ? tr.querySelector('.daily-remarks').value : '' });
    });

    var history = report.approvalHistory ? report.approvalHistory.slice() : [];
    if (targetStatus === 'SUBMITTED_TO_SUPERVISOR') {
      history.push({ role: 'scholar', roleLabel: 'Research Scholar', name: scholar.name, action: 'Submitted Monthly Report cum Fellowship Claim Form', remarks: 'Submitted for Supervisor Review', prevStatus: report.status, newStatus: 'SUBMITTED_TO_SUPERVISOR', timestamp: new Date().toLocaleString() });
    }

    return Object.assign({}, report, {
      scholarName: g('f_scholarName') || report.scholarName,
      expansionOfInitial: g('f_expansionOfInitial'),
      registrationDate: g('f_registrationDate'),
      supervisorName: g('f_supervisorName') || report.supervisorName,
      department: g('f_department') || report.department,
      phdTopic: g('f_phdTopic') || report.phdTopic,
      isFundedProject: g('f_isFundedProject'),
      jrfSrfStatus: g('f_jrfSrfStatus'),
      fundingAgency: g('f_fundingAgency'),
      projectTitle: g('f_projectTitle'),
      principalInvestigator: g('f_principalInvestigator'),
      monthYear: g('f_monthYear') || report.monthYear,
      period: g('f_period') || report.period,
      fellowshipAmount: g('f_fellowshipAmount') || report.fellowshipAmount,
      fellowshipReceivedFromMonthYear: g('f_fellowshipReceivedFromMonthYear'),
      wasFellowshipRevised: g('f_wasFellowshipRevised'),
      revisedFellowshipAmount: g('f_revisedFellowshipAmount'),
      revisedFellowshipReceivedFrom: g('f_revisedFellowshipReceivedFrom'),
      courseworkAllotted: parseInt(g('f_courseworkAllotted')) || 0,
      courseworkCompleted: parseInt(g('f_courseworkCompleted')) || 0,
      comprehensiveVivaCompleted: g('f_comprehensiveVivaCompleted'),
      comprehensiveVivaDate: g('f_comprehensiveVivaDate'),
      scopusId: g('f_scopusId'),
      orcidId: g('f_orcidId'),
      isScopusLinkedToOrcid: g('f_isScopusLinkedToOrcid'),
      noOfConferencePubs: parseInt(g('f_noOfConferencePubs')) || 0,
      noOfJournalPubsScopus: parseInt(g('f_noOfJournalPubsScopus')) || 0,
      noOfJournalPubsWos: parseInt(g('f_noOfJournalPubsWos')) || 0,
      noOfJournalPubsSci: parseInt(g('f_noOfJournalPubsSci')) || 0,
      noOfJournalPubsOthers: parseInt(g('f_noOfJournalPubsOthers')) || 0,
      noOfNonIndexedPubs: parseInt(g('f_noOfNonIndexedPubs')) || 0,
      probableThesisSubmissionMonthYear: g('f_probableThesisSubmissionMonthYear'),
      researchProgress: g('f_researchProgress').split('\n').map(function(s){return s.trim();}).filter(Boolean),
      academicWorkload: g('f_academicWorkload').split('\n').map(function(s){return s.trim();}).filter(Boolean),
      specificOutcomes: g('f_specificOutcomes'),
      status: targetStatus,
      statusLabel: STATUS_LABELS[targetStatus] || targetStatus,
      submittedDate: targetStatus === 'SUBMITTED_TO_SUPERVISOR' ? new Date().toISOString().split('T')[0] : report.submittedDate,
      academicWorkloadTable: workload,
      conferencePubsTable: conf,
      journalPubsTable: jnl,
      patentPubsTable: pat,
      dailyReportTable: daily,
      approvalHistory: history
    });
  }

  function addRow(tbodyId, template) {
    var tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    var i = tbody.children.length;
    var tr = document.createElement('tr');
    tr.innerHTML = template({}, i);
    tbody.appendChild(tr);
    bindProofUploadRow(tr);
  }

  // Bind file upload events for a row
  function bindProofUploadRow(tr) {
    var triggerBtn = tr.querySelector('.btn-trigger-upload');
    var fileInput = tr.querySelector('.proof-file-input');
    if (!triggerBtn || !fileInput) return;
    triggerBtn.addEventListener('click', function() {
      fileInput.click();
    });

    fileInput.addEventListener('change', function() {
      var file = fileInput.files[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        toast('File size exceeds 10MB limit.', '#be123c');
        return;
      }
      var reader = new FileReader();
      reader.onload = function(e) {
        tr._proofFile = {
          fileName: file.name,
          fileType: file.type,
          fileData: e.target.result
        };
        triggerBtn.innerHTML = '📎 ' + E(file.name);
        triggerBtn.style.background = '#e0f2fe';
        triggerBtn.style.color = '#0369a1';
        triggerBtn.style.borderColor = '#bae6fd';
        triggerBtn.title = file.name;
        toast('📎 Proof attached: ' + file.name, '#0284c7');
      };
      reader.readAsDataURL(file);
    });
  }

  // ════════════════════════════════════════════════════════════════
  // SUPERVISOR DASHBOARD
  // ════════════════════════════════════════════════════════════════
  function renderSupervisorDashboard(user) {
    var DATA = global.SCHOLAR_REPORTS_DATA;
    var sup = DATA ? DATA.getSupervisorById(user.id || user.employeeId) : null;
    var scholars = DATA && sup ? DATA.getScholarsForSupervisor(sup.id) : [];
    var allReports = DATA && sup ? DATA.getReportsForSupervisor(sup.id) : [];
    
    var monthlyReports = allReports.filter(function(r) { return r.reportType !== 'DAY8' && r.reportType !== 'DAILY'; });
    var day8Reports = allReports.filter(function(r) { return r.reportType === 'DAY8' || r.reportType === 'DAILY'; });

    var pendingM = monthlyReports.filter(function(r){ return r.status === 'SUBMITTED_TO_SUPERVISOR'; });
    var pendingD = day8Reports.filter(function(r){ return r.status === 'SUBMITTED_TO_SUPERVISOR'; });

    function makeSupervisorRows(list, actionSuffix) {
      return list.filter(function(r) {
        return ['SUBMITTED_TO_SUPERVISOR','SUPERVISOR_APPROVED','HOD_APPROVED','VERIFIED','RETURNED_TO_SCHOLAR'].indexOf(r.status) !== -1;
      }).map(function(r) {
        return '<tr>' +
          '<td style="padding:9px 12px;border:1px solid #e2e8f0;font-weight:700;color:#0f172a;">' + E(r.scholarName) + '</td>' +
          '<td style="padding:9px 12px;border:1px solid #e2e8f0;font-size:12px;color:#475569;">' + E(r.department) + '</td>' +
          '<td style="padding:9px 12px;border:1px solid #e2e8f0;font-weight:600;">' + E(r.monthYear) + '</td>' +
          '<td style="padding:9px 12px;border:1px solid #e2e8f0;">' + statusBadge(r.status) + '</td>' +
          '<td style="padding:9px 12px;border:1px solid #e2e8f0;">' +
            '<button data-action="' + actionSuffix + '" data-reportid="' + E(r.id) + '" style="background:' + (r.status === 'SUBMITTED_TO_SUPERVISOR' ? '#0284c7' : '#f1f5f9') + ';color:' + (r.status === 'SUBMITTED_TO_SUPERVISOR' ? '#fff' : '#334155') + ';border:' + (r.status === 'SUBMITTED_TO_SUPERVISOR' ? 'none' : '1px solid #cbd5e1') + ';border-radius:5px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;">' +
              (r.status === 'SUBMITTED_TO_SUPERVISOR' ? 'Review & Approve 🔍' : 'View Report 📄') +
            '</button>' +
          '</td>' +
        '</tr>';
      }).join('') || '<tr><td colspan="5" style="padding:20px;text-align:center;color:#94a3b8;">No submitted reports to review. Wait for scholar submissions.</td></tr>';
    }

    var reportRows = makeSupervisorRows(monthlyReports, 'sup-review');
    var day8Rows = makeSupervisorRows(day8Reports, 'sup-review-day8');

    return '<div style="padding-bottom:40px;font-family:sans-serif;">' +
      '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:20px;margin-bottom:20px;box-shadow:0 1px 4px rgba(0,0,0,0.05);">' +
        '<span style="display:inline-block;padding:3px 10px;border-radius:20px;background:#f0fdf4;color:#166534;font-size:11.5px;font-weight:700;margin-bottom:8px;">Research Supervisor Dashboard</span>' +
        '<h2 style="margin:4px 0;font-size:20px;color:#0f172a;font-weight:800;">' + E(sup ? sup.name : user.name) + '</h2>' +
        '<p style="margin:4px 0;font-size:13px;color:#475569;"><strong>Department:</strong> ' + E(user.department) + ' &nbsp;|&nbsp; <strong>Assigned Scholars:</strong> ' + scholars.length + '</p>' +
        '<p style="margin:8px 0 0 0;font-size:12px;color:#15803d;background:#f0fdf4;padding:6px 12px;border-radius:5px;border:1px solid #bbf7d0;display:inline-block;">🔒 Supervisor Scope: You can only see and approve reports from your assigned scholars.</p>' +
      '</div>' +

      
      // --- START INJECTED ASSIGNED SCHOLARS TABLE ---
      (function() {
        var html = '';
        if (scholars.length > 0) {
          html += '<div style="background:#fff;border-radius:10px;border:1px solid #cbd5e1;box-shadow:0 1px 4px rgba(0,0,0,0.05);padding:20px;margin-bottom:20px;">' +
            '<h3 style="margin:0 0 16px;font-size:16px;color:#0f172a;">Assigned Research Scholars</h3>' +
            '<div style="overflow-x:auto;">' +
              '<table style="width:100%;border-collapse:collapse;text-align:left;">' +
                '<thead>' +
                  '<tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;font-size:13px;color:#475569;text-transform:uppercase;">' +
                    '<th style="padding:10px 12px;font-weight:700;">S.No</th>' +
                    '<th style="padding:10px 12px;font-weight:700;">Scholar Name</th>' +
                    '<th style="padding:10px 12px;font-weight:700;">Department</th>' +
                    '<th style="padding:10px 12px;font-weight:700;">Registration Date</th>' +
                  '</tr>' +
                '</thead>' +
                '<tbody>';
          
          scholars.forEach(function(s, index) {
            html += '<tr style="border-bottom:1px solid #e2e8f0;">' +
              '<td style="padding:10px 12px;color:#64748b;">' + (index + 1) + '</td>' +
              '<td style="padding:10px 12px;font-weight:700;color:#0f172a;">' + E(s.name) + '</td>' +
              '<td style="padding:10px 12px;color:#475569;">' + E(s.department) + '</td>' +
              '<td style="padding:10px 12px;color:#475569;">' + E(s.registrationDate) + '</td>' +
            '</tr>';
          });

          html += '</tbody></table></div></div>';
        } else {
          html += '<div style="background:#fff;border-radius:10px;border:1px solid #cbd5e1;padding:20px;margin-bottom:20px;color:#64748b;text-align:center;">No scholars assigned.</div>';
        }
        return html;
      })() +
      // --- END INJECTED ASSIGNED SCHOLARS TABLE ---

      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-bottom:20px;">' +
        kpiCard('Assigned Scholars', scholars.length, 'Under Supervision') +
        kpiCard('Pending Monthly Claims', pendingM.length, 'Action Required', pendingM.length > 0 ? STATUS_COLORS['SUBMITTED_TO_SUPERVISOR'] : null) +
        kpiCard('Pending Daily Reports', pendingD.length, 'Action Required', pendingD.length > 0 ? STATUS_COLORS['SUBMITTED_TO_SUPERVISOR'] : null) +
        kpiCard('Total Scholars Reports', allReports.length, 'Submitted Forms') +
      '</div>' +

      '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.05);">' +
        
        // Tabs
        '<div style="display:flex;gap:12px;border-bottom:2px solid #e2e8f0;padding-bottom:12px;margin-bottom:16px;">' +
          '<button id="tab-monthly" style="background:#0284c7;color:#fff;border:none;border-radius:6px;padding:8px 16px;font-weight:700;font-size:13px;cursor:pointer;box-shadow:0 2px 6px rgba(2,132,199,0.2);">Monthly Claims</button>' +
          '<button id="tab-daily" style="background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;border-radius:6px;padding:8px 16px;font-weight:700;font-size:13px;cursor:pointer;">Daily Reports</button>' +
        '</div>' +

        '<div id="section-monthly">' +
          '<h3 style="margin:0 0 14px 0;font-size:16px;color:#0f172a;font-weight:700;">Scholar Monthly Report Submissions</h3>' +
          '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;">' +
            '<thead><tr style="background:#f8fafc;">' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Scholar Name</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Department</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Month & Year</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Status</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Action</th>' +
            '</tr></thead>' +
            '<tbody>' + reportRows + '</tbody>' +
          '</table></div>' +
        '</div>' +

        '<div id="section-daily" style="display:none;">' +
          '<h3 style="margin:0 0 14px 0;font-size:16px;color:#0f172a;font-weight:700;">Scholar Daily Report Submissions</h3>' +
          '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;">' +
            '<thead><tr style="background:#f8fafc;">' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Scholar Name</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Department</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Month & Year</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Status</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Action</th>' +
            '</tr></thead>' +
            '<tbody>' + day8Rows + '</tbody>' +
          '</table></div>' +
        '</div>' +

      '</div>' +
    '</div>';
  }

  function renderSupervisorReviewPanel(report, user) {
    return '<div style="max-width:960px;margin:0 auto;padding-bottom:40px;">' +
      '<div style="background:#fff;border:1.5px solid #0284c7;border-radius:10px;padding:12px 20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;box-shadow:0 4px 12px rgba(2,132,199,0.12);">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<button id="btn-review-back" style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:6px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;">← Back</button>' +
          '<span id="review-status-span" style="font-size:13px;color:#334155;"><strong>' + E(report.scholarName) + '</strong> — ' + E(report.monthYear) + ' &nbsp; ' + statusBadge(report.status) + '</span>' +
        '</div>' +
        
      '</div>' +

      (report.status === 'SUBMITTED_TO_SUPERVISOR'
        ? '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:16px;margin-bottom:16px;">' +
            '<label for="sup-remarks" style="font-size:13px;font-weight:700;color:#0f172a;display:block;margin-bottom:6px;">Supervisor Remarks / Recommendation:</label>' +
            '<textarea id="sup-remarks" rows="3" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-family:inherit;font-size:13px;box-sizing:border-box;" placeholder="Enter verification remarks and recommendations..."></textarea>' +
          '</div>'
        : ''
      ) +

      '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">' +
        renderReportReadOnly(report, user.role) +
      '</div>' +
      '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;display:flex;justify-content:flex-end;margin-top:20px;">' +
        '<div id="review-action-area">' +
        (report.status === 'SUBMITTED_TO_SUPERVISOR'
          ? '<div style="display:flex;align-items:center;gap:10px;">' +
              '<button type="button" id="btn-sup-approve" style="background:#15803d;color:#fff;border:none;border-radius:6px;padding:8.5px 20px;font-size:13px;font-weight:700;cursor:pointer;">✅ Approve & Forward to HOD</button>' +
              '<button type="button" id="btn-sup-reject" style="background:#be123c;color:#fff;border:none;border-radius:6px;padding:8.5px 16px;font-size:13px;font-weight:700;cursor:pointer;">❌ Reject & Return</button>' +
            '</div>'
          : renderReviewActionBarButtons(report.status)
        ) +
        '</div>' + '</div>' +
    '</div>';
  }

  // ════════════════════════════════════════════════════════════════
  // HOD DASHBOARD
  // ════════════════════════════════════════════════════════════════
  function renderHODScholarDashboard(user) {
    var DATA = global.SCHOLAR_REPORTS_DATA;
    var dept = user.department || '';
    var reports = DATA ? DATA.getReportsForHOD(dept) : [];

    var monthlyReports = reports.filter(function(r) { return r.reportType !== 'DAY8' && r.reportType !== 'DAILY'; });
    var day8Reports = reports.filter(function(r) { return r.reportType === 'DAY8' || r.reportType === 'DAILY'; });

    var pendingM = monthlyReports.filter(function(r){ return r.status === 'SUPERVISOR_APPROVED'; });
    var pendingD = day8Reports.filter(function(r){ return r.status === 'SUPERVISOR_APPROVED'; });

    function makeHODRows(list, actionSuffix) {
      return list.map(function(r) {
        return '<tr>' +
          '<td style="padding:9px 12px;border:1px solid #e2e8f0;font-weight:700;color:#0f172a;">' + E(r.scholarName) + '</td>' +
          '<td style="padding:9px 12px;border:1px solid #e2e8f0;font-size:12px;">' + E(r.supervisorName) + '</td>' +
          '<td style="padding:9px 12px;border:1px solid #e2e8f0;font-weight:600;">' + E(r.monthYear) + '</td>' +
          '<td style="padding:9px 12px;border:1px solid #e2e8f0;">' + statusBadge(r.status) + '</td>' +
          '<td style="padding:9px 12px;border:1px solid #e2e8f0;">' +
            '<button data-action="' + actionSuffix + '" data-reportid="' + E(r.id) + '" style="background:' + (r.status === 'SUPERVISOR_APPROVED' ? '#0284c7' : '#f1f5f9') + ';color:' + (r.status === 'SUPERVISOR_APPROVED' ? '#fff' : '#334155') + ';border:' + (r.status === 'SUPERVISOR_APPROVED' ? 'none' : '1px solid #cbd5e1') + ';border-radius:5px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;">' +
              (r.status === 'SUPERVISOR_APPROVED' ? 'Review & Approve 🔍' : 'View Report 📄') +
            '</button>' +
          '</td>' +
        '</tr>';
      }).join('') || '<tr><td colspan="5" style="padding:20px;text-align:center;color:#94a3b8;">No reports from your department have reached HOD review stage yet.</td></tr>';
    }

    var tableRows = makeHODRows(monthlyReports, 'hod-review');
    var day8Rows = makeHODRows(day8Reports, 'hod-review-day8');

    return '<div style="padding-bottom:40px;font-family:sans-serif;">' +
      '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:20px;margin-bottom:20px;box-shadow:0 1px 4px rgba(0,0,0,0.05);">' +
        '<span style="display:inline-block;padding:3px 10px;border-radius:20px;background:#eff6ff;color:#1d4ed8;font-size:11.5px;font-weight:700;margin-bottom:8px;">HOD — Research Scholar Monthly Reports</span>' +
        '<h2 style="margin:4px 0;font-size:20px;color:#0f172a;font-weight:800;">' + E(user.name) + '</h2>' +
        '<p style="margin:4px 0;font-size:13px;color:#475569;"><strong>Department:</strong> ' + E(dept) + '</p>' +
        '<p style="margin:8px 0 0 0;font-size:12px;color:#1d4ed8;background:#eff6ff;padding:6px 12px;border-radius:5px;border:1px solid #bfdbfe;display:inline-block;">🔒 HOD Scope: Showing Supervisor-Approved reports from your department only.</p>' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-bottom:20px;">' +
        kpiCard('Pending HOD Monthly', pendingM.length, 'Supervisor Approved', pendingM.length > 0 ? STATUS_COLORS['SUPERVISOR_APPROVED'] : null) +
        kpiCard('Pending HOD Daily', pendingD.length, 'Supervisor Approved', pendingD.length > 0 ? STATUS_COLORS['SUPERVISOR_APPROVED'] : null) +
        kpiCard('Total Claims/Reports', reports.length, 'In ' + E(dept)) +
      '</div>' +

      '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.05);">' +
        
        // Tabs
        '<div style="display:flex;gap:12px;border-bottom:2px solid #e2e8f0;padding-bottom:12px;margin-bottom:16px;">' +
          '<button id="tab-monthly" style="background:#0284c7;color:#fff;border:none;border-radius:6px;padding:8px 16px;font-weight:700;font-size:13px;cursor:pointer;box-shadow:0 2px 6px rgba(2,132,199,0.2);">Monthly Claims</button>' +
          '<button id="tab-daily" style="background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;border-radius:6px;padding:8px 16px;font-weight:700;font-size:13px;cursor:pointer;">Daily Reports</button>' +
        '</div>' +

        '<div id="section-monthly">' +
          '<h3 style="margin:0 0 14px 0;font-size:16px;color:#0f172a;font-weight:700;">Monthly Fellowship Claims — ' + E(dept) + ' Department</h3>' +
          '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;">' +
            '<thead><tr style="background:#f8fafc;">' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Scholar Name</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Supervisor</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Month & Year</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Status</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Action</th>' +
            '</tr></thead>' +
            '<tbody>' + tableRows + '</tbody>' +
          '</table></div>' +
        '</div>' +

        '<div id="section-daily" style="display:none;">' +
          '<h3 style="margin:0 0 14px 0;font-size:16px;color:#0f172a;font-weight:700;">Daily Reports — ' + E(dept) + ' Department</h3>' +
          '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;">' +
            '<thead><tr style="background:#f8fafc;">' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Scholar Name</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Supervisor</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Month & Year</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Status</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Action</th>' +
            '</tr></thead>' +
            '<tbody>' + day8Rows + '</tbody>' +
          '</table></div>' +
        '</div>' +

      '</div>' +
    '</div>';
  }

  function renderHODReviewPanel(report, user) {
    return '<div style="max-width:960px;margin:0 auto;padding-bottom:40px;">' +
      '<div style="background:#fff;border:1.5px solid #0284c7;border-radius:10px;padding:12px 20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;box-shadow:0 4px 12px rgba(2,132,199,0.12);">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<button id="btn-hod-review-back" style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:6px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;">← Back</button>' +
          '<span id="review-status-span" style="font-size:13px;color:#334155;"><strong>' + E(report.scholarName) + '</strong> — ' + E(report.monthYear) + ' &nbsp; ' + statusBadge(report.status) + '</span>' +
        '</div>' +
        
      '</div>' +
      (report.status === 'SUPERVISOR_APPROVED'
        ? '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:16px;margin-bottom:16px;">' +
            '<label for="hod-remarks" style="font-size:13px;font-weight:700;color:#0f172a;display:block;margin-bottom:6px;">HOD Remarks:</label>' +
            '<textarea id="hod-remarks" rows="3" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-family:inherit;font-size:13px;box-sizing:border-box;" placeholder="Enter HOD approval remarks..."></textarea>' +
          '</div>'
        : ''
      ) +
      '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">' +
        renderReportReadOnly(report, user.role) +
      '</div>' +
      '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;display:flex;justify-content:flex-end;margin-top:20px;">' +
        '<div id="review-action-area">' +
        (report.status === 'SUPERVISOR_APPROVED'
          ? '<div style="display:flex;align-items:center;gap:10px;">' +
              '<button type="button" id="btn-hod-approve" style="background:#15803d;color:#fff;border:none;border-radius:6px;padding:8.5px 20px;font-size:13px;font-weight:700;cursor:pointer;">✅ Approve & Forward to Deputy Dean</button>' +
              '<button type="button" id="btn-hod-reject" style="background:#be123c;color:#fff;border:none;border-radius:6px;padding:8.5px 16px;font-size:13px;font-weight:700;cursor:pointer;">❌ Reject & Return</button>' +
            '</div>'
          : renderReviewActionBarButtons(report.status)
        ) +
        '</div>' + '</div>' +
    '</div>';
  }

  // ════════════════════════════════════════════════════════════════
  // DEAN & DEPUTY DEAN DASHBOARD
  // ════════════════════════════════════════════════════════════════
  function renderDeanLevelDashboard(user) {
    var isDean = user.role === 'dean';
    var targetStatus = isDean ? 'DEPUTY_DEAN_APPROVED' : 'HOD_APPROVED';
    var labelRole = isDean ? 'Dean' : 'Deputy Dean';
    var labelStatus = isDean ? 'Deputy Dean Approved' : 'HOD Approved';

    var DATA = global.SCHOLAR_REPORTS_DATA;
    var reports = DATA ? DATA.getReportsForDeputyDean(user.group) : [];
    var scholars = DATA ? DATA.getAllScholars() : []; // Could filter by group if needed
    var supervisors = DATA ? DATA.getAllSupervisors() : [];

    var monthlyReports = reports.filter(function(r) { return r.reportType !== 'DAY8' && r.reportType !== 'DAILY'; });
    var day8Reports = reports.filter(function(r) { return r.reportType === 'DAY8' || r.reportType === 'DAILY'; });

    var pendingM = monthlyReports.filter(function(r){ return r.status === targetStatus; });
    var pendingD = day8Reports.filter(function(r){ return r.status === targetStatus; });

    function makeDDRows(list, actionSuffix, showClaim) {
      return list.map(function(r) {
        var claimCol = showClaim ? '<td style="padding:9px 12px;border:1px solid #e2e8f0;font-weight:600;color:#059669;">₹' + E(r.fellowshipAmount) + '</td>' : '';
        return '<tr>' +
          '<td style="padding:9px 12px;border:1px solid #e2e8f0;font-weight:700;color:#0f172a;">' + E(r.scholarName) + '</td>' +
          '<td style="padding:9px 12px;border:1px solid #e2e8f0;font-size:12px;">' + E(r.department) + '</td>' +
          '<td style="padding:9px 12px;border:1px solid #e2e8f0;font-size:12px;">' + E(r.supervisorName) + '</td>' +
          '<td style="padding:9px 12px;border:1px solid #e2e8f0;font-weight:600;">' + E(r.monthYear) + '</td>' +
          claimCol +
          '<td style="padding:9px 12px;border:1px solid #e2e8f0;">' + statusBadge(r.status) + '</td>' +
          '<td style="padding:9px 12px;border:1px solid #e2e8f0;">' +
            '<button data-action="' + actionSuffix + '" data-reportid="' + E(r.id) + '" style="background:' + (r.status === targetStatus ? '#0284c7' : '#f1f5f9') + ';color:' + (r.status === targetStatus ? '#fff' : '#334155') + ';border:' + (r.status === targetStatus ? 'none' : '1px solid #cbd5e1') + ';border-radius:5px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;">' +
              (r.status === targetStatus ? (isDean ? 'Verify & Finalize 🔍' : 'Review & Approve 🔍') : 'View Report 📄') +
            '</button>' +
          '</td>' +
        '</tr>';
      }).join('') || '<tr><td colspan="7" style="padding:20px;text-align:center;color:#94a3b8;">No reports have reached the ' + labelRole + ' stage yet.</td></tr>';
    }

    var tableRows = makeDDRows(monthlyReports, 'ddr-review', true);
    var day8Rows = makeDDRows(day8Reports, 'ddr-review-day8', false);

    return '<div style="padding-bottom:40px;font-family:sans-serif;">' +
      '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:20px;margin-bottom:20px;box-shadow:0 1px 4px rgba(0,0,0,0.05);">' +
        '<span style="display:inline-block;padding:3px 10px;border-radius:20px;background:#fae8ff;color:#86198f;font-size:11.5px;font-weight:700;margin-bottom:8px;">' + user.group + ' · ' + labelRole + '</span>' +
        '<h2 style="margin:4px 0;font-size:20px;color:#0f172a;font-weight:800;">Research Scholar Monthly Reports & Fellowship Claims Overview</h2>' +
        '<p style="margin:4px 0;font-size:13px;color:#475569;">Institutional monitoring of Full-Time PhD scholars — ' + (isDean ? 'final approval stage' : 'preliminary group approval') + ' for fellowship disbursement.</p>' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-bottom:20px;">' +
        kpiCard('Total Scholars', scholars.length, 'Full-Time PhD') +
        kpiCard('Active Supervisors', supervisors.length, 'Registered') +
        kpiCard('Pending Monthly', pendingM.length, labelStatus, pendingM.length > 0 ? STATUS_COLORS[targetStatus] : null) +
        kpiCard('Pending Daily Reports', pendingD.length, labelStatus, pendingD.length > 0 ? STATUS_COLORS[targetStatus] : null) +
      '</div>' +

      '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.05);">' +
        
        // Tabs
        '<div style="display:flex;gap:12px;border-bottom:2px solid #e2e8f0;padding-bottom:12px;margin-bottom:16px;">' +
          '<button id="tab-monthly" style="background:#0284c7;color:#fff;border:none;border-radius:6px;padding:8px 16px;font-weight:700;font-size:13px;cursor:pointer;box-shadow:0 2px 6px rgba(2,132,199,0.2);">Monthly Claims</button>' +
          '<button id="tab-daily" style="background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;border-radius:6px;padding:8px 16px;font-weight:700;font-size:13px;cursor:pointer;">Daily Reports</button>' +
        '</div>' +

        '<div id="section-monthly">' +
          '<h3 style="margin:0 0 14px 0;font-size:16px;color:#0f172a;font-weight:700;">Master Fellowship Claim Audit Register</h3>' +
          '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;">' +
            '<thead><tr style="background:#f8fafc;">' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Scholar</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Department</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Supervisor</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Month</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Claim</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Status</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Action</th>' +
            '</tr></thead>' +
            '<tbody>' + tableRows + '</tbody>' +
          '</table></div>' +
        '</div>' +

        '<div id="section-daily" style="display:none;">' +
          '<h3 style="margin:0 0 14px 0;font-size:16px;color:#0f172a;font-weight:700;">Daily Reports Audit Register</h3>' +
          '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;">' +
            '<thead><tr style="background:#f8fafc;">' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Scholar</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Department</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Supervisor</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Month</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Status</th>' +
              '<th style="padding:9px 12px;border:1px solid #e2e8f0;text-align:left;">Action</th>' +
            '</tr></thead>' +
            '<tbody>' + day8Rows + '</tbody>' +
          '</table></div>' +
        '</div>' +

      '</div>' +
    '</div>';
  }

  function renderDeanLevelReviewPanel(report, user) {
    var isDean = user.role === 'dean';
    var targetStatus = isDean ? 'DEPUTY_DEAN_APPROVED' : 'HOD_APPROVED';
    var nextStatusLabel = isDean ? 'Verify & Finalize' : 'Approve & Submit to Dean';
    var remarksLabel = isDean ? 'Dean Remarks:' : 'Deputy Dean Remarks:';
    
    return '<div style="max-width:960px;margin:0 auto;padding-bottom:40px;">' +
      '<div style="background:#fff;border:1.5px solid #0284c7;border-radius:10px;padding:12px 20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;box-shadow:0 4px 12px rgba(2,132,199,0.12);">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<button id="btn-ddr-review-back" style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:6px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;">← Back</button>' +
          '<span id="review-status-span" style="font-size:13px;color:#334155;"><strong>' + E(report.scholarName) + '</strong> — ' + E(report.monthYear) + ' &nbsp; ' + statusBadge(report.status) + '</span>' +
        '</div>' +
        
      '</div>' +
      (report.status === targetStatus
        ? '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:16px;margin-bottom:16px;">' +
            '<label for="ddr-remarks" style="font-size:13px;font-weight:700;color:#0f172a;display:block;margin-bottom:6px;">' + remarksLabel + '</label>' +
            '<textarea id="ddr-remarks" rows="3" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;font-family:inherit;font-size:13px;box-sizing:border-box;" placeholder="Enter remarks..."></textarea>' +
          '</div>'
        : ''
      ) +
      '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">' +
        renderReportReadOnly(report, user.role) +
      '</div>' +
      '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;display:flex;justify-content:flex-end;margin-top:20px;">' +
        '<div id="review-action-area">' +
        (report.status === targetStatus
          ? '<div style="display:flex;align-items:center;gap:10px;">' +
              '<button type="button" id="btn-ddr-approve" style="background:#15803d;color:#fff;border:none;border-radius:6px;padding:8.5px 20px;font-size:13px;font-weight:700;cursor:pointer;">✅ ' + nextStatusLabel + '</button>' +
              '<button type="button" id="btn-ddr-reject" style="background:#be123c;color:#fff;border:none;border-radius:6px;padding:8.5px 16px;font-size:13px;font-weight:700;cursor:pointer;">❌ Reject & Return</button>' +
            '</div>'
          : renderReviewActionBarButtons(report.status)
        ) +
        '</div>' + '</div>' +
    '</div>';
  }

  // ════════════════════════════════════════════════════════════════
  // MAIN MOUNT FUNCTION
  // ════════════════════════════════════════════════════════════════
  function mount(user) {
    var appEl = document.getElementById('app');
    var titleEl = document.getElementById('page-title');
    if (!appEl) return;

    var DATA = global.SCHOLAR_REPORTS_DATA;
    var role = user.role;

    var currentView = 'dashboard';
    var currentReportId = null;

    function setTitle(t) { if (titleEl) titleEl.textContent = t; }

    function showDashboard() {
      currentView = 'dashboard';
      currentReportId = null;
      if (role === 'scholar') {
        setTitle('Research Scholar Portal · Monthly Report & Fellowship Claim');
        appEl.innerHTML = renderScholarDashboard(user);
        bindScholarDashboard();
      } else if (role === 'supervisor') {
        setTitle('Research Supervisor Portal · Scholar Claims Review');
        appEl.innerHTML = renderSupervisorDashboard(user);
        bindSupervisorDashboard();
      } else if (role === 'hod') {
        setTitle('HOD Portal · Research Scholar Monthly Reports — ' + (user.department || ''));
        appEl.innerHTML = renderHODScholarDashboard(user);
        bindHODDashboard();
      } else if (role === 'deputy_dean' || role === 'dean') {
        setTitle((role === 'dean' ? 'Dean' : 'Deputy Dean') + ' Portal · Research Scholar Monthly Reports (' + user.group + ')');
        appEl.innerHTML = renderDeanLevelDashboard(user);
        bindDeanLevelDashboard();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Tab switching binder
    function bindDashboardTabs() {
      var tabMonthly = document.getElementById('tab-monthly');
      var tabDay8 = document.getElementById('tab-daily') || document.getElementById('tab-day8');
      var secMonthly = document.getElementById('section-monthly');
      var secDay8 = document.getElementById('section-daily') || document.getElementById('section-day8');

      if (tabMonthly && tabDay8 && secMonthly && secDay8) {
        tabMonthly.style.cursor = 'pointer';
        tabDay8.style.cursor = 'pointer';

        tabMonthly.addEventListener('click', function() {
          tabMonthly.style.background = '#0284c7';
          tabMonthly.style.color = '#fff';
          tabMonthly.style.border = 'none';
          tabMonthly.style.boxShadow = '0 2px 6px rgba(2,132,199,0.2)';
          
          tabDay8.style.background = '#f1f5f9';
          tabDay8.style.color = '#475569';
          tabDay8.style.border = '1px solid #cbd5e1';
          tabDay8.style.boxShadow = 'none';

          secMonthly.style.display = 'block';
          secDay8.style.display = 'none';
        });

        tabDay8.addEventListener('click', function() {
          tabDay8.style.background = '#0284c7';
          tabDay8.style.color = '#fff';
          tabDay8.style.border = 'none';
          tabDay8.style.boxShadow = '0 2px 6px rgba(2,132,199,0.2)';
          
          tabMonthly.style.background = '#f1f5f9';
          tabMonthly.style.color = '#475569';
          tabMonthly.style.border = '1px solid #cbd5e1';
          tabMonthly.style.boxShadow = 'none';

          secDay8.style.display = 'block';
          secMonthly.style.display = 'none';
        });
      }
    }

    // ── Scholar Dashboard bindings
    function bindScholarDashboard() {
      bindDashboardTabs();

      var createBtn = document.getElementById('btn-create-report');
      if (createBtn) {
        createBtn.addEventListener('click', function() {
          var scholar = DATA.getScholarById(user.id || user.employeeId);
          if (!scholar) { toast('Scholar record not found.', '#be123c'); return; }
          var report = DATA.createBlankReport(scholar.id);
          currentReportId = report.id;
          DATA.saveReport(report);
          showForm(scholar, report);
        });
      }

      var createDailyBtn = document.getElementById('btn-create-daily-report') || document.getElementById('btn-create-day8-report');
      if (createDailyBtn) {
        createDailyBtn.addEventListener('click', function() {
          var scholar = DATA.getScholarById(user.id || user.employeeId);
          if (!scholar) { toast('Scholar record not found.', '#be123c'); return; }
          var report = DATA.createBlankDailyReport(scholar.id);
          currentReportId = report.id;
          DATA.saveReport(report);
          showDay8Form(scholar, report);
        });
      }

      appEl.querySelectorAll('[data-action="edit"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var rId = btn.dataset.reportid;
          var report = DATA.getReportById(rId);
          if (!report) return;
          var scholar = DATA.getScholarById(user.id || user.employeeId);
          currentReportId = rId;
          showForm(scholar, report);
        });
      });

      appEl.querySelectorAll('[data-action="view-read-only"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var rId = btn.dataset.reportid;
          var report = DATA.getReportById(rId);
          if (!report) return;
          showReadOnlyView(report);
        });
      });

      appEl.querySelectorAll('[data-action="download-pdf"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var rId = btn.dataset.reportid;
          var report = DATA.getReportById(rId);
          if (!report) return;
          printVerifiedReportPDF(report);
        });
      });

      // Daily Report actions
      appEl.querySelectorAll('[data-action="edit-day8"], [data-action="edit-daily"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var rId = btn.dataset.reportid;
          var report = DATA.getReportById(rId);
          if (!report) return;
          var scholar = DATA.getScholarById(user.id || user.employeeId);
          currentReportId = rId;
          showDay8Form(scholar, report);
        });
      });

      appEl.querySelectorAll('[data-action="view-day8"], [data-action="view-daily"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var rId = btn.dataset.reportid;
          var report = DATA.getReportById(rId);
          if (!report) return;
          showDay8ReadOnlyView(report);
        });
      });

      appEl.querySelectorAll('[data-action="download-daily-pdf"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var rId = btn.dataset.reportid;
          var report = DATA.getReportById(rId);
          if (!report) return;
          printDailyReportPDF(report);
        });
      });
    }

    // ── Read-only view for verified/submitted reports
    function showReadOnlyView(report) {
      currentView = 'read-only';
      var isScholar = user.role === 'scholar';
      setTitle('Monthly Report Form — ' + report.monthYear + ' (' + (STATUS_LABELS[report.status] || report.status) + ')');

      appEl.innerHTML = '<div style="max-width:960px;margin:0 auto;padding-bottom:40px;">' +
        '<div style="background:#fff;border:1.5px solid #0284c7;border-radius:10px;padding:12px 20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;box-shadow:0 4px 12px rgba(2,132,199,0.12);">' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<button id="btn-ro-back" style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:6px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;">← Back to Dashboard</button>' +
            '<span style="font-size:13px;color:#334155;"><strong>' + E(report.scholarName) + '</strong> — ' + E(report.monthYear) + ' &nbsp; ' + statusBadge(report.status) + '</span>' +
          '</div>' +
'</div>' +
        '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">' +
          renderReportReadOnly(report, user.role) +
        '</div>' +
        '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;display:flex;justify-content:flex-end;margin-top:20px;">' +
          renderScholarReadOnlyButtons(report) +
        '</div>' +
      '</div>';

      document.getElementById('btn-ro-back').addEventListener('click', showDashboard);
      var pdfBtn = document.getElementById('btn-ro-pdf');
      if (pdfBtn) {
        pdfBtn.addEventListener('click', function() {
          printVerifiedReportPDF(report);
        });
      }
      var readOnlyPrintBtn = document.getElementById('btn-print-read-only');
      if (readOnlyPrintBtn) {
        readOnlyPrintBtn.addEventListener('click', function() {
          printVerifiedReportPDF(report);
        });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ── Daily Report Read-only view
    function showDay8ReadOnlyView(report) {
      currentView = 'day8-read-only';
      var isScholar = user.role === 'scholar';
      setTitle('Daily Report — ' + report.monthYear + ' (' + (STATUS_LABELS[report.status] || report.status) + ')');

      appEl.innerHTML = '<div style="max-width:960px;margin:0 auto;padding-bottom:40px;font-family:sans-serif;">' +
        '<div style="background:#fff;border:1.5px solid #0284c7;border-radius:10px;padding:12px 20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;box-shadow:0 4px 12px rgba(2,132,199,0.12);">' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<button id="btn-ro-back" style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:6px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;">← Back to Dashboard</button>' +
            '<span style="font-size:13px;color:#334155;"><strong>' + E(report.scholarName) + '</strong> — Daily Report ' + E(report.monthYear) + ' &nbsp; ' + statusBadge(report.status) + '</span>' +
          '</div>' +
'</div>' +
        '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">' +
          renderDay8ReportReadOnly(report, user.role) +
        '</div>' +
        '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;display:flex;justify-content:flex-end;margin-top:20px;">' +
          renderScholarReadOnlyButtons(report) +
        '</div>' +
      '</div>';

      document.getElementById('btn-ro-back').addEventListener('click', showDashboard);
      var pdfBtn = document.getElementById('btn-ro-daily-pdf');
      if (pdfBtn) {
        pdfBtn.addEventListener('click', function() {
          printDailyReportPDF(report);
        });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ── Day 8 Edit Form
    function showDay8Form(scholar, report) {
      if (report.status !== 'DRAFT' && report.status !== 'RETURNED_TO_SCHOLAR') {
        showDay8ReadOnlyView(report);
        return;
      }
      currentView = 'day8-form';
      setTitle('Daily Report Form — ' + report.monthYear);
      appEl.innerHTML = renderDay8EditableForm(scholar, report);
      bindDay8Form(scholar, report);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function bindDay8Form(scholar, report) {
      document.getElementById('btn-form-back').addEventListener('click', showDashboard);

      document.getElementById('btn-add-daily-day8').addEventListener('click', function() {
        var tbody = document.getElementById('tbody-daily-day8');
        if (!tbody) return;
        var tr = document.createElement('tr');
        tr.innerHTML = day8DailyTR({ date: '', description: '', remarks: '' }, tbody.children.length);
        tbody.appendChild(tr);
      });

      document.getElementById('btn-save-draft').addEventListener('click', function(e) { if(e)e.preventDefault();
        var updated = collectDay8Form(report, scholar, 'DRAFT');
        DATA.saveReport(updated);
        toast('💾 Daily Report draft saved successfully!', '#0284c7');
        // setTimeout(showDashboard, 900); /* commented for verification */
      });

      document.getElementById('btn-submit-supervisor').addEventListener('click', function(e) { if(e)e.preventDefault();
        var updated = collectDay8Form(report, scholar, 'SUBMITTED_TO_SUPERVISOR');
        DATA.saveReport(updated);
        toast('🚀 Daily Report submitted to Supervisor successfully!', '#15803d');

        // Immediately update action bar to reflect submission
        var actionBar = document.getElementById('form-action-bar');
        if (actionBar) {
          actionBar.innerHTML =
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<button id="btn-form-back-after-submit" style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:6px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;">← Back to Dashboard</button>' +
              '<span style="font-size:12.5px;color:#64748b;">Editing: <strong style="color:#0f172a;">' + E(updated.monthYear) + '</strong> &nbsp; ' + statusBadge('SUBMITTED_TO_SUPERVISOR') + '</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<button disabled style="background:#15803d;color:#fff;border:none;border-radius:6px;padding:8.5px 20px;font-size:13px;font-weight:700;cursor:not-allowed;opacity:0.95;">✅ Submitted to Supervisor</button>' +
            '</div>';
          var backBtn2 = document.getElementById('btn-form-back-after-submit');
          if (backBtn2) backBtn2.addEventListener('click', showDashboard);
        }
        // setTimeout(showDashboard, 1500); /* commented for verification */
      });
    }

    // ── Editable form (Only for DRAFT & RETURNED_TO_SCHOLAR)
    function showForm(scholar, report) {
      if (report.status !== 'DRAFT' && report.status !== 'RETURNED_TO_SCHOLAR') {
        showReadOnlyView(report);
        return;
      }
      currentView = 'form';
      setTitle('Monthly Report Form — ' + report.monthYear);
      appEl.innerHTML = renderEditableForm(scholar, report);
      bindForm(scholar, report);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function bindForm(scholar, report) {
      document.getElementById('btn-form-back').addEventListener('click', showDashboard);

      document.getElementById('btn-add-workload').addEventListener('click', function() { addRow('tbody-workload', workloadTR); });
      document.getElementById('btn-add-conf').addEventListener('click', function() { addRow('tbody-conf', confTR); });
      document.getElementById('btn-add-journal').addEventListener('click', function() { addRow('tbody-journal', jnlTR); });
      document.getElementById('btn-add-patent').addEventListener('click', function() { addRow('tbody-patent', patTR); });
      document.getElementById('btn-add-daily').addEventListener('click', function() { addRow('tbody-daily', dailyTR); });

      // Bind upload file listeners on existing table rows
      document.querySelectorAll('#tbody-conf tr, #tbody-journal tr, #tbody-patent tr').forEach(function(tr) {
        bindProofUploadRow(tr);
      });

      document.getElementById('btn-save-draft').addEventListener('click', function(e) { if(e)e.preventDefault();
        var updated = collectForm(report, scholar, 'DRAFT');
        DATA.saveReport(updated);
        toast('💾 Draft saved successfully with proof files!', '#0284c7');
        // setTimeout(showDashboard, 900); /* commented for verification */
      });

      document.getElementById('btn-submit-supervisor').addEventListener('click', function(e) { if(e)e.preventDefault();
        var updated = collectForm(report, scholar, 'SUBMITTED_TO_SUPERVISOR');
        DATA.saveReport(updated);
        toast('🚀 Report submitted to Supervisor successfully!', '#15803d');

        // Immediately update action bar to reflect submission
        var actionBar = document.getElementById('form-action-bar');
        if (actionBar) {
          actionBar.innerHTML =
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<button id="btn-form-back-after-submit" style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:6px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;">← Back to Dashboard</button>' +
              '<span style="font-size:12.5px;color:#64748b;">Editing: <strong style="color:#0f172a;">' + E(updated.monthYear) + '</strong> &nbsp; ' + statusBadge('SUBMITTED_TO_SUPERVISOR') + '</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<button disabled style="background:#15803d;color:#fff;border:none;border-radius:6px;padding:8.5px 20px;font-size:13px;font-weight:700;cursor:not-allowed;opacity:0.95;">✅ Submitted to Supervisor</button>' +
            '</div>';
          var backBtn2 = document.getElementById('btn-form-back-after-submit');
          if (backBtn2) backBtn2.addEventListener('click', showDashboard);
        }
        // setTimeout(showDashboard, 1500); /* commented for verification */
      });
    }

    // ── Supervisor Dashboard bindings
    function bindSupervisorDashboard() {
      bindDashboardTabs();

      appEl.querySelectorAll('[data-action="sup-review"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var rId = btn.dataset.reportid;
          var report = DATA.getReportById(rId);
          if (!report) return;
          currentReportId = rId;
          currentView = 'review';
          setTitle('Supervisor Review — ' + report.scholarName + ' · ' + report.monthYear);
          appEl.innerHTML = renderSupervisorReviewPanel(report, user);
          bindSupervisorReview(report);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });

      appEl.querySelectorAll('[data-action="sup-review-day8"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var rId = btn.dataset.reportid;
          var report = DATA.getReportById(rId);
          if (!report) return;
          currentReportId = rId;
          currentView = 'review-day8';
          setTitle('Supervisor Review (Daily Report) — ' + report.scholarName + ' · ' + report.monthYear);
          appEl.innerHTML = renderDay8SupervisorReviewPanel(report, user);
          bindDay8SupervisorReview(report);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
    }

    function bindSupervisorReview(report) {
      var backBtn = document.getElementById('btn-review-back');
      if (backBtn) backBtn.addEventListener('click', showDashboard);

      var approveBtn = document.getElementById('btn-sup-approve');
      if (approveBtn) {
        approveBtn.addEventListener('click', function(e) { if(e)e.preventDefault();
          var remarks = (document.getElementById('sup-remarks') || {}).value;
          remarks = (remarks && remarks.trim()) ? remarks.trim() : 'Verified and recommended.';
          var result = DATA.updateReportStatus(report.id, user, 'SUPERVISOR_APPROVED', remarks);
          if (!result || !result.success) { alert('Status update failed.'); return; }
          toast('✅ Report approved and forwarded to HOD!', '#15803d');
          var _f1 = DATA.getReportById(report.id);
          var _area1 = document.getElementById('review-action-area');
          var _span1 = document.getElementById('review-status-span');
          if (_area1) _area1.innerHTML = renderReviewActionBarButtons('SUPERVISOR_APPROVED');
          if (_span1) _span1.innerHTML = '<strong>' + (_f1.scholarName||'') + '</strong> — ' + (_f1.monthYear||'') + ' &nbsp; ' + statusBadge('SUPERVISOR_APPROVED');
          // setTimeout(showDashboard, 1500); /* commented for verification */
        });
      }

      var rejectBtn = document.getElementById('btn-sup-reject');
      if (rejectBtn) {
        rejectBtn.addEventListener('click', function(e) { if(e)e.preventDefault();
          var remarks = (document.getElementById('sup-remarks') || {}).value;
          remarks = (remarks && remarks.trim()) ? remarks.trim() : 'Returned for revision.';
          DATA.updateReportStatus(report.id, user, 'RETURNED_TO_SCHOLAR', remarks);
          toast('❌ Report returned to scholar for revision.', '#be123c');

          var fresh = DATA.getReportById(report.id);
          appEl.innerHTML = renderSupervisorReviewPanel(fresh, user);
          bindSupervisorReview(fresh);
          // setTimeout(showDashboard, 1500); /* commented for verification */
        });
      }
    }

    function bindDay8SupervisorReview(report) {
      var backBtn = document.getElementById('btn-review-back');
      if (backBtn) backBtn.addEventListener('click', showDashboard);

      var approveBtn = document.getElementById('btn-sup-approve');
      if (approveBtn) {
        approveBtn.addEventListener('click', function(e) { if(e)e.preventDefault();
          var remarks = (document.getElementById('sup-remarks') || {}).value;
          remarks = (remarks && remarks.trim()) ? remarks.trim() : 'Verified and recommended.';
          var result = DATA.updateReportStatus(report.id, user, 'SUPERVISOR_APPROVED', remarks);
          if (!result || !result.success) { alert('Status update failed.'); return; }
          toast('✅ Daily Report approved and forwarded to HOD!', '#15803d');
          var _f2 = DATA.getReportById(report.id);
          var _area2 = document.getElementById('review-action-area');
          var _span2 = document.getElementById('review-status-span');
          if (_area2) _area2.innerHTML = renderReviewActionBarButtons('SUPERVISOR_APPROVED');
          if (_span2) _span2.innerHTML = '<strong>Daily Report Review: ' + (_f2.scholarName||'') + '</strong> — ' + (_f2.monthYear||'') + ' &nbsp; ' + statusBadge('SUPERVISOR_APPROVED');
          // setTimeout(showDashboard, 1500); /* commented for verification */
        });
      }

      var rejectBtn = document.getElementById('btn-sup-reject');
      if (rejectBtn) {
        rejectBtn.addEventListener('click', function(e) { if(e)e.preventDefault();
          var remarks = (document.getElementById('sup-remarks') || {}).value;
          remarks = (remarks && remarks.trim()) ? remarks.trim() : 'Returned for revision.';
          DATA.updateReportStatus(report.id, user, 'RETURNED_TO_SCHOLAR', remarks);
          toast('❌ Daily Report returned to scholar for revision.', '#be123c');

          var fresh = DATA.getReportById(report.id);
          appEl.innerHTML = renderDay8SupervisorReviewPanel(fresh, user);
          bindDay8SupervisorReview(fresh);
          // setTimeout(showDashboard, 1500); /* commented for verification */
        });
      }
    }

    // ── HOD Dashboard bindings
    function bindHODDashboard() {
      bindDashboardTabs();

      appEl.querySelectorAll('[data-action="hod-review"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var rId = btn.dataset.reportid;
          var report = DATA.getReportById(rId);
          if (!report) return;
          currentReportId = rId;
          currentView = 'review';
          setTitle('HOD Review — ' + report.scholarName + ' · ' + report.monthYear);
          appEl.innerHTML = renderHODReviewPanel(report, user);
          bindHODReview(report);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });

      appEl.querySelectorAll('[data-action="hod-review-day8"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var rId = btn.dataset.reportid;
          var report = DATA.getReportById(rId);
          if (!report) return;
          currentReportId = rId;
          currentView = 'review-day8';
          setTitle('HOD Review (Daily Report) — ' + report.scholarName + ' · ' + report.monthYear);
          appEl.innerHTML = renderDay8HODReviewPanel(report, user);
          bindDay8HODReview(report);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
    }

    function bindHODReview(report) {
      var backBtn = document.getElementById('btn-hod-review-back');
      if (backBtn) backBtn.addEventListener('click', showDashboard);

      var approveBtn = document.getElementById('btn-hod-approve');
      if (approveBtn) {
        approveBtn.addEventListener('click', function(e) { if(e)e.preventDefault();
          var remarks = (document.getElementById('hod-remarks') || {}).value;
          remarks = (remarks && remarks.trim()) ? remarks.trim() : 'HOD approved.';
          var result = DATA.updateReportStatus(report.id, user, 'HOD_APPROVED', remarks);
          if (!result || !result.success) { alert('Status update failed.'); return; }
          toast('✅ Report approved and forwarded to Deputy Dean Research!', '#15803d');
          var _f3 = DATA.getReportById(report.id);
          var _area3 = document.getElementById('review-action-area');
          var _span3 = document.getElementById('review-status-span');
          if (_area3) _area3.innerHTML = renderReviewActionBarButtons('HOD_APPROVED');
          if (_span3) _span3.innerHTML = '<strong>' + (_f3.scholarName||'') + '</strong> — ' + (_f3.monthYear||'') + ' &nbsp; ' + statusBadge('HOD_APPROVED');
          // setTimeout(showDashboard, 1500); /* commented for verification */
        });
      }

      var rejectBtn = document.getElementById('btn-hod-reject');
      if (rejectBtn) {
        rejectBtn.addEventListener('click', function(e) { if(e)e.preventDefault();
          var remarks = (document.getElementById('hod-remarks') || {}).value;
          remarks = (remarks && remarks.trim()) ? remarks.trim() : 'Returned for revision.';
          DATA.updateReportStatus(report.id, user, 'RETURNED_TO_SCHOLAR', remarks);
          toast('❌ Report returned to scholar for revision.', '#be123c');

          var fresh = DATA.getReportById(report.id);
          appEl.innerHTML = renderHODReviewPanel(fresh, user);
          bindHODReview(fresh);
          // setTimeout(showDashboard, 1500); /* commented for verification */
        });
      }
    }

    function bindDay8HODReview(report) {
      var backBtn = document.getElementById('btn-hod-review-back');
      if (backBtn) backBtn.addEventListener('click', showDashboard);

      var approveBtn = document.getElementById('btn-hod-approve');
      if (approveBtn) {
        approveBtn.addEventListener('click', function(e) { if(e)e.preventDefault();
          var remarks = (document.getElementById('hod-remarks') || {}).value;
          remarks = (remarks && remarks.trim()) ? remarks.trim() : 'HOD approved.';
          var result = DATA.updateReportStatus(report.id, user, 'HOD_APPROVED', remarks);
          if (!result || !result.success) { alert('Status update failed.'); return; }
          toast('✅ Daily Report approved and forwarded to Deputy Dean Research!', '#15803d');
          var _f4 = DATA.getReportById(report.id);
          var _area4 = document.getElementById('review-action-area');
          var _span4 = document.getElementById('review-status-span');
          if (_area4) _area4.innerHTML = renderReviewActionBarButtons('HOD_APPROVED');
          if (_span4) _span4.innerHTML = '<strong>Daily Report Review: ' + (_f4.scholarName||'') + '</strong> — ' + (_f4.monthYear||'') + ' &nbsp; ' + statusBadge('HOD_APPROVED');
          // setTimeout(showDashboard, 1500); /* commented for verification */
        });
      }

      var rejectBtn = document.getElementById('btn-hod-reject');
      if (rejectBtn) {
        rejectBtn.addEventListener('click', function(e) { if(e)e.preventDefault();
          var remarks = (document.getElementById('hod-remarks') || {}).value;
          remarks = (remarks && remarks.trim()) ? remarks.trim() : 'Returned for revision.';
          DATA.updateReportStatus(report.id, user, 'RETURNED_TO_SCHOLAR', remarks);
          toast('❌ Daily Report returned to scholar for revision.', '#be123c');

          var fresh = DATA.getReportById(report.id);
          appEl.innerHTML = renderDay8HODReviewPanel(fresh, user);
          bindDay8HODReview(fresh);
          // setTimeout(showDashboard, 1500); /* commented for verification */
        });
      }
    }

    // ── Dean & Deputy Dean Dashboard bindings
    function bindDeanLevelDashboard() {
      bindDashboardTabs();

      appEl.querySelectorAll('[data-action="ddr-review"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var rId = btn.dataset.reportid;
          var report = DATA.getReportById(rId);
          if (!report) return;
          currentReportId = rId;
          currentView = 'review';
          var isDean = user.role === 'dean';
          setTitle((isDean ? 'Dean' : 'Deputy Dean') + ' Review — ' + report.scholarName + ' · ' + report.monthYear);
          appEl.innerHTML = renderDeanLevelReviewPanel(report, user);
          bindDeanLevelReview(report);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });

      appEl.querySelectorAll('[data-action="ddr-review-day8"], [data-action="ddr-review-daily"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var rId = btn.dataset.reportid;
          var report = DATA.getReportById(rId);
          if (!report) return;
          currentReportId = rId;
          currentView = 'review-day8';
          var isDean = user.role === 'dean';
          setTitle((isDean ? 'Dean' : 'Deputy Dean') + ' Review (Daily Report) — ' + report.scholarName + ' · ' + report.monthYear);
          appEl.innerHTML = renderDay8DeanLevelReviewPanel(report, user);
          bindDay8DeanLevelReview(report);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
    }

    function bindDeanLevelReview(report) {
      var isDean = user.role === 'dean';
      var backBtn = document.getElementById('btn-ddr-review-back');
      if (backBtn) backBtn.addEventListener('click', showDashboard);

      var approveBtn = document.getElementById('btn-ddr-approve');
      if (approveBtn) {
        approveBtn.addEventListener('click', function(e) { if(e)e.preventDefault();
          var remarks = (document.getElementById('ddr-remarks') || {}).value;
          var targetStatus = isDean ? 'VERIFIED' : 'DEPUTY_DEAN_APPROVED';
          remarks = (remarks && remarks.trim()) ? remarks.trim() : (isDean ? 'Certified and approved for fellowship disbursement.' : 'Reviewed and approved by Deputy Dean.');
          var result = DATA.updateReportStatus(report.id, user, targetStatus, remarks);
          if (!result || !result.success) { alert('Status update failed.'); return; }
          
          if (isDean) toast('✅ Fellowship claim VERIFIED and approved for disbursement!', '#166534');
          else toast('✅ Fellowship claim approved and submitted to Dean.', '#0284c7');
          
          var _f5 = DATA.getReportById(report.id);
          var _area5 = document.getElementById('review-action-area');
          var _span5 = document.getElementById('review-status-span');
          if (_area5) _area5.innerHTML = renderReviewActionBarButtons(targetStatus);
          if (_span5) _span5.innerHTML = '<strong>' + (_f5.scholarName||'') + '</strong> — ' + (_f5.monthYear||'') + ' &nbsp; ' + statusBadge(targetStatus);
          // setTimeout(showDashboard, 1500); /* commented for verification */
        });
      }

      var rejectBtn = document.getElementById('btn-ddr-reject');
      if (rejectBtn) {
        rejectBtn.addEventListener('click', function(e) { if(e)e.preventDefault();
          var remarks = (document.getElementById('ddr-remarks') || {}).value;
          remarks = (remarks && remarks.trim()) ? remarks.trim() : 'Returned for revision.';
          DATA.updateReportStatus(report.id, user, 'RETURNED_TO_SCHOLAR', remarks);
          toast('❌ Report returned to scholar for revision.', '#be123c');

          var fresh = DATA.getReportById(report.id);
          appEl.innerHTML = renderDeanLevelReviewPanel(fresh, user);
          bindDeanLevelReview(fresh);
          // setTimeout(showDashboard, 1500); /* commented for verification */
        });
      }
    }

    function bindDay8DeanLevelReview(report) {
      var isDean = user.role === 'dean';
      var backBtn = document.getElementById('btn-ddr-review-back');
      if (backBtn) backBtn.addEventListener('click', showDashboard);

      var approveBtn = document.getElementById('btn-ddr-approve');
      if (approveBtn) {
        approveBtn.addEventListener('click', function(e) { if(e)e.preventDefault();
          var remarks = (document.getElementById('ddr-remarks') || {}).value;
          var targetStatus = isDean ? 'VERIFIED' : 'DEPUTY_DEAN_APPROVED';
          remarks = (remarks && remarks.trim()) ? remarks.trim() : (isDean ? 'Certified and approved.' : 'Reviewed and approved by Deputy Dean.');
          var result = DATA.updateReportStatus(report.id, user, targetStatus, remarks);
          if (!result || !result.success) { alert('Status update failed.'); return; }
          
          if (isDean) toast('✅ Daily Report VERIFIED and certified!', '#166534');
          else toast('✅ Daily Report approved and submitted to Dean.', '#0284c7');
          
          var _f6 = DATA.getReportById(report.id);
          var _area6 = document.getElementById('review-action-area');
          var _span6 = document.getElementById('review-status-span');
          if (_area6) _area6.innerHTML = renderReviewActionBarButtons(targetStatus);
          if (_span6) _span6.innerHTML = '<strong>Daily Report Review: ' + (_f6.scholarName||'') + '</strong> — ' + (_f6.monthYear||'') + ' &nbsp; ' + statusBadge(targetStatus);
          // setTimeout(showDashboard, 1500); /* commented for verification */
        });
      }

      var rejectBtn = document.getElementById('btn-ddr-reject');
      if (rejectBtn) {
        rejectBtn.addEventListener('click', function(e) { if(e)e.preventDefault();
          var remarks = (document.getElementById('ddr-remarks') || {}).value;
          remarks = (remarks && remarks.trim()) ? remarks.trim() : 'Returned for revision.';
          DATA.updateReportStatus(report.id, user, 'RETURNED_TO_SCHOLAR', remarks);
          toast('❌ Daily Report returned to scholar for revision.', '#be123c');

          var fresh = DATA.getReportById(report.id);
          appEl.innerHTML = renderDay8DeanLevelReviewPanel(fresh, user);
          bindDay8DeanLevelReview(fresh);
          // setTimeout(showDashboard, 1500); /* commented for verification */
        });
      }
    }

    // ── Initial render
    showDashboard();
  }

  // ════════════════════════════════════════════════════════════════
  // ENTRY POINT
  // ════════════════════════════════════════════════════════════════
  global.SCHOLAR_MODULE = {
    mount: mount,
    printVerifiedReportPDF: printVerifiedReportPDF,
    printDailyReportPDF: printDailyReportPDF,
    viewProofFile: viewProofFile,
    isScholarModuleRole: function(role) {
      return role === 'scholar' || role === 'supervisor';
    },
    isHODScholarMode: function(role) {
      return role === 'hod';
    }
  };


  // Global listener for View Proof buttons
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.btn-view-proof');
    if (btn) {
      var data = btn.getAttribute('data-filedata');
      if (data) {
        var w = window.open('');
        if (w) {
          w.document.write('<iframe src="' + data + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%; position:absolute;" allowfullscreen></iframe>');
          w.document.title = btn.getAttribute('data-filename') || 'View Proof';
        } else {
          alert('Please allow popups to view the proof document.');
        }
      }
    }
  });
}(window));
