import * as THREE from 'three';

/**
 * CardiacCycleAnimator
 * Coordinates authentic ventricular contraction mechanics in 3D,
 * live multi-lead ECG waveform rendering, and hemodynamic valve synchronization.
 */
export class CardiacCycleAnimator {
  constructor(registry, eventBus) {
    this.registry = registry;
    this.eventBus = eventBus;

    this.isPlaying = true;
    this.bpm = 72;
    this.cycleDuration = 60 / this.bpm; // ~0.833 seconds
    this.currentTime = 0;
    this.phase = 0; // 0.0 to 1.0

    this.forcedSystoleActive = false;
    this.forcedSystoleTimer = 0;

    // DOM Elements
    this.panel = document.getElementById('cardiac-panel');
    this.ecgCanvas = document.getElementById('cardiac-ecg-canvas');
    this.ecgCtx = this.ecgCanvas ? this.ecgCanvas.getContext('2d') : null;

    this.phaseLabel = document.getElementById('cardiac-cycle-phase');
    this.lvPressureLabel = document.getElementById('cardiac-lv-pressure');
    this.rvPressureLabel = document.getElementById('cardiac-rv-pressure');
    this.strokeVolLabel = document.getElementById('cardiac-stroke-vol');
    this.hrLabel = document.getElementById('cardiac-hr-val');
    this.heartSoundBadge = document.getElementById('heart-sound-badge');
    this.avValvesState = document.getElementById('av-valves-state');
    this.slValvesState = document.getElementById('sl-valves-state');
    this.valveExplanation = document.getElementById('valve-explanation');

    this.btnTriggerSystole = document.getElementById('btn-trigger-systole');
    this.btnTogglePlay = document.getElementById('btn-toggle-cardiac-play');
    this.scrubber = document.getElementById('cardiac-scrubber');
    this.scrubberVal = document.getElementById('cardiac-scrubber-val');

    this.initUI();
  }

  getPhaseShortName(phase) {
    if (phase < 0.18) return "Atrial";
    if (phase < 0.24) return "Isovolumetric";
    if (phase < 0.50) return "Systole";
    if (phase < 0.62) return "Relaxation";
    return "Diastole";
  }

