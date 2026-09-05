import * as THREE from 'three';

export class AnatomicalAssetRegistry {
  constructor() {
    this.structureMap = new Map(); // structureId -> THREE.Mesh
    this.originalMaterials = new Map();
    this.selectedStructureId = null;
    this.hoveredStructureId = null;
  }

  registerStructure(structureId, mesh) {
    if (!mesh) return;
    this.structureMap.set(structureId, mesh);

    let mat = mesh.material;
    if (!mat && mesh.children && mesh.children.length > 0) {
      mesh.traverse(child => {
        if (!mat && child.material) mat = child.material;
      });
      if (mat) mesh.material = mat;
    }

    if (mat) {
      this.originalMaterials.set(structureId, {
        opacity: mat.opacity !== undefined ? mat.opacity : 1.0,
        transparent: !!mat.transparent,
        color: mat.color ? mat.color.clone() : new THREE.Color(0xffffff)
      });
    } else {
      this.originalMaterials.set(structureId, {
        opacity: 1.0,
        transparent: false,
        color: new THREE.Color(0xffffff)
      });
    }
  }

  getStructure(structureId) {
    return this.structureMap.get(structureId);
  }

  getAllMeshes() {
    return Array.from(this.structureMap.values());
  }

  isShellMesh(mesh) {
    if (!mesh || !mesh.userData) return false;
    const cat = mesh.userData.category;
    return cat === 'cortical_region' || cat === 'shell' || cat === 'pericardium' || !!mesh.userData.isShell;
  }

  setCortexOpacity(opacityValue) {
    for (const [id, mesh] of this.structureMap.entries()) {
      if (this.isShellMesh(mesh)) {
        const newOp = Math.max(0.04, opacityValue);
        mesh.material.transparent = newOp < 0.99;
        mesh.material.opacity = newOp;
        mesh.material.depthWrite = false;
        mesh.material.needsUpdate = true;
        
        const orig = this.originalMaterials.get(id);
        if (orig) {
          orig.opacity = newOp;
          orig.transparent = mesh.material.transparent;
        }
      }
    }
  }

  setHoveredStructure(structureId) {
    if (this.hoveredStructureId === structureId) return;

    // Clear previous hover if not selected
    if (this.hoveredStructureId && this.hoveredStructureId !== this.selectedStructureId) {
      const prevMesh = this.structureMap.get(this.hoveredStructureId);
      if (prevMesh) {
        prevMesh.material.emissive.setHex(0x000000);
        prevMesh.material.emissiveIntensity = 0.0;
        const orig = this.originalMaterials.get(this.hoveredStructureId);
        if (orig && this.isShellMesh(prevMesh)) {
          prevMesh.material.opacity = orig.opacity;
        }
      }
    }

    this.hoveredStructureId = structureId;
    if (!structureId) return;

    const mesh = this.structureMap.get(structureId);
    if (!mesh) return;

    // Apply subtle hover glow using current color
    mesh.material.emissive = mesh.material.color.clone();
    mesh.material.emissiveIntensity = 0.25;
    
    // Adjust opacity for visual feedback: +/- 25% based on current state
    const orig = this.originalMaterials.get(structureId);
    if (orig && this.isShellMesh(mesh)) {
      const baseOpacity = orig.opacity;
      if (baseOpacity > 0.5) {
        mesh.material.opacity = Math.max(0.05, baseOpacity - 0.25);
      } else {
        mesh.material.opacity = Math.min(1.0, baseOpacity + 0.25);
      }
    }
    mesh.material.needsUpdate = true;
  }

  clearHover() {
    if (this.hoveredStructureId && this.hoveredStructureId !== this.selectedStructureId) {
      const mesh = this.structureMap.get(this.hoveredStructureId);
      if (mesh) {
        mesh.material.emissive.setHex(0x000000);
        mesh.material.emissiveIntensity = 0.0;
        const orig = this.originalMaterials.get(this.hoveredStructureId);
        if (orig && this.isShellMesh(mesh)) {
          mesh.material.opacity = orig.opacity;
        }
        mesh.material.needsUpdate = true;
      }
    }
    this.hoveredStructureId = null;
  }

