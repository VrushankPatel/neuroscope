import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';

export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.controls = new OrbitControls(this.camera, domElement);

    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.rotateSpeed = 0.7;
    this.controls.zoomSpeed = 0.9;
    this.controls.panSpeed = 1.0;
    this.controls.screenSpacePanning = true; // Essential for free navigation inside the brain
    this.controls.enablePan = true;

    // Allow camera to move right up to and through surfaces
    this.controls.minDistance = 0.01;
    this.controls.maxDistance = 14.0;

    // Default overview camera view
    this.defaultPosition = new THREE.Vector3(0, 0.35, 4.6);
    this.defaultTarget = new THREE.Vector3(0, 0, 0);

    this.camera.position.copy(this.defaultPosition);
    this.controls.target.copy(this.defaultTarget);

    this.isAutoRotating = true;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.25;

    // Whenever user starts interacting with mouse, immediately halt tweens and auto-rotation
    this.controls.addEventListener('start', () => {
      this.isAutoRotating = false;
      this.controls.autoRotate = false;
      gsap.killTweensOf(this.camera.position);
      gsap.killTweensOf(this.controls.target);
    });

    // Idle auto-spin logic
    this.idleTime = 0;
    const resetIdle = () => { this.idleTime = 0; };
    window.addEventListener('pointermove', resetIdle);
    window.addEventListener('pointerdown', resetIdle);
    window.addEventListener('keydown', resetIdle);
  }

  update(delta = 0.016) {
    this.controls.update();

    if (!this.isAutoRotating && !this.controls.autoRotate) {
      this.idleTime += delta;
      if (this.idleTime > 15.0) {
        // Start gentle idle spinning
        this.isAutoRotating = true;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
      }
    }
  }

  // Smoothly glides camera into the brain near target, then hands complete control to the user
  zoomInside(targetPosition, duration = 1.3, distance = 0.48) {
    this.controls.autoRotate = false;
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.controls.target);

    const dir = targetPosition.clone().normalize();
    if (dir.lengthSq() < 0.001) dir.set(0, 0, 1);
    const insideCamPos = targetPosition.clone().add(dir.multiplyScalar(distance));

    gsap.to(this.controls.target, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: duration,
      ease: "power2.out"
    });

    gsap.to(this.camera.position, {
      x: insideCamPos.x,
      y: insideCamPos.y,
      z: insideCamPos.z,
      duration: duration,
      ease: "power2.out",
      onUpdate: () => this.controls.update()
    });
  }

  focusOnTarget(targetPosition, cameraPosition, duration = 1.1) {
    this.controls.autoRotate = false;
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.controls.target);

    gsap.to(this.controls.target, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: duration,
      ease: "power2.out"
    });

    gsap.to(this.camera.position, {
      x: cameraPosition.x,
      y: cameraPosition.y,
      z: cameraPosition.z,
      duration: duration,
      ease: "power2.out",
      onUpdate: () => this.controls.update()
    });
  }

  reset(duration = 1.0) {
    this.focusOnTarget(this.defaultTarget, this.defaultPosition, duration);
    setTimeout(() => {
      if (this.isAutoRotating) {
        this.controls.autoRotate = true;
      }
    }, duration * 1000);
  }
}
