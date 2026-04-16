// drenthe-coverage.js — A3: Drenthe dekkingskaart
// SVG kaart van Drenthe met nodes en dekkingscirkels.
// Modi: topology (mc-radar snapshot), huidig (met bereik-cirkels), vol (toekomst), leeg (fallback).

const NS = 'http://www.w3.org/2000/svg';

// Simplified Drenthe province outline (approximate SVG path)
const DRENTHE_PATH = 'M 180,40 L 220,30 260,35 310,25 350,40 380,60 400,100 410,140 420,190 415,240 400,280 390,320 380,350 360,370 330,380 290,390 250,395 210,390 180,380 155,360 140,330 130,290 125,250 120,210 125,170 135,130 150,90 165,60 Z';

// Map lat/lon to SVG coordinates within the Drenthe outline
// Drenthe bounding box: lat 52.35-53.15, lon 6.15-7.10
function geoToSvg(lat, lon) {
  const x = 120 + ((lon - 6.15) / (7.10 - 6.15)) * 300;
  const y = 390 - ((lat - 52.35) / (53.15 - 52.35)) * 370;
  return { x, y };
}

// Placeholder nodes for 'vol' mode (toekomstvisie)
const FULL_NODES = [
  { lat: 52.78, lon: 6.90, label: 'Emmen' },
  { lat: 52.66, lon: 6.74, label: 'Coevorden' },
  { lat: 52.72, lon: 6.48, label: 'Hoogeveen' },
  { lat: 52.99, lon: 6.56, label: 'Assen' },
  { lat: 52.84, lon: 6.51, label: 'Beilen' },
  { lat: 53.07, lon: 6.66, label: 'Gieten' },
  { lat: 52.93, lon: 6.35, label: 'Westerbork' },
  { lat: 52.76, lon: 6.69, label: 'Sleen' },
  { lat: 53.10, lon: 6.45, label: 'Roden' },
  { lat: 52.63, lon: 6.50, label: 'Dedemsvaart' },
  { lat: 52.88, lon: 6.96, label: 'Borger' },
  { lat: 52.95, lon: 6.75, label: 'Gasselte' },
  { lat: 53.05, lon: 6.25, label: 'Norg' },
  { lat: 52.70, lon: 6.95, label: 'Schoonebeek' },
  { lat: 52.85, lon: 6.27, label: 'Meppel' }
];

