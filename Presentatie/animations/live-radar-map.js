// live-radar-map.js — Embeds the actual mc-radar Leaflet map as a presentation animation.
// Used by slides 14 (drenthe-dekking) and 15 (bereik-in-kaart).

const DATA_BASE = '../data/mc-radar';
const ENDPOINTS = {
  repeaters: DATA_BASE + '/repeaters.json',
  companions: DATA_BASE + '/companions.json',
  links: DATA_BASE + '/links.json'
};

const MAP_CENTER = [52.72, 6.75];
const MAP_ZOOM = 10;
const FRESH_HOURS = 24;

const DRENTHE_POLY = [
  [53.18, 6.15], [53.17, 6.25], [53.13, 6.35], [53.10, 6.47],
  [53.12, 6.58], [53.10, 6.70], [53.07, 6.80], [53.00, 6.87],
  [52.95, 6.92], [52.90, 6.95], [52.85, 6.97], [52.80, 7.00],
  [52.75, 7.05], [52.70, 7.09], [52.65, 7.09], [52.60, 7.05],
  [52.55, 6.99], [52.50, 6.90], [52.48, 6.83], [52.47, 6.73],
  [52.45, 6.65], [52.42, 6.55], [52.40, 6.45], [52.40, 6.35],
  [52.42, 6.25], [52.45, 6.18], [52.50, 6.10], [52.55, 6.07],
  [52.60, 6.08], [52.65, 6.10], [52.70, 6.10], [52.75, 6.08],
  [52.80, 6.07], [52.85, 6.10], [52.90, 6.12], [52.95, 6.10],
  [53.00, 6.10], [53.05, 6.12], [53.10, 6.10], [53.15, 6.12],
  [53.18, 6.15]
];

