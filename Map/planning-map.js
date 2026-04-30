/**
 * Meshcore Repeater Planning Tool
 * OpenLayers-based interactive planning map for optimizing repeater placement
 */

(function () {
  'use strict';

  // ========== Configuration ==========
  
  const CONFIG = {
    dataBase: '../data/mc-radar',
    mapCenter: [6.75, 52.72], // [lon, lat] for OpenLayers
    mapZoom: 10,
    defaultRange: 3, // km - realistic reliable range for planned repeaters
    freshHours: 24,
    drentheBounds: [ // Simplified Drenthe province boundary [lon, lat]
      [6.15, 53.18], [6.25, 53.17], [6.35, 53.13], [6.47, 53.10],
      [6.58, 53.12], [6.70, 53.10], [6.80, 53.07], [6.87, 53.00],
      [6.92, 52.95], [6.95, 52.90], [6.97, 52.85], [7.00, 52.80],
      [7.05, 52.75], [7.09, 52.70], [7.09, 52.65], [7.05, 52.60],
      [6.99, 52.55], [6.90, 52.50], [6.83, 52.48], [6.73, 52.47],
      [6.65, 52.45], [6.55, 52.42], [6.45, 52.40], [6.35, 52.40],
      [6.25, 52.42], [6.18, 52.45], [6.10, 52.50], [6.07, 52.55],
      [6.08, 52.60], [6.10, 52.65], [6.10, 52.70], [6.08, 52.75],
      [6.07, 52.80], [6.10, 52.85], [6.12, 52.90], [6.10, 52.95],
      [6.10, 53.00], [6.12, 53.05], [6.10, 53.10], [6.12, 53.15],
      [6.15, 53.18]
    ]
  };

  // ========== State ==========
  
  let map;
  let obstructionLayer = null; // RF obstruction overlay
  let vectorLayers = {
    repeaters: null,
    companions: null,
    links: null,
    ranges: null,
    planned: null,
    measurement: null,
    towers: null,
    settlements: null
  };
  let radarData = {
    repeaters: [],
    companions: [],
    links: []
  };
  let towersData = [];
  let settlementsData = [];
  let plannedNodes = [];
  let currentTool = 'add-repeater';
  let measurementInteraction = null;
  let pendingRepeaterCoordinate = null;
  let planIdCounter = 1;
  let repeaterClassFilter = { min: 0, max: 8 }; // Filter range
  let rangeFactor = 0.6; // Range calculation factor: 0.4 (conservative) to 1.0 (max proven)
  let linkAnimationRunning = false; // Track animation state

  // ========== Initialization ==========

  function init() {
    initMap();
    initBaseLayers();
    initVectorLayers();
    initControls();
    initEventListeners();
    loadRadarData();
    loadTowersData();
    loadSettlementsData();
  }

  function initMap() {
    map = new ol.Map({
      target: 'map',
      view: new ol.View({
        center: ol.proj.fromLonLat(CONFIG.mapCenter),
        zoom: CONFIG.mapZoom
      })
    });

    // Mouse coordinate tracking
    map.on('pointermove', function (evt) {
      const coords = ol.proj.toLonLat(evt.coordinate);
      updateCoordinateDisplay(coords[1], coords[0]); // lat, lon
    });

    // Click handler for adding planned nodes
    map.on('click', function (evt) {
      if (currentTool === 'add-repeater') {
        showAddRepeaterDialog(evt.coordinate);
      }
    });
  }

  function initBaseLayers() {
    // OpenStreetMap
    const osmLayer = new ol.layer.Tile({
      title: 'OpenStreetMap',
      type: 'base',
      visible: false,
      source: new ol.source.OSM()
    });

    // CartoDB Dark (default)
    const cartoDarkLayer = new ol.layer.Tile({
      title: 'Dark',
      type: 'base',
      visible: true,
      source: new ol.source.XYZ({
        url: 'https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        attributions: '© OpenStreetMap contributors © CARTO'
      })
    });

    // CartoDB Positron - light background with places
    const positronLayer = new ol.layer.Tile({
      title: 'Light',
      type: 'base',
      visible: false,
      source: new ol.source.XYZ({
        url: 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        attributions: '© OpenStreetMap contributors, © CartoDB'
      })
    });

    // OpenTopoMap
    const topoLayer = new ol.layer.Tile({
      title: 'Topografisch',
      type: 'base',
      visible: false,
      source: new ol.source.XYZ({
        url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attributions: '© OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
      })
    });

    // Humanitarian OSM
    const hotLayer = new ol.layer.Tile({
      title: 'Humanitair',
      type: 'base',
      visible: false,
      source: new ol.source.XYZ({
        url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        attributions: '© OpenStreetMap contributors, Tiles style by Humanitarian OSM Team'
      })
    });

    // Wikimedia Maps
    const wikimediaLayer = new ol.layer.Tile({
      title: 'Wikimedia',
      type: 'base',
      visible: false,
      source: new ol.source.XYZ({
        url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',
        attributions: '© OpenStreetMap contributors, Wikimedia Maps'
      })
    });

    // CyclOSM - good for infrastructure/outdoor planning
    const cyclOSMLayer = new ol.layer.Tile({
      title: 'CyclOSM',
      type: 'base',
      visible: false,
      source: new ol.source.XYZ({
        url: 'https://{a-c}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
        attributions: '© OpenStreetMap contributors, CyclOSM'
      })
    });

    map.addLayer(cartoDarkLayer);
    map.addLayer(positronLayer);
    map.addLayer(osmLayer);
    map.addLayer(topoLayer);
    map.addLayer(hotLayer);
    map.addLayer(wikimediaLayer);
    map.addLayer(cyclOSMLayer);

    // Add layer switcher control
    const layerSwitcher = createLayerSwitcher([
      { title: 'Dark', layer: cartoDarkLayer },
      { title: 'Light', layer: positronLayer },
      { title: 'OpenStreetMap', layer: osmLayer },
      { title: 'Topografisch', layer: topoLayer },
      { title: 'Humanitair', layer: hotLayer },
      { title: 'Wikimedia', layer: wikimediaLayer },
      { title: 'CyclOSM', layer: cyclOSMLayer }
    ]);
    map.addControl(layerSwitcher);

    // Add RF obstruction overlay (buildings, forests, terrain)
    obstructionLayer = new ol.layer.Tile({
      title: 'RF Obstructies',
      visible: false,
      opacity: 0.4,
      source: new ol.source.XYZ({
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attributions: '© OpenStreetMap contributors'
      }),
      zIndex: 1 // Between base layer and vector layers
    });
    map.addLayer(obstructionLayer);
  }

  function createLayerSwitcher(layers) {
    const element = document.createElement('div');
    element.className = 'ol-control ol-unselectable';
    element.style.top = '0.5em';
    element.style.right = '0.5em';
    
    const select = document.createElement('select');
    select.style.padding = '4px 8px';
    select.style.fontSize = '13px';
    select.style.background = 'var(--color-bg-alt)';
    select.style.color = 'var(--color-text)';
    select.style.border = '1px solid var(--color-border)';
    select.style.borderRadius = 'var(--radius-sm)';
    select.style.cursor = 'pointer';

    layers.forEach(({ title, layer }) => {
      const option = document.createElement('option');
      option.textContent = title;
      option.value = title;
      if (layer.getVisible()) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener('change', function () {
      const selectedTitle = this.value;
      layers.forEach(({ title, layer }) => {
        layer.setVisible(title === selectedTitle);
      });
    });

    element.appendChild(select);
    return new ol.control.Control({ element });
  }

  function initVectorLayers() {
    // Create vector layers for different data types
    vectorLayers.links = createVectorLayer('links', 2);
    vectorLayers.ranges = createVectorLayer('ranges', 3);
    vectorLayers.settlements = createVectorLayer('settlements', 4);
    vectorLayers.companions = createVectorLayer('companions', 5);
    vectorLayers.repeaters = createVectorLayer('repeaters', 6);
    vectorLayers.towers = createVectorLayer('towers', 7);
    vectorLayers.planned = createVectorLayer('planned', 6);
    vectorLayers.measurement = createVectorLayer('measurement', 10);
    vectorLayers.noCoverage = createVectorLayer('noCoverage', 8);

    // Create heatmap layer for coverage strength
    vectorLayers.coverage = new ol.layer.Heatmap({
      source: new ol.source.Vector(),
      blur: 80,
      radius: 120,
      weight: function(feature) {
        return feature.get('weight') || 0;
      },
      gradient: ['#00f', '#0ff', '#0f0', '#ff0', '#f00'],
      zIndex: 1
    });

    map.addLayer(vectorLayers.coverage);
    map.addLayer(vectorLayers.links);
    map.addLayer(vectorLayers.ranges);
    map.addLayer(vectorLayers.settlements);
    map.addLayer(vectorLayers.companions);
    map.addLayer(vectorLayers.repeaters);
    map.addLayer(vectorLayers.towers);
    map.addLayer(vectorLayers.planned);
    map.addLayer(vectorLayers.noCoverage);
    map.addLayer(vectorLayers.measurement);

    // Initially hide some layers
    vectorLayers.links.setVisible(false);
    vectorLayers.ranges.setVisible(false);
    vectorLayers.towers.setVisible(false);
    vectorLayers.settlements.setVisible(false);
    vectorLayers.coverage.setVisible(false);
    vectorLayers.noCoverage.setVisible(false);
  }

  function createVectorLayer(name, zIndex) {
    return new ol.layer.Vector({
      source: new ol.source.Vector(),
      zIndex: zIndex,
      name: name
    });
  }

  function initControls() {
    // Zoom controls are already added by default
    
    // Scale line
    map.addControl(new ol.control.ScaleLine({
      units: 'metric'
    }));
  }

  function initEventListeners() {
    // Layer toggles
    document.getElementById('layer-repeaters').addEventListener('change', function (e) {
      vectorLayers.repeaters.setVisible(e.target.checked);
    });

    // Class filter sliders
    document.getElementById('class-min').addEventListener('input', function (e) {
      repeaterClassFilter.min = parseInt(e.target.value);
      document.getElementById('class-min-value').textContent = e.target.value;
      renderRadarData();
      updateStats();
    });

    document.getElementById('class-max').addEventListener('input', function (e) {
      repeaterClassFilter.max = parseInt(e.target.value);
      document.getElementById('class-max-value').textContent = e.target.value;
      renderRadarData();
      updateStats();
    });

    // Range factor slider
    document.getElementById('range-factor').addEventListener('input', function (e) {
      rangeFactor = parseFloat(e.target.value);
      const percentage = Math.round(rangeFactor * 100);
      let label = percentage + '%';
      if (rangeFactor === 1.0) {
        label = 'Max bewezen';
      } else if (rangeFactor <= 0.5) {
        label = percentage + '% (conservatief)';
      }
      document.getElementById('range-factor-value').textContent = label;
      renderRadarData();
    });

    document.getElementById('layer-companions').addEventListener('change', function (e) {
      vectorLayers.companions.setVisible(e.target.checked);
    });

    document.getElementById('layer-links').addEventListener('change', function (e) {
      vectorLayers.links.setVisible(e.target.checked);
      if (e.target.checked && !linkAnimationRunning) {
        animateLinks(); // Restart animation if layer is shown
      }
    });

    document.getElementById('layer-ranges').addEventListener('change', function (e) {
      vectorLayers.ranges.setVisible(e.target.checked);
    });

    document.getElementById('layer-planned').addEventListener('change', function (e) {
      vectorLayers.planned.setVisible(e.target.checked);
    });

    document.getElementById('layer-obstructions').addEventListener('change', function (e) {
      obstructionLayer.setVisible(e.target.checked);
    });

    document.getElementById('layer-towers').addEventListener('change', function (e) {
      vectorLayers.towers.setVisible(e.target.checked);
    });

    document.getElementById('layer-settlements').addEventListener('change', function (e) {
      vectorLayers.settlements.setVisible(e.target.checked);
    });

    document.getElementById('layer-coverage').addEventListener('change', function (e) {
      vectorLayers.coverage.setVisible(e.target.checked);
    });

    document.getElementById('layer-nocoverage').addEventListener('change', function (e) {
      vectorLayers.noCoverage.setVisible(e.target.checked);
    });

    // Add repeater dialog
    document.getElementById('btn-close-add-repeater').addEventListener('click', function () {
      closeAddRepeaterDialog();
    });
    
    document.getElementById('btn-cancel-add-repeater').addEventListener('click', function () {
      closeAddRepeaterDialog();
    });
    
    document.getElementById('add-repeater-dialog').querySelector('.modal__overlay').addEventListener('click', function () {
      closeAddRepeaterDialog();
    });
    
    document.getElementById('add-repeater-form').addEventListener('submit', function (e) {
      e.preventDefault();
      submitAddRepeater();
    });

    // Tool buttons
    document.getElementById('tool-add-repeater').addEventListener('click', function () {
      setActiveTool('add-repeater');
    });

    document.getElementById('tool-measure').addEventListener('click', function () {
      setActiveTool('measure');
    });

    document.getElementById('tool-coverage').addEventListener('click', function () {
      analyzeCoverage();
    });

    document.getElementById('tool-clear').addEventListener('click', function () {
      if (confirm('Weet je zeker dat je alle geplande locaties wilt verwijderen?')) {
        clearPlannedNodes();
      }
    });

    // Help modal
    document.getElementById('btn-help').addEventListener('click', function () {
      showModal(true);
    });

    document.getElementById('btn-close-help').addEventListener('click', function () {
      showModal(false);
    });

    document.getElementById('help-modal').querySelector('.modal__overlay').addEventListener('click', function () {
      showModal(false);
    });

    // Export button
    document.getElementById('btn-export').addEventListener('click', exportPlanning);

    // Settlement search
    initSettlementSearch();
  }

  // ========== Settlement Search (SOLID Architecture) ==========

  /**
   * SettlementSearchController - Main controller following SOLID principles
   * Single Responsibility: Orchestrate search functionality
   */
  class SettlementSearchController {
    constructor(config) {
      this.searchInput = config.searchInput;
      this.resultsContainer = config.resultsContainer;
      this.statusAnnouncer = config.statusAnnouncer;
      this.dataProvider = config.dataProvider;
      this.mapController = config.mapController;
      
      this.searchEngine = new SettlementSearchEngine();
      this.uiRenderer = new SettlementSearchUIRenderer(this.resultsContainer);
      this.eventHandler = new SettlementSearchEventHandler(this);
      this.accessibilityManager = new SettlementSearchA11yManager(
        this.searchInput,
        this.resultsContainer,
        this.statusAnnouncer
      );
      
      this.state = {
        highlightedIndex: -1,
        currentResults: [],
        isOpen: false
      };
      
      this.init();
    }
    
    init() {
      this.eventHandler.attachEventListeners();
      this.accessibilityManager.init();
    }
    
    performSearch(query) {
      // Update ARIA state
      this.accessibilityManager.announceSearching();
      
      if (!query || query.length < 1) {
        this.closeResults();
        return;
      }
      
      const data = this.dataProvider.getData();
      const results = this.searchEngine.search(query, data);
      
      this.state.currentResults = results;
      this.state.highlightedIndex = -1;
      
      if (results.length === 0) {
        this.uiRenderer.renderNoResults();
        this.accessibilityManager.announceNoResults(query);
      } else {
        this.uiRenderer.renderResults(results, (settlement) => {
          this.selectSettlement(settlement);
        });
        this.accessibilityManager.announceResults(results.length);
      }
      
      this.openResults();
    }
    
    selectSettlement(settlement) {
      const { coordinates, name } = settlement;
      this.mapController.zoomToSettlement(coordinates[0], coordinates[1], name);
      this.searchInput.value = name;
      this.closeResults();
      this.accessibilityManager.announceSelection(name);
    }
    
    navigateResults(direction) {
      const resultsCount = this.state.currentResults.length;
      
      if (direction === 'down') {
        this.state.highlightedIndex = Math.min(
          this.state.highlightedIndex + 1,
          resultsCount - 1
        );
      } else if (direction === 'up') {
        this.state.highlightedIndex = Math.max(
          this.state.highlightedIndex - 1,
          -1
        );
      }
      
      this.uiRenderer.updateHighlight(this.state.highlightedIndex);
      this.accessibilityManager.updateActivedescendant(this.state.highlightedIndex);
    }
    
    selectHighlighted() {
      if (this.state.highlightedIndex >= 0 && 
          this.state.currentResults[this.state.highlightedIndex]) {
        const settlement = this.state.currentResults[this.state.highlightedIndex];
        this.selectSettlement({
          coordinates: settlement.feature.geometry.coordinates,
          name: settlement.feature.properties.name
        });
      }
    }
    
    openResults() {
      this.state.isOpen = true;
      this.resultsContainer.classList.add('settlement-search__results--visible');
      this.accessibilityManager.setExpanded(true);
    }
    
    closeResults() {
      this.state.isOpen = false;
      this.resultsContainer.classList.remove('settlement-search__results--visible');
      this.accessibilityManager.setExpanded(false);
    }
    
    reset() {
      this.searchInput.value = '';
      this.state.highlightedIndex = -1;
      this.state.currentResults = [];
      this.closeResults();
    }
  }

  /**
   * SettlementSearchEngine - Search logic (Open/Closed Principle)
   * Can be extended with new search strategies without modification
   */
  class SettlementSearchEngine {
    constructor() {
      this.maxResults = 10;
    }
    
    search(query, data) {
      const normalizedQuery = this.normalizeQuery(query);
      
      return data
        .map(feature => this.scoreFeature(feature, normalizedQuery))
        .filter(item => item.score > 0)
        .sort((a, b) => this.compareResults(a, b))
        .slice(0, this.maxResults);
    }
    
    normalizeQuery(query) {
      return query.toLowerCase().trim();
    }
    
    scoreFeature(feature, normalizedQuery) {
      const props = feature.properties;
      const name = props.name.toLowerCase();
      const type = props.type.toLowerCase();
      const gemeente = props.gemeente ? props.gemeente.toLowerCase() : '';
      
      let score = 0;
      
      // Exact match gets highest priority
      if (name === normalizedQuery) {
        score += 200;
      }
      // Starts with query
      else if (name.startsWith(normalizedQuery)) {
        score += 100;
      }
      // Contains query
      else if (name.includes(normalizedQuery)) {
        score += 50;
      }
      
      // Type match
      if (type.includes(normalizedQuery)) {
        score += 20;
      }
      
      // Municipality match
      if (gemeente.includes(normalizedQuery)) {
        score += 10;
      }
      
      return { feature, score };
    }
    
    compareResults(a, b) {
      // Sort by score
      if (b.score !== a.score) return b.score - a.score;
      
      // Then by population
      const popA = a.feature.properties.population || 0;
      const popB = b.feature.properties.population || 0;
      if (popB !== popA) return popB - popA;
      
      // Then alphabetically
      return a.feature.properties.name.localeCompare(b.feature.properties.name);
    }
  }

  /**
   * SettlementSearchUIRenderer - Rendering logic (Single Responsibility)
   */
  class SettlementSearchUIRenderer {
    constructor(container) {
      this.container = container;
      this.iconMap = {
        'stad': '🏙️',
        'plaats': '🏘️',
        'dorp': '🏡',
        'buurtschap': '🏠'
      };
    }
    
    renderResults(results, onSelectCallback) {
      const html = results
        .map((item, index) => this.createResultHTML(item, index))
        .join('');
      
      this.container.innerHTML = html;
      this.attachResultClickHandlers(results, onSelectCallback);
    }
    
    createResultHTML(item, index) {
      const props = item.feature.properties;
      const coords = item.feature.geometry.coordinates;
      const icon = this.getIcon(props.type);
      const population = this.formatPopulation(props.population);
      const gemeente = props.gemeente || '';
      
      return `
        <div 
          class=\"settlement-search__result\" 
          role=\"option\"
          id=\"search-result-${index}\"
          data-index=\"${index}\"
          data-lon=\"${coords[0]}\" 
          data-lat=\"${coords[1]}\" 
          data-name=\"${props.name}\"
          tabindex=\"-1\"
          aria-selected=\"false\"
        >
          <span class=\"settlement-search__result-icon\" aria-hidden=\"true\">${icon}</span>
          <div class=\"settlement-search__result-content\">
            <span class=\"settlement-search__result-name\">${this.escapeHTML(props.name)}</span>
            <div class=\"settlement-search__result-meta\">
              <span class=\"settlement-search__result-type settlement-search__result-type--${props.type}\">
                ${this.escapeHTML(props.type)}
              </span>
              ${population ? `<span aria-label=\"${population} inwoners\">・${population} inwoners</span>` : ''}
              ${gemeente ? `<span aria-label=\"Gemeente ${gemeente}\">・${this.escapeHTML(gemeente)}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }
    
    renderNoResults() {
      this.container.innerHTML = `
        <div class=\"settlement-search__no-results\" role=\"status\">
          <p>Geen resultaten gevonden</p>
          <small>Probeer een andere zoekterm</small>
        </div>
      `;
    }
    
    updateHighlight(highlightedIndex) {
      const results = this.container.querySelectorAll('.settlement-search__result');
      
      results.forEach((result, index) => {
        const isHighlighted = index === highlightedIndex;
        result.classList.toggle('settlement-search__result--highlighted', isHighlighted);
        result.setAttribute('aria-selected', isHighlighted ? 'true' : 'false');
        
        if (isHighlighted) {
          result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      });
    }
    
    attachResultClickHandlers(results, onSelectCallback) {
      const resultElements = this.container.querySelectorAll('.settlement-search__result');
      
      resultElements.forEach((element, index) => {
        element.addEventListener('click', () => {
          const settlement = {
            coordinates: [
              parseFloat(element.dataset.lon),
              parseFloat(element.dataset.lat)
            ],
            name: element.dataset.name
          };
          onSelectCallback(settlement);
        });
      });
    }
    
    getIcon(type) {
      return this.iconMap[type] || '📍';
    }
    
    formatPopulation(population) {
      if (!population) return '';
      return `${Math.round(population / 1000)}k`;
    }
    
    escapeHTML(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
  }

  /**
   * SettlementSearchEventHandler - Event handling (Single Responsibility)
   */
  class SettlementSearchEventHandler {
    constructor(controller) {
      this.controller = controller;
      this.searchTimeout = null;
      this.debounceDelay = 200;
    }
    attachEventListeners() {
      this.attachInputListener();
      this.attachKeyboardListener();
      this.attachClickOutsideListener();
    }
    attachInputListener() {
      this.controller.searchInput.addEventListener('input', (e) => {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          this.controller.performSearch(e.target.value);
        }, this.debounceDelay);
      });
    }
    attachKeyboardListener() {
      this.controller.searchInput.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            this.controller.navigateResults('down');
            break;
          case 'ArrowUp':
            e.preventDefault();
            this.controller.navigateResults('up');
            break;
          case 'Enter':
            e.preventDefault();
            this.controller.selectHighlighted();
            break;
          case 'Escape':
            e.preventDefault();
            this.controller.reset();
            break;
        }
      });
    }
    attachClickOutsideListener() {
      document.addEventListener('click', (e) => {
        const isClickInside = 
          this.controller.searchInput.contains(e.target) ||
          this.controller.resultsContainer.contains(e.target);
        
        if (!isClickInside && this.controller.state.isOpen) {
          this.controller.closeResults();
        }
      });
    }
  }

  /**
   * SettlementSearchA11yManager - Accessibility management (Single Responsibility)
   * Handles all WCAG AAA compliance requirements
   */
  class SettlementSearchA11yManager {
    constructor(input, results, announcer) {
      this.input = input;
      this.results = results;
      this.announcer = announcer;
    }
    init() {
      // Ensure proper ARIA setup
      this.setExpanded(false);
    }
    setExpanded(isExpanded) {
      this.input.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    }
    updateActivedescendant(index) {
      if (index >= 0) {
        this.input.setAttribute('aria-activedescendant', `search-result-${index}`);
      } else {
        this.input.setAttribute('aria-activedescendant', '');
      }
    }
    announceSearching() {
      // Announce to screen readers
      this.announcer.textContent = 'Aan het zoeken...';
    }
    announceResults(count) {
      // Announce result count to screen readers
      const message = count === 1 
        ? '1 resultaat gevonden'
        : `${count} resultaten gevonden`;
      this.announcer.textContent = message;
    }
    
    announceNoResults(query) {
      this.announcer.textContent = `Geen resultaten gevonden voor \"${query}\"`;
    }
    announceSelection(name) {
      this.announcer.textContent = `${name} geselecteerd. Kaart wordt ingezoomd.`;
    }
  }

  /**
   * MapController adapter - Dependency Inversion Principle
   * Allows search to work with any map implementation
   */
  class SettlementMapController {
    constructor(mapInstance, vectorLayers) {
      this.map = mapInstance;
      this.vectorLayers = vectorLayers;
    }
    
    zoomToSettlement(lon, lat, name) {
      const coords = ol.proj.fromLonLat([lon, lat]);
      const view = this.map.getView();
      
      // Ensure settlements layer is visible
      if (!this.vectorLayers.settlements.getVisible()) {
        this.vectorLayers.settlements.setVisible(true);
        const checkbox = document.getElementById('layer-settlements');
        if (checkbox) checkbox.checked = true;
      }
      
      // Smooth animated zoom
      view.animate({
        center: coords,
        zoom: 14,
        duration: 800,
        easing: ol.easing.easeOut
      });

      // Visual feedback
      setTimeout(() => {
        this.flashMarker(coords, name);
      }, 400);
    }
    flashMarker(coords, name) {
      const highlightFeature = new ol.Feature({
        geometry: new ol.geom.Point(coords),
        name: name
      });

      const highlightStyle = new ol.style.Style({
        image: new ol.style.RegularShape({
          points: 5,
          radius: 20,
          radius2: 8, // Star inner radius
          angle: 0,
          stroke: new ol.style.Stroke({
            color: '#2d6a4f',
            width: 3
          }),
          fill: new ol.style.Fill({
            color: 'rgba(45, 106, 79, 0.2)'
          })
        }),
        text: new ol.style.Text({
          text: name,
          offsetY: -30,
          font: 'bold 14px sans-serif',
          fill: new ol.style.Fill({ color: '#fff' }),
          stroke: new ol.style.Stroke({ color: '#000', width: 3 }),
          backgroundFill: new ol.style.Fill({ color: 'rgba(0, 0, 0, 0.8)' }),
          padding: [4, 8, 4, 8]
        })
      });

      highlightFeature.setStyle(highlightStyle);

      const source = this.vectorLayers.settlements.getSource();
      source.addFeature(highlightFeature);

      // Pulse animation
      this.animatePulse(highlightFeature, highlightStyle, source);
    }
    animatePulse(feature, style, source) {
      let pulseCount = 0;
      const pulseInterval = setInterval(() => {
        const radius = 20 + Math.sin(pulseCount * 0.5) * 5;
        const radius2 = 8 + Math.sin(pulseCount * 0.5) * 2;
        const opacity = 0.3 + Math.sin(pulseCount * 0.5) * 0.2;
        
        style.getImage().setRadius(radius);
        style.getImage().setRadius2(radius2);
        style.getImage().getFill().setColor(`rgba(45, 106, 79, ${opacity})`);
        
        feature.changed();
        pulseCount++;

        if (pulseCount > 8) {
          clearInterval(pulseInterval);
          setTimeout(() => source.removeFeature(feature), 1500);
        }
      }, 150);
    }
  }

  /**
   * Initialize settlement search with SOLID architecture
   */
  function initSettlementSearch() {
    const searchInput = document.getElementById('settlement-search-input');
    const resultsContainer = document.getElementById('settlement-search-results');
    const statusAnnouncer = document.getElementById('search-status');
    
    if (!searchInput || !resultsContainer || !statusAnnouncer) {
      console.error('Settlement search elements not found');
      return;
    }
    
    // Create map controller
    const mapController = new SettlementMapController(map, vectorLayers);
    
    // Create search controller with dependency injection
    const searchController = new SettlementSearchController({
      searchInput,
      resultsContainer,
      statusAnnouncer,
      dataProvider: {
        getData: () => settlementsData
      },
      mapController
    });
    
    // Store reference for potential external use
    window.settlementSearch = searchController;
  }

  // ========== Repeater Classification ==========

  /**
   * Classify repeater based on reliability metrics:
   * Class 8: Backbone nodes (high weight, many links, always online)
   * Class 7: Very reliable (high uptime, stable links)
   * Class 6: Reliable (good uptime, multiple links)
   * Class 5: Good (decent uptime, some links)
   * Class 4: Average (moderate uptime)
   * Class 3: Below average (low uptime)
   * Class 2: Poor (rarely online, few links)
   * Class 1: Very poor (unstable)
   * Class 0: Unreliable (no stable links)
   */
  function classifyRepeater(node, links) {
    if (!node.location) return 0;
    
    const isFresh = checkFreshness(node.last_seen);
    if (!isFresh) return Math.min(2, Math.floor((node.node_weight || 0) / 100)); // Offline nodes max class 2
    
    // Count links involving this node
    const nodeLinks = links.filter(l => 
      l.node_a === node.public_key || l.node_b === node.public_key
    );
    const linkCount = nodeLinks.length;
    const avgConfidence = linkCount > 0 
      ? nodeLinks.reduce((sum, l) => sum + (l.confidence || 0), 0) / linkCount 
      : 0;
    const maxDistance = linkCount > 0
      ? Math.max(...nodeLinks.map(l => l.distance_km || 0))
      : 0;
    
    const weight = node.node_weight || 0;
    
    // Calculate score (0-100)
    let score = 0;
    score += Math.min(40, weight / 10); // Weight contributes 0-40 points
    score += Math.min(30, linkCount * 3); // Links contribute 0-30 points
    score += Math.min(20, avgConfidence / 5); // Confidence contributes 0-20 points
    score += Math.min(10, maxDistance); // Range contributes 0-10 points
    
    // Convert score to class (0-8)
    if (score >= 90) return 8; // Backbone
    if (score >= 80) return 7; // Very reliable
    if (score >= 70) return 6; // Reliable
    if (score >= 60) return 5; // Good
    if (score >= 45) return 4; // Average
    if (score >= 30) return 3; // Below average
    if (score >= 15) return 2; // Poor
    if (score >= 5) return 1;  // Very poor
    return 0; // Unreliable
  }

  function getClassColor(classification) {
    // Colorblind-friendly palette: blue (best) to orange/brown (worst)
    const colors = {
      8: '#003f5c', // Dark blue - Backbone
      7: '#2f4b7c', // Medium dark blue - Very reliable
      6: '#665191', // Purple-blue - Reliable
      5: '#a05195', // Purple - Good
      4: '#d45087', // Magenta - Average
      3: '#f95d6a', // Pink-orange - Below average
      2: '#ff7c43', // Orange - Poor
      1: '#ffa600', // Yellow-orange - Very poor
      0: '#d67000'  // Dark orange/brown - Unreliable
    };
    return colors[classification] || '#888';
  }

  function getClassLabel(classification) {
    const labels = {
      8: 'Backbone',
      7: 'Zeer betrouwbaar',
      6: 'Betrouwbaar',
      5: 'Goed',
      4: 'Gemiddeld',
      3: 'Matig',
      2: 'Zwak',
      1: 'Zeer zwak',
      0: 'Onbetrouwbaar'
    };
    return labels[classification] || 'Onbekend';
  }

  // ========== Data Loading ==========

  function loadRadarData() {
    setStatus('Data laden...');
    
    Promise.all([
      fetch(`${CONFIG.dataBase}/repeaters.json`).then(r => r.json()),
      fetch(`${CONFIG.dataBase}/companions.json`).then(r => r.json()),
      fetch(`${CONFIG.dataBase}/links.json`).then(r => r.json())
    ]).then(([repeaters, companions, links]) => {
      radarData.repeaters = repeaters;
      radarData.companions = companions;
      radarData.links = links;
      
      renderRadarData();
      setStatus('Gereed');
      updateStats();
    }).catch(err => {
      console.error('Error loading radar data:', err);
      setStatus('Fout bij laden data');
    });
  }

  function renderRadarData() {
    const visibleRepeaters = renderRepeaters();
    renderCompanions();
    renderLinks(visibleRepeaters);
    renderRanges(visibleRepeaters);
    renderCoverageHeatmap(visibleRepeaters);
    renderNoCoverage(visibleRepeaters);
  }

  function loadTowersData() {
    fetch('../data/towers-drenthe.json')
      .then(r => r.json())
      .then(data => {
        towersData = data.features || [];
        renderTowers();
      })
      .catch(err => {
        console.error('Error loading towers data:', err);
      });
  }

  function renderTowers() {
    const source = vectorLayers.towers.getSource();
    source.clear();

    towersData.forEach(feature => {
      const props = feature.properties;
      const coords = ol.proj.fromLonLat(feature.geometry.coordinates);

      const point = new ol.Feature({
        geometry: new ol.geom.Point(coords),
        name: props.name,
        type: 'tower',
        data: props
      });

      // Color and icon based on type and suitability
      let color = props.suitable_for_repeater ? '#ff6b35' : '#888';
      let iconType = getTowerIconType(props.type);
      
      // Create marker for towers with appropriate icon
      point.setStyle(createTowerStyle(color, props.height_m, iconType));
      source.addFeature(point);
    });

    // Add popup interaction
    addPopupInteraction();
  }
  
  /**
   * Get appropriate icon type for tower type
   */
  function getTowerIconType(towerType) {
    const iconMap = {
      'watertoren': ICON_TYPES.HEXAGON,      // Water tower
      'zendmast': ICON_TYPES.ANTENNA,        // Transmission tower
      'kerktoren': ICON_TYPES.STAR,          // Church tower
      'flatgebouw': ICON_TYPES.BUILDING,     // Apartment building
      'schoorsteen': ICON_TYPES.TRIANGLE     // Chimney
    };
    return iconMap[towerType] || ICON_TYPES.TOWER;
  }

  function createTowerStyle(color, height, iconType = ICON_TYPES.TOWER) {
    // Size based on height (higher = larger marker)
    const size = Math.min(8 + height / 10, 16);
    
    return createIconStyle(iconType, color, size, {
      strokeColor: '#fff',
      strokeWidth: 2
    });
  }

  function loadSettlementsData() {
    fetch('../data/settlements-drenthe.json')
      .then(r => r.json())
      .then(data => {
        settlementsData = data.features || [];
        renderSettlements();
        // Also render coverage layers if radar data is already loaded
        if (radarData.repeaters.length > 0) {
          updateCoverageLayers();
        }
      })
      .catch(err => {
        console.error('Error loading settlements data:', err);
      });
  }

  function renderSettlements() {
    const source = vectorLayers.settlements.getSource();
    source.clear();

    settlementsData.forEach(feature => {
      const props = feature.properties;
      const coords = ol.proj.fromLonLat(feature.geometry.coordinates);

      const point = new ol.Feature({
        geometry: new ol.geom.Point(coords),
        name: props.name,
        type: 'settlement',
        data: props
      });

      // Color, size, and icon based on settlement type and population
      let color, radius, iconType;
      if (props.type === 'stad') {
        color = '#FFC107'; // Amber/gold for cities
        radius = 8;
        iconType = ICON_TYPES.OCTAGON; // 8-sided for cities
      } else if (props.type === 'plaats') {
        color = '#FFE082'; // Light amber for towns
        radius = 6;
        iconType = ICON_TYPES.HEXAGON; // 6-sided for towns
      } else if (props.type === 'dorp') {
        color = '#FFF59D'; // Very light yellow for villages
        radius = 4;
        iconType = ICON_TYPES.PENTAGON; // 5-sided for villages
      } else if (props.type === 'buurtschap') {
        color = '#FFFDE7'; // Extremely light yellow for hamlets
        radius = 3;
        iconType = ICON_TYPES.DIAMOND; // Diamond for hamlets
      } else {
        color = '#FFF59D'; // Default to village color
        radius = 4;
        iconType = ICON_TYPES.SQUARE;
      }

      // Create marker for settlements with appropriate icon
      point.setStyle(createIconStyle(iconType, color, radius, {
        strokeColor: '#FF6F00',
        strokeWidth: 1.5
      }));

      source.addFeature(point);
    });

    // Add popup interaction
    addPopupInteraction();
  }

  // ========== Coverage Analysis ==========

  // Calculate range for a single repeater node (in meters)
  function calculateRepeaterRange(node, links) {
    if (!node || !node.public_key) return CONFIG.defaultRange * 1000; // Default in meters

    let totalDistance = 0;
    let linkCount = 0;
    let maxDistance = 0;

    // Collect link distances for this node
    links.forEach(link => {
      const d = link.distance_km || 0;
      if (d <= 0 || d > 15) return; // Ignore unrealistic links
      
      if (link.node_a === node.public_key || link.node_b === node.public_key) {
        totalDistance += d;
        linkCount++;
        if (d > maxDistance) maxDistance = d;
      }
    });

    let rangeKm;
    
    if (linkCount === 0) {
      // No links: use conservative default based on classification
      const classification = classifyRepeater(node, links);
      rangeKm = 1 + (classification * 0.375); // 1-4 km based on class 0-8
    } else if (rangeFactor === 1.0) {
      // Maximum mode: use longest proven link
      rangeKm = maxDistance;
    } else {
      // Average mode: use average link distance × factor
      const avgRange = totalDistance / linkCount;
      rangeKm = avgRange * rangeFactor;
    }

    // Minimum 0.5km, maximum 8km for realistic visualization
    rangeKm = Math.max(0.5, Math.min(8, rangeKm));
    
    // Return in meters
    return rangeKm * 1000;
  }

  function renderCoverageHeatmap(visibleRepeaterKeys) {
    const source = vectorLayers.coverage.getSource();
    source.clear();

    // Create heatmap points from visible repeaters with weight based on classification and range
    radarData.repeaters.forEach(node => {
      if (!node.location) return;
      if (!visibleRepeaterKeys || !visibleRepeaterKeys.has(node.public_key)) return;

      const classification = classifyRepeater(node, radarData.links);
      const coords = ol.proj.fromLonLat([
        node.location.longitude,
        node.location.latitude
      ]);

      // Calculate weight: classification (0-8) normalized to 0-1, plus extra for higher classes
      const weight = (classification + 1) / 9;

      const feature = new ol.Feature({
        geometry: new ol.geom.Point(coords),
        weight: weight
      });

      source.addFeature(feature);
    });

    // Also add planned repeaters to heatmap
    plannedNodes.forEach(node => {
      const coords = ol.proj.fromLonLat(node.coordinates);
      const weight = (node.classification + 1) / 9;

      const feature = new ol.Feature({
        geometry: new ol.geom.Point(coords),
        weight: weight
      });

      source.addFeature(feature);
    });
  }

  function renderNoCoverage(visibleRepeaterKeys) {
    const source = vectorLayers.noCoverage.getSource();
    source.clear();

    if (settlementsData.length === 0) return;

    // Get all repeaters (both existing and planned) with their ranges
    const activeRepeaters = [];
    
    radarData.repeaters.forEach(node => {
      if (!node.location) return;
      if (!visibleRepeaterKeys || !visibleRepeaterKeys.has(node.public_key)) return;

      const classification = classifyRepeater(node, radarData.links);
      const range = calculateRepeaterRange(node, radarData.links);
      
      activeRepeaters.push({
        coords: ol.proj.fromLonLat([node.location.longitude, node.location.latitude]),
        range: range,
        classification: classification
      });
    });

    // Add planned repeaters
    plannedNodes.forEach(node => {
      activeRepeaters.push({
        coords: ol.proj.fromLonLat(node.coordinates),
        range: node.range * 1000, // Convert km to meters
        classification: node.classification
      });
    });

    // Check each settlement for coverage
    settlementsData.forEach(feature => {
      const props = feature.properties;
      const settlementCoords = ol.proj.fromLonLat(feature.geometry.coordinates);

      // Check if any repeater covers this settlement
      let hasCoverage = false;
      for (const repeater of activeRepeaters) {
        const distance = getDistance(settlementCoords, repeater.coords);
        if (distance <= repeater.range) {
          hasCoverage = true;
          break;
        }
      }

      // If no coverage, add to no-coverage layer
      if (!hasCoverage) {
        const point = new ol.Feature({
          geometry: new ol.geom.Point(settlementCoords),
          name: props.name,
          type: 'no-coverage',
          data: props
        });

        // Warning marker with alert icon - larger and more prominent
        let radius;
        if (props.type === 'stad') {
          radius = 10;
        } else if (props.type === 'plaats') {
          radius = 8;
        } else {
          radius = 6;
        }

        point.setStyle(createIconStyle(ICON_TYPES.ALERT, '#ff0000', radius, {
          strokeColor: '#cc0000',
          strokeWidth: 2
        }));
        
        point.setProperties({ zIndex: 100 }); // Always on top
        source.addFeature(point);
      }
    });
  }

  // Helper function to calculate distance between two coordinates in meters
  // Coordinates should be in Web Mercator projection (EPSG:3857)
  function getDistance(coord1, coord2) {
    const dx = coord2[0] - coord1[0];
    const dy = coord2[1] - coord1[1];
    // In Web Mercator, the units are already meters, so direct Euclidean distance works
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Helper function to update no-coverage layer (call when data changes)
  function updateNoCoverageLayer() {
    const visibleRepeaterKeys = getVisibleRepeaterKeys();
    renderNoCoverage(visibleRepeaterKeys);
  }

  // Helper function to get current visible repeater keys based on filters
  function getVisibleRepeaterKeys() {
    const visibleRepeaterKeys = new Set();
    radarData.repeaters.forEach(node => {
      if (!node.location) return;
      const classification = classifyRepeater(node, radarData.links);
      if (classification >= repeaterClassFilter.min && classification <= repeaterClassFilter.max) {
        visibleRepeaterKeys.add(node.public_key);
      }
    });
    return visibleRepeaterKeys;
  }

  // Helper function to update all coverage layers
  function updateCoverageLayers() {
    const visibleRepeaterKeys = getVisibleRepeaterKeys();
    renderCoverageHeatmap(visibleRepeaterKeys);
    renderNoCoverage(visibleRepeaterKeys);
  }

  function renderRepeaters() {
    const source = vectorLayers.repeaters.getSource();
    source.clear();

    const visibleRepeaterKeys = new Set();

    radarData.repeaters.forEach(node => {
      if (!node.location) return;

      const isFresh = checkFreshness(node.last_seen);
      const classification = classifyRepeater(node, radarData.links);
      
      // Apply class filter
      if (classification < repeaterClassFilter.min || classification > repeaterClassFilter.max) {
        return;
      }

      // Track visible repeater
      visibleRepeaterKeys.add(node.public_key);

      const coords = ol.proj.fromLonLat([
        node.location.longitude,
        node.location.latitude
      ]);

      const feature = new ol.Feature({
        geometry: new ol.geom.Point(coords),
        name: node.name,
        type: 'repeater',
        fresh: isFresh,
        classification: classification,
        data: node
      });

      const color = isFresh ? getClassColor(classification) : '#555';
      const radius = 6 + classification * 0.5; // Size increases with class
      
      // Use different icon types based on classification
      let iconType;
      if (classification >= 7) {
        iconType = ICON_TYPES.STAR; // High-class backbone nodes
      } else if (classification >= 5) {
        iconType = ICON_TYPES.HEXAGON; // Good/reliable nodes
      } else if (classification >= 3) {
        iconType = ICON_TYPES.PENTAGON; // Average nodes
      } else if (classification >= 1) {
        iconType = ICON_TYPES.CIRCLE; // Low-class nodes
      } else {
        iconType = ICON_TYPES.CROSS; // Unreliable nodes
      }
      
      feature.setStyle(createIconStyle(iconType, color, radius, {
        strokeColor: '#fff',
        strokeWidth: isFresh ? 2 : 1
      }));
      source.addFeature(feature);
    });

    // Add popup interaction
    addPopupInteraction();
    
    return visibleRepeaterKeys;
  }

  function renderCompanions() {
    const source = vectorLayers.companions.getSource();
    source.clear();

    radarData.companions.forEach(node => {
      if (!node.location) return;

      const isFresh = checkFreshness(node.last_seen);
      const coords = ol.proj.fromLonLat([
        node.location.longitude,
        node.location.latitude
      ]);

      const feature = new ol.Feature({
        geometry: new ol.geom.Point(coords),
        name: node.name,
        type: 'companion',
        fresh: isFresh,
        data: node
      });

      // Companions use diamond shape to distinguish from repeaters
      const color = isFresh ? '#48cae4' : '#444';
      feature.setStyle(createIconStyle(ICON_TYPES.DIAMOND, color, 6, {
        strokeColor: '#fff',
        strokeWidth: isFresh ? 2 : 1
      }));
      source.addFeature(feature);
    });
  }

  function renderLinks(visibleRepeaterKeys) {
    const source = vectorLayers.links.getSource();
    source.clear();

    // If no visible repeaters set provided, show all links
    const filterLinks = visibleRepeaterKeys && visibleRepeaterKeys.size > 0;

    radarData.links.forEach(link => {
      if (!link.node_a_location || !link.node_b_location) return;

      // Filter: only show links where both endpoints are visible repeaters
      if (filterLinks) {
        if (!visibleRepeaterKeys.has(link.node_a) || !visibleRepeaterKeys.has(link.node_b)) {
          return;
        }
      }

      const coordsA = ol.proj.fromLonLat([
        link.node_a_location.longitude,
        link.node_a_location.latitude
      ]);
      const coordsB = ol.proj.fromLonLat([
        link.node_b_location.longitude,
        link.node_b_location.latitude
      ]);

      const feature = new ol.Feature({
        geometry: new ol.geom.LineString([coordsA, coordsB]),
        type: 'link',
        data: link
      });

      // Calculate link strength metrics
      const confidence = link.confidence || 50;
      const snr = link.snr || link.rxSnr || 0;
      
      // Determine link strength (0-100 scale)
      // Higher confidence and SNR = stronger link
      let strength = confidence;
      if (snr > 0) {
        // SNR typically ranges from -20 to +10 dB
        // Normalize: -20dB=0, 10dB=100
        const normalizedSnr = Math.max(0, Math.min(100, ((snr + 20) / 30) * 100));
        strength = (confidence + normalizedSnr) / 2; // Average both metrics
      }
      
      // Color based on distance (visual hierarchy)
      let baseColor;
      if (link.distance_km > 15) {
        baseColor = [244, 162, 97]; // Orange for long distance
      } else if (link.distance_km > 5) {
        baseColor = [72, 202, 228]; // Cyan for medium distance
      } else {
        baseColor = [116, 198, 157]; // Green for short distance
      }
      
      // Opacity varies by strength: 0.3 (weak) to 0.9 (strong)
      const opacity = 0.3 + (strength / 100) * 0.6;
      
      // Width varies by strength: 1px (weak) to 4px (strong)
      const width = 1 + (strength / 100) * 3;
      
      // Dot pattern varies by distance type
      // Long distance (Yagi/directional): sparse dots
      // Short distance (omni): dense dots
      let dashLength, gapLength;
      
      if (link.distance_km > 10) {
        // Long distance directional (Yagi style) - SPARSE
        dashLength = 3 + (strength / 100) * 2; // 3-5px
        gapLength = 20 + (100 - strength) / 10; // 20-30px gaps
      } else if (link.distance_km > 5) {
        // Medium distance (semi-directional)
        dashLength = 4 + (strength / 100) * 3; // 4-7px
        gapLength = 12 + (100 - strength) / 10; // 12-22px gaps
      } else {
        // Short distance local (omni-directional) - DENSE
        dashLength = 6 + (strength / 100) * 4; // 6-10px
        gapLength = 6 + (100 - strength) / 20; // 6-11px gaps
      }
      
      const lineDash = [dashLength, gapLength];
      
      const color = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${opacity})`;

      feature.setStyle(new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: color,
          width: width,
          lineDash: lineDash,
          lineDashOffset: 0 // Will be animated
        })
      }));
      
      // Store strength for animation
      feature.set('strength', strength);

      source.addFeature(feature);
    });
    
    // Start link animation
    animateLinks();
  }
  
  /**
   * Animate link lines with streaming packet effect
   * Shows moving dots/dashes along the line, faster for stronger links
   */
  function animateLinks() {
    const source = vectorLayers.links.getSource();
    if (!source) return;
    
    // Prevent multiple animation loops
    if (linkAnimationRunning) return;
    linkAnimationRunning = true;
    
    let frame = 0;
    const animate = () => {
      const isVisible = vectorLayers.links.getVisible();
      
      if (!isVisible) {
        // Pause animation if layer is hidden, but keep checking
        linkAnimationRunning = false;
        return;
      }
      
      const features = source.getFeatures();
      frame++;
      
      features.forEach(feature => {
        const link = feature.get('data');
        const strength = feature.get('strength') || 50;
        
        if (!link) return;
        
        // Base metrics
        const confidence = link.confidence || 50;
        
        // Color based on distance
        let baseColor;
        if (link.distance_km > 15) {
          baseColor = [244, 162, 97]; // Orange
        } else if (link.distance_km > 5) {
          baseColor = [72, 202, 228]; // Cyan
        } else {
          baseColor = [116, 198, 157]; // Green
        }
        
        // Styling based on strength
        const baseOpacity = 0.3 + (strength / 100) * 0.6;
        const baseWidth = 1 + (strength / 100) * 3;
        
        // Add subtle pulse to width (much smaller than before)
        const pulsePhase = Math.sin((frame / 60) * Math.PI * 2);
        const widthPulse = 1 + (pulsePhase * 0.15 * (strength / 100)); // Max 15% variation
        const width = baseWidth * widthPulse;
        
        // Streaming animation: move the dash offset
        // Stronger links = faster streaming (more packets/second)
        const speedMultiplier = 0.5 + (strength / 100) * 1.5; // 0.5x to 2x speed
        const dashOffset = -(frame * speedMultiplier * 0.5) % 100; // Negative = forward direction
        
        // Dash pattern varies by BOTH strength AND distance
        // Long distance (Yagi/directional): sparse dots (focused beam)
        // Short distance (omni): dense dots (broadcast)
        let dashLength, gapLength;
        
        if (link.distance_km > 10) {
          // Long distance directional (Yagi antenna style)
          // Very sparse, focused beam pattern
          dashLength = 3 + (strength / 100) * 2; // 3-5px dots
          gapLength = 20 + (100 - strength) / 10; // 20-30px gaps (SPARSE)
        } else if (link.distance_km > 5) {
          // Medium distance (semi-directional)
          dashLength = 4 + (strength / 100) * 3; // 4-7px
          gapLength = 12 + (100 - strength) / 10; // 12-22px gaps
        } else {
          // Short distance local (omni-directional)
          // Dense pattern for local broadcast
          dashLength = 6 + (strength / 100) * 4; // 6-10px dots
          gapLength = 6 + (100 - strength) / 20; // 6-11px gaps (DENSE)
        }
        
        const lineDash = [dashLength, gapLength];
        
        // Low confidence gets even sparser pattern
        const finalLineDash = confidence < 50 
          ? [dashLength * 0.7, gapLength * 2.0] 
          : lineDash;
        
        const color = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${baseOpacity})`;
        
        feature.setStyle(new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: color,
            width: width,
            lineDash: finalLineDash,
            lineDashOffset: dashOffset
          })
        }));
      });
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }

  function renderRanges(visibleRepeaterKeys) {
    const source = vectorLayers.ranges.getSource();
    source.clear();

    // Calculate reliable ranges from proven links
    // Use average of all links, not maximum, for more realistic coverage estimate
    const ranges = {};
    const linkCounts = {};
    
    radarData.links.forEach(link => {
      const d = link.distance_km || 0;
      if (d <= 0 || d > 15) return; // Ignore unrealistic long-distance links
      
      if (rangeFactor === 1.0) {
        // Maximum mode: track maximum distance
        if (!ranges[link.node_a] || d > ranges[link.node_a]) {
          ranges[link.node_a] = d;
        }
        if (!ranges[link.node_b] || d > ranges[link.node_b]) {
          ranges[link.node_b] = d;
        }
      } else {
        // Average mode: accumulate distances for averaging
        if (!ranges[link.node_a]) {
          ranges[link.node_a] = 0;
          linkCounts[link.node_a] = 0;
        }
        if (!ranges[link.node_b]) {
          ranges[link.node_b] = 0;
          linkCounts[link.node_b] = 0;
        }
        
        ranges[link.node_a] += d;
        linkCounts[link.node_a]++;
        ranges[link.node_b] += d;
        linkCounts[link.node_b]++;
      }
    });
    
    // Calculate ranges based on user-selected method
    Object.keys(ranges).forEach(key => {
      if (rangeFactor === 1.0) {
        // Maximum proven range mode - keep the max value already stored
        // ranges[key] already contains max from accumulation
      } else {
        // Average-based calculation with adjustable factor
        const avgRange = ranges[key] / linkCounts[key];
        ranges[key] = avgRange * rangeFactor;
      }
    });

    // Filter: only show ranges for visible repeaters
    const filterRanges = visibleRepeaterKeys && visibleRepeaterKeys.size > 0;

    // Draw range circles for fresh repeaters
    radarData.repeaters.forEach(node => {
      if (!node.location || !checkFreshness(node.last_seen)) return;
      
      // Apply visibility filter
      if (filterRanges && !visibleRepeaterKeys.has(node.public_key)) {
        return;
      }
      
      let rangeKm = ranges[node.public_key];
      
      // If no link data, use conservative default based on node class
      if (!rangeKm) {
        const classification = classifyRepeater(node, radarData.links);
        // Higher class = better assumed range (1-4 km)
        rangeKm = 1 + (classification * 0.375);
      }
      
      // Minimum 0.5km, maximum 8km for realistic visualization
      rangeKm = Math.max(0.5, Math.min(8, rangeKm));
      
      if (!rangeKm || rangeKm < 0.5) return;

      const coords = ol.proj.fromLonLat([
        node.location.longitude,
        node.location.latitude
      ]);

      const circle = new ol.geom.Circle(coords, rangeKm * 1000);
      const feature = new ol.Feature(circle);

      feature.setStyle(new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(116, 198, 157, 0.05)'
        }),
        stroke: new ol.style.Stroke({
          color: '#00C853',
          width: 1,
          lineDash: [5, 5]
        })
      }));

      source.addFeature(feature);
    });
  }

  // ========== Planning Tools ==========

  function showAddRepeaterDialog(coordinate) {
    pendingRepeaterCoordinate = coordinate;
    const dialog = document.getElementById('add-repeater-dialog');
    dialog.classList.add('modal--active');
    dialog.setAttribute('aria-hidden', 'false');
    
    // Set default values
    const coords = ol.proj.toLonLat(coordinate);
    document.getElementById('repeater-name').value = `Repeater ${planIdCounter}`;
    document.getElementById('repeater-elevation').value = '10';
    document.getElementById('repeater-range').value = '5';
    document.getElementById('repeater-class').value = '6';
    
    // Focus first input
    setTimeout(() => document.getElementById('repeater-name').focus(), 100);
  }
  
  function closeAddRepeaterDialog() {
    const dialog = document.getElementById('add-repeater-dialog');
    dialog.classList.remove('modal--active');
    dialog.setAttribute('aria-hidden', 'true');
    pendingRepeaterCoordinate = null;
    document.getElementById('add-repeater-form').reset();
  }
  
  function submitAddRepeater() {
    if (!pendingRepeaterCoordinate) return;
    
    const name = document.getElementById('repeater-name').value;
    const elevation = parseFloat(document.getElementById('repeater-elevation').value);
    const range = parseFloat(document.getElementById('repeater-range').value);
    const classification = parseInt(document.getElementById('repeater-class').value);
    
    addPlannedNode(pendingRepeaterCoordinate, name, elevation, range, classification);
    closeAddRepeaterDialog();
  }

  function addPlannedNode(coordinate, name, elevation, range, classification) {
    const coords = ol.proj.toLonLat(coordinate);
    const id = planIdCounter++;
    
    const plannedNode = {
      id: id,
      name: name,
      coords: coordinate,
      lon: coords[0],
      lat: coords[1],
      elevation: elevation,
      range: range,
      classification: classification
    };

    plannedNodes.push(plannedNode);
    renderPlannedNode(plannedNode);
    updatePlannedList();
    updateStats();
    
    // Update coverage layers if data is loaded
    if (radarData.repeaters.length > 0) {
      updateCoverageLayers();
    }
  }

  function renderPlannedNode(node) {
    const source = vectorLayers.planned.getSource();

    // Add marker with classification-based color and size
    const feature = new ol.Feature({
      geometry: new ol.geom.Point(node.coords),
      name: node.name,
      type: 'planned',
      classification: node.classification,
      elevation: node.elevation,
      data: node
    });

    const color = getClassColor(node.classification);
    const radius = 7 + node.classification * 0.5; // Same sizing as real repeaters
    
    // Use appropriate icon type based on classification (matching repeater icons)
    let iconType;
    if (node.classification >= 7) {
      iconType = ICON_TYPES.STAR; // High-class backbone nodes
    } else if (node.classification >= 5) {
      iconType = ICON_TYPES.HEXAGON; // Good/reliable nodes
    } else if (node.classification >= 3) {
      iconType = ICON_TYPES.PENTAGON; // Average nodes
    } else if (node.classification >= 1) {
      iconType = ICON_TYPES.CIRCLE; // Low-class nodes
    } else {
      iconType = ICON_TYPES.CROSS; // Unreliable nodes
    }
    
    feature.setStyle(createIconStyle(iconType, color, radius, {
      strokeColor: '#fff',
      strokeWidth: 2.5 // Slightly thicker to show it's planned
    }));
    feature.setId(`planned-${node.id}`);
    source.addFeature(feature);

    // Add range circle
    const circle = new ol.geom.Circle(node.coords, node.range * 1000);
    const circleFeature = new ol.Feature(circle);
    circleFeature.setId(`planned-range-${node.id}`);

    // Use classification color for range circle
    const rgbMatch = color.match(/[0-9a-fA-F]{2}/g);
    const r = parseInt(rgbMatch[0], 16);
    const g = parseInt(rgbMatch[1], 16);
    const b = parseInt(rgbMatch[2], 16);
    
    circleFeature.setStyle(new ol.style.Style({
      fill: new ol.style.Fill({
        color: `rgba(${r}, ${g}, ${b}, 0.05)`
      }),
      stroke: new ol.style.Stroke({
        color: color,
        width: 1,
        lineDash: [5, 5]
      })
    }));

    source.addFeature(circleFeature);
  }

  function removePlannedNode(id) {
    plannedNodes = plannedNodes.filter(n => n.id !== id);
    
    const source = vectorLayers.planned.getSource();
    const markerFeature = source.getFeatureById(`planned-${id}`);
    const rangeFeature = source.getFeatureById(`planned-range-${id}`);
    
    if (markerFeature) source.removeFeature(markerFeature);
    if (rangeFeature) source.removeFeature(rangeFeature);
    
    updatePlannedList();
    updateStats();
    
    // Update coverage layers if data is loaded
    if (radarData.repeaters.length > 0) {
      updateCoverageLayers();
    }
  }

  function clearPlannedNodes() {
    plannedNodes = [];
    vectorLayers.planned.getSource().clear();
    updatePlannedList();
    updateStats();
    
    // Update coverage layers if data is loaded
    if (radarData.repeaters.length > 0) {
      updateCoverageLayers();
    }
  }

  function updatePlannedList() {
    const list = document.getElementById('planned-list');
    const count = document.getElementById('planned-count');
    
    count.textContent = plannedNodes.length;

    if (plannedNodes.length === 0) {
      list.innerHTML = '<li class="planned-list__empty">Klik op de kaart om een repeater-locatie toe te voegen</li>';
      return;
    }

    list.innerHTML = plannedNodes.map(node => {
      const color = getClassColor(node.classification);
      return `
      <li class="planned-item">
        <div class="planned-item__info">
          <p class="planned-item__name">
            <span class="class-dot" style="background: ${color}; display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px;"></span>
            ${escapeHtml(node.name)}
          </p>
          <p class="planned-item__coords">${node.lat.toFixed(5)}, ${node.lon.toFixed(5)}</p>
          <p class="planned-item__range">Klasse ${node.classification} · ${node.elevation}m · Bereik: ${node.range} km</p>
        </div>
        <div class="planned-item__actions">
          <button class="btn-small" onclick="zoomToPlanned(${node.id})" title="Zoom naar locatie">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <button class="btn-small btn-small--danger" onclick="removePlanned(${node.id})" title="Verwijder">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </li>
      `;
    }).join('');
  }

  function setActiveTool(tool) {
    currentTool = tool;
    
    // Update button states
    document.querySelectorAll('.btn-tool').forEach(btn => {
      btn.classList.remove('btn-tool--active');
    });

    if (tool === 'add-repeater') {
      document.getElementById('tool-add-repeater').classList.add('btn-tool--active');
      if (measurementInteraction) {
        map.removeInteraction(measurementInteraction);
        measurementInteraction = null;
      }
      vectorLayers.measurement.getSource().clear();
      setStatus('Klik op de kaart om een repeater toe te voegen');
    } else if (tool === 'measure') {
      document.getElementById('tool-measure').classList.add('btn-tool--active');
      startMeasurement();
      setStatus('Klik om te beginnen met meten, dubbel-klik om te stoppen');
    }
  }

  function startMeasurement() {
    if (measurementInteraction) {
      map.removeInteraction(measurementInteraction);
    }

    const source = vectorLayers.measurement.getSource();
    source.clear();

    measurementInteraction = new ol.interaction.Draw({
      source: source,
      type: 'LineString',
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#f4a261',
          width: 3,
          lineDash: [10, 5]
        }),
        image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({ color: '#f4a261' })
        })
      })
    });

    measurementInteraction.on('drawend', function (evt) {
      const geom = evt.feature.getGeometry();
      const length = ol.sphere.getLength(geom);
      const lengthKm = (length / 1000).toFixed(2);
      
      setStatus(`Afstand: ${lengthKm} km`);
      
      // Add label
      const coords = geom.getLastCoordinate();
      const labelFeature = new ol.Feature({
        geometry: new ol.geom.Point(coords)
      });
      
      labelFeature.setStyle(new ol.style.Style({
        text: new ol.style.Text({
          text: `${lengthKm} km`,
          offsetY: -15,
          fill: new ol.style.Fill({ color: '#fff' }),
          stroke: new ol.style.Stroke({ color: '#000', width: 3 }),
          font: 'bold 14px sans-serif'
        })
      }));
      
      source.addFeature(labelFeature);
    });

    map.addInteraction(measurementInteraction);
  }

  function analyzeCoverage() {
    // Simple coverage analysis
    const totalRepeaters = radarData.repeaters.length + plannedNodes.length;
    const activeRepeaters = radarData.repeaters.filter(n => checkFreshness(n.last_seen)).length;
    
    alert(`Dekking Analyse

` +
          `Bestaande repeaters: ${radarData.repeaters.length}
` +
          `Actieve repeaters: ${activeRepeaters}
` +
          `Geplande repeaters: ${plannedNodes.length}
` +
          `Totaal na implementatie: ${totalRepeaters}

` +
          `Dit is een basis-analyse. Voor gedetailleerde RF-propagatie modellering ` +
          `zijn aanvullende tools nodig die terrein, gebouwen en vegetatie meenemen.`);
  }

  // ========== Popup Interaction ==========

  function addPopupInteraction() {
    const popup = document.createElement('div');
    popup.className = 'ol-popup';
    popup.style.display = 'none';
    popup.style.position = 'absolute';
    popup.style.backgroundColor = 'var(--color-bg-alt)';
    popup.style.border = '1px solid var(--color-border)';
    popup.style.borderRadius = 'var(--radius-md)';
    popup.style.padding = 'var(--space-md)';
    popup.style.pointerEvents = 'none';
    popup.style.zIndex = '1000';
    document.body.appendChild(popup);

    map.on('pointermove', function (evt) {
      const feature = map.forEachFeatureAtPixel(evt.pixel, f => f);
      
      if (feature && (feature.get('type') === 'repeater' || 
          feature.get('type') === 'companion' ||
          feature.get('type') === 'planned' ||
          feature.get('type') === 'tower' ||
          feature.get('type') === 'settlement' ||
          feature.get('type') === 'no-coverage')) {
        
        const data = feature.get('data');
        const type = feature.get('type');
        const coords = evt.pixel;
        
        let html = `<strong>${escapeHtml(feature.get('name'))}</strong><br>`;
        
        if (type === 'repeater' || type === 'companion') {
          html += `Type: ${type === 'repeater' ? 'Repeater' : 'Companion'}<br>`;
          if (type === 'repeater' && feature.get('classification') !== undefined) {
            const cls = feature.get('classification');
            html += `<span style="color: ${getClassColor(cls)}">◆</span> Klasse ${cls}: ${getClassLabel(cls)}<br>`;
          }
          html += `Status: ${feature.get('fresh') ? '✓ Online' : '✗ Offline'}<br>`;
          if (data.last_seen) {
            html += `<small>Gezien: ${timeAgo(data.last_seen)}</small>`;
          }
        } else if (type === 'planned') {
          html += `Geplande locatie<br>`;
          if (data.classification !== undefined) {
            html += `<span style="color: ${getClassColor(data.classification)}">◆</span> Klasse ${data.classification}: ${getClassLabel(data.classification)}<br>`;
          }
          html += `<small>Hoogte: ${data.elevation}m · Bereik: ${data.range} km</small>`;
        } else if (type === 'tower') {
          const typeLabels = {
            'watertoren': '💧 Watertoren',
            'zendmast': '📡 Zendmast',
            'kerktoren': '⛪ Kerktoren',
            'flatgebouw': '🏢 Flatgebouw',
            'schoorsteen': '🏭 Schoorsteen'
          };
          html += `${typeLabels[data.type] || data.type}<br>`;
          html += `<strong style="color: #ff6b35;">Hoogte: ${data.height_m}m</strong><br>`;
          html += `${data.suitable_for_repeater ? '✓ Geschikt voor repeater' : '✗ Niet geschikt'}<br>`;
          if (data.address) {
            html += `<small>${data.address}</small><br>`;
          }
          if (data.notes) {
            html += `<small style="color: var(--color-text-muted);">${data.notes}</small>`;
          }
        } else if (type === 'settlement') {
          const typeLabels = {
            'stad': '🏙️ Stad',
            'plaats': '🏘️ Plaats',
            'dorp': '🏡 Dorp'
          };
          html += `${typeLabels[data.type] || data.type}<br>`;
          html += `<strong style="color: #FFC107;">Inwoners: ${data.population.toLocaleString()}</strong><br>`;
          if (data.municipality) {
            html += `<small>Gemeente: ${data.municipality}</small>`;
          }
        } else if (type === 'no-coverage') {
          const typeLabels = {
            'stad': '🏙️ Stad',
            'plaats': '🏘️ Plaats',
            'dorp': '🏡 Dorp'
          };
          html += `${typeLabels[data.type] || data.type}<br>`;
          html += `<strong style="color: #ff0000;">⚠️ GEEN DEKKING</strong><br>`;
          html += `Inwoners: ${data.population.toLocaleString()}<br>`;
          if (data.municipality) {
            html += `<small>Gemeente: ${data.municipality}</small>`;
          }
        }
        
        popup.innerHTML = html;
        popup.style.display = 'block';
        popup.style.left = (coords[0] + 15) + 'px';
        popup.style.top = (coords[1] - 15) + 'px';
      } else {
        popup.style.display = 'none';
      }
    });
  }

  // ========== Export ==========

  function exportPlanning() {
    if (plannedNodes.length === 0) {
      alert('Geen geplande locaties om te exporteren');
      return;
    }

    const exportData = {
      version: '1.0',
      created: new Date().toISOString(),
      planned_repeaters: plannedNodes.map(node => ({
        name: node.name,
        latitude: node.lat,
        longitude: node.lon,
        elevation_m: node.elevation,
        range_km: node.range,
        classification: node.classification
      })),
      statistics: {
        total_planned: plannedNodes.length,
        existing_repeaters: radarData.repeaters.length,
        existing_companions: radarData.companions.length
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meshcore-planning-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ========== Styles ==========

  /**
   * Icon type registry with different marker shapes
   * Provides visual variety for different node types
   */
  const ICON_TYPES = {
    // Standard shapes
    CIRCLE: 'circle',
    SQUARE: 'square',
    TRIANGLE: 'triangle',
    DIAMOND: 'diamond',
    STAR: 'star',
    HEXAGON: 'hexagon',
    PENTAGON: 'pentagon',
    OCTAGON: 'octagon',
    
    // Special markers
    CROSS: 'cross',
    PLUS: 'plus',
    PIN: 'pin',
    ANTENNA: 'antenna',
    TOWER: 'tower',
    BUILDING: 'building',
    
    // Status indicators
    ALERT: 'alert',
    WARNING: 'warning',
    CHECK: 'check'
  };

  /**
   * Create a style with specified icon type
   * @param {string} iconType - Type from ICON_TYPES
   * @param {string} color - Fill color
   * @param {number} radius - Size
   * @param {object} options - Additional options (strokeColor, strokeWidth, etc.)
   */
  function createIconStyle(iconType, color, radius, options = {}) {
    const strokeColor = options.strokeColor || '#fff';
    const strokeWidth = options.strokeWidth || 2;
    const opacity = options.opacity || 1;
    
    // Adjust color opacity if specified
    const fillColor = opacity < 1 ? adjustOpacity(color, opacity) : color;
    
    let image;
    
    switch(iconType) {
      case ICON_TYPES.CIRCLE:
        image = new ol.style.Circle({
          radius: radius,
          fill: new ol.style.Fill({ color: fillColor }),
          stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth })
        });
        break;
        
      case ICON_TYPES.SQUARE:
        image = new ol.style.RegularShape({
          points: 4,
          radius: radius,
          angle: 0,
          fill: new ol.style.Fill({ color: fillColor }),
          stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth })
        });
        break;
        
      case ICON_TYPES.TRIANGLE:
        image = new ol.style.RegularShape({
          points: 3,
          radius: radius,
          rotation: 0,
          fill: new ol.style.Fill({ color: fillColor }),
          stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth })
        });
        break;
        
      case ICON_TYPES.DIAMOND:
        image = new ol.style.RegularShape({
          points: 4,
          radius: radius,
          angle: Math.PI / 4, // Rotate 45°
          fill: new ol.style.Fill({ color: fillColor }),
          stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth })
        });
        break;
        
      case ICON_TYPES.STAR:
        image = new ol.style.RegularShape({
          points: 5,
          radius: radius,
          radius2: radius * 0.4, // Inner radius for star points
          angle: 0,
          fill: new ol.style.Fill({ color: fillColor }),
          stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth })
        });
        break;
        
      case ICON_TYPES.HEXAGON:
        image = new ol.style.RegularShape({
          points: 6,
          radius: radius,
          angle: 0,
          fill: new ol.style.Fill({ color: fillColor }),
          stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth })
        });
        break;
        
      case ICON_TYPES.PENTAGON:
        image = new ol.style.RegularShape({
          points: 5,
          radius: radius,
          angle: 0,
          fill: new ol.style.Fill({ color: fillColor }),
          stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth })
        });
        break;
        
      case ICON_TYPES.OCTAGON:
        image = new ol.style.RegularShape({
          points: 8,
          radius: radius,
          angle: 0,
          fill: new ol.style.Fill({ color: fillColor }),
          stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth })
        });
        break;
        
      case ICON_TYPES.CROSS:
        // Create cross using two overlapping rectangles
        image = new ol.style.RegularShape({
          points: 4,
          radius: radius,
          radius2: radius * 0.3,
          angle: 0,
          fill: new ol.style.Fill({ color: fillColor }),
          stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth })
        });
        break;
        
      case ICON_TYPES.PLUS:
        // Plus sign - rotated cross
        image = new ol.style.RegularShape({
          points: 4,
          radius: radius,
          radius2: radius * 0.3,
          angle: Math.PI / 4,
          fill: new ol.style.Fill({ color: fillColor }),
          stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth })
        });
        break;
        
      case ICON_TYPES.PIN:
        // Inverted triangle (pin/marker shape)
        image = new ol.style.RegularShape({
          points: 3,
          radius: radius * 1.2,
          rotation: Math.PI, // Point downward
          fill: new ol.style.Fill({ color: fillColor }),
          stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth })
        });
        break;
        
      case ICON_TYPES.ANTENNA:
        // Triangle pointing up (antenna symbol)
        image = new ol.style.RegularShape({
          points: 3,
          radius: radius * 1.3,
          rotation: 0,
          fill: new ol.style.Fill({ color: fillColor }),
          stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth })
        });
        break;
        
      case ICON_TYPES.TOWER:
        // Triangle (tower symbol)
        image = new ol.style.RegularShape({
          points: 3,
          radius: radius,
          rotation: 0,
          fill: new ol.style.Fill({ color: fillColor }),
          stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth })
        });
        break;
        
      case ICON_TYPES.BUILDING:
        // Square representing building
        image = new ol.style.RegularShape({
          points: 4,
          radius: radius,
          angle: 0,
          fill: new ol.style.Fill({ color: fillColor }),
          stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth })
        });
        break;
        
      case ICON_TYPES.ALERT:
        // Triangle with exclamation (pointing up for alert)
        image = new ol.style.RegularShape({
          points: 3,
          radius: radius * 1.2,
          rotation: 0,
          fill: new ol.style.Fill({ color: fillColor }),
          stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth * 1.5 })
        });
        break;
        
      case ICON_TYPES.WARNING:
        // Octagon (stop sign shape) for warnings
        image = new ol.style.RegularShape({
          points: 8,
          radius: radius,
          angle: Math.PI / 8,
          fill: new ol.style.Fill({ color: fillColor }),
          stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth * 1.5 })
        });
        break;
        
      case ICON_TYPES.CHECK:
        // Pentagon for positive status
        image = new ol.style.RegularShape({
          points: 5,
          radius: radius,
          angle: 0,
          fill: new ol.style.Fill({ color: fillColor }),
          stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth })
        });
        break;
        
      default:
        // Default to circle
        image = new ol.style.Circle({
          radius: radius,
          fill: new ol.style.Fill({ color: fillColor }),
          stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth })
        });
    }
    
    return new ol.style.Style({ image: image });
  }

  /**
   * Legacy function - now uses createIconStyle with CIRCLE type
   */
  function createNodeStyle(color, radius) {
    return createIconStyle(ICON_TYPES.CIRCLE, color, radius);
  }
  
  /**
   * Adjust color opacity
   */
  function adjustOpacity(color, opacity) {
    // Handle hex colors
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    // Handle rgba
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/g, `${opacity})`);
    }
    // Handle rgb
    if (color.startsWith('rgb')) {
      return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
    }
    return color;
  }

  // ========== Utilities ==========

  function checkFreshness(lastSeen) {
    if (!lastSeen) return false;
    const diff = Date.now() - new Date(lastSeen).getTime();
    return diff < CONFIG.freshHours * 3600 * 1000;
  }

  function timeAgo(dateString) {
    if (!dateString) return '?';
    const hours = Math.round((Date.now() - new Date(dateString).getTime()) / 3600000);
    if (hours < 1) return '<1 uur geleden';
    if (hours < 24) return `${hours} uur geleden`;
    const days = Math.round(hours / 24);
    return `${days} ${days === 1 ? 'dag' : 'dagen'} geleden`;
  }

  function updateCoordinateDisplay(lat, lon) {
    const el = document.getElementById('mouse-coords');
    if (el) {
      el.textContent = `${lat.toFixed(5)}°N, ${lon.toFixed(5)}°E`;
    }
  }

  function setStatus(message) {
    const el = document.getElementById('map-status');
    if (el) el.textContent = message;
  }

  function updateStats() {
    // Count repeaters in current filter range
    const filteredRepeaters = radarData.repeaters.filter(n => {
      if (!n.location) return false;
      const cls = classifyRepeater(n, radarData.links);
      return cls >= repeaterClassFilter.min && cls <= repeaterClassFilter.max;
    });
    const activeRepeaters = filteredRepeaters.filter(n => checkFreshness(n.last_seen)).length;
    
    // Build set of visible repeater keys for link counting
    const visibleKeys = new Set(filteredRepeaters.map(n => n.public_key));
    
    // Count visible links
    const visibleLinks = radarData.links.filter(link => 
      visibleKeys.has(link.node_a) && visibleKeys.has(link.node_b)
    ).length;
    
    document.getElementById('stat-repeaters').textContent = 
      `${filteredRepeaters.length} (${activeRepeaters} actief)`;
    document.getElementById('stat-links').textContent = visibleLinks;
    document.getElementById('stat-planned').textContent = plannedNodes.length;
    
    // Calculate average distance between planned nodes
    if (plannedNodes.length >= 2) {
      let totalDist = 0;
      let count = 0;
      for (let i = 0; i < plannedNodes.length; i++) {
        for (let j = i + 1; j < plannedNodes.length; j++) {
          const dist = calculateDistance(
            plannedNodes[i].lat, plannedNodes[i].lon,
            plannedNodes[j].lat, plannedNodes[j].lon
          );
          totalDist += dist;
          count++;
        }
      }
      const avgDist = (totalDist / count).toFixed(1);
      document.getElementById('stat-avg-distance').textContent = `${avgDist} km`;
    } else {
      document.getElementById('stat-avg-distance').textContent = '—';
    }

    // Coverage estimation (very simplified)
    const totalRange = plannedNodes.reduce((sum, n) => sum + n.range, 0);
    document.getElementById('stat-coverage').textContent = 
      totalRange > 0 ? `~${totalRange.toFixed(0)} km²` : '—';
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function showModal(show) {
    const modal = document.getElementById('help-modal');
    modal.setAttribute('aria-hidden', !show);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  // ========== Global Functions (called from inline onclick) ==========

  window.removePlanned = function (id) {
    removePlannedNode(id);
  };

  window.zoomToPlanned = function (id) {
    const node = plannedNodes.find(n => n.id === id);
    if (node) {
      map.getView().animate({
        center: node.coords,
        zoom: 13,
        duration: 500
      });
    }
  };

  // ========== Boot ==========

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
