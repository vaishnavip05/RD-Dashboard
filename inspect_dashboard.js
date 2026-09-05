const fs = require('fs');
const code = fs.readFileSync('scholar_module.js', 'utf8');
const regex = /return '<div style="max-width:1200px[\s\S]*?<\/div>';/g;
let match;
while ((match = regex.exec(code)) !== null) {
    if (match.index > code.indexOf('function renderSupervisorDashboard')) {
        console.log(match[0].substring(0, 500));
        console.log("...");
        console.log(match[0].substring(match[0].length - 1000));
        break;
    }
}
