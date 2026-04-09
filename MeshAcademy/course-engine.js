/**
 * MeshCore Academy — Shared Course Engine
 * Handles: quiz logic, scoring, LocalStorage progress, section navigation,
 * course locking, ARIA announcements, keyboard navigation.
 *
 * SOLID:
 *  S — Each class has one responsibility
 *  O — New question types can be added without modifying existing code
 *  L — All courses follow the same CourseConfig interface
 *  I — Minimal API surface between engine and course pages
 *  D — Courses depend on the engine abstraction, not concrete DOM details
 */

/* ─── STORAGE MANAGER ─── */
const StorageManager = (() => {
  const KEY = 'meshcore-academy';

  function _read() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : _default();
    } catch { return _default(); }
  }

  function _write(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* quota */ }
  }

  function _default() {
    return { courses: {}, currentCourse: null, totalPoints: 0 };
  }

  function getCourseProgress(courseId) {
    const data = _read();
    return data.courses[courseId] || {
      completed: false, quizScore: 0, quizTotal: 0,
      sectionsRead: [], bestScore: 0, attempts: 0, lastAccess: null
    };
  }

  function saveCourseProgress(courseId, progress) {
    const data = _read();
    progress.lastAccess = new Date().toISOString();
    data.courses[courseId] = progress;
    data.currentCourse = courseId;
    _recalcTotal(data);
    _write(data);
  }

  function getAllProgress() { return _read(); }

  function isCourseUnlocked(courseId, courseOrder) {
    // Only the final exam requires all previous courses to be completed
    if (courseId === 'c-eindexamen') {
      return courseOrder.filter(id => id !== 'c-eindexamen').every(id => {
        const p = getCourseProgress(id);
        return p.completed && p.quizTotal > 0 && (p.bestScore / p.quizTotal * 100) >= 70;
      });
    }
    return true; // all other courses are always accessible
  }

  function _recalcTotal(data) {
    data.totalPoints = Object.values(data.courses)
      .reduce((sum, c) => sum + (c.bestScore || 0), 0);
  }

  function resetAll() {
    try { localStorage.removeItem(KEY); } catch { /* */ }
  }

  return { getCourseProgress, saveCourseProgress, getAllProgress, isCourseUnlocked, resetAll };
})();


/* ─── COURSE ORDER (canonical) ─── */
const COURSE_ORDER = [
  'c-mesh-basis', 'c-noodnetwerk', 'c-lora-basis', 'c-lora-regels',
  'c-hardware', 'c-firmware', 'c-configuratie',
  'c-antenne-types', 'c-antenne-plaatsing', 'c-link-budget',
  'c-stroomverbruik', 'c-channels', 'c-packet-types', 'c-routering',
  'c-protocollen', 'c-beveiliging', 'c-onderhoud',
  'c-netwerk-ontwerp', 'c-eindexamen'
];

const COURSE_FILES = {
  'c-mesh-basis':        'c01-wat-is-mesh.html',
  'c-noodnetwerk':       'c02-waarom-noodnetwerk.html',
  'c-lora-basis':        'c03-lora-radio-basis.html',
  'c-lora-regels':       'c04-lora-regelgeving.html',
  'c-hardware':          'c05-meshcore-hardware.html',
  'c-firmware':          'c06-firmware-installeren.html',
  'c-configuratie':      'c07-eerste-configuratie.html',
  'c-antenne-types':     'c08-antenne-types.html',
  'c-antenne-plaatsing': 'c09-antenne-plaatsing-rf.html',
  'c-link-budget':       'c10-link-budget-planning.html',
  'c-stroomverbruik':    'c11-stroomverbruik-batterij.html',
  'c-channels':          'c12-meshcore-channels-rooms.html',
  'c-packet-types':      'c13-meshcore-packet-types.html',
  'c-routering':         'c14-routering-flooding.html',
  'c-protocollen':       'c15-protocollen-vergelijken.html',
  'c-beveiliging':       'c16-beveiliging-encryptie.html',
  'c-onderhoud':         'c17-onderhoud-troubleshooting.html',
  'c-netwerk-ontwerp':   'c18-netwerk-ontwerp-scenarios.html',
  'c-eindexamen':        'c19-eindexamen.html'
};

