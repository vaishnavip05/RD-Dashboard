const fs = require('fs');

// 1. Read E&T data
const etDataRaw = fs.readFileSync('et_supervisors_scholars.json', 'utf8');
const etData = JSON.parse(etDataRaw);

// 2. Read FLABS data (data.js)
let flabsDataRaw = fs.readFileSync('data.js', 'utf8');
// Evaluate the FLABS JS payload
let window = {};
eval(flabsDataRaw);
const flabsScholars = window.RESEARCH_DATA.scholars;

const supervisorsMap = {}; // id -> supervisorObj
const scholarsMap = {};    // id -> scholarObj

let supIdCounter = 1;
let schIdCounter = 1;

function getSupId(name) {
    if (!name) return null;
    let n = name.trim().toLowerCase();
    // find if existing
    for (const key in supervisorsMap) {
        if (supervisorsMap[key].rawName.toLowerCase() === n ||
            supervisorsMap[key].rawName.toLowerCase().replace(/\[.*?\]/, '').trim() === n.replace(/\[.*?\]/, '').trim() ||
            supervisorsMap[key].name.toLowerCase() === n) {
            return key;
        }
    }
    
    let id = 'sup_' + supIdCounter++;
    
    // clean name (remove employee ID in brackets)
    let cleanName = name.replace(/\s*\[.*?\]\s*/, '').trim();
    let empMatch = name.match(/\[(.*?)\]/);
    let empId = empMatch ? empMatch[1].trim() : 'EMP_SUP_' + supIdCounter;
    
    supervisorsMap[id] = {
        id: id,
        name: cleanName,
        rawName: name,
        employeeId: empId,
        department: '', // will populate from scholar
        designation: 'Research Supervisor',
        email: 'supervisor' + supIdCounter + '@srmist.edu.in',
        assignedScholarIds: [],
        group: '' // will populate from scholar
    };
    return id;
}

function processScholar(s, group) {
    if (!s.scholar || s.scholar.trim() === '' || s.scholar === 'Total' || s.scholar.startsWith('FT') || s.scholar.startsWith('PT')) return;
    if (!s.supervisor) return; // Unassigned

    let supId = getSupId(s.supervisor);
    if (!supId) return;

    let schId = 'sch_' + schIdCounter++;
    let dept = s.department || s.departmentGroup || 'Unknown Department';
    
    // update supervisor group and dept if empty
    if (!supervisorsMap[supId].department) supervisorsMap[supId].department = dept;
    if (!supervisorsMap[supId].group) supervisorsMap[supId].group = group;

    supervisorsMap[supId].assignedScholarIds.push(schId);
    
    scholarsMap[schId] = {
        id: schId,
        name: s.scholar || s.name,
        expansionOfInitial: '',
        registrationNo: s.applicationNo || s.registration || ('REG' + schIdCounter),
        employeeId: 'EMP_SCH_' + schIdCounter,
        department: dept,
        supervisorId: supId,
        supervisorName: supervisorsMap[supId].name,
        phdTopic: 'Research Topic ' + schIdCounter,
        registrationDate: (s.year ? s.year + '-01-01' : '2024-01-01'),
        isFundedProject: 'NO',
        jrfSrfStatus: 'N/A',
        projectTitle: '—',
        fundingAgency: '—',
        principalInvestigator: '—',
        courseworkAllotted: 4,
        courseworkCompleted: 0,
        comprehensiveVivaCompleted: 'NO',
        comprehensiveVivaDate: '—',
        scopusId: '',
        orcidId: '',
        isScopusLinkedToOrcid: 'NO',
        fellowshipAmount: '31,000',
        group: group
    };
}

// Process E&T Scholars
for (const year in etData.yearlyData) {
    const yearData = etData.yearlyData[year];
    for (const record of yearData.records) {
        processScholar({
            scholar: record.scholar,
            supervisor: record.supervisor,
            applicationNo: record.applicationNo,
            department: record.department || (record.program ? record.program.split('[')[0] : 'Unknown'),
            year: year
        }, 'E&T');
    }
}

