import { ACTION_POTENTIAL_DATA } from '../data/cellularData.js';

export class ActionPotentialSim {
  constructor(canvasElement, voltageBadgeElement, phaseTextElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.badge = voltageBadgeElement;
    this.phaseText = phaseTextElement;

    this.isFiring = false;
    this.animTime = 0.0;
  }

  triggerActionPotential() {
    if (this.isFiring) return;
    this.isFiring = true;
    this.animTime = 0.0;
    this.animate();
  }

  animate() {
    if (!this.isFiring) return;

    this.animTime += 0.02;
    if (this.animTime > 1.0) {
      this.animTime = 1.0;
      this.isFiring = false;
    }

    // Interpolate current voltage
    const phases = ACTION_POTENTIAL_DATA.phases;
    let currentVoltage = -70;
    let currentPhase = phases[0].phase;

    for (let i = 0; i < phases.length - 1; i++) {
      if (this.animTime >= phases[i].time && this.animTime <= phases[i + 1].time) {
        const factor = (this.animTime - phases[i].time) / (phases[i + 1].time - phases[i].time);
        currentVoltage = phases[i].voltage + (phases[i + 1].voltage - phases[i].voltage) * factor;
        currentPhase = phases[i + 1].phase;
        break;
      }
    }

    this.drawGraph(currentVoltage);
    if (this.badge) this.badge.textContent = `${Math.round(currentVoltage)} mV`;
    if (this.phaseText) this.phaseText.textContent = currentPhase;

    if (this.isFiring) {
      requestAnimationFrame(this.animate.bind(this));
    }
  }

  drawGraph(currentVoltage) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, w, h);

    // Draw Grid Lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;

    // Zero / Resting Lines
    const yResting = h - (( -70 + 90) / 140) * h;
    const yThreshold = h - (( -55 + 90) / 140) * h;
    const yPeak = h - (( 40 + 90) / 140) * h;

    this.ctx.beginPath();
    this.ctx.moveTo(0, yResting);
    this.ctx.lineTo(w, yResting);
    this.ctx.stroke();

    // Threshold Dashed Line
    this.ctx.setLineDash([4, 4]);
    this.ctx.beginPath();
    this.ctx.moveTo(0, yThreshold);
    this.ctx.lineTo(w, yThreshold);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Draw Voltage Curve
    this.ctx.strokeStyle = '#00E5FF';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();

    const phases = ACTION_POTENTIAL_DATA.phases;
    for (let i = 0; i < phases.length; i++) {
      const x = (phases[i].time) * w;
      const y = h - ((phases[i].voltage + 90) / 140) * h;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();

    // Draw Current Animated Point
    const currentX = this.animTime * w;
    const currentY = h - ((currentVoltage + 90) / 140) * h;

    this.ctx.fillStyle = '#FFF';
    this.ctx.beginPath();
    this.ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
