(() => {
 const D = new Proxy({}, {
   get(target, prop) {
     return (window.RESEARCH_DATA && window.RESEARCH_DATA[prop]) || [];
   }
 }), Y=[2024,2025,2026],app=document.querySelector('#app'),title=document.querySelector('#page-title'),nav=[...document.querySelectorAll('.nav-link')];
 let _activeYear = 2026;
 const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const by=(a,k)=>a.reduce((o,x)=>{let v=typeof k==='function'?k(x):x[k];if(v)o[v]=(o[v]||0)+1;return o},{}),rank=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]);
 const card=(n,v,s,p)=>`<button class="metric metric-button" data-go="${p}"><span class="metric-label">${n}</span><span class="metric-value">${v}</span><span class="metric-note">${s} · View details →</span></button>`;
 const filter=(id,customY=null)=>{ const selY = customY || _activeYear; return `<div class="year-filter"><label for="${id}">Filter by year</label><select id="${id}">${Y.map(y=>`<option value="${y}" ${y===selY?'selected':''}>${y}</option>`).join('')}</select></div>`; };
 const intro=t=>`<section class="page-intro"><div><p class="kicker">Research performance · 2024–2026</p><p>${t}</p></div></section>`;
 const list=(rows,k,colour='')=>{let x=(Array.isArray(rows[0])?rows:rank(by(rows,k))).slice(0,8),m=Math.max(...x.map(z=>z[1]),1);return `<div class="progress-list">${x.map(([n,v],i)=>`<div class="bar-row"><span class="rank">${i+1}</span><span class="bar-name">${E(n)}</span><span class="bar-track"><span class="bar-fill ${colour}" style="width:${v/m*100}%"></span></span><strong>${v}</strong></div>`).join('')}</div>`};
 const chart=(data,c='#526dda')=>{let w=560,h=230,max=Math.max(...data.map(x=>x[1]),1)*1.15;return `<svg class="chart" viewBox="0 0 ${w} ${h}"><line x1="40" y1="192" x2="540" y2="192" stroke="#dfe5ef"/>${data.map(([n,v],i)=>{let x=75+i*165,y=192-v/max*155;return `<rect x="${x}" y="${y}" width="86" height="${192-y}" rx="5" fill="${c}"/><text x="${x+43}" y="${y-7}" text-anchor="middle" fill="#34415a" font-size="13">${v}</text><text x="${x+43}" y="215" text-anchor="middle" fill="#64708a" font-size="12">${n}</text>`}).join('')}</svg>`};
 const donut=(items,label)=>{if(!items.length)return `<div class="empty">No records are available for the selected year.</div>`;let total=items.reduce((s,x)=>s+x[1],0)||1,colors=['#0d5ea6','#2c9d98','#d29b37','#7b62b3','#cf5b58'],run=0,parts=items.map((x,i)=>{let a=run/total*360;run+=x[1];return `${colors[i]} ${a}deg ${run/total*360}deg`}).join(',');return `<div class="focus-chart"><div class="donut" style="background:conic-gradient(${parts})"><span>${total}<small>${label}</small></span></div><div class="legend">${items.map((x,i)=>`<div><i style="background:${colors[i]}"></i><span>${E(x[0])}</span><strong>${x[1]}</strong></div>`).join('')}</div></div>`};
 const focus=(type,rows,y)=>{if(type==='home'){let s=getScopedSummary(y);return donut([['Publications',s.publications],['Patents',s.patents],['Awards',s.awards],['Projects',s.fundedProjects]],'activities')}if(type==='publications')return donut([['With link',rows.filter(x=>x.link).length],['Without link',rows.filter(x=>!x.link).length]],'records');if(type==='patents')return donut([['Granted',rows.filter(x=>x.status==='Granted').length],['Published',rows.filter(x=>x.status==='Published').length],['Other',rows.filter(x=>!['Granted','Published'].includes(x.status)).length]],'patents');if(type==='people')return donut(rank(by(rows,'category')).slice(0,4),'scholars');if(type==='awards')return donut([['Single award',rank(by(rows,'faculty')).filter(x=>x[1]===1).length],['Repeat awardee',rank(by(rows,'faculty')).filter(x=>x[1]>1).length]],'awardees');return donut(rank(by(rows,'agency')).slice(0,4),'projects')};
 const link=v=>v?`<a class="link" target="_blank" rel="noopener" href="${/^http/.test(v)?E(v):'https://doi.org/'+E(v)}">Open ↗</a>`:'—';
 const formatFundedStatus = (status) => {
   const raw = (status || '').trim();
   if (!raw || raw === '—') return '—';
   const s = raw.toLowerCase();
   if (s === 'sanctioned') {
     return '<span class="badge sanctioned">Sanctioned</span>';
   }
   if (s === 'pac level' || s === 'pac') {
     return '<span class="badge pac-level">PAC Level</span>';
   }
   if (s === 'submitted') {
     return '<span class="badge submitted">Submitted</span>';
   }
   return `<span class="badge ${s}">${E(raw)}</span>`;
 };
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

  function getCollegeFacultyCount(college, year, deptLabel) {
    const counts = (window.SRM_FACULTY_COUNTS && window.SRM_FACULTY_COUNTS[college] && window.SRM_FACULTY_COUNTS[college][year]) || {};
    if (!deptLabel) {
      return Object.values(counts).reduce((sum, n) => sum + (Number(n) || 0), 0);
    }
    if (counts[deptLabel] !== undefined) return Number(counts[deptLabel]) || 0;
    const targetLower = deptLabel.toLowerCase().trim();
    for (const [k, v] of Object.entries(counts)) {
      if (k.toLowerCase().trim() === targetLower) return Number(v) || 0;
    }
    if (college === 'E&T') {
      for (const [k, v] of Object.entries(counts)) {
        if (typeof matchETDept === 'function' && matchETDept(k, deptLabel)) return Number(v) || 0;
      }
    }
    return 0;
  }

  function matchETDept(rawDept, target) {
    if (!rawDept || !target) return false;
    const d = rawDept.toLowerCase().trim();
    const t = target.toLowerCase().trim();
    if (d === t) return true;
    
    const norm = (str) => {
      let s = str.toLowerCase().replace(/^department of\s+/i, '').replace(/ engineering/g, '').trim();
      if (s === 'cse' || s === 'cse core' || s === 'cse-core' || s === 'computer science and engineering') return 'cse';
      if (s.includes('aiml') || s.includes('ai & ml') || s.includes('ai&ml') || s === 'aiml & ai') return 'aiml & ai';
      if (s.includes('bda') || s.includes('big data') || s === 'bda&cc') return 'bda&cc';
      if (s.includes('iot') || s.includes('csbs') || s === 'iot&csbs') return 'iot&csbs';
      if (s.includes('cse-cs') || s.includes('cyber security') || s === 'cs') return 'cse-cs';
      if (s.includes('cse-gt') || s.includes('gt') || s.includes('gaming')) return 'cse-gt';
      if (s === 'it' || s.includes('information tech')) return 'it';
      if (s === 'ece' || s.includes('electronics and comm')) return 'ece';
      if (s === 'eee' || s.includes('electrical')) return 'eee';
      if (s === 'mech' || s.includes('mechanical')) return 'mech';
      if (s === 'civil') return 'civil';
      if (s.includes('biotech')) return 'biotech';
      if (s === 'bme' || s.includes('biomedical')) return 'bme';
      if (s.includes('math')) return 'maths';
      if (s.includes('chem')) return 'chem';
      if (s.includes('efl') || s.includes('english') || s === 'lcs/efl' || s === 'lcs') return 'efl';
      if (s.includes('phy')) return 'phy';
      return s;
    };

    return norm(d) === norm(t) || d.includes(t) || t.includes(d);
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

  // ── Canonical Sidebar Department Sequences & Resolvers ─────────────────────
  const FLABS_SIDEBAR_DEPTS = [
    'MCA & MCA Gen AI',
    'BCA & BCA Gen AI',
    'Data Science',
    'Computer Science',
    'Computer Science (Batch II)',
    'Cyber Security',
    'AI & ML',
    'Mathematics',
    'Biotechnology & Psychology',
    'Commerce General (Batch I)',
    'Commerce General & CS (Batch II)',
    'Commerce A & F',
    'Commerce PA & ISM',
    'Fashion Designing',
    'Visual Communication',
    'LCS'
  ];

  const ET_SIDEBAR_DEPTS = [
    'CSE',
    'AIML & AI',
    'BDA&CC',
    'IOT&CSBS',
    'CSE-CS',
    'CSE-GT',
    'MECH',
    'IT',
    'ECE',
    'EEE',
    'PHY',
    'CIVIL',
    'BME',
    'CHEM',
    'EFL',
    'MATHS',
    'BIOTECH'
  ];

  const MGMT_SIDEBAR_DEPTS = [
    'BBA',
    'MBA'
  ];

  function getFLABSDept(r) {
    if (!r) return '';
    const raw = (r.departmentGroup || r.department || r['Department'] || r['Dept.'] || r['Department of Authors'] || '').trim();
    if (!raw) return '';
    const rawLower = raw.toLowerCase().trim();
    for (const d of FLABS_SIDEBAR_DEPTS) {
      if (d.toLowerCase() === rawLower) return d;
    }
    if (window.SRM_SCOPE && window.SRM_SCOPE.FLABS_DEPARTMENTS) {
      for (const d of window.SRM_SCOPE.FLABS_DEPARTMENTS) {
        if (d.label.toLowerCase() === rawLower) return d.label;
        const allAliases = [
          ...(d.publicationAliases || []),
          ...(d.patentAliases || []),
          ...(d.scholarAliases || [])
        ].map(a => a.toLowerCase().trim());
        if (allAliases.includes(rawLower)) return d.label;
      }
    }
    if (rawLower === 'mca' || rawLower === 'computer science and applications') return 'MCA & MCA Gen AI';
    if (rawLower === 'bca' || rawLower === 'bca data science') return 'BCA & BCA Gen AI';
    if (rawLower === 'data sciences') return 'Data Science';
    if (rawLower === 'b.sc computer science') return 'Computer Science';
    if (rawLower === 'b.sc cyber security') return 'Cyber Security';
    if (rawLower === 'ai&ml' || rawLower === 'b.sc. (ai & ml)' || rawLower === 'dept of ai ml') return 'AI & ML';
    if (rawLower === 'biotechnology' || rawLower === 'psychology') return 'Biotechnology & Psychology';
    if (rawLower === 'commerce' || rawLower === 'commerce- shift 1' || rawLower === 'commerce shift 1 gen' || rawLower === 'commerce shift i' || rawLower === 'commerce shift1' || rawLower === 'department of commerce') return 'Commerce General (Batch I)';
    if (rawLower === 'commerce (shift 2 cs)' || rawLower === 'commerce (shift 2 gen)' || rawLower === 'commerce -shift ii' || rawLower === 'commerce shift ii gen' || rawLower === 'commerce shift ii' || rawLower === 'commerce shift2') return 'Commerce General & CS (Batch II)';
    if (rawLower === 'a&f' || rawLower === 'commerce (a&f)' || rawLower === 'commerce - af' || rawLower === 'commerce(a&f)' || rawLower === 'commerce (accounting &finance)') return 'Commerce A & F';
    if (rawLower === 'ism' || rawLower === 'pa, ism, iaf & sf' || rawLower === 'commerce - ism,pa & iaf' || rawLower === 'commerce - pa,ism,iaf' || rawLower === 'commerce ism, pa & iaf' || rawLower === 'commerce (pa & ism)') return 'Commerce PA & ISM';
    if (rawLower === 'viscom' || rawLower === 'visual communicatino' || rawLower === 'department of viscom') return 'Visual Communication';
    if (rawLower === 'lcs (english)' || rawLower === 'lcs (tamil)' || rawLower === 'lcs - english' || rawLower === 'tamil' || rawLower === 'department of tamil') return 'LCS';
    return raw;
  }

  function getFLABSDepartmentOrder(r) {
    const d = getFLABSDept(r);
    const idx = FLABS_SIDEBAR_DEPTS.indexOf(d);
    return idx !== -1 ? idx : 999;
  }

  function getETDept(r) {
    if (!r) return '';
    let raw = (r.departmentGroup || r.department || r.dept || r._source_department || r['Dept.'] || r['Department of Authors'] || r['Claiming Author Department'] || r.program || '').trim();
    if (!raw && typeof normalizeETDepartment === 'function') {
      raw = normalizeETDepartment(r) || '';
    }
    if (!raw) return '';
    const rawLower = raw.toLowerCase().trim();
    for (const d of ET_SIDEBAR_DEPTS) {
      if (d.toLowerCase() === rawLower) return d;
    }
    if (window.SRM_SCOPE && window.SRM_SCOPE.ENT_DEPARTMENTS) {
      for (const d of window.SRM_SCOPE.ENT_DEPARTMENTS) {
        if (d.label.toLowerCase() === rawLower) return d.label;
        const allAliases = [...(d.patentAliases || []), ...(d.scholarAliases || [])].map(a => a.toLowerCase().trim());
        if (allAliases.includes(rawLower)) return d.label;
      }
    }
    if (rawLower === 'cse' || rawLower === 'cse core' || rawLower === 'cs' || rawLower === 'computer science and engineering') return 'CSE';
    if (rawLower.includes('aiml') || rawLower.includes('ai & ml') || rawLower.includes('ai&ml') || rawLower === 'aiml & ai' || rawLower === 'cse-aiml') return 'AIML & AI';
    if (rawLower.includes('bda') || rawLower.includes('big data') || rawLower === 'bda&cc' || rawLower === 'scse(bda&cc)' || rawLower === 'cse - bda' || rawLower === 'cse-bda') return 'BDA&CC';
    if (rawLower.includes('iot') || rawLower.includes('csbs') || rawLower === 'iot&csbs' || rawLower.includes('cse-iot')) return 'IOT&CSBS';
    if (rawLower === 'cse-cs' || rawLower === 'cse cs') return 'CSE-CS';
    if (rawLower === 'cse-gt' || rawLower === 'cse gt' || rawLower.includes('gaming')) return 'CSE-GT';
    if (rawLower === 'mechanical' || rawLower === 'mech' || rawLower.includes('mechanical')) return 'MECH';
    if (rawLower === 'it' || rawLower.includes('information tech')) return 'IT';
    if (rawLower === 'ece' || rawLower.includes('electronics and comm') || rawLower.includes('electronics & communication')) return 'ECE';
    if (rawLower === 'eee' || rawLower.includes('electrical')) return 'EEE';
    if (rawLower === 'physics' || rawLower === 'phy') return 'PHY';
    if (rawLower === 'civil' || rawLower.includes('civil engineering')) return 'CIVIL';
    if (rawLower === 'biomedical' || rawLower === 'bme' || rawLower.includes('biomedical engineering')) return 'BME';
    if (rawLower === 'chemistry' || rawLower === 'chem') return 'CHEM';
    if (rawLower === 'efl' || rawLower === 'english' || rawLower.includes('foreign languages') || rawLower === 'lcs/efl' || rawLower === 'lcs') return 'EFL';
    if (rawLower === 'mathematics' || rawLower === 'maths') return 'MATHS';
    if (rawLower === 'biotechnology' || rawLower === 'biotech' || rawLower.includes('bio tech')) return 'BIOTECH';
    return raw;
  }

  function getETDepartmentOrder(r) {
    const d = getETDept(r);
    const idx = ET_SIDEBAR_DEPTS.indexOf(d);
    return idx !== -1 ? idx : 999;
  }

  function getMgmtDept(r) {
    if (!r) return '';
    let raw = (r.department || r.departmentGroup || r['Department'] || '').trim();
    if (!raw) return '';
    const rawLower = raw.toLowerCase().trim();
    if (rawLower.includes('bba')) return 'BBA';
    if (rawLower.includes('mba')) return 'MBA';
    return raw;
  }

  function getMgmtDepartmentOrder(r) {
    const d = getMgmtDept(r);
    const idx = MGMT_SIDEBAR_DEPTS.indexOf(d);
    return idx !== -1 ? idx : 999;
  }

  // ── E&T Data Filtering & Normalization ────────────────────────────────────
  function normET(r, fallbackYear) {
    const y = r._year || r.year || parseInt(r.Year) || fallbackYear;
    const title = r.title || r['Title of the paper'] || r.Title || r['Title of the Paper'] || '—';
    const authors = r.authors || r['Authors (ALL)'] || r.Authors || r['Name of Claiming Author'] || '—';
    const journal = r.journal || r['Journal Name'] || r['Source title/Journal Name'] || r['Name of the Journal'] || '—';
    const link = r.link || r['Paper Link'] || r['SCOPUS Article Link'] || r['DOI/LINK'] || r.DOI || r['First Page of the Paper LINK'] || '';
    const rawDept = r.department || r.dept || r._source_department || r['Dept.'] || r['Department of Authors'] || r['Claiming Author Department'] || '';
    const dept = getETDept({ department: rawDept, dept: rawDept }) || rawDept;
    return { year: y, title, authors, journal, link, dept, department: dept, departmentGroup: dept };
  }


  function getETPublications(year, ignoreScope = false) {
    const p2024 = (window.ET_PUBLICATIONS_2024 || []).map(r => normET(r, 2024));
    const p2025 = (window.ET_PUBLICATIONS_2025 || []).map(r => normET(r, 2025));
    const p2026 = (window.ET_PUBLICATIONS_2026 || []).map(r => normET(r, 2026));
    const all = [...p2024, ...p2025, ...p2026];

    const etScope = getETScope();
    let src = all;
    if (!ignoreScope && etScope && etScope.dept) {
      src = src.filter(r => matchETDept(r.dept, etScope.dept));
    }

    return year ? src.filter(r => r.year === year) : src;
  }

  function normPat(r) {
    return {
      year: r.year || parseInt(r.Year) || 2024,
      title: r.title || r.Title || r['Patent title'] || r.patentTitle || '—',
      departmentGroup: r.department || r.Dept || r.Department || 'E&T',
      inventors: r.inventors || r.Inventor || r['Inventor(s)'] || r.inventor || '—',
      status: r.status || r.patent_status || r.category || 'Published',
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
      src = src.filter(r => matchETDept(r.departmentGroup, etScope.dept));
    }

    return year ? src.filter(r => r.year === year) : src;
  }

  function normFund(r) {
    const dept = r.department || r.departmentGroup || r.Dept || r.dept || r.Department || '';
    return {
      year: r.year || parseInt(r.Year) || 2024,
      title: r.project || r.title || r.Title || r['Project Title'] || '—',
      principalInvestigator: r.principalInvestigator || r.pi || r.PI || r['Principal Investigator'] || '—',
      coPi: r.coPI || r.coPi || r.CO_PI || '',
      agency: r.fundingAgency || r.agency || r['Funding Agency'] || r.scheme || '—',
      amount: r.amount || r.fundRequested || r['Fund Requested'] || '—',
      duration: r.duration || r.date || '—',
      status: r.status || (r.raw && r.raw.status) || 'Submitted',
      department: dept,
      departmentGroup: dept
    };
  }

  function getETFunded(year, ignoreScope = false) {
    const raw = window.ET_FUNDED_PROJECTS || [];
    let src = raw.map(normFund);

    const etScope = getETScope();
    if (!ignoreScope && etScope && etScope.dept) {
      src = src.filter(r => matchETDept(r.department, etScope.dept));
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
      src = src.filter(r => matchETDept(r.department, etScope.dept));
    }

    return year ? src.filter(r => r.year === year) : src;
  }

  function getETPeopleRecords(year, ignoreScope = false) {
    const etData = window.ET_SUPERVISORS_SCHOLARS;
    const supData = etData && etData.yearlyData;
    if (!supData && (!etData || !etData.allScholars)) return [];

    let recs = [];
    if (year && supData && supData[year]) {
      recs = supData[year].records || [];
    } else if (!year) {
      if (etData && etData.allScholars && etData.allScholars.length > 0) {
        recs = etData.allScholars;
      } else if (supData) {
        Object.keys(supData).forEach(y => {
          recs = recs.concat(supData[y].records || []);
        });
      }
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

  function getETSummary(y) {
    const etScope = getETScope();
    const deptLabel = etScope && etScope.dept ? etScope.dept : 'E&T';
    const pubs = getETPublications(y);
    const pats = getETPatents(y);
    const fund = getETFunded(y);
    const cons = getETConsultancy(y);
    const granted = pats.filter(r => (r.status || '').toLowerCase() === 'granted').length;
    const published = pats.filter(r => (r.status || '').toLowerCase() === 'published').length;
    
    const facultyCount = getCollegeFacultyCount('E&T', y, etScope && etScope.dept ? etScope.dept : null);

    // Cumulative scholars and supervisors (all cohorts up to year y), respecting active department scope
    const cumScholars = getETCumulativeScholars(y, false);
    const cumSupervisors = getETCumulativeSupervisors(y, false);

    return {
      faculty: facultyCount,
      publications: pubs.length,
      patents: pats.length,
      granted,
      published,
      fundedProjects: fund.length,
      consultancy: cons.length,
      supervisors: cumSupervisors.length,
      scholars: cumScholars.length,
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
    if (dataType === 'publications') src = M.publications || [];
    else if (dataType === 'patents') src = M.patents || [];
    else if (dataType === 'funded') src = M.fundedProjects || [];
    else if (dataType === 'people' || dataType === 'scholars') src = M.scholars || [];
    else if (dataType === 'supervisors') src = M.supervisors || [];
    else if (dataType === 'awards') src = M.awards || [];
    else return [];

    if (deptFilter) {
      const df = deptFilter.toLowerCase();
      src = src.filter(r => {
        const d = (r.department || r.departmentGroup || '').trim().toLowerCase();
        return d === df || d.includes(df);
      });
    }

    const filtered = year ? src.filter(r => r.year === year) : src;
    return filtered;
  }

  function getMgmtPeopleRecords(year, ignoreScope = false) {
    return getMgmtRecords('people', year, ignoreScope);
  }

  function getMgmtSummary(y) {
    const mgmtScope = getManagementScope();
    const deptLabel = mgmtScope && mgmtScope.dept ? mgmtScope.dept : 'Management';
    const pubs  = getMgmtRecords('publications', y);
    const pats  = getMgmtRecords('patents', y);
    const fund  = getMgmtRecords('funded', y);
    // Cumulative scholars and supervisors (all cohorts up to year y), respecting active department scope
    const cumSups = getMgmtCumulativeSupervisors(y, false);
    const cumSchs = getMgmtCumulativeScholars(y, false);
    const granted  = pats.filter(r => (r.status || '').toLowerCase() === 'granted').length;
    const published = pats.filter(r => (r.status || '').toLowerCase() === 'published').length;

    const faculty = getCollegeFacultyCount('Management', y, mgmtScope && mgmtScope.dept ? mgmtScope.dept : null);

    return { faculty, publications: pubs.length, patents: pats.length, granted, published, fundedProjects: fund.length, supervisors: cumSups.length, scholars: cumSchs.length, deptLabel };
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

 // Build live KPI counts for the home page (FLABS path)
 function getScopedSummary(y) {
   const SCOPE = window.SRM_SCOPE;
   const dept = SCOPE && SCOPE.getSelectedDept();
   const deptLabel = dept ? dept.label : null;

   const pubs     = SCOPE ? SCOPE.filterPublicationsByDepartment(D.publications, dept, y) : D.publications.filter(r => r.year === y);
   const awards   = deptLabel ? D.awards.filter(r => r.year === y && (r.department === deptLabel || r.departmentGroup === deptLabel)) : D.awards.filter(r => r.year === y);
   const funded   = SCOPE ? SCOPE.filterFundedProjectsByDepartment(D.funded, dept, y) : D.funded.filter(r => r.year === y);
   const patents  = SCOPE ? SCOPE.filterPatentsByDepartment(D.patents, dept, y) : D.patents.filter(r => r.year === y);

   // Cumulative scholars and supervisors (all cohorts up to year y), respecting active department scope
   const cumScholars = getFLABSCumulativeScholars(y, false);
   const cumSupervisors = getFLABSCumulativeSupervisors(y, false);
   const supervisorCount = (cumSupervisors.length > 0)
     ? cumSupervisors.length
     : new Set(cumScholars.map(r => r.supervisor).filter(Boolean)).size;

   const granted  = patents.filter(r => (r.status || '').toLowerCase() === 'granted').length;
   const published = patents.filter(r => (r.status || '').toLowerCase() === 'published').length;

   const facultyCount = getCollegeFacultyCount('FLABS', y, deptLabel);

   return {
     faculty:        facultyCount,
     publications:   pubs.length,
     patents:        patents.length,
     granted:        granted,
     published:      published,
     awards:         awards.length,
     supervisors:    supervisorCount,
     scholars:       cumScholars.length,
     fundedProjects: funded.length,
     dept:           dept
   };
 }

 // ── Current page tracker ───────────────────────────────────────────────────
 let _currentPage = 'home';

  // ══════════════════════════════════════════════════════════════════════════
  // CUMULATIVE RESEARCH COMMUNITY HELPERS
  // For a given selectedYear, return scholars/supervisors from ALL years ≤ selectedYear.
  // Deduplication is by registration number (or scholar name as fallback) to avoid
  // counting the same person twice when they appear across multiple year rows.
  // ══════════════════════════════════════════════════════════════════════════

  function _deduplicateScholars(records) {
    // Deduplicate by (registration || name) — prefer unique registration numbers
    const seen = new Set();
    return records.filter(r => {
      const key = (r.registration && r.registration !== '—') ? r.registration
                : (r.applicationNo && r.applicationNo !== '—') ? r.applicationNo
                : (r.registerNumber && r.registerNumber !== '—') ? r.registerNumber
                : (r.name && r.name !== '—') ? r.name
                : (r.scholar && r.scholar !== '—') ? r.scholar
                : null;
      if (!key) return true; // can't deduplicate, keep
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function _deduplicateSupervisors(records) {
    const seen = new Set();
    return records.filter(r => {
      const key = (r.employeeCode && r.employeeCode !== '—') ? r.employeeCode
                : (r.supervisor && r.supervisor !== '—') ? r.supervisor
                : (r.name && r.name !== '—') ? r.name
                : null;
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // --- FLABS cumulative ---
  function getFLABSCumulativeScholars(upToYear, ignoreScope) {
    const SCOPE = window.SRM_SCOPE;
    const dept = SCOPE && SCOPE.getSelectedDept();
    const all = window.RESEARCH_DATA ? (window.RESEARCH_DATA.scholars || []) : [];
    const filteredByYear = all.filter(r => (parseInt(r.year, 10) || 2024) <= upToYear);
    const recs = (ignoreScope || !dept || !SCOPE) ? filteredByYear
               : SCOPE.filterResearchCommunityByDepartment(filteredByYear, dept);
    return _deduplicateScholars(recs);
  }

  function getFLABSCumulativeSupervisors(upToYear, ignoreScope) {
    const SCOPE = window.SRM_SCOPE;
    const dept = SCOPE && SCOPE.getSelectedDept();
    const all = window.RESEARCH_DATA ? (window.RESEARCH_DATA.supervisors || []) : [];
    const filteredByYear = all.filter(r => (parseInt(r.year, 10) || 2024) <= upToYear);
    if (ignoreScope || !dept || !SCOPE) {
      return _deduplicateSupervisors(filteredByYear);
    }
    const filtered = SCOPE.filterResearchCommunityByDepartment(filteredByYear, dept);
    return _deduplicateSupervisors(filtered);
  }

  // --- Management cumulative ---
  function getMgmtCumulativeScholars(upToYear, ignoreScope) {
    const M = window.MANAGEMENT_RESEARCH_DATA;
    const all = M ? (M.scholars || []) : [];
    const mgmtScope = getManagementScope();
    const deptFilter = (!ignoreScope && mgmtScope && mgmtScope.dept) ? mgmtScope.dept.toLowerCase() : null;

    let filtered = all.filter(r => (parseInt(r.year, 10) || 2024) <= upToYear);
    if (deptFilter) {
      filtered = filtered.filter(r => {
        const d = (r.department || r.departmentGroup || '').trim().toLowerCase();
        return d === deptFilter || d.includes(deptFilter);
      });
    }
    return _deduplicateScholars(filtered);
  }

  function getMgmtCumulativeSupervisors(upToYear, ignoreScope) {
    const M = window.MANAGEMENT_RESEARCH_DATA;
    const all = M ? (M.supervisors || []) : [];
    const mgmtScope = getManagementScope();
    const deptFilter = (!ignoreScope && mgmtScope && mgmtScope.dept) ? mgmtScope.dept.toLowerCase() : null;

    let filtered = all.filter(r => (parseInt(r.year, 10) || 2024) <= upToYear);
    if (deptFilter) {
      filtered = filtered.filter(r => {
        const d = (r.department || r.departmentGroup || '').trim().toLowerCase();
        return d === deptFilter || d.includes(deptFilter);
      });
    }
    return _deduplicateSupervisors(filtered);
  }

  // --- E&T cumulative ---
  function getETCumulativeScholars(upToYear, ignoreScope) {
    const etData = window.ET_SUPERVISORS_SCHOLARS;
    let all = (etData && etData.allScholars) ? etData.allScholars : [];
    if (all.length === 0 && etData && etData.yearlyData) {
      Object.keys(etData.yearlyData).forEach(y => {
        all = all.concat(etData.yearlyData[y].records || []);
      });
    }
    const clean = all.filter(r => {
      if (!r || !r.scholar) return false;
      const s = r.scholar.trim();
      if (['FT', 'PT', 'PT (Internal )', 'PT (Internal)', 'PT(External)', 'PT (External)', 'Total'].includes(s)) return false;
      return true;
    });

    let filtered = clean.filter(r => (parseInt(r.year, 10) || 2024) <= upToYear);
    const etScope = getETScope();
    if (!ignoreScope && etScope && etScope.dept) {
      filtered = filtered.filter(r => normalizeETDepartment(r) === etScope.dept);
    }
    return _deduplicateScholars(filtered);
  }

  function getETCumulativeSupervisors(upToYear, ignoreScope) {
    const etData = window.ET_SUPERVISORS_SCHOLARS;
    let all = (etData && etData.allSupervisors) ? etData.allSupervisors : [];
    let filtered = all.filter(r => (parseInt(r.year, 10) || 2024) <= upToYear);
    const etScope = getETScope();
    if (!ignoreScope && etScope && etScope.dept) {
      filtered = filtered.filter(r => matchETDept(r.department, etScope.dept));
    }
    return _deduplicateSupervisors(filtered);
  }

  // Shared helpers: classify scholar category from the category/mode string.
  // Handles both modern DB format ("Full-time", "Part-time Internal", "Part-time External")
  // and legacy format ("FT", "PT (Internal)", "PT(External)", "PT (Internal )").
  function _isFT(cat) {
    const c = (cat || '').toLowerCase().trim();
    // Modern: "Full-time" | Legacy: "FT", "FT-..."
    return c.includes('full') || /^ft(\b|\s|-|$)/i.test(cat || '');
  }
  function _isPTInternal(cat) {
    const c = (cat || '').toLowerCase().trim();
    // Modern: "Part-time Internal" | Legacy: "PT (Internal)", "PT(Internal)", "PT (Internal )"
    if (c.includes('full')) return false; // guard against "Full-time Internal" edge case
    return (c.includes('part') && c.includes('internal')) ||
           (/^pt[\s(]*(internal)/i.test(cat || ''));
  }
  function _isPTExternal(cat) {
    const c = (cat || '').toLowerCase().trim();
    // Modern: "Part-time External" | Legacy: "PT(External)", "PT (External)"
    if (c.includes('full')) return false;
    return (c.includes('part') && c.includes('external')) ||
           (/^pt[\s(]*(external)/i.test(cat || ''));
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RESEARCH COMMUNITY: SUPERVISOR DETAILS & ASSIGNED SCHOLARS VIEW
  // ══════════════════════════════════════════════════════════════════════════
  // ── Helper to resolve research status from scholar_current_status table / bootstrap
  function getScholarCurrentStatus(s) {
    if (!s) return 'Ongoing';

    // 1. Check local supervisor edits first (from localStorage)
    try {
      const stored = localStorage.getItem('srm_scholar_status_edits');
      if (stored) {
        const edits = JSON.parse(stored);
        const sId = s.id || (s.raw && s.raw.id) || '';
        const sReg = (s.registration || s.registrationNo || s.registerNumber || s.applicationNo || (s.raw && (s.raw.register_number || s.raw.application_number)) || '').toString().trim().replace(/\.0$/, '');
        if (sId && edits[sId]) return edits[sId];
        if (sReg && edits[sReg]) return edits[sReg];
      }
    } catch (e) {}

    // 2. Check if s already has a meaningful currentStatus property
    if (s.currentStatus && typeof s.currentStatus === 'string' && s.currentStatus.trim() && s.currentStatus.trim() !== '-' && s.currentStatus.trim() !== '—') {
      return s.currentStatus.trim();
    }

    // 3. Look up from window.SCHOLAR_STATUS_BOOTSTRAP / Supabase scholar_current_status records
    const statusPool = window.SCHOLAR_STATUS_BOOTSTRAP || [];
    if (statusPool.length > 0) {
      const sId = s.id || (s.raw && s.raw.id) || '';
      const sReg = (s.registration || s.registrationNo || s.registerNumber || s.applicationNo || (s.raw && (s.raw.register_number || s.raw.application_number)) || '').toString().trim().replace(/\.0$/, '');
      const cleanReg = (sReg && sReg !== '—' && sReg !== '-' && sReg !== 'NA' && sReg !== 'null' && sReg !== 'undefined') ? sReg : '';

      let matched = null;
      // 3A. Match by scholar_id
      if (sId) {
        matched = statusPool.find(b => b.scholar_id === sId || b.id === sId);
      }
      // 3B. Match by registration number
      if (!matched && cleanReg) {
        matched = statusPool.find(b => {
          const bReg = (b.registration_number || '').toString().trim().replace(/\.0$/, '');
          return bReg && bReg === cleanReg;
        });
      }
      // 3C. Match by normalized scholar name + supervisor name
      if (!matched) {
        const sNameNorm = (s.name || s.scholarName || s.scholar || (s.raw && s.raw.scholar_name) || '').toLowerCase().replace(/^(dr\.?|prof\.?|mr\.?|mrs\.?|ms\.?)\s*/i, '').replace(/[^a-z0-9]/g, '');
        const sSupNorm = (s.supervisor || s.supervisorName || (s.raw && s.raw.supervisor_name) || '').toLowerCase().replace(/^(dr\.?|prof\.?|mr\.?|mrs\.?|ms\.?)\s*/i, '').replace(/[^a-z0-9]/g, '');

        const candidates = statusPool.filter(b => {
          const bNameNorm = (b.scholar_name || '').toLowerCase().replace(/^(dr\.?|prof\.?|mr\.?|mrs\.?|ms\.?)\s*/i, '').replace(/[^a-z0-9]/g, '');
          return bNameNorm && bNameNorm === sNameNorm;
        });

        if (candidates.length === 1) {
          matched = candidates[0];
        } else if (candidates.length > 1 && sSupNorm) {
          matched = candidates.find(b => {
            const bSupNorm = (b.supervisor_name || '').toLowerCase().replace(/^(dr\.?|prof\.?|mr\.?|mrs\.?|ms\.?)\s*/i, '').replace(/[^a-z0-9]/g, '');
            return bSupNorm === sSupNorm;
          }) || candidates[0];
        }
      }

      if (matched && matched.current_status && typeof matched.current_status === 'string' && matched.current_status.trim() && matched.current_status.trim() !== '-' && matched.current_status.trim() !== '—') {
        return matched.current_status.trim();
      }
    }

    // 4. Fallback to raw status if meaningful, or default to 'Ongoing'
    const fallback = s.status || (s.raw && s.raw.status) || (s.raw && s.raw.raw_data && s.raw.raw_data['Status']) || '';
    if (fallback && typeof fallback === 'string' && fallback.trim() && fallback.trim() !== '-' && fallback.trim() !== '—') {
      return fallback.trim();
    }
    return 'Ongoing';
  }

  function getAssignedScholarsForSupervisor(sup, group) {
    const supId = sup.id || sup.dbId || '';
    const supName = (sup.name || sup.supervisorName || sup.supervisor || (sup.raw && sup.raw.supervisor_name) || '').trim();
    const normSupName = supName.toLowerCase().replace(/^(dr\.?|prof\.?|mr\.?|mrs\.?|ms\.?)\s*/i, '').replace(/[^a-z0-9]/g, '');

    // Select the scholar pool for this institution group
    let pool = [];
    if (group === 'E&T' || sup.group === 'E&T' || sup.businessUnit === 'E&T') {
      pool = (window.ET_SUPERVISORS_SCHOLARS && window.ET_SUPERVISORS_SCHOLARS.allScholars) || [];
    } else if (group === 'Management' || sup.group === 'Management' || sup.businessUnit === 'Management') {
      pool = (window.MANAGEMENT_RESEARCH_DATA && window.MANAGEMENT_RESEARCH_DATA.scholars) || [];
    } else {
      pool = (window.RESEARCH_DATA && window.RESEARCH_DATA.scholars) || [];
    }

    const matched = [];
    const seen = new Set();
    function check(sch) {
      if (!sch) return;

      let isMatch = false;
      // Primary match: by supervisor UUID
      if (supId && sch.supervisorId === supId) {
        isMatch = true;
      }
      // Secondary match: by assignedScholarIds list on supervisor
      if (!isMatch && sup.assignedScholarIds && sch.id && sup.assignedScholarIds.includes(sch.id)) {
        isMatch = true;
      }
      // Tertiary match: normalized supervisor name equality
      if (!isMatch) {
        const schSup = (sch.supervisor || sch.supervisorName || (sch.raw && sch.raw.supervisor_name) || '').toLowerCase().replace(/^(dr\.?|prof\.?|mr\.?|mrs\.?|ms\.?)\s*/i, '').replace(/[^a-z0-9]/g, '');
        if (schSup && normSupName && schSup === normSupName) {
          isMatch = true;
        }
      }
      if (!isMatch) return;

      // Safe deduplication: never drop scholars just because their registration is '—' or empty
      const sReg = (sch.registration || sch.registrationNo || sch.registerNumber || sch.applicationNo || (sch.raw && (sch.raw.register_number || sch.raw.application_number)) || '').toString().trim().replace(/\.0$/, '');
      const cleanReg = (sReg && sReg !== '—' && sReg !== '-' && sReg !== 'NA' && sReg !== 'null' && sReg !== 'undefined') ? sReg : '';

      const sId = (sch.id || sch.dbId || (sch.raw && sch.raw.id) || '').toString().trim();
      const cleanId = (sId && sId !== '—' && sId !== '-' && sId !== 'null' && sId !== 'undefined') ? sId : '';

      const sName = (sch.name || sch.scholarName || sch.scholar || (sch.raw && (sch.raw.scholar_name || sch.raw.name)) || '').toString().trim();
      const normName = sName.toLowerCase().replace(/^(dr\.?|prof\.?|mr\.?|mrs\.?|ms\.?)\s*/i, '').replace(/[^a-z0-9]/g, '');

      // Build dedupKey: if cleanReg exists, use reg; if cleanId exists, use id; else use normalized scholar name
      const dedupKey = cleanReg ? ('reg_' + cleanReg) : (cleanId ? ('id_' + cleanId) : ('name_' + normName));
      if (!dedupKey || seen.has(dedupKey)) return;
      seen.add(dedupKey);

      matched.push(sch);
    }
    pool.forEach(check);
    return matched;
  }

  function renderSupervisorDetailView(sup, scholars, groupLabel) {
    const supName = sup.name || sup.supervisorName || sup.supervisor || (sup.raw && sup.raw.supervisor_name) || '—';
    const empId = sup.employeeId || sup.employeeCode || (sup.raw && sup.raw.employee_id) || '—';
    const desig = sup.designation || (sup.raw && sup.raw.designation) || '';
    const desigStr = (desig && String(desig).trim()) ? String(desig).trim() : '—';
    const deptStr = sup.department || (sup.raw && sup.raw.department) || sup.departmentGroup || sup.discipline || '—';
    const buStr = sup.businessUnit || sup.group || (sup.raw && sup.raw.business_unit) || groupLabel || 'Faculty';

    const rawCap = sup.maximum_scholar_capacity != null ? sup.maximum_scholar_capacity : ((sup.raw && sup.raw.maximum_scholar_capacity != null) ? sup.raw.maximum_scholar_capacity : sup.maximumScholarCapacity);
    const maxCapStr = (rawCap != null && rawCap !== '') ? String(rawCap) : '—';

    const rawCount = sup.current_scholar_count != null ? sup.current_scholar_count : ((sup.raw && sup.raw.current_scholar_count != null) ? sup.raw.current_scholar_count : sup.currentScholarCount);
    const curCountStr = (rawCount != null && rawCount !== '') ? String(rawCount) : '—';

    const rawVac = sup.available_vacancies != null ? sup.available_vacancies : ((sup.raw && sup.raw.available_vacancies != null) ? sup.raw.available_vacancies : sup.availableVacancies);
    const vacStr = (rawVac != null && rawVac !== '') ? String(rawVac) : '—';

    let scholarRowsHtml = '';
    if (scholars && scholars.length > 0) {
      scholarRowsHtml = scholars.map((s, idx) => {
        const isFT = _isFT(s.category || s.mode || '');
        // FT badge: green; PT-Internal: yellow; PT-External: orange; default PT: yellow
        const ptInt = typeof _isPTInternal === 'function' && _isPTInternal(s.category || s.mode || '');
        const ptExt = typeof _isPTExternal === 'function' && _isPTExternal(s.category || s.mode || '');
        const catColor = isFT ? 'background:#dcfce7;color:#166534;'
                       : ptInt ? 'background:#fef9c3;color:#854d0e;'
                       : ptExt ? 'background:#ffedd5;color:#9a3412;'
                       : 'background:#fef9c3;color:#854d0e;';
        // Registration: RESEARCH_DATA uses 'registration' or 'applicationNo'; SCHOLAR_REPORTS_DATA uses 'registrationNo'
        const regNoStr = s.registration || s.applicationNo || s.registrationNo || s.registerNumber || (s.raw && (s.raw.register_number || s.raw.application_number)) || '—';
        // Year: RESEARCH_DATA uses 'year' or raw.year_of_enrollment; fallback to registrationDate year
        const yearRaw = s.year || s.yearOfEnrollment || (s.raw && s.raw.year_of_enrollment) || (s.registrationDate && s.registrationDate.substring(0,4)) || null;
        const yearStr = yearRaw ? String(yearRaw) : '—';
        // Status: fetch directly from scholar_current_status table / bootstrap / edits
        const statusDisplay = getScholarCurrentStatus(s);
        // Research Area: prefer researchArea from RESEARCH_DATA; fallback phdTopic from SCHOLAR_REPORTS_DATA
        const areaStr = s.researchArea || (s.raw && (s.raw.research_area || (s.raw.raw_data && s.raw.raw_data['Research Area']))) || s.phdTopic || '';
        const areaDisplay = areaStr && areaStr.trim() ? areaStr.trim() : '—';
        const sName = s.name || s.scholarName || s.scholar || '—';
        const sDept = s.department || s.departmentGroup || s.program || (s.raw && s.raw.department) || '—';

        return `<tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:10px 14px;border:1px solid #e2e8f0;color:#64748b;">${idx + 1}</td>
          <td style="padding:10px 14px;border:1px solid #e2e8f0;font-weight:700;color:#0f172a;">${E(sName)}</td>
          <td style="padding:10px 14px;border:1px solid #e2e8f0;color:#64748b;font-family:monospace;font-size:12.5px;">${E(regNoStr)}</td>
          <td style="padding:10px 14px;border:1px solid #e2e8f0;color:#475569;">${E(sDept)}</td>
          <td style="padding:10px 14px;border:1px solid #e2e8f0;text-align:center;">
            <span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:11.5px;font-weight:700;${catColor}">
              ${E(s.category || s.mode || (isFT ? 'Full-time' : 'Part-time'))}
            </span>
          </td>
          <td style="padding:10px 14px;border:1px solid #e2e8f0;text-align:center;color:#475569;">${E(String(yearStr))}</td>
          <td style="padding:10px 14px;border:1px solid #e2e8f0;color:#0f172a;font-weight:600;">${E(statusDisplay)}</td>
          <td style="padding:10px 14px;border:1px solid #e2e8f0;color:#475569;font-size:12.5px;">${E(areaDisplay)}</td>
        </tr>`;
      }).join('');
    } else {
      scholarRowsHtml = `<tr><td colspan="8" style="padding:28px;text-align:center;color:#94a3b8;font-size:13px;">No research scholars are currently assigned to this supervisor.</td></tr>`;
    }

    return `<div style="max-width:1200px;margin:0 auto;padding-bottom:40px;font-family:sans-serif;">
      <!-- Top Navigation / Back Bar -->
      <div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:12px 20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;box-shadow:0 1px 4px rgba(0,0,0,0.05);">
        <div style="display:flex;align-items:center;gap:12px;">
          <button id="btn-supervisor-detail-back" style="display:inline-flex;align-items:center;gap:6px;background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:6px;padding:7px 14px;font-size:13px;font-weight:700;cursor:pointer;transition:background 0.2s;">
            ← Back to Research Community
          </button>
          <span style="font-size:13px;color:#64748b;">Viewing Supervisor Details</span>
        </div>
        <div>
          <span style="display:inline-block;padding:3px 10px;border-radius:20px;background:#fae8ff;color:#86198f;font-size:11.5px;font-weight:700;">
            ${E(buStr)} · Supervisor Details
          </span>
        </div>
      </div>

      <!-- Supervisor Information Card -->
      <div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:24px;margin-bottom:24px;box-shadow:0 1px 4px rgba(0,0,0,0.05);">
        <div style="border-bottom:1px solid #e2e8f0;padding-bottom:14px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
          <div>
            <span style="display:inline-block;padding:2px 10px;border-radius:12px;background:#e0f2fe;color:#0369a1;font-size:11.5px;font-weight:700;margin-bottom:6px;">Research Supervisor Profile</span>
            <h2 style="margin:2px 0 6px 0;font-size:22px;color:#0f172a;font-weight:800;">${E(supName)}</h2>
            <div style="font-size:13px;color:#64748b;">${E(desigStr)} &nbsp;·&nbsp; Department of ${E(deptStr)}</div>
          </div>
          <div style="text-align:right;">
            <span style="display:inline-block;padding:4px 12px;border-radius:6px;background:#f8fafc;border:1px solid #cbd5e1;font-size:12px;color:#475569;font-family:monospace;">EMP ID: ${E(empId)}</span>
          </div>
        </div>

        <!-- Info Grid -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-bottom:20px;">
          <div style="background:#f8fafc;padding:12px 14px;border-radius:8px;border:1px solid #e2e8f0;">
            <div style="font-size:11.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Supervisor Name</div>
            <div style="font-size:14px;font-weight:700;color:#0f172a;margin-top:4px;">${E(supName)}</div>
          </div>
          <div style="background:#f8fafc;padding:12px 14px;border-radius:8px;border:1px solid #e2e8f0;">
            <div style="font-size:11.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Employee ID</div>
            <div style="font-size:14px;font-weight:700;color:#0f172a;margin-top:4px;font-family:monospace;">${E(empId)}</div>
          </div>
          <div style="background:#f8fafc;padding:12px 14px;border-radius:8px;border:1px solid #e2e8f0;">
            <div style="font-size:11.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Designation</div>
            <div style="font-size:14px;font-weight:700;color:#0f172a;margin-top:4px;">${E(desigStr)}</div>
          </div>
          <div style="background:#f8fafc;padding:12px 14px;border-radius:8px;border:1px solid #e2e8f0;">
            <div style="font-size:11.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Department</div>
            <div style="font-size:14px;font-weight:700;color:#0f172a;margin-top:4px;">${E(deptStr)}</div>
          </div>
          <div style="background:#f8fafc;padding:12px 14px;border-radius:8px;border:1px solid #e2e8f0;">
            <div style="font-size:11.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Institution / Business Unit</div>
            <div style="font-size:14px;font-weight:700;color:#0f172a;margin-top:4px;">${E(buStr)}</div>
          </div>
        </div>

        <!-- 3 Capacity metrics cards directly from stored database values -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;">
          <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:14px;text-align:center;">
            <div style="font-size:12px;font-weight:700;color:#166534;margin-bottom:4px;">Maximum Scholar Capacity</div>
            <div style="font-size:26px;font-weight:800;color:#166534;">${E(maxCapStr)}</div>
            <div style="font-size:11.5px;color:#15803d;margin-top:2px;">Approved Intake Limit</div>
          </div>
          <div style="background:#eff6ff;border:1.5px solid #93c5fd;border-radius:8px;padding:14px;text-align:center;">
            <div style="font-size:12px;font-weight:700;color:#1e40af;margin-bottom:4px;">Current Scholar Count</div>
            <div style="font-size:26px;font-weight:800;color:#1e40af;">${E(curCountStr)}</div>
            <div style="font-size:11.5px;color:#2563eb;margin-top:2px;">Currently Guiding</div>
          </div>
          <div style="background:#fefce8;border:1.5px solid #fde047;border-radius:8px;padding:14px;text-align:center;">
            <div style="font-size:12px;font-weight:700;color:#854d0e;margin-bottom:4px;">Available Vacancies</div>
            <div style="font-size:26px;font-weight:800;color:#854d0e;">${E(vacStr)}</div>
            <div style="font-size:11.5px;color:#a16207;margin-top:2px;">Open Slots</div>
          </div>
        </div>
      </div>

      <!-- Assigned Scholars Table -->
      <div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,0.05);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px;">
          <div>
            <h3 style="margin:0;font-size:17px;color:#0f172a;font-weight:800;">Research Scholars Under This Supervisor</h3>
            <div style="font-size:12.5px;color:#64748b;margin-top:2px;">Active research scholars currently assigned to this supervisor.</div>
          </div>
          <span style="display:inline-block;padding:4px 12px;border-radius:20px;background:#e0f2fe;color:#0369a1;font-size:13px;font-weight:700;">
            Total Associated Scholars: ${scholars.length}
          </span>
        </div>
        <div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;font-size:12.5px;color:#475569;text-transform:uppercase;">
            <th style="padding:10px 14px;border:1px solid #e2e8f0;text-align:left;font-weight:700;">S.No</th>
            <th style="padding:10px 14px;border:1px solid #e2e8f0;text-align:left;font-weight:700;">Scholar Name</th>
            <th style="padding:10px 14px;border:1px solid #e2e8f0;text-align:left;font-weight:700;">Registration Number</th>
            <th style="padding:10px 14px;border:1px solid #e2e8f0;text-align:left;font-weight:700;">Department</th>
            <th style="padding:10px 14px;border:1px solid #e2e8f0;text-align:center;font-weight:700;">Status (FT/PT)</th>
            <th style="padding:10px 14px;border:1px solid #e2e8f0;text-align:center;font-weight:700;">Joining Year</th>
            <th style="padding:10px 14px;border:1px solid #e2e8f0;text-align:left;font-weight:700;">Research Status</th>
            <th style="padding:10px 14px;border:1px solid #e2e8f0;text-align:left;font-weight:700;">Research Area / Topic</th>
          </tr></thead>
          <tbody>${scholarRowsHtml}</tbody>
        </table></div>
      </div>
    </div>`;
  }

  function showSupervisorProfileView(supId, group) {
    let sup = null;
    if (group === 'E&T') {
      const sups = (window.ET_SUPERVISORS_SCHOLARS && window.ET_SUPERVISORS_SCHOLARS.allSupervisors) || [];
      sup = sups.find(s => (s.id || s.dbId) === supId || s.name === supId);
    } else if (group === 'Management') {
      const sups = (window.MANAGEMENT_RESEARCH_DATA && window.MANAGEMENT_RESEARCH_DATA.supervisors) || [];
      sup = sups.find(s => (s.id || s.dbId) === supId || s.name === supId);
    } else {
      const sups = (window.RESEARCH_DATA && window.RESEARCH_DATA.supervisors) || [];
      sup = sups.find(s => (s.id || s.dbId) === supId || s.name === supId);
    }
    if (!sup && window.SCHOLAR_REPORTS_DATA) {
      sup = window.SCHOLAR_REPORTS_DATA.getSupervisorById(supId);
    }
    if (!sup) {
      alert('Supervisor record not found.');
      return;
    }

    const assigned = getAssignedScholarsForSupervisor(sup, group);
    const appEl = document.getElementById('app');
    if (!appEl) return;
    appEl.innerHTML = renderSupervisorDetailView(sup, assigned, group);
    const backBtn = document.getElementById('btn-supervisor-detail-back');
    if (backBtn) {
      backBtn.onclick = () => show('people');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


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
        card('Total Faculty',        s.faculty,        s.deptLabel + ' · Faculty members',       'people'),
        card('Publications',         s.publications,   s.deptLabel + ' · Publications',          'publications'),
        card('Patent records',       s.patents,        s.deptLabel + ' · Patents recorded',      'patents'),
        card('Granted patents',      s.granted,        s.deptLabel + ' · Granted status',        'patents'),
        card('Published patents',    s.published,      s.deptLabel + ' · Published status',      'patents'),
        card('Funded projects',      s.fundedProjects, s.deptLabel + ' · Projects awarded',      'funded'),
        card('Research Supervisors', s.supervisors,    s.deptLabel + ' · Research supervisors',  'people'),
        card('Research Scholars',    s.scholars,       s.deptLabel + ' · Enrolled PhD scholars', 'people')
      ].join('');
      
      const s24 = getMgmtSummary(2024);
      const s25 = getMgmtSummary(2025);
      const s26 = getMgmtSummary(2026);
      const trendSch24 = getMgmtCumulativeScholars(2024, false).length;
      const trendSch25 = getMgmtPeopleRecords(2025).length;
      const trendSch26 = getMgmtPeopleRecords(2026).length;

      document.querySelector('#home-trend-charts').innerHTML = [
        threeYearChart([s24.publications, s25.publications, s26.publications], 'Publications', '#0ea5e9'),
        threeYearChart([s24.patents, s25.patents, s26.patents], 'Patents', '#10b981'),
        threeYearChart([s24.fundedProjects, s25.fundedProjects, s26.fundedProjects], 'Funded Projects', '#f59e0b'),
        threeYearChart([trendSch24, trendSch25, trendSch26], 'Research Scholars', '#8b5cf6')
      ].join('');

      document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => show(b.dataset.go));
    };
    if (q) q.onchange = (e) => { _activeYear = +e.target.value; r(); };
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
      cols: ['Year', 'Publication', 'Department', 'Authors', 'Journal', 'Link'],
      row: r => `<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(getMgmtDept(r) || '—')}</td><td>${E(r.authors)}</td><td>${E(r.journal || r.journal_name)}</td><td>${link(r.link || r.publication_link)}</td></tr>`,
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
      row: r => `<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(getMgmtDept(r) || r.department || r.departmentGroup || '—')}</td><td>${E(r.inventors || r.inventor_name)}</td><td><span class="badge ${(r.status||'').toLowerCase()}">${E(r.status)}</span></td></tr>`,
      key: 'department',
      caption: 'Patent status breakdown',
      metrics: (y, a) => [
        ['Patent records', a.length, 'Year total'],
        ['Granted patents', a.filter(x => (x.status||'').toLowerCase() === 'granted').length, 'Granted'],
        ['Published patents', a.filter(x => (x.status||'').toLowerCase() === 'published').length, 'Published'],
        ['Other / filed', a.filter(x => !['granted', 'published'].includes((x.status||'').toLowerCase())).length, 'Other status']
      ]
    },
    funded: {
      label: 'Funded projects (Management)',
      desc: 'Research funding awarded to Faculty of Management, filtered by selected department.',
      go: 'funded',
      cols: ['Year', 'Project', 'Principal investigator', 'Department', 'Funding agency', 'Amount', 'Status'],
      row: r => `<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(r.principalInvestigator || r.investigator_name) || '—'}</td><td>${E(getMgmtDept(r) || r.department || r.departmentGroup || '—')}</td><td>${E(r.agency || r.funding_agency)}</td><td>${E(r.amount)}</td><td>${formatFundedStatus(r.status)}</td></tr>`,
      key: 'agency',
      caption: 'Funding agencies',
      metrics: (y, a) => [
        ['Funded projects', a.length, 'Dept-filtered total'],
        ['Detailed projects', a.length, 'Available records'],
        ['Funding agencies', Object.keys(by(a, 'agency')).length, 'Supporting agencies']
      ]
    },
    people: {
      label: 'Supervisors & scholars (Management)',
      desc: 'Research supervisors and scholar capacities for Faculty of Management.',
      go: 'people',
      cols: ['Supervisor Name', 'Department', 'Designation', 'Maximum Scholar Capacity', 'Current Scholar Count', 'Available Vacancies'],
      row: r => {
        const supId = r.id || r.dbId || '';
        const supName = r.name || r.supervisorName || r.supervisor || (r.raw && r.raw.supervisor_name) || '—';
        const supNameHtml = supId
          ? `<a href="javascript:void(0)" class="link-supervisor-detail" data-sup-id="${E(supId)}" style="color:#0284c7;text-decoration:none;font-weight:700;cursor:pointer;" title="Click to view supervisor details and assigned scholars">${E(supName)} <span style="font-size:11px;color:#0369a1;">↗</span></a>`
          : `<span style="font-weight:700;color:#0f172a;">${E(supName)}</span>`;
        const desig = r.designation || (r.raw && r.raw.designation) || '—';
        const rawCap = r.maximum_scholar_capacity != null ? r.maximum_scholar_capacity : ((r.raw && r.raw.maximum_scholar_capacity != null) ? r.raw.maximum_scholar_capacity : r.maximumScholarCapacity);
        const maxCapStr = (rawCap != null && rawCap !== '') ? String(rawCap) : '—';
        const rawCount = r.current_scholar_count != null ? r.current_scholar_count : ((r.raw && r.raw.current_scholar_count != null) ? r.raw.current_scholar_count : r.currentScholarCount);
        const curCountStr = (rawCount != null && rawCount !== '') ? String(rawCount) : '—';
        const rawVac = r.available_vacancies != null ? r.available_vacancies : ((r.raw && r.raw.available_vacancies != null) ? r.raw.available_vacancies : r.availableVacancies);
        const vacStr = (rawVac != null && rawVac !== '') ? String(rawVac) : '—';
        const deptStr = getMgmtDept(r) || r.department || r.departmentGroup || '—';

        return `<tr>
          <td class="title-cell">${supNameHtml}</td>
          <td>${E(deptStr)}</td>
          <td style="color:#334155;">${E(desig)}</td>
          <td style="text-align:center;font-weight:600;color:#334155;">${E(maxCapStr)}</td>
          <td style="text-align:center;font-weight:600;color:#334155;">${E(curCountStr)}</td>
          <td style="text-align:center;font-weight:700;color:#0284c7;">${E(vacStr)}</td>
        </tr>`;
      },
      key: 'supervisor',
      caption: 'Supervisors by department',
      // cumData is the cumulative dataset (all years ≤ y)
      metrics: (y, a, cumData, cumSupCount) => {
        const cum = cumData || a;
        const sups = (typeof cumSupCount === 'number') ? cumSupCount : getMgmtCumulativeSupervisors(y, false).length;
        const yLabel = y === 2024 ? '2024' : y === 2025 ? '2024–2025' : '2024–2026';
        return [
          ['Total Scholars',              cum.length,                                                           'Cumulative (' + yLabel + ')'],
          ['Full-Time Scholars',          cum.filter(x=>_isFT(x.category||x.mode||'')).length,                 'Full-time mode · ' + yLabel],
          ['Part-Time Internal Scholars', cum.filter(x=>_isPTInternal(x.category||x.mode||'')).length,         'PT Internal · ' + yLabel],
          ['Part-Time External Scholars', cum.filter(x=>_isPTExternal(x.category||x.mode||'')).length,         'PT External · ' + yLabel],
          ['Research Supervisors',        sups,                                                                 'Active guides · ' + yLabel]
        ];
      }
    }
  };

  function mgmtDetail(type) {
    const c = mgmtConfig[type];
    if (!c) return `<div class="empty">Unknown section.</div>`;
    const mgmtBadge = `<span class="badge" style="background:#eef4ff;color:#1E5AA8;border:1px solid #c8d8ed;margin-left:8px;font-size:11.5px;padding:3px 8px;vertical-align:middle;">Management</span>`;
    return `${intro(c.desc + mgmtBadge)}<div class="filterbar table-filters">${filter(type + '-year')}<input id="${type}-search" placeholder="Search ${type === 'funded' ? 'project or investigator' : (type === 'people' ? 'supervisor or department' : type)}"></div><div class="metric-grid" id="${type}-kpis"></div><div class="panel-grid" style="grid-template-columns: minmax(250px, 0.7fr) 1.3fr; align-items: start;"><section class="panel focus-panel" style="padding:16px;"><h2>3-Year Trend</h2><p class="sub">Performance across 2024–2026</p><div id="${type}-chart"></div></section><section class="panel" style="padding:16px;"><h2>Department Comparison</h2><p class="sub">Ranked performance for selected year</p><div id="${type}-list"></div></section></div><section style="margin-top:18px"><div class="table-wrap"><table><thead><tr>${c.cols.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody id="${type}-table"></tbody></table></div><p class="footer-note" id="${type}-count"></p></section>`;
  }

  function bindMgmtDetail(type) {
    const c = mgmtConfig[type];
    if (!c) return;
    const yr = document.querySelector('#' + type + '-year');
    const search = document.querySelector('#' + type + '-search');

    const r = () => {
      const y = +yr.value;
      const mgmtScope = getManagementScope();
      const deptLabel = mgmtScope && mgmtScope.dept ? mgmtScope.dept : 'Management';

      let baseRows;
      if (type === 'people') {
        const allSups = (window.MANAGEMENT_RESEARCH_DATA && window.MANAGEMENT_RESEARCH_DATA.supervisors) || [];
        if (mgmtScope && mgmtScope.dept) {
          baseRows = allSups.filter(r => {
            const d = (r.department || r.departmentGroup || '').trim().toLowerCase();
            return d === mgmtScope.dept.toLowerCase() || d.includes(mgmtScope.dept.toLowerCase());
          });
        } else {
          baseRows = allSups.slice();
        }
        baseRows = _deduplicateSupervisors(baseRows);
      } else {
        baseRows = getMgmtRecords(type === 'funded' ? 'funded' : type, y);
      }

      const z = (search ? search.value : '').toLowerCase();
      const rows = baseRows.filter(x => !z || Object.values(x).join(' ').toLowerCase().includes(z));

      // Sort rows by Management sidebar department order
      rows.sort((a, b) => {
        const diff = getMgmtDepartmentOrder(a) - getMgmtDepartmentOrder(b);
        if (diff !== 0) return diff;
        return (a.name || a.supervisorName || '').localeCompare(b.name || b.supervisorName || '');
      });

      // For 'people': cumulative KPI cards
      const cumData = (type === 'people') ? getMgmtCumulativeScholars(y, false) : null;
      const cumSupCount = (type === 'people') ? getMgmtCumulativeSupervisors(y, false).length : null;
      const kpiBase = (type === 'people') ? getMgmtPeopleRecords(y) : baseRows;
      document.querySelector('#' + type + '-kpis').innerHTML = c.metrics(y, kpiBase, cumData, cumSupCount).map(x => card(x[0], x[1], x[2], c.go)).join('');

      // 3-Year Trend: 2024 bar = all active cohorts enrolled up to 2024 (year ≤ 2024)
      // so that base24 + base25 + base26 == cumulative 2026 total.
      // For 'people', use the cumulative helper for baseline; year-exact for 2025 & 2026.
      let trend24, trend25, trend26;
      if (type === 'people') {
        trend24 = getMgmtCumulativeScholars(2024, false).length;
        trend25 = getMgmtPeopleRecords(2025).length;
        trend26 = getMgmtPeopleRecords(2026).length;
      } else {
        const t24 = getMgmtRecords(type === 'funded' ? 'funded' : type, 2024);
        const t25 = getMgmtRecords(type === 'funded' ? 'funded' : type, 2025);
        const t26 = getMgmtRecords(type === 'funded' ? 'funded' : type, 2026);
        trend24 = t24.length; trend25 = t25.length; trend26 = t26.length;
      }
      document.querySelector('#' + type + '-chart').innerHTML = threeYearChart([trend24, trend25, trend26], c.label, '#0ea5e9', false);

      // Department Comparison: cumulative for 'people', selected-year for others
      let deptData;
      if (type === 'people') {
        const cumAllDepts = getMgmtCumulativeScholars(y, true);
        const deptKey = 'department';
        deptData = rank(by(cumAllDepts, deptKey)).filter(x => x[0] && x[0] !== '—');
      } else {
        const unfilteredBase = getMgmtRecords(type === 'funded' ? 'funded' : type, y, true);
        const deptKey = type === 'patents' ? 'departmentGroup' : 'department';
        deptData = rank(by(unfilteredBase, deptKey)).filter(x => x[0] && x[0] !== '—');
      }
      document.querySelector('#' + type + '-list').innerHTML = departmentComparisonChart(deptData, 'Departments', '#10b981');

      // Table
      const emptyMsg = `No matching ${c.label.toLowerCase()} found for ${y} in ${deptLabel}.`;
      document.querySelector('#' + type + '-table').innerHTML = rows.map(c.row).join('') || `<tr><td colspan="${c.cols.length}" class="empty">${emptyMsg}</td></tr>`;

      if (type === 'people') {
        document.querySelectorAll('#' + type + '-table .link-supervisor-detail').forEach(link => {
          link.onclick = (e) => {
            if (e) e.preventDefault();
            const supId = link.dataset.supId;
            showSupervisorProfileView(supId, 'Management');
          };
        });
      }

      const countMsg = (type === 'people')
        ? `Showing ${rows.length} research supervisors · ${deptLabel}` + (mgmtScope && mgmtScope.dept ? ` (filtered)` : ` (all departments in sidebar order)`)
        : `Showing ${rows.length} of ${baseRows.length} records for ${y} · ${deptLabel}`;
      document.querySelector('#' + type + '-count').textContent = countMsg;
      document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => show(b.dataset.go));
    };
    if (search) search.oninput = r;
    if (yr) yr.onchange = (e) => { _activeYear = +e.target.value; r(); };
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
      cols: ['Year', 'Publication', 'Department', 'Authors', 'Journal', 'Link'],
      row: r => `<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(getETDept(r) || '—')}</td><td>${E(r.authors)}</td><td>${E(r.journal)}</td><td>${link(r.link)}</td></tr>`,
      key: 'journal',
      caption: 'Leading journals',
      getRecords: (y, ignoreScope) => getETPublications(y, ignoreScope),
      metrics: (y, a) => [
        ['Publications', a.length, 'E&T total for ' + y],
        ['Journals', Object.keys(by(a, 'journal_name')).length, 'Represented journals']
      ]
    },
    patents: {
      label: 'Patent portfolio (E&T)',
      desc: 'Patents filed and granted by Faculty of Engineering & Technology (E&T) researchers.',
      go: 'patents',
      cols: ['Year', 'Patent title', 'Department', 'Inventor(s)', 'Status'],
      row: r => `<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(getETDept(r) || r.departmentGroup || '—')}</td><td>${E(r.inventors)}</td><td><span class="badge ${(r.status||'').toLowerCase()}">${E(r.status)}</span></td></tr>`,
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
      cols: ['Year', 'Project', 'Principal investigator', 'Department', 'Funding agency', 'Amount', 'Status'],
      row: r => `<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(r.principalInvestigator)}</td><td>${E(getETDept(r) || r.departmentGroup || r.department || '—')}</td><td>${E(r.agency)}</td><td>${E(r.amount)}</td><td>${formatFundedStatus(r.status)}</td></tr>`,
      key: 'agency',
      caption: 'Funding agencies',
      getRecords: (y, ignoreScope) => getETFunded(y, ignoreScope),
      metrics: (y, a) => [
        ['Funded projects', a.length, 'Year total'],
        ['Detailed projects', a.length, 'Available records'],
        ['Funding agencies', Object.keys(by(a, 'agency')).length, 'Supporting agencies']
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
        ['Clients / Agencies', Object.keys(by(a, 'agency')).length, 'Partner organizations']
      ]
    },
    people: {
      label: 'Research community (E&T)',
      desc: 'Research supervisors and scholar capacities for Faculty of Engineering & Technology (E&T).',
      go: 'people',
      cols: ['Supervisor Name', 'Department', 'Designation', 'Maximum Scholar Capacity', 'Current Scholar Count', 'Available Vacancies'],
      row: r => {
        const supId = r.id || r.dbId || '';
        const supName = r.name || r.supervisorName || r.supervisor || (r.raw && r.raw.supervisor_name) || '—';
        const supNameHtml = supId
          ? `<a href="javascript:void(0)" class="link-supervisor-detail" data-sup-id="${E(supId)}" style="color:#0284c7;text-decoration:none;font-weight:700;cursor:pointer;" title="Click to view supervisor details and assigned scholars">${E(supName)} <span style="font-size:11px;color:#0369a1;">↗</span></a>`
          : `<span style="font-weight:700;color:#0f172a;">${E(supName)}</span>`;
        const desig = r.designation || (r.raw && r.raw.designation) || '—';
        const rawCap = r.maximum_scholar_capacity != null ? r.maximum_scholar_capacity : ((r.raw && r.raw.maximum_scholar_capacity != null) ? r.raw.maximum_scholar_capacity : r.maximumScholarCapacity);
        const maxCapStr = (rawCap != null && rawCap !== '') ? String(rawCap) : '—';
        const rawCount = r.current_scholar_count != null ? r.current_scholar_count : ((r.raw && r.raw.current_scholar_count != null) ? r.raw.current_scholar_count : r.currentScholarCount);
        const curCountStr = (rawCount != null && rawCount !== '') ? String(rawCount) : '—';
        const rawVac = r.available_vacancies != null ? r.available_vacancies : ((r.raw && r.raw.available_vacancies != null) ? r.raw.available_vacancies : r.availableVacancies);
        const vacStr = (rawVac != null && rawVac !== '') ? String(rawVac) : '—';
        const deptStr = getETDept(r) || r.department || r.discipline || '—';

        return `<tr>
          <td class="title-cell">${supNameHtml}</td>
          <td>${E(deptStr)}</td>
          <td style="color:#334155;">${E(desig)}</td>
          <td style="text-align:center;font-weight:600;color:#334155;">${E(maxCapStr)}</td>
          <td style="text-align:center;font-weight:600;color:#334155;">${E(curCountStr)}</td>
          <td style="text-align:center;font-weight:700;color:#0284c7;">${E(vacStr)}</td>
        </tr>`;
      },
      key: 'supervisor',
      caption: 'Supervisors by department',
      getRecords: (y, ignoreScope) => getETPeopleRecords(y, ignoreScope),
      // cumData is the cumulative dataset (all years ≤ y)
      metrics: (y, a, cumData, cumSupCount) => {
        const cum = cumData || a;
        const sups = (typeof cumSupCount === 'number') ? cumSupCount : getETCumulativeSupervisors(y, false).length;
        const yLabel = y === 2024 ? '2024' : y === 2025 ? '2024–2025' : '2024–2026';
        return [
          ['Total Scholars',              cum.length,                                                    'Cumulative (' + yLabel + ')'],
          ['Full-Time Scholars',          cum.filter(x=>_isFT(x.category||'')).length,                  'Full-time mode · ' + yLabel],
          ['Part-Time Internal Scholars', cum.filter(x=>_isPTInternal(x.category||'')).length,          'PT Internal · ' + yLabel],
          ['Part-Time External Scholars', cum.filter(x=>_isPTExternal(x.category||'')).length,          'PT External · ' + yLabel],
          ['Research Supervisors',        sups,                                                          'Active guides · ' + yLabel]
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
      let trendSch24 = getETCumulativeScholars(2024, false).length;
      let trendSch25 = getETPeopleRecords(2025).length;
      let trendSch26 = getETPeopleRecords(2026).length;
      document.querySelector('#home-trend-charts').innerHTML = [
        threeYearChart([s24.publications, s25.publications, s26.publications], 'Publications', '#0ea5e9'),
        threeYearChart([s24.patents, s25.patents, s26.patents], 'Patents', '#10b981'),
        threeYearChart([s24.fundedProjects, s25.fundedProjects, s26.fundedProjects], 'Funded Projects', '#f59e0b'),
        threeYearChart([s24.consultancy, s25.consultancy, s26.consultancy], 'Consultancy Projects', '#8b5cf6'),
        threeYearChart([trendSch24, trendSch25, trendSch26], 'Research Scholars', '#ec4899')
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
    return `${intro(c.desc + etBadge)}<div class="filterbar table-filters">${filter(type + '-year')}<input id="${type}-search" placeholder="Search ${type === 'funded' ? 'project or investigator' : (type === 'people' ? 'supervisor or department' : type)}"></div><div class="metric-grid" id="${type}-kpis"></div><div class="panel-grid" style="grid-template-columns: minmax(250px, 0.7fr) 1.3fr; align-items: start;"><section class="panel focus-panel" style="padding:16px;"><h2>3-Year Trend</h2><p class="sub">Performance across 2024–2026</p><div id="${type}-chart"></div></section><section class="panel" style="padding:16px;"><h2>Department Comparison</h2><p class="sub">Ranked performance for selected year</p><div id="${type}-list"></div></section></div><section style="margin-top:18px"><div class="table-wrap"><table><thead><tr>${c.cols.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody id="${type}-table"></tbody></table></div><p class="footer-note" id="${type}-count"></p></section>`;
  }

  function bindETDetail(type) {
    const c = etConfig[type];
    if (!c) return;
    const yr = document.querySelector('#' + type + '-year');
    const search = document.querySelector('#' + type + '-search');

    const r = () => {
      const y = +yr.value;
      const etScope = getETScope();
      const deptLabel = etScope && etScope.dept ? etScope.dept : 'E&T';

      let baseRows;
      if (type === 'people') {
        const allSups = (window.ET_SUPERVISORS_SCHOLARS && window.ET_SUPERVISORS_SCHOLARS.allSupervisors) || (window.RESEARCH_DATA && window.RESEARCH_DATA.supervisors) || [];
        if (etScope && etScope.dept) {
          baseRows = allSups.filter(r => matchETDept(r.department, etScope.dept));
        } else {
          baseRows = allSups.slice();
        }
        baseRows = _deduplicateSupervisors(baseRows);
      } else {
        baseRows = c.getRecords(y);
      }

      const z = search.value.toLowerCase();
      const rows = baseRows.filter(x => !z || Object.values(x).join(' ').toLowerCase().includes(z));

      // Sort rows by E&T sidebar department order
      rows.sort((a, b) => {
        const diff = getETDepartmentOrder(a) - getETDepartmentOrder(b);
        if (diff !== 0) return diff;
        return (a.name || a.supervisorName || '').localeCompare(b.name || b.supervisorName || '');
      });

      // For 'people': cumulative KPI cards
      const cumData = (type === 'people') ? getETCumulativeScholars(y, false) : null;
      const cumSupCount = (type === 'people') ? getETCumulativeSupervisors(y, false).length : null;
      const kpiBase = (type === 'people') ? c.getRecords(y) : baseRows;
      document.querySelector('#' + type + '-kpis').innerHTML = c.metrics(y, kpiBase, cumData, cumSupCount).map(x => card(x[0], x[1], x[2], c.go)).join('');

      // 3-Year Trend: 2024 bar = all active cohorts enrolled up to 2024 (year ≤ 2024)
      // so that base24 + base25 + base26 == cumulative 2026 total.
      // For 'people', use the cumulative helper for baseline; year-exact for 2025 & 2026.
      let trend24, trend25, trend26;
      if (type === 'people') {
        trend24 = getETCumulativeScholars(2024, false).length;
        trend25 = getETPeopleRecords(2025).length;
        trend26 = getETPeopleRecords(2026).length;
      } else {
        trend24 = c.getRecords(2024).length;
        trend25 = c.getRecords(2025).length;
        trend26 = c.getRecords(2026).length;
      }
      document.querySelector('#' + type + '-chart').innerHTML = threeYearChart([trend24, trend25, trend26], c.label, '#0ea5e9', false);

      // Dept comparison: cumulative for 'people', selected-year for others
      let deptData;
      if (type === 'people') {
        // Cumulative across all years ≤ y, per department
        const cumAllDepts = getETCumulativeScholars(y, true);
        const etFallbackKey = (r) => normalizeETDepartment(r) || (r.departmentGroup || r.department || r.dept || '');
        deptData = rank(by(cumAllDepts, etFallbackKey)).filter(x => x[0] && x[0] !== '—');
      } else {
        const unfilteredBase = c.getRecords(y, true);
        const fallbackDeptKey = (r) => {
          let d = r.departmentGroup || r.department || r.dept || r['Department'] || '';
          return getOldETLabel(d);
        };
        deptData = rank(by(unfilteredBase, fallbackDeptKey)).filter(x => x[0] && x[0] !== '—');
      }
      document.querySelector('#' + type + '-list').innerHTML = departmentComparisonChart(deptData, 'Departments', '#10b981');

      // Table: always year-only
      const emptyMsg = `No matching ${c.label.toLowerCase()} found for ${y} in ${deptLabel}.`;
      document.querySelector('#' + type + '-table').innerHTML = rows.map(c.row).join('') || `<tr><td colspan="${c.cols.length}" class="empty">${emptyMsg}</td></tr>`;

      if (type === 'people') {
        document.querySelectorAll('#' + type + '-table .link-supervisor-detail').forEach(link => {
          link.onclick = (e) => {
            if (e) e.preventDefault();
            const supId = link.dataset.supId;
            showSupervisorProfileView(supId, 'E&T');
          };
        });
      }

      const countMsg = (type === 'people')
        ? `Showing ${rows.length} research supervisors · ${deptLabel}` + (etScope && etScope.dept ? ` (filtered)` : ` (all departments in sidebar order)`)
        : `Showing ${rows.length} of ${baseRows.length} records for ${y} · ${deptLabel}`;
      document.querySelector('#' + type + '-count').textContent = countMsg;
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

     const chartEl = document.querySelector('#home-chart');
     if (chartEl) chartEl.innerHTML = focus('home', [], y);

     const listEl = document.querySelector('#home-list');
     if (listEl) {
       const pubs = D.publications.filter(x => x.year === y);
       listEl.innerHTML = list(rank(by(pubs, 'department')), 'publications');
     }

     let s24 = getScopedSummary(2024), s25 = getScopedSummary(2025), s26 = getScopedSummary(2026);
     let trendSch24 = getFLABSCumulativeScholars(2024, false).length;
     let trendSch25 = getScopedRecords('people', D.scholars, 2025).length;
     let trendSch26 = getScopedRecords('people', D.scholars, 2026).length;
     document.querySelector('#home-trend-charts').innerHTML = [
       threeYearChart([s24.publications, s25.publications, s26.publications], 'Publications', '#0ea5e9'),
       threeYearChart([s24.patents, s25.patents, s26.patents], 'Patents', '#10b981'),
       threeYearChart([s24.fundedProjects, s25.fundedProjects, s26.fundedProjects], 'Funded Projects', '#f59e0b'),
       threeYearChart([s24.awards, s25.awards, s26.awards], 'Research Awards', '#8b5cf6'),
       threeYearChart([trendSch24, trendSch25, trendSch26], 'Research Scholars', '#ec4899')
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
  const records = new Proxy({}, {
    get(target, prop) {
      const data = window.RESEARCH_DATA || {};
      if (prop === 'people') return data.scholars || [];
      return data[prop] || [];
    }
  });

 const config={
   publications:{
     label:'Scopus publications',
     desc:'Scopus-indexed publications (filtered by selected department scope).',
     go:'publications',
     isInstWide: false,
     cols:['Year','Publication','Department','Authors','Journal','Link'],
     row:r=>`<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(getFLABSDept(r) || '—')}</td><td>${E(r.authors)}</td><td>${E(r.journal)}</td><td>${link(r.link)}</td></tr>`,
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
     row:r=>`<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(getFLABSDept(r) || r.departmentGroup || '—')}</td><td>${E(r.inventors)}</td><td><span class="badge ${r.status.toLowerCase()}">${E(r.status)}</span></td></tr>`,
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
     metrics:(y,a)=>[['Research awards',a.length,'Award records'],['Award recipients',Object.keys(by(a,'faculty')).length,'Faculty recognised'],['Repeat awardees',rank(by(a,'faculty')).filter(x=>x[1]>1).length,'Multiple recognitions']]
   },
   people:{
      label:'Supervisors & scholars',
      desc:'Research supervisors and scholar capacities (filtered by selected department scope).',
      go:'people',
      isInstWide: false,
      cols:['Supervisor Name','Department','Designation','Maximum Scholar Capacity','Current Scholar Count','Available Vacancies'],
      row:r=>{
        const supId = r.id || r.dbId || '';
        const supName = r.name || r.supervisorName || r.supervisor || (r.raw && r.raw.supervisor_name) || '\u2014';
        const supNameHtml = supId
          ? `<a href="javascript:void(0)" class="link-supervisor-detail" data-sup-id="${E(supId)}" style="color:#0284c7;text-decoration:none;font-weight:700;cursor:pointer;" title="Click to view supervisor details and assigned scholars">${E(supName)} <span style="font-size:11px;color:#0369a1;">\u2197</span></a>`
          : `<span style="font-weight:700;color:#0f172a;">${E(supName)}</span>`;
        const desig = r.designation || (r.raw && r.raw.designation) || '\u2014';
        const rawCap = r.maximum_scholar_capacity != null ? r.maximum_scholar_capacity : ((r.raw && r.raw.maximum_scholar_capacity != null) ? r.raw.maximum_scholar_capacity : r.maximumScholarCapacity);
        const maxCapStr = (rawCap != null && rawCap !== '') ? String(rawCap) : '\u2014';
        const rawCount = r.current_scholar_count != null ? r.current_scholar_count : ((r.raw && r.raw.current_scholar_count != null) ? r.raw.current_scholar_count : r.currentScholarCount);
        const curCountStr = (rawCount != null && rawCount !== '') ? String(rawCount) : '\u2014';
        const rawVac = r.available_vacancies != null ? r.available_vacancies : ((r.raw && r.raw.available_vacancies != null) ? r.raw.available_vacancies : r.availableVacancies);
        const vacStr = (rawVac != null && rawVac !== '') ? String(rawVac) : '\u2014';
        const deptStr = getFLABSDept(r) || r.department || r.departmentGroup || '\u2014';
        return `<tr>
          <td class="title-cell">${supNameHtml}</td>
          <td>${E(deptStr)}</td>
          <td style="color:#334155;">${E(desig)}</td>
          <td style="text-align:center;font-weight:600;color:#334155;">${E(maxCapStr)}</td>
          <td style="text-align:center;font-weight:600;color:#334155;">${E(curCountStr)}</td>
          <td style="text-align:center;font-weight:700;color:#0284c7;">${E(vacStr)}</td>
        </tr>`;
      },
      key:'departmentGroup',
      caption:'Supervisors by department',
     // cumData is the cumulative dataset (all years ≤ y); a is still the year-only data used for the table
     metrics:(y, a, cumData, cumSupCount) => {
       const cum = cumData || a;
       const sups = (typeof cumSupCount === 'number') ? cumSupCount : getFLABSCumulativeSupervisors(y, false).length;
       const yLabel = y === 2024 ? '2024' : y === 2025 ? '2024–2025' : '2024–2026';
       return [
         ['Total Scholars',              cum.length,                                                   'Cumulative (' + yLabel + ')'],
         ['Full-Time Scholars',          cum.filter(x=>_isFT(x.category)).length,                     'Full-time mode · ' + yLabel],
         ['Part-Time Internal Scholars', cum.filter(x=>_isPTInternal(x.category||x.mode||'')).length, 'PT Internal · ' + yLabel],
         ['Part-Time External Scholars', cum.filter(x=>_isPTExternal(x.category||x.mode||'')).length, 'PT External · ' + yLabel],
         ['Research Supervisors',        sups,                                                         'Active guides · ' + yLabel]
       ];
     }
   },
   funded:{
     label:'Funded projects',
     desc:'Awarded research projects and funding agencies (Institution-wide dataset).',
     go:'funded',
     isInstWide: true,
     cols:['Year','Project','Principal investigator','Department','Funding agency','Amount','Status'],
     row:r=>`<tr><td>${r.year}</td><td class="title-cell">${E(r.title)}</td><td>${E(r.principalInvestigator)||'—'}</td><td>${E(getFLABSDept(r) || r.departmentGroup || r.department || '—')}</td><td>${E(r.agency)}</td><td>${E(r.amount)}</td><td>${formatFundedStatus(r.status)}</td></tr>`,
     key:'agency',
     caption:'Funding agencies',
     metrics:(y,a)=>[['Funded projects',a.length,'Institution-wide total'],['Detailed projects',a.length,'Available records'],['Funding agencies',Object.keys(by(a,'agency')).length,'Supporting agencies']]
   }
 };

 const options=(rows,key,label)=>`<select id="filter-${key}"><option value="">${label}</option>${Object.keys(by(rows,key)).sort().map(x=>`<option value="${E(x)}">${E(x)}</option>`).join('')}</select>`;
 const extraFilters=type=>type==='publications'?options(D.publications,'journal','All journals')+`<select id="filter-link"><option value="">All link statuses</option><option value="yes">Link available</option><option value="no">No link listed</option></select>`:type==='patents'?options(D.patents,'departmentGroup','All departments')+`<select id="filter-status"><option value="">All patent types</option><option>Granted</option><option>Published</option><option>Not recorded</option></select>`:type==='awards'?options(D.awards,'faculty','All faculty members'):type==='people'?'':options(D.funded,'agency','All funding agencies')+options(D.funded,'principalInvestigator','All principal investigators');

   function detail(type){
    let c=config[type];
    const instBadge = c.isInstWide ? '<span class="badge" style="background:#eef4ff;color:#1E5AA8;border:1px solid #c8d8ed;margin-left:8px;font-size:11.5px;padding:3px 8px;vertical-align:middle;">Institution-wide</span>' : '';
    return `${intro(c.desc + instBadge)}<div class="filterbar table-filters">${filter(type+'-year')}${extraFilters(type)}<input id="${type}-search" placeholder="Search ${type==='people'?'supervisor or department':type==='funded'?'project or investigator':type}"></div><div class="metric-grid" id="${type}-kpis"></div><div class="panel-grid" style="grid-template-columns: minmax(250px, 0.7fr) 1.3fr; align-items: start;"><section class="panel focus-panel" style="padding:16px;"><h2>3-Year Trend</h2><p class="sub">Performance across 2024–2026</p><div id="${type}-chart"></div></section><section class="panel" style="padding:16px;"><h2>Department Comparison</h2><p class="sub">Ranked performance for selected year</p><div id="${type}-list"></div></section></div><section style="margin-top:18px"><div class="table-wrap"><table><thead><tr>${c.cols.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody id="${type}-table"></tbody></table></div><p class="footer-note" id="${type}-count"></p></section>`;
  }

  function bindDetail(type){
    let c=config[type],yr=document.querySelector('#'+type+'-year'),search=document.querySelector('#'+type+'-search'),all=records[type],selects=[...document.querySelectorAll('.table-filters select')];
    let r=()=>{
      let y=+yr.value;
      let z=search.value.toLowerCase();
      let get=id=>document.querySelector(id)?.value||'';

      // For 'people': use FLABS supervisor list (dept-filtered), not scholar list
      let base;
      if (type === 'people') {
        const dept = window.SRM_SCOPE && window.SRM_SCOPE.getSelectedDept();
        const allSups = (window.RESEARCH_DATA && window.RESEARCH_DATA.supervisors) || [];
        let filteredSups = dept ? window.SRM_SCOPE.filterResearchCommunityByDepartment(allSups, dept) : allSups.slice();
        base = _deduplicateSupervisors(filteredSups);
      } else {
        base = getScopedRecords(type, all, y);
      }

      let rows=base.filter(x=>{
        if(z&&!Object.values(x).join(' ').toLowerCase().includes(z))return false;
        if(type==='publications')return(!get('#filter-journal')||x.journal===get('#filter-journal'))&&(!get('#filter-link')||(get('#filter-link')==='yes')===Boolean(x.link));
        if(type==='patents')return(!get('#filter-departmentGroup')||x.departmentGroup===get('#filter-departmentGroup'))&&(!get('#filter-status')||x.status===get('#filter-status'));
        if(type==='awards')return!get('#filter-faculty')||x.faculty===get('#filter-faculty');
        if(type==='people')return true; // supervisors: filtered via sidebar dept, no extra dropdown filters
        return(!get('#filter-agency')||x.agency===get('#filter-agency'))&&(!get('#filter-principalInvestigator')||x.principalInvestigator===get('#filter-principalInvestigator'));
      });

      // Sort rows by FLABS sidebar department order, then by name
      rows.sort((a, b) => {
        const diff = getFLABSDepartmentOrder(a) - getFLABSDepartmentOrder(b);
        if (diff !== 0) return diff;
        const nameA = (a.name || a.supervisorName || a.supervisor || '').toLowerCase();
        const nameB = (b.name || b.supervisorName || b.supervisor || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });

      const dept = window.SRM_SCOPE && window.SRM_SCOPE.getSelectedDept();

      // For 'people': compute cumulative data (all years ≤ y) for KPI cards and dept chart
      const cumData = (type === 'people') ? getFLABSCumulativeScholars(y, false) : null;
      const cumSupCount = (type === 'people') ? getFLABSCumulativeSupervisors(y, false).length : null;

     document.querySelector('#'+type+'-kpis').innerHTML=c.metrics(y, base, cumData, cumSupCount).map(x=>card(x[0],x[1],x[2],c.go)).join('');
     
     // 3-Year Trend: 2024 bar = all active cohorts enrolled up to 2024 (year ≤ 2024)
     // so that base24 + base25 + base26 == cumulative 2026 total.
     // For 'people', use the cumulative helper for baseline; year-exact for 2025 & 2026.
     let trend24, trend25, trend26;
     if (type === 'people') {
       trend24 = getFLABSCumulativeScholars(2024, false).length;
       trend25 = getScopedRecords(type, all, 2025).length;
       trend26 = getScopedRecords(type, all, 2026).length;
     } else {
       trend24 = getScopedRecords(type, all, 2024).length;
       trend25 = getScopedRecords(type, all, 2025).length;
       trend26 = getScopedRecords(type, all, 2026).length;
     }
     document.querySelector('#'+type+'-chart').innerHTML=threeYearChart([trend24, trend25, trend26], c.label, '#0ea5e9', false);
     
      // Dept comparison: cumulative for 'people', selected-year for others
      let deptData = [];
      if (type === 'people' && window.SRM_SCOPE) {
        // Cumulative across all years ≤ y, per department
        const cumAllDepts = getFLABSCumulativeScholars(y, true);
        deptData = window.SRM_SCOPE.FLABS_DEPARTMENTS.map(d => {
          const deptScholars = window.SRM_SCOPE.filterResearchCommunityByDepartment(cumAllDepts, d);
          return [d.label, _deduplicateScholars(deptScholars).length];
        }).filter(x => x[1] > 0).sort((a,b) => b[1] - a[1]);
      } else if (window.SRM_SCOPE && type !== 'awards' && type !== 'funded') {
        const allForYear = all.filter(r => r.year === y);
        deptData = window.SRM_SCOPE.FLABS_DEPARTMENTS.map(d => {
          let count = 0;
          if (type === 'publications') count = window.SRM_SCOPE.filterPublicationsByDepartment(allForYear, d).length;
          else if (type === 'patents') count = window.SRM_SCOPE.filterPatentsByDepartment(allForYear, d).length;
          return [d.label, count];
        }).filter(x => x[1] > 0).sort((a,b) => b[1] - a[1]);
      } else {
        const allForYear = all.filter(r => r.year === y);
        const flabsDeptKey = (r) => r.departmentGroup || r.department || r['Department'] || r['Dept.'] || r['Department of Authors'] || '';
        deptData = rank(by(allForYear, flabsDeptKey)).filter(x => x[0] && x[0] !== '—' && x[0] !== 'Institution-wide' && x[0] !== 'NA');
      }
     document.querySelector('#'+type+'-list').innerHTML=departmentComparisonChart(deptData, 'Departments', '#10b981');

     // Table: always year-only (base is already filtered to selected year)
     const emptyMsg = dept
       ? `No matching ${c.label.toLowerCase()} found for ${y} in ${E(dept.label)}.`
       : `No matching records for ${y}.`;
       
     document.querySelector('#'+type+'-table').innerHTML=rows.map(c.row).join('')||`<tr><td colspan="${c.cols.length}" class="empty">${emptyMsg}</td></tr>`;

     // For 'people' (FLABS): bind supervisor detail click links
     if (type === 'people') {
       document.querySelectorAll('#people-table .link-supervisor-detail').forEach(link => {
         link.onclick = (ev) => {
           if (ev) ev.preventDefault();
           showSupervisorProfileView(link.dataset.supId, 'FLABS');
         };
       });
     }

     let countMsg = type === 'people'
       ? `Showing ${rows.length} supervisor${rows.length !== 1 ? 's' : ''}.`
       : `Showing ${rows.length} of ${base.length} detailed records for ${y} (table shows selected year only).`;
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

    if (window.SupabaseDataService && !window.SupabaseDataService.isReady) {
      nav.forEach(n => n.classList.toggle('active', n.dataset.page === p));
      app.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:360px;gap:16px;text-align:center;padding:60px 20px;">
          <div style="width:40px;height:40px;border:3px solid #e2e8f0;border-top-color:#0284c7;border-radius:50%;animation:srmSpin 0.8s linear infinite;"></div>
          <style>@keyframes srmSpin{to{transform:rotate(360deg)}}</style>
          <div style="font-weight:700;font-size:16px;color:#0f172a;">Connecting to Supabase Cloud Backend...</div>
          <div style="font-size:13.5px;color:#64748b;max-width:480px;">Fetching 3,532 live records across 8 database tables directly from <code>pndvjkcoroadxonvpphb.supabase.co</code></div>
        </div>
      `;
      return;
    }

    // Scholar and Supervisor roles must only see their respective report portal
    const currentUser = window.SRM_AUTH ? window.SRM_AUTH.getCurrentUser() : null;
    if (currentUser && (currentUser.role === 'scholar' || currentUser.role === 'supervisor')) {
      const headerNav = document.querySelector('.site-header nav');
      if (headerNav) headerNav.style.display = 'none';
      const scopePanel = document.getElementById('scope-panel');
      if (scopePanel) scopePanel.style.display = 'none';
      if (window.SCHOLAR_MODULE) {
        window.SCHOLAR_MODULE.mount(currentUser);
      }
      return;
    }

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
 window._SRM_DASHBOARD_REFRESH = function() {
    // GLOBAL FIX: preserve the active section when the user changes department.
    // Root cause: Scholar Reports button is added dynamically after the IIFE captures
    // the nav[] NodeList, so show() never clears .active from it on navigation away.
    // Check whether any OTHER regular nav button is also .active - if so, the user
    // has navigated away from Scholar Reports, so do not mount it.
    var scholarBtn = document.querySelector('.site-header nav [data-page="scholar-reports"]');
    var otherActiveBtn = document.querySelector('.site-header nav .nav-link:not([data-page="scholar-reports"]).active');
    if (scholarBtn && scholarBtn.classList.contains('active') && !otherActiveBtn && window.SCHOLAR_MODULE) {
      var schUser = window.SRM_AUTH ? window.SRM_AUTH.getCurrentUser() : null;
      if (schUser) {
        window.SCHOLAR_MODULE.mount(schUser);
        return;
      }
    }
    show(_currentPage);
  };
})();

// ── Auth user-bar wiring ───────────────────────────────────────────────────────
// Runs AFTER the dashboard IIFE. Wires the logout button and shows the
// logged-in user's name + role in the header. Dashboard rendering is untouched.
(function () {
  'use strict';
  var AUTH = window.SRM_AUTH;
  var user = (AUTH && AUTH.getCurrentUser()) || { role: 'chairman', name: 'Chairman', scope: 'ALL' };
  var userBar = document.getElementById('user-bar');
  var userBarInfo = document.getElementById('user-bar-info');
  var logoutBtn   = document.getElementById('logout-btn');

  if (!userBar) return;

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
  if (userBarInfo) {
    userBarInfo.textContent = (user.role === 'chairman' || user.name === roleLabel) ? 'Chairman' : (user.name + ' · ' + roleLabel);
  }
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
        if (AUTH && typeof AUTH.logout === 'function') {
          AUTH.logout();
        } else {
          sessionStorage.removeItem('srm_rd_current_user');
          sessionStorage.setItem('srm_rd_logged_out', '1');
          window.location.replace('/login.html');
        }
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

  if (!SCOPE) return;

  var user = (AUTH && AUTH.getCurrentUser()) || { role: 'chairman', name: 'Chairman', scope: 'ALL' };

  if (user && (user.role === 'scholar' || user.role === 'supervisor')) {
    var sidebarEl = document.getElementById('scope-panel');
    if (sidebarEl) sidebarEl.style.display = 'none';
    var navEl = document.querySelector('.site-header nav');
    if (navEl) navEl.style.display = 'none';
    return;
  }

  // ── 1. Determine initial scope strictly from the authenticated user's profile ─
  // NOTE: We intentionally do NOT read srm_rd_selected_node_id from sessionStorage
  // here so that stale selections from a previous user's session never bleed into
  // the freshly-logged-in user's view.
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
    // Dean / Deputy Dean / RD Coordinator: start with their group
    var grp = SCOPE.findNodeByKey(tree, user.group);
    if (grp) {
      SCOPE.setSelectedNode(grp);
    } else {
      SCOPE.selectGroup('FLABS');
    }
  } else {
    // Chairman default: select FLABS group so research stats & KPI cards are immediately visible
    var flabsGrp = SCOPE.findNodeByKey(tree, 'FLABS');
    if (flabsGrp) {
      SCOPE.setSelectedNode(flabsGrp);
    } else {
      SCOPE.setSelectedNode(tree);
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

