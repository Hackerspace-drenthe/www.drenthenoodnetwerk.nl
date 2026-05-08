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
    this.timerInterval = null;
    this.autoAdvanceDelay = 60000; // 60 seconds per slide
    this.isStarted = false; // Track if auto-advance should be active
    this.remainingSeconds = 60;
    
    // Get timer elements
    this.timerSecondsElement = document.getElementById('timer-seconds');
    this.timerProgressElement = document.getElementById('timer-progress');
    this.timerCircumference = 2 * Math.PI * 45; // radius = 45
    
    this._bindEvents();
    this._updateUI();
    this._updateTimer();
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
   * Update countdown timer display
   * @private
   */
  _updateTimer() {
    if (this.timerSecondsElement) {
      this.timerSecondsElement.textContent = this.remainingSeconds;
    }
    
    if (this.timerProgressElement) {
      const progress = (this.remainingSeconds / 60) * this.timerCircumference;
      this.timerProgressElement.style.strokeDashoffset = this.timerCircumference - progress;
    }
  }

  /**
   * Start timer countdown
   * @private
   */
  _startTimer() {
    this._stopTimer();
    
    this.remainingSeconds = 60;
    this._updateTimer();
    
    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      
      if (this.remainingSeconds < 0) {
        this.remainingSeconds = 60;
      }
      
      this._updateTimer();
    }, 1000);
  }

  /**
   * Stop timer countdown
   * @private
   */
  _stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
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
      const currentSlide = this.slideManager.getCurrentSlide();
      
      // Stop auto-advance if we're on the last slide
      if (currentSlide && currentSlide.isLastSlide) {
        this._stopAutoAdvance();
        this._stopTimer();
        console.log('✓ Reached final slide - auto-advance stopped');
        return;
      }
      
      if (this.slideManager.hasNext()) {
        this.next();
      } else {
        // Stop at the end instead of looping
        this._stopAutoAdvance();
        this._stopTimer();
      }
    }, this.autoAdvanceDelay);
  }

  /**
   * Start the presentation (public method)
   */
  start() {
    this.isStarted = true;
    this._startAutoAdvance();
    this._startTimer();
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
    this._startTimer(); // Also restart countdown timer
  }

  /**
   * Cleanup
   */
  destroy() {
    this._stopAutoAdvance();
    this._stopTimer();
  }
}

export default NavigationController;