// Process FLABS Scholars
for (const s of flabsScholars) {
    processScholar({
        scholar: s.name,
        supervisor: s.supervisor,
        registration: s.registration,
        department: s.department,
        year: s.year
    }, 'FLABS');
}

console.log(`Processed ${Object.keys(supervisorsMap).length} Supervisors and ${Object.keys(scholarsMap).length} Scholars.`);

const authSupervisors = Object.values(supervisorsMap).map(sup => ({
    id: sup.id,
    name: sup.name,
    employeeId: sup.employeeId,
    password: '123456',
    role: 'supervisor',
    campus: 'SRM Ramapuram',
    college: 'SRM Institute of Science & Technology',
    group: sup.group,
    department: sup.department,
    scope: 'SUPERVISOR_ONLY'
}));

const authScholars = Object.values(scholarsMap).map(sch => ({
    id: sch.id,
    name: sch.name,
    employeeId: sch.employeeId,
    password: '123456',
    role: 'scholar',
    campus: 'SRM Ramapuram',
    college: 'SRM Institute of Science & Technology',
    group: sch.group,
    department: sch.department,
    scope: 'SELF_ONLY'
}));

const authDeputyDeans = [
    {
      id: 'deputy_dean_flabs',
      name: 'Dr. Deputy Dean (FLABS)',
      employeeId: 'DDFLABS01',
      password: '123456',
      role: 'deputy_dean',
      campus: 'SRM Ramapuram',
      college: 'SRM Institute of Science & Technology',
      group: 'FLABS',
      department: null,
      scope: 'GROUP_ALL_DEPARTMENTS'
    },
    {
      id: 'deputy_dean_ent',
      name: 'Dr. Deputy Dean (E&T)',
      employeeId: 'DDENT01',
      password: '123456',
      role: 'deputy_dean',
      campus: 'SRM Ramapuram',
      college: 'SRM Institute of Science & Technology',
      group: 'E&T',
      department: null,
      scope: 'GROUP_ALL_DEPARTMENTS'
    },
    {
      id: 'deputy_dean_phd',
      name: 'Dr. Deputy Dean (PhD)',
      employeeId: 'DDPHD01',
      password: '123456',
      role: 'deputy_dean',
      campus: 'SRM Ramapuram',
      college: 'SRM Institute of Science & Technology',
      group: 'PhD',
      department: null,
      scope: 'GROUP_ALL_DEPARTMENTS'
    },
    {
      id: 'deputy_dean_barch_mgmt',
      name: 'Dr. Deputy Dean (B.Arch & Management)',
      employeeId: 'DDBARCHMGMT01',
      password: '123456',
      role: 'deputy_dean',
      campus: 'SRM Ramapuram',
      college: 'SRM Institute of Science & Technology',
      group: 'B.Arch & Management',
      department: null,
      scope: 'GROUP_ALL_DEPARTMENTS'
    }
];

const newAuthUsersBlock = 'var SCHOLAR_MODULE_USERS = ' + JSON.stringify(authDeputyDeans.concat(authSupervisors, authScholars), null, 4) + ';\n';

const newReportsSupervisorsBlock = 'var SUPERVISORS = ' + JSON.stringify(Object.values(supervisorsMap), null, 4) + ';\n';
const newReportsScholarsBlock = 'var SCHOLARS = ' + JSON.stringify(Object.values(scholarsMap), null, 4) + ';\n';

// Replace in auth.js
let authCode = fs.readFileSync('auth.js', 'utf8');
authCode = authCode.replace(/var SCHOLAR_MODULE_USERS = \[[\s\S]*?\];\n/, newAuthUsersBlock);
fs.writeFileSync('auth.js', authCode);
console.log('Updated auth.js');

// Replace in scholar_reports_data.js
let repCode = fs.readFileSync('scholar_reports_data.js', 'utf8');
repCode = repCode.replace(/var SUPERVISORS = \[[\s\S]*?\];\n/, newReportsSupervisorsBlock);
repCode = repCode.replace(/var SCHOLARS = \[[\s\S]*?\];\n/, newReportsScholarsBlock);
fs.writeFileSync('scholar_reports_data.js', repCode);
console.log('Updated scholar_reports_data.js');

