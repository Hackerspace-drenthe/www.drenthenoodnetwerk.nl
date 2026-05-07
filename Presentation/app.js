/**
 * Main Application Entry Point
 * Orchestrates all components following Dependency Inversion principle
 * Implements SOLID architecture
 */

import { slidesData } from './config/slides.js';
import { SpeechService } from './services/SpeechService.js';
import { SlideManager } from './services/SlideManager.js';
import { NavigationController } from './controllers/NavigationController.js';
import { PresentationController } from './controllers/PresentationController.js';
import { getElement, log, isSupported } from './utils/helpers.js';

/**
 * Application Class
 * Single Responsibility: Application initialization and lifecycle
 */
class PresentationApp {
  constructor() {
    this.presentationController = null;
    this.isInitialized = false;
  }

  /**
   * Initialize application
   */
  async init() {
    try {
      log('Initializing Meshcore Presentation...', 'log');

      // Check browser support
      this._checkBrowserSupport();

      // Get DOM elements
      const elements = this._getDOMElements();

      // Validate elements
      if (!this._validateElements(elements)) {
        throw new Error('Required DOM elements not found');
      }

      // Show loading
      this._showLoading(true);

      // Initialize services (Dependency Injection)
      const speechService = new SpeechService();
      const slideManager = new SlideManager(slidesData, elements.slideContainer);
      
      // Initialize controllers
      const navigationController = new NavigationController(slideManager, {
        progressFill: elements.progressFill
      });

      // Initialize main presentation controller (PDCA orchestrator)
      this.presentationController = new PresentationController(
        slideManager,
        navigationController,
        speechService,
        {}
      );

      // Hide loading
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for smooth transition
      this._showLoading(false);

      this.isInitialized = true;
      log('✓ Application initialized successfully', 'log');

      // Log system info
      this._logSystemInfo();

      // Setup start button
      this._setupStartButton();

    } catch (error) {
      log(`Initialization error: ${error.message}`, 'error');
      this._showError('Kon presentatie niet laden. Ververs de pagina.');
    }
  }

  /**
   * Get all required DOM elements
   * @private
   * @returns {Object}
   */
  _getDOMElements() {
    return {
      // Containers
      slideContainer: getElement('#slide-container'),
      
      // Progress
      progressFill: getElement('#progress-fill'),
      
      // Subtitles
      subtitles: getElement('#subtitles'),
      
      // PDCA indicator
      pdcaIndicator: getElement('#pdca-indicator'),
      
      // Loading
      loading: getElement('#loading')
    };
  }

  /**
   * Validate required elements exist
   * @private
   * @param {Object} elements
   * @returns {boolean}
   */
  _validateElements(elements) {
    const required = ['slideContainer'];
    
    for (const key of required) {
      if (!elements[key]) {
        log(`Required element missing: ${key}`, 'error');
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check browser support for required features
   * @private
   */
  _checkBrowserSupport() {
    const features = {
      'speechSynthesis': 'Text-to-speech',
      'localStorage': 'Local storage'
    };

    const unsupported = [];
    
    for (const [feature, name] of Object.entries(features)) {
      if (!isSupported(feature)) {
        unsupported.push(name);
        log(`Browser does not support: ${name}`, 'warn');
      }
    }

    if (unsupported.length > 0) {
      log(`Warning: Some features may not work: ${unsupported.join(', ')}`, 'warn');
    }
  }

  /**
   * Show/hide loading indicator
   * @private
   * @param {boolean} show
   */
  _showLoading(show) {
    const loading = getElement('#loading');
    if (loading) {
      loading.style.display = show ? 'flex' : 'none';
    }
  }

  /**
   * Show error message
   * @private
   * @param {string} message
   */
  _showError(message) {
    const container = getElement('#presentation-container');
    if (container) {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center;padding:2rem;">
          <h2 style="color:#ff6b6b;margin-bottom:1rem;">❌ Fout</h2>
          <p style="color:#e0eaff;margin-bottom:2rem;">${message}</p>
          <button onclick="location.reload()" style="padding:0.75rem 1.5rem;background:#2d6a4f;color:white;border:none;border-radius:8px;cursor:pointer;font-size:1rem;">
            Opnieuw laden
          </button>
        </div>
      `;
    }
  }

  /**
   * Setup start button handler
   * @private
   */
  _setupStartButton() {
    const startBtn = getElement('#start-btn');
    const startOverlay = getElement('#start-overlay');
    
    if (startBtn && startOverlay) {
      startBtn.addEventListener('click', () => {
        // Hide overlay
        startOverlay.classList.add('hidden');
        
        // Start presentation and speech
        if (this.presentationController) {
          this.presentationController.startPresentation();
          
          // Start auto-advance timer
          if (this.presentationController.navigationController) {
            this.presentationController.navigationController.start();
          }
        }
        
        log('Presentation started', 'log');
      });
    }
  }

  /**
   * Log system information
   * @private
   */
  _logSystemInfo() {
    const info = {
      'Total Slides': slidesData.length,
      'Speech Support': isSupported('speechSynthesis') ? 'Yes' : 'No',
      'Browser': navigator.userAgent.split(' ').pop(),
      'Platform': navigator.platform,
      'Language': navigator.language
    };

    console.group('📊 System Information');
    Object.entries(info).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    console.groupEnd();
  }

  /**
   * Cleanup and destroy
   */
  destroy() {
    if (this.presentationController) {
      this.presentationController.destroy();
    }
    this.isInitialized = false;
    log('✓ Application destroyed', 'log');
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new PresentationApp();
    app.init();
    
    // Make app available globally for debugging
    window.presentationApp = app;
  });
} else {
  const app = new PresentationApp();
  app.init();
  window.presentationApp = app;
}

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (window.presentationApp) {
    window.presentationApp.destroy();
  }
});

export default PresentationApp;
