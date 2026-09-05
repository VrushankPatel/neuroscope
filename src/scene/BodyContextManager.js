import * as THREE from 'three';

export class BodyContextManager {
  constructor(scene, eventBus) {
    this.scene = scene;
    this.eventBus = eventBus;

    this.bodyGroup = new THREE.Group();
    this.bodyGroup.name = "BodyContextGroup";
    this.bodyGroup.visible = false;
    this.scene.add(this.bodyGroup);

    // Inner wrapper for organ-specific translation/alignment
    this.bodyWrapper = new THREE.Group();
    this.bodyWrapper.name = "BodyAlignmentWrapper";
    this.bodyGroup.add(this.bodyWrapper);

    this.currentOrgan = 'brain';
    this.visibilityMode = 'auto'; // 'auto' | 'show' | 'hide'
    this.currentOpacity = 0.0;
    this.maxBodyOpacity = 0.16; // Highly translucent, restrained ghost-like silhouette

    this.targetPosition = new THREE.Vector3(0, 0, 0);

    this.initMaterials();
    this.loadBodyMesh();
    this.initOrganConduits();
    this.setOrgan('brain');
  }

  initMaterials() {
    // 1. Highly Translucent Ghost Body Silhouette
    this.ghostMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#475569"), // Slate-600
      roughness: 0.6,
      metalness: 0.1,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // 2. Subtle Medical Wireframe Silhouette
    this.wireframeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#38BDF8"),
      wireframe: true,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });

    // 3. Nervous System Signal Conduits (Brain Mode)
    this.nervousMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#00E5FF"),
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });

    // 4. Cardiovascular Conduit Vessels (Heart Mode)
    this.vascularMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#F43F5E"),
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
  }

  loadBodyMesh() {
    // Load high-resolution anatomical silhouette from binary vertex attributes
    Promise.all([
      fetch('/human_body_pos.bin').then(r => r.arrayBuffer()),
      fetch('/human_body_norm.bin').then(r => r.arrayBuffer())
    ]).then(([posBuf, normBuf]) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(posBuf), 3));
      if (normBuf && normBuf.byteLength > 0) {
        geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normBuf), 3));
      } else {
        geometry.computeVertexNormals();
      }

      this.bodyMesh = new THREE.Mesh(geometry, this.ghostMaterial);
      this.bodyMesh.name = "HumanBodyGhostMesh";
      this.bodyWrapper.add(this.bodyMesh);

      this.wireframeMesh = new THREE.Mesh(geometry, this.wireframeMaterial);
      this.wireframeMesh.name = "HumanBodyWireframeMesh";
      this.bodyWrapper.add(this.wireframeMesh);
    }).catch(err => {
      console.warn("Binary body buffer load failed. Generating procedural anatomical body silhouette.", err);
      this.buildProceduralBodySilhouette();
    });
  }

  buildProceduralBodySilhouette() {
    // Elegant procedural anatomical body silhouette fallback
    const group = new THREE.Group();

    // Torso / Thorax
    const torsoGeo = new THREE.CylinderGeometry(20, 16, 65, 32, 16);
    const torso = new THREE.Mesh(torsoGeo, this.ghostMaterial);
    torso.position.set(0, 115, 0);
    group.add(torso);

    // Head / Cranium
    const headGeo = new THREE.SphereGeometry(10, 32, 24);
    const head = new THREE.Mesh(headGeo, this.ghostMaterial);
    head.position.set(0, 168, 1.5);
    group.add(head);

    // Pelvis
    const pelvisGeo = new THREE.CylinderGeometry(16, 14, 25, 32);
    const pelvis = new THREE.Mesh(pelvisGeo, this.ghostMaterial);
    pelvis.position.set(0, 75, 0);
    group.add(pelvis);

    // Legs
    const legGeo = new THREE.CylinderGeometry(6, 4, 75, 24);
    const leftLeg = new THREE.Mesh(legGeo, this.ghostMaterial);
    leftLeg.position.set(-8, 38, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, this.ghostMaterial);
    rightLeg.position.set(8, 38, 0);
    group.add(rightLeg);

    // Arms
    const armGeo = new THREE.CylinderGeometry(4.5, 3.5, 68, 20);
    const leftArm = new THREE.Mesh(armGeo, this.ghostMaterial);
    leftArm.position.set(-22, 115, 0);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, this.ghostMaterial);
    rightArm.position.set(22, 115, 0);
    group.add(rightArm);

    this.bodyMesh = group;
    this.bodyWrapper.add(group);
  }

  initOrganConduits() {
    // =========================================================================
    // 1. Brain Mode: Peripheral Nervous System (PNS) & Spinal Cord
    // =========================================================================
    this.nervousGroup = new THREE.Group();
    this.nervousGroup.name = "PeripheralNervousConduits";
    this.bodyWrapper.add(this.nervousGroup);

    // Spinal Cord running from brainstem down through vertebral canal
    const spinalCordCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 162, 0),     // Foramen magnum
      new THREE.Vector3(0, 148, -2.5),  // Cervical spine
      new THREE.Vector3(0, 125, -3.2),  // Thoracic spine
      new THREE.Vector3(0, 95, -2.0),   // Lumbar spine
      new THREE.Vector3(0, 78, 0.5)     // Conus medullaris / Cauda equina
    ]);
    this.nervousGroup.add(new THREE.Mesh(new THREE.TubeGeometry(spinalCordCurve, 40, 1.2, 10, false), this.nervousMaterial));

    // Left & Right Brachial Plexuses branching into arms
    const leftBrachialCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 145, -2.5),
      new THREE.Vector3(-12, 140, -1.0),
      new THREE.Vector3(-22, 130, 0),
      new THREE.Vector3(-25, 100, 0),
      new THREE.Vector3(-26, 75, 0)
    ]);
    this.nervousGroup.add(new THREE.Mesh(new THREE.TubeGeometry(leftBrachialCurve, 30, 0.7, 8, false), this.nervousMaterial));

    const rightBrachialCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 145, -2.5),
      new THREE.Vector3(12, 140, -1.0),
      new THREE.Vector3(22, 130, 0),
      new THREE.Vector3(25, 100, 0),
      new THREE.Vector3(26, 75, 0)
    ]);
    this.nervousGroup.add(new THREE.Mesh(new THREE.TubeGeometry(rightBrachialCurve, 30, 0.7, 8, false), this.nervousMaterial));

    // Lumbosacral Plexus branching into legs (Sciatic and Femoral nerves)
    const leftSciaticCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 80, 0),
      new THREE.Vector3(-6, 70, -1.5),
      new THREE.Vector3(-8, 50, -2.0),
      new THREE.Vector3(-8, 20, -1.0),
      new THREE.Vector3(-8, 2, 0)
    ]);
    this.nervousGroup.add(new THREE.Mesh(new THREE.TubeGeometry(leftSciaticCurve, 35, 0.75, 8, false), this.nervousMaterial));

    const rightSciaticCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 80, 0),
      new THREE.Vector3(6, 70, -1.5),
      new THREE.Vector3(8, 50, -2.0),
      new THREE.Vector3(8, 20, -1.0),
      new THREE.Vector3(8, 2, 0)
    ]);
    this.nervousGroup.add(new THREE.Mesh(new THREE.TubeGeometry(rightSciaticCurve, 35, 0.75, 8, false), this.nervousMaterial));

    // =========================================================================
    // 2. Heart Mode: Systemic Cardiovascular Conduits (Arteries & Veins)
    // =========================================================================
    this.vascularGroup = new THREE.Group();
    this.vascularGroup.name = "SystemicVascularConduits";
    this.bodyWrapper.add(this.vascularGroup);

    // Carotid & Vertebral arteries to head
    const leftCarotid = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2, 138, 0),
      new THREE.Vector3(-3.5, 150, 1.0),
      new THREE.Vector3(-3.0, 165, 2.0)
    ]);
    this.vascularGroup.add(new THREE.Mesh(new THREE.TubeGeometry(leftCarotid, 20, 0.8, 8, false), this.vascularMaterial));

    const rightCarotid = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2, 138, 0),
      new THREE.Vector3(3.5, 150, 1.0),
      new THREE.Vector3(3.0, 165, 2.0)
    ]);
    this.vascularGroup.add(new THREE.Mesh(new THREE.TubeGeometry(rightCarotid, 20, 0.8, 8, false), this.vascularMaterial));

    // Subclavian and Brachial vessels into arms
    const leftBrachialVessel = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3, 136, 0),
      new THREE.Vector3(-14, 138, 0),
      new THREE.Vector3(-22, 128, 0),
      new THREE.Vector3(-24, 98, 0),
      new THREE.Vector3(-25, 72, 0)
    ]);
    this.vascularGroup.add(new THREE.Mesh(new THREE.TubeGeometry(leftBrachialVessel, 25, 0.8, 8, false), this.vascularMaterial));

    const rightBrachialVessel = new THREE.CatmullRomCurve3([
      new THREE.Vector3(3, 136, 0),
      new THREE.Vector3(14, 138, 0),
      new THREE.Vector3(22, 128, 0),
      new THREE.Vector3(24, 98, 0),
      new THREE.Vector3(25, 72, 0)
    ]);
    this.vascularGroup.add(new THREE.Mesh(new THREE.TubeGeometry(rightBrachialVessel, 25, 0.8, 8, false), this.vascularMaterial));

    // Descending Thoracic and Abdominal Aorta
    const descendingAorta = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.5, 132, -2.0),
      new THREE.Vector3(-1.0, 115, -1.8),
      new THREE.Vector3(-0.5, 95, -1.2),
      new THREE.Vector3(0, 80, 0)        // Aortic bifurcation
    ]);
    this.vascularGroup.add(new THREE.Mesh(new THREE.TubeGeometry(descendingAorta, 25, 1.1, 8, false), this.vascularMaterial));

    // Common Iliac & Femoral arteries down legs
    const leftFemoral = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 80, 0),
      new THREE.Vector3(-5, 72, 0.5),
      new THREE.Vector3(-7, 52, 0.8),
      new THREE.Vector3(-7, 22, 0.5),
      new THREE.Vector3(-7, 2, 0.2)
    ]);
    this.vascularGroup.add(new THREE.Mesh(new THREE.TubeGeometry(leftFemoral, 30, 0.85, 8, false), this.vascularMaterial));

    const rightFemoral = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 80, 0),
      new THREE.Vector3(5, 72, 0.5),
      new THREE.Vector3(7, 52, 0.8),
      new THREE.Vector3(7, 22, 0.5),
      new THREE.Vector3(7, 2, 0.2)
    ]);
    this.vascularGroup.add(new THREE.Mesh(new THREE.TubeGeometry(rightFemoral, 30, 0.85, 8, false), this.vascularMaterial));

    // Animated Neural / Vascular Signal Particles
    this.initConduitParticles(spinalCordCurve, leftSciaticCurve, rightSciaticCurve, descendingAorta, leftFemoral, rightFemoral);
  }

  initConduitParticles(scCurve, lsCurve, rsCurve, daCurve, lfCurve, rfCurve) {
    this.conduitParticles = [];
    const createStream = (curve, count, colorHex, parentGroup) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const progress = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        progress[i] = i / count;
        const pt = curve.getPointAt(progress[i]);
        pos[i * 3] = pt.x;
        pos[i * 3 + 1] = pt.y;
        pos[i * 3 + 2] = pt.z;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color: new THREE.Color(colorHex),
        size: 1.6,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const points = new THREE.Points(geo, mat);
      parentGroup.add(points);
      this.conduitParticles.push({ points, curve, progress, count, geo, mat });
    };

    // Neural pulses down spine and legs
    createStream(scCurve, 20, 0x00E5FF, this.nervousGroup);
    createStream(lsCurve, 15, 0x00E5FF, this.nervousGroup);
    createStream(rsCurve, 15, 0x00E5FF, this.nervousGroup);

    // Cardiovascular pulses down aorta and femoral arteries
    createStream(daCurve, 22, 0xF43F5E, this.vascularGroup);
    createStream(lfCurve, 15, 0xF43F5E, this.vascularGroup);
    createStream(rfCurve, 15, 0xF43F5E, this.vascularGroup);
  }

  setOrgan(organId) {
    this.currentOrgan = organId;
    const scale = 0.165;
    this.bodyWrapper.scale.set(scale, scale, scale);

    if (organId === 'brain') {
      // Align cranium (y ~ 168.5 in body space) with the brain at (0, 0, 0)
      this.bodyWrapper.position.set(0.0, -168.5 * scale, -2.0 * scale);
      this.nervousGroup.visible = true;
      this.vascularGroup.visible = false;
    } else if (organId === 'heart') {
      // Align thoracic mediastinum (y ~ 133.0 in body space) with the heart at (0, 0, 0)
      this.bodyWrapper.position.set(0.0, -133.0 * scale, 1.2 * scale);
      this.nervousGroup.visible = false;
      this.vascularGroup.visible = true;
    }
  }

  setVisibilityMode(mode) {
    this.visibilityMode = mode; // 'auto' | 'show' | 'hide'
  }

  update(camera, delta, time) {
    // 1. Calculate camera distance to the focused organ at (0, 0, 0)
    const distance = camera.position.distanceTo(this.targetPosition);

    // 2. Determine target opacity based on mode and zoom thresholds with smooth hysteresis
    let targetOpacity = 0.0;

    if (this.visibilityMode === 'hide') {
      targetOpacity = 0.0;
    } else if (this.visibilityMode === 'show') {
      targetOpacity = this.maxBodyOpacity;
    } else {
      // 'auto' mode:
      // Focused on organ (< 6.2 units): Body completely hidden (0.0)
      // Transition range (6.2 to 11.5 units): Smooth cinematic fade in
      // Overview (> 11.5 units): Body fully visible at max ghost opacity
      const fadeFactor = THREE.MathUtils.smoothstep(distance, 6.2, 11.5);
      targetOpacity = fadeFactor * this.maxBodyOpacity;
    }

    // 3. Smooth exponential damping for fluid, natural visual transition
    this.currentOpacity = THREE.MathUtils.damp(this.currentOpacity, targetOpacity, 4.8, delta);

    // 4. Update visibility and materials
    if (this.currentOpacity < 0.002) {
      this.bodyGroup.visible = false;
      return;
    }

    this.bodyGroup.visible = true;

    // Apply opacities across ghost shell, wireframe, and conduits
    if (this.ghostMaterial) this.ghostMaterial.opacity = this.currentOpacity;
    if (this.wireframeMaterial) this.wireframeMaterial.opacity = this.currentOpacity * 0.28;
    if (this.nervousMaterial) this.nervousMaterial.opacity = this.currentOpacity * 0.85;
    if (this.vascularMaterial) this.vascularMaterial.opacity = this.currentOpacity * 0.85;

    // 5. Animate neural action potential and blood pulse particles along conduits
    for (const cp of this.conduitParticles) {
      cp.mat.opacity = this.currentOpacity * 0.95;
      const pos = cp.geo.attributes.position.array;
      for (let i = 0; i < cp.count; i++) {
        cp.progress[i] += delta * 0.35;
        if (cp.progress[i] > 1.0) cp.progress[i] -= 1.0;
        const pt = cp.curve.getPointAt(cp.progress[i]);
        pos[i * 3] = pt.x;
        pos[i * 3 + 1] = pt.y;
        pos[i * 3 + 2] = pt.z;
      }
      cp.geo.attributes.position.needsUpdate = true;
    }
  }

  setTheme(theme) {
    if (this.ghostMaterial) {
      this.ghostMaterial.color.set(theme === 'dark' ? "#94A3B8" : "#475569");
    }
  }
}
