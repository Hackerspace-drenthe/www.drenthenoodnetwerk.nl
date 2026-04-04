/**
 * Mesh Simulator — Interactive SVG that lets users send a message
 * through a mini mesh network and watch it hop from node to node.
 * Educational: shows mesh routing, hop count, and path selection.
 */

/**
 * Simulator node definitions.
 * @type {Array<{id: string, x: number, y: number, label: string, connections: string[]}>}
 */
var SIM_NODES = [
  { id: 'A', x: 60,  y: 140, label: 'Jouw\nnode',       connections: ['B', 'C'] },
  { id: 'B', x: 200, y: 60,  label: 'Buren-\nnode',      connections: ['A', 'D', 'E'] },
  { id: 'C', x: 200, y: 220, label: 'Park-\nnode',       connections: ['A', 'D', 'F'] },
  { id: 'D', x: 360, y: 140, label: 'Kerk-\ntoren',      connections: ['B', 'C', 'E', 'F'] },
  { id: 'E', x: 500, y: 60,  label: 'School-\nnode',     connections: ['B', 'D', 'G'] },
  { id: 'F', x: 500, y: 220, label: 'Boerderij-\nnode',  connections: ['C', 'D', 'G'] },
  { id: 'G', x: 640, y: 140, label: 'Bestem-\nming',     connections: ['E', 'F'] },
];

/**
 * Finds shortest path using BFS between two simulator nodes.
 * @param {string} startId
 * @param {string} endId
 * @returns {string[]} Array of node IDs in order
 */
function simFindPath(startId, endId) {
  var queue = [[startId]];
  var visited = {};
  visited[startId] = true;

  while (queue.length > 0) {
    var path = queue.shift();
    var current = path[path.length - 1];

    if (current === endId) return path;

    var node = SIM_NODES.find(function(n) { return n.id === current; });
    if (!node) continue;

    for (var i = 0; i < node.connections.length; i++) {
      var neighbor = node.connections[i];
      if (!visited[neighbor]) {
        visited[neighbor] = true;
        queue.push(path.concat(neighbor));
      }
    }
  }
  return [];
}

/**
 * Creates SVG namespace element.
 * @param {string} tag
 * @param {Object} attrs
 * @returns {SVGElement}
 */
function simSvgEl(tag, attrs) {
  var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
  return el;
}

/**
 * Initializes the mesh simulator if the container exists.
 */
