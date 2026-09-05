const fs = require('fs');
let code = fs.readFileSync('login.html', 'utf8');

code = code.replace(/if \(role === 'hod'\) \{/, "if (role === 'hod' || role === 'scholar' || role === 'supervisor') {");

const changeCodeStr = `        // Filter users for selected group
        var filteredUsers = AUTH.getUsersByRole(selectedRole).filter(function (u) {
          return u.group === selectedGroup;
        });

        var roleName = (selectedRole === 'hod') ? 'HOD' : (selectedRole === 'supervisor' ? 'Supervisor' : 'Scholar');
        profileSelect.innerHTML = '<option value="">— Choose ' + selectedGroup + ' ' + roleName + ' —</option>';
        filteredUsers.forEach(function (u) {
          var opt = document.createElement('option');
          opt.value = u.id || u.employeeId;
          var empLabel = u.employeeId ? ' (' + u.employeeId + ')' : '';
          var deptLabel = u.department ? u.department : (selectedRole === 'hod' ? 'HOD' : '');
          var separator = deptLabel ? ' — ' : '';
          opt.textContent = u.name + separator + deptLabel + empLabel;
          opt.dataset.userid = u.id || u.employeeId;
          profileSelect.appendChild(opt);
        });`;

code = code.replace(/        \/\/ Filter HODs for selected group[\s\S]*?profileSelect\.appendChild\(opt\);\n        }\);/, changeCodeStr);

fs.writeFileSync('login.html', code);
console.log('Replaced login.html correctly');
