import * as THREE from 'three';

export class SceneManager {
  constructor(containerElement) {
    this.container = containerElement;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    // Create Main Three.js Scene
    this.scene = new THREE.Scene();

    // Create Main Camera
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 1.2, 5.5);

    // Create WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: true
    });

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.container.appendChild(this.renderer.domElement);

    // Frame stats
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.renderCallbacks = [];

    // Resize Observer
    window.addEventListener('resize', this.onResize.bind(this));
  }

  addRenderCallback(callback) {
    this.renderCallbacks.push(callback);
  }

  startLoop() {
    const animate = (time) => {
      requestAnimationFrame(animate);

      const delta = (time - this.lastTime) / 1000;
      this.lastTime = time;

      // Stats
      this.frameCount++;
      if (this.frameCount % 30 === 0) {
        this.fps = Math.round(1 / delta);
      }

      // Execute registered callbacks
      for (const callback of this.renderCallbacks) {
        callback(delta, time);
      }

      this.renderer.render(this.scene, this.camera);
    };

    requestAnimationFrame(animate);
  }

  onResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  setTheme(theme) {
    if (theme === 'dark') {
      this.scene.background = new THREE.Color('#05070A');
      this.scene.fog = new THREE.FogExp2('#05070A', 0.08);
    } else {
      this.scene.background = new THREE.Color('#F8F9FA');
      this.scene.fog = new THREE.FogExp2('#F8F9FA', 0.06);
    }
  }
}
