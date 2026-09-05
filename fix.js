const fs = require('fs');
let code = fs.readFileSync('scholar_module.js', 'utf8');

const regexes = [
  // 1. Review Panels (Supervisor, HOD, Dean, Day8 variants)
  // They have: '<div id="review-action-area">' + ... '</div>' + '</div>' + ... '</div>';
  {
    find: /('<div id="review-action-area">' \+\s*\([\s\S]*?\)\s*\+\s*\'<\/div>\' \+\s*\'<\/div>\' \+)([\s\S]*?)(      \'<div style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:24px;box-shadow:0 2px 8px rgba\(0,0,0,0\.05\);">\' \+[\s\S]*?\'<\/div>\' \+)/g,
    replace: (match, p1, p2, p3) => {
      // p1 is the action area and its closing div and the header closing div
      // p2 is the remarks section (if any)
      // p3 is the report read-only view
      
      // We want: header closing div + p2 + p3 + action area
      let actionArea = p1.replace("'<div id=\"review-action-area\">' +", "'<div style=\"background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;display:flex;justify-content:flex-end;margin-top:20px;\">' +\n        '<div id=\"review-action-area\">' +").replace(/<\/div>' \+\s*'<\/div>' \+/, "</div>' +\n      '</div>' +");
      
      // Wait, a simpler way is to just find the action block and move it.
      return ''; 
    }
  }
];

// Actually, let's do this programmatically with split/join on the known functions
let functionsToFix = [
  'renderSupervisorReviewPanel',
  'renderDay8SupervisorReviewPanel',
  'renderHODReviewPanel',
  'renderDay8HODReviewPanel',
  'renderDeanLevelReviewPanel',
  'renderDay8DeanLevelReviewPanel'
];

functionsToFix.forEach(fn => {
  let startIdx = code.indexOf('function ' + fn);
  if (startIdx === -1) return;
  let endIdx = code.indexOf('  }', startIdx);
  let funcBody = code.substring(startIdx, endIdx + 3);

  // Extract the action area
  let actionMatch = funcBody.match(/'<div id="review-action-area">' \+[\s\S]*? renderReviewActionBarButtons\(report\.status\)\s*\)\s*\+\s*'<\/div>' \+/);
  if (actionMatch) {
    let actionCode = actionMatch[0];
    
    // Remove action area from header
    let newFuncBody = funcBody.replace(actionCode, '');
    
    // We also need to add a closing div to the header since we removed it? 
    // Wait, the header has: '<div ...>' + '<div>' + backBtn + span + '</div>' + actionCode + '</div>'
    // So removing actionCode is fine, the header '</div>' is still there.
    
    // Now append actionCode right before the final '</div>'
    // We add a styled wrapper around it to make it look good at the bottom
    let styledActionCode = "'<div style=\"background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;display:flex;justify-content:flex-end;margin-top:20px;\">' +\n        " + actionCode.replace(/\+$/, "+ '</div>' +");
    
    newFuncBody = newFuncBody.replace(/      '<\/div>' \+\s*    '<\/div>';/, "      '</div>' +\n      " + styledActionCode + "\n    '</div>';");
    
    code = code.replace(funcBody, newFuncBody);
  }
});

// Now for Editable Forms
let editableForms = [
  'renderEditableForm',
  'renderDay8EditableForm'
];

editableForms.forEach(fn => {
  let startIdx = code.indexOf('function ' + fn);
  if (startIdx === -1) return;
  let endIdx = code.indexOf('  }', startIdx);
  let funcBody = code.substring(startIdx, endIdx + 3);

  let actionMatch = funcBody.match(/'<div id="form-action-area" style="display:flex;gap:10px;">' \+[\s\S]*?'<\/div>' \+/);
  if (actionMatch) {
    let actionCode = actionMatch[0];
    let newFuncBody = funcBody.replace(actionCode, '');
    
    let styledActionCode = "'<div style=\"background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;display:flex;justify-content:flex-end;margin-top:20px;\">' +\n        " + actionCode.replace(/'<div id="form-action-area"[^>]+>' \+/, "'<div id=\"form-action-area\" style=\"display:flex;gap:10px;\">' +").replace(/\+$/, "+ '</div>' +");
    
    newFuncBody = newFuncBody.replace(/      '<\/div>' \+\s*    '<\/div>';/, "      '</div>' +\n      " + styledActionCode + "\n    '</div>';");
    
    code = code.replace(funcBody, newFuncBody);
  }
});

// For ReadOnly Views
let readOnlyForms = [
  'showReadOnlyView',
  'showDay8ReadOnlyView'
];
readOnlyForms.forEach(fn => {
  let startIdx = code.indexOf('function ' + fn);
  if (startIdx === -1) return;
  let endIdx = code.indexOf('  }', startIdx);
  let funcBody = code.substring(startIdx, endIdx + 3);

  let actionMatch = funcBody.match(/          renderScholarReadOnlyButtons\(report\) \+\s*'<\/div>' \+/);
  if (actionMatch) {
    let newFuncBody = funcBody.replace(/          renderScholarReadOnlyButtons\(report\) \+\s*/, '');
    
    let styledActionCode = "'<div style=\"background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;display:flex;justify-content:flex-end;margin-top:20px;\">' +\n          renderScholarReadOnlyButtons(report) +\n        '</div>' +";
    
    newFuncBody = newFuncBody.replace(/      appEl\.innerHTML = '[\s\S]*?';/, function(match) {
        return match.replace(/        '<\/div>' \+\s*      '<\/div>';/, "        '</div>' +\n        " + styledActionCode + "\n      '</div>';");
    });
    
    code = code.replace(funcBody, newFuncBody);
  }
});

fs.writeFileSync('scholar_module.js', code);
console.log('Fixed scholar_module.js');
