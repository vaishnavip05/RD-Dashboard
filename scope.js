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
      id: 'mca_mca_genai',
      label: 'MCA & MCA Gen AI',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      publicationAliases: ['mca', 'mca & mca gen ai', 'computer science and applications'],
      patentAliases: ['mca', 'mca & mca gen ai'],
      scholarAliases: ['mca', 'mca & mca gen ai']
    },
    {
      id: 'bca_bca_genai',
      label: 'BCA & BCA Gen AI',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      publicationAliases: ['bca', 'bca & bca gen ai'],
      patentAliases: ['bca', 'bca data science', 'bca & bca gen ai'],
      scholarAliases: ['bca', 'bca & bca gen ai']
    },
    {
      id: 'data_science',
      label: 'Data Science',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      publicationAliases: ['data sciences', 'data science'],
      patentAliases: ['data science'],
      scholarAliases: ['data science']
    },
    {
      id: 'computer_science',
      label: 'Computer Science',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      publicationAliases: ['computer science', 'b.sc computer science'],
      patentAliases: ['computer science'],
      scholarAliases: ['computer science', 'b.sc computer science']
    },
    {
      id: 'computer_science_batch_ii',
      label: 'Computer Science (Batch II)',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      publicationAliases: ['computer science (batch ii)'],
      patentAliases: ['computer science (batch ii)'],
      scholarAliases: ['computer science (batch ii)']
    },
    {
      id: 'cyber_security',
      label: 'Cyber Security',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      publicationAliases: ['cyber security', 'b.sc cyber security'],
      patentAliases: ['cyber security'],
      scholarAliases: ['cyber security']
    },
    {
      id: 'ai_ml',
      label: 'AI & ML',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      publicationAliases: ['ai & ml', 'ai&ml', 'b.sc. (ai & ml)'],
      patentAliases: ['ai & ml', 'b.sc ai & ml'],
      scholarAliases: ['ai & ml', 'dept of ai ml']
    },
    {
      id: 'mathematics',
      label: 'Mathematics',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      publicationAliases: ['mathematics'],
      patentAliases: ['mathematics'],
      scholarAliases: ['mathematics']
    },
    {
      id: 'biotech_psychology',
      label: 'Biotechnology & Psychology',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      publicationAliases: ['biotechnology', 'psychology', 'biotechnology & psychology'],
      patentAliases: ['biotechnology', 'psychology', 'biotechnology & psychology'],
      scholarAliases: ['biotechnology', 'psychology', 'biotechnology & psychology']
    },
    {
      id: 'commerce_general_batch_i',
      label: 'Commerce General (Batch I)',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      publicationAliases: ['commerce', 'commerce general (batch i)'],
      patentAliases: ['commerce', 'commerce- shift 1', 'commerce shift 1 gen', 'commerce shift i'],
      scholarAliases: ['commerce shift1', 'department of commerce']
    },
    {
      id: 'commerce_general_cs_batch_ii',
      label: 'Commerce General & CS (Batch II)',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      publicationAliases: ['commerce (shift 2 cs)', 'commerce general & cs (batch ii)'],
      patentAliases: ['commerce (shift 2 gen)', 'commerce -shift ii', 'commerce shift ii gen', 'commerce shift ii', 'commerce (shift 2 cs)'],
      scholarAliases: ['commerce shift2']
    },
    {
      id: 'commerce_af',
      label: 'Commerce A & F',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      publicationAliases: ['a&f', 'commerce (a&f)', 'commerce - af', 'commerce a & f'],
      patentAliases: ['commerce(a&f)', 'commerce - af', 'commerce a & f'],
      scholarAliases: ['commerce (a&f)', 'commerce (accounting &finance)']
    },
    {
      id: 'commerce_pa_ism',
      label: 'Commerce PA & ISM',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      publicationAliases: ['ism', 'pa, ism, iaf & sf', 'commerce pa & ism'],
      patentAliases: ['commerce - ism,pa & iaf', 'commerce - pa,ism,iaf', 'commerce ism, pa & iaf'],
      scholarAliases: ['commerce (pa & ism)']
    },
    {
      id: 'fashion',
      label: 'Fashion Designing',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      publicationAliases: ['fashion designing'],
      patentAliases: ['fashion designing'],
      scholarAliases: ['fashion designing']
    },
    {
      id: 'viscom',
      label: 'Visual Communication',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      publicationAliases: ['visual communication', 'viscom', 'visual communicatino'],
      patentAliases: ['visual communication', 'viscom'],
      scholarAliases: ['department of viscom', 'visual communication']
    },
    {
      id: 'lcs',
      label: 'LCS',
      type: 'dept',
      groupKey: 'FLABS',
      hasData: true,
      publicationAliases: ['lcs', 'lcs (english)', 'lcs (tamil)'],
      patentAliases: ['lcs', 'lcs - english'],
      scholarAliases: ['lcs', 'tamil', 'department of tamil']
    }
  ];

  var ENT_DEPARTMENTS = [
    { id: 'dept_ent_cse', label: 'CSE', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['cse', 'cse core', 'cs'], scholarAliases: ['cse', 'cs'] },
    { id: 'dept_ent_aiml', label: 'AIML & AI', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['aiml', 'aiml & ai', 'aiml,ai', 'ai & ml'], scholarAliases: ['aiml', 'aiml & ai'] },
    { id: 'dept_ent_bda_cc', label: 'BDA&CC', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['bda&cc', 'bda', 'scse(bda&cc)', 'cse - bda', 'cse with big data analytics'], scholarAliases: ['bda&cc'] },
    { id: 'dept_ent_iot_csbs', label: 'IOT&CSBS', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['iot & csbs', 'iot&csbs', 'iot', 'cs & gt', 'cs&gt', 'cse -cs& gt', 'cse-iot, csbs'], scholarAliases: ['iot & csbs', 'iot&csbs'] },
    { id: 'dept_ent_cse_cs', label: 'CSE-CS', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['cse-cs', 'cse cs'], scholarAliases: ['cse-cs', 'cse cs'] },
    { id: 'dept_ent_cse_gt', label: 'CSE-GT', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['cse-gt', 'cse gt'], scholarAliases: ['cse-gt', 'cse gt'] },
    { id: 'dept_ent_mech', label: 'MECH', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['mechanical', 'mech'], scholarAliases: ['mechanical', 'mech'] },
    { id: 'dept_ent_it', label: 'IT', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['it'], scholarAliases: ['it'] },
    { id: 'dept_ent_ece', label: 'ECE', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['ece'], scholarAliases: ['ece'] },
    { id: 'dept_ent_eee', label: 'EEE', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['eee'], scholarAliases: ['eee'] },
    { id: 'dept_ent_phy', label: 'PHY', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['physics', 'phy'], scholarAliases: ['physics', 'phy'] },
    { id: 'dept_ent_civil', label: 'CIVIL', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['civil'], scholarAliases: ['civil'] },
    { id: 'dept_ent_bme', label: 'BME', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['bme', 'biomedical'], scholarAliases: ['bme', 'biomedical'] },
    { id: 'dept_ent_chem', label: 'CHEM', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['chemistry', 'chem'], scholarAliases: ['chemistry', 'chem'] },
    { id: 'dept_ent_efl', label: 'EFL', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['efl', 'english'], scholarAliases: ['efl', 'english'] },
    { id: 'dept_ent_maths', label: 'MATHS', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['mathematics', 'maths'], scholarAliases: ['mathematics', 'maths'] },
    { id: 'dept_ent_biotech', label: 'BIOTECH', type: 'dept', groupKey: 'E&T', hasData: true, patentAliases: ['biotechnology', 'biotech'], scholarAliases: ['biotechnology', 'biotech'] }
  ];

  // ─── COMPLETE INSTITUTIONAL HIERARCHY TREE ──────────────────────────────────
  var TREE = {
    id: 'root_all_colleges',
    label: 'ALL CAMPUSES',
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
          // 1.1 SRM Institute of Science and Technology
          {
            id: 'college_srmist',
            label: 'SRM Institute of Science and Technology',
            type: 'college',
            hasData: false,
            children: [
              // 1.1.2 E&T Group (Implemented)
              {
                id: 'group_ent',
                key: 'E&T',
                label: 'E&T',
                type: 'group',
                hasData: true,
                children: ENT_DEPARTMENTS
              },
              // 1.1.1 FLABS Group (Implemented)
              {
                id: 'group_flabs',
                key: 'FLABS',
                label: 'FLABS',
                type: 'group',
                hasData: true,
                children: FLABS_DEPARTMENTS
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
              },
              // 1.1.3 B.Arch Group (Placeholder)
              {
                id: 'group_barch',
                key: 'B.Arch',
                label: 'B.Arch',
                type: 'group',
                hasData: false,
                children: []
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
          // 1.3 Easwari Engineering College (Placeholder)
          {
            id: 'college_easwari',
            label: 'Easwari Engineering College',
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
        children: []
      }
    ]
  };

  // ─── SCOPE & EXPAND STATE ──────────────────────────────────────────────────
  var _selectedNode = null; // active node object
  var _expandedIds = new Set(['root_all_colleges', 'campus_ramapuram', 'college_srmist', 'group_flabs', 'group_ent', 'group_management']);
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
        if (user.group && node.groupKey !== user.group) return false;
        var ud = (user.department || '').toLowerCase().trim();
        var nl = node.label.toLowerCase().trim();
        if (nl === ud) return true;
        
        var pAliases = (node.patentAliases || []).map(function(a) { return a.toLowerCase().trim(); });
        var sAliases = (node.scholarAliases || []).map(function(a) { return a.toLowerCase().trim(); });
        var pubAliases = (node.publicationAliases || []).map(function(a) { return a.toLowerCase().trim(); });
        
        if (pAliases.includes(ud) || sAliases.includes(ud) || pubAliases.includes(ud)) {
          return true;
        }
        return false;
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
    try {
      if (node && node.id) {
        sessionStorage.setItem('srm_rd_selected_node_id', node.id);
      }
    } catch (e) {}
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
    var searchLabel = String(label).toLowerCase().trim();
    var nodeLabel = node.label.toLowerCase().trim();
    
    var match = false;
    if (nodeLabel === searchLabel) {
      match = true;
    } else if (node.type === 'dept') {
      var pAliases = (node.patentAliases || []).map(function(a) { return a.toLowerCase().trim(); });
      var sAliases = (node.scholarAliases || []).map(function(a) { return a.toLowerCase().trim(); });
      var pubAliases = (node.publicationAliases || []).map(function(a) { return a.toLowerCase().trim(); });
      
      if (pAliases.includes(searchLabel) || sAliases.includes(searchLabel) || pubAliases.includes(searchLabel)) {
        match = true;
      }
    }
    
    if (match) {
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
   * Filter FLABS publications by department using publicationAliases.
   * Records with null/missing department are shown institution-wide only
   * (they do NOT appear when a specific dept is selected).
   * @param {Array} records - Publication records
   * @param {Object|null} deptNode - Selected department node (or null for all)
   * @param {number|null} year - Filter year
   * @returns {Array}
   */
  function filterPublicationsByDepartment(records, deptNode, year) {
    if (!records) return [];
    var base = year ? records.filter(function (r) { return r.year === year; }) : records;
    if (!deptNode || deptNode.type !== 'dept') return base;
    var label = deptNode.label.toLowerCase().trim();
    var aliases = (deptNode.publicationAliases || []).map(function (a) { return a.toLowerCase().trim(); });
    return base.filter(function (r) {
      var raw = (r.department || '').toLowerCase().trim();
      return raw === label || aliases.includes(raw);
    });
  }

  /**
   * Filter patents by department using patentAliases.
   * @param {Array} records - Patent records
   * @param {Object|null} deptNode - Selected department node (or null for all)
   * @param {number|null} year - Filter year
   * @returns {Array}
   */
  
  function filterFundedProjectsByDepartment(records, deptNode, year) {
    if (!records) return [];
    var base = year ? records.filter(function (r) { return r.year === year; }) : records;
    if (!deptNode || deptNode.type !== 'dept') return base;
    var label = deptNode.label.toLowerCase().trim();
    return base.filter(function (r) {
      var raw = (r.departmentGroup || r.department || '').toLowerCase().trim();
      return raw === label || (deptNode.publicationAliases && deptNode.publicationAliases.some(function(a) { return a.toLowerCase().trim() === raw; }));
    });
  }

  function filterPatentsByDepartment(records, deptNode, year) {
    if (!records) return [];
    var base = year ? records.filter(function (r) { return r.year === year; }) : records;
    if (!deptNode || deptNode.type !== 'dept') return base;
    var label = deptNode.label.toLowerCase().trim();
    var aliases = (deptNode.patentAliases || []).map(function (a) { return a.toLowerCase().trim(); });
    return base.filter(function (r) {
      var raw = (r.departmentGroup || r.department || '').toLowerCase().trim();
      return raw === label || aliases.includes(raw);
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
    var label = deptNode.label.toLowerCase().trim();
    var aliases = (deptNode.scholarAliases || []).map(function (a) { return a.toLowerCase().trim(); });
    return base.filter(function (r) {
      var raw = (r.departmentGroup || r.department || '').toLowerCase().trim();
      return raw === label || aliases.includes(raw);
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
    filterPublicationsByDepartment:      filterPublicationsByDepartment,
    filterPatentsByDepartment:           filterPatentsByDepartment,
    filterFundedProjectsByDepartment:    filterFundedProjectsByDepartment,
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
