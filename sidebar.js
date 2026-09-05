/**
 * SRM R&D Portal — Institutional Scope Sidebar (Module 2 Extended)
 *
 * Recursively renders the complete institutional tree.
 * Supports independent expand/collapse for every parent node.
 * Separates clicking arrow (expand/collapse) from clicking name (select scope).
 * Enforces role-based visibility:
 *   - Chairman: Full tree (ALL COLLEGES -> Campuses -> Colleges -> Groups -> Depts)
 *   - Dean / R&D Coordinator: Assigned group + departments
 *   - HOD: Assigned department only
 */

(function (global) {
  'use strict';

  var AUTH  = global.SRM_AUTH;
  var SCOPE = global.SRM_SCOPE;

  /**
   * Initialise and render the sidebar into #scope-sidebar.
   */
  function init() {
    var container = document.getElementById('scope-sidebar');
    if (!container) return;

    var user = AUTH.getCurrentUser();
    if (!user) return;

    render(container, user);

    // Re-render whenever scope selection or expand/collapse changes
    SCOPE.onChange(function () {
      render(container, user);
    });
  }

  /**
   * Build and inject the sidebar HTML.
   */
  function render(container, user) {
    var rootNodes = getVisibleRootNodes(user);
    var selectedNode = SCOPE.getSelectedNode();

    var html = [];

    // ── Header ──────────────────────────────────────────────────────────────
    html.push(
      '<div class="scope-header">' +
        '<div class="scope-header-left">' +
          '<svg class="scope-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
            '<rect x="3" y="3" width="7" height="7" rx="1.5"/>' +
            '<rect x="14" y="3" width="7" height="7" rx="1.5"/>' +
            '<rect x="3" y="14" width="7" height="7" rx="1.5"/>' +
            '<rect x="14" y="14" width="7" height="7" rx="1.5"/>' +
          '</svg>' +
          '<span class="scope-header-title">Institutional Scope</span>' +
        '</div>' +
        (user.scope !== 'DEPARTMENT_ONLY' && selectedNode
          ? '<button class="scope-reset-btn" id="scope-reset" title="Reset to default scope">↺ Reset</button>'
          : '') +
      '</div>'
    );

    // ── Active selection banner ──────────────────────────────────────────────
    var activeLabel = selectedNode ? selectedNode.label : (user.group ? user.group + ' — All' : 'ALL CAMPUSES');
    html.push(
      '<div class="scope-active-badge" title="' + escHtml(activeLabel) + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>' +
          '<polyline points="9 22 9 12 15 12 15 22"/>' +
        '</svg>' +
        '<span>' + escHtml(activeLabel) + '</span>' +
      '</div>'
    );

    // ── Recursive Tree ───────────────────────────────────────────────────────
    html.push('<div class="scope-tree" role="tree">');
    rootNodes.forEach(function (node) {
      html.push(renderNode(node, 0, user, selectedNode));
    });
    html.push('</div>');

    // ── Selection guide footer ───────────────────────────────────────────────
    html.push(
      '<div class="scope-guide">' +
        '<div class="scope-guide-row">' +
          '<span class="scope-guide-dot scope-guide-dot--blue"></span>' +
          '<span>Click name → Select scope</span>' +
        '</div>' +
        '<div class="scope-guide-row">' +
          '<span class="scope-guide-dot scope-guide-dot--arrow"></span>' +
          '<span>Click arrow ▶/▼ → Expand/collapse</span>' +
        '</div>' +
      '</div>'
    );

    container.innerHTML = html.join('');
    bindEvents(container, user);
  }

  /**
   * Determine visible root nodes based on user's role & group.
   */
  function getVisibleRootNodes(user) {
    var fullTree = SCOPE.getTree();

    // 1. Chairman sees full tree starting at ALL COLLEGES
    if (user.scope === 'ALL') {
      return [fullTree];
    }

    // 2. Dean / R&D Coordinator / Deputy Dean: sees only their assigned group and its departments
    if (user.role === 'dean' || user.role === 'rd_coordinator' || user.role === 'deputy_dean') {
      var grp = SCOPE.findNodeByKey(fullTree, user.group);
      if (grp) return [grp];
      return [fullTree]; // fallback
    }

    // 3. HOD / Supervisor / Scholar: sees only their assigned department
    if (user.role === 'hod' || user.role === 'supervisor' || user.role === 'scholar') {
      var hodDept = SCOPE.findNodeByLabel(fullTree, user.department || '', user.group);
      if (hodDept) return [hodDept];
      return [{ id: 'dept_hod', label: user.department || 'Department', type: 'dept', groupKey: user.group, hasData: true }];
    }

    return [fullTree];
  }

  /**
   * Recursive node renderer.
   */
  function renderNode(node, depth, user, selectedNode) {
    var hasChildren = node.children && node.children.length > 0;
    var expanded = SCOPE.isExpanded(node.id);
    var isSelected = selectedNode && selectedNode.id === node.id;
    var indentPx = depth * 14 + 6;

    var out = [];

    out.push(
      '<div class="scope-tree-item' +
           (isSelected ? ' scope-tree-item--selected' : '') +
           ' scope-tree-item--type-' + escHtml(node.type) + '" ' +
           'style="padding-left:' + indentPx + 'px;" ' +
           'data-node-id="' + escHtml(node.id) + '">'
    );

    // Arrow Toggle (only if has children)
    if (hasChildren) {
      out.push(
        '<button class="scope-arrow-btn' + (expanded ? ' scope-arrow-btn--expanded' : '') + '" ' +
                'data-toggle-id="' + escHtml(node.id) + '" ' +
                'aria-label="' + (expanded ? 'Collapse' : 'Expand') + ' ' + escHtml(node.label) + '" ' +
                'title="' + (expanded ? 'Collapse' : 'Expand') + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<polyline points="9 18 15 12 9 6"/>' +
          '</svg>' +
        '</button>'
      );
    } else {
      out.push('<span class="scope-arrow-spacer"></span>');
    }

    // Node Type Icon
    out.push(getNodeIcon(node.type));

    // Node Label (Clicking this selects the node)
    out.push(
      '<span class="scope-node-label" data-select-id="' + escHtml(node.id) + '" title="' + escHtml(node.label) + '">' +
        escHtml(node.label) +
      '</span>'
    );

    // Selected checkmark indicator
    if (isSelected) {
      out.push('<span class="scope-selected-check" title="Active selection">✓</span>');
    }

    out.push('</div>'); // /scope-tree-item

    // Children Sub-Tree (if expanded)
    if (hasChildren && expanded) {
      out.push('<div class="scope-children-wrap">');
      node.children.forEach(function (child) {
        out.push(renderNode(child, depth + 1, user, selectedNode));
      });
      out.push('</div>');
    }

    return out.join('');
  }

  /**
   * SVG Icon for each level of the hierarchy
   */
  function getNodeIcon(type) {
    switch (type) {
      case 'root':
        return '<svg class="scope-type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>';
      case 'campus':
        return '<svg class="scope-type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 00-8 8c0 5.25 8 13 8 13s8-7.75 8-13a8 8 0 00-8-8z"/></svg>';
      case 'college':
        return '<svg class="scope-type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9.5L12 4l9 5.5v9A1.5 1.5 0 0119.5 20h-15A1.5 1.5 0 013 18.5z"/><rect x="9" y="14" width="6" height="6"/></svg>';
      case 'group':
        return '<svg class="scope-type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l9 4-9 4-9-4 9-4z"/><path d="M3 12l9 4 9-4"/><path d="M3 17l9 4 9-4"/></svg>';
      case 'dept':
      default:
        return '<svg class="scope-type-icon scope-type-icon--dept" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>';
    }
  }

  /**
   * Bind event handlers for Arrow Click vs Name Click vs Reset Click
   */
  function bindEvents(container, user) {
    // 1. Reset button
    var resetBtn = container.querySelector('#scope-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (user.role === 'dean' || user.role === 'rd_coordinator') {
          SCOPE.selectGroup(user.group || 'FLABS');
        } else {
          var root = SCOPE.getTree();
          SCOPE.setSelectedNode(root);
        }
      });
    }

    // 2. Arrow Button Click -> Toggle Expand/Collapse ONLY
    var arrowBtns = container.querySelectorAll('.scope-arrow-btn[data-toggle-id]');
    arrowBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var nodeId = btn.dataset.toggleId;
        SCOPE.toggleExpand(nodeId);
      });
    });

    // 3. Node Name Click -> Select Scope ONLY
    var labelEls = container.querySelectorAll('.scope-node-label[data-select-id]');
    labelEls.forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        var nodeId = el.dataset.selectId;
        var node = SCOPE.findNodeById(SCOPE.getTree(), nodeId);
        if (node) {
          SCOPE.setSelectedNode(node);
        }
      });
    });
  }

  function escHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ─── PUBLIC API ────────────────────────────────────────────────────────────
  global.SRM_SIDEBAR = {
    init: init,
    render: render
  };

}(window));
