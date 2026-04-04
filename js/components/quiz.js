/**
 * Quiz — Interactive knowledge check component.
 * Renders multiple-choice questions and tracks score.
 * Progressive enhancement: works only with JS, quiz content is in HTML.
 */

/**
 * Initializes all quiz components on the page.
 */
function initQuiz() {
  var quizContainers = document.querySelectorAll('.quiz');
  if (!quizContainers.length) return;

  quizContainers.forEach(function(container) {
    setupQuiz(container);
  });
}

/**
 * Sets up a single quiz instance.
 * @param {HTMLElement} container
 */
function setupQuiz(container) {
  var questions = container.querySelectorAll('.quiz-question');
  var resultPanel = container.querySelector('.quiz-result');
  var scoreEl = container.querySelector('.quiz-score');
  var restartBtn = container.querySelector('.quiz-restart');
  var currentIndex = 0;
  var score = 0;
  var total = questions.length;

  if (total === 0) return;

  // Hide all questions, show first
  questions.forEach(function(q, i) {
    q.hidden = i !== 0;
    q.setAttribute('aria-hidden', i !== 0 ? 'true' : 'false');
  });
  if (resultPanel) resultPanel.hidden = true;

  // Update progress indicator
  var progressEl = container.querySelector('.quiz-progress');
  function updateProgress() {
    if (progressEl) {
      progressEl.textContent = 'Vraag ' + (currentIndex + 1) + ' van ' + total;
    }
  }
  updateProgress();

  /**
   * Handles answer selection.
   * @param {HTMLElement} question - the question container
   * @param {HTMLElement} button - the clicked answer button
   */
  function handleAnswer(question, button) {
    var isCorrect = button.getAttribute('data-correct') === 'true';
    var options = question.querySelectorAll('.quiz-option');
    var feedback = question.querySelector('.quiz-feedback');

    // Disable all options
    options.forEach(function(opt) {
      opt.disabled = true;
      if (opt.getAttribute('data-correct') === 'true') {
        opt.classList.add('quiz-option--correct');
      }
    });

    if (isCorrect) {
      score++;
      button.classList.add('quiz-option--correct');
      if (feedback) {
        feedback.textContent = '✓ Goed! ' + (button.getAttribute('data-explanation') || '');
        feedback.className = 'quiz-feedback quiz-feedback--correct';
      }
    } else {
      button.classList.add('quiz-option--wrong');
      if (feedback) {
        feedback.textContent = '✗ Niet helemaal. ' + (button.getAttribute('data-explanation') || '');
        feedback.className = 'quiz-feedback quiz-feedback--wrong';
      }
    }
    if (feedback) feedback.hidden = false;

    // Show next button
    var nextBtn = question.querySelector('.quiz-next');
    if (nextBtn) {
      nextBtn.hidden = false;
      nextBtn.focus();
    }
  }

  /**
   * Advances to the next question or shows results.
   */
  function nextQuestion() {
    questions[currentIndex].hidden = true;
    questions[currentIndex].setAttribute('aria-hidden', 'true');
    currentIndex++;

    if (currentIndex < total) {
      questions[currentIndex].hidden = false;
      questions[currentIndex].setAttribute('aria-hidden', 'false');
      updateProgress();
      // Focus first option of next question
      var firstOpt = questions[currentIndex].querySelector('.quiz-option');
      if (firstOpt) firstOpt.focus();
    } else {
      showResult();
    }
  }

  /**
   * Shows the final score and feedback.
   */
  function showResult() {
    if (progressEl) progressEl.textContent = 'Klaar!';

    if (resultPanel) {
      resultPanel.hidden = false;
      var pct = Math.round((score / total) * 100);
      if (scoreEl) {
        scoreEl.textContent = score + ' van ' + total + ' goed (' + pct + '%)';
      }

      var msgEl = resultPanel.querySelector('.quiz-result__message');
      if (msgEl) {
        if (pct === 100) {
          msgEl.textContent = 'Perfect! Je begrijpt mesh-netwerken uitstekend.';
        } else if (pct >= 60) {
          msgEl.textContent = 'Goed gedaan! Je hebt de basis goed begrepen.';
        } else {
          msgEl.textContent = 'Nog even oefenen. Lees de pagina nog eens door en probeer opnieuw!';
        }
      }
    }
  }

  /**
   * Resets the quiz to start over.
   */
  function resetQuiz() {
    currentIndex = 0;
    score = 0;

    questions.forEach(function(q, i) {
      q.hidden = i !== 0;
      q.setAttribute('aria-hidden', i !== 0 ? 'true' : 'false');

      // Reset options
      q.querySelectorAll('.quiz-option').forEach(function(opt) {
        opt.disabled = false;
        opt.classList.remove('quiz-option--correct', 'quiz-option--wrong');
      });

      // Hide feedback and next
      var feedback = q.querySelector('.quiz-feedback');
      if (feedback) { feedback.hidden = true; feedback.textContent = ''; }
      var nextBtn = q.querySelector('.quiz-next');
      if (nextBtn) nextBtn.hidden = true;
    });

    if (resultPanel) resultPanel.hidden = true;
    updateProgress();
  }

  // Event delegation
  container.addEventListener('click', function(e) {
    var optBtn = e.target.closest('.quiz-option');
    if (optBtn && !optBtn.disabled) {
      var question = optBtn.closest('.quiz-question');
      handleAnswer(question, optBtn);
      return;
    }

    var nextBtn = e.target.closest('.quiz-next');
    if (nextBtn) {
      nextQuestion();
      return;
    }

    if (e.target.closest('.quiz-restart')) {
      resetQuiz();
    }
  });
}
