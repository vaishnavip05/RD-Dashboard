(() => {
 const D=window.RESEARCH_DATA,Y=[2024,2025,2026],app=document.querySelector('#app'),title=document.querySelector('#page-title'),nav=[...document.querySelectorAll('.nav-link')];
 let _activeYear = 2026;
 const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const by=(a,k)=>a.reduce((o,x)=>{let v=typeof k==='function'?k(x):x[k];if(v)o[v]=(o[v]||0)+1;return o},{}),rank=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]);
 const card=(n,v,s,p)=>`<button class="metric metric-button" data-go="${p}"><span class="metric-label">${n}</span><span class="metric-value">${v}</span><span class="metric-note">${s} · View details →</span></button>`;
 const filter=(id,customY=null)=>{ const selY = customY || _activeYear; return `<div class="year-filter"><label for="${id}">Filter by year</label><select id="${id}">${Y.map(y=>`<option value="${y}" ${y===selY?'selected':''}>${y}</option>`).join('')}</select></div>`; };
 const intro=t=>`<section class="page-intro"><div><p class="kicker">Research performance · 2024–2026</p><p>${t}</p></div></section>`;
 const list=(rows,k,colour='')=>{let x=(Array.isArray(rows[0])?rows:rank(by(rows,k))).slice(0,8),m=Math.max(...x.map(z=>z[1]),1);return `<div class="progress-list">${x.map(([n,v],i)=>`<div class="bar-row"><span class="rank">${i+1}</span><span class="bar-name">${E(n)}</span><span class="bar-track"><span class="bar-fill ${colour}" style="width:${v/m*100}%"></span></span><strong>${v}</strong></div>`).join('')}</div>`};
 const chart=(data,c='#526dda')=>{let w=560,h=230,max=Math.max(...data.map(x=>x[1]),1)*1.15;return `<svg class="chart" viewBox="0 0 ${w} ${h}"><line x1="40" y1="192" x2="540" y2="192" stroke="#dfe5ef"/>${data.map(([n,v],i)=>{let x=75+i*165,y=192-v/max*155;return `<rect x="${x}" y="${y}" width="86" height="${192-y}" rx="5" fill="${c}"/><text x="${x+43}" y="${y-7}" text-anchor="middle" fill="#34415a" font-size="13">${v}</text><text x="${x+43}" y="215" text-anchor="middle" fill="#64708a" font-size="12">${n}</text>`}).join('')}</svg>`};
 const donut=(items,label)=>{if(!items.length)return `<div class="empty">No records are available for the selected year.</div>`;let total=items.reduce((s,x)=>s+x[1],0)||1,colors=['#0d5ea6','#2c9d98','#d29b37','#7b62b3','#cf5b58'],run=0,parts=items.map((x,i)=>{let a=run/total*360;run+=x[1];return `${colors[i]} ${a}deg ${run/total*360}deg`}).join(',');return `<div class="focus-chart"><div class="donut" style="background:conic-gradient(${parts})"><span>${total}<small>${label}</small></span></div><div class="legend">${items.map((x,i)=>`<div><i style="background:${colors[i]}"></i><span>${E(x[0])}</span><strong>${x[1]}</strong></div>`).join('')}</div></div>`};
 const focus=(type,rows,y)=>{if(type==='home'){let s=D.summary[y];return donut([['Publications',s.publications],['Patents',s.patents],['Awards',s.awards],['Projects',s.fundedProjects]],'activities')}if(type==='publications')return donut([['With link',rows.filter(x=>x.link).length],['Without link',rows.filter(x=>!x.link).length]],'records');if(type==='patents')return donut([['Granted',rows.filter(x=>x.status==='Granted').length],['Published',rows.filter(x=>x.status==='Published').length],['Other',rows.filter(x=>!['Granted','Published'].includes(x.status)).length]],'patents');if(type==='people')return donut(rank(by(rows,'category')).slice(0,4),'scholars');if(type==='awards')return donut([['Single award',rank(by(rows,'faculty')).filter(x=>x[1]===1).length],['Repeat awardee',rank(by(rows,'faculty')).filter(x=>x[1]>1).length]],'awardees');return donut(rank(by(rows,'agency')).slice(0,4),'projects')};
 const link=v=>v?`<a class="link" target="_blank" rel="noopener" href="${/^http/.test(v)?E(v):'https://doi.org/'+E(v)}">Open ↗</a>`:'—';
 const threeYearChart=(data,title,c='#0ea5e9',isCard=true)=>{let w=460,h=180,max=Math.max(...data,1)*1.15,years=[2024,2025,2026];let wrapStyle=isCard?`background:#fff;border-radius:12px;padding:12px 16px;border:1px solid #e1e7f0;box-shadow:0 4px 12px rgba(0,0,0,0.03)`:`width:100%;`;let titleHtml=isCard?`<h3 style="margin-top:0;margin-bottom:12px;font-size:14.5px;color:#34415a;font-weight:600">${title} (3-Year Trend)</h3>`:``;return `<div class="${isCard?'chart-wrapper':'chart-container'}" style="${wrapStyle}">${titleHtml}<svg class="chart" viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block;"><line x1="20" y1="140" x2="440" y2="140" stroke="#dfe5ef"/>${data.map((v,i)=>{let x=65+i*125,y=140-(max?v/max*110:0);return `<rect x="${x}" y="${y}" width="80" height="${140-y}" rx="4" fill="${c}" style="transition:all 0.3s"/><text x="${x+40}" y="${y-8}" text-anchor="middle" fill="#34415a" font-size="14" font-weight="600">${v}</text><text x="${x+40}" y="165" text-anchor="middle" fill="#64708a" font-size="13">${years[i]}</text>`}).join('')}</svg></div>`};
 const departmentComparisonChart=(data,title,c='#10b981',isCard=false)=>{if(!data.length)return `<div class="empty">No records available.</div>`;let rowH=34,h=Math.max(100,data.length*rowH+20),w=740,max=Math.max(...data.map(x=>x[1]),1)*1.15;let wrapStyle=isCard?`background:#fff;border-radius:12px;padding:12px 16px;border:1px solid #e1e7f0;box-shadow:0 4px 12px rgba(0,0,0,0.03);overflow-y:auto;max-height:600px`:`width:100%;overflow-y:auto;max-height:600px;padding-right:8px;`;let titleHtml=isCard?`<h3 style="margin-top:0;margin-bottom:12px;font-size:14.5px;color:#34415a;font-weight:600">${title}</h3>`:``;return `<div class="${isCard?'chart-wrapper':'chart-container'}" style="${wrapStyle}">${titleHtml}<svg class="chart" viewBox="0 0 ${w} ${h}" style="width:100%;min-height:${h}px;display:block;"><line x1="250" y1="10" x2="250" y2="${h-10}" stroke="#dfe5ef"/>${data.map(([n,v],i)=>{let y=10+i*rowH,barW=max?(v/max)*(w-310):0;return `<text x="240" y="${y+16}" text-anchor="end" fill="#64708a" font-size="14" dominant-baseline="middle">${E(n)}</text><rect x="250" y="${y+6}" width="${barW}" height="20" rx="4" fill="${c}" style="transition:all 0.3s"/><text x="${250+barW+10}" y="${y+16}" text-anchor="start" fill="#34415a" font-size="14" font-weight="600" dominant-baseline="middle">${v}</text>`}).join('')}</svg></div>`};
 // ── Management Scope Detection ─────────────────────────────────────────────
 function getManagementScope() {
   const SCOPE = window.SRM_SCOPE;
   if (!SCOPE) return null;
   const node = SCOPE.getSelectedNode();
   if (!node) return null;
   // Is it the Management group node?
   if (node.type === 'group' && node.key === 'Management') return { level: 'group', dept: null };
   // Is it a Management dept (BBA or MBA)?
   if (node.type === 'dept' && node.groupKey === 'Management') return { level: 'dept', dept: node.label };
   return null;
 }

 function isManagementScope() {
   return getManagementScope() !== null;
 }

  // ── E&T Scope Detection ───────────────────────────────────────────────────
  function getETScope() {
    const SCOPE = window.SRM_SCOPE;
    if (!SCOPE) return null;
    const node = SCOPE.getSelectedNode();
    if (!node) return null;
    if (node.type === 'group' && (node.key === 'E&T' || node.id === 'group_ent' || node.label === 'E&T')) return { level: 'group', dept: null };
    if (node.type === 'dept' && node.groupKey === 'E&T') return { level: 'dept', dept: node.label };
    return null;
  }

  function isETScope() {
    return getETScope() !== null;
  }

  function getOldETLabel(newLabel) {
    if (!newLabel) return '';
    const map = {
      'CSE-AIML': 'AIML',
      'CSE-BDA': 'BDA&CC',
      'CSE-IoT & CSBS': 'IoT & CSBS',
      'MECH': 'Mechanical',
      'PHY': 'Physics',
      'CIVIL': 'Civil',
      'CHEM': 'Chemistry',
      'LCS/EFL': 'EFL',
      'MATHS': 'Mathematics',
      'BIOTECH': 'Biotechnology'
    };
    return map[newLabel] || newLabel;
  }

  function normalizeETDepartment(record) {
    let deptStr = (record.department || '').trim();
    let progStr = (record.program || '').trim();

    if (deptStr) {
      let d = deptStr.toLowerCase().replace(/^department of\s+/i, '').trim();
      if (d === 'cse') return 'CSE';
      if (d === 'ece') return 'ECE';
      if (d === 'eee') return 'EEE';
      if (d === 'mechanical engineering' || d === 'mech') return 'MECH';
      if (d === 'civil engineering' || d === 'civil') return 'CIVIL';
      if (d === 'biotechnology' || d === 'bio tech') return 'BIOTECH';
      if (d === 'biomedical engineering' || d === 'bme') return 'BME';
      if (d === 'mathematics' || d === 'maths') return 'MATHS';
      if (d === 'physics' || d === 'phy') return 'PHY';
      if (d === 'chemistry' || d === 'chem') return 'CHEM';
      if (d === 'english and other foreign languages' || d === 'efl') return 'LCS/EFL';
      
      let origD = deptStr.trim();
      if (origD === 'CSE-AIML') return 'CSE-AIML';
      if (origD === 'CSE-BDA') return 'CSE-BDA';
      if (origD === 'CSE-IoT & CSBS') return 'CSE-IoT & CSBS';
      if (origD === 'CSE-CS') return 'CSE-CS';
      if (origD === 'CSE-GT') return 'CSE-GT';
      if (origD === 'IT') return 'IT';
    }

    if (progStr) {
      let p = progStr.toLowerCase().split('[')[0].trim();
      if (p.includes('ph.d.-computer science and engineering')) return 'CSE';
      if (p.includes('ph.d.-electronics and communication engineering')) return 'ECE';
      if (p.includes('ph.d.-electrical and electronics engineering')) return 'EEE';
      if (p.includes('ph.d.-mechanical engineering')) return 'MECH';
      if (p.includes('ph.d.-civil engineering')) return 'CIVIL';
      if (p.includes('ph.d.-biotechnology')) return 'BIOTECH';
      if (p.includes('ph.d.-biomedical engineering')) return 'BME';
      if (p.includes('ph.d.-mathematics')) return 'MATHS';
      if (p.includes('ph.d.-physics')) return 'PHY';
      if (p.includes('ph.d.-chemistry')) return 'CHEM';
      if (p.includes('ph.d.-english')) return 'LCS/EFL';
    }
    
    return null;
  }

  // ── E&T Data Filtering & Normalization ────────────────────────────────────
  function normET(r, fallbackYear) {
    const y = r._year || parseInt(r.Year) || fallbackYear;
    const title = r['Title of the paper'] || r.Title || r['Title of the Paper'] || '—';
    const authors = r['Authors (ALL)'] || r.Authors || r['Name of Claiming Author'] || '—';
    const journal = r['Journal Name'] || r['Source title/Journal Name'] || r['Name of the Journal'] || '—';
    const link = r['Paper Link'] || r['SCOPUS Article Link'] || r['DOI/LINK'] || r.DOI || r['First Page of the Paper LINK'] || '';
    const dept = r._source_department || r['Dept.'] || r['Department of Authors'] || r['Claiming Author Department'] || '';
    return { year: y, title, authors, journal, link, dept };
  }

  function getETPublications(year, ignoreScope = false) {
    const p2024 = (window.ET_PUBLICATIONS_2024 || []).map(r => normET(r, 2024));
    const p2025 = (window.ET_PUBLICATIONS_2025 || []).map(r => normET(r, 2025));
    const p2026 = (window.ET_PUBLICATIONS_2026 || []).map(r => normET(r, 2026));
    const all = [...p2024, ...p2025, ...p2026];

    const etScope = getETScope();
    let src = all;
    if (!ignoreScope && etScope && etScope.dept) {
      const oldDept = getOldETLabel(etScope.dept).toLowerCase();
      src = src.filter(r => (r.dept || '').toLowerCase() === oldDept);
    }

    return year ? src.filter(r => r.year === year) : src;
  }

  function normPat(r) {
    return {
      year: r.year || parseInt(r.Year) || 2024,
      title: r.title || r.Title || r['Patent title'] || r.patentTitle || '—',
      departmentGroup: r.department || r.Dept || r.Department || 'E&T',
      inventors: r.inventors || r.Inventor || r['Inventor(s)'] || r.inventor || '—',
      status: r.category || r.status || 'Published',
      applicationNo: r.applicationNo || r['Application No'] || '—',
      filingDate: r.filingDate || r['Filing Date'] || '—',
      proofLink: r.proofLink || ''
    };
  }

  function getETPatents(year, ignoreScope = false) {
    const raw = window.ET_PATENTS || [];
    let src = raw.map(normPat);

    const etScope = getETScope();
    if (!ignoreScope && etScope && etScope.dept) {
      const oldDept = getOldETLabel(etScope.dept).toLowerCase();
      src = src.filter(r => (r.departmentGroup || '').toLowerCase().includes(oldDept));
    }

    return year ? src.filter(r => r.year === year) : src;
  }

  function normFund(r) {
    return {
      year: r.year || parseInt(r.Year) || 2024,
      title: r.project || r.title || r.Title || r['Project Title'] || '—',
      principalInvestigator: r.principalInvestigator || r.pi || r.PI || r['Principal Investigator'] || '—',
      coPi: r.coPI || r.coPi || r.CO_PI || '',
      agency: r.fundingAgency || r.agency || r['Funding Agency'] || r.scheme || '—',
      amount: r.amount || r.fundRequested || r['Fund Requested'] || '—',
      duration: r.duration || r.date || '—',
      status: r.status || 'Submitted',
      department: r.department || r.Dept || ''
    };
  }

  function getETFunded(year, ignoreScope = false) {
    const raw = window.ET_FUNDED_PROJECTS || [];
    let src = raw.map(normFund);

    const etScope = getETScope();
    if (!ignoreScope && etScope && etScope.dept) {
      const oldDept = getOldETLabel(etScope.dept).toLowerCase();
      src = src.filter(r => (r.department || '').toLowerCase().includes(oldDept));
    }

    return year ? src.filter(r => r.year === year) : src;
  }

  function normConsult(r) {
    return {
      year: r.year || 2025,
      title: r.title || r.Title || '—',
      faculty: r.faculty || r.Faculty || '—',
      agency: r.fundingAgency || r.agency || r['Funding Agency'] || '—',
      amount: r.amount || r.Amount || '—',
      duration: r.duration || '—',
      status: r.status || '—',
      department: r.department || r.Department || ''
    };
  }

  function getETConsultancy(year, ignoreScope = false) {
    const raw = (window.ET_CONSULTANCY_PROJECTS && window.ET_CONSULTANCY_PROJECTS.records) || [];
    let src = raw.map(normConsult);

    const etScope = getETScope();
    if (!ignoreScope && etScope && etScope.dept) {
      const oldDept = getOldETLabel(etScope.dept).toLowerCase();
      src = src.filter(r => (r.department || '').toLowerCase().includes(oldDept));
    }

    return year ? src.filter(r => r.year === year) : src;
  }

  function getETPeopleRecords(year, ignoreScope = false) {
    const supData = window.ET_SUPERVISORS_SCHOLARS && window.ET_SUPERVISORS_SCHOLARS.yearlyData;
    if (!supData) return [];

    let recs = [];
    if (year && supData[year]) {
      recs = supData[year].records || [];
    } else if (!year) {
      Object.keys(supData).forEach(y => {
        recs = recs.concat(supData[y].records || []);
      });
    }

    const clean = recs.filter(r => {
      if (!r || !r.scholar) return false;
      const s = r.scholar.trim();
      if (['FT', 'PT', 'PT (Internal )', 'PT (Internal)', 'PT(External)', 'PT (External)', 'Total'].includes(s)) return false;
      return true;
    });

    const etScope = getETScope();
    if (!ignoreScope && etScope && etScope.dept) {
      return clean.filter(r => normalizeETDepartment(r) === etScope.dept);
    }
    return clean;
  }

  // Exact hardcoded faculty counts — not calculated from any dataset
  const ET_FACULTY = { 2024: 343, 2025: 334, 2026: 366 };
  const ET_FACULTY_BY_DEPT = {
    2024: { 'CSE': 120, 'MECH': 37, 'IT': 16, 'ECE': 35, 'EEE': 10, 'PHY': 15, 'CIVIL': 13, 'BME': 8, 'CHEM': 24, 'LCS/EFL': 17, 'MATHS': 42, 'BIOTECH': 6 },
    2025: { 'CSE': 52, 'CSE-AIML': 22, 'CSE-BDA': 18, 'CSE-IoT & CSBS': 7, 'CSE-CS': 13, 'CSE-GT': 3, 'MECH': 37, 'IT': 15, 'ECE': 39, 'EEE': 11, 'PHY': 16, 'CIVIL': 5, 'BME': 6, 'CHEM': 21, 'LCS/EFL': 18, 'MATHS': 43, 'BIOTECH': 8 },
    2026: { 'CSE': 53, 'CSE-AIML': 25, 'CSE-BDA': 17, 'CSE-IoT & CSBS': 9, 'CSE-CS': 17, 'CSE-GT': 5, 'MECH': 37, 'IT': 15, 'ECE': 44, 'EEE': 11, 'PHY': 20, 'CIVIL': 13, 'BME': 7, 'CHEM': 24, 'LCS/EFL': 23, 'MATHS': 48, 'BIOTECH': 15 }
  };

  function getETSummary(y) {
    const etScope = getETScope();
    const deptLabel = etScope && etScope.dept ? etScope.dept : 'E&T';
    const pubs = getETPublications(y);
    const pats = getETPatents(y);
    const fund = getETFunded(y);
    const cons = getETConsultancy(y);
    const supData = (window.ET_SUPERVISORS_SCHOLARS && window.ET_SUPERVISORS_SCHOLARS.yearlyData && window.ET_SUPERVISORS_SCHOLARS.yearlyData[y]) || { scholarCount: 0, supervisorCount: 0 };
    const granted = pats.filter(r => (r.status || '').toLowerCase() === 'granted').length;
    const published = pats.filter(r => (r.status || '').toLowerCase() === 'published').length;
    
    const deptCounts = ET_FACULTY_BY_DEPT[y] || {};
    const facultyCount = etScope && etScope.dept
      ? (deptCounts[etScope.dept] || 0)
      : (ET_FACULTY[y] || 0);

    let supervisorCount = supData.supervisorCount || 0;
    let scholarCount = supData.scholarCount || 0;
    
    if (etScope && etScope.dept) {
      const peeps = getETPeopleRecords(y);
      scholarCount = peeps.length;
      const uniqueSups = new Set();
      peeps.forEach(p => { if (p.supervisor) uniqueSups.add(p.supervisor); });
      supervisorCount = uniqueSups.size;
    }

    return {
      faculty: facultyCount,
      publications: pubs.length,
      patents: pats.length,
      granted,
      published,
      fundedProjects: fund.length,
      consultancy: cons.length,
      supervisors: supervisorCount,
      scholars: scholarCount,
      deptLabel
    };
  }

 // ── Management Data Filtering ──────────────────────────────────────────────
 function getMgmtRecords(dataType, year, ignoreScope = false) {
   const M = window.MANAGEMENT_RESEARCH_DATA;
   if (!M) return [];
   const mgmtScope = getManagementScope();
   const deptFilter = (!ignoreScope && mgmtScope && mgmtScope.dept) ? mgmtScope.dept : null;

   let src = [];
   if (dataType === 'publications') src = M.publications;
   else if (dataType === 'patents') src = M.patents;
   else if (dataType === 'funded') src = M.fundedProjects;
   else if (dataType === 'people') src = getMgmtPeopleRecords(year, ignoreScope);
   else return [];

   // Filter by department if a specific dept is selected
   if (deptFilter && dataType !== 'people') {
     src = src.filter(r => r.department === deptFilter);
   }

   // Filter by year — if year not found in dataset return all-time for "all years" view
   // but honour the year selector on the page
   const filtered = year ? src.filter(r => r.year === year) : src;
   return filtered;
 }

  // Exact hardcoded faculty counts for Management
  const MGMT_FACULTY = { 2024: 35, 2025: 41, 2026: 39 };
  const MGMT_FACULTY_BY_DEPT = {
    2024: { MBA: 22, BBA: 13 },
    2025: { MBA: 25, BBA: 16 },
    2026: { MBA: 25, BBA: 14 }
  };

  // Exact hardcoded supervisor/scholar counts sourced from JSON
  const MGMT_PEOPLE = {
    2024: { supervisors: 10, scholars: 1 },
    2025: { supervisors: 12, scholars: 6 },
    2026: { supervisors: 16, scholars: 20 }
  };

  function getMgmtSummary(y) {
    const mgmtScope = getManagementScope();
    const deptLabel = mgmtScope && mgmtScope.dept ? mgmtScope.dept : 'Management';
    const pubs  = getMgmtRecords('publications', y);
    const pats  = getMgmtRecords('patents', y);
    const fund  = getMgmtRecords('funded', y);
    const granted  = pats.filter(r => r.status === 'Granted').length;
    const published = pats.filter(r => r.status === 'Published').length;
    const people = MGMT_PEOPLE[y] || { supervisors: 0, scholars: 0 };
    const deptCounts = MGMT_FACULTY_BY_DEPT[y] || {};
    const faculty = mgmtScope && mgmtScope.dept
      ? (deptCounts[mgmtScope.dept] || 0)
      : (MGMT_FACULTY[y] || 0);

    let supervisors = people.supervisors;
    let scholars = people.scholars;
    if (mgmtScope && mgmtScope.dept) {
      const peeps = getMgmtPeopleRecords(y);
      scholars = peeps.length;
      const uniqueSups = new Set();
      peeps.forEach(p => { if (p.supervisor) uniqueSups.add(p.supervisor); });
      supervisors = uniqueSups.size;
    }

    return { faculty, publications: pubs.length, patents: pats.length, granted, published, fundedProjects: fund.length, supervisors, scholars, deptLabel };
  }

  function getMgmtPeopleRecords(year, ignoreScope = false) {
    const data = window.MGMT_SUPERVISORS_SCHOLARS;
    if (!data || !data.academic_years) return [];
    const mgmtScope = getManagementScope();
    const deptFilter = (!ignoreScope && mgmtScope && mgmtScope.dept) ? mgmtScope.dept : null;

    const yearKey = String(year);
    const yearData = data.academic_years[yearKey];
    if (!yearData || !yearData.supervisors) return [];

    const rows = [];
    yearData.supervisors.forEach(sup => {
      if (!sup.scholars || sup.scholars.length === 0) return;
      sup.scholars.forEach(scholar => {
        const dept = scholar.department || sup.department || '—';
        if (deptFilter && dept !== deptFilter) return;
        rows.push({
          name:         scholar.name,
          registration: scholar.register_no,
          department:   dept,
          supervisor:   sup.name,
          mode:         scholar.mode || '—',
          year:         year
        });
      });
    });
    return rows;
  }
 // ── Dataset-Specific Scoped Filtering (FLABS / Module 3) ──────────────────
 function getScopedRecords(type, dataset, year) {
   const SCOPE = window.SRM_SCOPE;
   if (!SCOPE) return dataset.filter(r => r.year === year);
   const dept = SCOPE.getSelectedDept();

   if (type === 'publications') {
     return SCOPE.filterPublicationsByDepartment(dataset, dept, year);
   }
   if (type === 'patents') {
     return SCOPE.filterPatentsByDepartment(dataset, dept, year);
   }
   if (type === 'people') {
      return SCOPE.filterResearchCommunityByDepartment(dataset, dept, year);
    }
    if (type === 'funded') {
      return SCOPE.filterFundedProjectsByDepartment(dataset, dept, year);
    }
    // Awards are institution-wide for FLABS
    return dataset.filter(r => r.year === year);
 }

 const FLABS_FACULTY_BY_DEPT = {
    2026: {
      'Commerce': 44,
      'Commerce - PA, ISM, IAF & SF': 69,
      'BCA': 23,
      'Commerce (A&F)': 21,
      'Data Science': 16,
      'B.Sc Cyber Security': 16,
      'B.Sc Computer Science': 24,
      'B.Sc. (AI & ML)': 19,
      'MCA': 13,
      'Viscom': 25,
      'Fashion Designing': 10,
      'LCS (English)': 23,
      'Biotechnology': 7,
      'Psychology': 4,
      'Mathematics': 14
    }
  };

 // Build live KPI counts for the home page (FLABS path)
 function getScopedSummary(y) {
   const SCOPE = window.SRM_SCOPE;
   const dept = SCOPE && SCOPE.getSelectedDept();

   const pubs     = SCOPE ? SCOPE.filterPublicationsByDepartment(D.publications, dept, y) : D.publications.filter(r => r.year === y);
   const awards   = D.awards.filter(r => r.year === y);
   const funded   = SCOPE ? SCOPE.filterFundedProjectsByDepartment(D.funded, dept, y) : D.funded.filter(r => r.year === y);

   const patents  = SCOPE ? SCOPE.filterPatentsByDepartment(D.patents, dept, y) : D.patents.filter(r => r.year === y);
   const scholars = SCOPE ? SCOPE.filterResearchCommunityByDepartment(D.scholars, dept, y) : D.scholars.filter(r => r.year === y);

   const granted  = patents.filter(r => r.status === 'Granted').length;
   const published = patents.filter(r => r.status === 'Published').length;
   const supervisorSet = new Set(scholars.map(r => r.supervisor).filter(Boolean));

   const facultyCount = dept
     ? (FLABS_FACULTY_BY_DEPT[y] && FLABS_FACULTY_BY_DEPT[y][dept.label] !== undefined ? FLABS_FACULTY_BY_DEPT[y][dept.label] : 0)
     : D.summary[y].faculty;

   return {
     faculty:        facultyCount,
     publications:   pubs.length,
     patents:        patents.length,
     granted:        granted,
     published:      published,
     awards:         awards.length,
     supervisors:    supervisorSet.size,
     scholars:       scholars.length,
     fundedProjects: funded.length,
     dept:           dept
   };
 }

 // ── Current page tracker ───────────────────────────────────────────────────
 let _currentPage = 'home';

 // ══════════════════════════════════════════════════════════════════════════
 // MANAGEMENT HOME PAGE
 // ══════════════════════════════════════════════════════════════════════════
 function mgmtHome() {
   const mgmtScope = getManagementScope();
   const scopeLabel = mgmtScope.dept ? `<strong>${E(mgmtScope.dept)}</strong>` : '<strong>Management</strong>';
   const introText = `Viewing research performance for ${scopeLabel} (Faculty of Management). Publications, Patents, and Funded Projects are filtered by the selected scope.`;
   return `${intro(introText)}<div class="filterbar home-filter">${filter('home-year')}</div><div class="metric-grid home-kpis" id="home-kpis"></div><div class="panel-grid" style="grid-template-columns: 1fr"><section class="panel focus-panel"><h2>3-Year Research Trends</h2><p class="sub">Performance comparison across 2024–2026</p><div id="home-trend-charts" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-top:20px"></div></section></div>`;
 }

 function bindMgmtHome() {
   const q = document.querySelector('#home-year');
   const r = () => {
     const y = +q.value;
     const s = getMgmtSummary(y);

      document.querySelector('#home-kpis').innerHTML = [
        card('Total Faculty',        s.faculty,        s.deptLabel + ' · Faculty members',            'people'),
        card('Publications',         s.publications,   s.deptLabel + ' · Publications',               'publications'),
        card('Patent records',       s.patents,        s.deptLabel + ' · Patents recorded',           'patents'),
        card('Granted patents',      s.granted,        s.deptLabel + ' · Granted status',             'patents'),
        card('Published patents',    s.published,      s.deptLabel + ' · Published status',           'patents'),
        card('Funded projects',      s.fundedProjects, s.deptLabel + ' · Projects awarded',           'funded'),
        card('Research Supervisors', s.supervisors,    s.deptLabel + ' · Research supervisors',       'people'),
        card('Research Scholars',    s.scholars,       s.deptLabel + ' · Enrolled PhD scholars',      'people')
      ].join('');
     let s24 = getMgmtSummary(2024), s25 = getMgmtSummary(2025), s26 = getMgmtSummary(2026);
     document.querySelector('#home-trend-charts').innerHTML = [
       threeYearChart([s24.publications, s25.publications, s26.publications], 'Publications', '#0ea5e9'),
       threeYearChart([s24.patents, s25.patents, s26.patents], 'Patents', '#10b981'),
       threeYearChart([s24.fundedProjects, s25.fundedProjects, s26.fundedProjects], 'Funded Projects', '#f59e0b'),
       threeYearChart([s24.scholars, s25.scholars, s26.scholars], 'Research Scholars', '#8b5cf6')
     ].join('');

     document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => show(b.dataset.go));
   };
   q.onchange = r;
   r();
 }

 // ══════════════════════════════════════════════════════════════════════════
 // MANAGEMENT DETAIL PAGES
 // ══════════════════════════════════════════════════════════════════════════
 const mgmtConfig = {
   publications: {
     label: 'Publications (Management)',
     desc: 'Publications by Faculty of Management researchers, filtered by selected department.',
     go: 'publications',
     cols: ['Year', 'Publication', 'Authors', 'Journal', 'Link'],
     row: r => `<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(r.authors)}</td><td>${E(r.journal)}</td><td>${link(r.link)}</td></tr>`,
     key: 'journal',
     caption: 'Leading journals',
     metrics: (y, a) => [
        ['Publications', a.length, 'Dept-filtered total'],
        ['Journals', Object.keys(by(a, 'journal')).length, 'Represented journals']
      ]
   },
   patents: {
     label: 'Patent portfolio (Management)',
     desc: 'Patents filed and granted by Faculty of Management researchers, filtered by selected department.',
     go: 'patents',
     cols: ['Year', 'Patent title', 'Department', 'Inventor(s)', 'Status'],
     row: r => `<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(r.departmentGroup)}</td><td>${E(r.inventors)}</td><td><span class="badge ${(r.status||'').toLowerCase()}">${E(r.status)}</span></td></tr>`,
     key: 'departmentGroup',
     caption: 'Patent status breakdown',
     metrics: (y, a) => [
       ['Patent records', a.length, 'Year total'],
       ['Granted patents', a.filter(x => x.status === 'Granted').length, 'Granted'],
       ['Published patents', a.filter(x => x.status === 'Published').length, 'Published'],
       ['Other / filed', a.filter(x => !['Granted', 'Published'].includes(x.status)).length, 'Other status']
     ]
   },
   funded: {
     label: 'Funded projects (Management)',
     desc: 'Research funding awarded to Faculty of Management, filtered by selected department.',
     go: 'funded',
     cols: ['Year', 'Project', 'Principal investigator', 'Department', 'Funding agency', 'Amount'],
     row: r => `<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(r.principalInvestigator) || '—'}</td><td>${E(r.departmentGroup) || '—'}</td><td>${E(r.agency)}</td><td>${E(r.amount)}</td></tr>`,
     key: 'agency',
     caption: 'Funding agencies',
     metrics: (y, a) => [
       ['Funded projects', a.length, 'Dept-filtered total'],
       ['Detailed projects', a.length, 'Available records'],
       ['Funding agencies', Object.keys(by(a, 'agency')).length, 'Supporting agencies'],
       ['Selected year', y, 'Current filter']
     ]
   },
    people: {
      label: 'Supervisors & scholars (Management)',
      desc: 'Research supervisors and enrolled PhD scholars for Faculty of Management.',
      go: 'people',
      cols: ['Scholar', 'Registration No', 'Department', 'Supervisor', 'Mode'],
      row: r => `<tr><td class="title-cell">${E(r.name)}</td><td>${E(r.registration) || '—'}</td><td>${E(r.department) || '—'}</td><td>${E(r.supervisor) || '—'}</td><td><span class="badge ${(r.mode||'').toLowerCase().includes('full') ? 'granted' : 'published'}">${E(r.mode)}</span></td></tr>`,
      key: 'supervisor',
      caption: 'Scholars by supervisor',
      metrics: (y, a) => [
        ['Research Supervisors', MGMT_PEOPLE[y] ? MGMT_PEOPLE[y].supervisors : Object.keys(a.reduce((s,r)=>{ if(r.supervisor)s[r.supervisor]=1; return s; },{})).length, 'Active research guides for ' + y],
        ['Registered Scholars',  MGMT_PEOPLE[y] ? MGMT_PEOPLE[y].scholars  : a.length, 'Enrolled scholars for ' + y],
        ['Full-Time scholars',   a.filter(x => (x.mode||'').toLowerCase().includes('full')).length, 'Full-time mode'],
        ['Part-Time scholars',   a.filter(x => (x.mode||'').toLowerCase().includes('part')).length, 'Part-time mode']
      ]
    }
 };

 function mgmtDetail(type) {
   const c = mgmtConfig[type];
   if (!c) return `<div class="empty">Unknown section.</div>`;
   const mgmtBadge = `<span class="badge" style="background:#eef4ff;color:#1E5AA8;border:1px solid #c8d8ed;margin-left:8px;font-size:11.5px;padding:3px 8px;vertical-align:middle;">Management</span>`;
   return `${intro(c.desc + mgmtBadge)}<div class="filterbar table-filters">${filter(type + '-year')}<input id="${type}-search" placeholder="Search ${type === 'funded' ? 'project or investigator' : type}"></div><div class="metric-grid" id="${type}-kpis"></div><div class="panel-grid" style="grid-template-columns: minmax(250px, 0.7fr) 1.3fr; align-items: start;"><section class="panel focus-panel" style="padding:16px;"><h2>3-Year Trend</h2><p class="sub">Performance across 2024–2026</p><div id="${type}-chart"></div></section><section class="panel" style="padding:16px;"><h2>Department Comparison</h2><p class="sub">Ranked performance for selected year</p><div id="${type}-list"></div></section></div><section style="margin-top:18px"><div class="table-wrap"><table><thead><tr>${c.cols.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody id="${type}-table"></tbody></table></div><p class="footer-note" id="${type}-count"></p></section>`;
 }

 function bindMgmtDetail(type) {
   const c = mgmtConfig[type];
   if (!c) return;
   const yr = document.querySelector('#' + type + '-year');
   const search = document.querySelector('#' + type + '-search');

   const r = () => {
     const y = +yr.value;
     const base = type === 'people' ? getMgmtPeopleRecords(y) : getMgmtRecords(type === 'funded' ? 'funded' : type, y);
     const z = search.value.toLowerCase();
     const rows = base.filter(x => !z || Object.values(x).join(' ').toLowerCase().includes(z));

     const mgmtScope = getManagementScope();
     const deptLabel = mgmtScope && mgmtScope.dept ? mgmtScope.dept : 'Management';

     document.querySelector('#' + type + '-kpis').innerHTML = c.metrics(y, base).map(x => card(x[0], x[1], x[2], c.go)).join('');

     // 3-Year Trend Data
     const base24 = type === 'people' ? getMgmtPeopleRecords(2024) : getMgmtRecords(type === 'funded' ? 'funded' : type, 2024);
     const base25 = type === 'people' ? getMgmtPeopleRecords(2025) : getMgmtRecords(type === 'funded' ? 'funded' : type, 2025);
     const base26 = type === 'people' ? getMgmtPeopleRecords(2026) : getMgmtRecords(type === 'funded' ? 'funded' : type, 2026);
     
     document.querySelector('#' + type + '-chart').innerHTML = threeYearChart([base24.length, base25.length, base26.length], c.label, '#0ea5e9', false);

     // Department Comparison (Selected Year)
     const unfilteredBase = type === 'people' ? getMgmtPeopleRecords(y, true) : getMgmtRecords(type === 'funded' ? 'funded' : type, y, true);
     const deptKey = type === 'patents' ? 'departmentGroup' : 'department';
     const deptData = rank(by(unfilteredBase, deptKey)).filter(x => x[0] && x[0] !== '—');
     document.querySelector('#' + type + '-list').innerHTML = departmentComparisonChart(deptData, 'Departments', '#10b981');

     const emptyMsg = `No matching ${c.label.toLowerCase()} found for ${y} in ${deptLabel}.`;
     document.querySelector('#' + type + '-table').innerHTML = rows.map(c.row).join('') || `<tr><td colspan="${c.cols.length}" class="empty">${emptyMsg}</td></tr>`;

     document.querySelector('#' + type + '-count').textContent = `Showing ${rows.length} of ${base.length} records for ${y} · ${deptLabel}`;
     document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => show(b.dataset.go));
   };
   search.oninput = r;
   yr.onchange = r;
   r();
 }

  // ══════════════════════════════════════════════════════════════════════════
  // E&T HOME & DETAIL PAGES
  // ══════════════════════════════════════════════════════════════════════════
  const etConfig = {
    publications: {
      label: 'Publications (E&T)',
      desc: 'Scopus & Indexed Publications for Faculty of Engineering & Technology (E&T).',
      go: 'publications',
      cols: ['Year', 'Publication', 'Authors', 'Journal', 'Link'],
      row: r => `<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(r.authors)}</td><td>${E(r.journal)}</td><td>${link(r.link)}</td></tr>`,
      key: 'journal',
      caption: 'Leading journals',
      getRecords: (y, ignoreScope) => getETPublications(y, ignoreScope),
      metrics: (y, a) => [
        ['Publications', a.length, 'E&T total for ' + y],
        ['Journals', Object.keys(by(a, 'journal')).length, 'Represented journals']
      ]
    },
    patents: {
      label: 'Patent portfolio (E&T)',
      desc: 'Patents filed and granted by Faculty of Engineering & Technology (E&T) researchers.',
      go: 'patents',
      cols: ['Year', 'Patent title', 'Department', 'Inventor(s)', 'Status'],
      row: r => `<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(r.departmentGroup)}</td><td>${E(r.inventors)}</td><td><span class="badge ${(r.status||'').toLowerCase()}">${E(r.status)}</span></td></tr>`,
      key: 'departmentGroup',
      caption: 'Patent status breakdown',
      getRecords: (y, ignoreScope) => getETPatents(y, ignoreScope),
      metrics: (y, a) => [
        ['Patent records', a.length, 'Year total'],
        ['Granted patents', a.filter(x => (x.status||'').toLowerCase() === 'granted').length, 'Granted'],
        ['Published patents', a.filter(x => (x.status||'').toLowerCase() === 'published').length, 'Published'],
        ['Other / filed', a.filter(x => !['granted', 'published'].includes((x.status||'').toLowerCase())).length, 'Other status']
      ]
    },
    funded: {
      label: 'Funded projects (E&T)',
      desc: 'Research funding awarded to Faculty of Engineering & Technology (E&T).',
      go: 'funded',
      cols: ['Year', 'Project', 'Principal investigator', 'Department', 'Funding agency', 'Amount'],
      row: r => `<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(r.principalInvestigator)}</td><td>${E(r.departmentGroup)||'—'}</td><td>${E(r.agency)}</td><td>${E(r.amount)}</td></tr>`,
      key: 'agency',
      caption: 'Funding agencies',
      getRecords: (y, ignoreScope) => getETFunded(y, ignoreScope),
      metrics: (y, a) => [
        ['Funded projects', a.length, 'Year total'],
        ['Detailed projects', a.length, 'Available records'],
        ['Funding agencies', Object.keys(by(a, 'agency')).length, 'Supporting agencies'],
        ['Selected year', y, 'Current filter']
      ]
    },
    consultancy: {
      label: 'Consultancy projects (E&T)',
      desc: 'Industry consultancy projects executed by Faculty of Engineering & Technology (E&T).',
      go: 'consultancy',
      cols: ['Year', 'Project title', 'Faculty', 'Funding agency', 'Amount', 'Status'],
      row: r => `<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(r.faculty)}</td><td>${E(r.agency)}</td><td>${E(r.amount)}</td><td><span class="badge ${(r.status||'').toLowerCase().includes('completed') ? 'granted' : 'published'}">${E(r.status)}</span></td></tr>`,
      key: 'agency',
      caption: 'Client / Funding agencies',
      getRecords: (y, ignoreScope) => getETConsultancy(y, ignoreScope),
      metrics: (y, a) => [
        ['Consultancy projects', a.length, 'Year total for ' + y],
        ['Detailed projects', a.length, 'Available records'],
        ['Clients / Agencies', Object.keys(by(a, 'agency')).length, 'Partner organizations'],
        ['Selected year', y, 'Current filter']
      ]
    },
    people: {
      label: 'Research community (E&T)',
      desc: 'Research supervisors and enrolled PhD scholars for Faculty of Engineering & Technology (E&T).',
      go: 'people',
      cols: ['Scholar name', 'Application No', 'Program / Department', 'Research supervisor', 'Category'],
      row: r => `<tr><td class="title-cell">${E(r.scholar)}</td><td>${E(r.applicationNo || '—')}</td><td>${E(r.program || r.department || 'Ph.D. E&T')}</td><td>${E(r.supervisor || '—')}</td><td><span class="badge ${r.category ? 'published' : 'granted'}">${E(r.category || 'Ph.D.')}</span></td></tr>`,
      key: 'supervisor',
      caption: 'Supervisors list',
      getRecords: (y, ignoreScope) => getETPeopleRecords(y, ignoreScope),
      metrics: (y, a) => {
        const yData = (window.ET_SUPERVISORS_SCHOLARS && window.ET_SUPERVISORS_SCHOLARS.yearlyData && window.ET_SUPERVISORS_SCHOLARS.yearlyData[y]) || {};
        const etScope = getETScope();
        let scholarCount = a.length;
        let supervisorCount = Object.keys(by(a, 'supervisor')).length;
        
        if (!etScope || !etScope.dept) {
           scholarCount = yData.scholarCount || scholarCount;
           supervisorCount = yData.supervisorCount || supervisorCount;
        }

        return [
          ['Research Scholars', scholarCount, 'Enrolled PhD scholars for ' + y],
          ['Research Supervisors', supervisorCount, 'Active supervisors for ' + y],
          ['Detailed records', a.length, 'Available scholar records'],
          ['Selected year', y, 'Current filter']
        ];
      }
    }
  };

  function etHome() {
    const etScope = getETScope();
    const scopeLabel = etScope.dept ? `<strong>${E(etScope.dept)}</strong>` : '<strong>E&T</strong>';
    const introText = `Viewing research performance for ${scopeLabel} (Faculty of Engineering & Technology). Publications, Patents, Funded Projects, Consultancy, and Research Community dataset.`;
    return `${intro(introText)}<div class="filterbar home-filter">${filter('home-year')}</div><div class="metric-grid home-kpis" id="home-kpis"></div><div class="panel-grid" style="grid-template-columns: 1fr"><section class="panel focus-panel"><h2>3-Year Research Trends</h2><p class="sub">Performance comparison across 2024–2026</p><div id="home-trend-charts" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-top:20px"></div></section></div>`;
  }

  function bindETHome() {
    const q = document.querySelector('#home-year');
    const r = () => {
      const y = +q.value;
      const s = getETSummary(y);

      document.querySelector('#home-kpis').innerHTML = [
        card('Total Faculty',        s.faculty,       s.deptLabel + ' · Faculty members',        'people'),
        card('Publications',         s.publications,  s.deptLabel + ' · Scopus Publications',    'publications'),
        card('Patent records',       s.patents,       s.deptLabel + ' · Patents recorded',       'patents'),
        card('Granted patents',      s.granted,       s.deptLabel + ' · Granted status',         'patents'),
        card('Published patents',    s.published,     s.deptLabel + ' · Published status',       'patents'),
        card('Funded projects',      s.fundedProjects,s.deptLabel + ' · Projects awarded',       'funded'),
        card('Consultancy projects', s.consultancy,   s.deptLabel + ' · Industry consultancy',   'consultancy'),
        card('Research Supervisors', s.supervisors,   s.deptLabel + ' · Active supervisors',     'people'),
        card('Research Scholars',    s.scholars,      s.deptLabel + ' · Enrolled PhD scholars',  'people')
      ].join('');

      let s24 = getETSummary(2024), s25 = getETSummary(2025), s26 = getETSummary(2026);
      document.querySelector('#home-trend-charts').innerHTML = [
        threeYearChart([s24.publications, s25.publications, s26.publications], 'Publications', '#0ea5e9'),
        threeYearChart([s24.patents, s25.patents, s26.patents], 'Patents', '#10b981'),
        threeYearChart([s24.fundedProjects, s25.fundedProjects, s26.fundedProjects], 'Funded Projects', '#f59e0b'),
        threeYearChart([s24.consultancy, s25.consultancy, s26.consultancy], 'Consultancy Projects', '#8b5cf6'),
        threeYearChart([s24.scholars, s25.scholars, s26.scholars], 'Research Scholars', '#ec4899')
      ].join('');

      document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => show(b.dataset.go));
    };
    if (q) q.onchange = (e) => { _activeYear = +e.target.value; r(); };
    r();
  }

  function etDetail(type) {
    const c = etConfig[type];
    if (!c) return `<div class="empty">Section not available for E&T.</div>`;
    const etBadge = `<span class="badge" style="background:#eef4ff;color:#1E5AA8;border:1px solid #c8d8ed;margin-left:8px;font-size:11.5px;padding:3px 8px;vertical-align:middle;">E&T</span>`;
    return `${intro(c.desc + etBadge)}<div class="filterbar table-filters">${filter(type + '-year')}<input id="${type}-search" placeholder="Search ${type === 'funded' ? 'project or investigator' : type}"></div><div class="metric-grid" id="${type}-kpis"></div><div class="panel-grid" style="grid-template-columns: minmax(250px, 0.7fr) 1.3fr; align-items: start;"><section class="panel focus-panel" style="padding:16px;"><h2>3-Year Trend</h2><p class="sub">Performance across 2024–2026</p><div id="${type}-chart"></div></section><section class="panel" style="padding:16px;"><h2>Department Comparison</h2><p class="sub">Ranked performance for selected year</p><div id="${type}-list"></div></section></div><section style="margin-top:18px"><div class="table-wrap"><table><thead><tr>${c.cols.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody id="${type}-table"></tbody></table></div><p class="footer-note" id="${type}-count"></p></section>`;
  }

  function bindETDetail(type) {
    const c = etConfig[type];
    if (!c) return;
    const yr = document.querySelector('#' + type + '-year');
    const search = document.querySelector('#' + type + '-search');

    const r = () => {
      const y = +yr.value;
      const base = c.getRecords(y);
      const z = search.value.toLowerCase();
      const rows = base.filter(x => !z || Object.values(x).join(' ').toLowerCase().includes(z));

      const etScope = getETScope();
      const deptLabel = etScope && etScope.dept ? etScope.dept : 'E&T';

      document.querySelector('#' + type + '-kpis').innerHTML = c.metrics(y, base).map(x => card(x[0], x[1], x[2], c.go)).join('');

      const base24 = c.getRecords(2024);
      const base25 = c.getRecords(2025);
      const base26 = c.getRecords(2026);
      document.querySelector('#' + type + '-chart').innerHTML = threeYearChart([base24.length, base25.length, base26.length], c.label, '#0ea5e9', false);

      const unfilteredBase = c.getRecords(y, true);
      const fallbackDeptKey = (r) => {
        let d = r.departmentGroup || r.department || r.dept || r.program || r['Department'] || '';
        return getOldETLabel(d);
      };
      const deptData = rank(by(unfilteredBase, fallbackDeptKey)).filter(x => x[0] && x[0] !== '—');
      document.querySelector('#' + type + '-list').innerHTML = departmentComparisonChart(deptData, 'Departments', '#10b981');

      const emptyMsg = `No matching ${c.label.toLowerCase()} found for ${y} in ${deptLabel}.`;
      document.querySelector('#' + type + '-table').innerHTML = rows.map(c.row).join('') || `<tr><td colspan="${c.cols.length}" class="empty">${emptyMsg}</td></tr>`;

      document.querySelector('#' + type + '-count').textContent = `Showing ${rows.length} of ${base.length} records for ${y} · ${deptLabel}`;
      document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => show(b.dataset.go));
    };
    if (search) search.oninput = r;
    if (yr) yr.onchange = (e) => { _activeYear = +e.target.value; r(); };
    r();
  }

  function etUnsupported(type) {
    const LABEL = { awards: 'Research Awards', people: 'Supervisors & Scholars' };
    return `
      <div class="placeholder-view">
        <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h2 class="placeholder-title">${LABEL[type] || type}</h2>
        <p class="placeholder-desc">
          <strong>${LABEL[type] || type}</strong> data for Faculty of Engineering & Technology (E&T) will be implemented soon.
        </p>
        <button class="placeholder-back-btn" id="return-et-btn">← Return to E&T Overview</button>
      </div>
    `;
  }

 // ══════════════════════════════════════════════════════════════════════════
 // FLABS HOME PAGE
 // ══════════════════════════════════════════════════════════════════════════
 function home(){
   const dept = window.SRM_SCOPE && window.SRM_SCOPE.getSelectedDept();
   const introText = dept
     ? `Viewing research performance for <strong>${E(dept.label)}</strong>. Publications, Patents, Funded Projects, and Scholars are filtered by department; Awards reflect institution-wide performance.`
     : 'Choose a year to view institutional research performance across all FLABS departments.';
   return `${intro(introText)}<div class="filterbar home-filter">${filter('home-year')}</div><div class="metric-grid home-kpis" id="home-kpis"></div><div class="panel-grid"><section class="panel focus-panel"><h2>Research activity mix</h2><p class="sub">Composition for the selected year</p><div id="home-chart"></div></section><section class="panel"><h2>Selected-year highlights</h2><p class="sub">A concise research snapshot</p><div id="home-list"></div></section></div><div class="panel-grid" id="home-trend-charts" style="margin-top:24px;"></div>`;
 }

 function bindHome(){
   let q=document.querySelector('#home-year');
   let r=()=>{
     let y=+q.value,s=getScopedSummary(y);
     const deptNote = s.dept ? `${s.dept.label} · ` : '';
     const instNote = s.dept ? 'Institution-wide · ' : '';

     document.querySelector('#home-kpis').innerHTML=[
       card('Total faculty',s.faculty,instNote + 'Faculty members','people'),
       card('Publications',s.publications,deptNote + 'Scopus publications','publications'),
       card('Patent records',s.patents,deptNote + 'Patents filed / recorded','patents'),
       card('Granted patents',s.granted,deptNote + 'Granted status','patents'),
       card('Published patents',s.published,deptNote + 'Published status','patents'),
       card('Research awards',s.awards,instNote + 'Faculty recognitions','awards'),
       card('Research supervisors',s.supervisors,deptNote + 'Research guides','people'),
       card('Research scholars',s.scholars,deptNote + 'Registered scholars','people'),
       card('Funded projects',s.fundedProjects,instNote + 'Projects awarded','funded')
     ].join('');

     let s24 = getScopedSummary(2024), s25 = getScopedSummary(2025), s26 = getScopedSummary(2026);
     document.querySelector('#home-trend-charts').innerHTML = [
       threeYearChart([s24.publications, s25.publications, s26.publications], 'Publications', '#0ea5e9'),
       threeYearChart([s24.patents, s25.patents, s26.patents], 'Patents', '#10b981'),
       threeYearChart([s24.fundedProjects, s25.fundedProjects, s26.fundedProjects], 'Funded Projects', '#f59e0b'),
       threeYearChart([s24.awards, s25.awards, s26.awards], 'Research Awards', '#8b5cf6'),
       threeYearChart([s24.scholars, s25.scholars, s26.scholars], 'Research Scholars', '#ec4899')
     ].join('');

      document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));
    };
    if (q) q.onchange = (e) => { _activeYear = +e.target.value; r(); };
    r();
 }

 document.addEventListener('change',event=>{
   const id=event.target?.id;
   if(!/^(publications|patents|awards|people|funded)-year$/.test(id||''))return;
   document.querySelectorAll('.table-filters select').forEach(select=>{if(select!==event.target)select.value='';});
   const search=document.querySelector('#'+id.replace('-year','-search'));
   if(search)search.value='';
 },true);

 const records={publications:D.publications,patents:D.patents,awards:D.awards,people:D.scholars,funded:D.funded};

 const config={
   publications:{
     label:'Scopus publications',
     desc:'Scopus-indexed publications (filtered by selected department scope).',
     go:'publications',
     isInstWide: false,
     cols:['Year','Publication','Authors','Journal','Link'],
     row:r=>`<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(r.authors)}</td><td>${E(r.journal)}</td><td>${link(r.link)}</td></tr>`,
     key:'journal',
     caption:'Leading journals',
     metrics:(y,a)=>[['Publications',a.length,'Year total'],['Journals',Object.keys(by(a,'journal')).length,'Represented journals']]
   },
   patents:{
     label:'Patent portfolio',
     desc:'Patents filed and granted across departments (filtered by selected department scope).',
     go:'patents',
     isInstWide: false,
     cols:['Year','Patent title','Department','Inventor(s)','Status'],
     row:r=>`<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(r.departmentGroup)}</td><td>${E(r.inventors)}</td><td><span class="badge ${r.status.toLowerCase()}">${E(r.status)}</span></td></tr>`,
     key:'departmentGroup',
     caption:'Leading departments',
     metrics:(y,a)=>[['Patent records',a.length,'Year total'],['Granted patents',a.filter(x=>x.status==='Granted').length,'Granted status'],['Published patents',a.filter(x=>x.status==='Published').length,'Published status'],['Contributing groups',Object.keys(by(a,'departmentGroup')).length,'Department groups']]
   },
   awards:{
     label:'Research awards',
     desc:'Faculty research recognitions and honors (Institution-wide dataset).',
     go:'awards',
     isInstWide: true,
     cols:['Year','Faculty member','Award'],
     row:r=>`<tr><td>${r.year}</td><td>${E(r.faculty)}</td><td class="title-cell">${E(r.award)}</td></tr>`,
     key:'faculty',
     caption:'Selected-year awardees',
     metrics:(y,a)=>[['Research awards',a.length,'Award records'],['Award recipients',Object.keys(by(a,'faculty')).length,'Faculty recognised'],['Repeat awardees',rank(by(a,'faculty')).filter(x=>x[1]>1).length,'Multiple recognitions'],['Selected year',y,'Current filter']]
   },
   people:{
     label:'Supervisors & scholars',
     desc:'Registered research scholars and assigned supervisors (filtered by selected department scope).',
     go:'people',
     isInstWide: false,
     cols:['Scholar','Registration','Department','Supervisor','Mode'],
     row:r=>`<tr><td class="title-cell">${E(r.name)}</td><td>${E(r.registration)||'—'}</td><td>${E(r.departmentGroup)}</td><td>${E(r.supervisor)||'—'}</td><td>${E(r.category)}</td></tr>`,
     key:'departmentGroup',
     caption:'Scholars by department',
     metrics:(y,a)=>[['Supervisors in scope',Object.keys(by(a,'supervisor')).filter(Boolean).length,'Active research guides'],['Registered scholars',a.length,'Scholars in scope'],['Full-Time scholars',a.filter(x=>(x.category||'').toLowerCase().includes('full')).length,'Full-time mode'],['Part-Time scholars',a.filter(x=>(x.category||'').toLowerCase().includes('part')).length,'Part-time mode']]
   },
   funded:{
     label:'Funded projects',
     desc:'Awarded research projects and funding agencies (Institution-wide dataset).',
     go:'funded',
     isInstWide: true,
     cols:['Year','Project','Principal investigator','Department','Funding agency','Amount'],
     row:r=>`<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(r.principalInvestigator)||'—'}</td><td>${E(r.departmentGroup)||'—'}</td><td>${E(r.agency)}</td><td>${E(r.amount)}</td></tr>`,
     key:'agency',
     caption:'Funding agencies',
     metrics:(y,a)=>[['Funded projects',D.summary[y].fundedProjects,'Institution-wide total'],['Detailed projects',a.length,'Available records'],['Funding agencies',Object.keys(by(a,'agency')).length,'Supporting agencies'],['Selected year',y,'Current filter']]
   }
 };

 const options=(rows,key,label)=>`<select id="filter-${key}"><option value="">${label}</option>${Object.keys(by(rows,key)).sort().map(x=>`<option value="${E(x)}">${E(x)}</option>`).join('')}</select>`;
 const extraFilters=type=>type==='publications'?options(D.publications,'journal','All journals')+`<select id="filter-link"><option value="">All link statuses</option><option value="yes">Link available</option><option value="no">No link listed</option></select>`:type==='patents'?options(D.patents,'departmentGroup','All departments')+`<select id="filter-status"><option value="">All patent types</option><option>Granted</option><option>Published</option><option>Not recorded</option></select>`:type==='awards'?options(D.awards,'faculty','All faculty members'):type==='people'?options(D.scholars,'departmentGroup','All departments')+options(D.scholars,'category','All scholar modes')+options(D.scholars,'supervisor','All supervisors'):options(D.funded,'agency','All funding agencies')+options(D.funded,'principalInvestigator','All principal investigators');

   function detail(type){
    let c=config[type];
    const instBadge = c.isInstWide ? '<span class="badge" style="background:#eef4ff;color:#1E5AA8;border:1px solid #c8d8ed;margin-left:8px;font-size:11.5px;padding:3px 8px;vertical-align:middle;">Institution-wide</span>' : '';
    return `${intro(c.desc + instBadge)}<div class="filterbar table-filters">${filter(type+'-year')}${extraFilters(type)}<input id="${type}-search" placeholder="Search ${type==='people'?'scholar or supervisor':type==='funded'?'project or investigator':type}"></div><div class="metric-grid" id="${type}-kpis"></div><div class="panel-grid" style="grid-template-columns: minmax(250px, 0.7fr) 1.3fr; align-items: start;"><section class="panel focus-panel" style="padding:16px;"><h2>3-Year Trend</h2><p class="sub">Performance across 2024–2026</p><div id="${type}-chart"></div></section><section class="panel" style="padding:16px;"><h2>Department Comparison</h2><p class="sub">Ranked performance for selected year</p><div id="${type}-list"></div></section></div><section style="margin-top:18px"><div class="table-wrap"><table><thead><tr>${c.cols.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody id="${type}-table"></tbody></table></div><p class="footer-note" id="${type}-count"></p></section>`;
  }

  function bindDetail(type){
    let c=config[type],yr=document.querySelector('#'+type+'-year'),search=document.querySelector('#'+type+'-search'),all=records[type],selects=[...document.querySelectorAll('.table-filters select')];
    let r=()=>{
      let y=+yr.value;
      let base=getScopedRecords(type, all, y);
      let z=search.value.toLowerCase();
      let get=id=>document.querySelector(id)?.value||'';

      let rows=base.filter(x=>{
        if(z&&!Object.values(x).join(' ').toLowerCase().includes(z))return false;
        if(type==='publications')return(!get('#filter-journal')||x.journal===get('#filter-journal'))&&(!get('#filter-link')||(get('#filter-link')==='yes')===Boolean(x.link));
        if(type==='patents')return(!get('#filter-departmentGroup')||x.departmentGroup===get('#filter-departmentGroup'))&&(!get('#filter-status')||x.status===get('#filter-status'));
        if(type==='awards')return!get('#filter-faculty')||x.faculty===get('#filter-faculty');
        if(type==='people')return(!get('#filter-departmentGroup')||x.departmentGroup===get('#filter-departmentGroup'))&&(!get('#filter-category')||x.category===get('#filter-category'))&&(!get('#filter-supervisor')||x.supervisor===get('#filter-supervisor'));
        return(!get('#filter-agency')||x.agency===get('#filter-agency'))&&(!get('#filter-principalInvestigator')||x.principalInvestigator===get('#filter-principalInvestigator'));
      });

      const dept = window.SRM_SCOPE && window.SRM_SCOPE.getSelectedDept();
     document.querySelector('#'+type+'-kpis').innerHTML=c.metrics(y,base).map(x=>card(x[0],x[1],x[2],c.go)).join('');
     
     const base24 = getScopedRecords(type, all, 2024);
     const base25 = getScopedRecords(type, all, 2025);
     const base26 = getScopedRecords(type, all, 2026);
      document.querySelector('#'+type+'-chart').innerHTML=threeYearChart([base24.length, base25.length, base26.length], c.label, '#0ea5e9', false);
     
           const allForYear = all.filter(r => r.year === y);
      let deptData = [];
      if (window.SRM_SCOPE && type !== 'awards' && type !== 'funded') {
        deptData = window.SRM_SCOPE.FLABS_DEPARTMENTS.map(d => {
          let count = 0;
          if (type === 'publications') count = window.SRM_SCOPE.filterPublicationsByDepartment(allForYear, d).length;
          else if (type === 'patents') count = window.SRM_SCOPE.filterPatentsByDepartment(allForYear, d).length;
          else if (type === 'people') count = window.SRM_SCOPE.filterResearchCommunityByDepartment(allForYear, d).length;
          return [d.label, count];
        }).filter(x => x[1] > 0).sort((a,b) => b[1] - a[1]);
      } else {
        const flabsDeptKey = (r) => r.departmentGroup || r.department || r['Department'] || r['Dept.'] || r['Department of Authors'] || '';
        deptData = rank(by(allForYear, flabsDeptKey)).filter(x => x[0] && x[0] !== '—' && x[0] !== 'Institution-wide' && x[0] !== 'NA');
      }
     document.querySelector('#'+type+'-list').innerHTML=departmentComparisonChart(deptData, 'Departments', '#10b981');
     const emptyMsg = dept
       ? `No matching ${c.label.toLowerCase()} found for ${y} in ${E(dept.label)}.`
       : `No matching records for ${y}.`;
       
     document.querySelector('#'+type+'-table').innerHTML=rows.map(c.row).join('')||`<tr><td colspan="${c.cols.length}" class="empty">${emptyMsg}</td></tr>`;

     let countMsg = `Showing ${rows.length} of ${base.length} detailed records for ${y}.`;
     if (c.isInstWide) {
       countMsg += ' · (Institution-wide dataset)';
     } else if (dept) {
       countMsg += ` · Filtered for ${dept.label}.`;
     }
     document.querySelector('#'+type+'-count').textContent=countMsg;

     document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));
    };
    selects.forEach(x=>x.onchange = (e) => { if(e.target.id.endsWith('-year')) _activeYear = +e.target.value; r(); });
    search.oninput=r;
    r();
 }

  // ══════════════════════════════════════════════════════════════════════════
  // CHAIRMAN CAMPUS HIERARCHY NAVIGATION VIEW
  // ══════════════════════════════════════════════════════════════════════════
  function renderCampusHierarchyView(selectedNode) {
    const hasChildren = selectedNode && selectedNode.children && selectedNode.children.length > 0;

      // Leaf placeholder for unimplemented nodes (campus with no children, college with no children)
      if (!hasChildren) {
        const isLeafCampus = selectedNode.type === 'campus' || selectedNode.type === 'college';
        return `
          <div class="placeholder-view" style="padding: 40px 24px; text-align: center; max-width: 650px; margin: 40px auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="font-size: 48px; margin-bottom: 12px;">🏛️</div>
            <h2 class="placeholder-title" style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">${E(selectedNode.label)}</h2>
            <p class="placeholder-desc" style="font-size: 13.5px; color: #64748b; line-height: 1.5; margin-bottom: 24px;">
              Research performance data for <strong>${E(selectedNode.label)}</strong> is currently being indexed and will be available soon.
            </p>
            <button class="placeholder-back-btn" id="return-campuses-btn" style="background: #0284c7; color: #fff; border: none; padding: 10px 22px; border-radius: 6px; font-weight: 700; font-size: 13.5px; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.3);">
              ← Return to ALL CAMPUSES
            </button>
          </div>
        `;
      }

    // Interactive Hierarchy Navigator screen (ALL CAMPUSES / SRM Ramapuram / SRM Institute of Science and Technology)
    let breadcrumbText = 'Institutional Hierarchy Overview';
    if (selectedNode.id === 'campus_ramapuram') {
      breadcrumbText = 'SRM Ramapuram Campus Selection';
    } else if (selectedNode.id === 'campus_tiruchy') {
      breadcrumbText = 'SRM Tiruchy Campus';
    } else if (selectedNode.id === 'college_srmist') {
      breadcrumbText = 'SRM Institute of Science and Technology Faculties';
    }

    const cardsHtml = selectedNode.children.map(child => {
      let icon = '🏫';
      let badgeText = 'Select to explore';
      let badgeStyle = 'background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;';
      let descText = 'Click to open details & sub-nodes';

      if (child.id === 'campus_ramapuram') {
        icon = '🏫';
        badgeText = 'Primary Campus · 3 Colleges';
        badgeStyle = 'background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;';
        descText = 'SRM Institute of Science and Technology, SRM Dental College, Easwari Engineering College';
      } else if (child.id === 'campus_tiruchy') {
        icon = '🏫';
        badgeText = 'Tiruchy Campus';
        badgeStyle = 'background:#f1f5f9;color:#64748b;border:1px solid #cbd5e1;';
        descText = 'Research index & internal college data coming soon';
      } else if (child.id === 'college_srmist') {
        icon = '🎓';
        badgeText = '4 Faculties / Groups';
        badgeStyle = 'background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;';
        descText = 'FLABS, E&T, B.Arch, Management';
      } else if (child.id === 'college_dental') {
        icon = '🦷';
        badgeText = 'Dental Sciences';
        descText = 'SRM Dental College research data';
      } else if (child.id === 'college_easwari') {
        icon = '⚙️';
        badgeText = 'Engineering College';
        descText = 'Easwari Engineering College research data';
      } else if (child.key === 'FLABS') {
        icon = '🔬';
        badgeText = 'Active Dashboard · 22 Depts';
        badgeStyle = 'background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;';
        descText = 'Faculty of Science & Humanities research metrics, publications & patents';
      } else if (child.key === 'E&T') {
        icon = '⚡';
        badgeText = 'Active Dashboard · 15 Depts';
        badgeStyle = 'background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;';
        descText = 'Engineering & Technology research metrics, publications & patents';
      } else if (child.key === 'Management') {
        icon = '📊';
        badgeText = 'Active Dashboard · BBA & MBA';
        badgeStyle = 'background:#faf5ff;color:#7e22ce;border:1px solid #e9d5ff;';
        descText = 'Faculty of Management research metrics, BBA & MBA datasets';
      } else if (child.key === 'B.Arch') {
        icon = '🏛️';
        badgeText = 'Architecture';
        descText = 'School of Architecture research index coming soon';
      }

      return `
        <div class="campus-card" data-node-id="${E(child.id)}" style="background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;padding:22px;cursor:pointer;transition:all 0.2s ease;box-shadow:0 2px 6px rgba(0,0,0,0.04);display:flex;flex-direction:column;justify-content:space-between;min-height:160px;">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
              <span style="font-size:32px;">${icon}</span>
              <span style="display:inline-block;padding:4px 10px;border-radius:20px;font-size:11.5px;font-weight:700;${badgeStyle}">${badgeText}</span>
            </div>
            <h3 style="margin:0 0 6px 0;font-size:17px;font-weight:800;color:#0f172a;">${E(child.label)}</h3>
            <p style="margin:0;font-size:12.5px;color:#64748b;line-height:1.4;">${E(descText)}</p>
          </div>
          <div style="margin-top:16px;font-size:12.5px;font-weight:700;color:#0284c7;display:flex;align-items:center;gap:4px;">
            Select Scope →
          </div>
        </div>
      `;
    }).join('');

    let backBtnHtml = '';
    if (selectedNode.id === 'campus_ramapuram' || selectedNode.id === 'college_srmist' || selectedNode.id === 'campus_tiruchy') {
      backBtnHtml = `<button id="btn-hierarchy-back" style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:6px;padding:6px 14px;font-size:12.5px;font-weight:600;cursor:pointer;margin-bottom:16px;">← Back to ALL CAMPUSES</button>`;
    }

    return `
      <div style="max-width:1100px;margin:0 auto;padding-bottom:40px;">
        ${backBtnHtml}
        <div style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);color:#fff;border-radius:12px;padding:24px 28px;margin-bottom:24px;box-shadow:0 4px 16px rgba(15,23,42,0.12);">
          <div style="font-size:12px;font-weight:700;color:#38bdf8;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:6px;">${E(breadcrumbText)}</div>
          <h2 style="margin:0 0 8px 0;font-size:24px;font-weight:800;color:#ffffff;">${E(selectedNode.label)}</h2>
          <p style="margin:0;font-size:13.5px;color:#cbd5e1;max-width:800px;line-height:1.5;">
            Select a campus, college, or faculty below to view details and research dashboards.
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:20px;">
          ${cardsHtml}
        </div>
      </div>
    `;
  }

  function bindCampusHierarchyEvents(selectedNode) {
    const returnBtn = document.getElementById('return-campuses-btn');
    if (returnBtn) {
      returnBtn.onclick = () => {
        const rootNode = window.SRM_SCOPE ? window.SRM_SCOPE.getTree() : null;
        if (rootNode) window.SRM_SCOPE.setSelectedNode(rootNode);
      };
    }

    const backBtn = document.getElementById('btn-hierarchy-back');
    if (backBtn) {
      backBtn.onclick = () => {
        const tree = window.SRM_SCOPE ? window.SRM_SCOPE.getTree() : null;
        if (selectedNode.id === 'college_srmist') {
          const ramp = window.SRM_SCOPE.findNodeById(tree, 'campus_ramapuram');
          if (ramp) window.SRM_SCOPE.setSelectedNode(ramp);
        } else {
          // campus_tiruchy, campus_ramapuram → go back to root
          if (tree) window.SRM_SCOPE.setSelectedNode(tree);
        }
      };
    }

    document.querySelectorAll('.campus-card[data-node-id]').forEach(card => {
      card.onclick = () => {
        const nodeId = card.dataset.nodeId;
        const tree = window.SRM_SCOPE ? window.SRM_SCOPE.getTree() : null;
        const node = window.SRM_SCOPE.findNodeById(tree, nodeId);
        if (node) {
          window.SRM_SCOPE.setExpanded(nodeId, true);
          window.SRM_SCOPE.setSelectedNode(node);
          // If the node is an active group (FLABS / E&T / Management), show(home) will be called
          // by the SCOPE.onChange listener automatically
        }
      };
    });
  }

 // ══════════════════════════════════════════════════════════════════════════
 // MANAGEMENT PLACEHOLDER FOR UNSUPPORTED SECTIONS (awards, people)
 // ══════════════════════════════════════════════════════════════════════════
 function mgmtUnsupported(type) {
   const LABEL = { awards: 'Research Awards', people: 'Supervisors & Scholars' };
   return `
     <div class="placeholder-view">
       <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
         <circle cx="12" cy="12" r="10"/>
         <line x1="12" y1="8" x2="12" y2="12"/>
         <line x1="12" y1="16" x2="12.01" y2="16"/>
       </svg>
       <h2 class="placeholder-title">${LABEL[type] || type}</h2>
       <p class="placeholder-desc">
         <strong>${LABEL[type] || type}</strong> data for the Faculty of Management has not been validated yet and is not available in this dashboard.
       </p>
       <button class="placeholder-back-btn" id="return-mgmt-btn">← Return to Management Overview</button>
     </div>
   `;
 }

 // ══════════════════════════════════════════════════════════════════════════
 // MAIN SHOW FUNCTION — routes between FLABS and Management
 // ══════════════════════════════════════════════════════════════════════════
  function show(p){
    _currentPage = p;

    if (p === 'scholar-reports') {
      const user = window.SRM_AUTH ? window.SRM_AUTH.getCurrentUser() : null;
      if (user && window.SCHOLAR_MODULE) {
        nav.forEach(n => n.classList.toggle('active', n.dataset.page === 'scholar-reports'));
        window.SCHOLAR_MODULE.mount(user);
        const headerNav = document.querySelector('.site-header nav');
        if (headerNav) headerNav.classList.remove('open');
        window.scrollTo({top:0,behavior:'smooth'});
        return;
      }
    }

    const selectedNode = window.SRM_SCOPE && window.SRM_SCOPE.getSelectedNode();

   // ── CHAIRMAN CAMPUS HIERARCHY ROUTING (root / campus / college) ─────────
   // MUST come before the hasData===false fallback so the hierarchy cards render
   // correctly instead of the generic placeholder.
   if (selectedNode && (selectedNode.type === 'root' || selectedNode.type === 'campus' || selectedNode.type === 'college')) {
     title.textContent = selectedNode.label;
     nav.forEach(n => n.classList.remove('active'));
     app.innerHTML = renderCampusHierarchyView(selectedNode);
     bindCampusHierarchyEvents(selectedNode);
     document.querySelector('.site-header nav').classList.remove('open');
     window.scrollTo({top:0,behavior:'smooth'});
     return;
   }

   // ── PLACEHOLDER for nodes with hasData===false that are NOT hierarchy nodes
   // (e.g. B.Arch group, or any other unimplemented group)
   if (selectedNode && selectedNode.hasData === false) {
     title.textContent = selectedNode.label;
     nav.forEach(n => n.classList.remove('active'));
     app.innerHTML = `
       <div class="placeholder-view" style="text-align:center;padding:40px 24px;max-width:650px;margin:40px auto;background:#fff;border:1px solid #cbd5e1;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
         <div style="font-size:48px;margin-bottom:12px;">🏛️</div>
         <h2 class="placeholder-title" style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px 0;">${E(selectedNode.label)}</h2>
         <p class="placeholder-desc" style="font-size:13.5px;color:#64748b;line-height:1.5;margin-bottom:24px;">
           Research performance data for <strong>${E(selectedNode.label)}</strong> is currently being indexed and will be available soon.
         </p>
         <button class="placeholder-back-btn" id="return-campuses-btn" style="background:#0284c7;color:#fff;border:none;padding:10px 22px;border-radius:6px;font-weight:700;font-size:13.5px;cursor:pointer;box-shadow:0 2px 6px rgba(2,132,199,0.3);">
           ← Return to ALL CAMPUSES
         </button>
       </div>
     `;
     const returnBtn = document.querySelector('#return-campuses-btn');
     if (returnBtn) {
       returnBtn.onclick = () => {
         const rootNode = window.SRM_SCOPE ? window.SRM_SCOPE.getTree() : null;
         if (rootNode) window.SRM_SCOPE.setSelectedNode(rootNode);
       };
     }
     document.querySelector('.site-header nav').classList.remove('open');
     window.scrollTo({top:0,behavior:'smooth'});
     return;
   }

    // ── E&T SCOPE ROUTING ──────────────────────────────────────────────────
    if (isETScope()) {
      const etScope = getETScope();
      const scopeLabel = etScope.dept ? `E&T — ${etScope.dept}` : 'E&T';
      nav.forEach(n => n.classList.toggle('active', n.dataset.page === p));

      // Awards is not available for E&T
      if (p === 'awards') {
        title.textContent = 'Research Awards';
        nav.forEach(n => n.classList.remove('active'));
        app.innerHTML = etUnsupported(p);
        const returnBtn = document.querySelector('#return-et-btn');
        if (returnBtn) {
          returnBtn.onclick = () => show('home');
        }
        document.querySelector('.site-header nav').classList.remove('open');
        window.scrollTo({top:0,behavior:'smooth'});
        return;
      }

      title.textContent = p === 'home' ? scopeLabel + ' · Research Dashboard' : (etConfig[p] ? etConfig[p].label : p);
      nav.forEach(n => n.classList.toggle('active', n.dataset.page === p));

      if (p === 'home') {
        app.innerHTML = etHome();
        bindETHome();
      } else if (etConfig[p]) {
        app.innerHTML = etDetail(p);
        bindETDetail(p);
      } else {
        app.innerHTML = `<div class="empty">This section is not available for E&T.</div>`;
      }

      document.querySelector('.site-header nav').classList.remove('open');
      window.scrollTo({top:0,behavior:'smooth'});
      return;
    }

   // ── MANAGEMENT SCOPE ROUTING ────────────────────────────────────────────
   if (isManagementScope()) {
     const mgmtScope = getManagementScope();
     const scopeLabel = mgmtScope.dept ? `Management — ${mgmtScope.dept}` : 'Management';
     nav.forEach(n => n.classList.toggle('active', n.dataset.page === p));

     // Awards is not available for Management; People IS now supported
     if (p === 'awards') {
       title.textContent = 'Research Awards';
       nav.forEach(n => n.classList.remove('active'));
       app.innerHTML = mgmtUnsupported('awards');
       const returnBtn = document.querySelector('#return-mgmt-btn');
       if (returnBtn) {
         returnBtn.onclick = () => show('home');
       }
       document.querySelector('.site-header nav').classList.remove('open');
       window.scrollTo({top:0,behavior:'smooth'});
       return;
     }

     title.textContent = p === 'home' ? scopeLabel + ' · Research Dashboard' : (mgmtConfig[p] ? mgmtConfig[p].label : p);
     nav.forEach(n => n.classList.toggle('active', n.dataset.page === p));

     if (p === 'home') {
       app.innerHTML = mgmtHome();
       bindMgmtHome();
     } else if (mgmtConfig[p]) {
       app.innerHTML = mgmtDetail(p);
       bindMgmtDetail(p);
     } else {
       // Fallback for any unknown page
       app.innerHTML = `<div class="empty">This section is not available for Management.</div>`;
     }

     document.querySelector('.site-header nav').classList.remove('open');
     window.scrollTo({top:0,behavior:'smooth'});
     return;
   }

   // ── FLABS / INSTITUTIONAL DASHBOARD (default) ───────────────────────────
   title.textContent = p === 'home' ? names[p] : config[p].label;
   nav.forEach(n => n.classList.toggle('active', n.dataset.page === p));
   app.innerHTML = p === 'home' ? home() : detail(p);
   p === 'home' ? bindHome() : bindDetail(p);
   document.querySelector('.site-header nav').classList.remove('open');
   window.scrollTo({top:0,behavior:'smooth'});
 }
 const names={home:'Research Index Dashboard'};nav.forEach(n=>n.onclick=()=>show(n.dataset.page));document.querySelector('#menu-toggle').onclick=()=>document.querySelector('.site-header nav').classList.toggle('open');show('home');

 // Expose re-render hook so scope changes can refresh the current page
 window._SRM_DASHBOARD_REFRESH = function() { show(_currentPage); };
})();

