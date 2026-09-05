import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
    const createOrganMaterial = (colorHex, emissiveHex = "#000000", emissiveInt = 0.0, opacity = 0.95) => {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        emissive: new THREE.Color(emissiveHex),
        emissiveIntensity: emissiveInt,
        roughness: 0.45,
        metalness: 0.12,
        transparent: opacity < 1.0,
        opacity: opacity,
        depthWrite: true,
        side: THREE.DoubleSide
      });
    };

    // Attempt to load external GLB file if present
    this.gltfLoader.load(
      '/anatomical_heart.glb',
      (gltf) => {
        const rawModel = gltf.scene;

        const box = new THREE.Box3().setFromObject(rawModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 3.6 / (maxDim || 1);

        rawModel.position.sub(center);

        const pivot = new THREE.Group();
        pivot.name = "AnatomicalHeartPivot";
        pivot.add(rawModel);
        pivot.scale.set(scaleFactor, scaleFactor, scaleFactor);
        pivot.rotation.y = -Math.PI / 2;
        pivot.updateMatrixWorld(true);

        rawModel.traverse((child) => {
          if (child.isMesh || child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.geometry.computeVertexNormals();

            const childName = (child.name || "").toLowerCase();
            const structureId = this.mapPartNameToStructureId(childName);
            const category = this.getCategoryForStructure(structureId);

            let matColor = "#EF4444";
            if (structureId === 'pulmonary_artery' || structureId === 'superior_vena_cava' || structureId === 'right_atrium') {
              matColor = "#3B82F6";
            }
            if (structureId === 'valves') {
              matColor = "#F8FAFC";
            }

            child.material = createOrganMaterial(matColor);

            child.userData = {
              structureId: structureId,
              originalName: child.name,
              category: category,
              color: matColor
            };

            this.registry.registerStructure(structureId, child);
          }
        });

        this.rootGroup.add(pivot);
        this.onModelLoadedCallbacks.forEach(cb => cb(pivot, rawModel));

        if (onComplete) onComplete(this.rootGroup);
      },
      undefined,
      (err) => {
        console.warn("External /anatomical_heart.glb not found. Constructing 3D Anatomical Heart model directly.", err);
        this.buildProceduralHeart(createOrganMaterial, onComplete);
      }
    );

    return this.rootGroup;
  }

  buildProceduralHeart(createOrganMaterial, onComplete) {
    const pivot = new THREE.Group();
    pivot.name = "AnatomicalHeartPivot";
    pivot.scale.set(1.15, 1.15, 1.15);

    // 1. Left Ventricle (Thick myocardium forming apex)
    const lvGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const lvPos = lvGeo.attributes.position;
    for (let i = 0; i < lvPos.count; i++) {
      let x = lvPos.getX(i);
      let y = lvPos.getY(i);
      let z = lvPos.getZ(i);
      const taper = 0.5 + 0.5 * ((y + 1) / 2);
      x *= taper;
      z *= taper;
      y *= 1.35;
      lvPos.setXYZ(i, x, y, z);
    }
    lvGeo.computeVertexNormals();
    const lvMat = createOrganMaterial("#DC2626");
    const lvMesh = new THREE.Mesh(lvGeo, lvMat);
    lvMesh.name = "left_ventricle";
    lvMesh.position.set(-0.25, -0.4, 0.1);
    lvMesh.rotation.z = 0.22;
    lvMesh.rotation.x = -0.15;
    lvMesh.userData = {
      structureId: "left_ventricle",
      originalName: "Left Ventricle",
      category: "ventricle",
      color: "#DC2626"
    };
    this.registry.registerStructure("left_ventricle", lvMesh);
    pivot.add(lvMesh);

    // 2. Right Ventricle
    const rvGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const rvPos = rvGeo.attributes.position;
    for (let i = 0; i < rvPos.count; i++) {
      let x = rvPos.getX(i);
      let y = rvPos.getY(i);
      let z = rvPos.getZ(i);
      const taper = 0.6 + 0.4 * ((y + 1) / 2);
      x *= taper * 1.1;
      z *= taper * 0.9;
      y *= 1.15;
      rvPos.setXYZ(i, x, y, z);
    }
    rvGeo.computeVertexNormals();
    const rvMat = createOrganMaterial("#E11D48");
    const rvMesh = new THREE.Mesh(rvGeo, rvMat);
    rvMesh.name = "right_ventricle";
    rvMesh.position.set(0.65, -0.25, 0.4);
    rvMesh.rotation.z = -0.18;
    rvMesh.rotation.y = 0.25;
    rvMesh.userData = {
      structureId: "right_ventricle",
      originalName: "Right Ventricle",
      category: "ventricle",
      color: "#E11D48"
    };
    this.registry.registerStructure("right_ventricle", rvMesh);
    pivot.add(rvMesh);

    // 3. Left Atrium
    const laGeo = new THREE.SphereGeometry(0.72, 32, 32);
    const laMat = createOrganMaterial("#B91C1C");
    const laMesh = new THREE.Mesh(laGeo, laMat);
    laMesh.name = "left_atrium";
    laMesh.position.set(-0.35, 0.75, -0.45);
    laMesh.scale.set(1.0, 0.85, 0.95);
    laMesh.userData = {
      structureId: "left_atrium",
      originalName: "Left Atrium",
      category: "atrium",
      color: "#B91C1C"
    };
    this.registry.registerStructure("left_atrium", laMesh);
    pivot.add(laMesh);

    // 4. Right Atrium
    const raGeo = new THREE.SphereGeometry(0.78, 32, 32);
    const raMat = createOrganMaterial("#2563EB");
    const raMesh = new THREE.Mesh(raGeo, raMat);
    raMesh.name = "right_atrium";
    raMesh.position.set(0.95, 0.65, 0.1);
    raMesh.scale.set(1.05, 1.1, 0.95);
    raMesh.userData = {
      structureId: "right_atrium",
      originalName: "Right Atrium",
      category: "atrium",
      color: "#2563EB"
    };
    this.registry.registerStructure("right_atrium", raMesh);
    pivot.add(raMesh);

    // 5. Aorta & Arch
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.05, 0.5, 0.1),
      new THREE.Vector3(0.05, 1.3, 0.15),
      new THREE.Vector3(-0.25, 1.85, 0.0),
      new THREE.Vector3(-0.7, 1.7, -0.35),
      new THREE.Vector3(-0.75, 0.8, -0.55),
      new THREE.Vector3(-0.75, -0.4, -0.55)
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 40, 0.28, 20, false);
    const aortaMat = createOrganMaterial("#DC2626");
    const aortaMesh = new THREE.Mesh(aortaGeo, aortaMat);
    aortaMesh.name = "aorta";
    aortaMesh.userData = {
      structureId: "aorta",
      originalName: "Aorta & Arch",
      category: "vessel",
      color: "#DC2626"
    };
    this.registry.registerStructure("aorta", aortaMesh);
    pivot.add(aortaMesh);

    // Supra-aortic branches
    const branchCurve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 1.75, 0.05),
      new THREE.Vector3(-0.1, 2.25, 0.05)
    ]);
    pivot.add(new THREE.Mesh(new THREE.TubeGeometry(branchCurve1, 10, 0.09, 12, false), aortaMat));

    const branchCurve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.35, 1.8, -0.05),
      new THREE.Vector3(-0.35, 2.25, -0.05)
    ]);
    pivot.add(new THREE.Mesh(new THREE.TubeGeometry(branchCurve2, 10, 0.08, 12, false), aortaMat));

    const branchCurve3 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.52, 1.75, -0.18),
      new THREE.Vector3(-0.55, 2.2, -0.18)
    ]);
    pivot.add(new THREE.Mesh(new THREE.TubeGeometry(branchCurve3, 10, 0.08, 12, false), aortaMat));

    // 6. Pulmonary Artery Trunk
    const paTrunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.4, 0.45, 0.4),
      new THREE.Vector3(0.2, 1.05, 0.35),
      new THREE.Vector3(-0.15, 1.35, 0.05)
    ]);
    const paTrunkGeo = new THREE.TubeGeometry(paTrunkCurve, 25, 0.24, 18, false);
    const paMat = createOrganMaterial("#2563EB");
    const paTrunkMesh = new THREE.Mesh(paTrunkGeo, paMat);
    paTrunkMesh.name = "pulmonary_artery";
    paTrunkMesh.userData = {
      structureId: "pulmonary_artery",
      originalName: "Pulmonary Artery",
      category: "vessel",
      color: "#2563EB"
    };
    this.registry.registerStructure("pulmonary_artery", paTrunkMesh);
    pivot.add(paTrunkMesh);

    // Left and Right Pulmonary Artery branches
    const leftBranch = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 1.35, 0.05),
      new THREE.Vector3(-0.85, 1.25, -0.3)
    ]);
    pivot.add(new THREE.Mesh(new THREE.TubeGeometry(leftBranch, 15, 0.16, 14, false), paMat));

    const rightBranch = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 1.35, 0.05),
      new THREE.Vector3(0.75, 1.15, -0.2)
    ]);
    pivot.add(new THREE.Mesh(new THREE.TubeGeometry(rightBranch, 15, 0.16, 14, false), paMat));

    // 7. Superior Vena Cava
    const svcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.9, 0.9, 0.0),
      new THREE.Vector3(0.9, 1.85, -0.05)
    ]);
    const svcGeo = new THREE.TubeGeometry(svcCurve, 15, 0.22, 16, false);
    const svcMat = createOrganMaterial("#1D4ED8");
    const svcMesh = new THREE.Mesh(svcGeo, svcMat);
    svcMesh.name = "superior_vena_cava";
    svcMesh.userData = {
      structureId: "superior_vena_cava",
      originalName: "Superior Vena Cava",
      category: "vessel",
      color: "#1D4ED8"
    };
    this.registry.registerStructure("superior_vena_cava", svcMesh);
    pivot.add(svcMesh);

    // 8. Cardiac Valves
    const valveGeo = new THREE.TorusGeometry(0.38, 0.06, 12, 32);
    const valveMat = createOrganMaterial("#F8FAFC", "#FFFFFF", 0.1, 0.95);
    const valveMesh = new THREE.Mesh(valveGeo, valveMat);
    valveMesh.name = "valves";
    valveMesh.rotation.x = Math.PI / 2.3;
    valveMesh.position.set(-0.15, 0.25, 0.05);
    valveMesh.userData = {
      structureId: "valves",
      originalName: "Cardiac Valves (Mitral, Tricuspid, Aortic)",
      category: "valve",
      color: "#F8FAFC"
    };
    this.registry.registerStructure("valves", valveMesh);
    pivot.add(valveMesh);

    pivot.rotation.y = -Math.PI / 6;
    pivot.position.set(0, 0, 0);

    this.rootGroup.add(pivot);
    this.onModelLoadedCallbacks.forEach(cb => cb(pivot, pivot));

    if (onComplete) onComplete(this.rootGroup);
  }

  mapPartNameToStructureId(name) {
    if (name.includes("aorta")) return "aorta";
    if (name.includes("pulmonary")) return "pulmonary_artery";
    if (name.includes("left_ventricle") || name.includes("l_ventricle")) return "left_ventricle";
    if (name.includes("right_ventricle") || name.includes("r_ventricle")) return "right_ventricle";
    if (name.includes("left_atrium") || name.includes("l_atrium")) return "left_atrium";
    if (name.includes("right_atrium") || name.includes("r_atrium")) return "right_atrium";
    if (name.includes("cava") || name.includes("svc")) return "superior_vena_cava";
    if (name.includes("valve")) return "valves";
    
    return "left_ventricle"; 
  }

  getCategoryForStructure(structId) {
    if (structId.includes("ventricle")) return "ventricle";
    if (structId.includes("atrium")) return "atrium";
    if (structId.includes("valve")) return "valve";
    return "vessel";
  }
}
