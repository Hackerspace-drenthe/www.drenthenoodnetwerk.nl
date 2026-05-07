/**
 * Presentation Controller
 * Main orchestrator following PDCA (Plan-Do-Check-Act) methodology
 * Dependency Inversion: Depends on service abstractions
 */

export class PresentationController {
  constructor(slideManager, navigationController, speechService, elements) {
    this.slideManager = slideManager;
    this.navigationController = navigationController;
    this.speechService = speechService;
    this.elements = elements;
    
    // PDCA state
    this.pdcaPhase = 'Plan';  // Plan, Do, Check, Act
    this.isPresenting = false;
    this.metrics = {
      slidesViewed: new Set(),
      speechUsageCount: 0,
      navigationClicks: 0,
      startTime: null,
      endTime: null
    };
    
    this._initialize();
  }

  /**
   * PLAN Phase: Initialize and setup
   * @private
   */
  _initialize() {
    this.updatePDCAPhase('Plan');
    
    // Bind events
    this._bindSpeechControls();
    this._bindRateControl();
    
    // Setup speech callbacks
    this.speechService.onStart(() => this._onSpeechStart());
    this.speechService.onEnd(() => this._onSpeechEnd());
    this.speechService.onError((error) => this._onSpeechError(error));
    
    // Track slide views
    this.slideManager.onSlideChange((slide, index) => {
      this._onSlideChange(slide, index);
    });
    
    // Preload images for performance
    this.slideManager.preloadImages();
    
    // Mark first slide as viewed
    this.metrics.slidesViewed.add(0);
    
    console.log('✓ PLAN: Presentation initialized');
  }

  /**
   * Bind speech control events
   * @private
   */
  _bindSpeechControls() {
    // Speak button
    this.elements.btnSpeak?.addEventListener('click', () => {
      this.speakCurrentSlide();
    });

    // Pause button
    this.elements.btnPause?.addEventListener('click', () => {
      this.pauseSpeech();
    });

    // Stop button
    this.elements.btnStop?.addEventListener('click', () => {
      this.stopSpeech();
    });
  }

  /**
   * Bind rate control
   * @private
   */
  _bindRateControl() {
    this.elements.speechRate?.addEventListener('input', (e) => {
      const rate = parseFloat(e.target.value);
      this.speechService.setRate(rate);
      if (this.elements.rateValue) {
        this.elements.rateValue.textContent = `${rate.toFixed(1)}x`;
      }
    });
  }

  /**
   * DO Phase: Execute presentation actions
   * Speak current slide
   */
  async speakCurrentSlide() {
    this.updatePDCAPhase('Do');
    
    const slide = this.slideManager.getCurrentSlide();
    if (!slide || !slide.speechText) {
      console.warn('No speech text available for current slide');
      return;
    }

    try {
      this.isPresenting = true;
      this.metrics.speechUsageCount++;
      
      // Update UI
      this.elements.btnSpeak?.classList.add('speaking');
      this.elements.btnSpeak?.setAttribute('aria-label', 'Bezig met voorlezen...');
      
      await this.speechService.speak(slide.speechText);
      
      console.log(`✓ DO: Spoken slide ${slide.id}`);
    } catch (error) {
      console.error('Speech error:', error);
      this._onSpeechError(error);
    }
  }

  /**
   * Pause speech
   */
  pauseSpeech() {
    if (this.speechService.isSpeaking() && !this.speechService.isPausedState()) {
      this.speechService.pause();
      this.elements.btnPause?.setAttribute('aria-label', 'Hervat');
    } else if (this.speechService.isPausedState()) {
      this.speechService.resume();
      this.elements.btnPause?.setAttribute('aria-label', 'Pauzeer');
    }
  }

  /**
   * Stop speech
   */
  stopSpeech() {
    this.speechService.stop();
    this.isPresenting = false;
    this._resetSpeechUI();
  }

  /**
   * CHECK Phase: Monitor and validate
   * Called on slide change
   * @private
   */
  _onSlideChange(slide, index) {
    this.updatePDCAPhase('Check');
    
    // Track metrics
    this.metrics.slidesViewed.add(index);
    this.metrics.navigationClicks++;
    
    // Stop any ongoing speech
    if (this.speechService.isSpeaking()) {
      this.stopSpeech();
    }
    
    // Check progress
    const progress = (this.metrics.slidesViewed.size / this.slideManager.getTotalSlides()) * 100;
    console.log(`✓ CHECK: Progress ${progress.toFixed(1)}% (${this.metrics.slidesViewed.size}/${this.slideManager.getTotalSlides()} slides viewed)`);
    
    // Check if presentation complete
    if (this.metrics.slidesViewed.size === this.slideManager.getTotalSlides()) {
      this._onPresentationComplete();
    }
  }

