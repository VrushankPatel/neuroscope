import * as THREE from 'three';

export class CardiacFlowSystem {
  constructor(scene) {
    this.scene = scene;
    this.flowGroup = new THREE.Group();
    this.flowGroup.name = "CardiacFlowGroup";
    this.flowGroup.visible = false;
    this.scene.add(this.flowGroup);

    this.particleStreams = [];
    this.heartRateBpm = 72; // Standard physiological resting heart rate
    this.initFlowCircuits();
  }

  initFlowCircuits() {
    this.flowColor = 0xF1F5F9; // Monochromatic luminous flow

    // Start points from the heart
    const aortaArch = new THREE.Vector3(0, 1.7, 0); // Arch of aorta
    const descendingAorta = new THREE.Vector3(0, -1.0, -0.5);
    const pulmonaryTrunk = new THREE.Vector3(0, 1.2, 0.2); // For future lungs

    // 1. Head & Neck (Carotids)
    // Distance from aorta (1.7) to top of head (12.25) is about 10.5
    this.buildVascularBranch(aortaArch, new THREE.Vector3(0, 1, 0), 4.5, 0, 4, 0.06);

    // 2. Left Arm (Subclavian)
    // Arms extend down to around y=-20
    this.buildVascularBranch(aortaArch, new THREE.Vector3(-1, 0.2, 0).normalize(), 9.0, 0, 4, 0.05);

    // 3. Right Arm
    this.buildVascularBranch(aortaArch, new THREE.Vector3(1, 0.2, 0).normalize(), 9.0, 0, 4, 0.05);

    // 4. Lower Body (Descending Aorta -> Iliac -> Femoral -> Legs)
    // First segment goes straight down to pelvis (world y=-20.3)
    const descendingCurve = new THREE.CatmullRomCurve3([
      aortaArch,
      descendingAorta,
      new THREE.Vector3(0, -10.0, -0.2), // Abdominal
      new THREE.Vector3(0, -18.0, 0) // Bifurcation at pelvis
    ]);
    this.createStream(descendingCurve, 100, this.flowColor, 0.08, 0.7);

    // Left Leg (from -18 down to -46.5) -> distance is 28.5
    this.buildVascularBranch(new THREE.Vector3(0, -18.0, 0), new THREE.Vector3(-0.25, -1, 0).normalize(), 12.0, 0, 4, 0.06);

    // Right Leg
    this.buildVascularBranch(new THREE.Vector3(0, -18.0, 0), new THREE.Vector3(0.25, -1, 0).normalize(), 12.0, 0, 4, 0.06);

    // 5. Pulmonary branches (Future lungs)
    this.buildVascularBranch(pulmonaryTrunk, new THREE.Vector3(-1, -0.2, 0.5).normalize(), 3.0, 0, 3, 0.05); // Left lung
    this.buildVascularBranch(pulmonaryTrunk, new THREE.Vector3(1, -0.2, 0.5).normalize(), 3.0, 0, 3, 0.05); // Right lung
    
    // 6. Coronary Perfusion (Heart itself)
    this.buildVascularBranch(new THREE.Vector3(0, 0.5, 0.2), new THREE.Vector3(0, -1, 0.5).normalize(), 1.5, 0, 3, 0.04);
  }