  initUI() {
    // Tabs in cardiac panel
    const tabs = document.querySelectorAll('#cardiac-panel .tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const targetTab = tab.dataset.cardiacTab;
        const contents = document.querySelectorAll('#cardiac-panel .cell-tab-content');
        contents.forEach(c => c.classList.add('hidden'));

        const targetContent = document.getElementById(`cardiac-tab-${targetTab}`);
        if (targetContent) targetContent.classList.remove('hidden');
      });
    });

    // Controlled Manual Scrubber Slider
    if (this.scrubber) {
      const handleScrubber = () => {
        const val = parseFloat(this.scrubber.value);
        this.isPlaying = false;
        this.forcedSystoleActive = false;
        if (this.btnTogglePlay) {
          this.btnTogglePlay.textContent = 'Resume Rhythm';
        }
        this.phase = Math.max(0, Math.min(1.0, val / 100));
        this.currentTime = this.phase * this.cycleDuration;

        this.applyCardiacMechanics(this.phase);
        this.drawEcgWaveform(this.phase);
        this.updateTelemetry(this.phase);

        if (this.scrubberVal) {
          this.scrubberVal.textContent = `${Math.round(val)}% (${this.getPhaseShortName(this.phase)})`;
        }
      };

      this.scrubber.addEventListener('input', handleScrubber);
      this.scrubber.addEventListener('change', handleScrubber);
    }

    // Trigger Systole button
    if (this.btnTriggerSystole) {
      this.btnTriggerSystole.addEventListener('click', () => {
        this.isPlaying = true;
        if (this.btnTogglePlay) {
          this.btnTogglePlay.textContent = 'Pause Rhythm';
        }
        this.triggerManualSystole();
      });
    }

    // Play/Pause button
    if (this.btnTogglePlay) {
      this.btnTogglePlay.addEventListener('click', () => {
        this.isPlaying = !this.isPlaying;
        this.btnTogglePlay.textContent = this.isPlaying ? 'Pause Rhythm' : 'Resume Rhythm';
        if (this.isPlaying) {
          this.currentTime = this.phase * this.cycleDuration;
        }
      });
    }

    // Phase selector buttons (Diastole vs Systole)
    const phaseBtns = document.querySelectorAll('#cardiac-panel .phase-btn');
    phaseBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        phaseBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const phaseMode = btn.dataset.phase;
        const targetPhase = phaseMode === 'systole' ? 0.35 : 0.85;
        this.isPlaying = false;
        if (this.btnTogglePlay) {
          this.btnTogglePlay.textContent = 'Resume Rhythm';
        }
        this.phase = targetPhase;
        this.currentTime = this.phase * this.cycleDuration;
        if (this.scrubber) this.scrubber.value = Math.round(targetPhase * 100);
        if (this.scrubberVal) this.scrubberVal.textContent = `${Math.round(targetPhase * 100)}% (${this.getPhaseShortName(targetPhase)})`;
        this.applyCardiacMechanics(targetPhase);
        this.drawEcgWaveform(targetPhase);
        this.updateTelemetry(targetPhase);
      });
    });
  }

  triggerManualSystole() {
    this.forcedSystoleActive = true;
    this.forcedSystoleTimer = 0;
    this.currentTime = this.cycleDuration * 0.20; // Jump right to isovolumetric contraction
  }

  update(delta) {
    if (!this.isPlaying && !this.forcedSystoleActive) return;

    if (this.forcedSystoleActive) {
      this.forcedSystoleTimer += delta;
      if (this.forcedSystoleTimer > 0.45) {
        this.forcedSystoleActive = false;
      }
    }

    this.currentTime = (this.currentTime + delta) % this.cycleDuration;
    this.phase = this.currentTime / this.cycleDuration; // 0.0 to 1.0

    // 1. Deform and pump 3D ventricular and atrial chambers
    this.applyCardiacMechanics(this.phase);

    // 2. Draw live ECG / Pressure waveform and update telemetry
    if (this.panel && !this.panel.classList.contains('hidden')) {
      this.drawEcgWaveform(this.phase);
      this.updateTelemetry(this.phase);

      if (this.scrubber && document.activeElement !== this.scrubber) {
        const pct = Math.round(this.phase * 100);
        this.scrubber.value = pct;
        if (this.scrubberVal) {
          this.scrubberVal.textContent = `Auto (${pct}%)`;
        }
      }
    }
  }

  storeOriginalTransforms() {
    if (this.originalTransforms) return;
    this.originalTransforms = new Map();

    const structures = ["heart_pivot", "left_ventricle", "right_ventricle", "septum", "left_atrium", "right_atrium", "pericardium", "valves", "aorta", "pulmonary_artery", "superior_vena_cava", "inferior_vena_cava", "coronary_arteries"];
    structures.forEach(id => {
      const mesh = this.registry.getStructure(id);
      if (mesh) {
        this.originalTransforms.set(id, {
          position: mesh.position.clone(),
          rotation: mesh.rotation.clone(),
          scale: mesh.scale.clone()
        });
      }
    });
  }

  applyCardiacMechanics(phase) {
    this.storeOriginalTransforms();

    const pivotMesh = this.registry.getStructure("heart_pivot");
    const lvMesh = this.registry.getStructure("left_ventricle");
    const rvMesh = this.registry.getStructure("right_ventricle");
    const laMesh = this.registry.getStructure("left_atrium");
    const raMesh = this.registry.getStructure("right_atrium");
    const septumMesh = this.registry.getStructure("septum");
    const shellMesh = this.registry.getStructure("pericardium");

    // Smooth organic cardiac cycle curves
    let vSqueeze = 0;   // Ventricular concentric radial contraction factor (0 to 0.12)
    let aSqueeze = 0;   // Atrial concentric contraction factor
    let vTorsion = 0;   // Apical wringing rotation factor

    if (phase < 0.18) {
      // Atrial Systole: Atria contract inward to pump blood into ventricles
      const t = phase / 0.18;
      aSqueeze = Math.sin(t * Math.PI) * 0.10;
      vSqueeze = -0.02 * Math.sin(t * Math.PI); // Preload filling expansion
    } else if (phase >= 0.18 && phase < 0.50) {
      // Ventricular Systole: Concentric ejection contraction + apical wringing torsion
      const t = (phase - 0.18) / 0.32;
      const pulse = Math.sin(t * Math.PI);
      vSqueeze = pulse * 0.12;   // 12% inward radial contraction
      vTorsion = pulse * 0.04;   // ~2.5 degree wringing torsion
      aSqueeze = -pulse * 0.03;  // Atrial filling expansion
    } else if (phase >= 0.50 && phase < 0.62) {
      // Isovolumetric Relaxation: Recoil back to baseline
      const t = (phase - 0.50) / 0.12;
      vSqueeze = 0.12 * (1.0 - t);
      vTorsion = 0.04 * (1.0 - t);
      aSqueeze = -0.03 * (1.0 - t);
    } else {
      // Diastole: Relaxed filling state
      vSqueeze = 0;
      aSqueeze = 0;
      vTorsion = 0;
    }

    // 1. Animate main 3D presentation heart model pivot
    if (pivotMesh) {
      const orig = this.originalTransforms.get("heart_pivot");
      if (orig) {
        const scaleX = orig.scale.x * (1.0 - vSqueeze * 0.95);
        const scaleZ = orig.scale.z * (1.0 - vSqueeze * 0.95);
        const scaleY = orig.scale.y * (1.0 - vSqueeze * 0.35 + aSqueeze * 0.15);

        pivotMesh.scale.set(scaleX, scaleY, scaleZ);
        pivotMesh.rotation.set(
          orig.rotation.x,
          orig.rotation.y + vTorsion,
          orig.rotation.z
        );
      }
    }

    // 2. Animate individual structure meshes (semantic overlay or multi-part meshes)
    const applyVentricularDeformation = (mesh, origKey) => {
      const orig = this.originalTransforms.get(origKey);
      if (!mesh || !orig) return;

      const scaleX = orig.scale.x * (1.0 - vSqueeze * 1.0);
      const scaleZ = orig.scale.z * (1.0 - vSqueeze * 1.0);
      const scaleY = orig.scale.y * (1.0 - vSqueeze * 0.3);

      mesh.scale.set(scaleX, scaleY, scaleZ);
      mesh.position.copy(orig.position);
      mesh.rotation.set(
        orig.rotation.x,
        orig.rotation.y + vTorsion,
        orig.rotation.z
      );
    };

    const applyAtrialDeformation = (mesh, origKey) => {
      const orig = this.originalTransforms.get(origKey);
      if (!mesh || !orig) return;

      const s = 1.0 - aSqueeze;
      mesh.scale.set(orig.scale.x * s, orig.scale.y * s, orig.scale.z * s);
      mesh.position.copy(orig.position);
      mesh.rotation.copy(orig.rotation);
    };

    applyVentricularDeformation(lvMesh, "left_ventricle");
    applyVentricularDeformation(rvMesh, "right_ventricle");
    applyVentricularDeformation(septumMesh, "septum");

    applyAtrialDeformation(laMesh, "left_atrium");
    applyAtrialDeformation(raMesh, "right_atrium");

    if (shellMesh) {
      const orig = this.originalTransforms.get("pericardium");
      if (orig) {
        const sX = orig.scale.x * (1.0 - vSqueeze * 0.3);
        const sY = orig.scale.y * (1.0 - vSqueeze * 0.15);
        const sZ = orig.scale.z * (1.0 - vSqueeze * 0.3);
        shellMesh.scale.set(sX, sY, sZ);
        shellMesh.position.copy(orig.position);
      }
    }
  }

  updateTelemetry(phase) {
    if (!this.phaseLabel) return;

    if (phase < 0.18) {
      this.phaseLabel.textContent = "Atrial Systole (P-Wave)";
      this.phaseLabel.style.background = "rgba(56, 189, 248, 0.2)";
      this.phaseLabel.style.color = "#38BDF8";

      if (this.lvPressureLabel) this.lvPressureLabel.textContent = "12 / 8 mmHg";
      if (this.rvPressureLabel) this.rvPressureLabel.textContent = "6 / 3 mmHg";
      if (this.strokeVolLabel) this.strokeVolLabel.textContent = "120 mL (EDV max)";
      if (this.heartSoundBadge) this.heartSoundBadge.textContent = "Atrial Kick";
      if (this.avValvesState) {
        this.avValvesState.textContent = "Open (Atrial Ejection)";
        this.avValvesState.className = "valve-state state-open";
      }
      if (this.slValvesState) {
        this.slValvesState.textContent = "Closed";
        this.slValvesState.className = "valve-state state-closed";
      }
    } else if (phase >= 0.18 && phase < 0.24) {
      this.phaseLabel.textContent = "Isovolumetric Contraction (QRS)";
      this.phaseLabel.style.background = "rgba(245, 158, 11, 0.2)";
      this.phaseLabel.style.color = "#F59E0B";

      if (this.lvPressureLabel) this.lvPressureLabel.textContent = "80 / 12 mmHg (Rising)";
      if (this.rvPressureLabel) this.rvPressureLabel.textContent = "15 / 4 mmHg";
      if (this.strokeVolLabel) this.strokeVolLabel.textContent = "120 mL (All valves closed)";
      if (this.heartSoundBadge) this.heartSoundBadge.textContent = "S1 'Lub' (AV Close)";
      if (this.avValvesState) {
        this.avValvesState.textContent = "SNAPPED SHUT (S1)";
        this.avValvesState.className = "valve-state state-closed";
      }
      if (this.slValvesState) {
        this.slValvesState.textContent = "Closed (Pre-ejection)";
        this.slValvesState.className = "valve-state state-closed";
      }
    } else if (phase >= 0.24 && phase < 0.50) {
      this.phaseLabel.textContent = "Rapid Ventricular Ejection";
      this.phaseLabel.style.background = "rgba(239, 68, 68, 0.2)";
      this.phaseLabel.style.color = "#EF4444";

      if (this.lvPressureLabel) this.lvPressureLabel.textContent = "120 mmHg (Peak Systole)";
      if (this.rvPressureLabel) this.rvPressureLabel.textContent = "25 mmHg (Peak Systole)";
      if (this.strokeVolLabel) this.strokeVolLabel.textContent = "70 mL Ejected (EF 58%)";
      if (this.heartSoundBadge) this.heartSoundBadge.textContent = "Systolic Surge";
      if (this.avValvesState) {
        this.avValvesState.textContent = "Closed Tight";
        this.avValvesState.className = "valve-state state-closed";
      }
      if (this.slValvesState) {
        this.slValvesState.textContent = "FORCED OPEN (Ejection)";
        this.slValvesState.className = "valve-state state-open";
      }
    } else if (phase >= 0.50 && phase < 0.62) {
      this.phaseLabel.textContent = "Isovolumetric Relaxation (T-Wave)";
      this.phaseLabel.style.background = "rgba(168, 85, 247, 0.2)";
      this.phaseLabel.style.color = "#A855F7";

      if (this.lvPressureLabel) this.lvPressureLabel.textContent = "70 mmHg (Plummeting)";
      if (this.rvPressureLabel) this.rvPressureLabel.textContent = "10 mmHg";
      if (this.strokeVolLabel) this.strokeVolLabel.textContent = "50 mL (ESV minimum)";
      if (this.heartSoundBadge) this.heartSoundBadge.textContent = "S2 'Dub' (Semilunar Close)";
      if (this.avValvesState) {
        this.avValvesState.textContent = "Closed";
        this.avValvesState.className = "valve-state state-closed";
      }
      if (this.slValvesState) {
        this.slValvesState.textContent = "SLAMMED SHUT (S2)";
        this.slValvesState.className = "valve-state state-closed";
      }
    } else {
      this.phaseLabel.textContent = "Ventricular Diastole (Filling)";
      this.phaseLabel.style.background = "rgba(16, 185, 129, 0.2)";
      this.phaseLabel.style.color = "#10B981";

      if (this.lvPressureLabel) this.lvPressureLabel.textContent = "8 mmHg (Diastolic trough)";
      if (this.rvPressureLabel) this.rvPressureLabel.textContent = "4 mmHg";
      if (this.strokeVolLabel) this.strokeVolLabel.textContent = "Passive Filling (50 -> 110 mL)";
      if (this.heartSoundBadge) this.heartSoundBadge.textContent = "Diastolic Flow";
      if (this.avValvesState) {
        this.avValvesState.textContent = "Open (Rapid Inflow)";
        this.avValvesState.className = "valve-state state-open";
      }
      if (this.slValvesState) {
        this.slValvesState.textContent = "Closed Tight";
        this.slValvesState.className = "valve-state state-closed";
      }
    }
  }

  drawEcgWaveform(currentPhase) {
    if (!this.ecgCtx || !this.ecgCanvas) return;
    const ctx = this.ecgCtx;
    const w = this.ecgCanvas.width;
    const h = this.ecgCanvas.height;

    // Clear background
    ctx.fillStyle = "#090D16";
    ctx.fillRect(0, 0, w, h);

    // Draw subtle medical grid lines
    ctx.strokeStyle = "rgba(0, 229, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Baseline Y
    const baseline = h * 0.65;

    // ECG profile mathematical formula (P, Q, R, S, T)
    const getEcgVoltage = (p) => {
      // p is 0.0 to 1.0
      // P wave: centered at 0.10, height 12
      const pWave = 14 * Math.exp(-Math.pow((p - 0.10) / 0.035, 2));
      // Q wave: centered at 0.20, height -10
      const qWave = -10 * Math.exp(-Math.pow((p - 0.20) / 0.012, 2));
      // R peak: centered at 0.22, height 58
      const rWave = 58 * Math.exp(-Math.pow((p - 0.22) / 0.014, 2));
      // S dip: centered at 0.24, height -18
      const sWave = -18 * Math.exp(-Math.pow((p - 0.24) / 0.015, 2));
      // T wave: centered at 0.54, height 20
      const tWave = 22 * Math.exp(-Math.pow((p - 0.54) / 0.055, 2));

      return pWave + qWave + rWave + sWave + tWave;
    };

    // Draw ECG Lead II trace
    ctx.beginPath();
    ctx.strokeStyle = "#00E5FF";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#00E5FF";
    ctx.shadowBlur = 6;

    for (let x = 0; x < w; x++) {
      const p = x / w;
      const v = getEcgVoltage(p);
      const y = baseline - v;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw ventricular pressure curve (Aortic & LV pressure)
    ctx.beginPath();
    ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
    ctx.lineWidth = 1.5;
    for (let x = 0; x < w; x++) {
      const p = x / w;
      let pressure = 10;
      if (p >= 0.18 && p < 0.58) {
        const t = (p - 0.18) / 0.40;
        pressure = 10 + 45 * Math.sin(t * Math.PI);
      }
      const y = baseline - pressure;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Traveling Sweep Cursor
    const cursorX = currentPhase * w;
    const currentV = getEcgVoltage(currentPhase);
    const cursorY = baseline - currentV;

    // Vertical sweep line
    ctx.beginPath();
    ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.moveTo(cursorX, 0);
    ctx.lineTo(cursorX, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glowing cursor indicator bead
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#F59E0B";
    ctx.shadowColor = "#F59E0B";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  show() {
    if (this.panel) this.panel.classList.remove('hidden');
  }

  hide() {
    if (this.panel) this.panel.classList.add('hidden');
    // Reset meshes to baseline scale
    this.applyCardiacMechanics(0.85);
  }
}
