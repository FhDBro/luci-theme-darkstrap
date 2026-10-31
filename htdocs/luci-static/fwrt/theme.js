(function () {
  'use strict';
  if (window.__fwrtThemeJs) return;
  window.__fwrtThemeJs = true;

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

  function addProgressNumbers(root) {
    qsa('.cbi-progressbar[title], .progress[title]', root).forEach(function (bar) {
      var text = compactProgressTitle(bar.getAttribute('title'));
      if (!text) return;
      bar.classList.add('fwrt-title-numbered');
      var span = bar.querySelector('.fwrt-progress-title');
      if (!span) {
        span = document.createElement('span');
        span.className = 'fwrt-progress-title';
        bar.appendChild(span);
      }
      if (span.textContent !== text) span.textContent = text;
    });
  }

  function descriptionContainer(desc) {
    return desc.closest('.cbi-value') || desc.closest('.cbi-section') || desc.closest('.cbi-tabcontainer') || desc.closest('.tr') || desc.closest('tr') || desc.parentElement;
  }

  function buttonTarget(container, desc) {
    return (container && (container.querySelector('.cbi-value-title') || container.querySelector('legend') || container.querySelector('h3') || container.querySelector('h2') || container.querySelector('label') || container.querySelector('.td:first-child') || container.firstElementChild)) || desc.parentElement;
  }

  function addHelpButtons(root) {
    var selector = [
      '.cbi-value-description:not(.fwrt-help-managed)',
      '.cbi-section-descr:not(.fwrt-help-managed)',
      '.cbi-section-table-descr:not(.fwrt-help-managed)',
      '.cbi-tab-descr:not(.fwrt-help-managed)',
      '.description:not(.fwrt-help-managed)',
      '.help-block:not(.fwrt-help-managed)',
      '.help-inline:not(.fwrt-help-managed)',
      '.cbi-map-descr:not(.fwrt-help-managed)'
    ].join(',');

    qsa(selector, root).forEach(function (desc) {
      var text = (desc.textContent || '').trim();
      if (!text) return;
      if (desc.closest('.alert-message, .alert, .notice, .zonebadge, .ifacebadge, .ifacebox, .modal.login')) return;

      var container = descriptionContainer(desc);
      if (!container) return;
      desc.classList.add('fwrt-help-managed');

      if (!desc.id) desc.id = 'fwrt-help-' + Math.random().toString(36).slice(2, 10);
      if (container.querySelector('.fwrt-help-btn[data-fwrt-help-for="' + desc.id + '"]')) return;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fwrt-help-btn';
      btn.textContent = '?';
      btn.setAttribute('aria-label', 'Show help');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', desc.id);
      btn.setAttribute('data-fwrt-help-for', desc.id);

      var hoverTimer = null;
      btn.addEventListener('mouseenter', function () {
        hoverTimer = setTimeout(function () {
          if (!container.classList.contains('fwrt-help-open')) {
            container.classList.add('fwrt-help-hover');
          }
        }, 120);
      });
      btn.addEventListener('mouseleave', function () {
        if (hoverTimer) clearTimeout(hoverTimer);
        container.classList.remove('fwrt-help-hover');
      });
      btn.addEventListener('focus', function () {
        if (!container.classList.contains('fwrt-help-open')) {
          container.classList.add('fwrt-help-hover');
        }
      });
      btn.addEventListener('blur', function () {
        container.classList.remove('fwrt-help-hover');
      });

      btn.addEventListener('touchstart', function (ev) {
        ev.stopPropagation();
      }, { passive: true });

      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var open = !container.classList.contains('fwrt-help-open');
        qsa('.fwrt-help-open').forEach(function (el) {
          if (el !== container) {
            el.classList.remove('fwrt-help-open');
            var b = el.querySelector('.fwrt-help-btn');
            if (b) {
              b.setAttribute('aria-expanded', 'false');
              b.setAttribute('aria-label', 'Show help');
            }
          }
        });
        container.classList.toggle('fwrt-help-open', open);
        container.classList.remove('fwrt-help-hover');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.setAttribute('aria-label', open ? 'Hide help' : 'Show help');
      });

      var target = buttonTarget(container, desc);
      if (target) target.appendChild(btn);
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
      if (el.classList.contains('fwrt-help-managed')) return;

      var text = (el.textContent || '').replace(/\u00a0/g, ' ').trim();
      var useful = el.querySelector('input, select, textarea, button, a, img, svg, canvas, table, .table, .tr, .td, .th, .cbi-button, .ifacebox, .ifacebadge, .cbi-dropdown, [data-tab-active="true"]');
      el.classList.toggle('fwrt-empty-structural', !text && !useful);
    });

    qsa('.cbi-section, .cbi-tblsection', root).forEach(function (section) {
      if (section.closest('#modal_overlay, .modal, .alert-message, .cbi-page-actions, .actions')) return;

      var text = (section.textContent || '').replace(/\u00a0/g, ' ').trim();
      var useful = section.querySelector('input, select, textarea, button, a, img, svg, canvas, table, .table, .tr, .td, .th, .cbi-button, .ifacebox, .ifacebadge, .cbi-dropdown, [data-tab-active="true"]');
      var hasVisibleBox = false;

      Array.prototype.slice.call(section.children || []).some(function (child) {
        if (child.classList && (child.classList.contains('fwrt-empty-structural') || child.classList.contains('hidden'))) return false;
        if (child.style && (child.style.display === 'none' || child.style.visibility === 'hidden')) return false;
        hasVisibleBox = (child.children && child.children.length > 0) || (child.textContent || '').trim().length > 0;
        return hasVisibleBox;
      });

      section.classList.toggle('fwrt-empty-structural', !text && !useful && !hasVisibleBox);
    });
  }

  var lockedScrollY = 0;

  function modalIsOpen() {
    return document.body ? document.body.classList.contains('modal-overlay-active') : false;
  }

  function setModalScrollLock(lock) {
    if (!document.body || !document.documentElement) return;
    if (lock && !document.body.classList.contains('fwrt-modal-open')) {
      lockedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
      document.documentElement.classList.add('fwrt-modal-open');
      document.body.classList.add('fwrt-modal-open');
      document.body.style.top = '-' + lockedScrollY + 'px';
    }
    else if (!lock && document.body.classList.contains('fwrt-modal-open')) {
      document.documentElement.classList.remove('fwrt-modal-open');
      document.body.classList.remove('fwrt-modal-open');
      document.body.style.top = '';
      window.scrollTo(0, lockedScrollY);
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

      badge.classList.toggle('fwrt-radio-badge', isRadio && !isClient);
      badge.classList.toggle('fwrt-wireless-client-badge', isClient);

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

      row.classList.toggle('fwrt-cpu-active-row', cpuActive);
      row.classList.toggle('fwrt-mem-active-row', memActive);
      row.setAttribute('data-fwrt-cpu', isFinite(cpu) ? String(cpu) : '0');
      row.setAttribute('data-fwrt-mem', isFinite(mem) ? String(mem) : '0');
      cells[3].classList.add('fwrt-process-cpu-cell');
      cells[4].classList.add('fwrt-process-mem-cell');
      cells[5].classList.add('fwrt-process-actions-cell');

      var actions = cells[5].querySelector('div');
      if (actions)
        actions.classList.add('fwrt-process-actions');
    });
  }

  function normalizeActionDropdowns(root) {
    qsa('.cbi-page-actions .cbi-dropdown.cbi-button, .actions .cbi-dropdown.cbi-button', root).forEach(function (drop) {
      var preview = Array.prototype.slice.call(drop.children || []).filter(function (child) {
        return child.tagName === 'UL' && !child.classList.contains('dropdown') && !child.classList.contains('preview');
      })[0];
      if (!preview) return;

      var previewText = (preview.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      var isSaveApply = drop.classList.contains('cbi-button-apply') ||
        (previewText.indexOf('save') !== -1 && previewText.indexOf('apply') !== -1);

      if (!isSaveApply) return;

      var items = Array.prototype.slice.call(preview.children || []).filter(function (child) {
        return child.tagName === 'LI';
      });
      if (!items.length) return;

      var main = items.filter(function (item) {
        return item.hasAttribute('display') || item.hasAttribute('selected');
      })[0] || null;

      items.forEach(function (item) {
        var text = (item.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
        var isUnchecked = text.indexOf('unchecked') !== -1;
        item.classList.remove('fwrt-action-preview-main');
        item.classList.remove('fwrt-action-preview-extra');

        if (isUnchecked || item.getAttribute('aria-hidden') === 'true')
          item.classList.add('fwrt-action-preview-extra');
        else if (!main)
          main = item;
      });

      main = main || items[0];
      drop.classList.add('fwrt-save-apply-combo');
      preview.classList.add('fwrt-save-apply-preview');
      main.classList.remove('fwrt-action-preview-extra');
      main.classList.add('fwrt-action-preview-main');
    });
  }

  function normalizeComboButtons(root) {
    qsa('.cbi-dropdown.cbi-button, .cbi-dropdown.btn', root).forEach(function (btn) {
      if (btn.classList.contains('fwrt-save-apply-combo')) return;
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

  function upgradeGraphs() {
    if (window.fwrtGraphLoopStarted) return;

    // Check if graph elements exist
    var initialPolys = document.querySelectorAll('svg polyline');
    var initialArcs = document.querySelectorAll('#channel_graph svg polyline');
    if (!initialPolys.length && !initialArcs.length) {
      return;
    }

    window.fwrtGraphLoopStarted = true;
    var lastGraphTick = 0;
    
    function tick(now) {
      if (document.hidden) {
        requestAnimationFrame(tick);
        return;
      }
      if (now && lastGraphTick && (now - lastGraphTick < 100)) {
        requestAnimationFrame(tick);
        return;
      }
      lastGraphTick = now || performance.now();
      var polys = document.querySelectorAll('svg polyline');
      var arcs = document.querySelectorAll('#channel_graph svg polyline');

      if (!polys.length && !arcs.length) {
        window.fwrtGraphLoopStarted = false;
        return;
      }

      polys.forEach(function(poly) {
        var id = poly.getAttribute('id');
        if (!id) return;
        
        var pathId = id + '-fwrt-line';
        var path = document.getElementById(pathId);
        if (!path) {
          path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.id = pathId;
          path.setAttribute('class', 'fwrt-premium-line ' + id);
          poly.parentNode.appendChild(path);
        }
        
        var ptStr = poly.getAttribute('points') || '';
        if (path.getAttribute('data-last-points') === ptStr) return;
        path.setAttribute('data-last-points', ptStr);
        
        try {
          var ptsRaw = ptStr.trim().split(/\s+/);
          if (ptsRaw.length > 3) {
            var dataPts = ptsRaw.slice(1, ptsRaw.length - 1).map(function(p) {
              var coords = p.split(',');
              return { x: parseFloat(coords[0]), y: parseFloat(coords[1]) };
            });
            
            var validPts = dataPts.filter(function(p) { return !isNaN(p.x) && !isNaN(p.y); });
            if (validPts.length > 1) {
              var d = "M " + validPts[0].x + " " + validPts[0].y + " ";
              for (var i = 0; i < validPts.length - 1; i++) {
                var p1 = validPts[i];
                var p2 = validPts[i + 1];
                var midX = (p1.x + p2.x) / 2;
                if (isNaN(midX)) {
                  d += "L " + p2.x + " " + p2.y + " ";
                } else {
                  d += "C " + midX + " " + p1.y + ", " + midX + " " + p2.y + ", " + p2.x + " " + p2.y + " ";
                }
              }
              path.setAttribute('d', d);
              poly.style.opacity = '0';
              poly.style.stroke = 'none';
            }
          }
        } catch(e) {}
      });
      
      // Channel analysis arcs
      arcs.forEach(function(arc) {
        var id = arc.getAttribute('id');
        if (!id) {
          id = 'arc-' + Math.random().toString(36).slice(2, 10);
          arc.setAttribute('id', id);
        }
        
        var pathId = id + '-path';
        var path = document.getElementById(pathId);
        if (!path) {
          path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.id = pathId;
          path.classList.add('fwrt-channel-arc-premium');
          arc.parentNode.appendChild(path);
        }
        
        var ptStr = arc.getAttribute('points') || '';
        if (path.getAttribute('data-last-points') === ptStr) return;
        path.setAttribute('data-last-points', ptStr);
        var ptsRaw = ptStr.trim().split(/\s+/);
        if (ptsRaw.length === 4) {
          var p0 = ptsRaw[0].split(',');
          var p1 = ptsRaw[1].split(',');
          var p2 = ptsRaw[2].split(',');
          var p3 = ptsRaw[3].split(',');
          
          p0 = {x: parseFloat(p0[0]), y: parseFloat(p0[1])};
          p1 = {x: parseFloat(p1[0]), y: parseFloat(p1[1])};
          p2 = {x: parseFloat(p2[0]), y: parseFloat(p2[1])};
          p3 = {x: parseFloat(p3[0]), y: parseFloat(p3[1])};
          
          var midX = (p1.x + p2.x) / 2;
          
          // Draw smooth bezier curve
          var d = "M " + p0.x + " " + p0.y + 
                  " C " + p1.x + " " + p0.y + ", " + p1.x + " " + p1.y + ", " + midX + " " + p1.y +
                  " C " + p2.x + " " + p1.y + ", " + p2.x + " " + p3.y + ", " + p3.x + " " + p3.y;
          
          path.setAttribute('d', d);
          
          // Hide polygon
          arc.style.opacity = '0';
          arc.style.stroke = 'none';
          arc.style.fill = 'none';
          
          var color = '#f59e0b';
          
          path.style.fill = 'none';
          path.style.stroke = color;
          path.style.strokeWidth = '3.5px';
          path.style.strokeLinecap = 'round';
          path.style.filter = 'drop-shadow(0 4px 4px rgba(0,0,0,0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.4))';
        }
      });
      
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function injectGraphGradients() {
    if (document.getElementById('fwrt-graph-defs')) return;
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.id = 'fwrt-graph-defs';
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
    if (tbl && tbl.parentElement && !tbl.parentElement.classList.contains('fwrt-table-scroll-wrap')) {
      var wrap = document.createElement('div');
      wrap.className = 'fwrt-table-scroll-wrap';
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
      el.classList.toggle("fwrt-active-port", !inactive);
      el.classList.toggle("fwrt-inactive-port", inactive);
    });
    qsa("label", root).forEach(function (label) { if (label.querySelector("select.mode, select.band, select.channel, select.htmode")) label.classList.add("fwrt-frequency-control"); });
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
      box.classList.toggle('fwrt-active-port', activeIcon && !inactive);
      box.classList.toggle('fwrt-inactive-port', inactive);
    });
  }

  var runScheduled = false;
  var mutationDebounceTimer = null;
  var pendingRoots = [];

  function isFwrtInternalNode(node) {
    if (!node || node.nodeType !== 1) return false;
    var sel = '.fwrt-help-btn, .fwrt-progress-title, #fwrt-graph-defs, #fwrt-mobile-toggle, #modal_overlay, .proc-gold-table, #indicators, #indicators *, header, header *, #topmenu, #topmenu *, #modemenu, #modemenu *, #wifi_assoclist_table, #wifi_assoclist_table *, svg, svg *, .fwrt-premium-line, .fwrt-premium-dome, .fwrt-table-scroll-wrap, #dns-query-log, .cbi-dynlist, .cbi-dynlist *';
    if (node.matches && node.matches(sel)) return true;
    if (node.closest && node.closest(sel)) return true;
    return false;
  }

  function queueRoot(root) {
    if (!root) return;
    if (root.nodeType === 3) root = root.parentElement;
    if (!root || !root.nodeType) return;

    if (isFwrtInternalNode(root)) return;

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
    }, 20);
  }

  function scheduleFromMutations(records) {
    var hasExternalMutation = false;
    for (var i = 0; i < records.length; i++) {
      var record = records[i];
      var target = record.target;
      if (isFwrtInternalNode(target)) continue;

      if (record.addedNodes && record.addedNodes.length) {
        for (var j = 0; j < record.addedNodes.length; j++) {
          var node = record.addedNodes[j];
          if (!node || node.nodeType !== 1) continue;
          if (isFwrtInternalNode(node)) continue;
          queueRoot(node);
          hasExternalMutation = true;
        }
      }
    }

    if (hasExternalMutation && pendingRoots.length > 0) {
      scheduleRun();
    }
  }

  function initMobileNav() {
    var header = document.querySelector('header');
    if (!header || document.getElementById('fwrt-mobile-toggle')) return;

    var toggle = document.createElement('button');
    toggle.id = 'fwrt-mobile-toggle';
    toggle.type = 'button';
    toggle.className = 'fwrt-mobile-toggle-btn';
    toggle.setAttribute('aria-label', 'Toggle Navigation Menu');

    for (var b = 0; b < 3; b++) {
      var bar = document.createElement('span');
      bar.className = 'fwrt-hamburger-bar';
      toggle.appendChild(bar);
    }

    toggle.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var isOpen = document.body.classList.toggle('fwrt-mobile-menu-open');
      toggle.classList.toggle('active', isOpen);
    });

    document.addEventListener('click', function (ev) {
      if (document.body.classList.contains('fwrt-mobile-menu-open')) {
        if (!ev.target.closest('#topmenu, #fwrt-mobile-toggle')) {
          document.body.classList.remove('fwrt-mobile-menu-open');
          toggle.classList.remove('active');
        }
      }
    });

    // Universal Event delegation for dropdown menus (desktop & mobile)
    document.addEventListener('click', function (ev) {
      var menuLink = ev.target.closest('#topmenu > li.dropdown > a.menu');
      if (menuLink) {
        ev.preventDefault();
        ev.stopPropagation();
        var parent = menuLink.parentElement;
        var wasOpen = parent.classList.contains('fwrt-touch-open');
        qsa('#topmenu > li.dropdown').forEach(function (li) { li.classList.remove('fwrt-touch-open'); });
        if (!wasOpen) parent.classList.add('fwrt-touch-open');
      } else if (!ev.target.closest('#topmenu > li.dropdown')) {
        qsa('#topmenu > li.dropdown.fwrt-touch-open').forEach(function (li) { li.classList.remove('fwrt-touch-open'); });
      }
    });

    header.insertBefore(toggle, header.firstChild);
  }

  function initAbstractBackground() {
    if (document.getElementById('fwrt-abstract-bg')) return;
    var container = document.createElement('div');
    container.id = 'fwrt-abstract-bg';
    container.setAttribute('aria-hidden', 'true');
    var pos = document.createElement('div');
    pos.className = 'fwrt-abstract-positioner';

    // Synchronize animation timeline across page loads and menu switches via localStorage
    var epochKey = 'fwrt_bg_anim_epoch';
    var epoch = localStorage.getItem(epochKey);
    var now = Date.now();
    if (!epoch || isNaN(parseInt(epoch, 10))) {
      epoch = now;
      try { localStorage.setItem(epochKey, epoch); } catch (e) {}
    }
    var cycleDuration = 52; // 52s compound 3D loop
    var elapsed = (now - parseInt(epoch, 10)) / 1000;
    var delayOffset = -(elapsed % cycleDuration);

    var spinner = document.createElement('div');
    spinner.className = 'fwrt-abstract-spinner';
    spinner.style.animationDelay = delayOffset.toFixed(3) + 's';

    // Depth layers
    var depths = [-28, -14, 0, 14, 28];
    var layerOpacities = [0.20, 0.28, 0.38, 0.30, 0.22];
    for (var i = 0; i < depths.length; i++) {
      var layer = document.createElement('div');
      layer.className = 'fwrt-abstract-layer fwrt-layer-' + i;
      layer.style.transform = 'translateZ(' + depths[i] + 'px)';
      layer.style.opacity = layerOpacities[i];
      spinner.appendChild(layer);
    }

    pos.appendChild(spinner);
    container.appendChild(pos);
    if (document.body) {
      document.body.insertBefore(container, document.body.firstChild);
    }
  }

  // Synchronize animation state
  function syncBgAnimation() {
    var spinner = document.querySelector('.fwrt-abstract-spinner');
    if (!spinner) return;
    var cycle = 52;
    var elapsed = (Date.now() / 1000) % cycle;
    spinner.style.animationDelay = '-' + elapsed.toFixed(3) + 's';
    spinner.style.animationPlayState = 'running';
  }

  window.addEventListener('pageshow', function () {
    syncBgAnimation();
    if (document.body) {
      document.body.classList.remove('fwrt-switching-page');
    }
  });

  /* Navigation and modal handlers */
  function initFastNav() {
    document.addEventListener('click', function (ev) {
      var a = ev.target && ev.target.closest ? ev.target.closest('#topmenu a, #modemenu a') : null;
      if (a && a.href && a.origin === window.location.origin && a.pathname !== window.location.pathname && !a.target) {
        document.body.classList.add('fwrt-switching-page');
        setTimeout(function () {
          if (document.body) document.body.classList.remove('fwrt-switching-page');
        }, 80);
      }
    }, true);

    // Modal dismissal handler
    document.addEventListener('click', function (ev) {
      var target = ev.target;
      if (!target) return;
      var dismissBtn = target.closest('#modal_overlay .button-row button, #modal_overlay .right button, #modal_overlay button[class*="dismiss"], #modal_overlay [data-dismiss="modal"]');
      if (dismissBtn) {
        var text = (dismissBtn.textContent || dismissBtn.value || '').trim().toLowerCase();
        if (text === 'dismiss' || text === 'cancel' || text === 'close') {
          setTimeout(function () {
            if (window.L && window.L.hideModal) {
              window.L.hideModal();
            }
            if (document.body) {
              document.body.classList.remove('modal-overlay-active', 'fwrt-modal-open');
              document.body.style.top = '';
            }
            if (document.documentElement) {
              document.documentElement.classList.remove('fwrt-modal-open');
            }
          }, 10);
        }
      }
    }, true);
  }

  ready(function () {
    syncBgAnimation();
    initFastNav();
    initAbstractBackground();
    initMobileNav();
    run(document);
    document.addEventListener('click', function (ev) {
      if (!ev.target.closest('.fwrt-help-btn, .fwrt-help-managed')) {
        qsa('.fwrt-help-open').forEach(function (el) {
          el.classList.remove('fwrt-help-open');
          var b = el.querySelector('.fwrt-help-btn');
          if (b) {
            b.setAttribute('aria-expanded', 'false');
            b.setAttribute('aria-label', 'Show help');
          }
        });
      }
    });
    if ('MutationObserver' in window && document.body) {
      new MutationObserver(scheduleFromMutations).observe(document.body, { childList: true, subtree: true });
      // Reset scroll lock when modal closes
      new MutationObserver(function () {
        if (!document.body.classList.contains('modal-overlay-active')) {
          if (document.body.classList.contains('fwrt-modal-open')) {
            document.body.classList.remove('fwrt-modal-open');
            document.body.style.top = '';
          }
          if (document.documentElement && document.documentElement.classList.contains('fwrt-modal-open')) {
            document.documentElement.classList.remove('fwrt-modal-open');
          }
        }
      }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        setTimeout(function () { setModalScrollLock(modalIsOpen()); }, 0);
      }
    }, true);
    document.addEventListener('click', function () {
      setTimeout(function () { setModalScrollLock(modalIsOpen()); }, 0);
    }, true);
  });
}());
