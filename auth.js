/**
 * SRM R&D Portal — Authentication & Scope Module
 * Single Source of Truth for Demo User Registry & Role Security
 */

(function (global) {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────────
  // 22 FLABS HOD PROFILES
  // ─────────────────────────────────────────────────────────────────────────────
  var FLABS_HOD_USERS = [
    { id: 'hod_commerce', name: 'Dr.T.V.Ambuli', employeeId: 'T1102', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'Commerce', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_commerce_pa', name: 'Dr. D. Janis Bibiyana', employeeId: 'T1115', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'Commerce - PA, ISM, IAF & SF', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_bca', name: 'Dr S Uma Shankari', employeeId: 'TSH037', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'BCA', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_commerce_af', name: 'Dr.V.Deepa', employeeId: 'T855', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'Commerce (A&F)', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_data_science', name: 'Dr.N.Vijayalakshmi', employeeId: 'T786', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'Data Science', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_cyber_security', name: 'Dr. J. Jebamalar Tamilselvi', employeeId: 'TSH009', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'B.Sc Cyber Security', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_computer_science', name: 'Dr. Y. Angeline Christobel', employeeId: 'TSH252', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'B.Sc Computer Science', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_ai_ml', name: 'Dr. S. Subbaiah', employeeId: 'TSH118', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'B.Sc. (AI & ML)', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_mca', name: 'Dr. Agusthiyar R', employeeId: 'T738', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'MCA', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_viscom', name: 'Dr.V.Prabakaran', employeeId: 'HOD_VISCOM001', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'Viscom', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_film_tech', name: 'Dr. S. Shanmuga Nathan', employeeId: 'TSH167', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'Film Tech', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_fashion', name: 'V. Bhanu Rekha', employeeId: 'TSH280', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'Fashion Designing', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_jmc', name: 'Ms Padmavathy P S', employeeId: 'TSH065', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'JMC', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_lcs_english', name: 'Dr.Sridevi T', employeeId: 'T1005', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'LCS (English)', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_lcs_tamil', name: 'Dr. K. Chitra', employeeId: 'TSH046', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'LCS (Tamil)', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_biotechnology', name: 'Dr.M.Kamaraj', employeeId: 'TSH022', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'Biotechnology', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_psychology', name: 'Dr. Psychology HOD', employeeId: 'HOD_PSY001', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'Psychology', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_mathematics', name: 'Dr. T. HARIKRISHNAN', employeeId: 'TSH135', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'Mathematics', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_physics', name: 'Dr. Physics HOD', employeeId: 'HOD_PHY001', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'Physics', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_chemistry', name: 'Dr. Chemistry HOD', employeeId: 'HOD_CHEM001', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'Chemistry', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_economics', name: 'Dr. Economics HOD', employeeId: 'HOD_ECO001', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'Economics', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_english', name: 'Dr. English HOD', employeeId: 'HOD_ENG001', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science and Technology', group: 'FLABS', department: 'English', scope: 'DEPARTMENT_ONLY' }
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // 15 E&T HOD PROFILES
  // ─────────────────────────────────────────────────────────────────────────────
  var ENT_HOD_USERS = [
    { id: 'hod_ent_cse', name: 'Dr. CSE HOD', employeeId: 'HOD_ET_CSE', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'E&T', department: 'CSE', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_ent_aiml', name: 'Dr. AIML HOD', employeeId: 'HOD_ET_AIML', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'E&T', department: 'AIML', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_ent_bda', name: 'Dr. BDA&CC HOD', employeeId: 'HOD_ET_BDA', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'E&T', department: 'BDA&CC', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_ent_iot', name: 'Dr. IoT & CSBS HOD', employeeId: 'HOD_ET_IOT', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'E&T', department: 'IoT & CSBS', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_ent_it', name: 'Dr. IT HOD', employeeId: 'HOD_ET_IT', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'E&T', department: 'IT', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_ent_ece', name: 'Dr. ECE HOD', employeeId: 'HOD_ET_ECE', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'E&T', department: 'ECE', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_ent_eee', name: 'Dr. EEE HOD', employeeId: 'HOD_ET_EEE', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'E&T', department: 'EEE', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_ent_mech', name: 'Dr. Mechanical HOD', employeeId: 'HOD_ET_MECH', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'E&T', department: 'Mechanical', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_ent_civil', name: 'Dr. Civil HOD', employeeId: 'HOD_ET_CIVIL', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'E&T', department: 'Civil', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_ent_biotech', name: 'Dr. Biotech HOD', employeeId: 'HOD_ET_BIOTECH', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'E&T', department: 'Biotechnology', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_ent_bme', name: 'Dr. BME HOD', employeeId: 'HOD_ET_BME', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'E&T', department: 'BME', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_ent_maths', name: 'Dr. Maths HOD', employeeId: 'HOD_ET_MATHS', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'E&T', department: 'Mathematics', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_ent_physics', name: 'Dr. Physics HOD', employeeId: 'HOD_ET_PHYSICS', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'E&T', department: 'Physics', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_ent_chem', name: 'Dr. Chemistry HOD', employeeId: 'HOD_ET_CHEM', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'E&T', department: 'Chemistry', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_ent_efl', name: 'Dr. EFL HOD', employeeId: 'HOD_ET_EFL', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'E&T', department: 'EFL', scope: 'DEPARTMENT_ONLY' }
  ];

  var BARCH_HOD_USERS = [
    { id: 'hod_barch', name: 'Dr. B.Arch HOD', employeeId: 'BARCHHOD001', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'B.Arch', department: 'Architecture', scope: 'DEPARTMENT_ONLY' }
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // MANAGEMENT PROFILES
  // ─────────────────────────────────────────────────────────────────────────────
  var MOCK_MANAGEMENT_USERS = [
    { id: 'dean_mgmt', name: 'Dr. Management Dean', employeeId: 'MGMTDEAN001', password: '123456', role: 'dean', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'Management', department: null, scope: 'GROUP_ALL_DEPARTMENTS' },
    { id: 'rd_mgmt', name: 'Dr. Management R&D Coordinator', employeeId: 'MGNTRD001', password: '123456', role: 'rd_coordinator', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'Management', department: null, scope: 'GROUP_ALL_DEPARTMENTS' },
    { id: 'hod_bba', name: 'Dr. BBA HOD', employeeId: 'BBAHOD001', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'Management', department: 'BBA', scope: 'DEPARTMENT_ONLY' },
    { id: 'hod_mba', name: 'Dr. MBA HOD', employeeId: 'MBAHOD001', password: '123456', role: 'hod', campus: 'SRM Ramapuram', college: 'SRM Institute of Science & Technology', group: 'Management', department: 'MBA', scope: 'DEPARTMENT_ONLY' }
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // COMPLETE DEMO USER REGISTRY
  // ─────────────────────────────────────────────────────────────────────────────
  var DEMO_USERS = [
    // ── CHAIRMAN ──────────────────────────────────────────────────────────────
    {
      id: 'user_chairman',
      name: 'Chairman',
      employeeId: 'CHAIRMAN001',
      password: '123456',
      role: 'chairman',
      campus: null,
      college: null,
      group: null,
      department: null,
      scope: 'ALL'
    },

    // ── R&D COORDINATORS ──────────────────────────────────────────────────────
    {
      id: 'rd_flabs',
      name: 'FLABS R&D Coordinator',
      employeeId: 'RD_FLABS_001',
      password: '123456',
      role: 'rd_coordinator',
      campus: 'SRM Ramapuram',
      college: 'SRM Institute of Science and Technology',
      group: 'FLABS',
      department: null,
      scope: 'GROUP_ALL_DEPARTMENTS'
    },
    {
      id: 'rd_ent',
      name: 'R&D Coordinator - E&T',
      employeeId: 'RND_ET001',
      password: '123456',
      role: 'rd_coordinator',
      campus: 'SRM Ramapuram',
      college: 'SRM Institute of Science and Technology',
      group: 'E&T',
      department: null,
      scope: 'GROUP_ALL_DEPARTMENTS'
    },
    {
      id: 'rd_barch',
      name: 'B.Arch R&D Coordinator',
      employeeId: 'RD_BARCH_001',
      password: '123456',
      role: 'rd_coordinator',
      campus: 'SRM Ramapuram',
      college: 'SRM Institute of Science and Technology',
      group: 'B.Arch',
      department: null,
      scope: 'GROUP_ALL_DEPARTMENTS'
    },
    MOCK_MANAGEMENT_USERS[1],

    // ── DEANS ─────────────────────────────────────────────────────────────────
    {
      id: 'dean_flabs',
      name: 'FLABS Dean',
      employeeId: 'DEAN_FLABS_001',
      password: '123456',
      role: 'dean',
      campus: 'SRM Ramapuram',
      college: 'SRM Institute of Science and Technology',
      group: 'FLABS',
      department: null,
      scope: 'GROUP_ALL_DEPARTMENTS'
    },
    {
      id: 'dean_ent',
      name: 'Dean - E&T',
      employeeId: 'DEAN_ET001',
      password: '123456',
      role: 'dean',
      campus: 'SRM Ramapuram',
      college: 'SRM Institute of Science and Technology',
      group: 'E&T',
      department: null,
      scope: 'GROUP_ALL_DEPARTMENTS'
    },
    {
      id: 'dean_barch',
      name: 'B.Arch Dean',
      employeeId: 'DEAN_BARCH_001',
      password: '123456',
      role: 'dean',
      campus: 'SRM Ramapuram',
      college: 'SRM Institute of Science and Technology',
      group: 'B.Arch',
      department: null,
      scope: 'GROUP_ALL_DEPARTMENTS'
    },
    MOCK_MANAGEMENT_USERS[0]
  ].concat(FLABS_HOD_USERS, ENT_HOD_USERS, BARCH_HOD_USERS, [MOCK_MANAGEMENT_USERS[2], MOCK_MANAGEMENT_USERS[3]]);

  // ─────────────────────────────────────────────────────────────────────────────
  // SESSION HELPERS
  // ─────────────────────────────────────────────────────────────────────────────
  var SESSION_KEY = 'srm_rd_current_user';

  function getCurrentUser() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setCurrentUser(user) {
    if (!user) {
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }
    var safeUser = Object.assign({}, user);
    delete safeUser.password;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  }

  function isAuthenticated() {
    return getCurrentUser() !== null;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.replace('login.html');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTHENTICATION
  // ─────────────────────────────────────────────────────────────────────────────
  function authenticate(identifier, password) {
    if (!identifier || !password) return null;
    var trimmedId = String(identifier).trim().toUpperCase();
    var user = DEMO_USERS.find(function (u) {
      var matchEmp = u.employeeId && u.employeeId.trim().toUpperCase() === trimmedId;
      var matchId = u.id && u.id.toUpperCase() === trimmedId;
      var matchName = u.name && u.name.toUpperCase() === trimmedId;
      return matchEmp || matchId || matchName;
    });

    if (!user) return null;
    if (user.password !== password) return null;

    var safeUser = Object.assign({}, user);
    delete safeUser.password;
    return safeUser;
  }

  function getUsersByRole(role) {
    return DEMO_USERS.filter(function (u) {
      return u.role === role;
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCOPE HELPERS
  // ─────────────────────────────────────────────────────────────────────────────
  function canAccessGroup(user, groupKey) {
    if (!user) return false;
    if (user.scope === 'ALL') return true;
    if (user.scope === 'GROUP_ALL_DEPARTMENTS') {
      return user.group === groupKey;
    }
    if (user.scope === 'DEPARTMENT_ONLY') {
      return user.group === groupKey;
    }
    return false;
  }

  function canAccessDepartment(user, groupKey, departmentName) {
    if (!user) return false;
    if (user.scope === 'ALL') return true;
    if (user.scope === 'GROUP_ALL_DEPARTMENTS') {
      return user.group === groupKey;
    }
    if (user.scope === 'DEPARTMENT_ONLY') {
      return (user.group === groupKey || !groupKey) && user.department === departmentName;
    }
    return false;
  }

  function getScopeDescription(user) {
    if (!user) return 'Not Authenticated';
    switch (user.role) {
      case 'chairman':
        return 'Full Institutional Access (All Campuses & Colleges)';
      case 'dean':
        return 'Dean Scope: ' + (user.group || '') + ' — All Departments';
      case 'rd_coordinator':
        return 'R&D Scope: ' + (user.group || '') + ' — All Departments';
      case 'hod':
        return 'HOD Scope: ' + (user.department || '') + ' (' + (user.group || '') + ')';
      default:
        return 'Standard User';
    }
  }

  // ─── PUBLIC API ────────────────────────────────────────────────────────────
  global.SRM_AUTH = {
    DEMO_USERS:            DEMO_USERS,
    REAL_HOD_USERS:        FLABS_HOD_USERS,
    FLABS_HOD_USERS:       FLABS_HOD_USERS,
    ENT_HOD_USERS:         ENT_HOD_USERS,
    MOCK_MANAGEMENT_USERS: MOCK_MANAGEMENT_USERS,
    getCurrentUser:        getCurrentUser,
    setCurrentUser:        setCurrentUser,
    isAuthenticated:       isAuthenticated,
    logout:                logout,
    authenticate:          authenticate,
    getUsersByRole:        getUsersByRole,
    canAccessGroup:        canAccessGroup,
    canAccessDepartment:   canAccessDepartment,
    getScopeDescription:   getScopeDescription
  };

}(window));
