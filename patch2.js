const fs = require('fs');
let code = fs.readFileSync('scholar_module.js', 'utf8');

// The marker we want to insert before:
const marker = `'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-bottom:20px;">' +
        kpiCard('Assigned Scholars', scholars.length, 'Under Supervision')`;

const scholarsTableHTML = `
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
`;

let newCode = code.replace(marker, scholarsTableHTML + "\n      " + marker);

if (newCode === code) {
    console.log("Could not find insertion marker!");
} else {
    fs.writeFileSync('scholar_module.js', newCode);
    console.log("Patched correctly!");
}
