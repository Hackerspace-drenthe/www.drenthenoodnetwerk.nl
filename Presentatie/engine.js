// engine.js — Presentatie Engine "Mei MeshCore Maand"
// SPA slide loader, keyboard/clicker nav, animation triggers, presenter-view, BroadcastChannel sync.

import config from './config.js';

/* ========================================================================
   State
   ======================================================================== */

const state = {
  currentIndex: 0,
  isPresenterMode: false,
  isBlackout: false,
  isFullscreen: false,
  timerRunning: false,
  timerStart: null,
  timerElapsed: 0,
  slideCache: new Map(),
  currentAnimation: null,
  animationPlayed: false,    // has animation.play() been called?
  animationComplete: false,  // has onComplete fired?
  sequentialStep: 0,         // for triggerMode: 'sequential'
  sequentialAnimations: [],  // array of loaded animation controllers
  channel: null
};

/* ========================================================================
   DOM References
   ======================================================================== */

let slideContainer;
let progressBar;
let slideNumber;
let presenterView;

/* ========================================================================
   Initialization
   ======================================================================== */

export function init() {
  state.isPresenterMode = new URLSearchParams(window.location.search).get('mode') === 'presenter';

  slideContainer = document.getElementById('slide-container');
  progressBar = document.getElementById('progress-bar');
  slideNumber = document.getElementById('slide-number');
  presenterView = document.getElementById('presenter-view');

  // BroadcastChannel for presenter ↔ beamer sync
  state.channel = new BroadcastChannel('meshcore-presentation');
  state.channel.onmessage = handleChannelMessage;

  if (state.isPresenterMode) {
    document.body.classList.add('presenter-mode');
    initPresenterView();
  }

  bindKeyboard();
  loadSlide(0);
}

/* ========================================================================
   Slide Loading
   ======================================================================== */

async function fetchSlide(index) {
  const slideConfig = config.slides[index];
  if (!slideConfig) return '';

  if (state.slideCache.has(index)) {
    return state.slideCache.get(index);
  }

  try {
    const response = await fetch(slideConfig.file);
    if (!response.ok) {
      console.warn(`Slide ${slideConfig.id}: fetch failed (${response.status})`);
      return fallbackSlide(slideConfig);
    }
    const html = await response.text();
    state.slideCache.set(index, html);
    return html;
  } catch (err) {
    console.warn(`Slide ${slideConfig.id}: fetch error`, err);
    return fallbackSlide(slideConfig);
  }
}

