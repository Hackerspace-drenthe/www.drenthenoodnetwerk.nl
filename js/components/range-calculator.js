/**
 * Range Calculator — Interactive LoRa range estimator.
 * Users adjust antenna height, terrain type, and obstructions
 * to see estimated range change in real-time.
 */

/**
 * Terrain multipliers for range estimation.
 * @type {Object<string, {factor: number, label: string}>}
 */
var TERRAIN_TYPES = {
  flat:    { factor: 1.0,  label: 'Vlak (weiland, heide)' },
  rural:   { factor: 0.75, label: 'Landelijk (bomen, boerderijen)' },
  suburb:  { factor: 0.5,  label: 'Dorpskern (lage bebouwing)' },
  urban:   { factor: 0.3,  label: 'Stad (hoge bebouwing)' },
  forest:  { factor: 0.25, label: 'Dicht bos' },
};

/**
 * Calculates estimated LoRa range in km.
 * Uses simplified Friis/log-distance model adapted for LoRa @ 868 MHz.
 * @param {number} heightM - antenna height in meters
 * @param {string} terrain - terrain type key
 * @returns {number} estimated range in km
 */
function calcLoRaRange(heightM, terrain) {
  // Base range at 2m height in flat terrain: ~5 km
  // Height gain follows sqrt relationship (simplified)
  var baseRange = 5;
  var heightFactor = Math.sqrt(heightM / 2);
  var terrainFactor = TERRAIN_TYPES[terrain] ? TERRAIN_TYPES[terrain].factor : 0.5;
  return Math.round(baseRange * heightFactor * terrainFactor * 10) / 10;
}

/**
 * Initializes the range calculator if container exists.
 */
function initRangeCalculator() {
  var container = document.getElementById('range-calculator');
  if (!container) return;

  var heightSlider = container.querySelector('#range-height');
  var terrainSelect = container.querySelector('#range-terrain');
  var resultValue = container.querySelector('.range-result__value');
  var resultBar = container.querySelector('.range-result__bar-fill');
  var heightLabel = container.querySelector('.range-height-label');
  var svgVis = container.querySelector('.range-visual svg');

  if (!heightSlider || !terrainSelect || !resultValue) return;

  var maxRange = 20; // max displayable range in km

  /**
   * Updates the visualization.
   */
  function updateRange() {
    var height = parseFloat(heightSlider.value);
    var terrain = terrainSelect.value;
    var range = calcLoRaRange(height, terrain);

    resultValue.textContent = range + ' km';
    if (heightLabel) heightLabel.textContent = height + ' m';

    if (resultBar) {
      var pct = Math.min(100, (range / maxRange) * 100);
      resultBar.style.width = pct + '%';
    }

    // Update SVG visualization
    if (svgVis) {
      updateRangeSVG(svgVis, height, range, terrain);
    }
  }

  /**
   * Updates the SVG antenna + range visualization.
   * @param {SVGElement} svg
   * @param {number} height
   * @param {number} range
   * @param {string} terrain
   */
  function updateRangeSVG(svg, height, range, terrain) {
    var antennaLine = svg.querySelector('.range-antenna');
    var rangeCircle = svg.querySelector('.range-circle');
    var rangeLabel = svg.querySelector('.range-label');
    var terrainPath = svg.querySelector('.range-terrain');

    if (antennaLine) {
      // Scale antenna height: 2m = short, 20m = tall, mapped to SVG coordinates
      var antennaTop = 140 - (height / 20) * 80;
      antennaLine.setAttribute('y1', antennaTop);
      // Move antenna tip
      var tip = svg.querySelector('.range-tip');
      if (tip) tip.setAttribute('cy', antennaTop);
    }

    if (rangeCircle) {
      // Range mapped to circle radius (max 240px at 20km)
      var r = (range / maxRange) * 240;
      rangeCircle.setAttribute('rx', Math.max(20, r));
      rangeCircle.setAttribute('ry', Math.max(10, r * 0.3));
    }

    if (rangeLabel) {
      rangeLabel.textContent = range + ' km';
    }

    // Update terrain visual
    if (terrainPath) {
      var terrainPaths = {
        flat:   'M0,150 Q150,145 300,150 Q450,145 600,150',
        rural:  'M0,150 Q75,140 150,150 Q225,135 300,150 Q375,140 450,150 Q525,140 600,150',
        suburb: 'M0,150 L80,150 L80,130 L120,130 L120,150 L200,150 L200,125 L250,125 L250,150 L350,150 L350,135 L380,135 L380,150 L500,150 L500,130 L540,130 L540,150 L600,150',
        urban:  'M0,150 L50,150 L50,110 L90,110 L90,150 L130,150 L130,95 L170,95 L170,150 L220,150 L220,105 L260,105 L260,150 L310,150 L310,90 L350,90 L350,150 L400,150 L400,115 L440,115 L440,150 L500,150 L500,100 L540,100 L540,150 L600,150',
        forest: 'M0,150 Q30,120 60,150 Q90,110 120,150 Q150,115 180,150 Q210,105 240,150 Q270,115 300,150 Q330,110 360,150 Q390,120 420,150 Q450,108 480,150 Q510,115 540,150 Q570,120 600,150',
      };
      terrainPath.setAttribute('d', terrainPaths[terrain] || terrainPaths.flat);
    }
  }

  heightSlider.addEventListener('input', updateRange);
  terrainSelect.addEventListener('change', updateRange);

  updateRange();
}
