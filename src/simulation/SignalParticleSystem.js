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

    // Pinpoint delicate luminous signal packet (radius 0.016 instead of 0.09)
    const geometry = new THREE.SphereGeometry(0.018, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 1.0
    });

    this.activeSignalPacket = new THREE.Mesh(geometry, material);

    // Subtle radial glow halo around the traveling pulse
    const haloGeom = new THREE.SphereGeometry(0.04, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const haloMesh = new THREE.Mesh(haloGeom, haloMat);
    this.activeSignalPacket.add(haloMesh);

    this.signalGroup.add(this.activeSignalPacket);
    this.signalGroup.visible = false;
  }

  updateProgress(progressRatio) {
    if (!this.activeSignalPacket || !this.curve) return;

    this.signalGroup.visible = true;
    const clampedProgress = Math.max(0, Math.min(1, progressRatio));
    const point = this.curve.getPointAt(clampedProgress);
    this.activeSignalPacket.position.copy(point);
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
