import { GlobalData } from '../data/GlobalData.js';

export class SearchModalUI {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.modal = document.getElementById('search-modal');
    this.input = document.getElementById('search-input');
    this.resultsContainer = document.getElementById('search-results');
    this.closeBtn = document.getElementById('close-search-btn');

    this.initKeyboardShortcuts();
    this.initSearchInput();
  }

  initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.open();
      } else if (e.key === 'Escape' && !this.modal?.classList.contains('hidden')) {
        this.close();
      }
    });

    const searchTriggers = document.querySelectorAll('.search-trigger');
    searchTriggers.forEach(btn => btn.addEventListener('click', () => this.open()));

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
  }

  initSearchInput() {
    if (!this.input) return;

    this.input.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      this.renderResults(query);
    });
  }

  renderResults(query) {
    if (!this.resultsContainer) return;
    this.resultsContainer.innerHTML = '';

    if (!query) return;

    // Search Structures
    for (const [id, struct] of Object.entries(GlobalData.getAnatomy())) {
      if (struct.name.toLowerCase().includes(query) || struct.function.toLowerCase().includes(query) || struct.location.toLowerCase().includes(query)) {
        const item = document.createElement('div');
        item.className = 'search-item';
        item.innerHTML = `
          <div>
            <div class="search-item-title">${struct.name}</div>
            <div class="search-item-cat">${struct.category.replace('_', ' ')} • ${struct.system}</div>
          </div>
        `;
        item.addEventListener('click', () => {
          this.close();
          this.eventBus.emit('STRUCTURE_SELECTED', { structureId: id });
        });
        this.resultsContainer.appendChild(item);
      }
    }

    // Search Pathways
    for (const [id, path] of Object.entries(GlobalData.getPathways())) {
      if (path.name.toLowerCase().includes(query) || path.description.toLowerCase().includes(query)) {
        const item = document.createElement('div');
        item.className = 'search-item';
        item.innerHTML = `
          <div>
            <div class="search-item-title">${path.name}</div>
            <div class="search-item-cat">Neural Pathway</div>
          </div>
        `;
        item.addEventListener('click', () => {
          this.close();
          this.eventBus.emit('PATHWAY_SELECTED', { pathwayId: id });
        });
        this.resultsContainer.appendChild(item);
      }
    }
  }

  open() {
    if (this.modal) this.modal.classList.remove('hidden');
    if (this.input) {
      this.input.value = '';
      this.input.focus();
    }
    this.renderResults('');
  }

  close() {
    if (this.modal) this.modal.classList.add('hidden');
  }
}
