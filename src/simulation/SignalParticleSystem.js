import * as THREE from 'three';

export class SignalParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.signalGroup = new THREE.Group();
    this.signalGroup.name = "SignalParticleGroup";
    this.scene.add(this.signalGroup);

    this.activeSignalPacket = null;
    this.curve = null;
    this.color = 0x00E5FF;
  }

  setPathway(curve, colorHex = "#00E5FF") {
    this.clear();
    this.curve = curve;
    this.color = new THREE.Color(colorHex);

    // 1. Core Luminous Signal Packet
    const geometry = new THREE.SphereGeometry(0.024, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 1.0
    });

    this.activeSignalPacket = new THREE.Mesh(geometry, material);

    // 2. Inner Radiant Halo (Additive Blending)
    const innerHaloGeom = new THREE.SphereGeometry(0.052, 16, 16);
    const innerHaloMat = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const innerHaloMesh = new THREE.Mesh(innerHaloGeom, innerHaloMat);
    this.activeSignalPacket.add(innerHaloMesh);

    // 3. Outer Soft Energy Aura
    const outerAuraGeom = new THREE.SphereGeometry(0.098, 16, 16);
    const outerAuraMat = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const outerAuraMesh = new THREE.Mesh(outerAuraGeom, outerAuraMat);
    this.activeSignalPacket.add(outerAuraMesh);

    this.signalGroup.add(this.activeSignalPacket);

    // 4. Trailing Energy Tail Particles
    this.tailParticles = [];
    const tailCount = 6;
    for (let i = 0; i < tailCount; i++) {
      const scaleFactor = 1.0 - (i + 1) / (tailCount + 1);
      const tailGeom = new THREE.SphereGeometry(0.038 * scaleFactor, 12, 12);
      const tailMat = new THREE.MeshBasicMaterial({
        color: this.color,
        transparent: true,
        opacity: 0.65 * scaleFactor,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const tailMesh = new THREE.Mesh(tailGeom, tailMat);
      this.signalGroup.add(tailMesh);
      this.tailParticles.push({ mesh: tailMesh, offset: (i + 1) * 0.022 });
    }

    this.signalGroup.visible = false;
  }

  updateProgress(progressRatio) {
    if (!this.activeSignalPacket || !this.curve) return;

    this.signalGroup.visible = true;
    const clampedProgress = Math.max(0, Math.min(1, progressRatio));
    const point = this.curve.getPointAt(clampedProgress);
    this.activeSignalPacket.position.copy(point);

    // Position trailing energy tail particles behind the leading signal packet
    if (this.tailParticles) {
      this.tailParticles.forEach(({ mesh, offset }) => {
        const tailProgress = Math.max(0, clampedProgress - offset);
        const tailPt = this.curve.getPointAt(tailProgress);
        mesh.position.copy(tailPt);
      });
    }
  }

  clear() {
    while (this.signalGroup.children.length > 0) {
      const child = this.signalGroup.children[0];
      this.signalGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }
    this.activeSignalPacket = null;
    this.curve = null;
    this.signalGroup.visible = false;
  }
}
