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
      // 1. Translucent Biological Outer Pericardium Shell Material
      const createCorticalShellMaterial = (baseTint = "#BE185D") => {
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color(baseTint),
          roughness: 0.20,
          metalness: 0.15,
          transparent: true,
          opacity: 0.20,
          depthWrite: false,
          side: THREE.DoubleSide
        });
      };

      // 2. High-Fidelity Translucent Biological Chamber & Vessel Materials
      const createOrganMaterial = (colorHex = "#BE185D", emissiveHex = "#000000", emissiveInt = 0.0, opacity = 0.70) => {
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color(colorHex),
          emissive: new THREE.Color(emissiveHex),
          emissiveIntensity: emissiveInt,
          roughness: 0.32,
          metalness: 0.10,
          transparent: true,
          opacity: opacity,
          depthWrite: false,
          side: THREE.DoubleSide
        });
      };

      this.gltfLoader.load(
        '/heart.glb',
        (gltf) => {
          const rawModel = gltf.scene;

          const box = new THREE.Box3().setFromObject(rawModel);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scaleFactor = 3.6 / maxDim;

          rawModel.position.sub(center);

          const heartPivot = new THREE.Group();
          heartPivot.name = "AnatomicalHeartPivot";
          heartPivot.add(rawModel);
          heartPivot.scale.set(scaleFactor, scaleFactor, scaleFactor);
          
          heartPivot.rotation.y = -Math.PI / 7;
          heartPivot.rotation.x = 0.08;
          heartPivot.position.set(0, 0, 0);

          heartPivot.updateMatrixWorld(true);

          const meshesFound = [];
          rawModel.traverse((child) => {
            if (child.isMesh) {
              meshesFound.push(child);
            }
          });

          if (meshesFound.length === 1) {
            // Single unified 3D anatomical heart mesh (e.g. heart.glb)
            const singleMesh = meshesFound[0];
            const style = { color: "#A7B4C2", opacity: 0.45 };
            singleMesh.userData = {
              structureId: "left_ventricle",
              originalName: "Anatomical Human Heart",
              category: "ventricle",
              color: style.color
            };
            singleMesh.material = createOrganMaterial(style.color, "#000000", 0.0, style.opacity);

            // Register under primary structure keys so all UI/animations locate the mesh
            const primaryKeys = ["left_ventricle", "right_ventricle", "septum", "left_atrium", "right_atrium", "pericardium", "aorta", "pulmonary_artery", "superior_vena_cava", "valves", "coronary_arteries"];
            primaryKeys.forEach(key => {
              this.registry.registerStructure(key, singleMesh);
            });
          } else {
            // Multi-part anatomical heart model
            meshesFound.forEach((child) => {
              const partName = (child.name || "").toLowerCase();
              const structId = this.mapPartNameToStructureId(partName);
              const category = this.getCategoryForStructure(structId);
              
              const colorsMap = {
                pericardium: { color: "#667686", opacity: 0.20 },
                left_ventricle: { color: "#A7B4C2", opacity: 0.45 },
                right_ventricle: { color: "#8FA0B2", opacity: 0.45 },
                septum: { color: "#B8C3CE", opacity: 0.50 },
                left_atrium: { color: "#A1AFBC", opacity: 0.42 },
                right_atrium: { color: "#91A2B3", opacity: 0.42 },
                aorta: { color: "#B4BEC8", opacity: 0.52 },
                pulmonary_artery: { color: "#9EADB9", opacity: 0.52 },
                superior_vena_cava: { color: "#899AA9", opacity: 0.52 },
                valves: { color: "#D4DBE2", opacity: 0.65 },
                coronary_arteries: { color: "#C1CAD3", opacity: 0.65 }
              };

              const style = colorsMap[structId] || { color: "#A7B4C2", opacity: 0.45 };

              child.userData = {
                structureId: structId,
                originalName: child.name || "Anatomical Structure",
                category: category,
                color: style.color
              };
              
              if (structId === "pericardium") {
                child.material = createCorticalShellMaterial(style.color);
                child.userData.isShell = true;
              } else {
                child.material = createOrganMaterial(style.color, "#000000", 0.0, style.opacity);
              }

              this.registry.registerStructure(structId, child);
            });
          }

          this.rootGroup.add(heartPivot);
          this.onModelLoadedCallbacks.forEach(cb => cb(heartPivot, heartPivot));

          if (onComplete) onComplete(this.rootGroup);
        },
        undefined,
        (error) => {
          console.warn("External heart.glb loading fallback:", error);
          this.buildAuthenticHeartModel(createCorticalShellMaterial, createOrganMaterial, () => {
            if (onComplete) onComplete(this.rootGroup);
          });
        }
      );
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
    // 1. Outer Epicardial / Pericardium Shell
    // Medically authentic anatomical heart contour:
    // - Asymmetric inverted conical apex pointing forward, down, and to the left
    // - Deep anterior interventricular sulcus (LAD groove) & AV coronary sulcus
    // - Conus arteriosus slope leading up into pulmonary trunk
    // =========================================================================
    const shellGeo = new THREE.SphereGeometry(1.22, 96, 72);
    const shellPos = shellGeo.attributes.position;

    for (let i = 0; i < shellPos.count; i++) {
      let x = shellPos.getX(i);
      let y = shellPos.getY(i);
      let z = shellPos.getZ(i);

      const rOrig = Math.sqrt(x * x + y * y + z * z) || 1;
      const phi = Math.acos(Math.max(-1, Math.min(1, y / rOrig))); // 0 (superior base) to PI (inferior apex)
      const theta = Math.atan2(z, x); // -PI to PI
      const vNorm = phi / Math.PI; // 0 to 1

      let radiusScale = 1.0;

      // Vertical anatomical profile: broad base, conical taper toward acute apex
      const baseBulge = Math.sin(phi * 0.88);
      radiusScale *= (0.32 + 0.78 * baseBulge);

      // Asymmetrical Ventricular Contours:
      // Left ventricle is prominent laterally (theta ~ 1.8 to 3.0),
      // Right ventricle forms the broad anterior sternocostal surface (theta ~ 0.2 to 1.8)
      if (theta > 0.15 && theta < 1.95) {
        // Anterior RV sternocostal wall
        radiusScale += 0.18 * Math.sin((theta - 0.15) / 1.8 * Math.PI);
      } else if (theta >= 1.95 || theta < -2.3) {
        // Left ventricle lateral obtuse margin
        radiusScale += 0.15 * (1.0 - 0.35 * vNorm);
      } else {
        // Posterior flatter diaphragmatic surface
        radiusScale -= 0.14 * Math.sin(Math.abs(theta) * 0.85);
      }

      // Anterior Interventricular Sulcus (LAD groove running diagonally to near apex)
      const sulcusTheta = 0.92 - 0.38 * vNorm;
      const distToSulcus = Math.abs(theta - sulcusTheta);
      if (distToSulcus < 0.42 && vNorm > 0.22 && vNorm < 0.92) {
        const sulcusDepth = 0.16 * Math.cos((distToSulcus / 0.42) * (Math.PI / 2));
        radiusScale -= sulcusDepth;
      }

      // Coronary (Atrioventricular) Sulcus Waist
      const avDist = Math.abs(phi - 0.38 * Math.PI);
      if (avDist < 0.30) {
        radiusScale -= 0.13 * Math.cos((avDist / 0.30) * (Math.PI / 2));
      }

      // Infundibulum / Conus Arteriosus Bulge (RV outflow slope)
      if (Math.abs(theta - 0.62) < 0.42 && vNorm > 0.18 && vNorm < 0.44) {
        radiusScale += 0.14 * Math.cos((Math.abs(theta - 0.62) / 0.42) * (Math.PI / 2));
      }

      // Organic surface anatomical muscular contour micro-variation
      const organicMuscularContour = 0.02 * Math.sin(theta * 3.0) * Math.cos(phi * 4.0);
      radiusScale += organicMuscularContour;

      // Real cardiac apex points down (-Y), forward (+Z), and to the left (-X)
      const apexDisplace = Math.pow(vNorm, 1.82);
      x = (x / rOrig) * radiusScale * 1.06 - 0.40 * apexDisplace;
      y = (1.06 - 2.28 * vNorm);
      z = (z / rOrig) * radiusScale * 0.96 + 0.30 * apexDisplace;

      shellPos.setXYZ(i, x, y, z);
    }
    shellGeo.computeVertexNormals();

    const shellMat = createCorticalShellMaterial("#667686");
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    shellMesh.name = "pericardium";
    shellMesh.userData = {
      structureId: "pericardium",
      originalName: "Pericardium & Epicardial Shell",
      category: "pericardium",
      isShell: true,
      color: "#667686"
    };
    this.registry.registerStructure("pericardium", shellMesh);
    pivot.add(shellMesh);

    // =========================================================================
    // 2. Left Ventricle (#A7B4C2)
    // Muscular, thick-walled elongated conical chamber forming apical vortex
    // =========================================================================
    const lvGeo = new THREE.CylinderGeometry(0.56, 0.13, 1.50, 44, 32, false);
    const lvPos = lvGeo.attributes.position;
    for (let i = 0; i < lvPos.count; i++) {
      let x = lvPos.getX(i);
      let y = lvPos.getY(i);
      let z = lvPos.getZ(i);
      const t = (y + 0.75) / 1.50; // 0 (apex) to 1 (base)
      
      // Muscular tapering cross section
      x *= (0.36 + 0.64 * Math.sin(t * Math.PI * 0.90)) * 1.10;
      z *= (0.34 + 0.66 * Math.sin(t * Math.PI * 0.90)) * 0.90;

      // Apical vortex curve extending down-left-forward
      if (t < 0.36) {
        x -= 0.15 * Math.pow(1.0 - t / 0.36, 1.5);
        z += 0.11 * Math.pow(1.0 - t / 0.36, 1.5);
      }

      lvPos.setXYZ(i, x, y, z);
    }
    lvGeo.computeVertexNormals();

    const lvMat = createOrganMaterial("#A7B4C2", "#000000", 0.0, 0.45);
    const lvMesh = new THREE.Mesh(lvGeo, lvMat);
    lvMesh.name = "left_ventricle";
    lvMesh.position.set(-0.34, -0.34, 0.18);
    lvMesh.rotation.z = 0.24;
    lvMesh.rotation.x = -0.16;
    lvMesh.userData = {
      structureId: "left_ventricle",
      originalName: "Left Ventricle",
      category: "ventricle",
      color: "#A7B4C2"
    };
    this.registry.registerStructure("left_ventricle", lvMesh);
    pivot.add(lvMesh);

    // =========================================================================
    // 3. Right Ventricle (#8FA0B2)
    // Crescentic anterior pocket wrapping around LV septum, extending into infundibulum
    // =========================================================================
    const rvGeo = new THREE.CylinderGeometry(0.64, 0.25, 1.20, 44, 30, false);
    const rvPos = rvGeo.attributes.position;
    for (let i = 0; i < rvPos.count; i++) {
      let x = rvPos.getX(i);
      let y = rvPos.getY(i);
      let z = rvPos.getZ(i);
      const t = (y + 0.60) / 1.20;
      
      // Sculpt into authentic crescentic pocket wrapping anteriorly
      const crescentCurve = 0.29 * Math.sin(t * Math.PI);
      z += crescentCurve + 0.15;
      x *= (0.60 + 0.40 * t);

      // Superior infundibular funneling towards pulmonary valve
      if (t > 0.66) {
        const infFactor = (t - 0.66) / 0.34;
        x -= 0.19 * infFactor;
        z += 0.13 * infFactor;
      }

      rvPos.setXYZ(i, x, y, z);
    }
    rvGeo.computeVertexNormals();

    const rvMat = createOrganMaterial("#8FA0B2", "#000000", 0.0, 0.45);
    const rvMesh = new THREE.Mesh(rvGeo, rvMat);
    rvMesh.name = "right_ventricle";
    rvMesh.position.set(0.36, -0.20, 0.38);
    rvMesh.rotation.z = -0.18;
    rvMesh.rotation.y = 0.26;
    rvMesh.userData = {
      structureId: "right_ventricle",
      originalName: "Right Ventricle & Infundibulum",
      category: "ventricle",
      color: "#8FA0B2"
    };
    this.registry.registerStructure("right_ventricle", rvMesh);
    pivot.add(rvMesh);

    // =========================================================================
    // 4. Interventricular Septum (#B8C3CE)
    // Curved muscular partition convex into RV cavity
    // =========================================================================
    const septumGeo = new THREE.CylinderGeometry(0.50, 0.28, 1.24, 28, 20, false, 0, Math.PI * 0.88);
    const septumPos = septumGeo.attributes.position;
    for (let i = 0; i < septumPos.count; i++) {
      let x = septumPos.getX(i);
      let y = septumPos.getY(i);
      let z = septumPos.getZ(i);
      z = z * 0.35 + 0.06;
      x = x * 0.50;
      septumPos.setXYZ(i, x, y, z);
    }
    septumGeo.computeVertexNormals();

    const septumMat = createOrganMaterial("#B8C3CE", "#000000", 0.0, 0.50);
    const septumMesh = new THREE.Mesh(septumGeo, septumMat);
    septumMesh.name = "septum";
    septumMesh.position.set(0.04, -0.30, 0.18);
    septumMesh.rotation.z = 0.16;
    septumMesh.userData = {
      structureId: "septum",
      originalName: "Interventricular Septum",
      category: "septum",
      color: "#B8C3CE"
    };
    this.registry.registerStructure("septum", septumMesh);
    pivot.add(septumMesh);

    // =========================================================================
    // 5. Left Atrium & Left Auricle Appendage (#A1AFBC)
    // Posterior chamber above LV base + anteriorly curving left auricle
    // =========================================================================
    const laBodyGeo = new THREE.SphereGeometry(0.58, 40, 28);
    const laBodyPos = laBodyGeo.attributes.position;
    for (let i = 0; i < laBodyPos.count; i++) {
      let x = laBodyPos.getX(i);
      let y = laBodyPos.getY(i);
      let z = laBodyPos.getZ(i);
      x *= 1.08;
      y *= 0.85;
      z *= 0.92;
      laBodyPos.setXYZ(i, x, y, z);
    }
    laBodyGeo.computeVertexNormals();
    const laBodyMatrix = new THREE.Matrix4().setPosition(-0.28, 0.68, -0.38);
    laBodyGeo.applyMatrix4(laBodyMatrix);

    const laAuricleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.48, 0.65, -0.15),
      new THREE.Vector3(-0.56, 0.62, 0.05),
      new THREE.Vector3(-0.44, 0.55, 0.24),
      new THREE.Vector3(-0.28, 0.48, 0.30)
    ]);
    const laAuricleGeo = new THREE.TubeGeometry(laAuricleCurve, 24, 0.11, 14, false);

    const pv1 = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(-0.55, 0.82, -0.45), new THREE.Vector3(-0.95, 0.90, -0.58)), 12, 0.08, 12, false);
    const pv2 = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(-0.55, 0.58, -0.48), new THREE.Vector3(-0.92, 0.58, -0.62)), 12, 0.08, 12, false);
    const pv3 = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(-0.02, 0.82, -0.50), new THREE.Vector3(0.35, 0.88, -0.65)), 12, 0.08, 12, false);
    const pv4 = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(-0.02, 0.58, -0.52), new THREE.Vector3(0.32, 0.58, -0.68)), 12, 0.08, 12, false);

    const mergedLaGeo = BufferGeometryUtils.mergeGeometries([laBodyGeo, laAuricleGeo, pv1, pv2, pv3, pv4]);
    const laMat = createOrganMaterial("#A1AFBC", "#000000", 0.0, 0.42);
    const laMesh = new THREE.Mesh(mergedLaGeo, laMat);
    laMesh.name = "left_atrium";
    laMesh.userData = {
      structureId: "left_atrium",
      originalName: "Left Atrium & Auricle",
      category: "atrium",
      color: "#A1AFBC"
    };
    this.registry.registerStructure("left_atrium", laMesh);
    pivot.add(laMesh);

    // =========================================================================
    // 6. Right Atrium & Right Auricle Appendage (#91A2B3)
    // Right border sinus venosus chamber + triangular right auricle flap
    // =========================================================================
    const raBodyGeo = new THREE.SphereGeometry(0.62, 40, 28);
    const raBodyPos = raBodyGeo.attributes.position;
    for (let i = 0; i < raBodyPos.count; i++) {
      let x = raBodyPos.getX(i);
      let y = raBodyPos.getY(i);
      let z = raBodyPos.getZ(i);
      y *= 1.24;
      x *= 0.94;
      z *= 0.90;
      raBodyPos.setXYZ(i, x, y, z);
    }
    raBodyGeo.computeVertexNormals();
    const raBodyMatrix = new THREE.Matrix4().setPosition(0.76, 0.52, 0.06);
    raBodyGeo.applyMatrix4(raBodyMatrix);

    const raAuricleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.65, 0.68, 0.15),
      new THREE.Vector3(0.48, 0.65, 0.28),
      new THREE.Vector3(0.28, 0.58, 0.32),
      new THREE.Vector3(0.12, 0.50, 0.30)
    ]);
    const raAuricleGeo = new THREE.TubeGeometry(raAuricleCurve, 24, 0.12, 14, false);

    const mergedRaGeo = BufferGeometryUtils.mergeGeometries([raBodyGeo, raAuricleGeo]);
    const raMat = createOrganMaterial("#91A2B3", "#000000", 0.0, 0.42);
    const raMesh = new THREE.Mesh(mergedRaGeo, raMat);
    raMesh.name = "right_atrium";
    raMesh.userData = {
      structureId: "right_atrium",
      originalName: "Right Atrium & Auricle",
      category: "atrium",
      color: "#91A2B3"
    };
    this.registry.registerStructure("right_atrium", raMesh);
    pivot.add(raMesh);

    // =========================================================================
    // 7. Ascending Aorta, Aortic Arch & 3 Supra-Aortic Branches (#B4BEC8)
    // Originates from LV outflow behind pulmonary trunk, arches gracefully
    // =========================================================================
    const aortaSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.00, 0.35, 0.10),   // Aortic root
      new THREE.Vector3(0.08, 1.12, 0.14),   // Ascending aorta
      new THREE.Vector3(-0.16, 1.76, 0.06),  // Aortic arch summit
      new THREE.Vector3(-0.54, 1.58, -0.28), // Distal arch
      new THREE.Vector3(-0.70, 0.82, -0.46), // Descending thoracic aorta
      new THREE.Vector3(-0.74, -0.38, -0.48)
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaSpline, 60, 0.23, 24, false);

    const bGeo = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0.00, 1.68, 0.08), new THREE.Vector3(0.18, 2.28, 0.06)), 16, 0.082, 14, false);
    const cGeo = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(-0.20, 1.74, 0.02), new THREE.Vector3(-0.18, 2.30, -0.02)), 16, 0.072, 14, false);
    const sGeo = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(-0.38, 1.70, -0.10), new THREE.Vector3(-0.45, 2.26, -0.18)), 16, 0.072, 14, false);

    const mergedAortaGeo = BufferGeometryUtils.mergeGeometries([aortaGeo, bGeo, cGeo, sGeo]);
    const aortaMat = createOrganMaterial("#B4BEC8", "#000000", 0.0, 0.52);
    const aortaMesh = new THREE.Mesh(mergedAortaGeo, aortaMat);
    aortaMesh.name = "aorta";
    aortaMesh.userData = {
      structureId: "aorta",
      originalName: "Aorta & Aortic Arch",
      category: "vessel",
      color: "#B4BEC8"
    };
    this.registry.registerStructure("aorta", aortaMesh);
    pivot.add(aortaMesh);

    // =========================================================================
    // 8. Pulmonary Artery Trunk & Branches (#9EADB9)
    // Originates anteriorly from conus arteriosus, crosses in front of ascending aorta
    // =========================================================================
    const paTrunkSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.24, 0.38, 0.36),   // Conus arteriosus of RV
      new THREE.Vector3(0.14, 0.92, 0.28),   // Passing anterior to ascending aorta
      new THREE.Vector3(-0.14, 1.30, 0.08)   // Bifurcation under aortic arch
    ]);
    const paTrunkGeo = new THREE.TubeGeometry(paTrunkSpline, 40, 0.21, 20, false);

    const leftPaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.14, 1.30, 0.08),
      new THREE.Vector3(-0.52, 1.26, -0.12),
      new THREE.Vector3(-0.85, 1.22, -0.26)
    ]);
    const leftPaGeo = new THREE.TubeGeometry(leftPaCurve, 20, 0.13, 14, false);

    const rightPaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.14, 1.30, 0.08),
      new THREE.Vector3(0.32, 1.24, -0.06),
      new THREE.Vector3(0.80, 1.18, -0.18)
    ]);
    const rightPaGeo = new THREE.TubeGeometry(rightPaCurve, 20, 0.13, 14, false);

    const mergedPaGeo = BufferGeometryUtils.mergeGeometries([paTrunkGeo, leftPaGeo, rightPaGeo]);
    const paMat = createOrganMaterial("#9EADB9", "#000000", 0.0, 0.52);
    const paMesh = new THREE.Mesh(mergedPaGeo, paMat);
    paMesh.name = "pulmonary_artery";
    paMesh.userData = {
      structureId: "pulmonary_artery",
      originalName: "Pulmonary Artery Trunk & Branches",
      category: "vessel",
      color: "#9EADB9"
    };
    this.registry.registerStructure("pulmonary_artery", paMesh);
    pivot.add(paMesh);

    // =========================================================================
    // 9. Superior Vena Cava & Inferior Vena Cava (#899AA9)
    // Systemic venous trunks entering posterior right atrium
    // =========================================================================
    const svcSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.82, 0.85, 0.02),
      new THREE.Vector3(0.82, 1.44, -0.02),
      new THREE.Vector3(0.82, 1.98, -0.04)
    ]);
    const svcGeo = new THREE.TubeGeometry(svcSpline, 24, 0.18, 18, false);

    const ivcSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.76, 0.20, 0.02),
      new THREE.Vector3(0.76, -0.34, 0.01),
      new THREE.Vector3(0.76, -0.78, 0.00)
    ]);
    const ivcGeo = new THREE.TubeGeometry(ivcSpline, 20, 0.17, 18, false);

    const mergedSvcGeo = BufferGeometryUtils.mergeGeometries([svcGeo, ivcGeo]);
    const svcMat = createOrganMaterial("#899AA9", "#000000", 0.0, 0.52);
    const svcMesh = new THREE.Mesh(mergedSvcGeo, svcMat);
    svcMesh.name = "superior_vena_cava";
    svcMesh.userData = {
      structureId: "superior_vena_cava",
      originalName: "Superior & Inferior Vena Cava",
      category: "vessel",
      color: "#899AA9"
    };
    this.registry.registerStructure("superior_vena_cava", svcMesh);
    pivot.add(svcMesh);

    // =========================================================================
    // 10. Cardiac Valves (#D4DBE2)
    // Mitral, Tricuspid, Aortic, Pulmonary annuli
    // =========================================================================
    const valveMat = createOrganMaterial("#D4DBE2", "#000000", 0.0, 0.65);

    const mitralGeo = new THREE.TorusGeometry(0.30, 0.04, 16, 30);
    const mMatrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI / 2.3, 0.22, 0)).setPosition(-0.24, 0.30, -0.12);
    mitralGeo.applyMatrix4(mMatrix);

    const tricuspidGeo = new THREE.TorusGeometry(0.34, 0.04, 16, 30);
    const tMatrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI / 2.2, -0.22, 0)).setPosition(0.32, 0.22, 0.22);
    tricuspidGeo.applyMatrix4(tMatrix);

    const aorticGeo = new THREE.TorusGeometry(0.24, 0.038, 16, 30);
    const aMatrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI / 2.1, 0.05, 0)).setPosition(0.00, 0.40, 0.12);
    aorticGeo.applyMatrix4(aMatrix);

    const pulmonaryGeo = new THREE.TorusGeometry(0.22, 0.036, 16, 30);
    const pMatrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI / 2.3, -0.28, 0)).setPosition(0.20, 0.52, 0.32);
    pulmonaryGeo.applyMatrix4(pMatrix);

    const mergedValvesGeo = BufferGeometryUtils.mergeGeometries([mitralGeo, tricuspidGeo, aorticGeo, pulmonaryGeo]);
    const valvesMesh = new THREE.Mesh(mergedValvesGeo, valveMat);
    valvesMesh.name = "valves";
    valvesMesh.userData = {
      structureId: "valves",
      originalName: "Cardiac Valves (Mitral, Tricuspid, Aortic, Pulmonary)",
      category: "valve",
      color: "#D4DBE2"
    };
    this.registry.registerStructure("valves", valvesMesh);
    pivot.add(valvesMesh);

    // =========================================================================
    // 11. Coronary Arteries (#C1CAD3)
    // LAD, LCx, RCA with natural sulcal curves
    // =========================================================================
    const coronaryMat = createOrganMaterial("#C1CAD3", "#000000", 0.0, 0.65);

    const ladSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.06, 0.48, 0.24),
      new THREE.Vector3(0.04, 0.22, 0.38),
      new THREE.Vector3(-0.02, -0.12, 0.38),
      new THREE.Vector3(-0.16, -0.52, 0.32),
      new THREE.Vector3(-0.32, -0.80, 0.24)
    ]);
    const ladGeo = new THREE.TubeGeometry(ladSpline, 38, 0.040, 12, false);

    const diagSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.05, 0.38),
      new THREE.Vector3(-0.22, -0.15, 0.35),
      new THREE.Vector3(-0.45, -0.38, 0.26)
    ]);
    const diagGeo = new THREE.TubeGeometry(diagSpline, 18, 0.028, 10, false);

    const lcxSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.06, 0.48, 0.24),
      new THREE.Vector3(-0.35, 0.38, 0.15),
      new THREE.Vector3(-0.52, 0.28, -0.10),
      new THREE.Vector3(-0.48, 0.05, -0.28)
    ]);
    const lcxGeo = new THREE.TubeGeometry(lcxSpline, 22, 0.033, 10, false);

    const rcaSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.12, 0.48, 0.20),
      new THREE.Vector3(0.45, 0.30, 0.30),
      new THREE.Vector3(0.68, 0.08, 0.24),
      new THREE.Vector3(0.64, -0.22, 0.14),
      new THREE.Vector3(0.35, -0.52, -0.04)
    ]);
    const rcaGeo = new THREE.TubeGeometry(rcaSpline, 34, 0.040, 12, false);

    const margSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.66, -0.05, 0.20),
      new THREE.Vector3(0.55, -0.25, 0.28),
      new THREE.Vector3(0.28, -0.50, 0.26)
    ]);
    const margGeo = new THREE.TubeGeometry(margSpline, 18, 0.028, 10, false);

    const mergedCoronaryGeo = BufferGeometryUtils.mergeGeometries([ladGeo, diagGeo, lcxGeo, rcaGeo, margGeo]);
    const coronaryMesh = new THREE.Mesh(mergedCoronaryGeo, coronaryMat);
    coronaryMesh.name = "coronary_arteries";
    coronaryMesh.userData = {
      structureId: "coronary_arteries",
      originalName: "Coronary Arteries (LAD, LCx, RCA)",
      category: "vessel",
      color: "#C1CAD3"
    };
    this.registry.registerStructure("coronary_arteries", coronaryMesh);
    pivot.add(coronaryMesh);

    // Thoracic cardiac axis orientation: 18 degree anatomical tilt
    pivot.rotation.y = -Math.PI / 7;
    pivot.rotation.x = 0.08;
    pivot.position.set(0, 0, 0);

    this.rootGroup.add(pivot);
    this.onModelLoadedCallbacks.forEach(cb => cb(pivot, pivot));

    if (onComplete) onComplete(this.rootGroup);
  }

  mapPartNameToStructureId(name) {
    const n = (name || "").toLowerCase();
    if (n.includes("pericard") || n.includes("shell") || n.includes("epicard")) return "pericardium";
    if (n.includes("aorta")) return "aorta";
    if (n.includes("pulmonary_artery") || n.includes("pulmonary_trunk") || (n.includes("pulmonary") && !n.includes("valve"))) return "pulmonary_artery";
    if (n.includes("left") && n.includes("ventricle")) return "left_ventricle";
    if (n.includes("right") && n.includes("ventricle")) return "right_ventricle";
    if (n.includes("left") && (n.includes("atrium") || n.includes("cardiac_atrium"))) return "left_atrium";
    if (n.includes("right") && (n.includes("atrium") || n.includes("cardiac_atrium"))) return "right_atrium";
    if (n.includes("septum") || n.includes("papillary")) return "septum";
    if (n.includes("cava") || n.includes("svc") || n.includes("ivc")) return "superior_vena_cava";
    if (n.includes("valve")) return "valves";
    if (n.includes("coronary")) return "coronary_arteries";
    
    return "left_ventricle";
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
