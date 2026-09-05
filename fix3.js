const fs = require('fs');
let code = fs.readFileSync('scholar_module.js', 'utf8');

function fixEditableForm(fnName) {
  let startIdx = code.indexOf('function ' + fnName);
  if (startIdx === -1) return;
  let funcEndIdx = code.indexOf('    \'</div>\';\n  }', startIdx);
  if (funcEndIdx === -1) return;
  
  let funcBody = code.substring(startIdx, funcEndIdx + 17);
  
  let actionMatch = funcBody.match(/      \/\/ Action bar[\s\S]*?'<div id="form-action-bar"[\s\S]*?'<\/div>' \+\s*'<\/div>' \+/);
  if (!actionMatch) return;
  let actionCode = actionMatch[0];
  
  let innerDivsMatches = [...actionCode.matchAll(/        '<div style="display:flex;align-items:center;gap:10px;">' \+[\s\S]*?'<\/div>' \+/g)];
  if (innerDivsMatches.length < 2) return;
  
  let backBtnCode = innerDivsMatches[0][0];
  let submitBtnsCode = innerDivsMatches[1][0];
  
  let topBar = "      // Navigation bar\n      '<div style=\"background:#fff;border:1.5px solid #0284c7;border-radius:10px;padding:12px 20px;margin-bottom:20px;box-shadow:0 4px 12px rgba(2,132,199,0.12);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;\">' +\n" + backBtnCode + "\n      '</div>' +";
  
  let bottomBar = "      // Action bar at the bottom\n      '<div style=\"background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;display:flex;justify-content:flex-end;margin-top:20px;\">' +\n" + submitBtnsCode.replace(/        '/, "        '").replace(/        '<\/div>'/, "        '</div>'") + "\n      '</div>' +";
  
  let newFuncBody = funcBody.replace(actionCode, '');
  newFuncBody = newFuncBody.substring(0, actionMatch.index) + topBar + newFuncBody.substring(actionMatch.index);
  newFuncBody = newFuncBody.replace(/    '<\/div>';/, bottomBar + "\n    '</div>';");
  
  code = code.replace(funcBody, newFuncBody);
}

fixEditableForm('renderEditableForm');
fixEditableForm('renderDay8EditableForm');

fs.writeFileSync('scholar_module.js', code);
console.log('Fixed editable forms correctly');
