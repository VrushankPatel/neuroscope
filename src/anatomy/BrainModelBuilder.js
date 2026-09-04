import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class BrainModelBuilder {
  constructor(registry) {
    this.registry = registry;
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = "HumanBrainRoot";
    this.gltfLoader = new GLTFLoader();
    this.onModelLoadedCallbacks = [];
  }

  onModelLoaded(cb) {
    this.onModelLoadedCallbacks.push(cb);
  }

  loadRealBrainModel(onComplete, onError) {
    // 1. Sleek Smoked-Glass Biological Outer Cortical Shell Material
    // Deep obsidian-navy translucent glass: eliminates the muddy milky-white fog
    // while keeping realistic cortical gyri and sulci silhouettes
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

    // 2. High-Contrast Anatomical Core Materials for Internal Organs
    const createOrganMaterial = (colorHex, emissiveHex = "#000000", emissiveInt = 0.0, opacity = 0.9) => {
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

    this.gltfLoader.load(
      '/anatomical_brain.glb',
      (gltf) => {
        const rawModel = gltf.scene;

        // Calculate bounding box and center
        const box = new THREE.Box3().setFromObject(rawModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 3.6 / maxDim;

        rawModel.position.sub(center);

        const brainPivot = new THREE.Group();
        brainPivot.name = "AnatomicalBrainPivot";
        brainPivot.add(rawModel);
        brainPivot.scale.set(scaleFactor, scaleFactor, scaleFactor);
        brainPivot.rotation.y = -Math.PI / 2; // Anatomical neurological orientation
        brainPivot.updateMatrixWorld(true);

        // Register all 12 authentic anatomical structures with rich distinct biological tones
        rawModel.traverse((child) => {
          if (child.isMesh || child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.geometry.computeVertexNormals();

            const childName = (child.name || "").toLowerCase();
            const structureId = this.mapPartNameToStructureId(childName);
            const category = this.getCategoryForStructure(structureId);

            // Assign distinct biological materials based on anatomical organ role
            if (structureId === 'brainstem') {
              // Deep distinct steel-blue conduit
              child.material = createOrganMaterial("#1E293B", "#38BDF8", 0.08, 0.92);
            } else if (structureId === 'cerebellum') {
              // Organic sage-tinted hindbrain
              child.material = createOrganMaterial("#132A22", "#10B981", 0.06, 0.90);
            } else if (structureId === 'corpus_callosum') {
              // Pearlescent white matter bridge arch
              child.material = createOrganMaterial("#F1F5F9", "#CBD5E1", 0.12, 0.95);
            } else if (structureId === 'thalamus') {
              // Warm amber-bronze diencephalic relay core
              child.material = createOrganMaterial("#78350F", "#F59E0B", 0.15, 0.95);
            } else if (structureId === 'primary_motor_cortex' || structureId === 'premotor_cortex') {
              // Deep cobalt-tinted motor strip
              child.material = createCorticalShellMaterial("#082F49");
            } else if (structureId === 'primary_somatosensory_cortex') {
              // Deep bronze-amber sensory strip
              child.material = createCorticalShellMaterial("#331805");
            } else if (structureId === 'wernicke_area' || structureId === 'temporal_association_cortex') {
              // Deep plum-violet temporal lobe
              child.material = createCorticalShellMaterial("#2E1065");
            } else if (structureId === 'primary_visual_cortex') {
              // Deep indigo-slate occipital lobe
              child.material = createCorticalShellMaterial("#1E1B4B");
            } else {
              // Smoked obsidian frontal lobe
              child.material = createCorticalShellMaterial("#0F172A");
            }

            child.userData = {
              structureId: structureId,
              originalName: child.name,
              category: category,
              color: this.getSemanticColorForStructure(structureId)
            };

            this.registry.registerStructure(structureId, child);
          }
        });

        this.rootGroup.add(brainPivot);

        // Notify callbacks with model and pivot for neural network sampling
        this.onModelLoadedCallbacks.forEach(cb => cb(brainPivot, rawModel));

        if (onComplete) onComplete(this.rootGroup);
      },
      undefined,
      (err) => {
        console.error("Error loading /anatomical_brain.glb:", err);
        if (onError) onError(err);
      }
    );

    return this.rootGroup;
  }

  mapPartNameToStructureId(name) {
    if (name.includes("process_left")) return "primary_motor_cortex";
    if (name.includes("process_right")) return "premotor_cortex";
    if (name.includes("affective")) return "primary_visual_cortex";
    if (name.includes("analytic")) return "primary_somatosensory_cortex";
    if (name.includes("semantic_left")) return "wernicke_area";
    if (name.includes("semantic_right")) return "temporal_association_cortex";
    if (name.includes("episodic_left")) return "prefrontal_cortex";
    if (name.includes("episodic_right")) return "broca_area";
    if (name.includes("bridge")) return "corpus_callosum";
    if (name.includes("brainstem")) return "brainstem";
    if (name.includes("cerebellum")) return "cerebellum";
    if (name.includes("amygdala")) return "thalamus";

    return "primary_motor_cortex";
  }

  getCategoryForStructure(structId) {
    if ([
      "primary_motor_cortex", "premotor_cortex", "prefrontal_cortex", "broca_area",
      "primary_somatosensory_cortex", "wernicke_area", "primary_visual_cortex", "temporal_association_cortex"
    ].includes(structId)) {
      return "cortical_region";
    }
    if (["thalamus", "basal_ganglia", "hippocampus"].includes(structId)) {
      return "subcortical_nuclei";
    }
    if (structId === "corpus_callosum") return "white_matter_tract";
    if (structId === "cerebellum") return "hindbrain";
    if (structId === "brainstem") return "brainstem";
    return "cortical_region";
  }

  getSemanticColorForStructure(structId) {
    const map = {
      primary_motor_cortex: "#00E5FF",
      premotor_cortex: "#00E5FF",
      prefrontal_cortex: "#A855F7",
      broca_area: "#A855F7",
      primary_somatosensory_cortex: "#FFB300",
      wernicke_area: "#A855F7",
      temporal_association_cortex: "#A855F7",
      primary_visual_cortex: "#FFB300",
      thalamus: "#FFB300",
      corpus_callosum: "#F1F5F9",
      cerebellum: "#10B981",
      brainstem: "#38BDF8"
    };
    return map[structId] || "#00E5FF";
  }
}
