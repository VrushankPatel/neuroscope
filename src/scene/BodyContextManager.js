import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

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

    // 2. Nervous System Signal Conduits (Brain Mode — Peripheral Nerves)
    this.nervousMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#0284C7"),
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });

    // 3. Cardiovascular Vessel Network — 3 Tiers (Heart Mode)
    // Tier 1: Major arteries & veins (Aorta, Vena Cava, Carotids, Femorals)
    this.vesselTier1Mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#64748B"),
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    // Tier 2: Secondary branches (Brachial, Renal, Mesenteric, Tibial, Intercostals)
    this.vesselTier2Mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#64748B"),
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    // Tier 3: Fine peripheral vessels (capillary beds, digital, plantar)
    this.vesselTier3Mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#64748B"),
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      side: THREE.DoubleSide
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
    // 2. Heart Mode: Full Cardiovascular Vessel Network (3-Tier Hierarchy)
    // =========================================================================
    this.vascularGroup = new THREE.Group();
    this.vascularGroup.name = "SystemicVascularNetwork";
    this.bodyWrapper.add(this.vascularGroup);
    this.buildCardiovascularNetwork();

    // Animated Neural Signal Particles (nervous system only — blood flow handled by CardiacFlowSystem)
    this.initConduitParticles(spinalCordCurve, leftBrachialCurve, rightBrachialCurve, leftSciaticCurve, rightSciaticCurve);
  }

  // ==========================================================================
  // Comprehensive 3-Tier Cardiovascular Vessel Network
  // All coordinates are in body-space (y: 0=feet, 168=head top)
  // Anatomy reference: aorta/vena cava, carotids, subclavians, iliacs, femorals,
  //   brachials, tibials, intercostals, renals, mesenteric, cerebral, etc.
  // ==========================================================================
  buildCardiovascularNetwork() {
    this.vesselCurves = { tier1: [], tier2: [], tier3: [] };
    // Artificial skeletal cage / structural framework removed entirely.
    // The faint translucent human body silhouette (bodyMesh) serves as the sole anatomical context.
  }

  initConduitParticles(scCurve, lbCurve, rbCurve, lsCurve, rsCurve) {
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

    // Neural pulses down spine, arms, and legs
    createStream(scCurve, 20, 0x00E5FF, this.nervousGroup);
    createStream(lbCurve, 15, 0x00E5FF, this.nervousGroup);
    createStream(rbCurve, 15, 0x00E5FF, this.nervousGroup);
    createStream(lsCurve, 15, 0x00E5FF, this.nervousGroup);
    createStream(rsCurve, 15, 0x00E5FF, this.nervousGroup);
  }

  setOrgan(organId) {
    this.currentOrgan = organId;
    
    if (organId === 'brain') {
      const scale = 0.165;
      this.bodyWrapper.scale.set(scale, scale, scale);
      // Align cranium (y ~ 168.5 in body space) with the brain at (0, 0, 0)
      this.bodyWrapper.position.set(0.0, -168.5 * scale, -2.0 * scale);
      this.nervousGroup.visible = true;
      this.vascularGroup.visible = false;
    } else if (organId === 'heart') {
      const scale = 0.35; // Larger body scale so the heart fits naturally inside the chest
      this.bodyWrapper.scale.set(scale, scale, scale);
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

    // Apply opacities across ghost shell and conduits
    if (this.ghostMaterial) this.ghostMaterial.opacity = this.currentOpacity;
    if (this.nervousMaterial) this.nervousMaterial.opacity = this.currentOpacity * 0.85;

    // Tiered vascular vessel opacities:
    // Major vessels clearly visible, secondary subtle, fine extremely subtle
    if (this.vesselTier1Mat) this.vesselTier1Mat.opacity = Math.min(0.45, this.currentOpacity * 2.8);
    if (this.vesselTier2Mat) this.vesselTier2Mat.opacity = Math.min(0.28, this.currentOpacity * 1.75);
    if (this.vesselTier3Mat) this.vesselTier3Mat.opacity = Math.min(0.14, this.currentOpacity * 0.85);

    // 5. Animate neural action potential particles along conduits
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
    if (this.nervousMaterial) {
      this.nervousMaterial.color.set(theme === 'dark' ? "#38BDF8" : "#0284C7");
    }
    // Vessel network color — cool slate tone, slightly lighter in dark mode
    const vesselColor = theme === 'dark' ? "#94A3B8" : "#64748B";
    if (this.vesselTier1Mat) this.vesselTier1Mat.color.set(vesselColor);
    if (this.vesselTier2Mat) this.vesselTier2Mat.color.set(vesselColor);
    if (this.vesselTier3Mat) this.vesselTier3Mat.color.set(vesselColor);
  }
}
