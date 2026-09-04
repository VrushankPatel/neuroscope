import { ANATOMY_DATABASE } from '../data/anatomyData.js';

export class ExplainModalUI {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.modal = document.getElementById('explain-modal');
    this.titleEl = document.getElementById('explain-title');
    this.bodyEl = document.getElementById('explain-body');
    this.closeBtn = document.getElementById('close-explain-btn');

    this.currentStructureId = null;
    this.currentLevel = 'medical_student';

    this.initTabs();
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    this.eventBus.on('OPEN_EXPLAIN_MODAL', ({ structureId }) => {
      this.openForStructure(structureId);
    });
  }

  initTabs() {
    const tabs = document.querySelectorAll('.depth-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentLevel = tab.dataset.level;
        this.renderExplanation();
      });
    });
  }

  openForStructure(structureId) {
    this.currentStructureId = structureId;
    const data = ANATOMY_DATABASE[structureId];
    if (data && this.titleEl) {
      this.titleEl.textContent = data.name;
    }
    this.renderExplanation();
    if (this.modal) this.modal.classList.remove('hidden');
  }

  renderExplanation() {
    if (!this.bodyEl || !this.currentStructureId) return;

    const data = ANATOMY_DATABASE[this.currentStructureId];
    if (!data) return;

    if (this.currentLevel === 'introductory') {
      this.bodyEl.innerHTML = `
        <p><strong>Overview:</strong> ${data.name} is a key component of the human brain system located in the ${data.location}.</p>
        <p style="margin-top: 10px;"><strong>Core Function:</strong> ${data.function}</p>
        <p style="margin-top: 10px;">Think of this area as an essential control hub for ${data.system} signals passing through your body!</p>
      `;
    } else if (this.currentLevel === 'medical_student') {
      this.bodyEl.innerHTML = `
        <p><strong>Anatomical Location:</strong> ${data.location}</p>
        <p style="margin-top: 10px;"><strong>Physiological Role:</strong> ${data.function}</p>
        <p style="margin-top: 10px;"><strong>Major Neural Pathways & Circuitry:</strong></p>
        <ul style="padding-left: 20px; margin-top: 6px;">
          ${data.connections.map(c => `<li>${c}</li>`).join('')}
        </ul>
        <p style="margin-top: 12px; padding: 10px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid var(--signal-pain);">
          <strong>Clinical Relevance:</strong> ${data.clinicalRelevance}
        </p>
      `;
    } else {
      // Advanced
      this.bodyEl.innerHTML = `
        <p><strong>Neuroanatomical Subdivisions:</strong> ${data.name} (${data.latinName || ''})</p>
        <p style="margin-top: 10px;"><strong>Functional Microcircuitry & Synaptology:</strong> Integrated into ${data.system} networks. Communicates via synaptic projections connecting ${data.connections.join(', ')}.</p>
        <p style="margin-top: 10px;"><strong>Clinical & Lesion Localization Pathology:</strong> ${data.clinicalRelevance}</p>
        <p style="margin-top: 10px; font-size: 0.8rem; color: var(--text-muted);">Primary References: ${data.references ? data.references.join('; ') : 'Standard Neuroanatomy Compendium'}</p>
      `;
    }
  }

  close() {
    if (this.modal) this.modal.classList.add('hidden');
  }
}