  highlightStructure(structureId) {
    this.clearHighlights();
    const mesh = this.structureMap.get(structureId);
    if (!mesh) return;

    this.selectedStructureId = structureId;
    
    // Use base color for highlight instead of semantic color
    mesh.material.emissive = mesh.material.color.clone();
    mesh.material.emissiveIntensity = 0.50; // 50% intensity for active structures
    
    // Adjust opacity for visual feedback: +/- 50% based on current state
    const orig = this.originalMaterials.get(structureId);
    if (orig && this.isShellMesh(mesh)) {
      const baseOpacity = orig.opacity;
      if (baseOpacity > 0.5) {
        mesh.material.opacity = Math.max(0.05, baseOpacity - 0.50);
      } else {
        mesh.material.opacity = Math.min(1.0, baseOpacity + 0.50);
      }
    }
    
    mesh.material.needsUpdate = true;
  }

  clearHighlights() {
    for (const [id, mesh] of this.structureMap.entries()) {
      mesh.material.emissive.setHex(0x000000);
      mesh.material.emissiveIntensity = 0.0;
      const orig = this.originalMaterials.get(id);
      if (orig && this.isShellMesh(mesh)) {
        mesh.material.opacity = orig.opacity;
      }
    }
    this.selectedStructureId = null;
  }

  dimUnrelatedStructures(activeStructureIds = []) {
    for (const [id, mesh] of this.structureMap.entries()) {
      const isActive = activeStructureIds.includes(id);
      mesh.material.transparent = true;
      mesh.material.opacity = isActive ? 0.95 : 0.15;
      mesh.material.needsUpdate = true;
    }
  }

  resetVisibility() {
    this.clearHighlights();
    this.clearHover();
    for (const [id, mesh] of this.structureMap.entries()) {
      mesh.visible = true;
      const orig = this.originalMaterials.get(id);
      if (orig) {
        mesh.material.transparent = orig.transparent;
        mesh.material.opacity = orig.opacity;
      }
      mesh.material.emissive.setHex(0x000000);
      mesh.material.emissiveIntensity = 0.0;
      mesh.material.needsUpdate = true;
    }
    this.selectedStructureId = null;
  }

  setTheme(theme) {
    // Current dark mode colors were too dark, so we define pleasant mid-tones for dark mode
    // and preserve the original deep tones for light mode.
    const colors = {
      light: {
        brainstem: "#1E293B",
        cerebellum: "#132A22",
        corpus_callosum: "#F1F5F9",
        thalamus: "#78350F",
        primary_motor_cortex: "#082F49",
        premotor_cortex: "#082F49",
        primary_somatosensory_cortex: "#331805",
        wernicke_area: "#2E1065",
        temporal_association_cortex: "#2E1065",
        primary_visual_cortex: "#1E1B4B",
        pericardium: "#0F172A",
        left_ventricle: "#581C87",
        right_ventricle: "#4A044E",
        septum: "#312E81",
        left_atrium: "#2E1065",
        right_atrium: "#1E293B",
        aorta: "#78350F",
        pulmonary_artery: "#082F49",
        superior_vena_cava: "#0F172A",
        valves: "#F1F5F9",
        coronary_arteries: "#B45309",
        default: "#0F172A"
      },
      dark: {
        brainstem: "#475569",
        cerebellum: "#059669",
        corpus_callosum: "#F8FAFC",
        thalamus: "#B45309",
        primary_motor_cortex: "#0284C7",
        premotor_cortex: "#0284C7",
        primary_somatosensory_cortex: "#C2410C",
        wernicke_area: "#7C3AED",
        temporal_association_cortex: "#7C3AED",
        primary_visual_cortex: "#4F46E5",
        pericardium: "#475569",
        left_ventricle: "#9333EA",
        right_ventricle: "#A855F7",
        septum: "#6366F1",
        left_atrium: "#7C3AED",
        right_atrium: "#0284C7",
        aorta: "#D97706",
        pulmonary_artery: "#38BDF8",
        superior_vena_cava: "#3B82F6",
        valves: "#F8FAFC",
        coronary_arteries: "#F59E0B",
        default: "#475569"
      }
    };

    const palette = colors[theme] || colors.light;

    for (const [id, mesh] of this.structureMap.entries()) {
      const targetColor = palette[id] || palette.default;
      mesh.traverse(node => {
        if (node.material && node.material.color) {
          node.material.color.set(targetColor);
          node.material.needsUpdate = true;
        }
      });
      
      const orig = this.originalMaterials.get(id);
      if (orig && mesh.material && mesh.material.color) {
        orig.color = mesh.material.color.clone();
      }
    }
  }

  clear() {
    this.structureMap.clear();
    this.originalMaterials.clear();
    this.selectedStructureId = null;
    this.hoveredStructureId = null;
  }
}
