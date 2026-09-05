const fs = require('fs');
let code = fs.readFileSync('scholar_module.js', 'utf8');

// Find the start of the return statement in renderSupervisorDashboard
let renderFuncStart = code.indexOf('function renderSupervisorDashboard(user) {');
let returnStmtStart = code.indexOf("return '<div style=\"max-width:1200px;", renderFuncStart);
if (returnStmtStart === -1) {
    console.log("Could not find return statement in renderSupervisorDashboard.");
    process.exit(1);
}

// We want to insert our new table before the final closing div of the dashboard wrapper.
// Let's build the HTML string for the scholars table.
const scholarsTableHTML = `
    // --- START INJECTED ASSIGNED SCHOLARS TABLE ---
    var scholarsTableHtml = '';
    if (scholars.length > 0) {
      scholarsTableHtml += '<div style="background:#fff;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);padding:20px;margin-bottom:24px;">' +
        '<h3 style="margin:0 0 16px;font-size:16px;color:#1e293b;">Assigned Research Scholars</h3>' +
        '<div style="overflow-x:auto;">' +
          '<table style="width:100%;border-collapse:collapse;text-align:left;">' +
            '<thead>' +
              '<tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;font-size:13px;color:#475569;text-transform:uppercase;">' +
                '<th style="padding:10px 12px;font-weight:600;">S.No</th>' +
                '<th style="padding:10px 12px;font-weight:600;">Scholar Name</th>' +
                '<th style="padding:10px 12px;font-weight:600;">Department</th>' +
                '<th style="padding:10px 12px;font-weight:600;">Date of Joining</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>';
      
      scholars.forEach(function(s, index) {
        scholarsTableHtml += '<tr style="border-bottom:1px solid #e2e8f0;">' +
          '<td style="padding:10px 12px;color:#64748b;">' + (index + 1) + '</td>' +
          '<td style="padding:10px 12px;font-weight:600;color:#0f172a;">' + E(s.name) + '</td>' +
          '<td style="padding:10px 12px;color:#475569;">' + E(s.department) + '</td>' +
          '<td style="padding:10px 12px;color:#475569;">' + E(s.registrationDate) + '</td>' +
        '</tr>';
      });

      scholarsTableHtml += '</tbody></table></div></div>';
    } else {
      scholarsTableHtml += '<div style="background:#fff;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);padding:20px;margin-bottom:24px;color:#64748b;text-align:center;">No scholars assigned.</div>';
    }
    // --- END INJECTED ASSIGNED SCHOLARS TABLE ---

    `;

// The return statement usually looks like: return '<div... ' + var + '... </div>';
// We need to inject our HTML string variable into the return string concatenation.
// Let's insert the `scholarsTableHtml` logic right before the `return` statement.
let preReturnCode = code.substring(0, returnStmtStart) + scholarsTableHTML;
let postReturnCode = code.substring(returnStmtStart);

// Now in the postReturnCode, we need to inject `' + scholarsTableHtml + '` somewhere appropriate.
// Right after the basic details section. The basic details section ends with `</div>' +` before the tables section.
// Let's find: `<h2 style="margin:0 0 20px;font-size:18px;color:#0f172a;">Pending Actions</h2>` or similar.

let pendingActionsIdx = postReturnCode.indexOf('<h2 style="margin:0 0 20px;font-size:18px;color:#0f172a;">Pending Actions</h2>');
if (pendingActionsIdx !== -1) {
    // Insert `' + scholarsTableHtml + '` before this section
    postReturnCode = postReturnCode.substring(0, pendingActionsIdx) + "' + scholarsTableHtml + '" + postReturnCode.substring(pendingActionsIdx);
} else {
    // Fallback: look for the first closing div of a top level block.
    // Let's just find the first `margin-bottom:24px;">' +` and insert after it.
    let targetStr = "margin-bottom:24px;\">' +";
    let insertIdx = postReturnCode.indexOf(targetStr);
    if (insertIdx !== -1) {
        insertIdx += targetStr.length;
        postReturnCode = postReturnCode.substring(0, insertIdx) + "\n scholarsTableHtml + " + postReturnCode.substring(insertIdx);
    } else {
        console.log("Could not find insertion point for scholars table in HTML string.");
    }
}

code = preReturnCode + postReturnCode;
fs.writeFileSync('scholar_module.js', code);
console.log('Modified scholar_module.js correctly');
