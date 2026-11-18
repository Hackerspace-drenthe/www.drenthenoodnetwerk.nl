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
  const COVERAGE_FADE_DAYS = 2;
  const COVERAGE_KM = 5;       // aangenomen bereik per repeater (km)
  const COVERAGE_KM_VRD = 10;  // modelaanname voor VRD-repeaters
  const FORECAST_TREND_DAYS = 30;
  const FORECAST_MONTHS = 2;

  /** Aangenomen bereik in km voor een repeater op basis van de naam. */
  function repRangeKm(name) {
    return name && name.toUpperCase().indexOf('VRD') !== -1 ? COVERAGE_KM_VRD : COVERAGE_KM;
  }

  let map, vectorSource, vectorLayer, coverageSource, coverageLayer;
  let timeline = null;         // geladen JSON
  let dayList = [];            // 'YYYY-MM-DD' per stap
  let radarCounts = [];        // Drentse radartelling per snapshotdag
  let forecast = [];           // uitsluitend voor afspelen en grafiek
  let drentheBoundary = [];
  let currentDay = 0;
  let playing = false;
  let animationFrame = 0;
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

  function dateToDayIndex(start, endDate) {
    // Maakt een doorlopende daglijst van start t/m einde
    const out = [];
    const d = new Date(start + 'T00:00:00Z');
    const end = new Date(endDate + 'T00:00:00Z');
    while (d <= end) {
      out.push(d.toISOString().slice(0, 10));
      d.setUTCDate(d.getUTCDate() + 1);
    }
    return out;
  }

  function recentSlope(values, isUsable) {
    const points = values.slice(-FORECAST_TREND_DAYS).flatMap((value, day) =>
      isUsable(value) ? [{ day, value }] : []
    );
    if (points.length < 7) return null;

    const meanDay = points.reduce((sum, p) => sum + p.day, 0) / points.length;
    const meanValue = points.reduce((sum, p) => sum + p.value, 0) / points.length;
    return points.reduce((sum, p) => sum + (p.day - meanDay) * (p.value - meanValue), 0) /
      points.reduce((sum, p) => sum + (p.day - meanDay) ** 2, 0);
  }

  function buildForecast(endDate, counts, coverage) {
    const lastCount = counts[counts.length - 1];
    const countSlope = recentSlope(counts, (count) => count > 0);
    if (!(lastCount > 0) || countSlope === null) return [];

    const lastCoverage = coverage[coverage.length - 1];
    const coverageSlope = recentSlope(coverage, Number.isFinite);
    const hasCoverage = Number.isFinite(lastCoverage) && coverageSlope !== null;

    const end = new Date(endDate + 'T00:00:00Z');
    const target = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + FORECAST_MONTHS + 1, 0));
    target.setUTCDate(Math.min(end.getUTCDate(), target.getUTCDate()));
    return dateToDayIndex(endDate, target.toISOString().slice(0, 10)).slice(1).map((date, i) => ({
      date,
      count: Math.max(0, lastCount + countSlope * (i + 1)),
      coverage: hasCoverage
        ? Math.min(100, lastCoverage + Math.max(0, coverageSlope) * (i + 1))
        : null
    }));
  }

  function lastPlaybackDay() {
    return dayList.length + forecast.length - 1;
  }

  function initMap() {
    const baseLayer = new ol.layer.Tile({
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
      opacity: 0.65
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
    const now = Math.min(currentDay + dayFraction, dayList.length - 1);
    if (day > now) return null; // dekking blijft: eenmaal gezien = gedekt
    const age = now - day;
    const fade = playing && now < dayList.length - 1
      ? Math.round(Math.min(age / COVERAGE_FADE_DAYS, 1) * 10) / 10 : 1;
    if (fade <= 0) return null;
    if (!coverageStyleCache[fade]) {
      coverageStyleCache[fade] = new ol.style.Style({
        fill: new ol.style.Fill({ color: 'rgba(26, 169, 105, ' + (0.12 * fade) + ')' }),
        stroke: new ol.style.Stroke({ color: 'rgba(23, 124, 81, ' + (0.32 * fade) + ')', width: 1 })
      });
    }
    return coverageStyleCache[fade];
  }

  function styleFeature(feature) {
    const day = feature.get('dayIndex');
    const now = Math.min(currentDay + dayFraction, dayList.length - 1);
    if (day > now) return null;                 // nog niet toegevoegd
    const lastDay = feature.get('lastDay');

    if (now > lastDay + 1) {
      // Op dit moment in de tijdlijn alweer verdwenen
      if (!showGone) return null;
      return makeStyle(3, 'rgba(120, 120, 135, 0.45)', 'rgba(160, 160, 175, 0.5)', 1);
    }

    const age = now - day;
    // Fade-in tijdens afspelen: opaciteit 0 → vol in FADE_DAYS dagen (gekwantiseerd voor stijlcache)
    const fade = playing && now < dayList.length - 1 ? Math.round(Math.min(age / FADE_DAYS, 1) * 20) / 20 : 1;
    if (fade <= 0) return null;

    // Kleurverloop op ouderdom: nieuw = rood (hue 0), middel = groen (120), oud = blauw (240)
    const t = Math.min(age / Math.max(now, 1), 1);
    const hue = Math.round((t * 240) / 6) * 6;  // kwantiseer voor stijlcache
    return makeStyle(4.5, 'hsla(' + hue + ', 75%, 55%, ' + (0.85 * fade) + ')',
      'hsla(' + hue + ', 65%, 28%, ' + (0.9 * fade) + ')', 1);
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
        dayList = dateToDayIndex(data.start, data.end);
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
        forecast = buildForecast(data.end, radarCounts, coveragePct);
        el('forecast-legend').hidden = !forecast.length;
        el('forecast-coverage-legend').hidden = !Number.isFinite(forecast[0]?.coverage);
        el('forecast-unavailable').hidden = Boolean(forecast.length);

        const slider = el('time-slider');
        slider.max = String(lastPlaybackDay());
        slider.disabled = false;
        el('btn-play').disabled = false;

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
    currentDay = Math.max(0, Math.min(day, lastPlaybackDay()));
    const projection = forecast[currentDay - dayList.length];
    const slider = el('time-slider');
    slider.value = String(currentDay);
    const dateLabel = formatDate(projection ? projection.date : dayList[currentDay]);
    slider.setAttribute('aria-valuetext', projection ? 'Prognose: ' + dateLabel : dateLabel);
    el('hud-date').textContent = dateLabel;
    el('hud-forecast').hidden = !projection;
    const count = radarCounts[currentDay];
    el('hud-count').textContent = projection
      ? 'Circa ' + Math.round(projection.count) + ' radarregistraties in Drenthe'
      : count === null
      ? 'Geen radarsnapshot op deze dag'
      : count + ' radarregistraties in Drenthe';
    el('hud-coverage').textContent = projection
      ? projection.coverage === null
        ? 'Modeldekking: geen prognose beschikbaar'
        : 'Modeldekking: circa ' + projection.coverage.toLocaleString('nl-NL', {
          minimumFractionDigits: 1, maximumFractionDigits: 1
        }) + '% van Drenthe'
      : coveragePct.length
      ? 'modeldekking: ' + coveragePct[currentDay].toFixed(1) + '% van Drenthe'
      : '';
    el('hud-map-date').textContent = projection
      ? 'Kaart: stand van ' + formatDate(dayList[dayList.length - 1]) : '';
    el('hud-growth').hidden = Boolean(projection);
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
      if (next >= lastPlaybackDay()) {
        setDay(lastPlaybackDay());
        setPlaying(false);
        return;
      }
      setDay(next);
    } else if (currentDay < dayList.length - 1) {
      vectorLayer.changed(); // vloeiende fade-in tussen dagstappen
      coverageLayer.changed();
    }
    animationFrame = requestAnimationFrame(tick);
  }

  function setPlaying(on) {
    playing = on;
    lastTick = 0;
    if (!on) {
      cancelAnimationFrame(animationFrame);
      dayFraction = 0;
    }
    el('btn-play').textContent = on ? '⏸ Pauze' : '▶ Afspelen';
    if (on) {
      // Opnieuw starten als de film aan het einde is
      if (currentDay >= lastPlaybackDay()) setDay(0);
      animationFrame = requestAnimationFrame(tick);
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

        // Gebruik ook locaties van repeaters die niet meer in mc-radar staan.
        settlements.forEach((s) => {
          let nearestKm = Infinity, inModelRange = false;
          timeline.repeaters.forEach((r) => {
            const d = distKm(s.lat, s.lon, r.lat, r.lon);
            if (d < nearestKm) nearestKm = d;
            if (d <= repRangeKm(r.name)) inModelRange = true;
          });
          s.nearestKm = nearestKm;
          s.inModelRange = inModelRange;
        });

        const uncovered = settlements
          .filter((s) => !s.inModelRange)
          .sort((a, b) => b.population - a.population);
        const coveredCount = settlements.length - uncovered.length;

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
          'Ook registraties die later niet meer in mc-radar staan tellen mee. Het totaal bewijst niet dat alle repeaters fysiek geïnstalleerd of actief waren.';
        el('rp-coverage').textContent = startCov.toFixed(0) + '% → ' + endCov.toFixed(0) + '%';
        el('rp-settlement-coverage').textContent = coveredCount + ' van ' + settlements.length;

        /* --- Wat hebben we bereikt --- */
        el('rp-bereikt-tekst').innerHTML =
          'De kaart laat zien hoe het mogelijke bereik zich uitbreidt: van <strong>' + startCov.toFixed(0) +
          '%</strong> op de eerste meetdag naar <strong>' + endCov.toFixed(0) + '%</strong> van Drenthe in het cumulatieve model. ' +
          'Daarmee liggen <strong>' + coveredCount + ' van de ' + settlements.length +
          ' onderzochte kerncentra</strong> binnen geschat bereik. Een mooi vertrekpunt voor veldmetingen; ' +
          'de cijfers zijn geen meting van ontvangst of actuele beschikbaarheid.';

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
        el('rp-ontbrekend-tekst').innerHTML = uncovered.length
          ? 'We hebben een concrete plek om te beginnen: meet eerst bij de <strong>' + uncovered.length +
            ' van de ' + settlements.length + '</strong> onderzochte kerncentra die volgens het model buiten bereik liggen. ' +
            'De lijst staat op volgorde van inwoneraantal.'
          : 'Geen van de onderzochte kerncentra valt buiten het geschatte bereik. Met veldmetingen kunnen we toetsen waar de kaart overeenkomt met de praktijk.';
        el('rp-ontbrekend-tabel').innerHTML = uncovered.slice(0, 25).map((s) =>
          '<tr><td>' + s.name + '</td>' +
          '<td><span class="badge">' + s.type + '</span></td>' +
          '<td>' + s.municipality + '</td>' +
          '<td class="num">' + s.population.toLocaleString('nl-NL') + '</td>' +
          '<td class="num">' + (s.nearestKm === Infinity ? '—' : s.nearestKm.toFixed(1) + ' km') + '</td></tr>'
        ).join('') + (uncovered.length > 25
          ? '<tr><td colspan="5" style="color:#9898a8">… en nog ' + (uncovered.length - 25) + ' kleinere kernen</td></tr>'
          : '');

        /* --- Evaluatie --- */
        const topUncovered = uncovered.slice(0, 3).map((s) => s.name).join(', ');
        el('rp-evaluatie').innerHTML =
          '<p><strong>De volgende stap: buiten testen.</strong> Probeer een bericht over meerdere repeaters te sturen ' +
          'en leg vast waar het aankomt. ' +
          (topUncovered ? '<strong>' + topUncovered + '</strong> zijn logische plekken om te beginnen. ' : '') +
          'De <a href="index.html">planningtool</a> helpt om mogelijke locaties voor een extra repeater te vinden.</p>' +
          '<p class="periode">De projectstarttelling en de radartellingen komen uit verschillende bronnen. ' +
          'Een gecontroleerde eindtelling blijft nodig om de netto groei vast te stellen.</p>';
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

    const n = radarCounts.length;
    const radarMax = Math.max(1, ...radarCounts.filter((count) => count !== null));
    const maxV = Math.max(radarMax, ...forecast.map((p) => p.count));
    const x = (i) => (i / Math.max(1, lastPlaybackDay())) * canvas.width;
    const y = (v) => h - 4 - (v / maxV) * (h - 10);

    if (forecast.length) {
      ctx.fillStyle = 'rgba(177, 174, 255, 0.1)';
      ctx.fillRect(x(n - 1), 0, canvas.width - x(n - 1), h);
      ctx.beginPath();
      ctx.moveTo(x(n - 1), y(radarCounts[n - 1]));
      forecast.forEach((p, i) => ctx.lineTo(x(n + i), y(p.count)));
      ctx.strokeStyle = '#b1aeff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

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
      if (Number.isFinite(forecast[0]?.coverage)) {
        ctx.beginPath();
        ctx.moveTo(x(n - 1), yPct(coveragePct[n - 1]));
        forecast.forEach((p, i) => ctx.lineTo(x(n + i), yPct(p.coverage)));
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
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
    ctx.fillText('radar max. ' + radarMax, canvas.width - 4, 12);
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
