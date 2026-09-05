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
    // 1. Pulmonary Deoxygenated Circuit (Vena Cava -> RA -> RV -> Pulmonary Trunk -> L/R PA)
    const pulmonaryCircuitSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.95, 1.85, -0.05),  // Superior Vena Cava input
      new THREE.Vector3(0.95, 1.15, 0.05),   // Entering Right Atrium
      new THREE.Vector3(0.75, 0.65, 0.25),   // Right Atrial chamber swirl
      new THREE.Vector3(0.35, 0.25, 0.25),   // Passing Tricuspid Valve
      new THREE.Vector3(0.55, -0.20, 0.35),  // Right Ventricular cavity
      new THREE.Vector3(0.38, -0.45, 0.28),  // RV lower body
      new THREE.Vector3(0.25, 0.15, 0.38),   // Conus arteriosus / Infundibulum
      new THREE.Vector3(0.18, 0.65, 0.35),   // Pulmonary Valve
      new THREE.Vector3(0.05, 1.15, 0.25),   // Pulmonary Trunk
      new THREE.Vector3(-0.15, 1.35, 0.05),  // Pulmonary Bifurcation
      new THREE.Vector3(-0.95, 1.25, -0.30)  // Left Pulmonary Artery to lungs
    ]);

    const rightPulmonaryBranchSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 1.35, 0.05),  // Bifurcation
      new THREE.Vector3(0.35, 1.25, -0.15),
      new THREE.Vector3(0.85, 1.15, -0.25)   // Right Pulmonary Artery to lungs
    ]);

    // 2. Systemic Oxygenated Circuit (Pulmonary Veins -> LA -> LV -> Aorta -> Arch -> Branches)
    const systemicCircuitSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.90, 0.95, -0.55), // Pulmonary Vein inlet
      new THREE.Vector3(-0.45, 0.75, -0.45), // Left Atrial cavity
      new THREE.Vector3(-0.25, 0.35, -0.15), // Passing Mitral Valve
      new THREE.Vector3(-0.35, -0.25, 0.05), // Left Ventricular inflow
      new THREE.Vector3(-0.25, -0.65, 0.10), // Apex vortex (thick muscular myocardium)
      new THREE.Vector3(-0.10, -0.15, 0.12), // Outflow tract (subaortic)
      new THREE.Vector3(0.00, 0.55, 0.15),   // Aortic Valve
      new THREE.Vector3(0.05, 1.25, 0.15),   // Ascending Aorta
      new THREE.Vector3(-0.15, 1.75, 0.05),  // Arch apex
      new THREE.Vector3(-0.65, 1.65, -0.35), // Distal aortic arch
      new THREE.Vector3(-0.75, 0.65, -0.55), // Descending thoracic aorta
      new THREE.Vector3(-0.75, -0.55, -0.55) // Systemic arterial output
    ]);

    // Systemic Carotid / Brachiocephalic Arch Branch
    const carotidBranchSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 1.75, 0.05),  // Arch takeoff
      new THREE.Vector3(-0.12, 2.25, 0.05)   // Cranial blood flow
    ]);

    // 3. Coronary Myocardial Perfusion Stream
    const coronarySpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, 0.75, 0.20),   // Right coronary ostium
      new THREE.Vector3(0.45, 0.25, 0.35),   // Anterior AV groove
      new THREE.Vector3(0.15, -0.25, 0.40),  // Left Anterior Descending (LAD) sulcus
      new THREE.Vector3(-0.18, -0.60, 0.22)  // Apex perfusion
    ]);

    this.createStream(pulmonaryCircuitSpline, 65, 0x38BDF8, 0.055, 0.85); // Deoxygenated blue
    this.createStream(rightPulmonaryBranchSpline, 25, 0x38BDF8, 0.050, 0.80);
    this.createStream(systemicCircuitSpline, 85, 0xF43F5E, 0.060, 0.95);  // Oxygenated crimson/coral
    this.createStream(carotidBranchSpline, 25, 0xFB923C, 0.050, 0.90);   // Cranial warm amber
    this.createStream(coronarySpline, 40, 0xE11D48, 0.045, 0.80);        // Coronary perfusion
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

    const material = new THREE.PointsMaterial({
      size: particleSize,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0.9,
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
