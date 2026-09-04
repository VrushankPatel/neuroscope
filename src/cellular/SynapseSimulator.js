import { NEUROTRANSMITTERS } from '../data/cellularData.js';

export class SynapseSimulator {
  constructor(selectorElement, descriptionElement) {
    this.selector = selectorElement;
    this.desc = descriptionElement;

    if (this.selector) {
      this.selector.addEventListener('change', (e) => {
        this.updateNeurotransmitter(e.target.value);
      });
    }
  }

  updateNeurotransmitter(key) {
    const nt = NEUROTRANSMITTERS[key];
    if (!nt || !this.desc) return;

    this.desc.innerHTML = `
      <strong>${nt.name} (${nt.type})</strong><br/>
      ${nt.description}<br/>
      <small style="color: var(--text-muted); margin-top: 4px; display: block;">Clinical Note: ${nt.clinical}</small>
    `;
  }
}
