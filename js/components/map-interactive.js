/**
 * Map Interactive — Renders nodes and connections on the Drenthe SVG map.
 * Handles hover/click interactions and info panel display.
 */

/**
 * Color mapping for node statuses.
 */
var MAP_STATUS_COLORS = {
  planned: '#1565c0',
  active: '#2e7d32',
  offline: '#bf360c',
  prototype: '#e65100',
};

/**
 * Color mapping for node types.
 */
var MAP_TYPE_COLORS = {
  router: '#5e35b1',
  repeater: '#00897b',
  solar: '#f9a825',
  client: '#8e24aa',
};

/**
 * Finds a node by ID in the NODES array.
 * @param {string} id
 * @returns {Object|undefined}
 */
function findNodeById(id) {
  return NODES.find(function(n) { return n.id === id; });
}

/**
 * Builds the unique list of connections from NODES data.
 * Returns an array of { from, to } objects (deduplicated).
 * @returns {Array<{from: Object, to: Object}>}
 */
function buildConnections() {
  var seen = {};
  var connections = [];
  NODES.forEach(function(node) {
    if (!node.connections) return;
    node.connections.forEach(function(targetId) {
      var key = [node.id, targetId].sort().join('--');
      if (seen[key]) return;
      seen[key] = true;
      var target = findNodeById(targetId);
      if (target) {
        connections.push({ from: node, to: target });
      }
    });
  });
  return connections;
}

/**
 * Renders connection lines into the SVG.
 * @param {SVGGElement} group - the <g> element for lines
 */
function renderConnections(group) {
  var connections = buildConnections();
  connections.forEach(function(conn) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', conn.from.x);
    line.setAttribute('y1', conn.from.y);
    line.setAttribute('x2', conn.to.x);
    line.setAttribute('y2', conn.to.y);
    line.setAttribute('stroke', 'var(--color-primary)');
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-opacity', '0.35');
    line.classList.add('connection-line');
    line.setAttribute('data-from', conn.from.id);
    line.setAttribute('data-to', conn.to.id);
    group.appendChild(line);
  });
}

/**
 * Creates an SVG marker group for a single node.
 * @param {Object} node
 * @returns {SVGGElement}
 */
function createNodeMarkerElement(node) {
  var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.classList.add('node-marker');
  g.setAttribute('data-node-id', node.id);
  g.setAttribute('role', 'button');
  g.setAttribute('tabindex', '0');
  g.setAttribute('aria-label', node.name + ' — ' + node.type + ', ' + node.status);

  var color = MAP_STATUS_COLORS[node.status] || MAP_STATUS_COLORS.planned;

  // Pulse ring (animated)
  var pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  pulse.setAttribute('cx', node.x);
  pulse.setAttribute('cy', node.y);
  pulse.setAttribute('r', '12');
  pulse.setAttribute('fill', color);
  pulse.classList.add('node-marker__pulse');
  g.appendChild(pulse);

  // Main dot
  var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  dot.setAttribute('cx', node.x);
  dot.setAttribute('cy', node.y);
  dot.setAttribute('r', '6');
  dot.setAttribute('fill', color);
  dot.classList.add('node-marker__dot');
  g.appendChild(dot);

  return g;
}

/**
 * Renders all node markers into the SVG.
 * @param {SVGGElement} group - the <g> element for markers
 */
function renderNodeMarkers(group) {
  NODES.forEach(function(node) {
    var marker = createNodeMarkerElement(node);
    group.appendChild(marker);
  });
}

/**
 * Shows the info panel for a specific node.
 * @param {Object} node
 * @param {HTMLElement} panel
 */
function showNodeInfo(node, panel) {
  var nameEl = panel.querySelector('.node-info__name');
  var descEl = panel.querySelector('.node-info__desc');
  var metaEl = panel.querySelector('.node-info__meta');

  if (nameEl) nameEl.textContent = node.name;
  if (descEl) descEl.textContent = node.description;
  if (metaEl) {
    metaEl.innerHTML = '';
    // Status badge
    var statusBadge = document.createElement('span');
    statusBadge.className = 'node-info__badge badge--' + node.status;
    statusBadge.textContent = node.status;
    metaEl.appendChild(statusBadge);
    // Type badge
    var typeBadge = document.createElement('span');
    typeBadge.className = 'node-info__badge badge--' + node.type;
    typeBadge.textContent = node.type;
    metaEl.appendChild(typeBadge);
    // Bereik
    if (node.bereik) {
      var bereikSpan = document.createElement('span');
      bereikSpan.textContent = '~' + node.bereik + ' km bereik';
      metaEl.appendChild(bereikSpan);
    }
  }

  panel.classList.add('node-info--visible');
}

