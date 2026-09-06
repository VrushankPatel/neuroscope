import * as THREE from 'three';
import { GlobalData } from '../data/GlobalData.js';

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
    return Array.from(new Set(this.structureMap.values()));
  }

  getInteractiveMeshes() {
    return this.getAllMeshes().filter(mesh => mesh.userData?.isInteractive !== false);
  }

  isShellMesh(mesh) {
    if (!mesh || !mesh.userData) return false;
    const cat = mesh.userData.category;
    return cat === 'cortical_region' || cat === 'shell' || cat === 'pericardium' || !!mesh.userData.isShell;
  }

  setCortexOpacity(opacityValue) {
    const isHeart = (GlobalData && GlobalData.currentOrgan === 'heart');

    for (const [id, mesh] of this.structureMap.entries()) {
      const orig = this.originalMaterials.get(id);
      const baseOp = orig ? orig.opacity : 0.45;

      if (isHeart) {
        // Whole Heart Mode: Scale all heart structures together with slider
        const scaleFactor = opacityValue / 0.22;
        const targetOp = Math.max(0.04, Math.min(0.85, baseOp * scaleFactor));
        mesh.material.transparent = true; // Always keep transparent true to prevent solid occlusion
        mesh.material.opacity = targetOp;
        mesh.material.depthWrite = false;
        mesh.material.needsUpdate = true;
      } else {
        // Brain Mode: Adjust outer cortical shell
        if (this.isShellMesh(mesh)) {
          const newOp = Math.max(0.04, Math.min(0.85, opacityValue));
          mesh.material.transparent = true; // Always keep transparent true so shell never turns solid
          mesh.material.opacity = newOp;
          mesh.material.depthWrite = false;
          mesh.material.needsUpdate = true;
          
          if (orig) {
            orig.opacity = newOp;
          }
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

  update(time) {
    if (this.selectedStructureId) {
      const mesh = this.structureMap.get(this.selectedStructureId);
      if (mesh && mesh.material) {
        // Dynamic organic neural access pulse (0.40 to 0.88 intensity)
        const pulse = 0.40 + 0.48 * (0.5 + 0.5 * Math.sin(time * 6.5));
        mesh.material.emissiveIntensity = pulse;
        mesh.material.needsUpdate = true;
      }
    }
  }

  highlightStructure(structureId, colorHex) {
    this.clearHighlights();
    const mesh = this.structureMap.get(structureId);
    if (!mesh) return;

    this.selectedStructureId = structureId;
    
    // Use signal color or structure color for glowing emissive tint
    if (colorHex) {
      mesh.material.emissive = new THREE.Color(colorHex);
    } else {
      mesh.material.emissive = mesh.material.color.clone();
    }
    mesh.material.emissiveIntensity = 0.60;
    
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
        // Authentic Brain Structures (Preserved & Restored)
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
        prefrontal_cortex: "#0F172A",
        broca_area: "#0F172A",

        // Authentic Heart Structures (Cool Neutral Medical Palette)
        pericardium: "#667686",
        left_ventricle: "#A7B4C2",
        right_ventricle: "#8FA0B2",
        septum: "#B8C3CE",
        left_atrium: "#A1AFBC",
        right_atrium: "#91A2B3",
        aorta: "#B4BEC8",
        pulmonary_artery: "#9EADB9",
        superior_vena_cava: "#899AA9",
        inferior_vena_cava: "#718096",
        mitral_valve: "#E9D5FF",
        tricuspid_valve: "#C4B5FD",
        aortic_valve: "#FDE68A",
        pulmonary_valve: "#BAE6FD",
        valves: "#D4DBE2",
        coronary_arteries: "#C1CAD3",

        default: "#0F172A"
      },
      dark: {
        // Authentic Brain Structures (Preserved & Restored)
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
        prefrontal_cortex: "#475569",
        broca_area: "#475569",

        // Authentic Heart Structures (Cool Neutral Medical Palette)
        pericardium: "#667686",
        left_ventricle: "#A7B4C2",
        right_ventricle: "#8FA0B2",
        septum: "#B8C3CE",
        left_atrium: "#A1AFBC",
        right_atrium: "#91A2B3",
        aorta: "#B4BEC8",
        pulmonary_artery: "#9EADB9",
        superior_vena_cava: "#899AA9",
        inferior_vena_cava: "#718096",
        mitral_valve: "#E9D5FF",
        tricuspid_valve: "#C4B5FD",
        aortic_valve: "#FDE68A",
        pulmonary_valve: "#BAE6FD",
        valves: "#D4DBE2",
        coronary_arteries: "#C1CAD3",

        default: "#475569"
      }
    };

    const palette = colors[theme] || colors.light;

    for (const [id, mesh] of this.structureMap.entries()) {
      const targetColor = palette[id] || palette.default;
      mesh.traverse(node => {
        if (node.material && node.material.color) {
          // If mesh has original texture map, keep white tint (0xffffff) so original multi-colors render cleanly!
          if (node.material.map || node.userData.hasOriginalTexture || mesh.userData.hasOriginalTexture) {
            node.material.color.setHex(0xffffff);
          } else {
            node.material.color.set(targetColor);
          }
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
