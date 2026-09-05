const fs = require('fs');
let code = fs.readFileSync('scholar_module.js', 'utf8');

const evtCode = `
  // Global listener for View Proof buttons
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.btn-view-proof');
    if (btn) {
      var data = btn.getAttribute('data-filedata');
      if (data) {
        var w = window.open('');
        if (w) {
          w.document.write('<iframe src="' + data + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%; position:absolute;" allowfullscreen></iframe>');
          w.document.title = btn.getAttribute('data-filename') || 'View Proof';
        } else {
          alert('Please allow popups to view the proof document.');
        }
      }
    }
  });
`;

if (!code.includes('Global listener for View Proof')) {
  code = code.replace(/}\(window\)\);\s*$/, evtCode + '}(window));\n');
  fs.writeFileSync('scholar_module.js', code);
  console.log('Added global listener');
} else {
  console.log('Listener already exists');
}
