const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

let count = 0;

// We'll do simple text replacements for each of the 3 funded col/row pairs.
// Find exact substrings by looking at what's in the file, and replace them.

const oldMgmt = "cols: ['Year', 'Project', 'Principal investigator', 'Funding agency', 'Amount'],";
const newMgmt = "cols: ['Year', 'Project', 'Principal investigator', 'Department', 'Funding agency', 'Amount'],";

const oldRowMgmt = "row: r => `<tr><td>${r.year}</td><td class=\"title-cell\">${E(r.title)}</td><td>${E(r.principalInvestigator) || '—'}</td><td>${E(r.agency)}</td><td>${E(r.amount)}</td></tr>`,";
const newRowMgmt = "row: r => `<tr><td>${r.year}</td><td class=\"title-cell\">${E(r.title)}</td><td>${E(r.principalInvestigator) || '—'}</td><td>${E(r.departmentGroup) || '—'}</td><td>${E(r.agency)}</td><td>${E(r.amount)}</td></tr>`,";

const oldRowET = "row: r => `<tr><td>${r.year}</td><td class=\"title-cell\">${E(r.title)}</td><td>${E(r.principalInvestigator)}</td><td>${E(r.agency)}</td><td>${E(r.amount)}</td></tr>`,";
const newRowET = "row: r => `<tr><td>${r.year}</td><td class=\"title-cell\">${E(r.title)}</td><td>${E(r.principalInvestigator)}</td><td>${E(r.departmentGroup)||'—'}</td><td>${E(r.agency)}</td><td>${E(r.amount)}</td></tr>`,";

const oldRowFLABS = "cols:['Year','Project','Principal investigator','Funding agency','Amount'],";
const newRowFLABS = "cols:['Year','Project','Principal investigator','Department','Funding agency','Amount'],";

const oldRowFLABS2 = "row:r=>`<tr><td>${r.year}</td><td class=\"title-cell\">${E(r.title)}</td><td>${E(r.principalInvestigator)||'—'}</td><td>${E(r.agency)}</td><td>${E(r.amount)}</td></tr>`,";
const newRowFLABS2 = "row:r=>`<tr><td>${r.year}</td><td class=\"title-cell\">${E(r.title)}</td><td>${E(r.principalInvestigator)||'—'}</td><td>${E(r.departmentGroup)||'—'}</td><td>${E(r.agency)}</td><td>${E(r.amount)}</td></tr>`,";

// Replace all 3 occurrences of the old cols line (Mgmt and ET share the same cols string)
// We'll replace each one carefully:

// Count occurrences of oldMgmt
const timesFound = (app.split(oldMgmt).length - 1);
console.log('Found oldMgmt cols:', timesFound, 'times');

// Replace all 2 spaced versions (Mgmt + ET configs)
app = app.split(oldMgmt).join(newMgmt);
count += timesFound;

// Replace the compact FLABS version
const timesFLABS = (app.split(oldRowFLABS).length - 1);
console.log('Found oldRowFLABS cols:', timesFLABS, 'times');
app = app.split(oldRowFLABS).join(newRowFLABS);

// Replace Management row
const timesMgmtRow = (app.split(oldRowMgmt).length - 1);
console.log('Found Mgmt row:', timesMgmtRow, 'times');
app = app.split(oldRowMgmt).join(newRowMgmt);

// Replace ET row
const timesETRow = (app.split(oldRowET).length - 1);
console.log('Found ET row:', timesETRow, 'times');
app = app.split(oldRowET).join(newRowET);

// Replace FLABS row
const timesFLABSRow = (app.split(oldRowFLABS2).length - 1);
console.log('Found FLABS row:', timesFLABSRow, 'times');
app = app.split(oldRowFLABS2).join(newRowFLABS2);

fs.writeFileSync('app.js', app);
console.log('Done. Verifying...');

const verify = app.match(/cols[: ]*\['Year','?'?, ?'Project'.*?\]/g) || app.match(/cols: \['Year', 'Project'.*?\]/g);
console.log('Final funded cols:', (app.split("'Project'").length - 1), 'instances of Project in cols');
