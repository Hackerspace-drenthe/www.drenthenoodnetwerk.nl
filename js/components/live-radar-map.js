/**
 * Live Radar Map — Fetches repeaters, companions, and proven links from
 * mc-radar.woodwar.com and renders them on a Leaflet map with range circles.
 */

(function () {
  'use strict';

  var API_BASE = 'https://mc-radar.woodwar.com/api';
  var ENDPOINTS = {
    repeaters: API_BASE + '/nodes/repeaters',
    companions: API_BASE + '/nodes/companions',
    links: API_BASE + '/proven-links'
  };

  // Drenthe bounding box (with some padding for links that cross borders)
  var BOUNDS = {
    latMin: 52.25,
    latMax: 53.25,
    lonMin: 5.9,
    lonMax: 7.15
  };

  var MAP_CENTER = [52.75, 6.55];
  var MAP_ZOOM = 10;

  // Freshness threshold: nodes seen in last 24h are "active"
  var FRESH_HOURS = 24;

  var map, layerRepeaters, layerCompanions, layerLinks, layerRange;

  function isInBounds(lat, lon) {
    return lat >= BOUNDS.latMin && lat <= BOUNDS.latMax &&
           lon >= BOUNDS.lonMin && lon <= BOUNDS.lonMax;
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
    layerRange = L.layerGroup().addTo(map);
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

    loadData();
  }

  function loadData() {
    var statusEl = document.getElementById('radar-status');
    if (statusEl) statusEl.textContent = 'Data laden van mc-radar…';

    Promise.all([
      fetchJSON(ENDPOINTS.repeaters),
      fetchJSON(ENDPOINTS.companions),
      fetchJSON(ENDPOINTS.links)
    ]).then(function (results) {
      var repeaters = results[0];
      var companions = results[1];
      var links = results[2];

      // Filter to Drenthe area
      var drentheRepeaters = repeaters.filter(function (n) {
        return n.location && isInBounds(n.location.latitude, n.location.longitude);
      });
      var drentheCompanions = companions.filter(function (n) {
        return n.location && isInBounds(n.location.latitude, n.location.longitude);
      });

      // Build a set of Drenthe node keys for link filtering
      var drentheKeys = {};
      drentheRepeaters.concat(drentheCompanions).forEach(function (n) {
        drentheKeys[n.public_key] = true;
      });

      var drentheLinks = links.filter(function (l) {
        return drentheKeys[l.node_a] || drentheKeys[l.node_b];
      });

      var ranges = computeRanges(drentheLinks);

      renderRepeaters(drentheRepeaters, ranges);
      renderCompanions(drentheCompanions, ranges);
      renderLinks(drentheLinks);
      renderRangeCircles(drentheRepeaters, ranges);

      if (statusEl) {
        statusEl.textContent = drentheRepeaters.length + ' repeaters, ' +
          drentheCompanions.length + ' companions, ' +
          drentheLinks.length + ' bewezen links';
      }

      // Stats
      updateStats(drentheRepeaters, drentheCompanions, drentheLinks);

    }).catch(function (err) {
      console.error('Radar map error:', err);
      if (statusEl) statusEl.textContent = 'Fout bij laden — probeer het later opnieuw.';
    });
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
