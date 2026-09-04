import * as THREE from 'three';

export class AnatomySelectionManager {
  constructor(camera, registry, eventBus, domElement) {
    this.camera = camera;
    this.registry = registry;
    this.eventBus = eventBus;
    this.domElement = domElement;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.hoveredStructureId = null;
    this.selectedStructureId = null;

    // Track mouse down to distinguish click vs camera drag
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragStartTime = 0;

    this.domElement.addEventListener('pointermove', this.onPointerMove.bind(this));
    this.domElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
    this.domElement.addEventListener('pointerup', this.onPointerUp.bind(this));
  }

  getStructureIdFromObject(object) {
    let curr = object;
    while (curr) {
      if (curr.userData && curr.userData.structureId) {
        return curr.userData.structureId;
      }
      curr = curr.parent;
    }
    return null;
  }

  onPointerMove(event) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.registry.getAllMeshes());

    if (intersects.length > 0) {
      const structureId = this.getStructureIdFromObject(intersects[0].object);

      if (structureId) {
        if (this.hoveredStructureId !== structureId) {
          this.hoveredStructureId = structureId;
          this.domElement.style.cursor = 'pointer';
          this.registry.setHoveredStructure(structureId);
          this.eventBus.emit('STRUCTURE_HOVERED', { structureId });
        }
      }
    } else {
      if (this.hoveredStructureId) {
        this.hoveredStructureId = null;
        this.domElement.style.cursor = 'default';
        this.registry.clearHover();
        this.eventBus.emit('STRUCTURE_UNHOVERED');
      }
    }
  }

  onPointerDown(event) {
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragStartTime = performance.now();
  }

  onPointerUp(event) {
    if (event.button !== 0) return; // Left click only

    // Distinguish intentional click vs dragging camera view
    const dx = Math.abs(event.clientX - this.dragStartX);
    const dy = Math.abs(event.clientY - this.dragStartY);
    const dt = performance.now() - this.dragStartTime;

    // If mouse moved more than 5px or held for drag, treat as camera navigation
    if (dx > 5 || dy > 5 || dt > 450) {
      return;
    }

    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.registry.getAllMeshes());

    if (intersects.length > 0) {
      const structureId = this.getStructureIdFromObject(intersects[0].object);
      if (!structureId) return;

      this.selectedStructureId = structureId;
      this.registry.highlightStructure(structureId);

      const targetObj = this.registry.getStructure(structureId);
      const pos = targetObj ? targetObj.position.clone() : intersects[0].point;

      this.eventBus.emit('STRUCTURE_SELECTED', {
        structureId,
        object: targetObj,
        position: pos
      });
    }
  }
}
