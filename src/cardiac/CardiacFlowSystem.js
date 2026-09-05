import * as THREE from 'three';

export class CardiacFlowSystem {
  constructor(scene) {
    this.scene = scene;
    this.flowGroup = new THREE.Group();
    this.flowGroup.name = "CardiacFlowGroup";
    this.flowGroup.visible = false;
    this.scene.add(this.flowGroup);

    this.particleStreams = [];
    this.heartRateBpm = 72;

    // Shared glow texture
    this.glowTexture = this.createGlowTexture();

    this.initFlowCircuits();
  }

  // Body-space (y: 0=feet, 168=head) → world-space transform for heart mode
  // bodyWrapper: scale=0.35, position=(0, -133*0.35, 1.2*0.35)
  bw(bx, by, bz) {
    return new THREE.Vector3(bx * 0.35, by * 0.35 - 46.55, bz * 0.35 + 0.42);
  }

  createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    g.addColorStop(0, 'rgba(255,255,255,1.0)');
    g.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    g.addColorStop(0.65, 'rgba(255,255,255,0.25)');
    g.addColorStop(1, 'rgba(255,255,255,0.0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  initFlowCircuits() {
    // ================================================================
    // ARTERIAL OUTFLOW: Heart → Systemic Arteries → Periphery
    // Each path follows actual vessel topology from the vascular network
    // ================================================================

    // --- Heart → Ascending Aorta → Arch → R. Carotid → Head ---
    this.addArterialStream([
      [-1,133,2], [-2,146,2], [-1,148.5,1], [2,149,1],
      [3,153,1.5], [3.5,157,2], [3.5,161,2], [3,165,2.5], [4,169,2], [5,173,1.5]
    ], 40, 0.06, 0.65);

    // --- Heart → Aorta → Arch → L. Carotid → Head ---
    this.addArterialStream([
      [-1,133,2], [-2,146,2], [-1,148.5,1], [-2,149.5,0.5],
      [-3,153,1], [-3.5,157,1.5], [-3.5,161,2], [-3,165,2], [-4,169,2], [-5,173,1.5]
    ], 40, 0.06, 0.65);

    // --- Heart → Aorta → R. Subclavian → R. Brachial → R. Hand ---
    this.addArterialStream([
      [-1,133,2], [-2,146,2], [-1,148.5,1], [3,149,1],
      [7,148,0.5], [12,147,0], [20,145,0], [22,130,0], [23,100,0], [24.5,87,0.5], [25,82,0]
    ], 45, 0.05, 0.6);

    // --- Heart → Aorta → L. Subclavian → L. Brachial → L. Hand ---
    this.addArterialStream([
      [-1,133,2], [-2,146,2], [-1,148.5,1], [-3,149.5,0.5],
      [-7,148.5,0.5], [-12,147.5,0], [-20,145.5,0], [-22,130,0], [-23,100,0], [-24.5,87,0.5], [-25,82,0]
    ], 45, 0.05, 0.6);

    // --- Heart → Descending Aorta → Abdominal → R. Iliac → R. Femoral → R. Foot ---
    this.addArterialStream([
      [-1,133,2], [-2,146,2], [-2,149,-0.5], [-4,147,-2],
      [-3,138,-3], [-2.5,120,-2.8], [-1.5,100,-2], [-0.5,85,-1], [0,78,0],
      [4,72,0.5], [8,65,0], [8,48,0.5], [8,32,0], [8,15,-1], [7,5,1.5], [7,2,2]
    ], 65, 0.055, 0.55);

    // --- Heart → Descending Aorta → Abdominal → L. Iliac → L. Femoral → L. Foot ---
    this.addArterialStream([
      [-1,133,2], [-2,146,2], [-2,149,-0.5], [-4,147,-2],
      [-3,138,-3], [-2.5,120,-2.8], [-1.5,100,-2], [-0.5,85,-1], [0,78,0],
      [-4,72,0.5], [-8,65,0], [-8,48,0.5], [-8,32,0], [-8,15,-1], [-7,5,1.5], [-7,2,2]
    ], 65, 0.055, 0.55);

    // --- Abdominal branches (renal + mesenteric) ---
    this.addArterialStream([
      [-1.5,100,-2], [1,100,0], [4,100,2], [7,100,3], [10,102,3], [13,103,2]
    ], 25, 0.04, 0.5);
    this.addArterialStream([
      [-1.5,97,-2], [1,96,1], [4,94,3], [5,91,5], [3,88,5]
    ], 20, 0.04, 0.5);

    // --- Coronary perfusion (local heart) ---
    this.addArterialStream([
      [0,134,2.5], [1.5,132,3], [2,130,2.5], [1,128,1.5], [-0.5,127,1]
    ], 15, 0.035, 0.7);
    this.addArterialStream([
      [0,134,2.5], [-1.5,132,3], [-2,130,2.5], [-1,128,1.5], [0.5,127,1]
    ], 15, 0.035, 0.7);

    // ================================================================
    // VENOUS RETURN: Periphery → Veins → Heart
    // ================================================================

    // --- Head → R. Jugular → SVC → Heart ---
    this.addVenousStream([
      [4,165,3], [5,160,2.5], [5,155,2], [5,149,1], [5,143,0.5], [4,138,0], [3.5,133,0]
    ], 30, 0.05, 0.5);

    // --- Head → L. Jugular → SVC → Heart ---
    this.addVenousStream([
      [-4,165,3], [-5,160,2.5], [-5,155,2], [-5,149.5,1], [5,149,1], [5,143,0.5], [4,133,0]
    ], 30, 0.05, 0.5);

    // --- R. Leg → R. Iliac vein → IVC → Heart ---
    this.addVenousStream([
      [8,2,-1], [8,15,-1], [8,32,0], [8,48,0.5], [8,65,0],
      [5,72,0.5], [2,78,1], [2.5,88,0.5], [3,100,-0.5], [3.5,115,-1], [3.5,133,0]
    ], 50, 0.05, 0.5);

    // --- L. Leg → L. Iliac vein → IVC → Heart ---
    this.addVenousStream([
      [-8,2,-1], [-8,15,-1], [-8,32,0], [-8,48,0.5], [-8,65,0],
      [-5,72,0.5], [-2,78,1], [2.5,88,0.5], [3,100,-0.5], [3.5,115,-1], [3.5,133,0]
    ], 50, 0.05, 0.5);

    // --- R. Arm → Subclavian vein → SVC → Heart ---
    this.addVenousStream([
      [24,82,0], [23,100,0], [22,120,0], [20,145,0], [12,147,0], [5,149,1], [5,143,0.5], [4,133,0]
    ], 35, 0.045, 0.5);

    // --- L. Arm → Subclavian vein → SVC → Heart ---
    this.addVenousStream([
      [-24,82,0], [-23,100,0], [-22,120,0], [-20,145.5,0], [-12,147.5,0],
      [-5,149.5,1], [5,149,1], [5,143,0.5], [4,133,0]
    ], 35, 0.045, 0.5);

    // ================================================================
    // PULMONARY CIRCUIT STUBS (extensible for future lungs)
    // ================================================================
    this.addArterialStream([
      [-1,136,3], [3,135,4], [7,133,5], [10,131,4]
    ], 15, 0.04, 0.5);
    this.addArterialStream([
      [-1,136,3], [-4,135,4], [-8,133,5], [-11,131,4]
    ], 15, 0.04, 0.5);
    // Pulmonary venous return
    this.addVenousStream([
      [10,131,4], [7,130,3], [4,130,2], [2,133,1]
    ], 12, 0.04, 0.5);
    this.addVenousStream([
      [-11,131,4], [-7,130,3], [-4,130,2], [-2,133,1]
    ], 12, 0.04, 0.5);
  }

  addArterialStream(bodyPts, count, particleSize, baseSpeed) {
    const worldPts = bodyPts.map(p => this.bw(p[0], p[1], p[2]));
    const curve = new THREE.CatmullRomCurve3(worldPts);
    this.createStream(curve, count, 0xCBD5E1, particleSize, baseSpeed);
  }

  addVenousStream(bodyPts, count, particleSize, baseSpeed) {
    const worldPts = bodyPts.map(p => this.bw(p[0], p[1], p[2]));
    const curve = new THREE.CatmullRomCurve3(worldPts);
    // Venous flow uses a slightly cooler/darker tint
    this.createStream(curve, count, 0x94A3B8, particleSize, baseSpeed);
  }

  createStream(curve, count, colorHex, particleSize, baseSpeed) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const progress = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      progress[i] = i / count;
      speeds[i] = baseSpeed * (0.85 + Math.random() * 0.3);

      const pt = curve.getPointAt(progress[i]);
      positions[i * 3] = pt.x;
      positions[i * 3 + 1] = pt.y;
      positions[i * 3 + 2] = pt.z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(colorHex),
      size: particleSize,
      map: this.glowTexture,
      transparent: true,
      opacity: 0.55,
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