const COURSE_META = {
  'c-mesh-basis':        { title: 'Wat is een Mesh?',              level: 'Beginner',  icon: '🌐', color: '#00ff88' },
  'c-noodnetwerk':       { title: 'Waarom een Noodnetwerk?',       level: 'Beginner',  icon: '🆘', color: '#ff6b00' },
  'c-lora-basis':        { title: 'LoRa Radio Basis',              level: 'Beginner',  icon: '📡', color: '#00e5ff' },
  'c-lora-regels':       { title: 'LoRa Regelgeving',              level: 'Beginner',  icon: '⚖️', color: '#ffd060' },
  'c-hardware':          { title: 'MeshCore Hardware',             level: 'Beginner',  icon: '🔧', color: '#c864ff' },
  'c-firmware':          { title: 'Firmware Installeren',           level: 'Beginner',  icon: '⚡', color: '#ff6b00' },
  'c-configuratie':      { title: 'Eerste Configuratie',            level: 'Beginner',  icon: '⚙️', color: '#00e5ff' },
  'c-antenne-types':     { title: 'Antenne Types',                  level: 'Gemiddeld', icon: '📶', color: '#ffd060' },
  'c-antenne-plaatsing': { title: 'Antenne Plaatsing & RF',         level: 'Gemiddeld', icon: '📍', color: '#00ff88' },
  'c-link-budget':       { title: 'Link Budget & Planning',         level: 'Gemiddeld', icon: '🧮', color: '#00e5ff' },
  'c-stroomverbruik':    { title: 'Stroomverbruik & Batterij',      level: 'Gemiddeld', icon: '🔋', color: '#ff6b00' },
  'c-channels':          { title: 'MeshCore Kanalen & Rooms',       level: 'Gemiddeld', icon: '💬', color: '#c864ff' },
  'c-packet-types':      { title: 'MeshCore Packet Types',          level: 'Gemiddeld', icon: '📦', color: '#ffd060' },
  'c-routering':         { title: 'Routering & Flooding',           level: 'Gemiddeld', icon: '🔄', color: '#00ff88' },
  'c-protocollen':       { title: 'Protocollen Vergelijken',        level: 'Gevorderd', icon: '🔀', color: '#ff6b00' },
  'c-beveiliging':       { title: 'Beveiliging & Encryptie',        level: 'Gevorderd', icon: '🔐', color: '#c864ff' },
  'c-onderhoud':         { title: 'Onderhoud & Troubleshooting',    level: 'Gevorderd', icon: '🛠️', color: '#ffd060' },
  'c-netwerk-ontwerp':   { title: 'Netwerk Ontwerp & Scenario\'s',  level: 'Gevorderd', icon: '🗺️', color: '#00e5ff' },
  'c-eindexamen':        { title: 'Eindexamen',                     level: 'Expert',    icon: '🎓', color: '#00ff88' }
};


/* ─── QUIZ ENGINE ─── */
class QuizEngine {
  constructor(containerId, questions, courseId) {
    this.container = document.getElementById(containerId);
    this.questions = questions;
    this.courseId = courseId;
    this.current = 0;
    this.answers = new Array(questions.length).fill(null);
    this.submitted = false;
  }

  render() {
    if (!this.container) return;
    if (this.submitted) { this._renderResults(); return; }
    this._renderQuestion();
  }

