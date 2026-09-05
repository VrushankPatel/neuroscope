import { GlobalData } from '../data/GlobalData.js';

export class ClinicalUI {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.container = document.getElementById('clinical-modal');
    this.titleEl = document.getElementById('case-title');
    this.historyEl = document.getElementById('case-history');
    this.feedbackEl = document.getElementById('case-feedback');

    this.currentCaseIndex = 0;

    this.eventBus.on('MODE_CHANGED', ({ mode }) => {
      if (mode === 'clinical') {
        this.loadCase(0);
        this.show();
      } else {
        this.hide();
      }
    });

    this.eventBus.on('STRUCTURE_SELECTED', ({ structureId }) => {
      if (!this.container || this.container.classList.contains('hidden')) return;
      this.evaluateLesionClick(structureId);
    });
  }

  getCases() {
    return GlobalData.getClinicalCases();
  }

  loadCase(index) {
    this.currentCaseIndex = index;
    const cases = this.getCases();
    const caseData = cases ? cases[index] : null;
    if (!caseData) return;

    if (this.titleEl) this.titleEl.textContent = caseData.title;
    if (this.historyEl) this.historyEl.textContent = caseData.vignette;
    if (this.feedbackEl) this.feedbackEl.classList.add('hidden');
  }

  evaluateLesionClick(selectedStructureId) {
    const cases = this.getCases();
    const caseData = cases ? cases[this.currentCaseIndex] : null;
    if (!caseData || !this.feedbackEl) return;

    this.feedbackEl.classList.remove('hidden');

    if (selectedStructureId === caseData.targetStructureId) {
      this.feedbackEl.innerHTML = `
        <div style="color: #10B981; font-weight: 700; margin-bottom: 6px;">✓ Correct Lesion Localization!</div>
        <div>${caseData.explanation}</div>
      `;
    } else {
      this.feedbackEl.innerHTML = `
        <div style="color: #EF4444; font-weight: 700; margin-bottom: 6px;">✕ Incorrect Localization</div>
        <div>The selected structure is not the primary lesion site for this presentation. Review the clinical symptoms and try clicking the 3D model again.</div>
      `;
    }
  }

  show() {
    if (this.container) this.container.classList.remove('hidden');
  }

  hide() {
    if (this.container) this.container.classList.add('hidden');
  }
}