function initMeshSimulator() {
  var container = document.getElementById('mesh-simulator');
  if (!container) return;

  var svg = container.querySelector('svg');
  if (!svg) return;

  var statusEl = container.querySelector('.sim-status');
  var hopCountEl = container.querySelector('.sim-hop-count');
  var resetBtn = container.querySelector('.sim-reset');
  var selectedStart = null;
  var animating = false;

  // Draw connections
  var lineGroup = simSvgEl('g', { 'class': 'sim-lines' });
  var drawn = {};
  SIM_NODES.forEach(function(node) {
    node.connections.forEach(function(targetId) {
      var key = [node.id, targetId].sort().join('-');
      if (drawn[key]) return;
      drawn[key] = true;
      var target = SIM_NODES.find(function(n) { return n.id === targetId; });
      if (!target) return;
      var line = simSvgEl('line', {
        x1: node.x, y1: node.y,
        x2: target.x, y2: target.y,
        stroke: 'var(--color-border)',
        'stroke-width': '2',
        'data-from': node.id,
        'data-to': target.id,
        'class': 'sim-line',
      });
      lineGroup.appendChild(line);
    });
  });
  svg.insertBefore(lineGroup, svg.firstChild);

  // Draw nodes
  var nodeGroup = simSvgEl('g', { 'class': 'sim-nodes' });
  SIM_NODES.forEach(function(node) {
    var g = simSvgEl('g', {
      'class': 'sim-node',
      'data-id': node.id,
      'role': 'button',
      'tabindex': '0',
      'aria-label': 'Node ' + node.id + ': ' + node.label.replace('\n', ' '),
      'cursor': 'pointer',
    });

    // Hit area
    g.appendChild(simSvgEl('circle', {
      cx: node.x, cy: node.y, r: '28',
      fill: 'transparent', 'class': 'sim-node__hit',
    }));

    // Outer ring
    g.appendChild(simSvgEl('circle', {
      cx: node.x, cy: node.y, r: '20',
      fill: 'var(--color-bg-alt)',
      stroke: 'var(--color-primary)',
      'stroke-width': '2',
      'class': 'sim-node__ring',
    }));

    // Inner dot
    g.appendChild(simSvgEl('circle', {
      cx: node.x, cy: node.y, r: '8',
      fill: 'var(--color-primary)',
      'class': 'sim-node__dot',
    }));

    // Label
    var labelLines = node.label.split('\n');
    var text = simSvgEl('text', {
      x: node.x, y: node.y + 32,
      'text-anchor': 'middle',
      fill: 'var(--color-text)',
      'font-size': '11',
      'class': 'sim-node__label',
    });
    labelLines.forEach(function(line, i) {
      var tspan = simSvgEl('tspan', {
        x: node.x, dy: i === 0 ? '0' : '13',
      });
      tspan.textContent = line;
      text.appendChild(tspan);
    });
    g.appendChild(text);

    nodeGroup.appendChild(g);
  });
  svg.appendChild(nodeGroup);

  /**
   * Resets all visual states.
   */
  function resetSim() {
    selectedStart = null;
    animating = false;
    svg.querySelectorAll('.sim-node__ring').forEach(function(ring) {
      ring.setAttribute('stroke', 'var(--color-primary)');
      ring.setAttribute('fill', 'var(--color-bg-alt)');
    });
    svg.querySelectorAll('.sim-node__dot').forEach(function(dot) {
      dot.setAttribute('fill', 'var(--color-primary)');
    });
    svg.querySelectorAll('.sim-line').forEach(function(line) {
      line.setAttribute('stroke', 'var(--color-border)');
      line.setAttribute('stroke-width', '2');
    });
    var packet = svg.querySelector('.sim-packet');
    if (packet) packet.remove();

    if (statusEl) statusEl.textContent = 'Klik op twee nodes om een bericht te sturen.';
    if (hopCountEl) hopCountEl.textContent = '';
  }

  /**
   * Highlights a node as selected.
   * @param {string} nodeId
   * @param {string} color
   */
  function highlightNode(nodeId, color) {
    var g = svg.querySelector('.sim-node[data-id="' + nodeId + '"]');
    if (!g) return;
    g.querySelector('.sim-node__ring').setAttribute('stroke', color);
    g.querySelector('.sim-node__dot').setAttribute('fill', color);
  }

  /**
   * Animates a packet along a path of node IDs.
   * @param {string[]} path
   * @param {Function} onDone
   */
  function animatePath(path, onDone) {
    if (path.length < 2) { onDone(); return; }

    var packet = simSvgEl('circle', {
      r: '6',
      fill: 'var(--color-accent)',
      'class': 'sim-packet',
    });
    svg.appendChild(packet);

    var step = 0;
    var totalSteps = path.length - 1;

    function animateStep() {
      if (step >= totalSteps) {
        packet.remove();
        onDone();
        return;
      }
      var fromNode = SIM_NODES.find(function(n) { return n.id === path[step]; });
      var toNode = SIM_NODES.find(function(n) { return n.id === path[step + 1]; });

      // Highlight the connection line
      var lineKey1 = path[step] + '-' + path[step + 1];
      var lineKey2 = path[step + 1] + '-' + path[step];
      svg.querySelectorAll('.sim-line').forEach(function(line) {
        var from = line.getAttribute('data-from');
        var to = line.getAttribute('data-to');
        if ((from + '-' + to === lineKey1) || (from + '-' + to === lineKey2)) {
          line.setAttribute('stroke', 'var(--color-accent)');
          line.setAttribute('stroke-width', '3');
        }
      });

      // Highlight the receiving node
      highlightNode(path[step + 1], 'var(--color-accent)');

      // Animate packet movement
      var frames = 40;
      var frame = 0;
      var startX = fromNode.x;
      var startY = fromNode.y;
      var endX = toNode.x;
      var endY = toNode.y;

      function tick() {
        frame++;
        var t = frame / frames;
        // Ease in-out
        t = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        packet.setAttribute('cx', startX + (endX - startX) * t);
        packet.setAttribute('cy', startY + (endY - startY) * t);

        if (frame < frames) {
          requestAnimationFrame(tick);
        } else {
          step++;
          if (statusEl && step < totalSteps) {
            statusEl.textContent = 'Hop ' + step + ': bericht aangekomen bij ' + path[step] + ', doorsturen…';
          }
          setTimeout(animateStep, 400);
        }
      }

      packet.setAttribute('cx', startX);
      packet.setAttribute('cy', startY);
      requestAnimationFrame(tick);
    }

    animateStep();
  }

  /**
   * Handles clicking a node.
   * @param {string} nodeId
   */
  function onNodeClick(nodeId) {
    if (animating) return;

    if (!selectedStart) {
      selectedStart = nodeId;
      highlightNode(nodeId, 'var(--color-signal)');
      if (statusEl) statusEl.textContent = 'Startnode: ' + nodeId + '. Klik nu op de bestemmingsnode.';
      return;
    }

    if (nodeId === selectedStart) return;

    animating = true;
    highlightNode(nodeId, 'var(--color-node)');
    var path = simFindPath(selectedStart, nodeId);

    if (path.length === 0) {
      if (statusEl) statusEl.textContent = 'Geen route gevonden!';
      animating = false;
      return;
    }

    var hops = path.length - 1;
    if (hopCountEl) hopCountEl.textContent = hops + ' hop' + (hops > 1 ? 's' : '') + ' · Route: ' + path.join(' → ');
    if (statusEl) statusEl.textContent = 'Bericht onderweg van ' + path[0] + ' naar ' + path[path.length - 1] + '…';

    animatePath(path, function() {
      if (statusEl) statusEl.textContent = 'Bericht afgeleverd! ' + hops + ' hop' + (hops > 1 ? 's' : '') + ' via ' + path.join(' → ');
      animating = false;
    });
  }

  // Event delegation for nodes
  nodeGroup.addEventListener('click', function(e) {
    var g = e.target.closest('.sim-node');
    if (g) onNodeClick(g.getAttribute('data-id'));
  });
  nodeGroup.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      var g = e.target.closest('.sim-node');
      if (g) {
        e.preventDefault();
        onNodeClick(g.getAttribute('data-id'));
      }
    }
  });

  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', resetSim);
  }

  resetSim();
}
