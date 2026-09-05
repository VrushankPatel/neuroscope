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
      // 1. Smoked-Glass Biological Outer Shell Material (Identical to Brain Cortical Shell)
      // Deep obsidian-navy translucent glass revealing inner chambers and blood flow
      const createCorticalShellMaterial = (baseTint = "#0F172A") => {
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color(baseTint),
          roughness: 0.2,
          metalness: 0.15,
          transparent: true,
          opacity: 0.22, // Crystal clear translucent depth
          depthWrite: false,
          side: THREE.DoubleSide
        });
      };

      // 2. High-Contrast Anatomical Core Materials for Internal Organs (Identical to Brain Organ Materials)
      const createOrganMaterial = (colorHex, emissiveHex = "#000000", emissiveInt = 0.0, opacity = 0.88) => {
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color(colorHex),
          emissive: new THREE.Color(emissiveHex),
          emissiveIntensity: emissiveInt,
          roughness: 0.42,
          metalness: 0.1,
          transparent: true,
          opacity: opacity,
          depthWrite: true,
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
    pivot.scale.set(1.2, 1.2, 1.2);

    // =========================================================================
    // 1. Translucent Sculpted Outer Pericardium & Epicardial Shell
    // (Follows exact brain smoked-glass design and responds to Shell Opacity slider)
    // =========================================================================
    const shellGeo = new THREE.SphereGeometry(1.25, 64, 48);
    const shellPos = shellGeo.attributes.position;

    for (let i = 0; i < shellPos.count; i++) {
      let x = shellPos.getX(i);
      let y = shellPos.getY(i);
      let z = shellPos.getZ(i);

      // Normalize polar angle & azimuth
      const len = Math.sqrt(x * x + y * y + z * z) || 1;
      const nx = x / len;
      const ny = y / len;
      const nz = z / len;
      const phi = Math.acos(Math.max(-1, Math.min(1, ny))); // 0 (top) to PI (bottom)
      const theta = Math.atan2(nz, nx); // -PI to PI

      // Cardiac profile:
      // Taper down to acute conical apex pointed forward, down, and to the left
      const vNorm = phi / Math.PI; // 0 to 1
      const apexFactor = Math.sin(phi) * (1.0 - 0.22 * Math.cos(phi));

      // Asymmetric ventricular contours (left ventricle is larger and forms apex)
      let radius = 1.0;
      if (theta > 0 && theta < Math.PI) {
        // Anterior & Left Ventricular prominence
        radius += 0.18 * Math.sin(theta);
      } else {
        // Posterior flatter contour
        radius -= 0.08 * Math.sin(-theta);
      }

      // Anterior interventricular sulcus groove (sulcus between LV and RV)
      const sulcusDist = Math.abs(theta - 0.85);
      if (sulcusDist < 0.6) {
        radius -= 0.12 * Math.cos((sulcusDist / 0.6) * (Math.PI / 2));
      }

      // Coronary sulcus indentation between atria and ventricles (around phi ~ 0.35 * PI)
      const atrioventricularDist = Math.abs(phi - 0.38 * Math.PI);
      if (atrioventricularDist < 0.35) {
        radius -= 0.10 * Math.cos((atrioventricularDist / 0.35) * (Math.PI / 2));
      }

      // Compute final coordinates
      x = nx * radius * apexFactor * 1.05 - 0.32 * Math.pow(vNorm, 1.8);
      y = (1.1 - 2.3 * vNorm);
      z = nz * radius * apexFactor * 0.95 + 0.25 * Math.pow(vNorm, 1.8);

      shellPos.setXYZ(i, x, y, z);
    }
    shellGeo.computeVertexNormals();

    const shellMat = createCorticalShellMaterial("#0F172A");
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    shellMesh.name = "pericardium";
    shellMesh.userData = {
      structureId: "pericardium",
      originalName: "Pericardium & Epicardial Shell",
      category: "pericardium",
      isShell: true,
      color: "#0F172A"
    };
    this.registry.registerStructure("pericardium", shellMesh);
    pivot.add(shellMesh);

    // =========================================================================
    // 2. Left Ventricle (Thick muscular conical core forming apical vortex)
    // Deep plum/wine myocardium matching brain cortical color palette
    // =========================================================================
    const lvGeo = new THREE.SphereGeometry(0.82, 40, 32);
    const lvPos = lvGeo.attributes.position;
    for (let i = 0; i < lvPos.count; i++) {
      let x = lvPos.getX(i);
      let y = lvPos.getY(i);
      let z = lvPos.getZ(i);

      // Conical taper towards apex
      const t = (y + 0.82) / 1.64;
      const taper = 0.38 + 0.62 * t;
      x *= taper * 0.92;
      z *= taper * 0.85;
      y *= 1.35;
      lvPos.setXYZ(i, x, y, z);
    }
    lvGeo.computeVertexNormals();

    const lvMat = createOrganMaterial("#581C87", "#3B0764", 0.08, 0.92);
    const lvMesh = new THREE.Mesh(lvGeo, lvMat);
    lvMesh.name = "left_ventricle";
    lvMesh.position.set(-0.30, -0.38, 0.12);
    lvMesh.rotation.z = 0.24;
    lvMesh.rotation.x = -0.16;
    lvMesh.userData = {
      structureId: "left_ventricle",
      originalName: "Left Ventricle",
      category: "ventricle",
      color: "#581C87"
    };
    this.registry.registerStructure("left_ventricle", lvMesh);
    pivot.add(lvMesh);

    // =========================================================================
    // 3. Right Ventricle (Anterior crescent chamber wrapping around the septum)
    // Deep plum-fuchsia matching brain biological tones
    // =========================================================================
    const rvGeo = new THREE.SphereGeometry(0.72, 36, 32);
    const rvPos = rvGeo.attributes.position;
    for (let i = 0; i < rvPos.count; i++) {
      let x = rvPos.getX(i);
      let y = rvPos.getY(i);
      let z = rvPos.getZ(i);

      const t = (y + 0.72) / 1.44;
      const taper = 0.45 + 0.55 * t;
      // Crescent anterior flattening
      x *= taper * 1.05;
      z = (z * taper + 0.15) * 0.85;
      y *= 1.15;
      rvPos.setXYZ(i, x, y, z);
    }
    rvGeo.computeVertexNormals();

    const rvMat = createOrganMaterial("#4A044E", "#701A75", 0.06, 0.90);
    const rvMesh = new THREE.Mesh(rvGeo, rvMat);
    rvMesh.name = "right_ventricle";
    rvMesh.position.set(0.48, -0.22, 0.38);
    rvMesh.rotation.z = -0.16;
    rvMesh.rotation.y = 0.28;
    rvMesh.userData = {
      structureId: "right_ventricle",
      originalName: "Right Ventricle",
      category: "ventricle",
      color: "#4A044E"
    };
    this.registry.registerStructure("right_ventricle", rvMesh);
    pivot.add(rvMesh);

    // =========================================================================
    // 4. Interventricular Septum (Central muscular partition)
    // Deep indigo core
    // =========================================================================
    const septumGeo = new THREE.BoxGeometry(0.18, 1.25, 0.85, 8, 16, 8);
    const septumMat = createOrganMaterial("#312E81", "#1E1B4B", 0.05, 0.94);
    const septumMesh = new THREE.Mesh(septumGeo, septumMat);
    septumMesh.name = "septum";
    septumMesh.position.set(0.06, -0.30, 0.15);
    septumMesh.rotation.z = 0.18;
    septumMesh.userData = {
      structureId: "septum",
      originalName: "Interventricular Septum",
      category: "septum",
      color: "#312E81"
    };
    this.registry.registerStructure("septum", septumMesh);
    pivot.add(septumMesh);

    // =========================================================================
    // 5. Left Atrium (Posterior chamber receiving 4 pulmonary veins)
    // Deep violet tone
    // =========================================================================
    const laGeo = new THREE.SphereGeometry(0.62, 32, 28);
    const laMat = createOrganMaterial("#2E1065", "#1E1B4B", 0.06, 0.92);
    const laMesh = new THREE.Mesh(laGeo, laMat);
    laMesh.name = "left_atrium";
    laMesh.position.set(-0.35, 0.70, -0.42);
    laMesh.scale.set(1.0, 0.88, 0.92);
    laMesh.userData = {
      structureId: "left_atrium",
      originalName: "Left Atrium",
      category: "atrium",
      color: "#2E1065"
    };
    this.registry.registerStructure("left_atrium", laMesh);
    pivot.add(laMesh);

    // 4 Pulmonary Veins entering Left Atrium
    const pvMat = createOrganMaterial("#2E1065", "#000000", 0.0, 0.95);
    const createPv = (startX, startY, startZ, endX, endY, endZ) => {
      const curve = new THREE.LineCurve3(
        new THREE.Vector3(startX, startY, startZ),
        new THREE.Vector3(endX, endY, endZ)
      );
      return new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.09, 12, false), pvMat);
    };
    pivot.add(createPv(-0.65, 0.85, -0.45, -1.05, 0.95, -0.55));
    pivot.add(createPv(-0.65, 0.60, -0.48, -1.02, 0.62, -0.60));
    pivot.add(createPv(-0.15, 0.85, -0.52, 0.25, 0.92, -0.65));
    pivot.add(createPv(-0.15, 0.60, -0.55, 0.22, 0.62, -0.68));

    // =========================================================================
    // 6. Right Atrium (Anterosuperior chamber with auricle and vena cava orifices)
    // Deep steel-blue conduit matching brainstem
    // =========================================================================
    const raGeo = new THREE.SphereGeometry(0.68, 32, 28);
    const raPos = raGeo.attributes.position;
    for (let i = 0; i < raPos.count; i++) {
      let x = raPos.getX(i);
      let y = raPos.getY(i);
      let z = raPos.getZ(i);
      // Right atrial auricle flap anteriorly
      if (z > 0 && x > 0) {
        z += 0.15 * Math.sin((x / 0.68) * Math.PI);
      }
      raPos.setXYZ(i, x, y, z);
    }
    raGeo.computeVertexNormals();

    const raMat = createOrganMaterial("#1E293B", "#38BDF8", 0.08, 0.92);
    const raMesh = new THREE.Mesh(raGeo, raMat);
    raMesh.name = "right_atrium";
    raMesh.position.set(0.82, 0.62, 0.08);
    raMesh.scale.set(1.02, 1.05, 0.95);
    raMesh.userData = {
      structureId: "right_atrium",
      originalName: "Right Atrium",
      category: "atrium",
      color: "#1E293B"
    };
    this.registry.registerStructure("right_atrium", raMesh);
    pivot.add(raMesh);

    // =========================================================================
    // 7. Ascending Aorta, Aortic Arch & 3 Supra-Aortic Branches
    // Warm amber-bronze diencephalic relay core tone matching thalamus
    // =========================================================================
    const aortaSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.02, 0.42, 0.12),  // Aortic root
      new THREE.Vector3(0.06, 1.15, 0.16),   // Ascending aorta
      new THREE.Vector3(-0.12, 1.75, 0.08),  // Arch summit
      new THREE.Vector3(-0.55, 1.68, -0.32), // Distal arch
      new THREE.Vector3(-0.72, 0.95, -0.52), // Descending thoracic aorta
      new THREE.Vector3(-0.75, -0.45, -0.55)
    ]);
    const aortaMat = createOrganMaterial("#78350F", "#F59E0B", 0.14, 0.95);
    const aortaGeo = new THREE.TubeGeometry(aortaSpline, 48, 0.25, 20, false);

    // Three supra-aortic arch arteries merged with aorta
    const bGeo = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(-0.05, 1.70, 0.10), new THREE.Vector3(0.12, 2.30, 0.08)), 12, 0.085, 14, false);
    const cGeo = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(-0.25, 1.76, 0.02), new THREE.Vector3(-0.22, 2.32, -0.02)), 12, 0.075, 14, false);
    const sGeo = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(-0.45, 1.72, -0.15), new THREE.Vector3(-0.52, 2.28, -0.22)), 12, 0.075, 14, false);
    const mergedAortaGeo = BufferGeometryUtils.mergeGeometries([aortaGeo, bGeo, cGeo, sGeo]);
    const aortaMesh = new THREE.Mesh(mergedAortaGeo, aortaMat);
    aortaMesh.name = "aorta";
    aortaMesh.userData = {
      structureId: "aorta",
      originalName: "Aorta & Aortic Arch",
      category: "vessel",
      color: "#78350F"
    };
    this.registry.registerStructure("aorta", aortaMesh);
    pivot.add(aortaMesh);

    // =========================================================================
    // 8. Pulmonary Artery Trunk & Left/Right Branches
    // Deep cobalt-tinted conduit matching motor strip
    // =========================================================================
    const paTrunkSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.35, 0.38, 0.38),   // Conus arteriosus of RV
      new THREE.Vector3(0.18, 0.95, 0.32),   // Passing anterior to ascending aorta
      new THREE.Vector3(-0.15, 1.35, 0.05)   // Bifurcation under aortic arch
    ]);
    const paTrunkGeo = new THREE.TubeGeometry(paTrunkSpline, 32, 0.22, 18, false);
    const paMat = createOrganMaterial("#082F49", "#0284C7", 0.09, 0.92);

    const leftPaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 1.35, 0.05),
      new THREE.Vector3(-0.55, 1.30, -0.15),
      new THREE.Vector3(-0.95, 1.25, -0.30)
    ]);
    const leftPaGeo = new THREE.TubeGeometry(leftPaCurve, 16, 0.15, 14, false);

    const rightPaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 1.35, 0.05),
      new THREE.Vector3(0.35, 1.25, -0.10),
      new THREE.Vector3(0.85, 1.15, -0.22)
    ]);
    const rightPaGeo = new THREE.TubeGeometry(rightPaCurve, 16, 0.15, 14, false);

    const mergedPaGeo = BufferGeometryUtils.mergeGeometries([paTrunkGeo, leftPaGeo, rightPaGeo]);
    const paMesh = new THREE.Mesh(mergedPaGeo, paMat);
    paMesh.name = "pulmonary_artery";
    paMesh.userData = {
      structureId: "pulmonary_artery",
      originalName: "Pulmonary Artery Trunk & Branches",
      category: "vessel",
      color: "#082F49"
    };
    this.registry.registerStructure("pulmonary_artery", paMesh);
    pivot.add(paMesh);

    // =========================================================================
    // 9. Superior Vena Cava & Inferior Vena Cava
    // Deep obsidian-slate conduit
    // =========================================================================
    const svcSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.88, 0.85, 0.02),
      new THREE.Vector3(0.92, 1.45, -0.02),
      new THREE.Vector3(0.94, 1.95, -0.05)
    ]);
    const svcGeo = new THREE.TubeGeometry(svcSpline, 20, 0.20, 16, false);
    const svcMat = createOrganMaterial("#0F172A", "#3B82F6", 0.08, 0.94);

    const ivcSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.78, 0.35, 0.05),
      new THREE.Vector3(0.80, -0.35, 0.02),
      new THREE.Vector3(0.82, -0.75, 0.00)
    ]);
    const ivcGeo = new THREE.TubeGeometry(ivcSpline, 16, 0.19, 16, false);

    const mergedSvcGeo = BufferGeometryUtils.mergeGeometries([svcGeo, ivcGeo]);
    const svcMesh = new THREE.Mesh(mergedSvcGeo, svcMat);
    svcMesh.name = "superior_vena_cava";
    svcMesh.userData = {
      structureId: "superior_vena_cava",
      originalName: "Superior & Inferior Vena Cava",
      category: "vessel",
      color: "#0F172A"
    };
    this.registry.registerStructure("superior_vena_cava", svcMesh);
    pivot.add(svcMesh);

    // =========================================================================
    // 10. Cardiac Valves (Mitral, Tricuspid, Aortic, Pulmonary Annuli)
    // Pearlescent white matter bridge tone matching corpus callosum
    // =========================================================================
    const valveMat = createOrganMaterial("#F1F5F9", "#CBD5E1", 0.16, 0.96);

    // Mitral Valve annulus (between LA and LV)
    const mitralGeo = new THREE.TorusGeometry(0.32, 0.045, 12, 28);
    const mMatrix = new THREE.Matrix4()
      .makeRotationFromEuler(new THREE.Euler(Math.PI / 2.4, 0.2, 0))
      .setPosition(-0.25, 0.32, -0.15);
    mitralGeo.applyMatrix4(mMatrix);

    // Tricuspid Valve annulus (between RA and RV)
    const tricuspidGeo = new THREE.TorusGeometry(0.35, 0.045, 12, 28);
    const tMatrix = new THREE.Matrix4()
      .makeRotationFromEuler(new THREE.Euler(Math.PI / 2.2, -0.25, 0))
      .setPosition(0.35, 0.22, 0.25);
    tricuspidGeo.applyMatrix4(tMatrix);

    // Aortic Valve annulus
    const aorticGeo = new THREE.TorusGeometry(0.24, 0.04, 12, 28);
    const aMatrix = new THREE.Matrix4()
      .makeRotationFromEuler(new THREE.Euler(Math.PI / 2.1, 0, 0))
      .setPosition(0.00, 0.48, 0.14);
    aorticGeo.applyMatrix4(aMatrix);

    // Pulmonary Valve annulus
    const pulmonaryGeo = new THREE.TorusGeometry(0.22, 0.04, 12, 28);
    const pMatrix = new THREE.Matrix4()
      .makeRotationFromEuler(new THREE.Euler(Math.PI / 2.3, -0.3, 0))
      .setPosition(0.22, 0.60, 0.34);
    pulmonaryGeo.applyMatrix4(pMatrix);

    const mergedValvesGeo = BufferGeometryUtils.mergeGeometries([mitralGeo, tricuspidGeo, aorticGeo, pulmonaryGeo]);
    const valvesMesh = new THREE.Mesh(mergedValvesGeo, valveMat);
    valvesMesh.name = "valves";
    valvesMesh.userData = {
      structureId: "valves",
      originalName: "Cardiac Valves (Mitral, Tricuspid, Aortic, Pulmonary)",
      category: "valve",
      color: "#F1F5F9"
    };
    this.registry.registerStructure("valves", valvesMesh);
    pivot.add(valvesMesh);

    // =========================================================================
    // 11. Coronary Arterial Vasculature (LAD & RCA branches)
    // Warm amber vessel network
    // =========================================================================
    const coronaryMat = createOrganMaterial("#B45309", "#F59E0B", 0.12, 0.95);

    // Left Anterior Descending (LAD) artery tracking anterior interventricular groove
    const ladSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, 0.52, 0.20),
      new THREE.Vector3(0.08, 0.22, 0.38),
      new THREE.Vector3(0.02, -0.15, 0.40),
      new THREE.Vector3(-0.12, -0.55, 0.28),
      new THREE.Vector3(-0.25, -0.85, 0.18)
    ]);
    const ladGeo = new THREE.TubeGeometry(ladSpline, 32, 0.045, 10, false);

    // Right Coronary Artery (RCA) in AV groove
    const rcaSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.12, 0.55, 0.18),
      new THREE.Vector3(0.48, 0.32, 0.30),
      new THREE.Vector3(0.72, 0.05, 0.25),
      new THREE.Vector3(0.65, -0.25, 0.15),
      new THREE.Vector3(0.35, -0.55, -0.05)
    ]);
    const rcaGeo = new THREE.TubeGeometry(rcaSpline, 32, 0.045, 10, false);

    const mergedCoronaryGeo = BufferGeometryUtils.mergeGeometries([ladGeo, rcaGeo]);
    const coronaryMesh = new THREE.Mesh(mergedCoronaryGeo, coronaryMat);
    coronaryMesh.name = "coronary_arteries";
    coronaryMesh.userData = {
      structureId: "coronary_arteries",
      originalName: "Coronary Arteries",
      category: "vessel",
      color: "#B45309"
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
