/**
 * Navigation Controller
 * Single Responsibility: Handles navigation logic and UI updates
 * Dependency Inversion: Depends on SlideManager abstraction
 */

export class NavigationController {
  constructor(slideManager, elements) {
    this.slideManager = slideManager;
    this.elements = elements;
    this.autoAdvanceEnabled = true;
    this.autoAdvanceInterval = null;
    this.autoAdvanceDelay = 60000; // 60 seconds per slide
    this.isStarted = false; // Track if auto-advance should be active
    
    this._bindEvents();
    this._updateUI();
    // Don't start auto-advance yet - wait for user to click start button
  }

  /**
   * Bind navigation events
   * @private
   */
  _bindEvents() {
    // Keyboard navigation (for manual control)
    document.addEventListener('keydown', (e) => {
      this._handleKeyPress(e);
    });

    // Listen to slide changes
    this.slideManager.onSlideChange(() => {
      this._updateUI();
      this._restartAutoAdvance();
    });
  }

  /**
   * Handle keyboard navigation
   * @private
   * @param {KeyboardEvent} event
   */
  _handleKeyPress(event) {
    switch (event.key) {
      case 'ArrowLeft':
      case 'PageUp':
        event.preventDefault();
        this.previous();
        break;
      case 'ArrowRight':
      case 'PageDown':
      case ' ': // Spacebar
        event.preventDefault();
        this.next();
        break;
      case 'Home':
        event.preventDefault();
        this.goToFirst();
        break;
      case 'End':
        event.preventDefault();
        this.goToLast();
        break;
    }
  }

  /**
   * Update UI elements
   * @private
   */
  _updateUI() {
    const currentIndex = this.slideManager.getCurrentIndex();
    const totalSlides = this.slideManager.getTotalSlides();

    // Update progress bar
    if (this.elements.progressFill) {
      const progress = this.slideManager.getProgress();
      this.elements.progressFill.style.width = `${progress}%`;
    }
  }

  /**
   * Navigate to next slide
   * @returns {boolean} Success
   */
  next() {
    return this.slideManager.next();
  }

  /**
   * Navigate to previous slide
   * @returns {boolean} Success
   */
  previous() {
    return this.slideManager.previous();
  }

  /**
   * Go to specific slide
   * @param {number} index
   * @returns {boolean} Success
   */
  goTo(index) {
    return this.slideManager.goToSlide(index);
  }

  /**
   * Go to first slide
   * @returns {boolean} Success
   */
  goToFirst() {
    return this.slideManager.goToSlide(0);
  }

  /**
   * Go to last slide
   * @returns {boolean} Success
   */
  goToLast() {
    const lastIndex = this.slideManager.getTotalSlides() - 1;
    return this.slideManager.goToSlide(lastIndex);
  }

  /**
   * Start auto-advance timer
   * @private
   */
  _startAutoAdvance() {
    if (!this.autoAdvanceEnabled || !this.isStarted) return;
    
    this._stopAutoAdvance();
    
    this.autoAdvanceInterval = setInterval(() => {
      if (this.slideManager.hasNext()) {
        this.next();
      } else {
        // Loop back to first slide
        this.goToFirst();
      }
    }, this.autoAdvanceDelay);
  }

  /**
   * Start the presentation (public method)
   */
  start() {
    this.isStarted = true;
    this._startAutoAdvance();
  }

  /**
   * Stop auto-advance timer
   * @private
   */
  _stopAutoAdvance() {
    if (this.autoAdvanceInterval) {
      clearInterval(this.autoAdvanceInterval);
      this.autoAdvanceInterval = null;
    }
  }

  /**
   * Restart auto-advance timer (called on slide change)
   * @private
   */
  _restartAutoAdvance() {
    this._startAutoAdvance();
  }

  /**
   * Cleanup
   */
  destroy() {
    this._stopAutoAdvance();
  }
}

export default NavigationController;
