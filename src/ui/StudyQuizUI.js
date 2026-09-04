import { QUIZ_QUESTIONS } from '../data/quizData.js';

export class StudyQuizUI {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.container = document.getElementById('quiz-modal');
    this.scoreValEl = document.getElementById('quiz-score-val');
    this.qNumEl = document.getElementById('quiz-q-num');
    this.bodyEl = document.getElementById('quiz-body');
    this.exitBtn = document.getElementById('btn-exit-quiz');

    this.currentQIndex = 0;
    this.score = 0;

    if (this.exitBtn) {
      this.exitBtn.addEventListener('click', () => this.hide());
    }

    this.eventBus.on('MODE_CHANGED', ({ mode }) => {
      if (mode === 'quiz') {
        this.startQuiz();
      } else {
        this.hide();
      }
    });

    this.eventBus.on('START_QUIZ', () => {
      this.startQuiz();
    });
  }

  startQuiz() {
    this.currentQIndex = 0;
    this.score = 0;
    this.updateScoreUI();
    this.renderQuestion();
    this.show();
  }

  renderQuestion() {
    if (!this.bodyEl) return;
    const q = QUIZ_QUESTIONS[this.currentQIndex];
    if (!q) {
      this.renderSummary();
      return;
    }

    if (this.qNumEl) this.qNumEl.textContent = `${this.currentQIndex + 1}/${QUIZ_QUESTIONS.length}`;

    this.bodyEl.innerHTML = `
      <div style="font-size: 1rem; font-weight: 600; margin-bottom: 14px;">${q.question}</div>
      <div class="quiz-options" style="display: flex; flex-direction: column; gap: 8px;">
        ${q.options.map((opt, idx) => `
          <button class="quiz-opt-btn btn btn-secondary" data-index="${idx}" style="text-align: left; justify-content: flex-start;">
            ${idx + 1}. ${opt}
          </button>
        `).join('')}
      </div>
      <div id="quiz-feedback" class="hidden" style="margin-top: 14px; padding: 10px; border-radius: var(--radius-sm);"></div>
    `;

    const optBtns = this.bodyEl.querySelectorAll('.quiz-opt-btn');
    optBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedIndex = parseInt(btn.dataset.index);
        this.evaluateAnswer(selectedIndex, optBtns);
      });
    });
  }

  evaluateAnswer(selectedIndex, optBtns) {
    const q = QUIZ_QUESTIONS[this.currentQIndex];
    const feedbackEl = this.bodyEl.querySelector('#quiz-feedback');

    optBtns.forEach(b => b.disabled = true);

    if (selectedIndex === q.correctIndex) {
      this.score += 20;
      this.updateScoreUI();
      optBtns[selectedIndex].style.borderColor = '#10B981';
      optBtns[selectedIndex].style.background = 'rgba(16, 185, 129, 0.15)';
      if (feedbackEl) {
        feedbackEl.classList.remove('hidden');
        feedbackEl.style.background = 'rgba(16, 185, 129, 0.1)';
        feedbackEl.style.borderLeft = '3px solid #10B981';
        feedbackEl.innerHTML = `<strong>✓ Correct!</strong><br/>${q.explanation}`;
      }
    } else {
      optBtns[selectedIndex].style.borderColor = '#EF4444';
      optBtns[selectedIndex].style.background = 'rgba(239, 68, 68, 0.15)';
      optBtns[q.correctIndex].style.borderColor = '#10B981';
      if (feedbackEl) {
        feedbackEl.classList.remove('hidden');
        feedbackEl.style.background = 'rgba(239, 68, 68, 0.1)';
        feedbackEl.style.borderLeft = '3px solid #EF4444';
        feedbackEl.innerHTML = `<strong>✕ Not quite.</strong><br/>${q.explanation}`;
      }
    }

    setTimeout(() => {
      this.currentQIndex++;
      this.renderQuestion();
    }, 2800);
  }

  renderSummary() {
    if (!this.bodyEl) return;
    this.bodyEl.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h2 style="font-size: 1.6rem; color: var(--accent-primary); margin-bottom: 8px;">Quiz Completed!</h2>
        <p style="font-size: 1.1rem; margin-bottom: 16px;">Final Active Recall Score: <strong>${this.score}%</strong></p>
        <button class="btn btn-primary" id="btn-restart-quiz">Restart Quiz</button>
      </div>
    `;
    const restartBtn = this.bodyEl.querySelector('#btn-restart-quiz');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.startQuiz());
    }
  }

  updateScoreUI() {
    if (this.scoreValEl) this.scoreValEl.textContent = `${this.score}`;
  }

  show() {
    if (this.container) this.container.classList.remove('hidden');
  }

  hide() {
    if (this.container) this.container.classList.add('hidden');
  }
}
