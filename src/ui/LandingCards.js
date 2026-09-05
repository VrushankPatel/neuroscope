import { GlobalData } from '../data/GlobalData.js';

export class LandingCardsUI {
  constructor(containerElement, eventBus) {
    this.container = containerElement;
    this.eventBus = eventBus;
    this.overlay = document.getElementById('landing-overlay');

    this.render();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = '';
    GlobalData.getScenarios().forEach(scenario => {
      const card = document.createElement('div');
      card.className = 'thought-card';
      card.dataset.scenarioId = scenario.id;
      card.innerHTML = `
        <span class="card-icon">${scenario.icon}</span>
        <span class="card-title">${scenario.title}</span>
      `;

      card.addEventListener('click', () => {
        this.hideOverlay();
        this.eventBus.emit('SCENARIO_SELECTED', { scenarioId: scenario.id });
      });

      this.container.appendChild(card);
    });
  }

  hideOverlay() {
    if (this.overlay) {
      this.overlay.classList.add('hidden-overlay');
    }
  }

  showOverlay() {
    if (this.overlay) {
      this.overlay.classList.remove('hidden-overlay');
    }
  }
}
