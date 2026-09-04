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

    this.initModeButtons();
    this.initThemeToggle();
    this.initQualitySelect();
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
