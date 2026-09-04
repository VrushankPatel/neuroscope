export class SimulationEngine {
  constructor(eventBus) {
    this.eventBus = eventBus;

    this.isPlaying = false;
    this.currentTime = 0.0;
    this.totalDuration = 3.5;
    this.speed = 1.0;

    this.activeScenario = null;
  }

  loadScenario(scenario) {
    this.activeScenario = scenario;
    this.totalDuration = scenario.duration;
    this.currentTime = 0.0;
    this.isPlaying = false;

    this.eventBus.emit('SCENARIO_LOADED', { scenario: this.activeScenario });
    this.updateTime(0.0);
  }

  play() {
    if (!this.activeScenario) return;
    if (this.currentTime >= this.totalDuration) {
      this.currentTime = 0.0;
    }
    this.isPlaying = true;
    this.eventBus.emit('SIMULATION_PLAY');
  }

  pause() {
    this.isPlaying = false;
    this.eventBus.emit('SIMULATION_PAUSE');
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  replay() {
    this.currentTime = 0.0;
    this.play();
  }

  seek(targetTime) {
    this.currentTime = Math.max(0, Math.min(this.totalDuration, targetTime));
    this.updateTime(this.currentTime);
  }

  setSpeed(newSpeed) {
    this.speed = newSpeed;
    this.eventBus.emit('SPEED_CHANGED', { speed: this.speed });
  }

  tick(deltaSeconds) {
    if (!this.isPlaying || !this.activeScenario) return;

    this.currentTime += deltaSeconds * this.speed;

    if (this.currentTime >= this.totalDuration) {
      this.currentTime = this.totalDuration;
      this.pause();
      this.eventBus.emit('SIMULATION_COMPLETE');
    }

    this.updateTime(this.currentTime);
  }

  updateTime(time) {
    this.eventBus.emit('SIMULATION_TICK', {
      currentTime: time,
      totalDuration: this.totalDuration,
      progressRatio: time / this.totalDuration
    });
  }
}