  _renderQuestion() {
    const q = this.questions[this.current];
    const total = this.questions.length;
    const progress = Math.round(((this.current) / total) * 100);

    this.container.innerHTML = `
      <div class="quiz-progress" role="progressbar" aria-valuenow="${progress}"
           aria-valuemin="0" aria-valuemax="100" aria-label="Quiz voortgang">
        <div class="quiz-progress-fill" style="width:${progress}%"></div>
      </div>
      <div class="quiz-header">
        <span class="quiz-counter">Vraag ${this.current + 1} van ${total}</span>
        <span class="quiz-score-preview">${this.answers.filter(a => a !== null).length} beantwoord</span>
      </div>
      <h3 class="quiz-question" id="quiz-q-label">${this._escHtml(q.question)}</h3>
      <div class="quiz-options" role="radiogroup" aria-labelledby="quiz-q-label">
        ${q.options.map((opt, i) => `
          <button class="quiz-option ${this.answers[this.current] === i ? 'selected' : ''}"
                  role="radio" aria-checked="${this.answers[this.current] === i}"
                  data-index="${i}" tabindex="0">
            <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
            <span class="opt-text">${this._escHtml(opt)}</span>
          </button>
        `).join('')}
      </div>
      <div class="quiz-nav">
        <button class="quiz-btn quiz-btn-prev" ${this.current === 0 ? 'disabled' : ''}
                aria-label="Vorige vraag">← Vorige</button>
        ${this.current === total - 1
          ? `<button class="quiz-btn quiz-btn-submit quiz-btn-primary"
                     ${this.answers.includes(null) ? 'disabled' : ''}
                     aria-label="Quiz inleveren">Inleveren ✓</button>`
          : `<button class="quiz-btn quiz-btn-next quiz-btn-primary"
                     aria-label="Volgende vraag">Volgende →</button>`}
      </div>
      ${this.answers.includes(null) && this.current === total - 1
        ? '<p class="quiz-hint" role="status">Beantwoord alle vragen om in te leveren.</p>' : ''}
    `;

    // Bind events
    this.container.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => this._selectOption(parseInt(btn.dataset.index)));
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this._selectOption(parseInt(btn.dataset.index));
        }
      });
    });

    const prevBtn = this.container.querySelector('.quiz-btn-prev');
    if (prevBtn) prevBtn.addEventListener('click', () => this._prev());

    const nextBtn = this.container.querySelector('.quiz-btn-next');
    if (nextBtn) nextBtn.addEventListener('click', () => this._next());

    const submitBtn = this.container.querySelector('.quiz-btn-submit');
    if (submitBtn) submitBtn.addEventListener('click', () => this._submit());
  }

  _selectOption(idx) {
    this.answers[this.current] = idx;
    this.render();
    // Focus the selected option
    const sel = this.container.querySelector('.quiz-option.selected');
    if (sel) sel.focus();
  }

  _prev() { if (this.current > 0) { this.current--; this.render(); } }
  _next() { if (this.current < this.questions.length - 1) { this.current++; this.render(); } }

  _submit() {
    if (this.answers.includes(null)) return;
    this.submitted = true;
    this._saveScore();
    this.render();
  }

  _saveScore() {
    const score = this.questions.reduce((sum, q, i) =>
      sum + (this.answers[i] === q.correct ? 1 : 0), 0);
    const total = this.questions.length;
    const progress = StorageManager.getCourseProgress(this.courseId);
    progress.quizScore = score;
    progress.quizTotal = total;
    progress.attempts = (progress.attempts || 0) + 1;
    if (score > (progress.bestScore || 0)) progress.bestScore = score;
    if (score / total >= 0.7) progress.completed = true;
    StorageManager.saveCourseProgress(this.courseId, progress);
  }

  _renderResults() {
    const score = this.questions.reduce((sum, q, i) =>
      sum + (this.answers[i] === q.correct ? 1 : 0), 0);
    const total = this.questions.length;
    const pct = Math.round(score / total * 100);
    const passed = pct >= 70;

    const nextIdx = COURSE_ORDER.indexOf(this.courseId) + 1;
    const nextId = nextIdx < COURSE_ORDER.length ? COURSE_ORDER[nextIdx] : null;
    const nextFile = nextId ? COURSE_FILES[nextId] : null;
    const nextMeta = nextId ? COURSE_META[nextId] : null;

    this.container.innerHTML = `
      <div class="quiz-results" role="alert" aria-live="polite">
        <div class="results-icon">${passed ? '🎉' : '📖'}</div>
        <h3 class="results-title">${passed ? 'Gefeliciteerd!' : 'Blijf oefenen!'}</h3>
        <div class="results-score">
          <span class="score-num ${passed ? 'pass' : 'fail'}">${pct}%</span>
          <span class="score-detail">${score} van ${total} correct</span>
        </div>
        <div class="results-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
          <div class="results-bar-fill ${passed ? 'pass' : 'fail'}" style="width:${pct}%"></div>
          <div class="results-bar-threshold" style="left:70%" aria-label="70% drempel"></div>
        </div>
        <p class="results-msg">
          ${passed
            ? (nextMeta
              ? `Je hebt deze cursus afgerond! De volgende cursus <strong>${nextMeta.title}</strong> is nu ontgrendeld.`
              : 'Je hebt alle cursussen voltooid! Je bent nu een MeshCore expert! 🏆')
            : 'Je hebt minimaal 70% nodig om verder te gaan. Bekijk de foute antwoorden hieronder en probeer opnieuw.'}
        </p>
        <div class="results-actions">
          ${passed && nextFile
            ? `<a href="${nextFile}" class="quiz-btn quiz-btn-primary">Volgende cursus →</a>` : ''}
          <button class="quiz-btn quiz-btn-retry">Opnieuw proberen</button>
          <a href="course-hub.html" class="quiz-btn">← Cursus overzicht</a>
        </div>
      </div>
      <div class="quiz-review">
        <h4>Antwoorden bekijken</h4>
        ${this.questions.map((q, i) => {
          const correct = this.answers[i] === q.correct;
          return `
            <div class="review-item ${correct ? 'correct' : 'wrong'}">
              <div class="review-header">
                <span class="review-icon">${correct ? '✓' : '✗'}</span>
                <span class="review-q">${this._escHtml(q.question)}</span>
              </div>
              <div class="review-body">
                <p>Jouw antwoord: <strong class="${correct ? 'text-pass' : 'text-fail'}">${this._escHtml(q.options[this.answers[i]])}</strong></p>
                ${!correct ? `<p>Juiste antwoord: <strong class="text-pass">${this._escHtml(q.options[q.correct])}</strong></p>` : ''}
                ${q.explanation ? `<p class="review-explanation">${this._escHtml(q.explanation)}</p>` : ''}
              </div>
            </div>`;
        }).join('')}
      </div>
    `;

    const retryBtn = this.container.querySelector('.quiz-btn-retry');
    if (retryBtn) retryBtn.addEventListener('click', () => this._retry());
  }

  _retry() {
    this.current = 0;
    this.answers = new Array(this.questions.length).fill(null);
    this.submitted = false;
    this.render();
  }

  _escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
}


