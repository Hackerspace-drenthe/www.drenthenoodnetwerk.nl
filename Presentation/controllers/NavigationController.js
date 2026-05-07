/**
 * Navigation Controller
 * Single Responsibility: Handles navigation logic and UI updates
 * Dependency Inversion: Depends on SlideManager abstraction
 */

export class NavigationController {
  constructor(slideManager, elements) {
    this.slideManager = slideManager;
    this.elements = elements;
    
    this._bindEvents();
    this._updateUI();
  }

  /**
   * Bind navigation events
   * @private
   */
  _bindEvents() {
    // Previous button
    this.elements.btnPrev?.addEventListener('click', () => {
      this.previous();
    });

    // Next button
    this.elements.btnNext?.addEventListener('click', () => {
      this.next();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      this._handleKeyPress(e);
    });

    // Listen to slide changes
    this.slideManager.onSlideChange(() => {
      this._updateUI();
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
    const hasPrev = this.slideManager.hasPrevious();
    const hasNext = this.slideManager.hasNext();

    // Update counter
    if (this.elements.currentSlide) {
      this.elements.currentSlide.textContent = currentIndex + 1;
    }
    if (this.elements.totalSlides) {
      this.elements.totalSlides.textContent = totalSlides;
    }

    // Update button states
    if (this.elements.btnPrev) {
      this.elements.btnPrev.disabled = !hasPrev;
    }
    if (this.elements.btnNext) {
      this.elements.btnNext.disabled = !hasNext;
    }

    // Update progress bar
    if (this.elements.progressFill) {
      const progress = this.slideManager.getProgress();
      this.elements.progressFill.style.width = `${progress}%`;
    }

    // Update ARIA live region for accessibility
    this._announceSlideChange(currentIndex + 1, totalSlides);
  }

  /**
   * Announce slide change for screen readers
   * @private
   * @param {number} current
   * @param {number} total
   */
  _announceSlideChange(current, total) {
    const announcement = `Slide ${current} van ${total}`;
    
    // Create or update live region
    let liveRegion = document.getElementById('slide-announcer');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'slide-announcer';
      liveRegion.className = 'sr-only';
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      document.body.appendChild(liveRegion);
    }
    
    liveRegion.textContent = announcement;
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
   * Cleanup
   */
  destroy() {
    // Cleanup if needed
  }
}

export default NavigationController;
