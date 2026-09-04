export class PerformanceMonitor {
  constructor(sceneManager, eventBus) {
    this.sceneManager = sceneManager;
    this.eventBus = eventBus;

    this.debugOverlay = document.getElementById('debug-overlay');
    this.fpsEl = document.getElementById('debug-fps');
    this.callsEl = document.getElementById('debug-calls');
    this.trianglesEl = document.getElementById('debug-triangles');

    this.initKeyboardShortcut();
  }

  initKeyboardShortcut() {
    window.addEventListener('keydown', (e) => {
      if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        if (this.debugOverlay) {
          this.debugOverlay.classList.toggle('hidden');
        }
      }
    });

    this.sceneManager.addRenderCallback(() => {
      if (this.debugOverlay && !this.debugOverlay.classList.contains('hidden')) {
        const info = this.sceneManager.renderer.info;
        if (this.fpsEl) this.fpsEl.textContent = `FPS: ${this.sceneManager.fps}`;
        if (this.callsEl) this.callsEl.textContent = `Draw Calls: ${info.render.calls}`;
        if (this.trianglesEl) this.trianglesEl.textContent = `Triangles: ${info.render.triangles}`;
      }
    });
  }
}
