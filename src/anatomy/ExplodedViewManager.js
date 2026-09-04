import * as THREE from 'three';
import gsap from 'gsap';

export class ExplodedViewManager {
  constructor(registry) {
    this.registry = registry;
    this.isExploded = false;
    this.originalPositions = new Map();
  }

  toggleExplodedView(duration = 1.2) {
    if (this.isExploded) {
      this.resetPositions(duration);
    } else {
      this.explodePositions(duration);
    }
  }

  explodePositions(duration = 1.2) {
    this.isExploded = true;

    for (const mesh of this.registry.getAllMeshes()) {
      const id = mesh.userData.structureId;
      if (!id) continue;

      if (!this.originalPositions.has(id)) {
        this.originalPositions.set(id, mesh.position.clone());
      }

      const origPos = this.originalPositions.get(id);
      let offset = new THREE.Vector3(0, 0, 0);

      // Compute dynamic radial offset based on mesh center
      if (mesh.geometry) {
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const center = mesh.geometry.boundingBox.getCenter(new THREE.Vector3());
        // Push outward radially from the center of the brain
        offset = center.clone().normalize().multiplyScalar(0.85);
        
        // Keep brainstem/central core grounded
        if (id === 'brainstem' || id === 'corpus_callosum') {
          offset.set(0, 0, 0);
        }
      }

      gsap.to(mesh.position, {
        x: origPos.x + offset.x,
        y: origPos.y + offset.y,
        z: origPos.z + offset.z,
        duration: duration,
        ease: "power2.out"
      });
    }
  }

  resetPositions(duration = 1.2) {
    this.isExploded = false;

    for (const mesh of this.registry.getAllMeshes()) {
      const id = mesh.userData.structureId;
      if (!id) continue;

      const origPos = this.originalPositions.get(id);
      if (origPos) {
        gsap.to(mesh.position, {
          x: origPos.x,
          y: origPos.y,
          z: origPos.z,
          duration: duration,
          ease: "power2.inOut"
        });
      }
    }
  }
}
