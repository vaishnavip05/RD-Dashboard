const fs = require('fs');

// 1. Patch data.js
let dataJs = fs.readFileSync('data.js', 'utf8');
const prefix = 'window.RESEARCH_DATA = ';
const start = dataJs.indexOf(prefix);
if (start !== -1) {
  const jsonStart = start + prefix.length;
  const jsonEnd = dataJs.lastIndexOf(';');
  const jsonData = JSON.parse(dataJs.substring(jsonStart, jsonEnd));

  const mappings = {
    "Dr.G.Rajendran": "Biotechnology",
    "Dr. Shamitha Rajesh": "JMC",
    "Dr. R Renugadevi": "Data Science",
    "Dr. R Ramyadevi": "Data Science",
    "Dr S.Umarani": "BCA",
    "Dr.M.Kamaraj": "Biotechnology",
    "": "Biotechnology", // 7th project
    "Dr S Lakshmi (Mgmt)": "Commerce"
  };

  if (jsonData.funded) {
    jsonData.funded.forEach(p => {
      if (mappings[p.principalInvestigator]) {
        p.departmentGroup = mappings[p.principalInvestigator];
      }
    });
    const newDataJs = dataJs.substring(0, jsonStart) + JSON.stringify(jsonData, null, 0) + ';\n';
    fs.writeFileSync('data.js', newDataJs);
    console.log("Patched data.js");
  }
}

// 2. Patch scope.js
let scopeJs = fs.readFileSync('scope.js', 'utf8');
if (!scopeJs.includes('filterFundedProjectsByDepartment')) {
  const funcToAdd = `
  function filterFundedProjectsByDepartment(records, deptNode, year) {
    if (!records) return [];
    var base = year ? records.filter(function (r) { return r.year === year; }) : records;
    if (!deptNode || deptNode.type !== 'dept') return base;
    var label = deptNode.label.toLowerCase().trim();
    return base.filter(function (r) {
      var raw = (r.departmentGroup || r.department || '').toLowerCase().trim();
      return raw === label || (deptNode.publicationAliases && deptNode.publicationAliases.some(function(a) { return a.toLowerCase().trim() === raw; }));
    });
  }
`;
  scopeJs = scopeJs.replace('function filterPatentsByDepartment(', funcToAdd + '\n  function filterPatentsByDepartment(');
  scopeJs = scopeJs.replace('filterPatentsByDepartment:           filterPatentsByDepartment,', 'filterPatentsByDepartment:           filterPatentsByDepartment,\n    filterFundedProjectsByDepartment:    filterFundedProjectsByDepartment,');
  fs.writeFileSync('scope.js', scopeJs);
  console.log("Patched scope.js");
}

// 3. Patch app.js
let appJs = fs.readFileSync('app.js', 'utf8');
// Fix getScopedRecords
appJs = appJs.replace(
  /if \(type === 'people'\) \{\s*return SCOPE\.filterResearchCommunityByDepartment\(dataset, dept, year\);\s*\}\s*\/\/ Awards and Funded Projects are institution-wide for FLABS\s*return dataset\.filter\(r => r\.year === year\);/,
  `if (type === 'people') {
      return SCOPE.filterResearchCommunityByDepartment(dataset, dept, year);
    }
    if (type === 'funded') {
      return SCOPE.filterFundedProjectsByDepartment(dataset, dept, year);
    }
    // Awards are institution-wide for FLABS
    return dataset.filter(r => r.year === year);`
);

// Fix getScopedSummary
appJs = appJs.replace(
  /const funded   = D\.funded\.filter\(r => r\.year === y\);/,
  `const funded   = SCOPE ? SCOPE.filterFundedProjectsByDepartment(D.funded, dept, y) : D.funded.filter(r => r.year === y);`
);

// Fix intro strings
appJs = appJs.replace(
  /Publications, Patents, and Scholars are filtered by department; Awards and Funded Projects reflect institution-wide performance\./g,
  `Publications, Patents, Funded Projects, and Scholars are filtered by department; Awards reflect institution-wide performance.`
);

fs.writeFileSync('app.js', appJs);
console.log("Patched app.js");