/**
 * Hides the info panel.
 * @param {HTMLElement} panel
 */
function hideNodeInfo(panel) {
  panel.classList.remove('node-info--visible');
}

/**
 * Highlights connections for a specific node.
 * @param {string} nodeId
 * @param {SVGGElement} lineGroup
 * @param {boolean} highlight
 */
function highlightConnections(nodeId, lineGroup, highlight) {
  var lines = lineGroup.querySelectorAll('.connection-line');
  lines.forEach(function(line) {
    var from = line.getAttribute('data-from');
    var to = line.getAttribute('data-to');
    if (from === nodeId || to === nodeId) {
      line.setAttribute('stroke-opacity', highlight ? '0.8' : '0.35');
      line.setAttribute('stroke-width', highlight ? '2.5' : '1.5');
    }
  });
}

/**
 * Initializes the interactive map.
 * Expects: <svg> with #node-markers and #connection-lines groups,
 *          and a .node-info panel in the DOM.
 */
function initMap() {
  var mapSvg = document.querySelector('.map-container svg');
  if (!mapSvg) return;

  var markerGroup = mapSvg.querySelector('#node-markers');
  var lineGroup = mapSvg.querySelector('#connection-lines');
  var infoPanel = document.querySelector('.node-info');

  if (!markerGroup || !lineGroup) return;

  // Render
  renderConnections(lineGroup);
  renderNodeMarkers(markerGroup);

  // Update stats
  updateMapStats();

  // Interaction: click/focus on node markers
  markerGroup.addEventListener('click', function(e) {
    var marker = e.target.closest('.node-marker');
    if (!marker) return;
    handleNodeSelect(marker, infoPanel, lineGroup);
  });

  markerGroup.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var marker = e.target.closest('.node-marker');
    if (!marker) return;
    e.preventDefault();
    handleNodeSelect(marker, infoPanel, lineGroup);
  });

  // Click outside to close
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.node-marker') && !e.target.closest('.node-info')) {
      if (infoPanel) hideNodeInfo(infoPanel);
      highlightConnections('', lineGroup, false);
      // Reset all lines
      lineGroup.querySelectorAll('.connection-line').forEach(function(l) {
        l.setAttribute('stroke-opacity', '0.35');
        l.setAttribute('stroke-width', '1.5');
      });
    }
  });
}

/**
 * Handles node selection (click/enter).
 */
function handleNodeSelect(marker, infoPanel, lineGroup) {
  var nodeId = marker.getAttribute('data-node-id');
  var node = findNodeById(nodeId);
  if (!node || !infoPanel) return;

  // Reset all connections first
  lineGroup.querySelectorAll('.connection-line').forEach(function(l) {
    l.setAttribute('stroke-opacity', '0.35');
    l.setAttribute('stroke-width', '1.5');
  });

  showNodeInfo(node, infoPanel);
  highlightConnections(nodeId, lineGroup, true);
}

/**
 * Updates the stats section with computed data.
 */
function updateMapStats() {
  var totalEl = document.getElementById('stat-total');
  var activeEl = document.getElementById('stat-active');
  var bereikEl = document.getElementById('stat-bereik');

  if (totalEl) totalEl.textContent = NODES.length;

  if (activeEl) {
    var active = NODES.filter(function(n) {
      return n.status === NODE_STATUS.ACTIVE;
    }).length;
    activeEl.textContent = active;
  }

  if (bereikEl) {
    // Estimate: each node covers bereik km radius, rough coverage
    var totalBereik = NODES.reduce(function(sum, n) {
      return sum + (n.bereik || 8);
    }, 0);
    bereikEl.textContent = '~' + totalBereik;
  }
}
