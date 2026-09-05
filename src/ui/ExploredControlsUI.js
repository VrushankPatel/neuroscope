import * as THREE from 'three';

export class ExploredControlsUI {
  constructor(registry, explodedManager, cameraController, eventBus, bodyContextManager) {
    this.registry = registry;
    this.explodedManager = explodedManager;
    this.cameraController = cameraController;
    this.eventBus = eventBus;
    this.bodyContextManager = bodyContextManager;

    this.opacitySlider = document.getElementById('opacity-slider');
    this.opacityVal = document.getElementById('opacity-val');
    this.btnEnterBrain = document.getElementById('btn-enter-brain');
    this.btnExploded = document.getElementById('btn-exploded');
    this.btnResetView = document.getElementById('btn-reset-view');
    this.btnAutoSpin = document.getElementById('btn-auto-spin');

    this.initControls();
  }

  initControls() {
    const bodyPills = document.querySelectorAll('#body-visibility-controls .pill-btn');
    bodyPills.forEach(btn => {
      btn.addEventListener('click', () => {
        bodyPills.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        if (this.bodyContextManager) {
          this.bodyContextManager.setVisibilityMode(mode);
        }
      });
    });

    if (this.opacitySlider) {
      this.opacitySlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        if (this.opacityVal) this.opacityVal.textContent = `${val}%`;
        this.registry.setCortexOpacity(val / 100);
      });
    }

    if (this.btnEnterBrain) {
      this.btnEnterBrain.addEventListener('click', () => {
        // Immersive Atomic Camera View: Explode the brain and move inside!
        this.explodedManager.explodePositions(1.5);
        
        // Move camera to the very center of the brain
        const centerPos = new THREE.Vector3(0.0, 0.0, 0.0);
        // Duration 1.5s, distance 0.01 (tiny radius for 360 look around)
        this.cameraController.zoomInside(centerPos, 1.5, 0.01);
        
        this.registry.setCortexOpacity(0.15);
        if (this.opacitySlider) this.opacitySlider.value = 15;
        if (this.opacityVal) this.opacityVal.textContent = '15%';
      });
    }

    if (this.btnExploded) {
      this.btnExploded.addEventListener('click', () => {
        this.explodedManager.toggleExplodedView();
      });
    }

    if (this.btnResetView) {
      this.btnResetView.addEventListener('click', () => {
        this.cameraController.reset();
        this.explodedManager.resetPositions();
        this.registry.resetVisibility();
        this.registry.setCortexOpacity(0.22);
        if (this.opacitySlider) this.opacitySlider.value = 22;
        if (this.opacityVal) this.opacityVal.textContent = '22%';
        bodyPills.forEach(b => b.classList.toggle('active', b.dataset.mode === 'auto'));
        if (this.bodyContextManager) this.bodyContextManager.setVisibilityMode('auto');
      });
    }

    if (this.btnAutoSpin) {
      this.btnAutoSpin.addEventListener('click', () => {
        // Zoom out a little to put brain in center properly and start spinning
        const overviewPos = new THREE.Vector3(0, 0.8, 6.0); // Slightly zoomed out and up
        this.cameraController.focusOnTarget(new THREE.Vector3(0,0,0), overviewPos, 1.5);
        
        // Re-enable auto-rotation logic
        setTimeout(() => {
          this.cameraController.isAutoRotating = true;
          this.cameraController.controls.autoRotate = true;
          this.cameraController.controls.autoRotateSpeed = 2.0; // spin faster!
        }, 1500);
      });
    }
  }
}