// ── Auth user-bar wiring ───────────────────────────────────────────────────────
// Runs AFTER the dashboard IIFE. Wires the logout button and shows the
// logged-in user's name + role in the header. Dashboard rendering is untouched.
(function () {
  'use strict';
  var AUTH = window.SRM_AUTH;
  if (!AUTH) return;

  var user    = AUTH.getCurrentUser();
  var userBar = document.getElementById('user-bar');
  var userBarInfo = document.getElementById('user-bar-info');
  var logoutBtn   = document.getElementById('logout-btn');

  if (!user || !userBar) return;

  var ROLE_LABELS = {
    chairman:             'Chairman',
    rd_coordinator:       'R&D Coordinator',
    dean:                 'Dean',
    hod:                  'HOD',
    supervisor:           'Research Supervisor',
    scholar:              'Research Scholar',
    deputy_dean_research: 'Deputy Dean Research'
  };

  var roleLabel = ROLE_LABELS[user.role] || user.role;
  userBarInfo.textContent = (user.role === 'chairman' || user.name === roleLabel) ? 'Chairman' : (user.name + ' · ' + roleLabel);
  userBar.style.display = 'flex';

  // Hover effect for logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('mouseover', function () {
      logoutBtn.style.background = 'rgba(255,255,255,0.22)';
    });
    logoutBtn.addEventListener('mouseout', function () {
      logoutBtn.style.background = 'rgba(255,255,255,0.1)';
    });
    logoutBtn.addEventListener('click', function () {
      if (window.confirm('Sign out of the SRM R&D Portal?')) {
        AUTH.logout();
      }
    });
  }
}());

