export class TimelineUI {
  constructor(containerElement, simulationEngine, eventBus) {
    this.container = containerElement;
    this.simEngine = simulationEngine;
    this.eventBus = eventBus;

    this.titleEl = document.getElementById('timeline-scenario-title');
    this.stepEl = document.getElementById('timeline-step-explanation');
    this.currTimeEl = document.getElementById('current-time');
    this.totalTimeEl = document.getElementById('total-time');

    this.fillEl = document.getElementById('scrubber-fill');
    this.handleEl = document.getElementById('scrubber-handle');
    this.trackEl = document.getElementById('scrubber-track');

    this.playPauseBtn = document.getElementById('btn-play-pause');
    this.iconPlay = this.playPauseBtn?.querySelector('.icon-play');
    this.iconPause = this.playPauseBtn?.querySelector('.icon-pause');
    this.replayBtn = document.getElementById('btn-replay');
    this.closeBtn = document.getElementById('timeline-close-btn');

    this.initControls();
    this.initScrubberDragging();

    this.eventBus.on('SCENARIO_LOADED', ({ scenario }) => {
      if (this.titleEl) this.titleEl.textContent = scenario.title;
      if (this.totalTimeEl) this.totalTimeEl.textContent = `${scenario.duration.toFixed(1)}s`;
      this.show();
    });

    this.eventBus.on('SIMULATION_TICK', ({ currentTime, totalDuration, progressRatio }) => {
      if (this.currTimeEl) this.currTimeEl.textContent = `${currentTime.toFixed(1)}s`;
      const pct = (progressRatio * 100).toFixed(1);
      if (this.fillEl) this.fillEl.style.width = `${pct}%`;
      if (this.handleEl) this.handleEl.style.left = `${pct}%`;
    });

    this.eventBus.on('STAGE_CHANGED', ({ step }) => {
      if (this.stepEl) this.stepEl.textContent = `${step.stage} — ${step.narrative}`;
    });

    this.eventBus.on('SIMULATION_PLAY', () => this.updatePlayIcon(true));
    this.eventBus.on('SIMULATION_PAUSE', () => this.updatePlayIcon(false));
  }

  initControls() {
    if (this.playPauseBtn) {
      this.playPauseBtn.addEventListener('click', () => this.simEngine.togglePlayPause());
    }

    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', () => this.simEngine.replay());
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.simEngine.pause();
        this.hide();
      });
    }

    // Speed buttons
    const speedBtns = document.querySelectorAll('.speed-btn');
    speedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        speedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const speed = parseFloat(btn.dataset.speed);
        this.simEngine.setSpeed(speed);
      });
    });
  }

  initScrubberDragging() {
    if (!this.trackEl) return;

    let isDragging = false;

    const onSeek = (e) => {
      const rect = this.trackEl.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const ratio = clickX / rect.width;
      this.simEngine.seek(ratio * this.simEngine.totalDuration);
    };

    this.trackEl.addEventListener('pointerdown', (e) => {
      isDragging = true;
      onSeek(e);
    });

    window.addEventListener('pointermove', (e) => {
      if (isDragging) onSeek(e);
    });

    window.addEventListener('pointerup', () => {
      isDragging = false;
    });
  }

  updatePlayIcon(isPlaying) {
    if (isPlaying) {
      if (this.iconPlay) this.iconPlay.classList.add('hidden');
      if (this.iconPause) this.iconPause.classList.remove('hidden');
    } else {
      if (this.iconPlay) this.iconPlay.classList.remove('hidden');
      if (this.iconPause) this.iconPause.classList.add('hidden');
    }
  }

  show() {
    if (this.container) this.container.classList.remove('hidden');
  }

  hide() {
    if (this.container) this.container.classList.add('hidden');
  }
}
