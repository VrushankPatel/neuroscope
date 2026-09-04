import { ANATOMY_DATABASE } from '../data/anatomyData.js';

export class ContextPanelUI {
  constructor(panelElement, eventBus) {
    this.panel = panelElement;
    this.eventBus = eventBus;

    this.titleEl = document.getElementById('panel-title');
    this.latinEl = document.getElementById('panel-latin');
    this.catEl = document.getElementById('panel-category');
    this.locEl = document.getElementById('panel-location');
    this.funcEl = document.getElementById('panel-function');
    this.connEl = document.getElementById('panel-connections');
    this.clinEl = document.getElementById('panel-clinical');

    this.closeBtn = document.getElementById('close-panel-btn');
    this.traceBtn = document.getElementById('btn-trace-pathway');
    this.explainBtn = document.getElementById('btn-explain-structure');
    this.quizBtn = document.getElementById('btn-quiz-structure');

    this.currentStructureId = null;

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.hide());
    }

    if (this.explainBtn) {
      this.explainBtn.addEventListener('click', () => {
        if (this.currentStructureId) {
          this.eventBus.emit('OPEN_EXPLAIN_MODAL', { structureId: this.currentStructureId });
        }
      });
    }

    if (this.traceBtn) {
      this.traceBtn.addEventListener('click', () => {
        if (this.currentStructureId) {
          this.eventBus.emit('TRACE_STRUCTURE_PATHWAY', { structureId: this.currentStructureId });
        }
      });
    }

    if (this.quizBtn) {
      this.quizBtn.addEventListener('click', () => {
        this.eventBus.emit('START_QUIZ');
      });
    }

    this.eventBus.on('STRUCTURE_SELECTED', ({ structureId }) => {
      this.showStructure(structureId);
    });
  }

  showStructure(structureId) {
    const data = ANATOMY_DATABASE[structureId];
    if (!data) return;

    this.currentStructureId = structureId;

    if (this.titleEl) this.titleEl.textContent = data.name;
    if (this.latinEl) this.latinEl.textContent = data.latinName || '';
    if (this.catEl) this.catEl.textContent = data.category.replace('_', ' ');
    if (this.locEl) this.locEl.textContent = data.location;
    if (this.funcEl) this.funcEl.textContent = data.function;

    if (this.connEl) {
      this.connEl.innerHTML = '';
      data.connections.forEach(conn => {
        const li = document.createElement('li');
        li.textContent = conn;
        this.connEl.appendChild(li);
      });
    }

    if (this.clinEl) this.clinEl.textContent = data.clinicalRelevance;

    this.show();
  }

  show() {
    if (this.panel) this.panel.classList.remove('hidden');
  }

  hide() {
    if (this.panel) this.panel.classList.add('hidden');
  }
}
