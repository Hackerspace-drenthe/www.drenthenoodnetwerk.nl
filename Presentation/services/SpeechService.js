/**
 * Speech Service
 * Single Responsibility: Handles all speech synthesis operations
 * Interface Segregation: Focused API for speech operations
 */

export class SpeechService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.currentUtterance = null;
    this.isPaused = false;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 1.0;
    this.voice = null;
    this.onStartCallback = null;
    this.onEndCallback = null;
    this.onErrorCallback = null;
    
    this._initVoice();
  }

  /**
   * Initialize Dutch voice
   * @private
   */
  _initVoice() {
    const loadVoices = () => {
      const voices = this.synthesis.getVoices();
      // Try to find Dutch voice, fallback to any available voice
      this.voice = voices.find(voice => voice.lang.startsWith('nl')) || 
                   voices.find(voice => voice.lang.startsWith('en')) ||
                   voices[0];
    };

    // Load voices immediately
    loadVoices();

    // Some browsers need this event
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Speak text
   * @param {string} text - Text to speak
   * @returns {Promise<void>}
   */
  speak(text) {
    return new Promise((resolve, reject) => {
      // Stop any ongoing speech
      this.stop();

      if (!text || text.trim() === '') {
        reject(new Error('No text provided'));
        return;
      }

      // Create utterance
      this.currentUtterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance.rate = this.rate;
      this.currentUtterance.pitch = this.pitch;
      this.currentUtterance.volume = this.volume;
      this.currentUtterance.voice = this.voice;
      this.currentUtterance.lang = 'nl-NL';

      // Event handlers
      this.currentUtterance.onstart = () => {
        this.isPaused = false;
        if (this.onStartCallback) {
          this.onStartCallback();
        }
      };

      this.currentUtterance.onend = () => {
        this.currentUtterance = null;
        this.isPaused = false;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
        resolve();
      };

      this.currentUtterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        this.currentUtterance = null;
        this.isPaused = false;
        if (this.onErrorCallback) {
          this.onErrorCallback(event);
        }
        reject(event);
      };

      // Start speaking
      this.synthesis.speak(this.currentUtterance);
    });
  }

  /**
   * Pause speech
   */
  pause() {
    if (this.synthesis.speaking && !this.isPaused) {
      this.synthesis.pause();
      this.isPaused = true;
    }
  }

  /**
   * Resume speech
   */
  resume() {
    if (this.synthesis.speaking && this.isPaused) {
      this.synthesis.resume();
      this.isPaused = false;
    }
  }

  /**
   * Stop speech
   */
  stop() {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
      this.currentUtterance = null;
      this.isPaused = false;
    }
  }

  /**
   * Check if speaking
   * @returns {boolean}
   */
  isSpeaking() {
    return this.synthesis.speaking;
  }

  /**
   * Check if paused
   * @returns {boolean}
   */
  isPausedState() {
    return this.isPaused;
  }

  /**
   * Set speech rate
   * @param {number} rate - Speech rate (0.1 to 10)
   */
  setRate(rate) {
    this.rate = Math.max(0.1, Math.min(10, rate));
  }

  /**
   * Set pitch
   * @param {number} pitch - Pitch (0 to 2)
   */
  setPitch(pitch) {
    this.pitch = Math.max(0, Math.min(2, pitch));
  }

  /**
   * Set volume
   * @param {number} volume - Volume (0 to 1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Set callback for speech start
   * @param {Function} callback
   */
  onStart(callback) {
    this.onStartCallback = callback;
  }

  /**
   * Set callback for speech end
   * @param {Function} callback
   */
  onEnd(callback) {
    this.onEndCallback = callback;
  }

  /**
   * Set callback for speech error
   * @param {Function} callback
   */
  onError(callback) {
    this.onErrorCallback = callback;
  }

  /**
   * Get available voices
   * @returns {Array<SpeechSynthesisVoice>}
   */
  getAvailableVoices() {
    return this.synthesis.getVoices();
  }

  /**
   * Set voice by language code
   * @param {string} langCode - Language code (e.g., 'nl-NL')
   */
  setVoiceByLanguage(langCode) {
    const voices = this.synthesis.getVoices();
    const voice = voices.find(v => v.lang === langCode);
    if (voice) {
      this.voice = voice;
    }
  }

  /**
   * Check if speech synthesis is supported
   * @returns {boolean}
   */
  static isSupported() {
    return 'speechSynthesis' in window;
  }
}

export default SpeechService;