function fallbackSlide(slideConfig) {
  return `<section class="slide" data-layout="D">
    <div class="slide-center">
      <h2>${escapeHtml(slideConfig.id)}</h2>
      <p class="slide-subtitle">Slide wordt geladen…</p>
    </div>
  </section>`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadSlide(index) {
  if (index < 0 || index >= config.slides.length) return;

  const slideConfig = config.slides[index];

  // Destroy previous animation
  destroyCurrentAnimation();

  // Fetch slide HTML
  const html = await fetchSlide(index);

  // Fade out → inject → fade in
  if (!state.isPresenterMode) {
    slideContainer.style.opacity = '0';

    await delay(config.transition.duration);

    slideContainer.innerHTML = html;

    // Mark the slide as active
    const section = slideContainer.querySelector('.slide');
    if (section) section.classList.add('active');

    slideContainer.style.opacity = '1';
  }

  state.currentIndex = index;
  state.animationPlayed = false;
  state.animationComplete = false;
  state.sequentialStep = 0;
  state.sequentialAnimations = [];

  updateProgress();

  // Load and init animation
  await initSlideAnimation(slideConfig);

  // Auto-trigger?
  if (slideConfig.triggerMode === 'auto' && state.currentAnimation) {
    state.currentAnimation.play();
    state.animationPlayed = true;
  }

  // Prefetch next slide
  if (index + 1 < config.slides.length) {
    fetchSlide(index + 1);
  }

  // Sync to presenter / beamer
  broadcastState();

  // Update presenter view
  if (state.isPresenterMode) {
    updatePresenterView();
  }
}

/* ========================================================================
   Animation Management
   ======================================================================== */

async function initSlideAnimation(slideConfig) {
  const animationName = slideConfig.animation;
  if (!animationName) return;

  const container = slideContainer.querySelector('.slide-animation, .slide-animation--fullscreen');
  if (!container) return;

  if (slideConfig.triggerMode === 'sequential' && Array.isArray(animationName)) {
    // Load multiple animations for sequential mode
    for (let i = 0; i < animationName.length; i++) {
      try {
        const module = await import(`./animations/${animationName[i]}.js`);
        const opts = Array.isArray(slideConfig.animationOptions)
          ? slideConfig.animationOptions[i] || {}
          : slideConfig.animationOptions;
        const controller = module.init(container, opts);
        state.sequentialAnimations.push(controller);
      } catch (err) {
        console.warn(`Animation ${animationName[i]}: load failed`, err);
      }
    }
    // Set current to first for reference
    if (state.sequentialAnimations.length > 0) {
      state.currentAnimation = state.sequentialAnimations[0];
    }
  } else {
    // Single animation
    const name = Array.isArray(animationName) ? animationName[0] : animationName;
    try {
      const module = await import(`./animations/${name}.js`);
      const controller = module.init(container, slideConfig.animationOptions || {});
      state.currentAnimation = controller;

      controller.onComplete(() => {
        state.animationComplete = true;
      });
    } catch (err) {
      console.warn(`Animation ${name}: load failed`, err);
    }
  }
}

function destroyCurrentAnimation() {
  if (state.currentAnimation && typeof state.currentAnimation.destroy === 'function') {
    state.currentAnimation.destroy();
  }
  // Destroy sequential animations
  for (const anim of state.sequentialAnimations) {
    if (typeof anim.destroy === 'function') {
      anim.destroy();
    }
  }
  state.currentAnimation = null;
  state.sequentialAnimations = [];
}

/* ========================================================================
   Navigation & Trigger Logic
   ======================================================================== */

function handleAdvance() {
  const slideConfig = config.slides[state.currentIndex];
  const mode = slideConfig.triggerMode || (slideConfig.animation ? 'click' : 'none');

  switch (mode) {
    case 'none':
    case 'auto':
      goNext();
      break;

    case 'click':
      if (!state.animationPlayed && state.currentAnimation) {
        // First click: play animation
        state.currentAnimation.play();
        state.animationPlayed = true;
      } else {
        // Animation already played (or complete) → next slide
        goNext();
      }
      break;

    case 'sequential': {
      const step = state.sequentialStep;
      if (step < state.sequentialAnimations.length) {
        // Play next animation in sequence
        state.sequentialAnimations[step].play();
        state.sequentialStep++;
      } else {
        // All animations played → next slide
        goNext();
      }
      break;
    }
  }
}

function handleRetreat() {
  goPrev();
}

function goNext() {
  if (state.currentIndex < config.slides.length - 1) {
    loadSlide(state.currentIndex + 1);
  }
}

function goPrev() {
  if (state.currentIndex > 0) {
    loadSlide(state.currentIndex - 1);
  }
}

function goFirst() {
  loadSlide(0);
}

function goLast() {
  loadSlide(config.slides.length - 1);
}

/* ========================================================================
   Keyboard Shortcuts
   ======================================================================== */

function bindKeyboard() {
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in an input
    if (e.target.matches('input, textarea, select')) return;

    switch (e.key) {
      case 'ArrowRight':
      case ' ':
      case 'PageDown':
      case 'n':
      case 'N':
        e.preventDefault();
        handleAdvance();
        break;

      case 'ArrowLeft':
      case 'PageUp':
      case 'p':
      case 'P':
        e.preventDefault();
        handleRetreat();
        break;

      case 'Home':
        e.preventDefault();
        goFirst();
        break;

      case 'End':
        e.preventDefault();
        goLast();
        break;

      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;

      case 'Escape':
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        break;

      case 's':
      case 'S':
        e.preventDefault();
        openPresenterView();
        break;

      case 't':
      case 'T':
        e.preventDefault();
        toggleTimer();
        break;

      case 'b':
      case 'B':
        e.preventDefault();
        toggleBlackout();
        break;
    }
  });
}

/* ========================================================================
   Fullscreen
   ======================================================================== */

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

/* ========================================================================
   Blackout
   ======================================================================== */

function toggleBlackout() {
  state.isBlackout = !state.isBlackout;
  document.body.classList.toggle('blackout', state.isBlackout);
  broadcastState();
}

/* ========================================================================
   Timer
   ======================================================================== */

function toggleTimer() {
  if (state.timerRunning) {
    state.timerElapsed += Date.now() - state.timerStart;
    state.timerRunning = false;
  } else {
    state.timerStart = Date.now();
    state.timerRunning = true;
    tickTimer();
  }
  broadcastState();
}

function tickTimer() {
  if (!state.timerRunning) return;
  if (state.isPresenterMode) {
    updateTimerDisplay();
  }
  requestAnimationFrame(tickTimer);
}

