export class OrganSelectorUI {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.container = document.getElementById('organ-selector');
    this.currentOrgan = localStorage.getItem('neuroscope_selected_organ') || 'brain';

    if (this.container) {
      this.initTiles();
    }
  }

  initTiles() {
    const organs = [
      { id: 'brain', name: 'Brain', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>' },
      { id: 'heart', name: 'Heart', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>' }
    ];

    organs.forEach(organ => {
      const tile = document.createElement('div');
      tile.className = `organ-tile ${organ.id === this.currentOrgan ? 'active' : ''}`;
      tile.dataset.organ = organ.id;
      
      tile.innerHTML = `
        <div class="organ-icon">${organ.icon}</div>
        <div class="organ-name">${organ.name}</div>
      `;

      tile.addEventListener('click', () => {
        if (this.currentOrgan === organ.id) return;
        
        // Persist selection
        localStorage.setItem('neuroscope_selected_organ', organ.id);

        // Update active class
        const allTiles = this.container.querySelectorAll('.organ-tile');
        allTiles.forEach(t => t.classList.remove('active'));
        tile.classList.add('active');

        this.currentOrgan = organ.id;
        this.eventBus.emit('ORGAN_CHANGED', { organ: organ.id });
      });

      this.container.appendChild(tile);
    });
  }

  setOrgan(organId) {
    this.currentOrgan = organId;
    localStorage.setItem('neuroscope_selected_organ', organId);
    if (this.container) {
      const allTiles = this.container.querySelectorAll('.organ-tile');
      allTiles.forEach(t => {
        t.classList.toggle('active', t.dataset.organ === organId);
      });
    }
  }
}
