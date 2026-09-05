const fs = require('fs');
let code = fs.readFileSync('scholar_module.js', 'utf8');

function fixEditableForm(fnName) {
  let startIdx = code.indexOf('function ' + fnName + '(');
  if (startIdx === -1) return;
  let funcEndMatches = [...code.matchAll(/    '<\/div>';\s*  }/g)];
  let endIdx = -1;
  for (let match of funcEndMatches) {
    if (match.index > startIdx) {
      endIdx = match.index;
      break;
    }
  }
  
  if (endIdx === -1) return;
  let funcBody = code.substring(startIdx, endIdx + 17);

  // find action bar
  let actionMatch = funcBody.match(/      \/\/ Action bar[\s\S]*?'<div style="display:flex;gap:10px;">' \+[\s\S]*?'<\/div>' \+\s*'<\/div>' \+/);
  if (!actionMatch) return;
  let actionCode = actionMatch[0];
  
  let newFuncBody = funcBody.replace(actionCode, '');
  
  // replace back button part in the top so the top bar just has back button and status
  let backBtnMatch = actionCode.match(/'<div style="display:flex;align-items:center;gap:10px;">' \+[\s\S]*?'<\/div>' \+/);
  let backBtnCode = backBtnMatch ? backBtnMatch[0] : '';
  
  let topBar = "      '<div style=\"background:#fff;border:1.5px solid #0284c7;border-radius:10px;padding:12px 20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;box-shadow:0 4px 12px rgba(2,132,199,0.12);\">' +\n        " + backBtnCode + "\n      '</div>' +";
  
  // get action buttons
  let actionBtnsMatch = actionCode.match(/'<div style="display:flex;gap:10px;">' \+[\s\S]*?'<\/div>' \+/);
  let actionBtnsCode = actionBtnsMatch ? actionBtnsMatch[0] : '';
  
  let bottomBar = "      '<div style=\"background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;display:flex;justify-content:flex-end;margin-top:20px;\">' +\n        " + actionBtnsCode + "\n      '</div>' +";
  
  // insert topBar at the beginning (where action bar was)
  newFuncBody = newFuncBody.substring(0, actionMatch.index) + topBar + newFuncBody.substring(actionMatch.index);
  
  // insert bottomBar at the end before final '</div>';
  newFuncBody = newFuncBody.replace(/    '<\/div>';/, bottomBar + "\n    '</div>';");
  
  code = code.replace(funcBody, newFuncBody);
}

fixEditableForm('renderEditableForm');
fixEditableForm('renderDay8EditableForm');

fs.writeFileSync('scholar_module.js', code);
console.log('Fixed editable forms');
