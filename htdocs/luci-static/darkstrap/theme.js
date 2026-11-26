(function () {
  'use strict';
  if (window.__darkstrapThemeJs) return;
  window.__darkstrapThemeJs = true;

  function qsa(sel, root) {
    root = root || document;
    var nodes = [];

    if (root.nodeType === 1 && root.matches && root.matches(sel))
      nodes.push(root);

    if (root.querySelectorAll)
      nodes = nodes.concat(Array.prototype.slice.call(root.querySelectorAll(sel)));

    return nodes;
  }

  function compactProgressTitle(title) {
    var value = String(title || '').split('/')[0].trim();
    if (!value) return '';
    value = value.replace(/\s+/g, ' ');
    return value;
  }

  function parseProgressPercent(bar, rawTitle) {
    var inner = bar.firstElementChild;
    if (inner && inner.style && inner.style.width) {
      var wm = String(inner.style.width).match(/(\d+(?:\.\d+)?)\s*%/);
      if (wm) return parseFloat(wm[1]);
    }
    var tm = String(rawTitle || '').match(/(\d+(?:\.\d+)?)\s*%/);
    return tm ? parseFloat(tm[1]) : NaN;
  }

  function addProgressNumbers(root) {
    qsa('.cbi-progressbar[title], .progress[title]', root).forEach(function (bar) {
      var rawTitle = bar.getAttribute('title') || '';
      var text = compactProgressTitle(rawTitle);
      if (!text) return;
      var pct = parseProgressPercent(bar, rawTitle);
      bar.classList.add('darkstrap-title-numbered');
      bar.classList.toggle('darkstrap-progress-used', rawTitle.indexOf('/') !== -1);
      bar.classList.toggle('darkstrap-progress-high', isFinite(pct) && pct >= 80);
      bar.classList.toggle('darkstrap-progress-warn', isFinite(pct) && pct >= 60 && pct < 80);
      var span = bar.querySelector('.darkstrap-progress-title');
      if (!span) {
        span = document.createElement('span');
        span.className = 'darkstrap-progress-title';
        bar.appendChild(span);
      }
      if (span.textContent !== text) span.textContent = text;
    });
  }

  function directChildMatch(parent, sel) {
    if (!parent || !parent.children) return null;
    for (var i = 0; i < parent.children.length; i++) {
      var child = parent.children[i];
      if (child.matches && child.matches(sel)) return child;
    }
    return null;
  }

  function descriptionContainer(desc) {
    if (desc.matches && desc.matches('.cbi-map-descr')) {
      return desc.closest('.cbi-map');
    }
    if (desc.matches && desc.matches('.cbi-section-descr, .cbi-section-table-descr, .cbi-tblsection-descr')) {
      return desc.closest('.cbi-section, .cbi-tblsection');
    }
    if (desc.matches && desc.matches('.cbi-tab-descr')) {
      return desc.closest('.cbi-tabcontainer, .tab-pane');
    }
    return desc.closest('.cbi-value') || desc.closest('.tr') || desc.closest('tr');
  }

  function findTitleElement(container, desc) {
    if (!container) return null;
    if (desc.matches && desc.matches('.cbi-map-descr')) {
      return directChildMatch(container, 'h2, h1, h3');
    }
    if (desc.matches && desc.matches('.cbi-section-descr, .cbi-section-table-descr, .cbi-tblsection-descr')) {
      return directChildMatch(container, 'legend, h3, h2, h1, .cbi-title');
    }
    if (desc.matches && desc.matches('.cbi-tab-descr')) {
      return directChildMatch(container, 'legend, h3, h2, h1');
    }
    if (container.matches && container.matches('.cbi-value')) {
      return container.querySelector('.cbi-value-title, label.cbi-value-title, label');
    }
    if (container.matches && container.matches('.tr, tr')) {
      var titleCell = container.querySelector('.cbi-value-title, label.cbi-value-title');
      if (titleCell) return titleCell;
      var firstTd = container.querySelector('.td:first-child, td:first-child');
      if (firstTd && !firstTd.textContent.includes('no values') && !firstTd.querySelector('.alert, .notice')) {
        return firstTd;
      }
    }
    return null;
  }

  function addHelpButtons(root) {
    var selector = [
      '.cbi-value-description:not(.darkstrap-help-managed)',
      '.cbi-section-descr:not(.darkstrap-help-managed)',
      '.cbi-section-table-descr:not(.darkstrap-help-managed)',
      '.cbi-tab-descr:not(.darkstrap-help-managed)',
      '.description:not(.darkstrap-help-managed)',
      '.help-block:not(.darkstrap-help-managed)',
      '.help-inline:not(.darkstrap-help-managed)',
      '.cbi-map-descr:not(.darkstrap-help-managed)'
    ].join(',');

    qsa(selector, root).forEach(function (desc) {
      var text = (desc.textContent || '').trim();
      if (!text) return;
      // Never fold alerts, notices, port boxes, logins, empty states, or active validation errors
      if (desc.closest('.alert-message, .alert, .notice, .zonebadge, .ifacebadge, .ifacebox, .modal.login, .cbi-value-error, .error')) return;
      if (desc.classList.contains('cbi-value-error') || desc.classList.contains('error') || desc.querySelector('.cbi-value-error, .error')) return;

      var container = descriptionContainer(desc);
      if (!container) return;

      var titleEl = findTitleElement(container, desc);
      if (!titleEl) return;

      if (!desc.id) desc.id = 'darkstrap-help-' + Math.random().toString(36).slice(2, 10);
      if (titleEl.querySelector('.darkstrap-help-btn[data-darkstrap-help-for="' + desc.id + '"]')) return;
      if (root.querySelector && root.querySelector('.darkstrap-help-btn[data-darkstrap-help-for="' + desc.id + '"]')) return;

      desc.classList.add('darkstrap-help-managed');

      var titleText = (titleEl.textContent || '').replace(/\?/g, '').replace(/\s+/g, ' ').trim();
      var showLabel = titleText ? ('Show help for ' + titleText) : 'Show help';
      var hideLabel = titleText ? ('Hide help for ' + titleText) : 'Hide help';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'darkstrap-help-btn';
      btn.setAttribute('aria-label', showLabel);
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', desc.id);
      btn.setAttribute('data-darkstrap-help-for', desc.id);
      btn.setAttribute('data-show-label', showLabel);
      btn.setAttribute('data-hide-label', hideLabel);
      btn.textContent = '?';

      btn.addEventListener('pointerdown', function (ev) {
        ev.stopPropagation();
      });

      btn.addEventListener('mousedown', function (ev) {
        ev.stopPropagation();
      });

      btn.addEventListener('touchstart', function (ev) {
        ev.stopPropagation();
      }, { passive: true });

      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var isOpen = desc.classList.toggle('darkstrap-help-open');
        btn.classList.toggle('darkstrap-help-active', isOpen);
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        btn.setAttribute('aria-label', isOpen ? hideLabel : showLabel);
      });

      titleEl.appendChild(btn);
    });
  }

  function isNetworkInterfacesPage() {
    var page = document.body ? document.body.getAttribute('data-page') : '';
    return /^admin-network-(network|interface)/.test(page || '');
  }

  function collapseEmptyNetworkBlocks(root) {
    if (!isNetworkInterfacesPage()) return;

    var selector = [
      '.cbi-map-descr',
      '.cbi-section-descr',
      '.cbi-section-table-descr',
      '.cbi-tab-descr',
      '.cbi-value-description',
      '.description',
      '.help-block',
      '.help-inline',
      '.cbi-value'
    ].join(',');

    qsa(selector, root).forEach(function (el) {
      if (el.closest('#modal_overlay, .modal, .alert-message, .cbi-page-actions, .actions')) return;
      if (el.classList.contains('darkstrap-help-managed')) return;

      var text = (el.textContent || '').replace(/\u00a0/g, ' ').trim();
      var useful = el.querySelector('input, select, textarea, button, a, img, svg, canvas, table, .table, .tr, .td, .th, .cbi-button, .ifacebox, .ifacebadge, .cbi-dropdown, [data-tab-active="true"]');
      el.classList.toggle('darkstrap-empty-structural', !text && !useful);
    });

    qsa('.cbi-section, .cbi-tblsection', root).forEach(function (section) {
      if (section.closest('#modal_overlay, .modal, .alert-message, .cbi-page-actions, .actions')) return;

      var text = (section.textContent || '').replace(/\u00a0/g, ' ').trim();
      var useful = section.querySelector('input, select, textarea, button, a, img, svg, canvas, table, .table, .tr, .td, .th, .cbi-button, .ifacebox, .ifacebadge, .cbi-dropdown, [data-tab-active="true"]');
      var hasVisibleBox = false;

      Array.prototype.slice.call(section.children || []).some(function (child) {
        if (child.classList && (child.classList.contains('darkstrap-empty-structural') || child.classList.contains('hidden'))) return false;
        if (child.style && (child.style.display === 'none' || child.style.visibility === 'hidden')) return false;
        hasVisibleBox = (child.children && child.children.length > 0) || (child.textContent || '').trim().length > 0;
        return hasVisibleBox;
      });

      section.classList.toggle('darkstrap-empty-structural', !text && !useful && !hasVisibleBox);
    });
  }

  var lockedScrollY = 0;
  var lastKnownScrollY = 0;

  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('scroll', function () {
      if (!modalIsOpen() && (!document.body || !document.body.classList.contains('darkstrap-modal-open'))) {
        lastKnownScrollY = window.scrollY || (document.documentElement && document.documentElement.scrollTop) || 0;
      }
    }, { passive: true });
  }

  function modalIsOpen() {
    return document.body ? document.body.classList.contains('modal-overlay-active') : false;
  }

  function setModalScrollLock(lock) {
    if (!document.body || !document.documentElement) return;
    if (lock && !document.body.classList.contains('darkstrap-modal-open')) {
      var curY = window.scrollY || document.documentElement.scrollTop || 0;
      lockedScrollY = curY > 0 ? curY : lastKnownScrollY;
      document.documentElement.classList.add('darkstrap-modal-open');
      document.body.classList.add('darkstrap-modal-open');
      document.body.style.top = '-' + lockedScrollY + 'px';
    }
    else if (!lock && document.body.classList.contains('darkstrap-modal-open')) {
      document.documentElement.classList.remove('darkstrap-modal-open');
      document.body.classList.remove('darkstrap-modal-open');
      document.body.style.top = '';
      window.scrollTo(0, lockedScrollY);
      lastKnownScrollY = lockedScrollY;
    }
  }

  function tagWirelessBadges(root) {
    if (!document.body || document.body.getAttribute('data-page') !== 'admin-network-wireless')
      return;

    qsa('[data-name="_badge"] .ifacebadge, #wifi_assoclist_table .ifacebadge', root).forEach(function (badge) {
      var text = (badge.textContent || '').trim().toLowerCase();
      var img = badge.querySelector('img');
      var src = img ? (img.getAttribute('src') || '').toLowerCase() : '';
      var isClient = !!badge.closest('#wifi_assoclist_table, .assoclist');
      var isRadio = /(^|\s)radio[0-9]+(\s|$)/.test(text) || /radio[0-9]+/.test(src);
      var isWireless = isClient || isRadio || /wifi|wireless|signal/.test(src + ' ' + text);

      badge.classList.toggle('darkstrap-radio-badge', isRadio && !isClient);
      badge.classList.toggle('darkstrap-wireless-client-badge', isClient);

      if (img && isWireless)
        img.removeAttribute('aria-hidden');
    });
  }

  function tagProcessRows(root) {
    if (!document.body || document.body.getAttribute('data-page') !== 'admin-status-processes')
      return;

    qsa('table.table tr.tr:not(.table-titles), .table .tr:not(.table-titles)', root).forEach(function (row) {
      var cells = Array.prototype.slice.call(row.children || []);
      if (cells.length < 6) return;

      var cpu = parseFloat((cells[3].textContent || '').replace('%', '').trim());
      var mem = parseFloat((cells[4].textContent || '').replace('%', '').trim());
      var cpuActive = isFinite(cpu) && cpu > 0;
      var memActive = isFinite(mem) && mem > 0;

      row.classList.toggle('darkstrap-cpu-active-row', cpuActive);
      row.classList.toggle('darkstrap-mem-active-row', memActive);
      row.setAttribute('data-darkstrap-cpu', isFinite(cpu) ? String(cpu) : '0');
      row.setAttribute('data-darkstrap-mem', isFinite(mem) ? String(mem) : '0');
      cells[3].classList.add('darkstrap-process-cpu-cell');
      cells[4].classList.add('darkstrap-process-mem-cell');
      cells[5].classList.add('darkstrap-process-actions-cell');

      var actions = cells[5].querySelector('div');
      if (actions)
        actions.classList.add('darkstrap-process-actions');
    });
  }

  function normalizeActionDropdowns(root) {
    qsa('.cbi-page-actions .cbi-dropdown.cbi-button, .actions .cbi-dropdown.cbi-button', root).forEach(function (drop) {
      var preview = Array.prototype.slice.call(drop.children || []).filter(function (child) {
        return child.tagName === 'UL' && !child.classList.contains('dropdown') && !child.classList.contains('preview');
      })[0];
      if (!preview) return;

      var previewText = (preview.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      var isSaveApply = drop.classList.contains('darkstrap-save-apply-combo') ||
        drop.classList.contains('cbi-button-apply') ||
        (previewText.indexOf('save') !== -1 && previewText.indexOf('apply') !== -1);

      if (!isSaveApply) return;

      var items = Array.prototype.slice.call(preview.children || []).filter(function (child) {
        return child.tagName === 'LI';
      });
      if (!items.length) return;

      var main = items.filter(function (item) {
        return item.hasAttribute('selected');
      })[0] || items.filter(function (item) {
        return item.hasAttribute('display');
      })[0] || null;

      if (!main) {
        main = items.filter(function (item) {
          var text = (item.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
          return text.indexOf('unchecked') === -1 && item.getAttribute('aria-hidden') !== 'true';
        })[0] || items[0];
      }

      items.forEach(function (item) {
        item.classList.remove('darkstrap-action-preview-main');
        item.classList.remove('darkstrap-action-preview-extra');

        if (item === main) {
          item.classList.add('darkstrap-action-preview-main');
        } else {
          item.classList.add('darkstrap-action-preview-extra');
        }
      });

      drop.classList.add('darkstrap-save-apply-combo');
      preview.classList.add('darkstrap-save-apply-preview');
    });
  }

  function normalizeComboButtons(root) {
    qsa('.cbi-dropdown.cbi-button, .cbi-dropdown.btn', root).forEach(function (btn) {
      if (btn.classList.contains('darkstrap-save-apply-combo')) return;
      var ul = btn.querySelector('ul:not(.dropdown)');
      if (!ul) return;
      var items = ul.querySelectorAll('li');
      var sel = ul.querySelector('li[selected], li[display]');
      if (!sel && items.length > 0) {
        items[0].setAttribute('display', '0');
        items[0].setAttribute('selected', '');
      }
    });
  }

  var graphObserver = null;

  function parseSvgPoints(ptStr) {
    var matches = String(ptStr || '').match(/-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?/g);
    if (!matches) return [];
    return matches.map(function (pair) {
      var parts = pair.split(',');
      return { x: parseFloat(parts[0]), y: parseFloat(parts[1]) };
    }).filter(function (p) {
      return isFinite(p.x) && isFinite(p.y);
    });
  }

  function resolveGraphHeight(poly, pts) {
    var svg = poly.ownerSVGElement;
    if (svg) {
      if (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.height > 0) {
        return svg.viewBox.baseVal.height;
      }
      var hAttr = svg.getAttribute('height');
      if (hAttr && String(hAttr).indexOf('%') === -1) {
        var hNum = parseFloat(hAttr);
        if (isFinite(hNum) && hNum > 0) return hNum;
      }
      if (svg.clientHeight > 0) return svg.clientHeight;
    }
    if (pts.length > 0 && pts[0].y > 0) return pts[0].y;
    return 300;
  }

  function getOrCreateSiblingPath(poly, className) {
    var path = poly.__darkstrapPath;
    if (!path || path.parentNode !== poly.parentNode) {
      path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', className);
      poly.__darkstrapPath = path;
      // Insert right after polyline so later SVG grid lines & axis <text> stay above curves
      poly.parentNode.insertBefore(path, poly.nextSibling);
    }
    return path;
  }

  function processGraphElements() {
    var polys = document.querySelectorAll('svg polyline');
    var arcs = document.querySelectorAll('#channel_graph svg polyline');
    if (!polys.length && !arcs.length) return;

    polys.forEach(function (poly) {
      if ((poly.closest && poly.closest('#channel_graph')) || !poly.parentNode) return;
      var id = poly.getAttribute('id');
      if (!id) return;

      var path = getOrCreateSiblingPath(poly, 'darkstrap-premium-line ' + id);
      var ptStr = poly.getAttribute('points') || '';
      if (path.getAttribute('data-last-points') === ptStr) return;
      path.setAttribute('data-last-points', ptStr);

      try {
        var pts = parseSvgPoints(ptStr);
        if (pts.length < 2) return;
        var graphHeight = resolveGraphHeight(poly, pts);
        // Strip LuCI baseline fill anchors (0,H ... W,H) when present
        var dataPts = (pts.length > 3 && pts[0].y >= graphHeight - 2 && pts[pts.length - 1].y >= graphHeight - 2)
          ? pts.slice(1, pts.length - 1)
          : pts;
        if (dataPts.length < 2) return;

        var clamped = dataPts.map(function (p) {
          return {
            x: p.x,
            y: Math.min(graphHeight - 2, Math.max(2, p.y))
          };
        });

        var d = 'M ' + clamped[0].x + ' ' + clamped[0].y + ' ';
        for (var i = 0; i < clamped.length - 1; i++) {
          var p1 = clamped[i];
          var p2 = clamped[i + 1];
          var midX = (p1.x + p2.x) / 2;
          d += 'C ' + midX + ' ' + p1.y + ', ' + midX + ' ' + p2.y + ', ' + p2.x + ' ' + p2.y + ' ';
        }
        path.setAttribute('d', d);
        poly.style.opacity = '0';
        poly.style.stroke = 'none';
        poly.style.fill = 'none';
      } catch (e) {}
    });

    arcs.forEach(function (arc) {
      if (!arc.parentNode) return;
      var inlineFill = arc.style ? (arc.style.fill || '') : '';
      if (inlineFill.indexOf('url(') !== -1) return; // Keep GradientVerticalCenteredBlack inner mask untouched

      var pts = parseSvgPoints(arc.getAttribute('points'));
      if (pts.length !== 4) return;

      var path = getOrCreateSiblingPath(arc, 'darkstrap-channel-arc-premium');
      var ptStr = arc.getAttribute('points') || '';
      if (path.getAttribute('data-last-points') !== ptStr) {
        path.setAttribute('data-last-points', ptStr);
        var p0 = pts[0], p1 = pts[1], p2 = pts[2], p3 = pts[3];
        var midX = (p1.x + p2.x) / 2;
        var d = 'M ' + p0.x + ' ' + p0.y +
          ' C ' + p1.x + ' ' + p0.y + ', ' + p1.x + ' ' + p1.y + ', ' + midX + ' ' + p1.y +
          ' C ' + p2.x + ' ' + p1.y + ', ' + p2.x + ' ' + p3.y + ', ' + p3.x + ' ' + p3.y;
        path.setAttribute('d', d);
      }

      var apStroke = (arc.style && arc.style.stroke) || arc.getAttribute('stroke') || '#38bdf8';
      var apFill = (arc.style && arc.style.fill) || arc.getAttribute('fill') || 'none';
      arc.style.opacity = '0';
      arc.style.stroke = 'none';
      arc.style.fill = 'none';
      path.style.stroke = apStroke;
      path.style.fill = apFill;
      path.style.fillOpacity = apFill && apFill !== 'none' ? '0.24' : '0';
      path.style.strokeWidth = '2.5px';
      path.style.strokeLinecap = 'round';
      path.style.strokeLinejoin = 'round';
    });
  }

  var graphRafPending = false;
  function scheduleGraphUpgrade() {
    if (graphRafPending) return;
    graphRafPending = true;
    var raf = window.requestAnimationFrame || function (fn) { return setTimeout(fn, 16); };
    raf(function () {
      graphRafPending = false;
      processGraphElements();
    });
  }

  function upgradeGraphs() {
    processGraphElements();

    if (!graphObserver && 'MutationObserver' in window) {
      var view = document.getElementById('view') || document.getElementById('maincontent') || document.body;
      if (view) {
        graphObserver = new MutationObserver(function (records) {
          for (var i = 0; i < records.length; i++) {
            var r = records[i];
            if (r.type === 'attributes' && r.attributeName === 'points') {
              scheduleGraphUpgrade();
              return;
            }
            if (r.type === 'childList' && r.addedNodes && r.addedNodes.length) {
              for (var j = 0; j < r.addedNodes.length; j++) {
                var n = r.addedNodes[j];
                if (n && n.nodeType === 1 && (n.tagName === 'svg' || n.tagName === 'SVG' || n.tagName === 'polyline' || n.tagName === 'g' || (n.querySelector && n.querySelector('svg polyline')))) {
                  scheduleGraphUpgrade();
                  return;
                }
              }
            }
          }
        });
        graphObserver.observe(view, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ['points']
        });
      }
    }
  }

  function injectGraphGradients() {
    if (document.getElementById('darkstrap-graph-defs')) return;
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.id = 'darkstrap-graph-defs';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.style.position = 'absolute';
    svg.setAttribute('aria-hidden', 'true');
    var defs = document.createElementNS(svgNS, 'defs');
    
    function makeGrad(id, color) {
      var g = document.createElementNS(svgNS, 'linearGradient');
      g.id = id; g.setAttribute('x1','0'); g.setAttribute('y1','0'); g.setAttribute('x2','0'); g.setAttribute('y2','1');
      var s1 = document.createElementNS(svgNS, 'stop'); s1.setAttribute('offset','0%'); s1.setAttribute('stop-color',color); s1.setAttribute('stop-opacity','0.35');
      var s2 = document.createElementNS(svgNS, 'stop'); s2.setAttribute('offset','100%'); s2.setAttribute('stop-color',color); s2.setAttribute('stop-opacity','0.0');
      g.appendChild(s1); g.appendChild(s2);
      return g;
    }
    
    defs.appendChild(makeGrad('grad-primary', '#00e5ff'));
    defs.appendChild(makeGrad('grad-secondary', '#ff3366'));
    defs.appendChild(makeGrad('grad-tertiary', '#ffb020'));
    defs.appendChild(makeGrad('grad-quaternary', '#a352ff'));
    
    svg.appendChild(defs);
    if (document.body) document.body.appendChild(svg);
  }

  function wrapAssocTable(root) {
    var tbl = (root || document).querySelector('#wifi_assoclist_table');
    if (tbl && tbl.parentElement && !tbl.parentElement.classList.contains('darkstrap-table-scroll-wrap')) {
      var wrap = document.createElement('div');
      wrap.className = 'darkstrap-table-scroll-wrap';
      tbl.parentNode.insertBefore(wrap, tbl);
      wrap.appendChild(tbl);
    }
  }

  function run(root) {
    qsa(".port-status-device, .port-status-link, .ifacebadge", root).forEach(function (el) {
      if (el.closest('#wifi_assoclist_table, .assoclist')) return;
      var text = (el.textContent || "").toLowerCase();
      var hasDisabled = !!el.querySelector('img[src*="_disabled"]');
      var inactive = hasDisabled || /no link|not connected|disabled|down/.test(text);
      el.classList.toggle("darkstrap-active-port", !inactive);
      el.classList.toggle("darkstrap-inactive-port", inactive);
    });
    qsa("label", root).forEach(function (label) { if (label.querySelector("select.mode, select.band, select.channel, select.htmode")) label.classList.add("darkstrap-frequency-control"); });
    tagPortBoxes(root);
    tagWirelessBadges(root);
    tagProcessRows(root);
    normalizeActionDropdowns(root);
    normalizeComboButtons(root);
    addProgressNumbers(root);
    addHelpButtons(root);
    collapseEmptyNetworkBlocks(root);
    setModalScrollLock(modalIsOpen());
    wrapAssocTable(root);
    initMobileNav();
    upgradeGraphs(root);
    injectGraphGradients();
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function tagPortBoxes(root) {
    qsa('.ifacebox', root).forEach(function (box) {
      var text = (box.textContent || '').toLowerCase();
      var activeIcon = !!box.querySelector('img[src*="port_up.svg"], img[src*="pse_up.svg"]');
      var inactiveIcon = !!box.querySelector('img[src*="port_down.svg"], img[src*="pse_down.svg"], img[src*="_disabled"]');
      var inactive = inactiveIcon || /no link|not connected|disabled|down/.test(text);
      box.classList.toggle('darkstrap-active-port', activeIcon && !inactive);
      box.classList.toggle('darkstrap-inactive-port', inactive);
    });
  }

  var runScheduled = false;
  var mutationDebounceTimer = null;
  var pendingRoots = [];

  function isDarkstrapInternalNode(node) {
    if (!node || node.nodeType !== 1) return false;
    var sel = '.darkstrap-help-btn, .darkstrap-progress-title, #darkstrap-graph-defs, #darkstrap-mobile-toggle, #modal_overlay, #indicators, #indicators *, header, header *, #topmenu, #topmenu *, #modemenu, #modemenu *, #wifi_assoclist_table, #wifi_assoclist_table *, svg, svg *, .darkstrap-premium-line, .darkstrap-channel-arc-premium, .darkstrap-table-scroll-wrap, .cbi-dynlist, .cbi-dynlist *';
    if (node.matches && node.matches(sel)) return true;
    if (node.closest && node.closest(sel)) return true;
    return false;
  }

  function queueRoot(root) {
    if (!root) return;
    if (root.nodeType === 3) root = root.parentElement;
    if (!root || !root.nodeType) return;

    if (isDarkstrapInternalNode(root)) return;

    if (root === document || root.nodeType === 9) {
      pendingRoots = [document];
      return;
    }

    if (root.nodeType === 1 && pendingRoots.indexOf(root) === -1) {
      if (pendingRoots.length < 20) {
        pendingRoots.push(root);
      }
    }
  }

  function flushRun() {
    runScheduled = false;
    var roots = pendingRoots.length ? pendingRoots.splice(0) : [document];

    if (roots.indexOf(document) !== -1)
      run(document);
    else
      roots.forEach(run);
  }

  function scheduleRun(root) {
    queueRoot(root || document);
    if (runScheduled) return;
    runScheduled = true;
    if (mutationDebounceTimer) clearTimeout(mutationDebounceTimer);
    mutationDebounceTimer = setTimeout(function () {
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(flushRun);
      } else {
        flushRun();
      }
    }, 80);
  }

  function scheduleFromMutations(records) {
    var hasExternalMutation = false;
    for (var i = 0; i < records.length; i++) {
      var record = records[i];
      var target = record.target;
      if (isDarkstrapInternalNode(target)) continue;

      if (record.addedNodes && record.addedNodes.length) {
        for (var j = 0; j < record.addedNodes.length; j++) {
          var node = record.addedNodes[j];
          if (!node || node.nodeType !== 1) continue;
          if (isDarkstrapInternalNode(node)) continue;
          queueRoot(node);
          hasExternalMutation = true;
        }
      }
    }

    if (hasExternalMutation && pendingRoots.length > 0) {
      scheduleRun();
    }
  }

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function closeMobileNav(restoreFocus) {
    var toggle = document.getElementById('darkstrap-mobile-toggle');
    if (document.body) document.body.classList.remove('darkstrap-mobile-menu-open');
    if (toggle) {
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      if (restoreFocus) toggle.focus();
    }
    qsa('#topmenu > li.dropdown.darkstrap-touch-open').forEach(function (li) {
      li.classList.remove('darkstrap-touch-open');
    });
  }

  function initMobileNav() {
    var header = document.querySelector('header');
    if (!header || document.getElementById('darkstrap-mobile-toggle')) return;

    var toggle = document.createElement('button');
    toggle.id = 'darkstrap-mobile-toggle';
    toggle.type = 'button';
    toggle.className = 'darkstrap-mobile-toggle-btn';
    toggle.setAttribute('aria-label', 'Toggle Navigation Menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'topmenu');

    for (var b = 0; b < 3; b++) {
      var bar = document.createElement('span');
      bar.className = 'darkstrap-hamburger-bar';
      toggle.appendChild(bar);
    }

    toggle.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var isOpen = document.body.classList.toggle('darkstrap-mobile-menu-open');
      toggle.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', function (ev) {
      if (document.body.classList.contains('darkstrap-mobile-menu-open')) {
        if (!ev.target.closest('#topmenu, #darkstrap-mobile-toggle')) {
          closeMobileNav(false);
        }
      }
    });

    // Event delegation for dropdown menus (desktop & mobile)
    document.addEventListener('click', function (ev) {
      var menuLink = ev.target.closest('#topmenu > li.dropdown > a.menu');
      if (menuLink) {
        ev.preventDefault();
        ev.stopPropagation();
        var parent = menuLink.parentElement;
        var wasOpen = parent.classList.contains('darkstrap-touch-open');
        qsa('#topmenu > li.dropdown').forEach(function (li) { li.classList.remove('darkstrap-touch-open'); });
        if (!wasOpen) parent.classList.add('darkstrap-touch-open');
      } else if (!ev.target.closest('#topmenu > li.dropdown')) {
        qsa('#topmenu > li.dropdown.darkstrap-touch-open').forEach(function (li) { li.classList.remove('darkstrap-touch-open'); });
      }
    });

    header.appendChild(toggle);
  }

  function initAbstractBackground() {
    if (document.getElementById('darkstrap-abstract-bg')) return;
    var container = document.createElement('div');
    container.id = 'darkstrap-abstract-bg';
    container.setAttribute('aria-hidden', 'true');
    var pos = document.createElement('div');
    pos.className = 'darkstrap-abstract-positioner';

    var epochKey = 'darkstrap_bg_anim_epoch';
    var epoch = null;
    try { epoch = localStorage.getItem(epochKey); } catch (e) {}
    var now = Date.now();
    if (!epoch || isNaN(parseInt(epoch, 10))) {
      epoch = now;
      try { localStorage.setItem(epochKey, epoch); } catch (e) {}
    }
    var cycleDuration = 52;
    var elapsed = (now - parseInt(epoch, 10)) / 1000;
    var delayOffset = -(elapsed % cycleDuration);

    var spinner = document.createElement('div');
    spinner.className = 'darkstrap-abstract-spinner';
    if (prefersReducedMotion()) {
      spinner.style.animation = 'none';
    } else {
      spinner.style.animationDelay = delayOffset.toFixed(3) + 's';
    }

    // Two subtle layers keep GPU paint low while preserving depth
    var layerIndices = [0, 2];
    var layerOpacities = [0.22, 0.36];
    for (var i = 0; i < layerIndices.length; i++) {
      var layer = document.createElement('div');
      layer.className = 'darkstrap-abstract-layer darkstrap-layer-' + layerIndices[i];
      layer.style.opacity = layerOpacities[i];
      spinner.appendChild(layer);
    }

    pos.appendChild(spinner);
    container.appendChild(pos);
    if (document.body) {
      document.body.insertBefore(container, document.body.firstChild);
    }
  }

  // Synchronize animation state while respecting prefers-reduced-motion
  function syncBgAnimation() {
    var spinner = document.querySelector('.darkstrap-abstract-spinner');
    if (!spinner) return;
    if (prefersReducedMotion()) {
      spinner.style.animationPlayState = 'paused';
      return;
    }
    var cycle = 52;
    var elapsed = (Date.now() / 1000) % cycle;
    spinner.style.animationDelay = '-' + elapsed.toFixed(3) + 's';
    spinner.style.animationPlayState = 'running';
  }

  window.addEventListener('pageshow', function () {
    syncBgAnimation();
    if (document.body) {
      document.body.classList.remove('darkstrap-switching-page');
    }
  });

  /* Navigation and modal helpers */
  function initFastNav() {
    document.addEventListener('click', function (ev) {
      var a = ev.target && ev.target.closest ? ev.target.closest('#topmenu a, #modemenu a') : null;
      if (a && a.href && a.origin === window.location.origin && a.pathname !== window.location.pathname && !a.target) {
        document.body.classList.add('darkstrap-switching-page');
        setTimeout(function () {
          if (document.body) document.body.classList.remove('darkstrap-switching-page');
        }, 80);
      }
    }, true);

    // Explicit declarative dismiss hook only; standard LuCI buttons run their own handlers
    document.addEventListener('click', function (ev) {
      var target = ev.target;
      if (!target) return;
      var dismissBtn = target.closest('#modal_overlay [data-dismiss="modal"]');
      if (dismissBtn) {
        setTimeout(function () {
          if (window.L && window.L.hideModal) {
            window.L.hideModal();
          }
          setModalScrollLock(false);
        }, 0);
      }
    }, true);
  }

  function initTooltipViewportGuards() {
    function adjustTooltip(container) {
      var tt = container.querySelector('.cbi-tooltip');
      if (!tt) return;

      var sec = container.closest('.cbi-section, .cbi-tblsection, .ifacebox');
      if (sec) sec.style.zIndex = '100';

      var wasHidden = (window.getComputedStyle(tt).display === 'none');
      if (wasHidden) {
        tt.style.display = 'flex';
        tt.style.visibility = 'hidden';
      }

      var cRect = container.getBoundingClientRect();
      var ttRect = tt.getBoundingClientRect();
      var winW = window.innerWidth;
      var winH = window.innerHeight;
      var pad = 12;

      // 1. Vertical flip check:
      if (ttRect.bottom > winH - pad && (cRect.top - ttRect.height > pad)) {
        tt.classList.add('darkstrap-tooltip-above');
        tt.classList.remove('darkstrap-tooltip-below');
      } else if (cRect.top - ttRect.height < pad && (winH - cRect.bottom > ttRect.height + pad)) {
        tt.classList.add('darkstrap-tooltip-below');
        tt.classList.remove('darkstrap-tooltip-above');
      }

      // 2. Horizontal positioning & arrow alignment:
      // Prefer card boundaries (.cbi-section, .cbi-tblsection) or fallback to #maincontent / viewport
      var card = container.closest('.cbi-section, .cbi-tblsection') || container.closest('#maincontent') || document.body;
      var cardRect = card.getBoundingClientRect();
      var minLeft = Math.max(pad, cardRect.left + 8);
      var maxRight = Math.min(winW - pad, cardRect.right - 8);

      // Target center: if inside an ifacebox port card, center relative to the port card
      var portBox = container.closest('.ifacebox');
      var targetRect = portBox ? portBox.getBoundingClientRect() : cRect;
      var targetCenterX = targetRect.left + targetRect.width / 2;

      var ttWidth = ttRect.width || 240;
      var maxCardWidth = Math.max(160, maxRight - minLeft);
      if (ttWidth > maxCardWidth) {
        ttWidth = maxCardWidth;
        tt.style.maxWidth = maxCardWidth + 'px';
      }

      var desiredTtLeft = targetCenterX - ttWidth / 2;

      // Rigid clamp: desiredTtLeft MUST stay within [minLeft, maxRight - ttWidth]
      if (desiredTtLeft + ttWidth > maxRight) {
        desiredTtLeft = maxRight - ttWidth;
      }
      if (desiredTtLeft < minLeft) {
        desiredTtLeft = minLeft;
      }

      var relativeTtLeft = desiredTtLeft - cRect.left;
      var arrowX = Math.max(16, Math.min(ttWidth - 16, targetCenterX - desiredTtLeft));

      tt.style.setProperty('--darkstrap-tt-left', relativeTtLeft + 'px');
      tt.style.setProperty('--darkstrap-tt-right', 'auto');
      tt.style.setProperty('--darkstrap-tt-transform', 'none');
      tt.style.setProperty('--darkstrap-arrow-left', arrowX + 'px');
      tt.style.setProperty('--darkstrap-arrow-right', 'auto');
      tt.style.setProperty('--darkstrap-arrow-tx', '-50%');

      if (wasHidden) {
        tt.style.display = '';
        tt.style.visibility = '';
      }
    }

    function resetTooltip(container) {
      var sec = container.closest('.cbi-section, .cbi-tblsection, .ifacebox');
      if (sec) sec.style.removeProperty('z-index');

      var tt = container.querySelector('.cbi-tooltip');
      if (tt) {
        tt.classList.remove('darkstrap-tooltip-above');
        tt.classList.remove('darkstrap-tooltip-below');
        tt.style.removeProperty('--darkstrap-tt-left');
        tt.style.removeProperty('--darkstrap-tt-right');
        tt.style.removeProperty('--darkstrap-tt-transform');
        tt.style.removeProperty('--darkstrap-arrow-left');
        tt.style.removeProperty('--darkstrap-arrow-right');
        tt.style.removeProperty('--darkstrap-arrow-tx');
      }
    }

    document.addEventListener('mouseover', function (ev) {
      var container = ev.target && ev.target.closest && ev.target.closest('.cbi-tooltip-container');
      if (container) adjustTooltip(container);
    }, { passive: true });

    document.addEventListener('focusin', function (ev) {
      var container = ev.target && ev.target.closest && ev.target.closest('.cbi-tooltip-container');
      if (container) adjustTooltip(container);
    }, { passive: true });

    document.addEventListener('mouseout', function (ev) {
      var container = ev.target && ev.target.closest && ev.target.closest('.cbi-tooltip-container');
      if (container && (!ev.relatedTarget || !container.contains(ev.relatedTarget))) {
        resetTooltip(container);
      }
    }, { passive: true });
  }

  ready(function () {
    syncBgAnimation();
    initFastNav();
    initAbstractBackground();
    initMobileNav();
    initTooltipViewportGuards();
    run(document);
    function closeOpenHelp(restoreFocus) {
      qsa('.darkstrap-help-managed.darkstrap-help-open').forEach(function (descEl) {
        descEl.classList.remove('darkstrap-help-open');
        var b = document.querySelector('.darkstrap-help-btn[data-darkstrap-help-for="' + descEl.id + '"]');
        if (b) {
          b.classList.remove('darkstrap-help-active');
          b.setAttribute('aria-expanded', 'false');
          b.setAttribute('aria-label', b.getAttribute('data-show-label') || 'Show help');
          if (restoreFocus && document.activeElement && (document.activeElement === b || descEl.contains(document.activeElement))) {
            b.focus();
          }
        }
      });
    }

    document.addEventListener('click', function (ev) {
      if (ev.target.closest('.darkstrap-help-btn, .darkstrap-help-managed, .cbi-value, .cbi-section, .cbi-tabcontainer')) {
        return; // Don't dismiss help while interacting with form fields
      }
      closeOpenHelp(false);
    });
    if ('MutationObserver' in window && document.body) {
      new MutationObserver(scheduleFromMutations).observe(document.body, { childList: true, subtree: true });
      // Sync Save & Apply button face when LuCI switches the active option attribute
      new MutationObserver(function (records) {
        var touched = [];
        for (var k = 0; k < records.length; k++) {
          var rec = records[k];
          var drop = rec.target && rec.target.closest ? rec.target.closest('.cbi-page-actions .cbi-dropdown.cbi-button, .actions .cbi-dropdown.cbi-button') : null;
          if (drop && touched.indexOf(drop) === -1) touched.push(drop);
        }
        touched.forEach(normalizeActionDropdowns);
      }).observe(document.body, { attributes: true, attributeFilter: ['selected', 'display'], subtree: true });
      // Restore scroll position & clear lock whenever modal-overlay-active toggles
      new MutationObserver(function () {
        setModalScrollLock(modalIsOpen());
      }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
    document.addEventListener('cbi-dropdown-change', function (ev) {
      var drop = ev.target && ev.target.closest ? ev.target.closest('.cbi-page-actions .cbi-dropdown.cbi-button, .actions .cbi-dropdown.cbi-button') : null;
      if (drop) normalizeActionDropdowns(drop);
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        if (document.body && document.body.classList.contains('darkstrap-mobile-menu-open')) {
          closeMobileNav(true);
        }
        qsa('#topmenu > li.dropdown.darkstrap-touch-open').forEach(function (li) {
          li.classList.remove('darkstrap-touch-open');
        });
        closeOpenHelp(true);
        setTimeout(function () { setModalScrollLock(modalIsOpen()); }, 0);
      }
    }, true);
    document.addEventListener('click', function (ev) {
      var drop = ev.target && ev.target.closest ? ev.target.closest('.cbi-page-actions .cbi-dropdown.cbi-button, .actions .cbi-dropdown.cbi-button') : null;
      if (drop) {
        setTimeout(function () { normalizeActionDropdowns(drop); }, 0);
      }
      setTimeout(function () { setModalScrollLock(modalIsOpen()); }, 0);
    }, true);
  });
}());