function inDrenthe(lat, lon) {
  let inside = false;
  for (let i = 0, j = DRENTHE_POLY.length - 1; i < DRENTHE_POLY.length; j = i++) {
    const yi = DRENTHE_POLY[i][0], xi = DRENTHE_POLY[i][1];
    const yj = DRENTHE_POLY[j][0], xj = DRENTHE_POLY[j][1];
    if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

function isFresh(lastSeen) {
  if (!lastSeen) return false;
  return (Date.now() - new Date(lastSeen).getTime()) < FRESH_HOURS * 3600 * 1000;
}

function escapeHtml(str) {
  const el = document.createElement('span');
  el.textContent = str || '';
  return el.innerHTML;
}

function hoursAgo(lastSeen) {
  if (!lastSeen) return '?';
  const h = Math.round((Date.now() - new Date(lastSeen).getTime()) / 3600000);
  if (h < 1) return '<1 uur';
  if (h < 24) return h + ' uur';
  const d = Math.round(h / 24);
  return d + (d === 1 ? ' dag' : ' dagen');
}

function computeRanges(links) {
  const ranges = {};
  links.forEach(link => {
    const d = link.distance_km || 0;
    if (d <= 0) return;
    if (!ranges[link.node_a] || d > ranges[link.node_a]) ranges[link.node_a] = d;
    if (!ranges[link.node_b] || d > ranges[link.node_b]) ranges[link.node_b] = d;
  });
  return ranges;
}

async function loadLeaflet() {
  if (window.L) return;
  // CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
  // JS
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function init(container, options = {}) {
  let destroyed = false;
  let completeCallback = null;
  let map = null;
  let layerRepeaters, layerCompanions, layerLinks, layerRange;
  const showRange = options.showRange || false;
  const showLinks = options.showLinks !== false; // default true

  // Create map container
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'width:100%;height:100%;min-height:300px;border-radius:12px;overflow:hidden;opacity:0;transition:opacity .6s ease;';
  container.appendChild(wrapper);

  let ready = false;

  // Boot the map
  loadLeaflet().then(() => {
    if (destroyed) return;
    map = L.map(wrapper, {
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 18
    }).addTo(map);

    // Province outline
    L.polyline(DRENTHE_POLY, {
      color: '#74c69d', weight: 2, opacity: 0.4, dashArray: '6,4', interactive: false
    }).addTo(map);

    layerRange = L.layerGroup();
    layerLinks = L.layerGroup().addTo(map);
    layerRepeaters = L.layerGroup().addTo(map);
    layerCompanions = L.layerGroup().addTo(map);

    if (showRange) layerRange.addTo(map);

    // Load data
    return Promise.all([
      fetch(ENDPOINTS.repeaters).then(r => r.json()),
      fetch(ENDPOINTS.companions).then(r => r.json()),
      fetch(ENDPOINTS.links).then(r => r.json())
    ]);
  }).then(([repeaters, companions, links]) => {
    if (destroyed) return;

    const filteredRepeaters = repeaters.filter(n => n.location && inDrenthe(n.location.latitude, n.location.longitude));
    const filteredCompanions = companions.filter(n => n.location && inDrenthe(n.location.latitude, n.location.longitude));

    const nodeKeys = {};
    filteredRepeaters.concat(filteredCompanions).forEach(n => { nodeKeys[n.public_key] = true; });
    const filteredLinks = links.filter(l => nodeKeys[l.node_a] || nodeKeys[l.node_b]);
    const ranges = computeRanges(filteredLinks);

    // Repeaters
    filteredRepeaters.forEach(node => {
      const fresh = isFresh(node.last_seen);
      const rangeKm = ranges[node.public_key] || null;
      const m = L.circleMarker([node.location.latitude, node.location.longitude], {
        radius: fresh ? 7 : 5,
        fillColor: fresh ? '#74c69d' : '#555',
        color: fresh ? '#95d5b2' : '#777',
        weight: 2, opacity: 0.9, fillOpacity: fresh ? 0.85 : 0.5
      });
      let popup = `<strong>${escapeHtml(node.name)}</strong><br>Repeater`;
      if (rangeKm) popup += `<br>Bereik: ${rangeKm.toFixed(1)} km`;
      m.bindPopup(popup);
      m.addTo(layerRepeaters);
    });

    // Companions
    filteredCompanions.forEach(node => {
      const fresh = isFresh(node.last_seen);
      const m = L.circleMarker([node.location.latitude, node.location.longitude], {
        radius: fresh ? 6 : 4,
        fillColor: fresh ? '#48cae4' : '#444',
        color: fresh ? '#90e0ef' : '#666',
        weight: 2, opacity: 0.8, fillOpacity: fresh ? 0.7 : 0.4
      });
      m.bindPopup(`<strong>${escapeHtml(node.name)}</strong><br>Companion`);
      m.addTo(layerCompanions);
    });

    // Links
    if (showLinks) {
      filteredLinks.forEach(link => {
        if (!link.node_a_location || !link.node_b_location) return;
        const confidence = link.confidence || 0;
        const opacity = 0.15 + (confidence / 100) * 0.55;
        const weight = link.distance_km > 10 ? 2.5 : 1.5;
        const color = link.distance_km > 15 ? '#f4a261' : link.distance_km > 5 ? '#48cae4' : '#74c69d';
        const line = L.polyline([
          [link.node_a_location.latitude, link.node_a_location.longitude],
          [link.node_b_location.latitude, link.node_b_location.longitude]
        ], { color, weight, opacity, dashArray: confidence < 50 ? '6,4' : null });
        line.bindPopup(
          `<strong>${escapeHtml(link.node_a_name)}</strong> ↔ <strong>${escapeHtml(link.node_b_name)}</strong><br>` +
          `${(link.distance_km || 0).toFixed(1)} km — ${confidence}%`
        );
        line.addTo(layerLinks);
      });
    }

    // Range circles
    filteredRepeaters.forEach(node => {
      const rangeKm = ranges[node.public_key];
      if (!rangeKm || rangeKm < 0.5 || !isFresh(node.last_seen)) return;
      L.circle([node.location.latitude, node.location.longitude], {
        radius: rangeKm * 1000,
        fillColor: '#74c69d', fillOpacity: 0.03,
        color: '#74c69d', weight: 1, opacity: 0.12, interactive: false
      }).addTo(layerRange);
    });

    ready = true;
  }).catch(err => {
    console.warn('live-radar-map animation: load failed', err);
  });

  return {
    play() {
      if (destroyed) return;
      wrapper.style.opacity = '1';
      // Leaflet needs a size recalc after becoming visible
      setTimeout(() => { if (map) map.invalidateSize(); }, 100);
      // Auto-complete after a short pause so presenter can advance
      setTimeout(() => { if (completeCallback && !destroyed) completeCallback(); }, 1000);
    },
    pause() {},
    reset() {
      wrapper.style.opacity = '0';
    },
    destroy() {
      destroyed = true;
      if (map) { map.remove(); map = null; }
      wrapper.remove();
    },
    onComplete(cb) { completeCallback = cb; }
  };
}
