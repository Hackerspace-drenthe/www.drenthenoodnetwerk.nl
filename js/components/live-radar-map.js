/**
 * Live Radar Map — Loads repeaters, companions, and proven links from
 * locally cached mc-radar data (synced via GitHub Actions) and renders
 * them on a Leaflet map with range circles.
 */

(function () {
  'use strict';

  // Local cached copies (synced every 15 min by .github/workflows/sync-radar-data.yml)
  var DATA_BASE = 'data/mc-radar';
  var ENDPOINTS = {
    repeaters: DATA_BASE + '/repeaters.json',
    companions: DATA_BASE + '/companions.json',
    links: DATA_BASE + '/links.json',
    lastSync: DATA_BASE + '/last-sync.txt'
  };

  var MAP_CENTER = [52.72, 6.75];
  var MAP_ZOOM = 11;

  // Freshness threshold: nodes seen in last 24h are "active"
  var FRESH_HOURS = 24;

  var map, layerRepeaters, layerCompanions, layerLinks, layerRange;
  var drentheOnly = true; // filter active by default
  var rawData = null;     // stored after fetch for re-render on filter toggle

  // Simplified Drenthe province boundary polygon (lat/lon pairs)
  var DRENTHE_POLY = [
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

  /**
   * Ray-casting point-in-polygon test.
   */
  function inDrenthe(lat, lon) {
    var inside = false;
    for (var i = 0, j = DRENTHE_POLY.length - 1; i < DRENTHE_POLY.length; j = i++) {
      var yi = DRENTHE_POLY[i][0], xi = DRENTHE_POLY[i][1];
      var yj = DRENTHE_POLY[j][0], xj = DRENTHE_POLY[j][1];
      if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  function isFresh(lastSeen) {
    if (!lastSeen) return false;
    var diff = Date.now() - new Date(lastSeen).getTime();
    return diff < FRESH_HOURS * 3600 * 1000;
  }

  function hoursAgo(lastSeen) {
    if (!lastSeen) return '?';
    var h = Math.round((Date.now() - new Date(lastSeen).getTime()) / 3600000);
    if (h < 1) return '<1 uur geleden';
    if (h < 24) return h + ' uur geleden';
    var d = Math.round(h / 24);
    return d + (d === 1 ? ' dag' : ' dagen') + ' geleden';
  }

  function fetchJSON(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  /**
   * For each node, compute max proven link distance as its real-world range.
   * Returns a Map of public_key → max_distance_km.
   */
  function computeRanges(links) {
    var ranges = {};
    links.forEach(function (link) {
      var d = link.distance_km || 0;
      if (d <= 0) return;
      if (!ranges[link.node_a] || d > ranges[link.node_a]) {
        ranges[link.node_a] = d;
      }
      if (!ranges[link.node_b] || d > ranges[link.node_b]) {
        ranges[link.node_b] = d;
      }
    });
    return ranges;
  }

  function createNodePopup(node, type, rangeKm) {
    var fresh = isFresh(node.last_seen);
    var status = fresh ? '<span style="color:#4caf50">● Online</span>' : '<span style="color:#ff9800">● Offline</span>';
    var html = '<div class="radar-popup">' +
      '<strong>' + escapeHtml(node.name) + '</strong><br>' +
      '<span class="radar-popup__type">' + type + '</span> ' + status + '<br>' +
      '<small>Gezien: ' + hoursAgo(node.last_seen) + '</small>';
    if (rangeKm) {
      html += '<br><small>Bewezen bereik: <strong>' + rangeKm.toFixed(1) + ' km</strong></small>';
    }
    if (node.node_weight > 0) {
      html += '<br><small>Gewicht: ' + node.node_weight.toFixed(0) + '</small>';
    }
    html += '</div>';
    return html;
  }

  function escapeHtml(str) {
    var el = document.createElement('span');
    el.textContent = str || '';
    return el.innerHTML;
  }

  function initMap(containerId) {
    var container = document.getElementById(containerId);
    if (!container || typeof L === 'undefined') return;

    map = L.map(containerId, {
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      zoomControl: true,
      attributionControl: true
    });

    // Dark tile layer matching site theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a> | Data: <a href="https://mc-radar.woodwar.com">mc-radar</a>',
      subdomains: 'abcd',
      maxZoom: 18
    }).addTo(map);

    // Layer groups
    layerRange = L.layerGroup();           // off by default
    layerLinks = L.layerGroup().addTo(map);
    layerRepeaters = L.layerGroup().addTo(map);
    layerCompanions = L.layerGroup().addTo(map);

    // Layer control
    var overlays = {
      'Repeaters': layerRepeaters,
      'Companions': layerCompanions,
      'Bewezen links': layerLinks,
      'Bereik-cirkels': layerRange
    };
    L.control.layers(null, overlays, { collapsed: false, position: 'topright' }).addTo(map);

    // Drenthe province outline
    L.polyline(DRENTHE_POLY, {
      color: '#74c69d',
      weight: 1.5,
      opacity: 0.35,
      dashArray: '6,4',
      interactive: false
    }).addTo(map);

    // Drenthe filter control
    var FilterControl = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: function () {
        var div = L.DomUtil.create('div', 'leaflet-bar radar-filter-control');
        div.innerHTML = '<label><input type="checkbox" id="filter-drenthe"' +
          (drentheOnly ? ' checked' : '') + '> Alleen Drenthe</label>';
        L.DomEvent.disableClickPropagation(div);
        div.querySelector('input').addEventListener('change', function (e) {
          drentheOnly = e.target.checked;
          renderAll();
        });
        return div;
      }
    });
    new FilterControl().addTo(map);

    loadData();
  }

  function loadData() {
    var statusEl = document.getElementById('radar-status');
    if (statusEl) statusEl.textContent = 'Data laden…';

    Promise.all([
      fetchJSON(ENDPOINTS.repeaters),
      fetchJSON(ENDPOINTS.companions),
      fetchJSON(ENDPOINTS.links),
      fetch(ENDPOINTS.lastSync).then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; })
    ]).then(function (results) {
      rawData = {
        repeaters: results[0],
        companions: results[1],
        links: results[2],
        lastSync: (results[3] || '').trim()
      };

      renderAll();

    }).catch(function (err) {
      console.error('Radar map error:', err);
      if (statusEl) statusEl.textContent = 'Fout bij laden — probeer het later opnieuw.';
    });
  }

  function filterNode(node) {
    if (!drentheOnly) return true;
    return node.location && inDrenthe(node.location.latitude, node.location.longitude);
  }

  function filterLink(link, nodeKeys) {
    if (!drentheOnly) return true;
    return nodeKeys[link.node_a] || nodeKeys[link.node_b];
  }

  function renderAll() {
    if (!rawData) return;

    // Clear layers
    layerRepeaters.clearLayers();
    layerCompanions.clearLayers();
    layerLinks.clearLayers();
    layerRange.clearLayers();

    var repeaters = rawData.repeaters.filter(filterNode);
    var companions = rawData.companions.filter(filterNode);

    // Build key set for link filtering
    var nodeKeys = {};
    repeaters.concat(companions).forEach(function (n) { nodeKeys[n.public_key] = true; });

    var links = rawData.links.filter(function (l) { return filterLink(l, nodeKeys); });
    var ranges = computeRanges(links);

    renderRepeaters(repeaters, ranges);
    renderCompanions(companions, ranges);
    renderLinks(links);
    renderRangeCircles(repeaters, ranges);

    var statusEl = document.getElementById('radar-status');
    if (statusEl) {
      var syncInfo = rawData.lastSync ? ' (sync: ' + hoursAgo(rawData.lastSync) + ')' : '';
      var filterInfo = drentheOnly ? ' — Drenthe' : '';
      statusEl.textContent = repeaters.length + ' repeaters, ' +
        companions.length + ' companions, ' +
        links.length + ' bewezen links' + filterInfo + syncInfo;
    }

    updateStats(repeaters, companions, links);
  }

  function renderRepeaters(nodes, ranges) {
    nodes.forEach(function (node) {
      var fresh = isFresh(node.last_seen);
      var rangeKm = ranges[node.public_key] || null;

      var marker = L.circleMarker([node.location.latitude, node.location.longitude], {
        radius: fresh ? 7 : 5,
        fillColor: fresh ? '#74c69d' : '#555',
        color: fresh ? '#95d5b2' : '#777',
        weight: 2,
        opacity: 0.9,
        fillOpacity: fresh ? 0.85 : 0.5
      });

      marker.bindPopup(createNodePopup(node, 'Repeater', rangeKm));
      marker.addTo(layerRepeaters);
    });
  }

  function renderCompanions(nodes, ranges) {
    nodes.forEach(function (node) {
      var fresh = isFresh(node.last_seen);
      var rangeKm = ranges[node.public_key] || null;

      var marker = L.circleMarker([node.location.latitude, node.location.longitude], {
        radius: fresh ? 6 : 4,
        fillColor: fresh ? '#48cae4' : '#444',
        color: fresh ? '#90e0ef' : '#666',
        weight: 2,
        opacity: 0.8,
        fillOpacity: fresh ? 0.7 : 0.4
      });

      marker.bindPopup(createNodePopup(node, 'Companion', rangeKm));
      marker.addTo(layerCompanions);
    });
  }

  function renderLinks(links) {
    links.forEach(function (link) {
      if (!link.node_a_location || !link.node_b_location) return;

      var confidence = link.confidence || 0;
      var opacity = 0.15 + (confidence / 100) * 0.55;
      var weight = link.distance_km > 10 ? 2.5 : 1.5;
      var color = link.distance_km > 15 ? '#f4a261' : link.distance_km > 5 ? '#48cae4' : '#74c69d';

      var line = L.polyline([
        [link.node_a_location.latitude, link.node_a_location.longitude],
        [link.node_b_location.latitude, link.node_b_location.longitude]
      ], {
        color: color,
        weight: weight,
        opacity: opacity,
        dashArray: confidence < 50 ? '6,4' : null
      });

      line.bindPopup(
        '<div class="radar-popup">' +
        '<strong>' + escapeHtml(link.node_a_name) + '</strong> ↔ <strong>' + escapeHtml(link.node_b_name) + '</strong><br>' +
        'Afstand: <strong>' + (link.distance_km || 0).toFixed(1) + ' km</strong><br>' +
        'Betrouwbaarheid: ' + confidence + '%<br>' +
        '<small>Geverifieerd: ' + hoursAgo(link.last_verified) + '</small>' +
        '</div>'
      );

      line.addTo(layerLinks);
    });
  }

  function renderRangeCircles(repeaters, ranges) {
    repeaters.forEach(function (node) {
      var rangeKm = ranges[node.public_key];
      if (!rangeKm || rangeKm < 0.5) return;
      if (!isFresh(node.last_seen)) return;

      L.circle([node.location.latitude, node.location.longitude], {
        radius: rangeKm * 1000,
        fillColor: '#74c69d',
        fillOpacity: 0.06,
        color: '#74c69d',
        weight: 1,
        opacity: 0.25,
        interactive: false
      }).addTo(layerRange);
    });
  }

  function updateStats(repeaters, companions, links) {
    var activeRepeaters = repeaters.filter(function (n) { return isFresh(n.last_seen); }).length;
    var activeCompanions = companions.filter(function (n) { return isFresh(n.last_seen); }).length;

    var maxLink = 0;
    var totalLinkKm = 0;
    links.forEach(function (l) {
      if (l.distance_km > maxLink) maxLink = l.distance_km;
      totalLinkKm += l.distance_km || 0;
    });

    setStatValue('stat-repeaters', repeaters.length + ' (' + activeRepeaters + ' online)');
    setStatValue('stat-companions', companions.length + ' (' + activeCompanions + ' online)');
    setStatValue('stat-links', links.length);
    setStatValue('stat-max-range', maxLink.toFixed(1) + ' km');
  }

  function setStatValue(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // Auto-init when DOM ready
  function boot() {
    var container = document.getElementById('radar-map');
    if (!container) return;
    initMap('radar-map');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
