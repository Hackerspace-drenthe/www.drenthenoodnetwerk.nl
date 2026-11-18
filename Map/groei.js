/**
 * Netwerk Groei — animatie van repeaters die over tijd aan het Meshcore
 * netwerk zijn toegevoegd. Leest data/repeater-timeline.json
 * (gegenereerd met scripts/generate-repeater-timeline.py).
 */

(function () {
  'use strict';

  const DATA_URL = '../data/repeater-timeline.json';
  // Provincie Drenthe in beeld, met nadruk op het zuidoosten
  const MAP_CENTER = [6.65, 52.83];
  const MAP_ZOOM = 9.6;
  const DAYS_PER_SECOND = 8;   // bij snelheid 1×
  const FADE_DAYS = 6;         // fade-in duur van een nieuwe repeater (in dagen)
  const COVERAGE_KM = 5;       // aangenomen bereik per repeater (km)
  const COVERAGE_KM_VRD = 10;  // modelaanname voor VRD-repeaters

  /** Aangenomen bereik in km voor een repeater op basis van de naam. */
  function repRangeKm(name) {
    return name && name.toUpperCase().indexOf('VRD') !== -1 ? COVERAGE_KM_VRD : COVERAGE_KM;
  }

  let map, vectorSource, vectorLayer, coverageSource, coverageLayer;
  let timeline = null;         // geladen JSON
  let dayList = [];            // 'YYYY-MM-DD' per stap
  let radarCounts = [];        // Drentse radartelling per snapshotdag
  let drentheBoundary = [];
  let currentDay = 0;
  let playing = false;
  let lastTick = 0;
  let dayFraction = 0;
  let showGone = true;
  let coveragePct = [];        // dekking van Drenthe (%) per dag

  function inDrenthe(lat, lon) {
    let inside = false;
    for (let i = 1; i < drentheBoundary.length; i++) {
      const [yi, xi] = drentheBoundary[i - 1];
      const [yj, xj] = drentheBoundary[i];
      if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  const el = (id) => document.getElementById(id);

  function dateToDayIndex(dates, start) {
    // Maakt een doorlopende daglijst van start t/m einde
    const out = [];
    const d = new Date(start + 'T00:00:00Z');
    const end = new Date(dates[dates.length - 1] + 'T00:00:00Z');
    while (d <= end) {
      out.push(d.toISOString().slice(0, 10));
      d.setUTCDate(d.getUTCDate() + 1);
    }
    return out;
  }

  function initMap() {
    const baseLayer = new ol.layer.Tile({
      className: 'tiles-dark',
      source: new ol.source.OSM()
    });

    vectorSource = new ol.source.Vector();
    vectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: styleFeature
    });

    coverageSource = new ol.source.Vector();
    coverageLayer = new ol.layer.Vector({
      source: coverageSource,
      style: styleCoverage,
      opacity: 0.55
    });

    map = new ol.Map({
      target: 'groei-map',
      layers: [baseLayer, coverageLayer, vectorLayer],
      view: new ol.View({
        center: ol.proj.fromLonLat(MAP_CENTER),
        zoom: MAP_ZOOM
      })
    });
  }

  // Stijlcache om niet elke frame nieuwe stijlen te maken
  const styleCache = {};

  function makeStyle(radius, fill, stroke, opacity) {
    const key = radius + fill + stroke + opacity;
    if (!styleCache[key]) {
      styleCache[key] = new ol.style.Style({
        image: new ol.style.Circle({
          radius: radius,
          fill: new ol.style.Fill({ color: fill }),
          stroke: new ol.style.Stroke({ color: stroke, width: 1.5 })
        })
      });
    }
    return styleCache[key];
  }

  // Dekkingscirkels: vlakke vulling, zichtbaar zodra de repeater bestaat
  const coverageStyleCache = {};

  function styleCoverage(feature) {
    const day = feature.get('dayIndex');
    const now = currentDay + dayFraction;
    if (day > now) return null; // dekking blijft: eenmaal gezien = gedekt
    const age = now - day;
    const fade = playing ? Math.round(Math.min(age / FADE_DAYS, 1) * 10) / 10 : 1;
    if (fade <= 0) return null;
    if (!coverageStyleCache[fade]) {
      coverageStyleCache[fade] = new ol.style.Style({
        fill: new ol.style.Fill({ color: 'rgba(116, 198, 157, ' + (0.10 * fade) + ')' }),
        stroke: new ol.style.Stroke({ color: 'rgba(116, 198, 157, ' + (0.25 * fade) + ')', width: 1 })
      });
    }
    return coverageStyleCache[fade];
  }

  function styleFeature(feature) {
    const day = feature.get('dayIndex');
    const now = currentDay + dayFraction;
    if (day > now) return null;                 // nog niet toegevoegd
    const lastDay = feature.get('lastDay');

    if (now > lastDay + 1) {
      // Op dit moment in de tijdlijn alweer verdwenen
      if (!showGone) return null;
      return makeStyle(3, 'rgba(120, 120, 135, 0.45)', 'rgba(160, 160, 175, 0.5)', 1);
    }

    const age = now - day;
    // Fade-in tijdens afspelen: opaciteit 0 → vol in FADE_DAYS dagen (gekwantiseerd voor stijlcache)
    const fade = playing ? Math.round(Math.min(age / FADE_DAYS, 1) * 20) / 20 : 1;
    if (fade <= 0) return null;

    // Kleurverloop op ouderdom: nieuw = rood (hue 0), middel = groen (120), oud = blauw (240)
    const t = Math.min(age / Math.max(now, 1), 1);
    const hue = Math.round((t * 240) / 6) * 6;  // kwantiseer voor stijlcache
    return makeStyle(4.5, 'hsla(' + hue + ', 75%, 55%, ' + (0.85 * fade) + ')',
      'hsla(' + hue + ', 75%, 75%, ' + (0.9 * fade) + ')', 1);
  }

  function loadData() {
    return fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then((data) => {
        timeline = data;
        drentheBoundary = data.drenthe_boundary;
        dayList = dateToDayIndex([data.start, data.end], data.start);
        const dayIdx = {};
        dayList.forEach((d, i) => { dayIdx[d] = i; });

        radarCounts = dayList.map((day) => data.drenthe_counts[day] ?? null);
        const features = [];
        const circles = [];
        data.repeaters.forEach((rep) => {
          const idx = dayIdx[rep.first_seen] !== undefined ? dayIdx[rep.first_seen] : 0;
          const lastIdx = dayIdx[rep.last_active] !== undefined ? dayIdx[rep.last_active] : idx;
          const center = ol.proj.fromLonLat([rep.lon, rep.lat]);
          const f = new ol.Feature({ geometry: new ol.geom.Point(center) });
          f.set('dayIndex', idx);
          f.set('lastDay', lastIdx);
          f.set('name', rep.name);
          features.push(f);

          // Dekkingscirkel (Web Mercator meters, gecorrigeerd voor breedtegraad)
          const radiusM = (repRangeKm(rep.name) * 1000) / Math.cos(rep.lat * Math.PI / 180);
          const c = new ol.Feature({ geometry: new ol.geom.Circle(center, radiusM) });
          c.set('dayIndex', idx);
          c.set('lastDay', lastIdx);
          circles.push(c);
        });
        vectorSource.addFeatures(features);
        coverageSource.addFeatures(circles);

        coveragePct = computeCoverage(data.repeaters, dayIdx, dayList.length);

        const slider = el('time-slider');
        slider.max = String(dayList.length - 1);
        slider.value = '0';

        const startN = radarCounts[0];
        const endN = radarCounts[radarCounts.length - 1];
        el('hud-growth').textContent =
          'Radar eerste → laatste: ' + startN + ' → ' + endN +
          ' (' + formatDelta(endN - startN) + ')';

        setDay(0);
      });
  }

  function formatDate(iso) {
    const [y, m, d] = iso.split('-');
    return d + '-' + m + '-' + y;
  }

  function formatDelta(delta) {
    return delta === 0 ? '0' : (delta > 0 ? '+' : '−') + Math.abs(delta);
  }

  /**
   * Benader de dekking van de provincie Drenthe per dag: raster van ~1,5 km.
   * Dekking is cumulatief: een rastercel telt mee vanaf de eerste
   * waarneming van een registratie waarvan de kaartcirkel de cel raakt.
   * Retourneert percentage (0-100) per dag.
   */
  function computeCoverage(repeaters, dayIdx, numDays) {
    const KM_PER_DEG_LAT = 111.32;
    const stepKm = 1.5;
    const latStep = stepKm / KM_PER_DEG_LAT;

    // Rasterpunten binnen Drenthe
    const points = [];
    for (let lat = 52.40; lat <= 53.20; lat += latStep) {
      const lonStep = stepKm / (KM_PER_DEG_LAT * Math.cos(lat * Math.PI / 180));
      for (let lon = 6.05; lon <= 7.10; lon += lonStep) {
        if (inDrenthe(lat, lon)) points.push([lat, lon]);
      }
    }

    // Per rasterpunt: eerste dag waarop een repeater binnen bereik verscheen
    const covered = new Array(numDays).fill(0);
    points.forEach(([plat, plon]) => {
      let minDay = Infinity;
      const cosLat = Math.cos(plat * Math.PI / 180);
      for (const rep of repeaters) {
        const rKm = repRangeKm(rep.name);
        const dLat = (rep.lat - plat) * KM_PER_DEG_LAT;
        const dLon = (rep.lon - plon) * KM_PER_DEG_LAT * cosLat;
        if (dLat * dLat + dLon * dLon <= rKm * rKm) {
          const idx = dayIdx[rep.first_seen] !== undefined ? dayIdx[rep.first_seen] : 0;
          if (idx < minDay) minDay = idx;
          if (minDay === 0) break;
        }
      }
      if (minDay !== Infinity) covered[minDay]++;
    });
    for (let i = 1; i < numDays; i++) covered[i] += covered[i - 1];
    return covered.map((c) => (c / points.length) * 100);
  }

  function setDay(day) {
    currentDay = Math.max(0, Math.min(day, dayList.length - 1));
    el('time-slider').value = String(currentDay);
    el('hud-date').textContent = formatDate(dayList[currentDay]);
    const count = radarCounts[currentDay];
    el('hud-count').textContent = count === null
      ? 'Geen radarsnapshot op deze dag'
      : count + ' radarregistraties in Drenthe';
    el('hud-coverage').textContent = coveragePct.length
      ? 'modeldekking: ' + coveragePct[currentDay].toFixed(1) + '% van Drenthe'
      : '';
    vectorLayer.changed();
    coverageLayer.changed();
    drawChart();
  }

  /* ========== Animatie ========== */

  function tick(ts) {
    if (!playing) return;
    if (!lastTick) lastTick = ts;
    const dt = (ts - lastTick) / 1000;
    lastTick = ts;

    const speed = parseFloat(el('speed-select').value);
    dayFraction += dt * DAYS_PER_SECOND * speed;
    if (dayFraction >= 1) {
      const advance = Math.floor(dayFraction);
      dayFraction -= advance;
      const next = currentDay + advance;
      if (next >= dayList.length - 1) {
        setDay(dayList.length - 1);
        setPlaying(false);
        return;
      }
      setDay(next);
    } else {
      vectorLayer.changed(); // vloeiende fade-in tussen dagstappen
      coverageLayer.changed();
    }
    requestAnimationFrame(tick);
  }

  function setPlaying(on) {
    playing = on;
    lastTick = 0;
    if (!on) dayFraction = 0;
    el('btn-play').textContent = on ? '⏸ Pauze' : '▶ Afspelen';
    if (on) {
      // Opnieuw starten als de film aan het einde is
      if (currentDay >= dayList.length - 1) setDay(0);
      requestAnimationFrame(tick);
    }
  }

  /* ========== Voortgangsrapport ========== */

  const MAANDEN_KORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
    'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

  function distKm(lat1, lon1, lat2, lon2) {
    const KM = 111.32;
    const dLat = (lat2 - lat1) * KM;
    const dLon = (lon2 - lon1) * KM * Math.cos(lat1 * Math.PI / 180);
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }

  function formatMonth(month) {
    const [y, m] = month.split('-');
    return MAANDEN_KORT[parseInt(m, 10) - 1] + ' ' + y;
  }

  function buildReport() {
    return fetch('../data/settlements-drenthe.json')
      .then((r) => {
        if (!r.ok) throw new Error('Locaties van woonkernen: HTTP ' + r.status);
        return r.json();
      })
      .then((geo) => {
        const settlements = geo.features.map((f) => ({
          name: f.properties.name,
          type: f.properties.type,
          municipality: f.properties.municipality,
          population: f.properties.population || 0,
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0]
        })).filter((s) => inDrenthe(s.lat, s.lon));

        const lastIdx = dayList.length - 1;
        const startN = radarCounts[0];
        const endN = radarCounts[lastIdx];
        const startCov = coveragePct[0];
        const endCov = coveragePct[lastIdx];

        // Per plaats: afstand tot dichtstbijzijnde repeater-locatie en of de
        // plaats gedekt is (ooit gezien = gedekt; VRD-repeaters 10 km bereik)
        settlements.forEach((s) => {
          let dNow = Infinity, covNow = false;
          timeline.repeaters.forEach((r) => {
            const d = distKm(s.lat, s.lon, r.lat, r.lon);
            if (d < dNow) dNow = d;
            if (d <= repRangeKm(r.name)) covNow = true;
          });
          s.distNow = dNow;
          s.covNow = covNow;
        });

        const totalPop = settlements.reduce((a, s) => a + s.population, 0);
        const coveredNow = settlements.filter((s) => s.covNow);
        const popNow = coveredNow.reduce((a, s) => a + s.population, 0);
        const uncovered = settlements
          .filter((s) => !s.covNow)
          .sort((a, b) => b.population - a.population);

        /* --- Kerncijfers --- */
        el('rp-periode').textContent =
          formatDate(dayList[0]) + ' t/m ' + formatDate(dayList[lastIdx]) +
          ' (' + dayList.length + ' dagen)';
        el('rp-start-note').textContent =
          'De eerste dagsnapshot (' + formatDate(dayList[0]) + ') bevat ' + startN +
          ' registraties met coördinaten binnen de CBS-grens. De grensfilter sluit punten buiten Drenthe uit, ' +
          'maar controleert niet of de overige locaties kloppen of bij het project horen. Dit is geen starttelling.';
        el('rp-end-count').textContent = endN;
        el('rp-ever-count').textContent = timeline.drenthe_ever_count.toLocaleString('nl-NL');
        el('rp-ever-note').textContent =
          'Historisch totaal over ' + timeline.snapshot_count.toLocaleString('nl-NL') +
          ' snapshots: elke repeater-ID telt één keer zodra die ooit met coördinaten binnen Drenthe is vermeld. ' +
          'Ook later verdwenen registraties tellen mee. Het totaal bewijst niet dat alle repeaters fysiek geïnstalleerd of actief waren.';
        el('rp-coverage').textContent = startCov.toFixed(0) + '% → ' + endCov.toFixed(0) + '%';
        el('rp-pop-coverage').textContent =
          Math.round((popNow / totalPop) * 100) + '%';

        /* --- Wat hebben we bereikt --- */
        el('rp-bereikt-tekst').innerHTML =
          'Het bereikmodel komt op <strong>' + endCov.toFixed(0) + '%</strong> van Drenthe als alle ooit ' +
          'geregistreerde locaties meetellen. De centra van <strong>' + coveredNow.length + ' van de ' +
          settlements.length + '</strong> onderzochte Drentse kernen liggen volgens dit model binnen bereik. ' +
          'Dit is geen meting van ontvangst of van de huidige beschikbaarheid van het netwerk.';

        // Maandtabel
        const perMaand = {};
        dayList.forEach((d, i) => {
          if (radarCounts[i] !== null) perMaand[d.slice(0, 7)] = i;
        });
        const maandKeys = Object.keys(perMaand).sort();
        let prev = null;
        const rows = maandKeys.map((mk) => {
          const i = perMaand[mk];
          const verschil = prev === null ? '—' : formatDelta(radarCounts[i] - radarCounts[prev]);
          prev = i;
          return '<tr><td>' + formatMonth(mk) + '</td>' +
            '<td class="num">' + radarCounts[i] + '</td>' +
            '<td class="num">' + verschil + '</td>' +
            '<td class="num">' + coveragePct[i].toFixed(1) + '%</td></tr>';
        });
        el('rp-maand-tabel').innerHTML = rows.join('');

        /* --- Welke plekken moeten nog --- */
        el('rp-ontbrekend-tekst').innerHTML =
          '<strong>' + uncovered.length + '</strong> van de ' + settlements.length +
          ' onderzochte kernen liggen volgens het model buiten het aangenomen bereik (' + COVERAGE_KM +
          ' km, VRD-repeaters ' + COVERAGE_KM_VRD + ' km) rond een (ooit geziene) repeater-locatie. ' +
          'Dit zijn kandidaten voor een veldmeting, gerangschikt op inwonersaantal.';
        el('rp-ontbrekend-tabel').innerHTML = uncovered.slice(0, 25).map((s) =>
          '<tr><td>' + s.name + '</td>' +
          '<td><span class="badge">' + s.type + '</span></td>' +
          '<td>' + s.municipality + '</td>' +
          '<td class="num">' + s.population.toLocaleString('nl-NL') + '</td>' +
          '<td class="num">' + (s.distNow === Infinity ? '—' : s.distNow.toFixed(1) + ' km') + '</td></tr>'
        ).join('') + (uncovered.length > 25
          ? '<tr><td colspan="5" style="color:#9898a8">… en nog ' + (uncovered.length - 25) + ' kleinere kernen</td></tr>'
          : '');

        /* --- Evaluatie --- */
        const topUncovered = uncovered.slice(0, 3).map((s) => s.name).join(', ');
        el('rp-evaluatie').innerHTML =
          '<p><strong>Voortgang.</strong> De projectstarttelling en de radartellingen komen uit verschillende bronnen. ' +
          'Zonder gecontroleerde eindtelling kunnen we de netto groei van het project niet vaststellen.</p>' +
          '<p><strong>Volgende stappen.</strong> Controleer de geregistreerde locaties en meet het bereik in het veld. ' +
          (topUncovered ? 'Begin bijvoorbeeld bij <strong>' + topUncovered + '</strong>. ' : '') +
          'Gebruik de <a href="index.html" style="color:#74c69d">planningtool</a> om kandidaat-locaties te bepalen.</p>';
      });
  }

  /* ========== Grafiek ========== */

  function drawChart() {
    const canvas = el('groei-chart');
    const wrap = canvas.parentElement;
    const w = wrap.clientWidth - 32;
    if (canvas.width !== w) canvas.width = Math.max(w, 100);
    const h = canvas.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, h);
    if (!radarCounts.length) return;

    const maxV = Math.max(1, ...radarCounts.filter((count) => count !== null));
    const n = radarCounts.length;
    const x = (i) => (i / Math.max(1, n - 1)) * canvas.width;
    const y = (v) => h - 4 - (v / maxV) * (h - 10);

    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      if (radarCounts[i] === null) continue;
      if (i === 0 || radarCounts[i - 1] === null) ctx.moveTo(x(i), y(radarCounts[i]));
      else ctx.lineTo(x(i), y(radarCounts[i]));
    }
    ctx.strokeStyle = '#74c69d';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dekkingslijn (% van Drenthe, schaal 0-100%)
    if (coveragePct.length === n) {
      const yPct = (v) => h - 4 - (v / 100) * (h - 10);
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        i === 0 ? ctx.moveTo(x(i), yPct(coveragePct[i])) : ctx.lineTo(x(i), yPct(coveragePct[i]));
      }
      ctx.strokeStyle = '#e8a855';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Positie-indicator
    const cx = x(currentDay);
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.strokeStyle = 'rgba(255, 214, 90, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#e8e8f0';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('radar max. ' + maxV, canvas.width - 4, 12);
    if (coveragePct.length) {
      ctx.fillStyle = '#e8a855';
      ctx.fillText('model ' + coveragePct[coveragePct.length - 1].toFixed(0) + '%', canvas.width - 4, 26);
    }
  }

  /* ========== Init ========== */

  function init() {
    initMap();

    el('btn-play').addEventListener('click', () => setPlaying(!playing));
    el('time-slider').addEventListener('input', (e) => {
      setPlaying(false);
      setDay(parseInt(e.target.value, 10));
    });
    el('show-gone').addEventListener('change', (e) => {
      showGone = e.target.checked;
      vectorLayer.changed();
    });
    el('show-coverage').addEventListener('change', (e) => {
      coverageLayer.setVisible(e.target.checked);
    });
    window.addEventListener('resize', drawChart);

    loadData().then(buildReport).catch((err) => {
      el('hud-date').textContent = 'Fout';
      el('hud-count').textContent = 'Kon timeline-data niet laden (' + err.message + ')';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
