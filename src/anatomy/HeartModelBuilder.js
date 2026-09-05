import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export class HeartModelBuilder {
  constructor(registry) {
    this.registry = registry;
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = "HumanHeartRoot";
    this.gltfLoader = new GLTFLoader();
    this.onModelLoadedCallbacks = [];
  }

  onModelLoaded(cb) {
    this.onModelLoadedCallbacks.push(cb);
  }

  loadRealModel(onComplete, onError) {
    try {
      // 1. Translucent Biological Outer Pericardium Shell Material (Identical styling to Brain Cortical Shell)
      // Crystal clear smoked-glass revealing internal chambers, cardiac valves, and hemodynamics
      const createCorticalShellMaterial = (baseTint = "#BE185D") => {
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color(baseTint),
          roughness: 0.22,
          metalness: 0.12,
          transparent: true,
          opacity: 0.20, // Translucent depth matching brain cortex
          depthWrite: false,
          side: THREE.DoubleSide
        });
      };

      // 2. High-Fidelity Translucent Biological Chamber & Vessel Materials (Matching Brain Internal Organ Aesthetics)
      const createOrganMaterial = (colorHex, emissiveHex = "#000000", emissiveInt = 0.0, opacity = 0.70) => {
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color("#BE185D"), // Subtle ruby tint instead of dark muddy gray
          roughness: 0.22,
          metalness: 0.12,
          transparent: true,
          opacity: 0.20,
          depthWrite: false,
          side: THREE.DoubleSide
        });
      };

      // Construct the authentic 3D biological Heart model
      this.buildAuthenticHeartModel(createCorticalShellMaterial, createOrganMaterial, () => {
        setTimeout(() => {
          if (onComplete) onComplete(this.rootGroup);
        }, 50);
      });
    } catch (err) {
      console.error("Error constructing heart model:", err);
      if (onError) onError(err);
    }

    return this.rootGroup;
  }

  buildAuthenticHeartModel(createCorticalShellMaterial, createOrganMaterial, onComplete) {
    const pivot = new THREE.Group();
    pivot.name = "AnatomicalHeartPivot";
    pivot.scale.set(1.18, 1.18, 1.18);

    // =========================================================================
    // 1. Translucent Sculpted Outer Pericardium & Epicardial Shell
    // Medically authentic human heart external contour:
    // - Asymmetric inverted conical apex pointing forward, down, and to the left
    // - Deep anterior interventricular sulcus and atrioventricular (coronary) groove
    // - Conus arteriosus slope leading up into pulmonary trunk
    // - Posterior flatter diaphragmatic surface
    // =========================================================================
    const shellGeo = new THREE.SphereGeometry(1.22, 72, 54);
    const shellPos = shellGeo.attributes.position;

    for (let i = 0; i < shellPos.count; i++) {
      let x = shellPos.getX(i);
      let y = shellPos.getY(i);
      let z = shellPos.getZ(i);

      // Spherical coordinates
      const rOrig = Math.sqrt(x * x + y * y + z * z) || 1;
      const phi = Math.acos(Math.max(-1, Math.min(1, y / rOrig))); // 0 (superior base) to PI (inferior apex)
      const theta = Math.atan2(z, x); // -PI to PI
      const vNorm = phi / Math.PI; // 0 to 1

      // 1. Tapering conical profile along vertical cardio-thoracic axis
      // Heart is broader at superior base (phi ~ 0.25 - 0.40) and tapers to acute conical apex at bottom (phi -> 1)
      let radiusScale = 1.0;

      // Vertical profile: broad base, conical ventricular taper
      const baseBulge = Math.sin(phi * 0.85);
      radiusScale *= (0.35 + 0.75 * baseBulge);

      // 2. Asymmetrical Ventricular Contours:
      // Left ventricle is prominent laterally (theta ~ 1.8 to 3.0),
      // Right ventricle forms the broad anterior sternocostal surface (theta ~ 0.2 to 1.8)
      if (theta > 0.2 && theta < 2.0) {
        // Anterior RV prominence
        radiusScale += 0.16 * Math.sin((theta - 0.2) / 1.8 * Math.PI);
      } else if (theta >= 2.0 || theta < -2.4) {
        // Left ventricle lateral obtuse margin
        radiusScale += 0.14 * (1.0 - 0.4 * vNorm);
      } else {
        // Posterior flatter diaphragmatic surface
        radiusScale -= 0.12 * Math.sin(Math.abs(theta) * 0.8);
      }

      // 3. Anterior Interventricular Sulcus (LAD groove)
      // Runs obliquely down anterior face from theta ~ 0.95 at base to near apex
      const sulcusTheta = 0.95 - 0.35 * vNorm;
      const distToSulcus = Math.abs(theta - sulcusTheta);
      if (distToSulcus < 0.45 && vNorm > 0.25 && vNorm < 0.90) {
        const sulcusDepth = 0.14 * Math.cos((distToSulcus / 0.45) * (Math.PI / 2));
        radiusScale -= sulcusDepth;
      }

      // 4. Coronary (Atrioventricular) Sulcus Groove
      // Horizontal constriction separating atria from ventricles around phi ~ 0.36 * PI
      const avDist = Math.abs(phi - 0.36 * Math.PI);
      if (avDist < 0.32) {
        radiusScale -= 0.11 * Math.cos((avDist / 0.32) * (Math.PI / 2));
      }

      // 5. Conus Arteriosus / Infundibulum Bulge
      // Anterior RV outflow tract leading to pulmonary valve (theta ~ 0.6, phi ~ 0.25 to 0.40)
      if (Math.abs(theta - 0.65) < 0.45 && vNorm > 0.20 && vNorm < 0.45) {
        radiusScale += 0.12 * Math.cos((Math.abs(theta - 0.65) / 0.45) * (Math.PI / 2));
      }

      // Transform coordinates with realistic anatomical apex displacement
      // Real cardiac apex points down, forward (+Z), and to the left (-X)
      const apexDisplace = Math.pow(vNorm, 1.85);
      x = (x / rOrig) * radiusScale * 1.05 - 0.38 * apexDisplace;
      y = (1.05 - 2.25 * vNorm);
      z = (z / rOrig) * radiusScale * 0.98 + 0.28 * apexDisplace;

      shellPos.setXYZ(i, x, y, z);
    }
    shellGeo.computeVertexNormals();

    const shellMat = createCorticalShellMaterial("#BE185D");
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    shellMesh.name = "pericardium";
    shellMesh.userData = {
      structureId: "pericardium",
      originalName: "Pericardium & Epicardial Shell",
      category: "pericardium",
      isShell: true,
      color: "#BE185D"
    };
    this.registry.registerStructure("pericardium", shellMesh);
    pivot.add(shellMesh);

    // =========================================================================
    // 2. Left Ventricle (Thick muscular conical core forming apical vortex)
    // Refined crimson/coral tone matching biological arterial myocardium
    // =========================================================================
    const lvGeo = new THREE.CylinderGeometry(0.58, 0.15, 1.45, 36, 24, false);
    const lvPos = lvGeo.attributes.position;
    for (let i = 0; i < lvPos.count; i++) {
      let x = lvPos.getX(i);
      let y = lvPos.getY(i);
      let z = lvPos.getZ(i);

      // T from top (1.0) to apex (0.0)
      const t = (y + 0.725) / 1.45;
      // Ellipsoidal muscular cross section
      x *= (0.42 + 0.58 * Math.sin(t * Math.PI * 0.85)) * 1.05;
      z *= (0.40 + 0.60 * Math.sin(t * Math.PI * 0.85)) * 0.95;

      // Apical vortex curve
      if (t < 0.3) {
        x -= 0.12 * (1.0 - t / 0.3);
        z += 0.08 * (1.0 - t / 0.3);
      }

      lvPos.setXYZ(i, x, y, z);
    }
    lvGeo.computeVertexNormals();

    const lvMat = createOrganMaterial("#E11D48", "#BE185D", 0.08, 0.72);
    const lvMesh = new THREE.Mesh(lvGeo, lvMat);
    lvMesh.name = "left_ventricle";
    lvMesh.position.set(-0.32, -0.32, 0.16);
    lvMesh.rotation.z = 0.22;
    lvMesh.rotation.x = -0.15;
    lvMesh.userData = {
      structureId: "left_ventricle",
      originalName: "Left Ventricle",
      category: "ventricle",
      color: "#E11D48"
    };
    this.registry.registerStructure("left_ventricle", lvMesh);
    pivot.add(lvMesh);

    // =========================================================================
    // 3. Right Ventricle (Anterior crescent chamber wrapping around the septum)
    // Features the infundibulum (conus arteriosus) leading to pulmonary valve
    // Refined pulmonary azure tone
    // =========================================================================
    const rvGeo = new THREE.CylinderGeometry(0.62, 0.28, 1.15, 36, 24, false);
    const rvPos = rvGeo.attributes.position;
    for (let i = 0; i < rvPos.count; i++) {
      let x = rvPos.getX(i);
      let y = rvPos.getY(i);
      let z = rvPos.getZ(i);

      const t = (y + 0.575) / 1.15;
      // Sculpt into authentic crescentic pocket wrapping anteriorly
      // Flatten posterior septal face and extend anterior/conus wall
      const crescentCurve = 0.25 * Math.sin(t * Math.PI);
      z += crescentCurve + 0.12;
      x *= (0.65 + 0.35 * t);

      // Superior infundibular funneling towards pulmonary valve
      if (t > 0.7) {
        x -= 0.15 * (t - 0.7) / 0.3;
        z += 0.10 * (t - 0.7) / 0.3;
      }

      rvPos.setXYZ(i, x, y, z);
    }
    rvGeo.computeVertexNormals();

    const rvMat = createOrganMaterial("#0284C7", "#0369A1", 0.08, 0.70);
    const rvMesh = new THREE.Mesh(rvGeo, rvMat);
    rvMesh.name = "right_ventricle";
    rvMesh.position.set(0.38, -0.18, 0.36);
    rvMesh.rotation.z = -0.18;
    rvMesh.rotation.y = 0.24;
    rvMesh.userData = {
      structureId: "right_ventricle",
      originalName: "Right Ventricle & Infundibulum",
      category: "ventricle",
      color: "#0284C7"
    };
    this.registry.registerStructure("right_ventricle", rvMesh);
    pivot.add(rvMesh);

    // =========================================================================
    // 4. Interventricular Septum (Curved Muscular Partition)
    // Curvature: Convex towards RV, Concave towards LV (authentic hemodynamics)
    // Refined indigo/violet tone
    // =========================================================================
    const septumGeo = new THREE.CylinderGeometry(0.48, 0.32, 1.20, 20, 16, false, 0, Math.PI * 0.85);
    const septumPos = septumGeo.attributes.position;
    for (let i = 0; i < septumPos.count; i++) {
      let x = septumPos.getX(i);
      let y = septumPos.getY(i);
      let z = septumPos.getZ(i);
      // Give realistic muscular thickness
      z = z * 0.38 + 0.05;
      x = x * 0.55;
      septumPos.setXYZ(i, x, y, z);
    }
    septumGeo.computeVertexNormals();

    const septumMat = createOrganMaterial("#6366F1", "#4F46E5", 0.06, 0.72);
    const septumMesh = new THREE.Mesh(septumGeo, septumMat);
    septumMesh.name = "septum";
    septumMesh.position.set(0.04, -0.28, 0.18);
    septumMesh.rotation.z = 0.16;
    septumMesh.userData = {
      structureId: "septum",
      originalName: "Interventricular Septum",
      category: "septum",
      color: "#6366F1"
    };
    this.registry.registerStructure("septum", septumMesh);
    pivot.add(septumMesh);

    // =========================================================================
    // 5. Left Atrium (Posterior chamber + Left Auricle appendage + 4 Pulmonary Veins)
    // Refined arterial ruby/pink tone
    // =========================================================================
    const laBodyGeo = new THREE.SphereGeometry(0.58, 32, 24);
    const laBodyPos = laBodyGeo.attributes.position;
    for (let i = 0; i < laBodyPos.count; i++) {
      let x = laBodyPos.getX(i);
      let y = laBodyPos.getY(i);
      let z = laBodyPos.getZ(i);
      // Posterior smooth oblong shape
      x *= 1.05;
      y *= 0.88;
      z *= 0.90;
      laBodyPos.setXYZ(i, x, y, z);
    }
    laBodyGeo.computeVertexNormals();
    const laBodyMatrix = new THREE.Matrix4().setPosition(-0.28, 0.68, -0.38);
    laBodyGeo.applyMatrix4(laBodyMatrix);

    // Left Auricle (atrial appendage) curving anteriorly over pulmonary trunk base
    const laAuricleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.48, 0.65, -0.15),
      new THREE.Vector3(-0.55, 0.62, 0.05),
      new THREE.Vector3(-0.42, 0.55, 0.22),
      new THREE.Vector3(-0.28, 0.48, 0.28)
    ]);
    const laAuricleGeo = new THREE.TubeGeometry(laAuricleCurve, 16, 0.11, 12, false);

    // 4 Pulmonary Veins
    const pv1 = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(-0.55, 0.82, -0.45), new THREE.Vector3(-0.95, 0.90, -0.58)), 8, 0.08, 10, false);
    const pv2 = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(-0.55, 0.58, -0.48), new THREE.Vector3(-0.92, 0.58, -0.62)), 8, 0.08, 10, false);
    const pv3 = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(-0.02, 0.82, -0.50), new THREE.Vector3(0.35, 0.88, -0.65)), 8, 0.08, 10, false);
    const pv4 = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(-0.02, 0.58, -0.52), new THREE.Vector3(0.32, 0.58, -0.68)), 8, 0.08, 10, false);

    const mergedLaGeo = BufferGeometryUtils.mergeGeometries([laBodyGeo, laAuricleGeo, pv1, pv2, pv3, pv4]);
    const laMat = createOrganMaterial("#BE185D", "#E11D48", 0.06, 0.68);
    const laMesh = new THREE.Mesh(mergedLaGeo, laMat);
    laMesh.name = "left_atrium";
    laMesh.userData = {
      structureId: "left_atrium",
      originalName: "Left Atrium & Auricle",
      category: "atrium",
      color: "#BE185D"
    };
    this.registry.registerStructure("left_atrium", laMesh);
    pivot.add(laMesh);

    // =========================================================================
    // 6. Right Atrium (Right border chamber + Triangular Right Auricle appendage)
    // Refined deep azure tone
    // =========================================================================
    const raBodyGeo = new THREE.SphereGeometry(0.62, 32, 24);
    const raBodyPos = raBodyGeo.attributes.position;
    for (let i = 0; i < raBodyPos.count; i++) {
      let x = raBodyPos.getX(i);
      let y = raBodyPos.getY(i);
      let z = raBodyPos.getZ(i);
      // Oblong sinus venosus profile
      y *= 1.22;
      x *= 0.95;
      z *= 0.92;
      raBodyPos.setXYZ(i, x, y, z);
    }
    raBodyGeo.computeVertexNormals();
    const raBodyMatrix = new THREE.Matrix4().setPosition(0.76, 0.52, 0.06);
    raBodyGeo.applyMatrix4(raBodyMatrix);

    // Right Auricle (triangular muscular flap overlapping ascending aorta root)
    const raAuricleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.65, 0.68, 0.15),
      new THREE.Vector3(0.48, 0.65, 0.28),
      new THREE.Vector3(0.28, 0.58, 0.32),
      new THREE.Vector3(0.12, 0.50, 0.30)
    ]);
    const raAuricleGeo = new THREE.TubeGeometry(raAuricleCurve, 16, 0.12, 12, false);

    const mergedRaGeo = BufferGeometryUtils.mergeGeometries([raBodyGeo, raAuricleGeo]);
    const raMat = createOrganMaterial("#0369A1", "#0284C7", 0.08, 0.68);
    const raMesh = new THREE.Mesh(mergedRaGeo, raMat);
    raMesh.name = "right_atrium";
    raMesh.userData = {
      structureId: "right_atrium",
      originalName: "Right Atrium & Auricle",
      category: "atrium",
      color: "#0369A1"
    };
    this.registry.registerStructure("right_atrium", raMesh);
    pivot.add(raMesh);

    // =========================================================================
    // 7. Ascending Aorta, Aortic Arch & 3 Supra-Aortic Branches
    // Medically accurate CatmullRom path with Brachiocephalic, Carotid, Subclavian
    // Refined radiant amber/orange tone
    // =========================================================================
    const aortaSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.00, 0.35, 0.10),   // Aortic root behind pulmonary trunk
      new THREE.Vector3(0.08, 1.10, 0.14),   // Ascending aorta
      new THREE.Vector3(-0.16, 1.72, 0.06),  // Aortic arch summit
      new THREE.Vector3(-0.52, 1.55, -0.28), // Distal arch
      new THREE.Vector3(-0.68, 0.85, -0.45), // Descending thoracic aorta
      new THREE.Vector3(-0.72, -0.35, -0.48)
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaSpline, 48, 0.24, 20, false);

    // Three supra-aortic arch branches (anatomical origins along the arch convex curve)
    // 1. Brachiocephalic trunk (innominate)
    const bGeo = new THREE.TubeGeometry(
      new THREE.LineCurve3(new THREE.Vector3(0.00, 1.66, 0.08), new THREE.Vector3(0.18, 2.26, 0.06)),
      12, 0.085, 14, false
    );
    // 2. Left Common Carotid
    const cGeo = new THREE.TubeGeometry(
      new THREE.LineCurve3(new THREE.Vector3(-0.20, 1.72, 0.02), new THREE.Vector3(-0.18, 2.28, -0.02)),
      12, 0.075, 14, false
    );
    // 3. Left Subclavian
    const sGeo = new THREE.TubeGeometry(
      new THREE.LineCurve3(new THREE.Vector3(-0.38, 1.68, -0.10), new THREE.Vector3(-0.45, 2.24, -0.18)),
      12, 0.075, 14, false
    );

    const mergedAortaGeo = BufferGeometryUtils.mergeGeometries([aortaGeo, bGeo, cGeo, sGeo]);
    const aortaMat = createOrganMaterial("#D97706", "#F59E0B", 0.14, 0.80);
    const aortaMesh = new THREE.Mesh(mergedAortaGeo, aortaMat);
    aortaMesh.name = "aorta";
    aortaMesh.userData = {
      structureId: "aorta",
      originalName: "Aorta & Aortic Arch",
      category: "vessel",
      color: "#D97706"
    };
    this.registry.registerStructure("aorta", aortaMesh);
    pivot.add(aortaMesh);

    // =========================================================================
    // 8. Pulmonary Artery Trunk & Left/Right Branches
    // Originates anteriorly from conus arteriosus, crosses in front of ascending aorta,
    // and bifurcates beneath the aortic arch
    // Refined pulmonary cyan tone
    // =========================================================================
    const paTrunkSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.24, 0.38, 0.36),   // Conus arteriosus of RV
      new THREE.Vector3(0.14, 0.90, 0.28),   // Passing anterior to ascending aorta
      new THREE.Vector3(-0.14, 1.28, 0.08)   // Bifurcation under aortic arch
    ]);
    const paTrunkGeo = new THREE.TubeGeometry(paTrunkSpline, 32, 0.22, 18, false);

    // Left pulmonary artery passing to left lung
    const leftPaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.14, 1.28, 0.08),
      new THREE.Vector3(-0.52, 1.24, -0.12),
      new THREE.Vector3(-0.85, 1.20, -0.26)
    ]);
    const leftPaGeo = new THREE.TubeGeometry(leftPaCurve, 16, 0.14, 14, false);

    // Right pulmonary artery passing horizontally beneath the aortic arch to right lung
    const rightPaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.14, 1.28, 0.08),
      new THREE.Vector3(0.32, 1.22, -0.06),
      new THREE.Vector3(0.80, 1.16, -0.18)
    ]);
    const rightPaGeo = new THREE.TubeGeometry(rightPaCurve, 16, 0.14, 14, false);

    const mergedPaGeo = BufferGeometryUtils.mergeGeometries([paTrunkGeo, leftPaGeo, rightPaGeo]);
    const paMat = createOrganMaterial("#0EA5E9", "#38BDF8", 0.10, 0.80);
    const paMesh = new THREE.Mesh(mergedPaGeo, paMat);
    paMesh.name = "pulmonary_artery";
    paMesh.userData = {
      structureId: "pulmonary_artery",
      originalName: "Pulmonary Artery Trunk & Branches",
      category: "vessel",
      color: "#0EA5E9"
    };
    this.registry.registerStructure("pulmonary_artery", paMesh);
    pivot.add(paMesh);

    // =========================================================================
    // 9. Superior Vena Cava & Inferior Vena Cava
    // Vertical systemic venous trunks entering posterior right atrium
    // Refined venous royal blue tone
    // =========================================================================
    const svcSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.82, 0.85, 0.02),
      new THREE.Vector3(0.82, 1.42, -0.02),
      new THREE.Vector3(0.82, 1.95, -0.04)
    ]);
    const svcGeo = new THREE.TubeGeometry(svcSpline, 20, 0.19, 16, false);

    const ivcSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.76, 0.20, 0.02),
      new THREE.Vector3(0.76, -0.32, 0.01),
      new THREE.Vector3(0.76, -0.75, 0.00)
    ]);
    const ivcGeo = new THREE.TubeGeometry(ivcSpline, 16, 0.18, 16, false);

    const mergedSvcGeo = BufferGeometryUtils.mergeGeometries([svcGeo, ivcGeo]);
    const svcMat = createOrganMaterial("#2563EB", "#3B82F6", 0.08, 0.78);
    const svcMesh = new THREE.Mesh(mergedSvcGeo, svcMat);
    svcMesh.name = "superior_vena_cava";
    svcMesh.userData = {
      structureId: "superior_vena_cava",
      originalName: "Superior & Inferior Vena Cava",
      category: "vessel",
      color: "#2563EB"
    };
    this.registry.registerStructure("superior_vena_cava", svcMesh);
    pivot.add(svcMesh);

    // =========================================================================
    // 10. Cardiac Valves (Mitral, Tricuspid, Aortic, Pulmonary Annuli & Cusps)
    // Pearlescent ivory white-matter bridge tone matching brain corpus callosum
    // =========================================================================
    const valveMat = createOrganMaterial("#F8FAFC", "#CBD5E1", 0.18, 0.85);

    // Mitral Valve annulus (between LA and LV)
    const mitralGeo = new THREE.TorusGeometry(0.30, 0.04, 14, 28);
    const mMatrix = new THREE.Matrix4()
      .makeRotationFromEuler(new THREE.Euler(Math.PI / 2.3, 0.22, 0))
      .setPosition(-0.24, 0.30, -0.12);
    mitralGeo.applyMatrix4(mMatrix);

    // Tricuspid Valve annulus (between RA and RV)
    const tricuspidGeo = new THREE.TorusGeometry(0.34, 0.04, 14, 28);
    const tMatrix = new THREE.Matrix4()
      .makeRotationFromEuler(new THREE.Euler(Math.PI / 2.2, -0.22, 0))
      .setPosition(0.32, 0.22, 0.22);
    tricuspidGeo.applyMatrix4(tMatrix);

    // Aortic Valve annulus (root of ascending aorta)
    const aorticGeo = new THREE.TorusGeometry(0.24, 0.038, 14, 28);
    const aMatrix = new THREE.Matrix4()
      .makeRotationFromEuler(new THREE.Euler(Math.PI / 2.1, 0.05, 0))
      .setPosition(0.00, 0.40, 0.12);
    aorticGeo.applyMatrix4(aMatrix);

    // Pulmonary Valve annulus (conus arteriosus outflow)
    const pulmonaryGeo = new THREE.TorusGeometry(0.22, 0.036, 14, 28);
    const pMatrix = new THREE.Matrix4()
      .makeRotationFromEuler(new THREE.Euler(Math.PI / 2.3, -0.28, 0))
      .setPosition(0.20, 0.52, 0.32);
    pulmonaryGeo.applyMatrix4(pMatrix);

    const mergedValvesGeo = BufferGeometryUtils.mergeGeometries([mitralGeo, tricuspidGeo, aorticGeo, pulmonaryGeo]);
    const valvesMesh = new THREE.Mesh(mergedValvesGeo, valveMat);
    valvesMesh.name = "valves";
    valvesMesh.userData = {
      structureId: "valves",
      originalName: "Cardiac Valves (Mitral, Tricuspid, Aortic, Pulmonary)",
      category: "valve",
      color: "#F8FAFC"
    };
    this.registry.registerStructure("valves", valvesMesh);
    pivot.add(valvesMesh);

    // =========================================================================
    // 11. Coronary Arteries (LAD, LCx, RCA with Real Anatomical Branching)
    // Warm radiant amber/gold vasculature tracing the true cardiac sulci
    // =========================================================================
    const coronaryMat = createOrganMaterial("#F59E0B", "#D97706", 0.25, 0.90);

    // Left Anterior Descending (LAD) along anterior interventricular sulcus
    const ladSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.06, 0.48, 0.24),
      new THREE.Vector3(0.04, 0.22, 0.38),
      new THREE.Vector3(-0.02, -0.12, 0.38),
      new THREE.Vector3(-0.16, -0.52, 0.32),
      new THREE.Vector3(-0.32, -0.80, 0.24)
    ]);
    const ladGeo = new THREE.TubeGeometry(ladSpline, 36, 0.042, 10, false);

    // Diagonal branch from LAD over LV obtuse margin
    const diagSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.05, 0.38),
      new THREE.Vector3(-0.22, -0.15, 0.35),
      new THREE.Vector3(-0.45, -0.38, 0.26)
    ]);
    const diagGeo = new THREE.TubeGeometry(diagSpline, 16, 0.030, 8, false);

    // Left Circumflex (LCx) in left AV groove
    const lcxSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.06, 0.48, 0.24),
      new THREE.Vector3(-0.35, 0.38, 0.15),
      new THREE.Vector3(-0.52, 0.28, -0.10),
      new THREE.Vector3(-0.48, 0.05, -0.28)
    ]);
    const lcxGeo = new THREE.TubeGeometry(lcxSpline, 20, 0.035, 8, false);

    // Right Coronary Artery (RCA) in right atrioventricular groove
    const rcaSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.12, 0.48, 0.20),
      new THREE.Vector3(0.45, 0.30, 0.30),
      new THREE.Vector3(0.68, 0.08, 0.24),
      new THREE.Vector3(0.64, -0.22, 0.14),
      new THREE.Vector3(0.35, -0.52, -0.04)
    ]);
    const rcaGeo = new THREE.TubeGeometry(rcaSpline, 32, 0.042, 10, false);

    // Acute marginal branch of RCA
    const margSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.66, -0.05, 0.20),
      new THREE.Vector3(0.55, -0.25, 0.28),
      new THREE.Vector3(0.28, -0.50, 0.26)
    ]);
    const margGeo = new THREE.TubeGeometry(margSpline, 16, 0.030, 8, false);

    const mergedCoronaryGeo = BufferGeometryUtils.mergeGeometries([ladGeo, diagGeo, lcxGeo, rcaGeo, margGeo]);
    const coronaryMesh = new THREE.Mesh(mergedCoronaryGeo, coronaryMat);
    coronaryMesh.name = "coronary_arteries";
    coronaryMesh.userData = {
      structureId: "coronary_arteries",
      originalName: "Coronary Arteries (LAD, LCx, RCA)",
      category: "vessel",
      color: "#F59E0B"
    };
    this.registry.registerStructure("coronary_arteries", coronaryMesh);
    pivot.add(coronaryMesh);

    // Anatomical orientation: Slight tilt ~18 degrees to match thoracic cardiac axis
    pivot.rotation.y = -Math.PI / 7;
    pivot.rotation.x = 0.08;
    pivot.position.set(0, 0, 0);

    this.rootGroup.add(pivot);
    this.onModelLoadedCallbacks.forEach(cb => cb(pivot, pivot));

    if (onComplete) onComplete(this.rootGroup);
  }

  mapPartNameToStructureId(name) {
    if (name.includes("pericard") || name.includes("shell") || name.includes("epicard")) return "pericardium";
    if (name.includes("aorta")) return "aorta";
    if (name.includes("pulmonary")) return "pulmonary_artery";
    if (name.includes("left_ventricle") || name.includes("l_ventricle") || name.includes("ventricle_l")) return "left_ventricle";
    if (name.includes("right_ventricle") || name.includes("r_ventricle") || name.includes("ventricle_r")) return "right_ventricle";
    if (name.includes("septum")) return "septum";
    if (name.includes("left_atrium") || name.includes("l_atrium") || name.includes("atrium_l")) return "left_atrium";
    if (name.includes("right_atrium") || name.includes("r_atrium") || name.includes("atrium_r")) return "right_atrium";
    if (name.includes("cava") || name.includes("svc") || name.includes("ivc")) return "superior_vena_cava";
    if (name.includes("valve")) return "valves";
    if (name.includes("coronary")) return "coronary_arteries";
    
    return "pericardium"; 
  }

  getCategoryForStructure(structId) {
    if (structId === "pericardium") return "pericardium";
    if (structId.includes("ventricle")) return "ventricle";
    if (structId.includes("atrium")) return "atrium";
    if (structId.includes("valve")) return "valve";
    if (structId === "septum") return "septum";
    return "vessel";
  }
}