export function init(container, options = {}) {
  const mode = options.mode || 'topology';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let destroyed = false;
  let completeCallback = null;
  let timeouts = [];
  let topologyData = null;

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 540 430');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.cssText = 'max-width: 540px; max-height: 430px;';
  container.appendChild(svg);

  // Province outline
  const outline = document.createElementNS(NS, 'path');
  outline.setAttribute('d', DRENTHE_PATH);
  outline.setAttribute('fill', 'var(--color-bg-alt, #22223a)');
  outline.setAttribute('stroke', 'var(--color-border, #3a3a50)');
  outline.setAttribute('stroke-width', '2');
  svg.appendChild(outline);

  // Province label
  const provinceLabel = document.createElementNS(NS, 'text');
  provinceLabel.setAttribute('x', '270');
  provinceLabel.setAttribute('y', '420');
  provinceLabel.setAttribute('text-anchor', 'middle');
  provinceLabel.setAttribute('fill', 'var(--color-text-muted, #a0a0a0)');
  provinceLabel.setAttribute('font-size', '14');
  provinceLabel.setAttribute('font-family', 'var(--font-body, sans-serif)');
  provinceLabel.textContent = 'Drenthe';
  svg.appendChild(provinceLabel);

  // Groups for dynamic elements
  const linksGroup = document.createElementNS(NS, 'g');
  const circlesGroup = document.createElementNS(NS, 'g');
  const nodesGroup = document.createElementNS(NS, 'g');
  svg.appendChild(linksGroup);
  svg.appendChild(circlesGroup);
  svg.appendChild(nodesGroup);

  function schedule(fn, delay) {
    const id = setTimeout(() => { if (!destroyed) fn(); }, reducedMotion ? 0 : delay);
    timeouts.push(id);
  }

  function addNode(pos, label, status, delay, showCircle) {
    schedule(() => {
      // Coverage circle
      if (showCircle) {
        const circle = document.createElementNS(NS, 'circle');
        circle.setAttribute('cx', pos.x);
        circle.setAttribute('cy', pos.y);
        circle.setAttribute('r', '0');
        circle.setAttribute('fill', 'var(--color-primary, #74c69d)');
        circle.setAttribute('fill-opacity', '0.12');
        circle.setAttribute('stroke', 'var(--color-primary, #74c69d)');
        circle.setAttribute('stroke-width', '1');
        circle.setAttribute('stroke-opacity', '0.3');
        circlesGroup.appendChild(circle);

        // Animate radius
        const targetR = 45;
        if (reducedMotion) {
          circle.setAttribute('r', targetR);
        } else {
          const start = performance.now();
          function grow(now) {
            if (destroyed) return;
            const t = Math.min((now - start) / 600, 1);
            circle.setAttribute('r', targetR * t);
            if (t < 1) requestAnimationFrame(grow);
          }
          requestAnimationFrame(grow);
        }
      }

      // Node dot
      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', pos.x);
      dot.setAttribute('cy', pos.y);
      dot.setAttribute('r', '6');
      dot.setAttribute('fill', status === 'offline'
        ? 'var(--color-text-muted, #a0a0a0)'
        : 'var(--color-neon-green, #39ff14)');
      dot.setAttribute('stroke', 'var(--color-bg, #1a1a2e)');
      dot.setAttribute('stroke-width', '2');
      nodesGroup.appendChild(dot);

      // Label
      const text = document.createElementNS(NS, 'text');
      text.setAttribute('x', pos.x);
      text.setAttribute('y', pos.y - 14);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'var(--color-text, #e0e0e0)');
      text.setAttribute('font-size', '11');
      text.setAttribute('font-family', 'var(--font-body, sans-serif)');
      text.textContent = label;
      nodesGroup.appendChild(text);
    }, delay);
  }

  function addLink(from, to, delay) {
    schedule(() => {
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', from.x);
      line.setAttribute('y1', from.y);
      line.setAttribute('x2', to.x);
      line.setAttribute('y2', to.y);
      line.setAttribute('stroke', 'var(--color-primary, #74c69d)');
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('stroke-opacity', '0.5');
      line.setAttribute('stroke-dasharray', '4 3');
      linksGroup.appendChild(line);
    }, delay);
  }

  function clearDynamic() {
    linksGroup.innerHTML = '';
    circlesGroup.innerHTML = '';
    nodesGroup.innerHTML = '';
  }

  async function loadTopology() {
    try {
      const resp = await fetch('data/mesh-topology.json');
      if (resp.ok) topologyData = await resp.json();
    } catch { /* fallback to empty */ }
  }

  function renderTopology() {
    if (!topologyData || !topologyData.nodes) return renderEmpty();
    const showCircles = (mode === 'huidig');
    const nodeMap = {};

    topologyData.nodes.forEach((n, i) => {
      const pos = geoToSvg(n.lat, n.lon);
      nodeMap[n.id] = pos;
      addNode(pos, n.label, n.status, i * 300, showCircles);
    });

    if (topologyData.links) {
      topologyData.links.forEach((l, i) => {
        const from = nodeMap[l.from];
        const to = nodeMap[l.to];
        if (from && to) {
          addLink(from, to, i * 200 + topologyData.nodes.length * 300);
        }
      });
    }

    const totalDelay = (topologyData.nodes.length * 300) +
      ((topologyData.links?.length || 0) * 200) + 500;
    schedule(() => { if (completeCallback) completeCallback(); }, totalDelay);
  }

  function renderFull() {
    FULL_NODES.forEach((n, i) => {
      const pos = geoToSvg(n.lat, n.lon);
      addNode(pos, n.label, 'online', i * 200, true);
    });

    // Connect nearby nodes
    for (let i = 0; i < FULL_NODES.length; i++) {
      for (let j = i + 1; j < FULL_NODES.length; j++) {
        const dx = FULL_NODES[i].lat - FULL_NODES[j].lat;
        const dy = FULL_NODES[i].lon - FULL_NODES[j].lon;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.18) {
          const from = geoToSvg(FULL_NODES[i].lat, FULL_NODES[i].lon);
          const to = geoToSvg(FULL_NODES[j].lat, FULL_NODES[j].lon);
          addLink(from, to, (i + j) * 100 + FULL_NODES.length * 200);
        }
      }
    }

    const totalDelay = FULL_NODES.length * 200 + 2000;
    schedule(() => { if (completeCallback) completeCallback(); }, totalDelay);
  }

  function renderEmpty() {
    // Just the outline, no nodes
    schedule(() => { if (completeCallback) completeCallback(); }, 500);
  }

  return {
    async play() {
      if (destroyed) return;
      clearDynamic();

      if (mode === 'topology' || mode === 'huidig') {
        await loadTopology();
        renderTopology();
      } else if (mode === 'vol') {
        renderFull();
      } else {
        renderEmpty();
      }
    },

    pause() {},

    reset() {
      timeouts.forEach(clearTimeout);
      timeouts = [];
      clearDynamic();
    },

    destroy() {
      destroyed = true;
      this.reset();
      svg.remove();
    },

    onComplete(cb) { completeCallback = cb; }
  };
}