  buildVascularBranch(startPos, dir, length, depth, maxDepth, particleSize) {
    if (depth > maxDepth) return;

    const endPos = startPos.clone().add(dir.clone().multiplyScalar(length));
    
    // Add organic curvature
    const midPos = startPos.clone().lerp(endPos, 0.5);
    midPos.x += (Math.random() - 0.5) * length * 0.15;
    midPos.z += (Math.random() - 0.5) * length * 0.15;

    const curve = new THREE.CatmullRomCurve3([startPos, midPos, endPos]);
    const particleCount = Math.max(8, Math.floor(length * 5));
    
    // Speed slows down as vessels get smaller
    const speed = Math.max(0.2, 0.8 - depth * 0.15);
    this.createStream(curve, particleCount, this.flowColor, particleSize, speed);

    // Branching logic
    const nextLength = length * (0.55 + Math.random() * 0.2);
    const nextSize = particleSize * 0.8;
    const spread = 0.4 + (depth * 0.1); // Spread increases at smaller branches

    // Always create at least one branch
    const dir1 = dir.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), spread).normalize();
    dir1.applyAxisAngle(new THREE.Vector3(0, 1, 0), (Math.random() - 0.5));
    this.buildVascularBranch(endPos, dir1, nextLength, depth + 1, maxDepth, nextSize);

    // Second branch
    if (Math.random() > 0.1 || depth === 0) {
      const dir2 = dir.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), -spread).normalize();
      dir2.applyAxisAngle(new THREE.Vector3(0, 1, 0), (Math.random() - 0.5));
      this.buildVascularBranch(endPos, dir2, nextLength, depth + 1, maxDepth, nextSize);
    }
    
    // Third branch (capillary beds)
    if (depth >= maxDepth - 1 && Math.random() > 0.5) {
      const dir3 = dir.clone().applyAxisAngle(new THREE.Vector3(1, 0, 0), (Math.random() - 0.5)).normalize();
      this.buildVascularBranch(endPos, dir3, nextLength * 0.8, depth + 1, maxDepth, nextSize * 0.8);
    }
  }

  createStream(curve, count, colorHex, particleSize, baseSpeed) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const progress = new Float32Array(count);
    const speeds = new Float32Array(count);

    const baseColor = new THREE.Color(colorHex);

    for (let i = 0; i < count; i++) {
      progress[i] = i / count;
      speeds[i] = baseSpeed * (0.85 + Math.random() * 0.3);

      const pt = curve.getPointAt(progress[i]);
      positions[i * 3] = pt.x;
      positions[i * 3 + 1] = pt.y;
      positions[i * 3 + 2] = pt.z;

      colors[i * 3] = baseColor.r;
      colors[i * 3 + 1] = baseColor.g;
      colors[i * 3 + 2] = baseColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Glowing corpuscular disc texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.85)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);

    // Enhance luminous appearance
    const material = new THREE.PointsMaterial({
      size: particleSize * 2.0, // Make slightly larger and softer
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0.6, // Soft transparency
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    this.flowGroup.add(points);

    this.particleStreams.push({
      points,
      curve,
      count,
      progress,
      speeds,
      geometry
    });
  }

  update(delta, time) {
    if (!this.flowGroup.visible) return;

    // Simulate cardiac cycle pulsation (Systole = rapid acceleration, Diastole = steady filling)
    // Beat cycle ~0.85s (approx 70 bpm)
    const beatFrequency = (this.heartRateBpm / 60) * Math.PI * 2;
    const cardiacPhase = (Math.sin(time * beatFrequency) + 1.0) / 2.0;
    // Systolic ejection surge
    const pulseFactor = 0.75 + Math.pow(cardiacPhase, 4) * 1.5;

    for (const stream of this.particleStreams) {
      const posAttr = stream.geometry.attributes.position;
      const positions = posAttr.array;

      for (let i = 0; i < stream.count; i++) {
        stream.progress[i] += stream.speeds[i] * delta * 0.45 * pulseFactor;
        if (stream.progress[i] > 1.0) {
          stream.progress[i] -= 1.0;
        }

        const pt = stream.curve.getPointAt(stream.progress[i]);
        positions[i * 3] = pt.x;
        positions[i * 3 + 1] = pt.y;
        positions[i * 3 + 2] = pt.z;
      }

      posAttr.needsUpdate = true;
    }
  }

  show() {
    this.flowGroup.visible = true;
  }

  hide() {
    this.flowGroup.visible = false;
  }

  toggle() {
    this.flowGroup.visible = !this.flowGroup.visible;
    return this.flowGroup.visible;
  }

  clear() {
    while (this.flowGroup.children.length > 0) {
      const child = this.flowGroup.children[0];
      this.flowGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }
    this.particleStreams = [];
  }
}