// ── Module 2: Sidebar + Scope Initialization ──────────────────────────────────
// Runs AFTER the dashboard IIFE and auth-wiring.
// Initializes the sidebar, auto-selects initial scope, and wires scope-change
// callbacks to re-render the dashboard and update the topbar chip.
(function () {
  'use strict';

  var AUTH    = window.SRM_AUTH;
  var SCOPE   = window.SRM_SCOPE;
  var SIDEBAR = window.SRM_SIDEBAR;

  if (!AUTH || !SCOPE || !SIDEBAR) return;

  var user = AUTH.getCurrentUser();
  if (!user) return;

  // ── 1. Determine initial scope from user profile ────────────────────────────
  var tree = SCOPE.getTree();

  if (user.scope === 'DEPARTMENT_ONLY' && user.department) {
    // HOD: auto-select their own department
    var hodDept = SCOPE.findNodeByLabel(tree, user.department, user.group);
    if (hodDept) {
      SCOPE.setSelectedNode(hodDept);
    } else {
      SCOPE.setSelectedNode({
        id: 'dept_' + user.department.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        label: user.department,
        type: 'dept',
        groupKey: user.group || 'FLABS',
        hasData: true,
        aliases: [user.department.toLowerCase()]
      });
    }
  } else if (user.group && user.role !== 'chairman') {
    // Dean / RD Coordinator: start with their group
    var grp = SCOPE.findNodeByKey(tree, user.group);
    if (grp) {
      SCOPE.setSelectedNode(grp);
    } else {
      SCOPE.selectGroup('FLABS');
    }
  } else {
    // Chairman: starts with ALL CAMPUSES (root node) selected by default on the dashboard
    SCOPE.setSelectedNode(tree);
  }

  // ── 2. Render the sidebar ───────────────────────────────────────────────────
  SIDEBAR.init();

  // ── 3. Wire scope-change → refresh dashboard ───────────────────────────────
  SCOPE.onChange(function (selectedNode) {
    if (typeof window._SRM_DASHBOARD_REFRESH === 'function') {
      window._SRM_DASHBOARD_REFRESH();
    }
  });

  // ── 4. Trigger initial dashboard refresh (now scope is set) ────────────────
  if (typeof window._SRM_DASHBOARD_REFRESH === 'function') {
    window._SRM_DASHBOARD_REFRESH();
  }

}());

