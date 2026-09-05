import os

app_path = "app.js"
with open(app_path, "r", encoding="utf-8") as f:
    content = f.read()

# First, let's restore the deleted bindDetail and detail functions.
# The tool deleted from `function detail(type){` to the end of the `rows=base.filter(...)` logic.
# Wait, let's find exactly what's left.
# Let's just find `const dept = window.SRM_SCOPE && window.SRM_SCOPE.getSelectedDept();`
# and prepend the missing functions.

missing_code = """
  function detail(type){
    let c=config[type];
    const instBadge = c.isInstWide ? '<span class="badge" style="background:#eef4ff;color:#075da0;border:1px solid #c8d8ed;margin-left:8px;font-size:11.5px;padding:3px 8px;vertical-align:middle;">Institution-wide</span>' : '';
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

"""

if "function bindDetail(type){" not in content:
    content = content.replace("      const dept = window.SRM_SCOPE && window.SRM_SCOPE.getSelectedDept();", missing_code + "      const dept = window.SRM_SCOPE && window.SRM_SCOPE.getSelectedDept();")


# Now, update the FLABS department chart logic
target = """
      const allForYear = all.filter(r => r.year === y);
       const deptData = rank(by(allForYear, flabsDeptKey)).filter(x => x[0] && x[0] !== '—' && x[0] !== 'Institution-wide' && x[0] !== 'NA');
"""

replacement = """
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
"""

if target in content:
    content = content.replace(target, replacement)
else:
    # try another match
    target2 = """      const flabsDeptKey = (r) => r.departmentGroup || r.department || r['Department'] || r['Dept.'] || r['Department of Authors'] || '';
      const allForYear = all.filter(r => r.year === y);
       const deptData = rank(by(allForYear, flabsDeptKey)).filter(x => x[0] && x[0] !== '—' && x[0] !== 'Institution-wide' && x[0] !== 'NA');"""
    if target2 in content:
        content = content.replace(target2, replacement)
    else:
        print("COULD NOT FIND TARGET FOR REPLACEMENT")

with open(app_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully")