/* ─── SECTION TRACKER ─── */
class SectionTracker {
  constructor(courseId) {
    this.courseId = courseId;
    this.sections = document.querySelectorAll('.lesson-section');
    this._initObserver();
  }

  _initObserver() {
    if (!this.sections.length) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = parseInt(entry.target.dataset.section);
          if (!isNaN(idx)) this._markRead(idx);
        }
      });
    }, { threshold: 0.3 });
    this.sections.forEach(s => observer.observe(s));
  }

  _markRead(idx) {
    const progress = StorageManager.getCourseProgress(this.courseId);
    if (!progress.sectionsRead.includes(idx)) {
      progress.sectionsRead.push(idx);
      StorageManager.saveCourseProgress(this.courseId, progress);
    }
    // Update sidebar dots
    const dot = document.querySelector(`.nav-dot[data-section="${idx}"]`);
    if (dot) dot.classList.add('read');
  }
}


/* ─── COURSE NAVIGATION ─── */
class CourseNav {
  constructor(courseId) {
    this.courseId = courseId;
    this._initSideNav();
    this._initKeyboard();
    this._initSkipLink();
    this._initReducedMotion();
    this._updateProgressBar();
  }

  _initSideNav() {
    const nav = document.getElementById('course-side-nav');
    if (!nav) return;
    const sections = document.querySelectorAll('.lesson-section, .quiz-section');
    const progress = StorageManager.getCourseProgress(this.courseId);

    sections.forEach(sec => {
      const idx = sec.dataset.section || 'quiz';
      const label = sec.dataset.label || 'Quiz';
      const isRead = progress.sectionsRead.includes(parseInt(idx));
      const dot = document.createElement('button');
      dot.className = `nav-dot ${isRead ? 'read' : ''} ${idx === 'quiz' ? 'nav-dot-quiz' : ''}`;
      dot.dataset.section = idx;
      dot.setAttribute('aria-label', label);
      dot.setAttribute('title', label);
      dot.tabIndex = 0;
      dot.addEventListener('click', () => {
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      nav.appendChild(dot);
    });
  }

  _initKeyboard() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const focused = document.activeElement;
        if (focused) focused.blur();
      }
    });
  }

  _initSkipLink() {
    const skip = document.getElementById('skip-link');
    if (skip) {
      skip.addEventListener('click', e => {
        e.preventDefault();
        const main = document.getElementById('main-content');
        if (main) { main.tabIndex = -1; main.focus(); }
      });
    }
  }

  _initReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('reduce-motion');
    }
  }

  _updateProgressBar() {
    const bar = document.getElementById('course-progress-fill');
    if (!bar) return;
    const sections = document.querySelectorAll('.lesson-section');
    const progress = StorageManager.getCourseProgress(this.courseId);
    const total = sections.length + 1; // +1 for quiz
    const done = progress.sectionsRead.length + (progress.completed ? 1 : 0);
    const pct = Math.round(done / total * 100);
    bar.style.width = pct + '%';
    const label = document.getElementById('course-progress-label');
    if (label) label.textContent = pct + '% voltooid';
  }
}


/* ─── ARIA ANNOUNCER ─── */
function announce(message) {
  let el = document.getElementById('aria-live-region');
  if (!el) {
    el = document.createElement('div');
    el.id = 'aria-live-region';
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    el.className = 'sr-only';
    document.body.appendChild(el);
  }
  el.textContent = '';
  requestAnimationFrame(() => { el.textContent = message; });
}


/* ─── INIT COURSE PAGE ─── */
function initCourse(courseId, quizQuestions) {
  // Check if course is unlocked
  if (!StorageManager.isCourseUnlocked(courseId, COURSE_ORDER)) {
    document.getElementById('main-content').innerHTML = `
      <div class="locked-msg" role="alert">
        <div class="locked-icon">🔒</div>
        <h2>Eindexamen vergrendeld</h2>
        <p>Rond eerst alle 18 cursussen af met minimaal 70% score om het eindexamen te ontgrendelen.</p>
        <a href="course-hub.html" class="quiz-btn quiz-btn-primary">← Terug naar overzicht</a>
      </div>`;
    return;
  }

  new SectionTracker(courseId);
  new CourseNav(courseId);

  const quizContainer = document.getElementById('quiz-container');
  if (quizContainer && quizQuestions && quizQuestions.length) {
    const engine = new QuizEngine('quiz-container', quizQuestions, courseId);
    engine.render();
  }

  announce(`Cursus geladen: ${COURSE_META[courseId]?.title || courseId}`);
}
