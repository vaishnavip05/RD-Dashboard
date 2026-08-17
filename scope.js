/**
 * SRM R&D Portal — Institutional Scope & Hierarchy Data (Module 3)
 *
 * Single Source of Truth for:
 *   - The full institutional hierarchy tree (ALL COLLEGES -> Campuses -> Colleges -> Groups -> Departments)
 *   - Dataset-specific alias mappings (separate patentAliases vs scholarAliases)
 *   - Scope state and expand/collapse management
 *   - Centralized filtering functions for Patents and Research Community
 */

(function (global) {
  'use strict';

  // ─── 22 CANONICAL FLABS DEPARTMENTS WITH DATASET-SPECIFIC ALIASES ──────────
  // Note:
  // - "Computer Science & Applications" is strictly excluded from the canonical list.
  // - "MCA / BCA" is kept unmapped as a shared patent.
  // - "Computer Applications" and "Efl" are kept unmapped in Research Community.
  var FLABS_DEPARTMENTS = [
    {
      id: 'commerce',
      label: 'Commerce',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [
        'commerce- shift 1',
        'commerce (shift 2 gen)',
        'commerce shift 1 gen',
        'commerce -shift ii',
        'commerce shift ii gen',
        'commerce shift i',
        'commerce shift ii',
        'commerce (shift 2 cs)'
      ],
      scholarAliases: [
        'commerce shift1',
        'department of commerce',
        'commerce shift2'
      ]
    },
    {
      id: 'commerce_pa',
      label: 'Commerce - PA, ISM, IAF & SF',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [
        'commerce - ism,pa & iaf',
        'commerce - pa,ism,iaf',
        'commerce ism, pa & iaf'
      ],
      scholarAliases: [
        'commerce (pa & ism)'
      ]
    },
    {
      id: 'bca',
      label: 'BCA',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [
        'bca',
        'bca data science'
      ],
      scholarAliases: []
    },
    {
      id: 'commerce_af',
      label: 'Commerce (A&F)',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [
        'commerce(a&f)',
        'commerce - af'
      ],
      scholarAliases: [
        'commerce (a&f)',
        'commerce (accounting &finance)'
      ]
    },
    {
      id: 'data_science',
      label: 'Data Science',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [
        'data science'
      ],
      scholarAliases: [
        'data science'
      ]
    },
    {
      id: 'cyber_security',
      label: 'B.Sc Cyber Security',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [
        'cyber security'
      ],
      scholarAliases: [
        'cyber security'
      ]
    },
    {
      id: 'computer_science',
      label: 'B.Sc Computer Science',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [
        'computer science'
      ],
      scholarAliases: [
        'computer science',
        'b.sc computer science'
      ]
    },
    {
      id: 'ai_ml',
      label: 'B.Sc. (AI & ML)',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [
        'ai & ml',
        'b.sc ai & ml'
      ],
      scholarAliases: [
        'ai & ml',
        'dept of ai ml'
      ]
    },
    {
      id: 'mca',
      label: 'MCA',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [
        'mca'
      ],
      scholarAliases: [
        'mca'
      ]
    },
    {
      id: 'viscom',
      label: 'Viscom',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [
        'visual communication'
      ],
      scholarAliases: [
        'department of viscom',
        'visual communication'
      ]
    },
    {
      id: 'film_tech',
      label: 'Film Tech',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [],
      scholarAliases: []
    },
    {
      id: 'fashion',
      label: 'Fashion Designing',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [
        'fashion designing'
      ],
      scholarAliases: []
    },
    {
      id: 'jmc',
      label: 'JMC',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [],
      scholarAliases: []
    },
    {
      id: 'lcs_english',
      label: 'LCS (English)',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [
        'lcs - english'
      ],
      scholarAliases: []
    },
    {
      id: 'lcs_tamil',
      label: 'LCS (Tamil)',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [],
      scholarAliases: [
        'tamil',
        'department of tamil'
      ]
    },
    {
      id: 'biotechnology',
      label: 'Biotechnology',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [
        'biotechnology'
      ],
      scholarAliases: [
        'biotechnology'
      ]
    },
    {
      id: 'psychology',
      label: 'Psychology',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [],
      scholarAliases: []
    },
    {
      id: 'mathematics',
      label: 'Mathematics',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [
        'mathematics'
      ],
      scholarAliases: [
        'mathematics'
      ]
    },
    {
      id: 'physics',
      label: 'Physics',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [],
      scholarAliases: []
    },
    {
      id: 'chemistry',
      label: 'Chemistry',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [],
      scholarAliases: []
    },
    {
      id: 'economics',
      label: 'Economics',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [],
      scholarAliases: []
    },
    {
      id: 'english',
      label: 'English',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      patentAliases: [],
      scholarAliases: []
    }
  ];

  var ENT_DEPARTMENTS = [
    { id: 'dept_ent_cse', label: 'CSE', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['cse', 'cse core', 'cs'], scholarAliases: ['cse', 'cs'] },
    { id: 'dept_ent_aiml', label: 'AIML', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['aiml', 'aiml,ai', 'ai & ml'], scholarAliases: ['aiml'] },
    { id: 'dept_ent_bda_cc', label: 'BDA&CC', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['bda&cc', 'bda', 'scse(bda&cc)', 'cse - bda', 'cse with big data analytics'], scholarAliases: ['bda&cc'] },
    { id: 'dept_ent_iot_csbs', label: 'IoT & CSBS', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['iot & csbs', 'iot&csbs', 'iot', 'cs & gt', 'cs&gt', 'cse -cs& gt', 'cse-iot, csbs'], scholarAliases: ['iot & csbs'] },
    { id: 'dept_ent_it', label: 'IT', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['it'], scholarAliases: ['it'] },
    { id: 'dept_ent_ece', label: 'ECE', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['ece'], scholarAliases: ['ece'] },
    { id: 'dept_ent_eee', label: 'EEE', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['eee'], scholarAliases: ['eee'] },
    { id: 'dept_ent_mech', label: 'Mechanical', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['mechanical', 'mech'], scholarAliases: ['mechanical', 'mech'] },
    { id: 'dept_ent_civil', label: 'Civil', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['civil'], scholarAliases: ['civil'] },
    { id: 'dept_ent_biotech', label: 'Biotechnology', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['biotechnology', 'biotech'], scholarAliases: ['biotechnology', 'biotech'] },
    { id: 'dept_ent_bme', label: 'BME', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['bme', 'biomedical'], scholarAliases: ['bme', 'biomedical'] },
    { id: 'dept_ent_maths', label: 'Mathematics', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['mathematics', 'maths'], scholarAliases: ['mathematics', 'maths'] },
    { id: 'dept_ent_physics', label: 'Physics', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['physics'], scholarAliases: ['physics'] },
    { id: 'dept_ent_chem', label: 'Chemistry', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['chemistry'], scholarAliases: ['chemistry'] },
    { id: 'dept_ent_efl', label: 'EFL', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['efl'], scholarAliases: ['efl'] }
  ];

  // ─── COMPLETE INSTITUTIONAL HIERARCHY TREE ──────────────────────────────────
  var TREE = {
    id: 'root_all_colleges',
    label: 'ALL COLLEGES',
    type: 'root',
    hasData: false,
    children: [
      // 1. SRM Ramapuram Campus
      {
        id: 'campus_ramapuram',
        label: 'SRM Ramapuram',
        type: 'campus',
        hasData: false,
        children: [
          // 1.1 SRM Institute of Science & Technology
          {
            id: 'college_srmist',
            label: 'SRM Institute of Science & Technology',
            type: 'college',
            hasData: false,
            children: [
              // 1.1.1 FLABS Group (Implemented)
              {
                id: 'group_flabs',
                key: 'FLABS',
                label: 'FLABS',
                type: 'group',
                hasData: true,
                children: FLABS_DEPARTMENTS
              },
              // 1.1.2 E&T Group (Implemented)
              {
                id: 'group_ent',
                key: 'E&T',
                label: 'E&T',
                type: 'group',
                hasData: true,
                children: ENT_DEPARTMENTS
              },
              // 1.1.3 B.Arch Group (Placeholder)
              {
                id: 'group_barch',
                key: 'B.Arch',
                label: 'B.Arch',
                type: 'group',
                hasData: false,
                children: []
              },
              // 1.1.4 Management Group (Implemented: BBA & MBA)
              {
                id: 'group_management',
                key: 'Management',
                label: 'Management',
                type: 'group',
                hasData: true,
                children: [
                  {
                    id: 'dept_bba',
                    label: 'BBA',
                    type: 'dept',
                    groupKey: 'Management',
                    hasData: true,
                    patentAliases: ['bba'],
                    scholarAliases: []
                  },
                  {
                    id: 'dept_mba',
                    label: 'MBA',
                    type: 'dept',
                    groupKey: 'Management',
                    hasData: true,
                    patentAliases: ['mba'],
                    scholarAliases: []
                  }
                ]
              }
            ]
          },
          // 1.2 SRM Dental College (Placeholder)
          {
            id: 'college_dental',
            label: 'SRM Dental College',
            type: 'college',
            hasData: false,
            children: []
          },
          // 1.3 SRM Paramedical College (Placeholder)
          {
            id: 'college_paramedical',
            label: 'SRM Paramedical College',
            type: 'college',
            hasData: false,
            children: []
          }
        ]
      },
      // 2. SRM Trichy Campus
      {
        id: 'campus_trichy',
        label: 'SRM Trichy',
        type: 'campus',
        hasData: false,
        children: [
          // 2.1 SRM Trichy Engineering College (Placeholder)
          {
            id: 'college_trichy_eng',
            label: 'SRM Trichy Engineering College',
            type: 'college',
            hasData: false,
            children: []
          },
          // 2.2 SRM Trichy Medical College (Placeholder)
          {
            id: 'college_trichy_med',
            label: 'SRM Trichy Medical College',
            type: 'college',
            hasData: false,
            children: []
          }
        ]
      }
    ]
  };

  // ─── SCOPE & EXPAND STATE ──────────────────────────────────────────────────
  var _selectedNode = null; // active node object
  var _expandedIds = new Set(['root_all_colleges', 'campus_ramapuram', 'college_srmist', 'group_flabs']);
  var _listeners = [];

  function getTree() {
    return TREE;
  }

  function getSelectedNode() {
    return _selectedNode;
  }

  function isNodeAllowed(user, node) {
    if (!user || !node) return true;
    if (user.scope === 'ALL') return true;
    if (user.scope === 'GROUP_ALL_DEPARTMENTS') {
      if (node.type === 'root' || node.type === 'campus' || node.type === 'college') return true;
      if (node.type === 'group') return node.key === user.group;
      if (node.type === 'dept') return node.groupKey === user.group;
      return false;
    }
    if (user.scope === 'DEPARTMENT_ONLY') {
      if (node.type === 'dept') {
        return (node.groupKey === user.group || !user.group) && node.label.toLowerCase() === (user.department || '').toLowerCase();
      }
      return false;
    }
    return true;
  }

  function setSelectedNode(node) {
    var user = global.SRM_AUTH ? global.SRM_AUTH.getCurrentUser() : null;
    if (user && node && !isNodeAllowed(user, node)) {
      console.warn('Scope selection rejected by role security policy:', node.label);
      return;
    }
    _selectedNode = node;
    _notify();
  }

  function isExpanded(id) {
    return _expandedIds.has(id);
  }

  function toggleExpand(id) {
    if (_expandedIds.has(id)) {
      _expandedIds.delete(id);
    } else {
      _expandedIds.add(id);
    }
    _notify();
  }

  function setExpanded(id, expanded) {
    if (expanded) _expandedIds.add(id);
    else _expandedIds.delete(id);
    _notify();
  }

  function onChange(fn) {
    _listeners.push(fn);
  }

  function _notify() {
    _listeners.forEach(function (fn) {
      try { fn(_selectedNode); } catch (e) { console.error(e); }
    });
  }

  // ─── LOOKUP HELPERS ────────────────────────────────────────────────────────
  function findNodeById(node, id) {
    if (!node) return null;
    if (node.id === id) return node;
    if (node.children && node.children.length) {
      for (var i = 0; i < node.children.length; i++) {
        var res = findNodeById(node.children[i], id);
        if (res) return res;
      }
    }
    return null;
  }

  function findNodeByKey(node, key) {
    if (!node) return null;
    if (node.key === key) return node;
    if (node.children && node.children.length) {
      for (var i = 0; i < node.children.length; i++) {
        var res = findNodeByKey(node.children[i], key);
        if (res) return res;
      }
    }
    return null;
  }

  function findNodeByLabel(node, label, groupKey) {
    if (!node) return null;
    if (node.label.toLowerCase() === String(label).toLowerCase()) {
      if (!groupKey || node.groupKey === groupKey) return node;
    }
    if (node.children && node.children.length) {
      for (var i = 0; i < node.children.length; i++) {
        var res = findNodeByLabel(node.children[i], label, groupKey);
        if (res) return res;
      }
    }
    return null;
  }

  // ─── DATASET-SPECIFIC FILTERING FUNCTIONS ───────────────────────────────────

  /**
   * Filter patents by department using patentAliases.
   * @param {Array} records - Patent records
   * @param {Object|null} deptNode - Selected department node (or null for all)
   * @param {number|null} year - Filter year
   * @returns {Array}
   */
  function filterPatentsByDepartment(records, deptNode, year) {
    if (!records) return [];
    var base = year ? records.filter(function (r) { return r.year === year; }) : records;
    if (!deptNode || deptNode.type !== 'dept') return base;
    var aliases = (deptNode.patentAliases || []).map(function (a) { return a.toLowerCase().trim(); });
    if (!aliases.length) return []; // department has no patent aliases
    return base.filter(function (r) {
      var raw = (r.departmentGroup || r.department || '').toLowerCase().trim();
      return aliases.includes(raw);
    });
  }

  /**
   * Filter research community (scholars) by department using scholarAliases.
   * @param {Array} records - Scholar records
   * @param {Object|null} deptNode - Selected department node (or null for all)
   * @param {number|null} year - Filter year
   * @returns {Array}
   */
  function filterResearchCommunityByDepartment(records, deptNode, year) {
    if (!records) return [];
    var base = year ? records.filter(function (r) { return r.year === year; }) : records;
    if (!deptNode || deptNode.type !== 'dept') return base;
    var aliases = (deptNode.scholarAliases || []).map(function (a) { return a.toLowerCase().trim(); });
    if (!aliases.length) return []; // department has no scholar aliases
    return base.filter(function (r) {
      var raw = (r.departmentGroup || r.department || '').toLowerCase().trim();
      return aliases.includes(raw);
    });
  }

  function getSelectedDept() {
    if (_selectedNode && _selectedNode.type === 'dept') {
      return _selectedNode;
    }
    return null;
  }

  function getSelectedGroup() {
    if (_selectedNode && _selectedNode.type === 'group') {
      return _selectedNode.key;
    }
    if (_selectedNode && _selectedNode.type === 'dept') {
      return _selectedNode.groupKey;
    }
    return null;
  }

  function selectDept(dept, groupKey) {
    dept.groupKey = groupKey || dept.groupKey || 'FLABS';
    setSelectedNode(dept);
  }

  function selectGroup(groupKey) {
    var found = findNodeByKey(TREE, groupKey);
    if (found) {
      setSelectedNode(found);
    } else {
      setSelectedNode({ id: 'group_' + String(groupKey).toLowerCase(), key: groupKey, label: groupKey, type: 'group', hasData: groupKey === 'FLABS' });
    }
  }

  function clearSelection() {
    setSelectedNode(null);
  }

  function getDepartments(campus, college, groupKey) {
    if (groupKey === 'FLABS') return FLABS_DEPARTMENTS;
    var node = findNodeByKey(TREE, groupKey);
    return (node && node.children) ? node.children : [];
  }

  function getGroupLabel(campus, college, groupKey) {
    var node = findNodeByKey(TREE, groupKey);
    return node ? node.label : groupKey;
  }

  // ─── PUBLIC API ────────────────────────────────────────────────────────────
  global.SRM_SCOPE = {
    TREE: TREE,
    FLABS_DEPARTMENTS: FLABS_DEPARTMENTS,
    ENT_DEPARTMENTS: ENT_DEPARTMENTS,

    // Tree & State API
    getTree:          getTree,
    getSelectedNode:  getSelectedNode,
    setSelectedNode:  setSelectedNode,
    isNodeAllowed:    isNodeAllowed,
    isExpanded:       isExpanded,
    toggleExpand:     toggleExpand,
    setExpanded:      setExpanded,
    onChange:         onChange,

    // Node Lookup
    findNodeById:     findNodeById,
    findNodeByKey:    findNodeByKey,
    findNodeByLabel:  findNodeByLabel,

    // Reusable dataset-specific filter functions
    filterPatentsByDepartment:           filterPatentsByDepartment,
    filterResearchCommunityByDepartment: filterResearchCommunityByDepartment,

    // Scope helpers
    getSelectedDept:  getSelectedDept,
    getSelectedGroup: getSelectedGroup,
    selectDept:       selectDept,
    selectGroup:      selectGroup,
    clearSelection:   clearSelection,
    getDepartments:   getDepartments,
    getGroupLabel:    getGroupLabel
  };

}(window));