function getElapsedSeconds() {
  let total = state.timerElapsed;
  if (state.timerRunning) {
    total += Date.now() - state.timerStart;
  }
  return Math.floor(total / 1000);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/* ========================================================================
   Progress & UI Updates
   ======================================================================== */

function updateProgress() {
  const total = config.slides.length;
  const current = state.currentIndex;
  const pct = total > 1 ? (current / (total - 1)) * 100 : 0;

  if (progressBar) {
    progressBar.style.width = `${pct}%`;
  }
  if (slideNumber) {
    slideNumber.textContent = `${current}/${total - 1}`;
  }
}

/* ========================================================================
   BroadcastChannel — Presenter ↔ Beamer Sync
   ======================================================================== */

function broadcastState() {
  if (!state.channel) return;
  state.channel.postMessage({
    type: 'sync',
    index: state.currentIndex,
    blackout: state.isBlackout,
    timerRunning: state.timerRunning,
    timerElapsed: getElapsedSeconds()
  });
}

function handleChannelMessage(event) {
  const msg = event.data;
  if (msg.type === 'sync') {
    // Only react if the other side changed the slide
    if (msg.index !== state.currentIndex) {
      loadSlide(msg.index);
    }
    if (msg.blackout !== state.isBlackout) {
      state.isBlackout = msg.blackout;
      document.body.classList.toggle('blackout', state.isBlackout);
    }
  }
}

/* ========================================================================
   Presenter View
   ======================================================================== */

function openPresenterView() {
  const url = `${window.location.origin}${window.location.pathname}?mode=presenter`;
  window.open(url, 'meshcore-presenter', 'width=1200,height=800');
}

function initPresenterView() {
  if (!presenterView) return;

  presenterView.innerHTML = `
    <div class="presenter-header">
      <span class="act-name"></span>
      <span class="timer">00:00</span>
    </div>
    <div class="presenter-current">
      <div class="presenter-slide-render"></div>
    </div>
    <div class="presenter-next">
      <div class="presenter-slide-render"></div>
    </div>
    <div class="presenter-notes-panel"></div>
    <div class="presenter-progress">
      <div class="progress-track"><div class="progress-fill"></div></div>
      <span class="progress-label"></span>
    </div>
  `;
}

async function updatePresenterView() {
  if (!presenterView) return;

  const slideConfig = config.slides[state.currentIndex];
  const act = config.acts.find(a => a.id === slideConfig.act);

  // Act name
  const actEl = presenterView.querySelector('.act-name');
  if (actEl) actEl.textContent = act ? act.label : '';

  // Current slide
  const currentRender = presenterView.querySelector('.presenter-current .presenter-slide-render');
  if (currentRender) {
    const html = await fetchSlide(state.currentIndex);
    currentRender.innerHTML = html;
  }

  // Next slide
  const nextRender = presenterView.querySelector('.presenter-next .presenter-slide-render');
  if (nextRender) {
    if (state.currentIndex + 1 < config.slides.length) {
      const html = await fetchSlide(state.currentIndex + 1);
      nextRender.innerHTML = html;
    } else {
      nextRender.innerHTML = '<p style="color: var(--color-text-muted); padding: 2rem;">Einde presentatie</p>';
    }
  }

  // Notes
  const notesPanel = presenterView.querySelector('.presenter-notes-panel');
  if (notesPanel) {
    const currentHtml = await fetchSlide(state.currentIndex);
    const tmp = document.createElement('div');
    tmp.innerHTML = currentHtml;
    const notes = tmp.querySelector('.presenter-notes');
    if (notes) {
      notesPanel.innerHTML = '';
      // Speaker label
      const speakerLabel = document.createElement('div');
      speakerLabel.className = 'speaker-label';
      const speaker = slideConfig.speaker;
      if (Array.isArray(speaker)) {
        speakerLabel.textContent = speaker.map(s => config.speakers[s]?.name || s).join(' + ');
      } else if (speaker) {
        speakerLabel.textContent = config.speakers[speaker]?.name || speaker;
      }
      notesPanel.appendChild(speakerLabel);
      // Note content
      for (const note of notes.children) {
        notesPanel.appendChild(note.cloneNode(true));
      }
    } else {
      notesPanel.innerHTML = '<p style="color: var(--color-text-muted);">Geen notities</p>';
    }
  }

  // Progress
  const total = config.slides.length;
  const pct = total > 1 ? (state.currentIndex / (total - 1)) * 100 : 0;
  const fill = presenterView.querySelector('.progress-fill');
  if (fill) fill.style.width = `${pct}%`;
  const label = presenterView.querySelector('.progress-label');
  if (label) label.textContent = `Slide ${state.currentIndex}/${total - 1}`;

  updateTimerDisplay();
}

function updateTimerDisplay() {
  const timerEl = presenterView?.querySelector('.timer');
  if (timerEl) {
    timerEl.textContent = formatTime(getElapsedSeconds());
  }
}

/* ========================================================================
   Utilities
   ======================================================================== */

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ========================================================================
   Boot
   ======================================================================== */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
