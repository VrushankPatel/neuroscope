import { GlobalData } from '../data/GlobalData.js';

export class TooltipUI {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.tooltipEl = document.getElementById('anatomy-tooltip');
    this.nameEl = document.getElementById('tooltip-name');
    this.badgeEl = document.getElementById('tooltip-badge');
    this.descEl = document.getElementById('tooltip-desc');
    this.hintEl = document.getElementById('tooltip-hint');

    this.currentStructureId = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.visible = false;

    window.addEventListener('pointermove', this.onMouseMove.bind(this));

    this.eventBus.on('STRUCTURE_HOVERED', ({ structureId }) => {
      this.show(structureId);
    });

    this.eventBus.on('STRUCTURE_UNHOVERED', () => {
      this.hide();
    });

    this.animate();
  }

  onMouseMove(e) {
    this.targetX = e.clientX + 16;
    this.targetY = e.clientY + 16;

    // Boundary check so tooltip stays on screen
    if (this.tooltipEl) {
      const w = this.tooltipEl.offsetWidth || 220;
      const h = this.tooltipEl.offsetHeight || 90;
      if (this.targetX + w > window.innerWidth - 10) {
        this.targetX = e.clientX - w - 16;
      }
      if (this.targetY + h > window.innerHeight - 10) {
        this.targetY = e.clientY - h - 16;
      }
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    if (!this.visible || !this.tooltipEl) return;

    // Smooth lerp following mouse
    this.mouseX += (this.targetX - this.mouseX) * 0.25;
    this.mouseY += (this.targetY - this.mouseY) * 0.25;

    this.tooltipEl.style.transform = `translate3d(${Math.round(this.mouseX)}px, ${Math.round(this.mouseY)}px, 0)`;
  }

  show(structureId) {
    const data = GlobalData.getAnatomy()[structureId];
    if (!data || !this.tooltipEl) return;

    this.currentStructureId = structureId;
    this.visible = true;

    if (this.nameEl) this.nameEl.textContent = data.name;
    if (this.badgeEl) {
      this.badgeEl.textContent = data.category.replace('_', ' ').toUpperCase();
      this.badgeEl.style.color = data.color || '#00E5FF';
      this.badgeEl.style.borderColor = data.color || '#00E5FF';
    }
    if (this.descEl) {
      // 1-line concise summary
      this.descEl.textContent = data.function;
    }

    this.tooltipEl.classList.remove('hidden');
  }

  hide() {
    this.visible = false;
    this.currentStructureId = null;
    if (this.tooltipEl) {
      this.tooltipEl.classList.add('hidden');
    }
  }
}
