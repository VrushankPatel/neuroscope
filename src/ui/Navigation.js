export class NavigationUI {
  constructor(eventBus, sceneManager, lightingManager, particleEnv) {
    this.eventBus = eventBus;
    this.sceneManager = sceneManager;
    this.lightingManager = lightingManager;
    this.particleEnv = particleEnv;

    // Read the theme that was set by the inline script in index.html, or default to light
    this.currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

    // Apply the initial theme to 3D managers immediately
    this.sceneManager.setTheme(this.currentTheme);
    this.lightingManager.setTheme(this.currentTheme);
    this.particleEnv.setTheme(this.currentTheme);

    this.currentOrgan = 'brain';
    this.initModeButtons();
    this.initThemeToggle();
    this.initQualitySelect();
  }

  setOrgan(organId) {
    this.currentOrgan = organId;
    const isHeart = organId === 'heart';

    // 1. Update Network / Flow tab
    const netBtn = document.querySelector('.nav-btn[data-mode="network"]');
    if (netBtn) {
      const textSpan = netBtn.querySelector('.nav-text') || netBtn;
      if (textSpan.classList.contains('nav-text')) {
        textSpan.textContent = isHeart ? 'Blood Flow' : 'Neural Network';
      }
      netBtn.setAttribute('title', isHeart ? 'Simulate Pulmonary & Systemic Hemodynamics' : 'Simulate Whole-Brain Distributed Neural Network');
    }

    // 2. Update Pathways / Conduction tab
    const pathBtn = document.querySelector('.nav-btn[data-mode="pathways"]');
    if (pathBtn) {
      const textSpan = pathBtn.querySelector('.nav-text') || pathBtn;
      if (textSpan.classList.contains('nav-text')) {
        textSpan.textContent = isHeart ? 'Conduction' : 'Pathways';
      }
      pathBtn.setAttribute('title', isHeart ? 'Cardiac Electrical Conduction (SA Node, AV Node, Purkinje)' : 'Axonal White Matter Pathways');
    }

    // 3. Update Cellular / Pumping tab
    const cellBtn = document.querySelector('.nav-btn[data-mode="cellular"]');
    if (cellBtn) {
      const textSpan = cellBtn.querySelector('.nav-text') || cellBtn;
      if (textSpan.classList.contains('nav-text')) {
        textSpan.textContent = isHeart ? 'Pumping' : 'Cellular';
      }
      cellBtn.setAttribute('title', isHeart ? 'Ventricular Mechanics, Cardiac Cycle & Valve Dynamics' : 'Neuron Action Potential & Synapse');
    }

    // 4. Update Header Toggle Button (#btn-toggle-network)
    const toggleNetBtn = document.getElementById('btn-toggle-network');
    const toggleLabel = document.getElementById('toggle-network-label');
    if (toggleNetBtn) {
      toggleNetBtn.setAttribute('title', isHeart ? 'Toggle Blood Flow Overlay' : 'Toggle Neural Network Overlay');
      if (toggleLabel) {
        toggleLabel.textContent = isHeart ? 'Flow' : 'Net';
      }
    }
  }

  setMode(mode) {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });
  }

  initModeButtons() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = btn.dataset.mode;

        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.eventBus.emit('MODE_CHANGED', { mode });
      });
    });
  }

  initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    themeBtn.addEventListener('click', () => {
      this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', this.currentTheme);
      
      // Save user preference
      localStorage.setItem('neuroscope-theme', this.currentTheme);

      this.sceneManager.setTheme(this.currentTheme);
      this.lightingManager.setTheme(this.currentTheme);
      this.particleEnv.setTheme(this.currentTheme);

      this.eventBus.emit('THEME_CHANGED', { theme: this.currentTheme });
    });
  }

  initQualitySelect() {
    const select = document.getElementById('quality-select');
    if (!select) return;

    select.addEventListener('change', (e) => {
      this.eventBus.emit('QUALITY_CHANGED', { quality: e.target.value });
    });
  }
}
