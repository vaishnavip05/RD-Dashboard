(() => {
 const D=window.RESEARCH_DATA,Y=[2024,2025,2026],app=document.querySelector('#app'),title=document.querySelector('#page-title'),nav=[...document.querySelectorAll('.nav-link')];
 const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const by=(a,k)=>a.reduce((o,x)=>{let v=typeof k==='function'?k(x):x[k];if(v)o[v]=(o[v]||0)+1;return o},{}),rank=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]);
 const card=(n,v,s,p)=>`<button class="metric metric-button" data-go="${p}"><span class="metric-label">${n}</span><span class="metric-value">${v}</span><span class="metric-note">${s} · View details →</span></button>`;
 const filter=id=>`<div class="year-filter"><label for="${id}">Filter by year</label><select id="${id}">${Y.map(y=>`<option value="${y}" ${y===2026?'selected':''}>${y}</option>`).join('')}</select></div>`;
 const intro=t=>`<section class="page-intro"><div><p class="kicker">Research performance · 2024–2026</p><p>${t}</p></div></section>`;
 const list=(rows,k,colour='')=>{let x=(Array.isArray(rows[0])?rows:rank(by(rows,k))).slice(0,8),m=Math.max(...x.map(z=>z[1]),1);return `<div class="progress-list">${x.map(([n,v],i)=>`<div class="bar-row"><span class="rank">${i+1}</span><span class="bar-name">${E(n)}</span><span class="bar-track"><span class="bar-fill ${colour}" style="width:${v/m*100}%"></span></span><strong>${v}</strong></div>`).join('')}</div>`};
 const chart=(data,c='#526dda')=>{let w=560,h=230,max=Math.max(...data.map(x=>x[1]),1)*1.15;return `<svg class="chart" viewBox="0 0 ${w} ${h}"><line x1="40" y1="192" x2="540" y2="192" stroke="#dfe5ef"/>${data.map(([n,v],i)=>{let x=75+i*165,y=192-v/max*155;return `<rect x="${x}" y="${y}" width="86" height="${192-y}" rx="5" fill="${c}"/><text x="${x+43}" y="${y-7}" text-anchor="middle" fill="#34415a" font-size="13">${v}</text><text x="${x+43}" y="215" text-anchor="middle" fill="#64708a" font-size="12">${n}</text>`}).join('')}</svg>`};
 const donut=(items,label)=>{if(!items.length)return `<div class="empty">No records are available for the selected year.</div>`;let total=items.reduce((s,x)=>s+x[1],0)||1,colors=['#0d5ea6','#2c9d98','#d29b37','#7b62b3','#cf5b58'],run=0,parts=items.map((x,i)=>{let a=run/total*360;run+=x[1];return `${colors[i]} ${a}deg ${run/total*360}deg`}).join(',');return `<div class="focus-chart"><div class="donut" style="background:conic-gradient(${parts})"><span>${total}<small>${label}</small></span></div><div class="legend">${items.map((x,i)=>`<div><i style="background:${colors[i]}"></i><span>${E(x[0])}</span><strong>${x[1]}</strong></div>`).join('')}</div></div>`};
 const focus=(type,rows,y)=>{if(type==='home'){let s=D.summary[y];return donut([['Publications',s.publications],['Patents',s.patents],['Awards',s.awards],['Projects',s.fundedProjects]],'activities')}if(type==='publications')return donut([['With link',rows.filter(x=>x.link).length],['Without link',rows.filter(x=>!x.link).length]],'records');if(type==='patents')return donut([['Granted',rows.filter(x=>x.status==='Granted').length],['Published',rows.filter(x=>x.status==='Published').length],['Other',rows.filter(x=>!['Granted','Published'].includes(x.status)).length]],'patents');if(type==='people')return donut(rank(by(rows,'category')).slice(0,4),'scholars');if(type==='awards')return donut([['Single award',rank(by(rows,'faculty')).filter(x=>x[1]===1).length],['Repeat awardee',rank(by(rows,'faculty')).filter(x=>x[1]>1).length]],'awardees');return donut(rank(by(rows,'agency')).slice(0,4),'projects')};
 const link=v=>v?`<a class="link" target="_blank" rel="noopener" href="${/^http/.test(v)?E(v):'https://doi.org/'+E(v)}">Open ↗</a>`:'—';

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

  function getETPublications(year) {
    const p2024 = (window.ET_PUBLICATIONS_2024 || []).map(r => normET(r, 2024));
    const p2025 = (window.ET_PUBLICATIONS_2025 || []).map(r => normET(r, 2025));
    const p2026 = (window.ET_PUBLICATIONS_2026 || []).map(r => normET(r, 2026));
    const all = [...p2024, ...p2025, ...p2026];

    const etScope = getETScope();
    let src = all;
    if (etScope && etScope.dept) {
      src = src.filter(r => (r.dept || '').toLowerCase() === etScope.dept.toLowerCase());
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

  function getETPatents(year) {
    const raw = window.ET_PATENTS || [];
    let src = raw.map(normPat);

    const etScope = getETScope();
    if (etScope && etScope.dept) {
      src = src.filter(r => (r.departmentGroup || '').toLowerCase().includes(etScope.dept.toLowerCase()));
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

  function getETFunded(year) {
    const raw = window.ET_FUNDED_PROJECTS || [];
    let src = raw.map(normFund);

    const etScope = getETScope();
    if (etScope && etScope.dept) {
      src = src.filter(r => (r.department || '').toLowerCase().includes(etScope.dept.toLowerCase()));
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

  function getETConsultancy(year) {
    const raw = (window.ET_CONSULTANCY_PROJECTS && window.ET_CONSULTANCY_PROJECTS.records) || [];
    let src = raw.map(normConsult);

    const etScope = getETScope();
    if (etScope && etScope.dept) {
      src = src.filter(r => (r.department || '').toLowerCase().includes(etScope.dept.toLowerCase()));
    }

    return year ? src.filter(r => r.year === year) : src;
  }

  function getETPeopleRecords(year) {
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

    const clean = recs.filter(r => r && r.scholar && !['FT', 'PT (Internal )', 'PT(External)', 'Total'].includes(r.scholar.trim()));

    const etScope = getETScope();
    if (etScope && etScope.dept) {
      return clean.filter(r => (r.department || r.program || '').toLowerCase().includes(etScope.dept.toLowerCase()));
    }
    return clean;
  }

  // Exact hardcoded faculty counts — not calculated from any dataset
  const ET_FACULTY = { 2024: 326, 2025: 341, 2026: 360 };

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
    return {
      faculty: ET_FACULTY[y] || 0,
      publications: pubs.length,
      patents: pats.length,
      granted,
      published,
      fundedProjects: fund.length,
      consultancy: cons.length,
      supervisors: supData.supervisorCount || 0,
      scholars: supData.scholarCount || 0,
      deptLabel
    };
  }

 // ── Management Data Filtering ──────────────────────────────────────────────
 function getMgmtRecords(dataType, year) {
   const M = window.MANAGEMENT_RESEARCH_DATA;
   if (!M) return [];
   const mgmtScope = getManagementScope();
   const deptFilter = mgmtScope && mgmtScope.dept ? mgmtScope.dept : null;

   let src = [];
   if (dataType === 'publications') src = M.publications;
   else if (dataType === 'patents') src = M.patents;
   else if (dataType === 'funded') src = M.fundedProjects;
   else return [];

   // Filter by department if a specific dept is selected
   if (deptFilter) {
     src = src.filter(r => r.department === deptFilter);
   }

   // Filter by year — if year not found in dataset return all-time for "all years" view
   // but honour the year selector on the page
   const filtered = year ? src.filter(r => r.year === year) : src;
   return filtered;
 }

  // Exact hardcoded counts
  const MGMT_PEOPLE = {
    2023: { supervisors: 10, scholars: 12 },
    2024: { supervisors: 12, scholars: 13 },
    2025: { supervisors: 12, scholars: 16 }
  };

  function getMgmtSummary(y) {
    const mgmtScope = getManagementScope();
    const deptLabel = mgmtScope && mgmtScope.dept ? mgmtScope.dept : 'Management';
    const pubs  = getMgmtRecords('publications', y);
    const pats  = getMgmtRecords('patents', y);
    const fund  = getMgmtRecords('funded', y);
    const granted = pats.filter(r => r.status === 'Granted').length;
    const published = pats.filter(r => r.status === 'Published').length;
    const people = MGMT_PEOPLE[y] || { supervisors: 0, scholars: 0 };
    return { publications: pubs.length, patents: pats.length, granted, published, fundedProjects: fund.length, supervisors: people.supervisors, scholars: people.scholars, deptLabel };
  }

 // ── Dataset-Specific Scoped Filtering (FLABS / Module 3) ──────────────────
 function getScopedRecords(type, dataset, year) {
   const SCOPE = window.SRM_SCOPE;
   if (!SCOPE) return dataset.filter(r => r.year === year);
   const dept = SCOPE.getSelectedDept();

   if (type === 'patents') {
     return SCOPE.filterPatentsByDepartment(dataset, dept, year);
   }
   if (type === 'people') {
     return SCOPE.filterResearchCommunityByDepartment(dataset, dept, year);
   }
   // Publications, Awards, and Funded Projects are strictly institution-wide for FLABS
   return dataset.filter(r => r.year === year);
 }

 // Build live KPI counts for the home page (FLABS path)
 function getScopedSummary(y) {
   const SCOPE = window.SRM_SCOPE;
   const dept = SCOPE && SCOPE.getSelectedDept();

   const pubs     = D.publications.filter(r => r.year === y);
   const awards   = D.awards.filter(r => r.year === y);
   const funded   = D.funded.filter(r => r.year === y);

   const patents  = SCOPE ? SCOPE.filterPatentsByDepartment(D.patents, dept, y) : D.patents.filter(r => r.year === y);
   const scholars = SCOPE ? SCOPE.filterResearchCommunityByDepartment(D.scholars, dept, y) : D.scholars.filter(r => r.year === y);

   const granted  = patents.filter(r => r.status === 'Granted').length;
   const published = patents.filter(r => r.status === 'Published').length;
   const supervisorSet = new Set(scholars.map(r => r.supervisor).filter(Boolean));

   return {
     faculty:        D.summary[y].faculty,
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
   return `${intro(introText)}<div class="filterbar home-filter">${filter('home-year')}</div><div class="metric-grid home-kpis" id="home-kpis"></div><div class="panel-grid"><section class="panel focus-panel"><h2>Research activity mix</h2><p class="sub">Composition for the selected year</p><div id="home-chart"></div></section><section class="panel"><h2>Selected-year highlights</h2><p class="sub">A concise research snapshot</p><div id="home-list"></div></section></div>`;
 }

 function bindMgmtHome() {
   const q = document.querySelector('#home-year');
   const r = () => {
     const y = +q.value;
     const s = getMgmtSummary(y);

      document.querySelector('#home-kpis').innerHTML = [
        card('Publications',         s.publications,  s.deptLabel + ' \u00b7 Publications',           'publications'),
        card('Patent records',       s.patents,        s.deptLabel + ' \u00b7 Patents recorded',       'patents'),
        card('Granted patents',      s.granted,        s.deptLabel + ' \u00b7 Granted status',         'patents'),
        card('Published patents',    s.published,      s.deptLabel + ' \u00b7 Published status',       'patents'),
        card('Funded projects',      s.fundedProjects, s.deptLabel + ' \u00b7 Projects awarded',       'funded'),
        card('Research Supervisors', s.supervisors,    s.deptLabel + ' \u00b7 Research supervisors',   'publications'),
        card('Research Scholars',    s.scholars,       s.deptLabel + ' \u00b7 Enrolled PhD scholars',  'publications')
      ].join('');
     // Donut chart: mix of publications, patents, funded
     const donutItems = [
       ['Publications', s.publications],
       ['Patents', s.patents],
       ['Funded projects', s.fundedProjects]
     ].filter(x => x[1] > 0);
     document.querySelector('#home-chart').innerHTML = donutItems.length
       ? donut(donutItems, 'activities')
       : `<div class="empty">No records for ${y}.</div>`;

     document.querySelector('#home-list').innerHTML = list([
       ['Publications (' + s.deptLabel + ')', s.publications],
       ['Patents (' + s.deptLabel + ')', s.patents],
       ['Funded projects (' + s.deptLabel + ')', s.fundedProjects]
     ], null, 'gold');

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
     cols: ['Year', 'Project', 'Principal investigator', 'Funding agency', 'Amount'],
     row: r => `<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(r.principalInvestigator) || '—'}</td><td>${E(r.agency)}</td><td>${E(r.amount)}</td></tr>`,
     key: 'agency',
     caption: 'Funding agencies',
     metrics: (y, a) => [
       ['Funded projects', a.length, 'Dept-filtered total'],
       ['Detailed projects', a.length, 'Available records'],
       ['Funding agencies', Object.keys(by(a, 'agency')).length, 'Supporting agencies'],
       ['Selected year', y, 'Current filter']
     ]
   }
 };

 function mgmtDetail(type) {
   const c = mgmtConfig[type];
   if (!c) return `<div class="empty">Unknown section.</div>`;
   const mgmtBadge = `<span class="badge" style="background:#eef4ff;color:#075da0;border:1px solid #c8d8ed;margin-left:8px;font-size:11.5px;padding:3px 8px;vertical-align:middle;">Management</span>`;
   return `${intro(c.desc + mgmtBadge)}<div class="filterbar table-filters">${filter(type + '-year')}<input id="${type}-search" placeholder="Search ${type === 'funded' ? 'project or investigator' : type}"></div><div class="metric-grid" id="${type}-kpis"></div><div class="panel-grid"><section class="panel focus-panel"><h2>Selected-year distribution</h2><p class="sub">${c.label} composition for chosen year</p><div id="${type}-chart"></div></section><section class="panel"><h2>${c.caption}</h2><p class="sub">For the selected year</p><div id="${type}-list"></div></section></div><section style="margin-top:18px"><div class="table-wrap"><table><thead><tr>${c.cols.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody id="${type}-table"></tbody></table></div><p class="footer-note" id="${type}-count"></p></section>`;
 }

 function bindMgmtDetail(type) {
   const c = mgmtConfig[type];
   if (!c) return;
   const yr = document.querySelector('#' + type + '-year');
   const search = document.querySelector('#' + type + '-search');

   const r = () => {
     const y = +yr.value;
     const base = getMgmtRecords(type === 'funded' ? 'funded' : type, y);
     const z = search.value.toLowerCase();
     const rows = base.filter(x => !z || Object.values(x).join(' ').toLowerCase().includes(z));

     const mgmtScope = getManagementScope();
     const deptLabel = mgmtScope && mgmtScope.dept ? mgmtScope.dept : 'Management';

     document.querySelector('#' + type + '-kpis').innerHTML = c.metrics(y, base).map(x => card(x[0], x[1], x[2], c.go)).join('');

     // Charts
     if (type === 'publications') {
       document.querySelector('#' + type + '-chart').innerHTML = donut([['With link', base.filter(x => x.link).length], ['Without link', base.filter(x => !x.link).length]], 'records');
     } else if (type === 'patents') {
       document.querySelector('#' + type + '-chart').innerHTML = donut([
         ['Granted', base.filter(x => x.status === 'Granted').length],
         ['Published', base.filter(x => x.status === 'Published').length],
         ['Other', base.filter(x => !['Granted', 'Published'].includes(x.status)).length]
       ].filter(x => x[1] > 0), 'patents');
     } else {
       document.querySelector('#' + type + '-chart').innerHTML = donut(rank(by(base, 'agency')).slice(0, 4), 'projects');
     }

     document.querySelector('#' + type + '-list').innerHTML = list(base, type === 'patents' ? 'departmentGroup' : c.key, type === 'patents' ? 'teal' : 'gold');

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
      getRecords: y => getETPublications(y),
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
      getRecords: y => getETPatents(y),
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
      cols: ['Year', 'Project', 'Principal investigator', 'Funding agency', 'Amount'],
      row: r => `<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(r.principalInvestigator)}</td><td>${E(r.agency)}</td><td>${E(r.amount)}</td></tr>`,
      key: 'agency',
      caption: 'Funding agencies',
      getRecords: y => getETFunded(y),
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
      getRecords: y => getETConsultancy(y),
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
      getRecords: y => getETPeopleRecords(y),
      metrics: (y, a) => {
        const yData = (window.ET_SUPERVISORS_SCHOLARS && window.ET_SUPERVISORS_SCHOLARS.yearlyData && window.ET_SUPERVISORS_SCHOLARS.yearlyData[y]) || {};
        return [
          ['Research Scholars', yData.scholarCount || a.length, 'Enrolled PhD scholars for ' + y],
          ['Research Supervisors', yData.supervisorCount || Object.keys(by(a, 'supervisor')).length, 'Active supervisors for ' + y],
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
    return `${intro(introText)}<div class="filterbar home-filter">${filter('home-year')}</div><div class="metric-grid home-kpis" id="home-kpis"></div><div class="panel-grid"><section class="panel focus-panel"><h2>Research activity mix</h2><p class="sub">Composition for the selected year</p><div id="home-chart"></div></section><section class="panel"><h2>Selected-year highlights</h2><p class="sub">A concise research snapshot</p><div id="home-list"></div></section></div>`;
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

      const donutItems = [
        ['Publications', s.publications],
        ['Patents', s.patents],
        ['Funded projects', s.fundedProjects],
        ['Consultancy', s.consultancy]
      ].filter(x => x[1] > 0);

      document.querySelector('#home-chart').innerHTML = donutItems.length
        ? donut(donutItems, 'activities')
        : `<div class="empty">No records for ${y}.</div>`;

      document.querySelector('#home-list').innerHTML = list([
        ['Publications (' + s.deptLabel + ')', s.publications],
        ['Patents (' + s.deptLabel + ')', s.patents],
        ['Funded projects (' + s.deptLabel + ')', s.fundedProjects],
        ['Consultancy projects (' + s.deptLabel + ')', s.consultancy],
        ['Research Supervisors (' + s.deptLabel + ')', s.supervisors],
        ['Research Scholars (' + s.deptLabel + ')', s.scholars]
      ], null, 'gold');

      document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => show(b.dataset.go));
    };
    if (q) q.onchange = r;
    r();
  }

  function etDetail(type) {
    const c = etConfig[type];
    if (!c) return `<div class="empty">Section not available for E&T.</div>`;
    const etBadge = `<span class="badge" style="background:#eef4ff;color:#075da0;border:1px solid #c8d8ed;margin-left:8px;font-size:11.5px;padding:3px 8px;vertical-align:middle;">E&T</span>`;
    return `${intro(c.desc + etBadge)}<div class="filterbar table-filters">${filter(type + '-year')}<input id="${type}-search" placeholder="Search ${type === 'funded' ? 'project or investigator' : type}"></div><div class="metric-grid" id="${type}-kpis"></div><div class="panel-grid"><section class="panel focus-panel"><h2>Selected-year distribution</h2><p class="sub">${c.label} composition for chosen year</p><div id="${type}-chart"></div></section><section class="panel"><h2>${c.caption}</h2><p class="sub">For the selected year</p><div id="${type}-list"></div></section></div><section style="margin-top:18px"><div class="table-wrap"><table><thead><tr>${c.cols.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody id="${type}-table"></tbody></table></div><p class="footer-note" id="${type}-count"></p></section>`;
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

      if (type === 'publications') {
        document.querySelector('#' + type + '-chart').innerHTML = donut([
          ['With link', base.filter(x => x.link).length],
          ['Without link', base.filter(x => !x.link).length]
        ], 'records');
      } else if (type === 'patents') {
        document.querySelector('#' + type + '-chart').innerHTML = donut([
          ['Granted', base.filter(x => (x.status||'').toLowerCase() === 'granted').length],
          ['Published', base.filter(x => (x.status||'').toLowerCase() === 'published').length],
          ['Other', base.filter(x => !['granted', 'published'].includes((x.status||'').toLowerCase())).length]
        ].filter(x => x[1] > 0), 'patents');
      } else if (type === 'people') {
        document.querySelector('#' + type + '-chart').innerHTML = donut(rank(by(base, 'supervisor')).slice(0, 4), 'scholars');
      } else {
        document.querySelector('#' + type + '-chart').innerHTML = donut(rank(by(base, 'agency')).slice(0, 4), 'projects');
      }

      document.querySelector('#' + type + '-list').innerHTML = list(base, type === 'patents' ? 'departmentGroup' : c.key, type === 'patents' ? 'teal' : 'gold');

      const emptyMsg = `No matching ${c.label.toLowerCase()} found for ${y} in ${deptLabel}.`;
      document.querySelector('#' + type + '-table').innerHTML = rows.map(c.row).join('') || `<tr><td colspan="${c.cols.length}" class="empty">${emptyMsg}</td></tr>`;

      document.querySelector('#' + type + '-count').textContent = `Showing ${rows.length} of ${base.length} records for ${y} · ${deptLabel}`;
      document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => show(b.dataset.go));
    };
    if (search) search.oninput = r;
    if (yr) yr.onchange = r;
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
     ? `Viewing research performance for <strong>${E(dept.label)}</strong>. Patents and Scholars are filtered by department; Publications, Awards, and Funded Projects reflect institution-wide performance.`
     : 'Choose a year to view institutional research performance across all FLABS departments.';
   return `${intro(introText)}<div class="filterbar home-filter">${filter('home-year')}</div><div class="metric-grid home-kpis" id="home-kpis"></div><div class="panel-grid"><section class="panel focus-panel"><h2>Research activity mix</h2><p class="sub">Composition for the selected year</p><div id="home-chart"></div></section><section class="panel"><h2>Selected-year highlights</h2><p class="sub">A concise research snapshot</p><div id="home-list"></div></section></div>`;
 }

 function bindHome(){
   let q=document.querySelector('#home-year');
   let r=()=>{
     let y=+q.value,s=getScopedSummary(y);
     const deptNote = s.dept ? `${s.dept.label} · ` : '';
     const instNote = s.dept ? 'Institution-wide · ' : '';

     document.querySelector('#home-kpis').innerHTML=[
       card('Total faculty',s.faculty,instNote + 'Faculty members','people'),
       card('Publications',s.publications,instNote + 'Scopus publications','publications'),
       card('Patent records',s.patents,deptNote + 'Patents filed / recorded','patents'),
       card('Granted patents',s.granted,deptNote + 'Granted status','patents'),
       card('Published patents',s.published,deptNote + 'Published status','patents'),
       card('Research awards',s.awards,instNote + 'Faculty recognitions','awards'),
       card('Research supervisors',s.supervisors,deptNote + 'Research guides','people'),
       card('Research scholars',s.scholars,deptNote + 'Registered scholars','people'),
       card('Funded projects',s.fundedProjects,instNote + 'Projects awarded','funded')
     ].join('');

     document.querySelector('#home-chart').innerHTML=focus('home',[],y);
     document.querySelector('#home-list').innerHTML=list([
       ['Faculty (Inst.)',s.faculty],
       ['Supervisors (' + (s.dept ? s.dept.label : 'FLABS') + ')',s.supervisors],
       ['Scholars (' + (s.dept ? s.dept.label : 'FLABS') + ')',s.scholars]
     ],null,'gold');

     document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));
   };
   q.onchange=r;
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
     desc:'Scopus-indexed publications compiled at the institutional level (Institution-wide dataset).',
     go:'publications',
     isInstWide: true,
     cols:['Year','Publication','Authors','Journal','Link'],
     row:r=>`<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(r.authors)}</td><td>${E(r.journal)}</td><td>${link(r.link)}</td></tr>`,
     key:'journal',
     caption:'Leading journals',
     metrics:(y,a)=>[['Publications',D.summary[y].publications,'Institution-wide total'],['Journals',Object.keys(by(a,'journal')).length,'Represented journals']]
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
     cols:['Year','Project','Principal investigator','Funding agency','Amount'],
     row:r=>`<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(r.principalInvestigator)||'—'}</td><td>${E(r.agency)}</td><td>${E(r.amount)}</td></tr>`,
     key:'agency',
     caption:'Funding agencies',
     metrics:(y,a)=>[['Funded projects',D.summary[y].fundedProjects,'Institution-wide total'],['Detailed projects',a.length,'Available records'],['Funding agencies',Object.keys(by(a,'agency')).length,'Supporting agencies'],['Selected year',y,'Current filter']]
   }
 };

 const options=(rows,key,label)=>`<select id="filter-${key}"><option value="">${label}</option>${Object.keys(by(rows,key)).sort().map(x=>`<option value="${E(x)}">${E(x)}</option>`).join('')}</select>`;
 const extraFilters=type=>type==='publications'?options(D.publications,'journal','All journals')+`<select id="filter-link"><option value="">All link statuses</option><option value="yes">Link available</option><option value="no">No link listed</option></select>`:type==='patents'?options(D.patents,'departmentGroup','All departments')+`<select id="filter-status"><option value="">All patent types</option><option>Granted</option><option>Published</option><option>Not recorded</option></select>`:type==='awards'?options(D.awards,'faculty','All faculty members'):type==='people'?options(D.scholars,'departmentGroup','All departments')+options(D.scholars,'category','All scholar modes')+options(D.scholars,'supervisor','All supervisors'):options(D.funded,'agency','All funding agencies')+options(D.funded,'principalInvestigator','All principal investigators');

 function detail(type){
   let c=config[type];
   const instBadge = c.isInstWide ? '<span class="badge" style="background:#eef4ff;color:#075da0;border:1px solid #c8d8ed;margin-left:8px;font-size:11.5px;padding:3px 8px;vertical-align:middle;">Institution-wide</span>' : '';
   return `${intro(c.desc + instBadge)}<div class="filterbar table-filters">${filter(type+'-year')}${extraFilters(type)}<input id="${type}-search" placeholder="Search ${type==='people'?'scholar or supervisor':type==='funded'?'project or investigator':type}"></div><div class="metric-grid" id="${type}-kpis"></div><div class="panel-grid"><section class="panel focus-panel"><h2>Selected-year distribution</h2><p class="sub">${c.label} composition for the chosen year</p><div id="${type}-chart"></div></section><section class="panel"><h2>${type==='people'?'Supervisor workload':c.caption}</h2><p class="sub">For the selected year</p><div id="${type}-list"></div></section></div><section style="margin-top:18px"><div class="table-wrap"><table><thead><tr>${c.cols.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody id="${type}-table"></tbody></table></div><p class="footer-note" id="${type}-count"></p></section>`;
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
     document.querySelector('#'+type+'-chart').innerHTML=focus(type,base,y);
     document.querySelector('#'+type+'-list').innerHTML=list(base,type==='people'?'supervisor':c.key,type==='patents'||type==='people'?'teal':type==='awards'||type==='funded'?'gold':'');
     
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
   selects.forEach(x=>x.onchange=r);
   search.oninput=r;
   r();
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
   const selectedNode = window.SRM_SCOPE && window.SRM_SCOPE.getSelectedNode();

   // Check if the selected node is a placeholder (hasData === false) for non-Management groups
   if (selectedNode && selectedNode.hasData === false) {
     title.textContent = selectedNode.label;
     nav.forEach(n => n.classList.remove('active'));
     app.innerHTML = `
       <div class="placeholder-view">
         <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
           <circle cx="12" cy="12" r="10"/>
           <line x1="12" y1="8" x2="12" y2="12"/>
           <line x1="12" y1="16" x2="12.01" y2="16"/>
         </svg>
         <h2 class="placeholder-title">${E(selectedNode.label)}</h2>
         <p class="placeholder-desc">Research performance data for <strong>${E(selectedNode.label)}</strong> will be implemented soon.</p>
         <button class="placeholder-back-btn" id="return-flabs-btn">Return to FLABS Dashboard</button>
       </div>
     `;
     const returnBtn = document.querySelector('#return-flabs-btn');
     if (returnBtn) {
       returnBtn.onclick = () => {
         const flabsNode = window.SRM_SCOPE.findNodeByKey(window.SRM_SCOPE.getTree(), 'FLABS');
         if (flabsNode) window.SRM_SCOPE.setSelectedNode(flabsNode);
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

     // Awards and People are not available for Management
     if (p === 'awards' || p === 'people') {
       title.textContent = p === 'awards' ? 'Research Awards' : 'Supervisors & Scholars';
       nav.forEach(n => n.classList.remove('active'));
       app.innerHTML = mgmtUnsupported(p);
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
    chairman:       'Chairman',
    rd_coordinator: 'R&D Coordinator',
    dean:           'Dean',
    hod:            'HOD'
  };

  // Build display text: "FLABS Dean" or "Chairman" or "MCA HOD"
  var roleLabel = ROLE_LABELS[user.role] || user.role;
  userBarInfo.textContent = user.name + ' · ' + roleLabel;
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
  } else if (user.group) {
    // Dean / RD Coordinator: start with their group
    var grp = SCOPE.findNodeByKey(tree, user.group);
    if (grp) {
      SCOPE.setSelectedNode(grp);
    } else {
      SCOPE.selectGroup('FLABS');
    }
  } else {
    // Chairman: starts with FLABS selected by default on the dashboard
    var flabsGrp = SCOPE.findNodeByKey(tree, 'FLABS');
    if (flabsGrp) {
      SCOPE.setSelectedNode(flabsGrp);
    }
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
