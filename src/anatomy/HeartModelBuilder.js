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
        roughness: 0.5,
        metalness: 0.1,
        transparent: opacity < 1.0,
        opacity: opacity,
        depthWrite: true,
        side: THREE.DoubleSide
      });
    };

    this.gltfLoader.load(
      '/anatomical_heart.glb',
      (gltf) => {
        const rawModel = gltf.scene;

        const box = new THREE.Box3().setFromObject(rawModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 3.6 / maxDim;

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

            let matColor = "#EF4444"; // default red
            if (structureId === 'pulmonary_artery' || structureId === 'superior_vena_cava' || structureId === 'right_atrium' || structureId === 'right_ventricle') {
              matColor = "#3B82F6"; // blue
            }
            if (structureId === 'valves') {
              matColor = "#F8FAFC"; // white/translucent
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
        console.error("Error loading /anatomical_heart.glb:", err);
        if (onError) onError(err);
      }
    );

    return this.rootGroup;
  }

  mapPartNameToStructureId(name) {
    if (name.includes("aorta")) return "aorta";
    if (name.includes("pulmonary")) return "pulmonary_artery";
    if (name.includes("left_ventricle") || name.includes("l_ventricle")) return "left_ventricle";
    if (name.includes("right_ventricle") || name.includes("r_ventricle")) return "right_ventricle";
    if (name.includes("left_atrium") || name.includes("l_atrium")) return "left_atrium";
    if (name.includes("right_atrium") || name.includes("r_atrium")) return "right_atrium";
    if (name.includes("cava")) return "superior_vena_cava";
    if (name.includes("valve")) return "valves";
    
    // Default fallback based on random assignment if unknown
    return "left_ventricle"; 
  }

  getCategoryForStructure(structId) {
    if (structId.includes("ventricle")) return "ventricle";
    if (structId.includes("atrium")) return "atrium";
    if (structId.includes("valve")) return "valve";
    return "vessel";
  }
}