  /**
   * ACT Phase: Respond to checks and optimize
   * Called when presentation is complete
   * @private
   */
  _onPresentationComplete() {
    this.updatePDCAPhase('Act');
    
    this.metrics.endTime = new Date();
    const duration = this.metrics.endTime - this.metrics.startTime;
    
    console.log('✓ ACT: Presentation completed!');
    console.log('Metrics:', {
      duration: `${Math.round(duration / 1000)}s`,
      slidesViewed: this.metrics.slidesViewed.size,
      speechUsed: this.metrics.speechUsageCount,
      navigationClicks: this.metrics.navigationClicks
    });
    
    // Could trigger completion actions here:
    // - Show completion message
    // - Send analytics
    // - Offer restart or feedback form
  }

  /**
   * Speech started callback
   * @private
   */
  _onSpeechStart() {
    if (!this.metrics.startTime) {
      this.metrics.startTime = new Date();
    }
    
    this.elements.btnSpeak?.classList.add('speaking');
    if (this.elements.btnPause) {
      this.elements.btnPause.style.display = 'flex';
    }
  }

  /**
   * Speech ended callback
   * @private
   */
  _onSpeechEnd() {
    this.isPresenting = false;
    this._resetSpeechUI();
    this.updatePDCAPhase('Check');
  }

  /**
   * Speech error callback
   * @private
   */
  _onSpeechError(error) {
    // Ignore 'interrupted' errors as they're expected when changing slides
    if (error.error === 'interrupted') {
      return;
    }
    
    console.error('Speech error:', error);
    this.isPresenting = false;
    this._resetSpeechUI();
    
    // Could show error message to user
    // this._showError('Kon tekst niet uitspreken. Probeer het opnieuw.');
  }

  /**
   * Reset speech UI
   * @private
   */
  _resetSpeechUI() {
    this.elements.btnSpeak?.classList.remove('speaking');
    this.elements.btnSpeak?.setAttribute('aria-label', 'Spreek tekst uit');
    if (this.elements.btnPause) {
      this.elements.btnPause.style.display = 'none';
    }
  }

  /**
   * Update PDCA phase indicator
   * @param {string} phase - Plan, Do, Check, or Act
   */
  updatePDCAPhase(phase) {
    const validPhases = ['Plan', 'Do', 'Check', 'Act'];
    if (validPhases.includes(phase)) {
      this.pdcaPhase = phase;
      if (this.elements.pdcaIndicator) {
        this.elements.pdcaIndicator.querySelector('.pdca-phase').textContent = phase;
      }
    }
  }

  /**
   * Get current PDCA phase
   * @returns {string}
   */
  getPDCAPhase() {
    return this.pdcaPhase;
  }

  /**
   * Get presentation metrics
   * @returns {Object}
   */
  getMetrics() {
    return {
      ...this.metrics,
      slidesViewed: Array.from(this.metrics.slidesViewed),
      completionRate: (this.metrics.slidesViewed.size / this.slideManager.getTotalSlides()) * 100
    };
  }

  /**
   * Reset presentation
   */
  reset() {
    this.stopSpeech();
    this.navigationController.goToFirst();
    this.navigationController.setAutoPlay(false);
    
    // Reset metrics
    this.metrics = {
      slidesViewed: new Set([0]),
      speechUsageCount: 0,
      navigationClicks: 0,
      startTime: new Date(),
      endTime: null
    };
    
    this.updatePDCAPhase('Plan');
    console.log('✓ Presentation reset');
  }

  /**
   * Check if speech is supported
   * @returns {boolean}
   */
  isSpeechSupported() {
    return SpeechService.isSupported();
  }

  /**
   * Get available voices for speech
   * @returns {Array}
   */
  getAvailableVoices() {
    return this.speechService.getAvailableVoices();
  }

  /**
   * Cleanup and destroy
   */
  destroy() {
    this.stopSpeech();
    this.navigationController.destroy();
    console.log('✓ Presentation destroyed');
  }
}

export default PresentationController;
