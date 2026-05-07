/**
 * Slide Manager Service
 * Single Responsibility: Manages slide state and rendering
 * Open/Closed: Open for extension, closed for modification
 */

export class SlideManager {
  constructor(slides, containerElement) {
    this.slides = slides;
    this.container = containerElement;
    this.currentIndex = 0;
    this.onSlideChangeCallback = null;
    
    this._render();
  }

  /**
   * Render all slides to DOM
   * @private
   */
  _render() {
    this.container.innerHTML = '';
    
    this.slides.forEach((slide, index) => {
      const slideElement = this._createSlideElement(slide, index);
      this.container.appendChild(slideElement);
    });
    
    this._updateActiveSlide();
  }

  /**
   * Create slide HTML element
   * @private
   * @param {Object} slide - Slide data
   * @param {number} index - Slide index
   * @returns {HTMLElement}
   */
  _createSlideElement(slide, index) {
    const slideDiv = document.createElement('div');
    slideDiv.className = 'slide';
    slideDiv.dataset.slideId = slide.id;
    slideDiv.dataset.slideIndex = index;
    slideDiv.setAttribute('role', 'article');
    slideDiv.setAttribute('aria-label', `Slide ${index + 1}: ${slide.title}`);
    
    // Image
    const img = document.createElement('img');
    img.src = slide.image;
    img.alt = slide.title;
    img.className = 'slide-image';
    img.loading = index === 0 ? 'eager' : 'lazy'; // Eager load first slide
    
    // Title
    const title = document.createElement('h1');
    title.className = 'slide-title';
    title.textContent = slide.title;
    
    // Description
    const description = document.createElement('p');
    description.className = 'slide-description';
    description.textContent = slide.description;
    
    // Append elements
    slideDiv.appendChild(img);
    slideDiv.appendChild(title);
    slideDiv.appendChild(description);
    
    return slideDiv;
  }

  /**
   * Update active slide class
   * @private
   */
  _updateActiveSlide() {
    const slides = this.container.querySelectorAll('.slide');
    slides.forEach((slide, index) => {
      if (index === this.currentIndex) {
        slide.classList.add('active');
        slide.setAttribute('aria-current', 'true');
      } else {
        slide.classList.remove('active');
        slide.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Go to specific slide
   * @param {number} index - Slide index
   * @returns {boolean} Success
   */
  goToSlide(index) {
    if (index < 0 || index >= this.slides.length) {
      return false;
    }
    
    this.currentIndex = index;
    this._updateActiveSlide();
    
    if (this.onSlideChangeCallback) {
      this.onSlideChangeCallback(this.getCurrentSlide(), index);
    }
    
    return true;
  }

  /**
   * Go to next slide
   * @returns {boolean} Success
   */
  next() {
    if (this.hasNext()) {
      return this.goToSlide(this.currentIndex + 1);
    }
    return false;
  }

  /**
   * Go to previous slide
   * @returns {boolean} Success
   */
  previous() {
    if (this.hasPrevious()) {
      return this.goToSlide(this.currentIndex - 1);
    }
    return false;
  }

  /**
   * Check if there is a next slide
   * @returns {boolean}
   */
  hasNext() {
    return this.currentIndex < this.slides.length - 1;
  }

  /**
   * Check if there is a previous slide
   * @returns {boolean}
   */
  hasPrevious() {
    return this.currentIndex > 0;
  }

  /**
   * Get current slide data
   * @returns {Object}
   */
  getCurrentSlide() {
    return this.slides[this.currentIndex];
  }

  /**
   * Get current slide index
   * @returns {number}
   */
  getCurrentIndex() {
    return this.currentIndex;
  }

  /**
   * Get total number of slides
   * @returns {number}
   */
  getTotalSlides() {
    return this.slides.length;
  }

  /**
   * Get slide by ID
   * @param {number} id - Slide ID
   * @returns {Object|null}
   */
  getSlideById(id) {
    return this.slides.find(slide => slide.id === id) || null;
  }

  /**
   * Get slide index by ID
   * @param {number} id - Slide ID
   * @returns {number} Index or -1 if not found
   */
  getSlideIndexById(id) {
    return this.slides.findIndex(slide => slide.id === id);
  }

  /**
   * Set callback for slide change
   * @param {Function} callback
   */
  onSlideChange(callback) {
    this.onSlideChangeCallback = callback;
  }

  /**
   * Get progress percentage
   * @returns {number} Progress (0-100)
   */
  getProgress() {
    return ((this.currentIndex + 1) / this.slides.length) * 100;
  }

  /**
   * Reset to first slide
   */
  reset() {
    this.goToSlide(0);
  }

  /**
   * Update slide content dynamically
   * @param {number} index - Slide index
   * @param {Object} newData - New slide data
   * @returns {boolean} Success
   */
  updateSlide(index, newData) {
    if (index < 0 || index >= this.slides.length) {
      return false;
    }
    
    this.slides[index] = { ...this.slides[index], ...newData };
    this._render();
    return true;
  }

  /**
   * Preload images for better performance
   */
  preloadImages() {
    this.slides.forEach(slide => {
      const img = new Image();
      img.src = slide.image;
    });
  }
}

export default SlideManager;
