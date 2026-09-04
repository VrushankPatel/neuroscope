import * as THREE from 'three';

export class AnatomicalAssetRegistry {
  constructor() {
    this.structureMap = new Map(); // structureId -> THREE.Mesh
    this.originalMaterials = new Map();
    this.selectedStructureId = null;
    this.hoveredStructureId = null;
  }

  registerStructure(structureId, mesh) {
    this.structureMap.set(structureId, mesh);
    this.originalMaterials.set(structureId, {
      opacity: mesh.material.opacity,
      transparent: mesh.material.transparent,
      color: mesh.material.color.clone()
    });
  }

  getStructure(structureId) {
    return this.structureMap.get(structureId);
  }

  getAllMeshes() {
    return Array.from(this.structureMap.values());
  }

  setCortexOpacity(opacityValue) {
    for (const [id, mesh] of this.structureMap.entries()) {
      if (mesh.userData.category === 'cortical_region') {
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
        if (orig && prevMesh.userData.category === 'cortical_region') {
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
    if (orig && mesh.userData.category === 'cortical_region') {
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
        if (orig && mesh.userData.category === 'cortical_region') {
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
    if (orig && mesh.userData.category === 'cortical_region') {
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
      if (orig && mesh.userData.category === 'cortical_region') {
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
}
