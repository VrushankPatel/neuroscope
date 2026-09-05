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

    // 4. Cardiovascular Vessel Network — 3 Tiers (Heart Mode)
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
    const v = (x, y, z) => new THREE.Vector3(x, y, z);
    this.vesselCurves = { tier1: [], tier2: [], tier3: [] };

    // ================================================================
    // TIER 1: MAJOR VESSELS (radius 1.2, 40 segments)
    // ================================================================
    const t1 = [];
    const addT1 = (pts) => {
      const c = new THREE.CatmullRomCurve3(pts.map(p => v(p[0], p[1], p[2])));
      this.vesselCurves.tier1.push(c);
      t1.push(new THREE.TubeGeometry(c, 40, 1.2, 10, false));
    };

    // Ascending Aorta (Heart → up and slightly left)
    addT1([[-1,133,2], [-1.5,138,3], [-2,143,2.5], [-2,146,2]]);
    // Aortic Arch (sweeps left and posterior)
    addT1([[-2,146,2], [-1,148.5,1], [-2,149.5,-0.5], [-4,147,-2]]);
    // Descending Thoracic Aorta (posterior mediastinum)
    addT1([[-4,147,-2], [-3.5,140,-3], [-3,130,-3], [-2.5,120,-2.8], [-2,110,-2.5], [-1.5,100,-2]]);
    // Abdominal Aorta (to bifurcation)
    addT1([[-1.5,100,-2], [-1,92,-1.5], [-0.5,85,-1], [0,78,0]]);
    // Superior Vena Cava (right side, draining upper body)
    addT1([[5,149,1], [5,143,0.5], [4.5,138,0], [4,133,0]]);
    // Inferior Vena Cava (right side, ascending from lower body)
    addT1([[2,78,1], [2.5,85,0.5], [3,95,-0.5], [3.5,110,-1], [3.5,125,-0.8], [3.5,133,0]]);
    // Right Common Carotid
    addT1([[2,149,1], [3,153,1.5], [3.5,157,2], [3.5,161,2], [3,165,2.5]]);
    // Left Common Carotid
    addT1([[-2,149.5,0.5], [-3,153,1], [-3.5,157,1.5], [-3.5,161,2], [-3,165,2]]);
    // Right Subclavian → Axillary
    addT1([[3,149,1], [7,148,0.5], [12,147,0], [17,146,0], [20,145,0]]);
    // Left Subclavian → Axillary
    addT1([[-3,149.5,0.5], [-7,148.5,0.5], [-12,147.5,0], [-17,146.5,0], [-20,145.5,0]]);
    // Right Common Iliac
    addT1([[0,78,0], [2,75,0.5], [4,72,0.5], [6,69,0], [8,65,0]]);
    // Left Common Iliac
    addT1([[0,78,0], [-2,75,0.5], [-4,72,0.5], [-6,69,0], [-8,65,0]]);
    // Right Femoral (thigh → knee)
    addT1([[8,65,0], [8,57,1], [8,48,0.5], [8,40,0], [8,32,0], [8,22,-0.5], [8,15,-1]]);
    // Left Femoral
    addT1([[-8,65,0], [-8,57,1], [-8,48,0.5], [-8,40,0], [-8,32,0], [-8,22,-0.5], [-8,15,-1]]);

    // ================================================================
    // TIER 2: SECONDARY VESSELS (radius 0.5, 24 segments)
    // ================================================================
    const t2 = [];
    const addT2 = (pts) => {
      const c = new THREE.CatmullRomCurve3(pts.map(p => v(p[0], p[1], p[2])));
      this.vesselCurves.tier2.push(c);
      t2.push(new THREE.TubeGeometry(c, 24, 0.5, 8, false));
    };

    // ---- ARMS ----
    // R. Brachial (axillary → elbow)
    addT2([[20,145,0], [21,138,0], [22,130,0], [22,120,0], [22,110,0], [23,100,0]]);
    // L. Brachial
    addT2([[-20,145.5,0], [-21,138,0], [-22,130,0], [-22,120,0], [-22,110,0], [-23,100,0]]);
    // R. Radial (elbow → wrist, lateral)
    addT2([[23,100,0], [24,93,0.5], [24.5,87,0.5], [25,82,0]]);
    // R. Ulnar (elbow → wrist, medial)
    addT2([[23,100,0], [23,93,-0.5], [23.5,87,-0.5], [24,82,0]]);
    // L. Radial
    addT2([[-23,100,0], [-24,93,0.5], [-24.5,87,0.5], [-25,82,0]]);
    // L. Ulnar
    addT2([[-23,100,0], [-23,93,-0.5], [-23.5,87,-0.5], [-24,82,0]]);

    // ---- HEAD / NECK ----
    // R. Internal Carotid (neck → brain base)
    addT2([[3,165,2.5], [4,169,2], [5,173,1.5]]);
    // L. Internal Carotid
    addT2([[-3,165,2], [-4,169,2], [-5,173,1.5]]);
    // R. External Carotid (neck → face/jaw)
    addT2([[3,165,2.5], [5,169,3], [6,173,3]]);
    // L. External Carotid
    addT2([[-3,165,2], [-5,169,3], [-6,173,3]]);
    // R. Vertebral (subclavian → brain posterior)
    addT2([[5,149,-1], [4,155,-2], [3,161,-2], [2,167,-1]]);
    // L. Vertebral
    addT2([[-5,149.5,-1], [-4,155,-2], [-3,161,-2], [-2,167,-1]]);
    // R. Jugular vein (head → SVC)
    addT2([[4,165,3], [5,160,2.5], [5,155,2], [5,149,1]]);
    // L. Jugular
    addT2([[-4,165,3], [-5,160,2.5], [-5,155,2], [-5,149.5,1]]);

    // ---- TORSO / ABDOMEN ----
    // Celiac Trunk (aorta → liver/stomach/spleen region)
    addT2([[-1.5,100,-2], [1,100,0], [4,100,2], [7,100,3]]);
    // Hepatic artery (from celiac)
    addT2([[7,100,3], [10,102,3], [13,103,2]]);
    // Splenic artery (from celiac, curves left)
    addT2([[7,100,3], [4,98,4], [0,96,5], [-5,95,4]]);
    // Superior Mesenteric (intestinal supply)
    addT2([[-1.5,97,-2], [1,96,1], [4,94,3], [5,91,5], [3,88,5]]);
    // Inferior Mesenteric (lower GI)
    addT2([[-0.5,86,-1], [2,85,2], [4,83,3]]);
    // R. Renal artery
    addT2([[-1.5,103,-2], [3,103,0], [7,103,1], [11,103,0]]);
    // L. Renal artery
    addT2([[-1.5,102,-2], [-4,102,0], [-8,102,1], [-11,102,0]]);
    // R. Internal Thoracic / Mammary (subclavian → sternum → abdomen)
    addT2([[5,149,1], [6,142,3], [6,133,4], [6,123,4], [5,113,3]]);
    // L. Internal Thoracic
    addT2([[-5,149.5,1], [-6,142,3], [-6,133,4], [-6,123,4], [-5,113,3]]);

    // Intercostal arteries (8 pairs from descending aorta → lateral chest wall)
    const icYs = [142, 137, 132, 127, 122, 117, 112, 107];
    for (const iy of icYs) {
      const ax = -3 + (147 - iy) * 0.02;
      const az = -3 + (147 - iy) * 0.02;
      // Right intercostal
      addT2([[ax, iy, az], [5, iy-0.5, 1], [10, iy-1, 3], [16, iy-1.5, 2]]);
      // Left intercostal
      addT2([[ax, iy, az], [-5, iy-0.5, 1], [-10, iy-1, 3], [-16, iy-1.5, 2]]);
    }

    // ---- PELVIS ----
    // R. Internal Iliac (pelvis organs)
    addT2([[5,72,0.5], [8,73,-1.5], [10,74,-3], [12,73,-3]]);
    // L. Internal Iliac
    addT2([[-5,72,0.5], [-8,73,-1.5], [-10,74,-3], [-12,73,-3]]);
    // R. Deep Femoral / Profunda (thigh musculature)
    addT2([[8,60,0.5], [10,55,-1], [11,48,-1.5], [10,42,-1]]);
    // L. Deep Femoral
    addT2([[-8,60,0.5], [-10,55,-1], [-11,48,-1.5], [-10,42,-1]]);

    // ---- LOWER LEGS ----
    // R. Anterior Tibial
    addT2([[8,15,-1], [7,10,1], [7,5,1.5], [7,2,2]]);
    // R. Posterior Tibial
    addT2([[8,15,-1], [8.5,10,-1.5], [8.5,5,-1.5], [8,2,-1]]);
    // R. Peroneal / Fibular
    addT2([[8,15,-1], [9.5,10,0], [10,6,0], [9.5,2,0]]);
    // L. Anterior Tibial
    addT2([[-8,15,-1], [-7,10,1], [-7,5,1.5], [-7,2,2]]);
    // L. Posterior Tibial
    addT2([[-8,15,-1], [-8.5,10,-1.5], [-8.5,5,-1.5], [-8,2,-1]]);
    // L. Peroneal
    addT2([[-8,15,-1], [-9.5,10,0], [-10,6,0], [-9.5,2,0]]);

    // Pulmonary stub vessels (extensible for future lungs)
    // R. Pulmonary artery stub
    addT2([[-1,136,3], [3,135,4], [7,133,5], [10,131,4]]);
    // L. Pulmonary artery stub
    addT2([[-1,136,3], [-4,135,4], [-8,133,5], [-11,131,4]]);
    // R. Pulmonary vein return stub
    addT2([[10,131,4], [7,130,3], [4,130,2], [2,133,1]]);
    // L. Pulmonary vein return stub
    addT2([[-11,131,4], [-7,130,3], [-4,130,2], [-2,133,1]]);

    // ================================================================
    // TIER 3: FINE PERIPHERAL VESSELS (radius 0.2, 12 segments)
    // Generated procedurally from tier 2 endpoints
    // ================================================================
    const t3 = [];
    const addT3 = (pts) => {
      const c = new THREE.CatmullRomCurve3(pts.map(p => v(p[0], p[1], p[2])));
      this.vesselCurves.tier3.push(c);
      t3.push(new THREE.TubeGeometry(c, 12, 0.2, 6, false));
    };

    // Procedural fine branches from key endpoints
    const fineEndpoints = [
      // Hand digital arteries
      { p: [25,82,0], d: [1,-1,0], n: 5, l: 5 },
      { p: [24,82,0], d: [0.5,-1,-0.5], n: 4, l: 4 },
      { p: [-25,82,0], d: [-1,-1,0], n: 5, l: 5 },
      { p: [-24,82,0], d: [-0.5,-1,-0.5], n: 4, l: 4 },
      // Foot arteries
      { p: [7,2,2], d: [0.3,-0.3,1], n: 4, l: 3 },
      { p: [8,2,-1], d: [0,-0.3,-0.5], n: 3, l: 3 },
      { p: [9.5,2,0], d: [0.5,-0.3,0], n: 3, l: 3 },
      { p: [-7,2,2], d: [-0.3,-0.3,1], n: 4, l: 3 },
      { p: [-8,2,-1], d: [0,-0.3,-0.5], n: 3, l: 3 },
      { p: [-9.5,2,0], d: [-0.5,-0.3,0], n: 3, l: 3 },
      // Cerebral branches
      { p: [5,173,1.5], d: [1,1,0], n: 4, l: 4 },
      { p: [-5,173,1.5], d: [-1,1,0], n: 4, l: 4 },
      { p: [6,173,3], d: [1,1,0.5], n: 3, l: 3 },
      { p: [-6,173,3], d: [-1,1,0.5], n: 3, l: 3 },
      { p: [2,167,-1], d: [0.5,1,-0.5], n: 3, l: 4 },
      { p: [-2,167,-1], d: [-0.5,1,-0.5], n: 3, l: 4 },
      // Abdominal organ sub-branches
      { p: [13,103,2], d: [1,0.3,1], n: 4, l: 5 },   // Hepatic
      { p: [-5,95,4], d: [-1,-0.3,1], n: 3, l: 4 },   // Splenic
      { p: [3,88,5], d: [1,-1,0.5], n: 5, l: 5 },      // Mesenteric
      { p: [4,83,3], d: [1,-1,0.3], n: 3, l: 4 },      // Inf. mesenteric
      { p: [11,103,0], d: [1,0,-0.5], n: 3, l: 3 },    // R. Renal
      { p: [-11,102,0], d: [-1,0,-0.5], n: 3, l: 3 },  // L. Renal
      // Pelvic sub-branches
      { p: [12,73,-3], d: [1,-1,-0.5], n: 4, l: 4 },
      { p: [-12,73,-3], d: [-1,-1,-0.5], n: 4, l: 4 },
      // Internal thoracic sub-branches
      { p: [5,113,3], d: [0.3,-1,0.5], n: 3, l: 5 },
      { p: [-5,113,3], d: [-0.3,-1,0.5], n: 3, l: 5 },
      // Profunda femoris sub-branches
      { p: [10,42,-1], d: [1,-1,0], n: 3, l: 4 },
      { p: [-10,42,-1], d: [-1,-1,0], n: 3, l: 4 },
    ];

    for (const ep of fineEndpoints) {
      for (let i = 0; i < ep.n; i++) {
        const angle = (i / ep.n) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
        const sx = Math.cos(angle) * 1.5;
        const sz = Math.sin(angle) * 1.5;
        const len = ep.l * (0.7 + Math.random() * 0.5);

        const mid = [
          ep.p[0] + ep.d[0] * len * 0.45 + sx,
          ep.p[1] + ep.d[1] * len * 0.45,
          ep.p[2] + ep.d[2] * len * 0.45 + sz
        ];
        const end = [
          ep.p[0] + ep.d[0] * len + sx * 1.3 + (Math.random() - 0.5) * 1.5,
          ep.p[1] + ep.d[1] * len + (Math.random() - 0.5) * 1.0,
          ep.p[2] + ep.d[2] * len + sz * 1.3 + (Math.random() - 0.5) * 1.5
        ];
        addT3([ep.p, mid, end]);
      }
    }

    // Dense intercostal sub-branches (rib cage vascular density)
    for (const iy of icYs) {
      for (let side = -1; side <= 1; side += 2) {
        for (let b = 0; b < 3; b++) {
          const bx = side * (7 + b * 3.5);
          const sy = iy - 1;
          addT3([
            [bx, sy, 2 + Math.random()],
            [bx + side * 2, sy + (Math.random()-0.5)*3, 3 + Math.random()],
            [bx + side * 3.5, sy + (Math.random()-0.5)*3, 2 + Math.random()*2]
          ]);
        }
      }
    }

    // Thigh sub-branches (along femoral)
    for (let side = -1; side <= 1; side += 2) {
      const sx = side * 8;
      for (let j = 0; j < 5; j++) {
        const sy = 58 - j * 9;
        addT3([
          [sx, sy, 0.5],
          [sx + side*3, sy-3, 1+Math.random()],
          [sx + side*4.5, sy-6, 0.5+Math.random()]
        ]);
        addT3([
          [sx, sy, 0.5],
          [sx + side*2, sy-3, -1-Math.random()],
          [sx + side*3.5, sy-6, -0.5-Math.random()]
        ]);
      }
    }

    // Lower leg sub-branches
    for (let side = -1; side <= 1; side += 2) {
      const sx = side * 8;
      for (let j = 0; j < 4; j++) {
        const sy = 13 - j * 3;
        addT3([
          [sx, sy, 0],
          [sx + side*2, sy-1.5, 1+Math.random()*0.5],
          [sx + side*3, sy-3, 0.5+Math.random()*0.5]
        ]);
      }
    }

    // Arm sub-branches (along brachial)
    for (let side = -1; side <= 1; side += 2) {
      const sx = side * 22;
      for (let j = 0; j < 5; j++) {
        const sy = 140 - j * 10;
        addT3([
          [sx, sy, 0],
          [sx + side*2, sy-3, 1+Math.random()*0.5],
          [sx + side*3, sy-5, 0.5]
        ]);
        addT3([
          [sx, sy, 0],
          [sx + side*1.5, sy-3, -1],
          [sx + side*2.5, sy-5, -0.5]
        ]);
      }
    }

    // ================================================================
    // MERGE PER TIER AND CREATE MESHES
    // ================================================================
    if (t1.length > 0) {
      const merged = BufferGeometryUtils.mergeGeometries(t1);
      const mesh = new THREE.Mesh(merged, this.vesselTier1Mat);
      mesh.name = "VascularTier1_MajorVessels";
      this.vascularGroup.add(mesh);
      t1.forEach(g => g.dispose());
    }

    if (t2.length > 0) {
      const merged = BufferGeometryUtils.mergeGeometries(t2);
      const mesh = new THREE.Mesh(merged, this.vesselTier2Mat);
      mesh.name = "VascularTier2_SecondaryBranches";
      this.vascularGroup.add(mesh);
      t2.forEach(g => g.dispose());
    }

    if (t3.length > 0) {
      const merged = BufferGeometryUtils.mergeGeometries(t3);
      const mesh = new THREE.Mesh(merged, this.vesselTier3Mat);
      mesh.name = "VascularTier3_FinePeripheral";
      this.vascularGroup.add(mesh);
      t3.forEach(g => g.dispose());
    }
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

    // Apply opacities across ghost shell, wireframe, and conduits
    if (this.ghostMaterial) this.ghostMaterial.opacity = this.currentOpacity;
    if (this.wireframeMaterial) this.wireframeMaterial.opacity = this.currentOpacity * 0.28;
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
    // Vessel network color — cool slate tone, slightly lighter in dark mode
    const vesselColor = theme === 'dark' ? "#94A3B8" : "#64748B";
    if (this.vesselTier1Mat) this.vesselTier1Mat.color.set(vesselColor);
    if (this.vesselTier2Mat) this.vesselTier2Mat.color.set(vesselColor);
    if (this.vesselTier3Mat) this.vesselTier3Mat.color.set(vesselColor);
  }
}
