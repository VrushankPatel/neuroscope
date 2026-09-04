import * as THREE from 'three';

export class ParticleEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.particleCount = 350;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const scales = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      scales[i] = Math.random() * 0.04 + 0.01;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle texture canvas
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(8, 8, 8, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);

    this.material = new THREE.PointsMaterial({
      color: 0x38BDF8,
      size: 0.12,
      map: texture,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, this.material);
    this.scene.add(this.particles);
  }

  update(time) {
    if (!this.particles) return;
    const positions = this.particles.geometry.attributes.position.array;
    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 3 + 1] += Math.sin(time * 0.5 + i) * 0.001;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  setTheme(theme) {
    if (theme === 'dark') {
      this.material.color.setHex(0x38BDF8);
      this.material.opacity = 0.35;
    } else {
      this.material.color.setHex(0x0284C7);
      this.material.opacity = 0.2;
    }
  }
}
