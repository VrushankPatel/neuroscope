import { SceneManager } from './scene/SceneManager.js';
import { CameraController } from './scene/CameraController.js';
import { LightingManager } from './scene/Lighting.js';
import { ParticleEnvironment } from './scene/ParticleEnvironment.js';

import { AnatomicalAssetRegistry } from './anatomy/AnatomicalAssetRegistry.js';
import { BrainModelBuilder } from './anatomy/BrainModelBuilder.js';
import { HeartModelBuilder } from './anatomy/HeartModelBuilder.js';
import { AnatomySelectionManager } from './anatomy/AnatomySelectionManager.js';
import { ExplodedViewManager } from './anatomy/ExplodedViewManager.js';

import { NeuralNetworkGraph } from './network/NeuralNetworkGraph.js';
import { CardiacFlowSystem } from './cardiac/CardiacFlowSystem.js';
import { CardiacCycleAnimator } from './cardiac/CardiacCycleAnimator.js';
import { BodyContextManager } from './scene/BodyContextManager.js';

import { EventBus } from './simulation/EventBus.js';
import { SimulationEngine } from './simulation/SimulationEngine.js';
import { ScenarioRunner } from './simulation/ScenarioRunner.js';
import { PathwayGraph } from './pathways/PathwayGraph.js';
import { PathwayRenderer } from './pathways/PathwayRenderer.js';
import { SignalParticleSystem } from './simulation/SignalParticleSystem.js';

import { CellularScene } from './cellular/CellularScene.js';
import { ActionPotentialSim } from './cellular/ActionPotentialSim.js';
import { SynapseSimulator } from './cellular/SynapseSimulator.js';

import { NavigationUI } from './ui/Navigation.js';
import { OrganSelectorUI } from './ui/OrganSelectorUI.js';
import { LandingCardsUI } from './ui/LandingCards.js';
import { ContextPanelUI } from './ui/ContextPanel.js';
import { TimelineUI } from './ui/TimelineUI.js';
import { SearchModalUI } from './ui/SearchModal.js';
import { ExploredControlsUI } from './ui/ExploredControlsUI.js';
import { StudyQuizUI } from './ui/StudyQuizUI.js';
import { ClinicalUI } from './ui/ClinicalUI.js';
import { ExplainModalUI } from './ui/ExplainModal.js';
import { TooltipUI } from './ui/TooltipUI.js';
import { FactsWidgetUI } from './ui/FactsWidgetUI.js';

import { PerformanceMonitor } from './utils/PerformanceMonitor.js';
import { GlobalData } from './data/GlobalData.js';
import * as THREE from 'three';

class NeuroScopeApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.eventBus = new EventBus();

    // 1. Scene Foundation
    this.sceneManager = new SceneManager(this.container);
    this.cameraController = new CameraController(this.sceneManager.camera, this.sceneManager.renderer.domElement);
    this.lightingManager = new LightingManager(this.sceneManager.scene);
    this.particleEnv = new ParticleEnvironment(this.sceneManager.scene);

    // 2. Anatomy Engine Core
    this.registry = new AnatomicalAssetRegistry();
    
    // 3. Whole-Brain Distributed Neural Network & Cardiac Systems
    this.networkGraph = new NeuralNetworkGraph(this.sceneManager.scene);
    this.cardiacFlow = new CardiacFlowSystem(this.sceneManager.scene);
    this.cardiacCycle = new CardiacCycleAnimator(this.registry, this.eventBus);
    this.bodyContextManager = new BodyContextManager(this.sceneManager.scene, this.eventBus);
    
    this.organGroup = null;
    this.currentMode = 'explore';
    this.isConductionActive = false;
    this.conductionSignalProgress = 0;

    this.eventBus.on('THEME_CHANGED', ({ theme }) => {
      this.registry.setTheme(theme);
      this.bodyContextManager.setTheme(theme);
    });

    this.selectionManager = new AnatomySelectionManager(
      this.sceneManager.camera,
      this.registry,
      this.eventBus,
      this.sceneManager.renderer.domElement
    );
    this.explodedManager = new ExplodedViewManager(this.registry);

    // 4. Pathways & Simulation Engine
    this.pathwayGraph = new PathwayGraph();
    this.pathwayRenderer = new PathwayRenderer(this.sceneManager.scene, this.pathwayGraph);
    this.signalSystem = new SignalParticleSystem(this.sceneManager.scene);

    this.simEngine = new SimulationEngine(this.eventBus);
    this.scenarioRunner = new ScenarioRunner(
      this.simEngine,
      this.pathwayRenderer,
      this.signalSystem,
      this.registry,
      this.cameraController,
      this.eventBus,
      this.networkGraph // PASS IN networkGraph
    );

    // 5. Cellular Micro-Scale System
    this.cellularScene = new CellularScene(this.sceneManager.scene);
    this.cellularScene.buildNeuronModel();

    const oscCanvas = document.getElementById('oscilloscope-canvas');
    const badge = document.getElementById('membrane-voltage');
    const phaseText = document.getElementById('ap-phase');
    this.actionPotentialSim = new ActionPotentialSim(oscCanvas, badge, phaseText);

    const triggerApBtn = document.getElementById('btn-trigger-ap');
    if (triggerApBtn) {
      triggerApBtn.addEventListener('click', () => this.actionPotentialSim.triggerActionPotential());
    }

    const ntSelector = document.getElementById('nt-selector');
    const ntDesc = document.getElementById('nt-desc');
    this.synapseSim = new SynapseSimulator(ntSelector, ntDesc);

    // 6. UI Layer & Interactive Tooltip
    this.navUI = new NavigationUI(this.eventBus, this.sceneManager, this.lightingManager, this.particleEnv);
    this.landingCardsUI = new LandingCardsUI(document.getElementById('thought-cards'), this.eventBus);
    this.contextPanelUI = new ContextPanelUI(document.getElementById('info-panel'), this.eventBus);
    this.timelineUI = new TimelineUI(document.getElementById('timeline-container'), this.simEngine, this.eventBus);
    this.searchModalUI = new SearchModalUI(this.eventBus);
    this.exploredControlsUI = new ExploredControlsUI(this.registry, this.explodedManager, this.cameraController, this.eventBus, this.bodyContextManager);
    this.studyQuizUI = new StudyQuizUI(this.eventBus);
    this.clinicalUI = new ClinicalUI(this.eventBus);
    this.explainModalUI = new ExplainModalUI(this.eventBus);
    this.tooltipUI = new TooltipUI(this.eventBus);
    this.factsWidgetUI = new FactsWidgetUI();
    this.organSelectorUI = new OrganSelectorUI(this.eventBus);

    this.perfMonitor = new PerformanceMonitor(this.sceneManager, this.eventBus);

    // Register Render Loop updates
    this.sceneManager.addRenderCallback((delta, time) => {
      this.cameraController.update(delta);
      this.particleEnv.update(time);
      this.networkGraph.update(delta, time);
      this.cardiacFlow.update(delta, time);
      this.cardiacCycle.update(delta);
      this.bodyContextManager.update(this.sceneManager.camera, delta, time);
      this.simEngine.tick(delta);
      if (this.isConductionActive && this.currentMode === 'pathways') {
        this.conductionSignalProgress = (this.conductionSignalProgress + delta * 0.75) % 1.0;
        this.signalSystem.updateProgress(this.conductionSignalProgress);
      }
    });

    this.initEventListeners();
    const savedOrgan = localStorage.getItem('neuroscope_selected_organ') || 'brain';
    this.navUI.setOrgan(savedOrgan);
    this.loadOrgan(savedOrgan);
    this.sceneManager.startLoop();
  }

  initEventListeners() {
    this.eventBus.on('ORGAN_CHANGED', ({ organ }) => {
      localStorage.setItem('neuroscope_selected_organ', organ);
      this.navUI.setOrgan(organ);
      this.loadOrgan(organ);
    });

    // Neural Network / Blood Flow Overlay Toggle Button
    const toggleNetBtn = document.getElementById('btn-toggle-network');
    if (toggleNetBtn) {
      toggleNetBtn.addEventListener('click', () => {
        const isHeart = GlobalData.currentOrgan === 'heart';
        if (isHeart) {
          const active = this.cardiacFlow.toggle();
          toggleNetBtn.classList.toggle('active', active);
        } else {
          const active = this.networkGraph.toggle();
          toggleNetBtn.classList.toggle('active', active);
        }
      });
    }

    // Dynamic Lightning Strike Activation when scenario steps start
    this.eventBus.on('STEP_STARTED', ({ step }) => {
      if (step && step.structureId) {
        const activeMesh = this.registry.getStructure(step.structureId);
        if (activeMesh) {
          const startPos = activeMesh.position.clone();
          const targetPos = new THREE.Vector3(0.0, 0.35, 0.1); // White matter core
          this.networkGraph.triggerLightningStrike(startPos, targetPos, step.signalColor || "#00E5FF", 3);
        }
      }
    });

    // Mode Switching
    this.eventBus.on('MODE_CHANGED', ({ mode }) => {
      this.currentMode = mode;
      const isHeart = GlobalData.currentOrgan === 'heart';

      if (mode === 'network') {
        // Blood Flow (Heart) or Neural Network (Brain)
        if (isHeart) {
          if (this.organGroup) this.organGroup.visible = true;
          this.registry.setCortexOpacity(0.18);
          this.networkGraph.hide();
          this.cardiacFlow.show();
          this.isConductionActive = false;
          this.pathwayRenderer.clear();
          this.signalSystem.clear();
          this.cardiacCycle.hide();
        } else {
          if (this.organGroup) this.organGroup.visible = false;
          this.networkGraph.show();
          this.cardiacFlow.hide();
          this.isConductionActive = false;
          this.pathwayRenderer.clear();
          this.signalSystem.clear();
        }
        this.cellularScene.hide();
        document.getElementById('cellular-panel')?.classList.add('hidden');
        this.cardiacCycle.hide();
      } else if (mode === 'pathways') {
        // Conduction (Heart) or Pathways (Brain)
        if (isHeart) {
          if (this.organGroup) this.organGroup.visible = true;
          this.registry.setCortexOpacity(0.16);
          this.networkGraph.hide();
          this.cardiacFlow.hide();
          this.cardiacCycle.hide();
          this.pathwayRenderer.renderPathway('cardiac_conduction');
          const curve = this.pathwayGraph.getSplineCurve('cardiac_conduction');
          if (curve) {
            this.signalSystem.setPathway(curve, "#F59E0B");
            this.isConductionActive = true;
            this.conductionSignalProgress = 0;
          }
        } else {
          if (this.organGroup) this.organGroup.visible = true;
          this.networkGraph.hide();
          this.cardiacFlow.hide();
          this.isConductionActive = false;
          this.pathwayRenderer.renderPathway('corticospinal_tract');
        }
        this.cellularScene.hide();
        document.getElementById('cellular-panel')?.classList.add('hidden');
        this.cardiacCycle.hide();
      } else if (mode === 'cellular') {
        // Pumping & Ventricles (Heart) or Cellular (Brain)
        if (isHeart) {
          if (this.organGroup) this.organGroup.visible = true;
          this.registry.setCortexOpacity(0.22);
          this.networkGraph.hide();
          this.cardiacFlow.hide();
          this.pathwayRenderer.clear();
          this.signalSystem.clear();
          this.isConductionActive = false;
          this.cellularScene.hide();
          document.getElementById('cellular-panel')?.classList.add('hidden');
          this.cardiacCycle.show();
        } else {
          if (this.organGroup) this.organGroup.visible = false;
          this.networkGraph.hide();
          this.cardiacFlow.hide();
          this.pathwayRenderer.clear();
          this.signalSystem.clear();
          this.isConductionActive = false;
          this.cardiacCycle.hide();
          this.cellularScene.show();
          document.getElementById('cellular-panel')?.classList.remove('hidden');
        }
      } else {
        // explore, clinical, quiz
        if (this.organGroup) this.organGroup.visible = true;
        if (isHeart) {
          this.networkGraph.hide();
          this.cardiacFlow.hide();
          this.isConductionActive = false;
          this.pathwayRenderer.clear();
          this.signalSystem.clear();
          this.cardiacCycle.hide();
        } else {
          this.cardiacFlow.hide();
          this.isConductionActive = false;
        }
        this.cellularScene.hide();
        document.getElementById('cellular-panel')?.classList.add('hidden');
        this.cardiacCycle.hide();
      }
    });

    // Scenario selection from bottom thought chips
    this.eventBus.on('SCENARIO_SELECTED', ({ scenarioId }) => {
      const scenario = GlobalData.getScenarios().find(s => s.id === scenarioId);
      if (scenario) {
        this.simEngine.loadScenario(scenario);
        this.simEngine.play();
      }
    });

    // Structure selected -> Zoom and fly INSIDE the brain to the target structure
    this.eventBus.on('STRUCTURE_SELECTED', ({ mesh, position }) => {
      if (position) {
        this.cameraController.zoomInside(position, 1.4);
        // Automatically make outer shell ghost-transparent so interior is visible
        this.registry.setCortexOpacity(0.18);
        const slider = document.getElementById('opacity-slider');
        const valText = document.getElementById('opacity-val');
        if (slider) slider.value = 18;
        if (valText) valText.textContent = '18%';

        // Trigger an electric synaptic discharge right at the selected structure
        const corePos = new THREE.Vector3(0.0, 0.35, 0.1);
        this.networkGraph.triggerLightningStrike(position, corePos, "#00E5FF", 3);
      }
    });
  }

  loadOrgan(organId) {
    this.showLoadingScreen(`Loading 3D ${organId === 'brain' ? 'Brain' : 'Heart'}...`);

    if (this.organGroup) {
      this.sceneManager.scene.remove(this.organGroup);
      this.registry.clear();
      this.explodedManager.originalPositions.clear();
      this.explodedManager.isExploded = false;
      this.networkGraph.hide();
      this.cardiacFlow.hide();
      this.cardiacCycle.hide();
      this.isConductionActive = false;
      this.pathwayRenderer.clear();
      this.signalSystem.clear();
      this.cameraController.reset();
    }

    GlobalData.setOrgan(organId);
    if (this.bodyContextManager) {
      this.bodyContextManager.setOrgan(organId);
    }
    if (this.navUI) {
      this.navUI.setOrgan(organId);
    }
    if (this.organSelectorUI) {
      this.organSelectorUI.setOrgan(organId);
    }
    
    // Update UI that depends on the data
    if (this.landingCardsUI) {
      this.landingCardsUI.render();
      this.landingCardsUI.showOverlay();
    }

    // Close any opened panels
    document.getElementById('info-panel')?.classList.add('hidden');
    document.getElementById('timeline-container')?.classList.add('hidden');

    if (organId === 'brain') {
      this.modelBuilder = new BrainModelBuilder(this.registry);
      
      this.modelBuilder.onModelLoaded((pivot, rawModel) => {
        this.networkGraph.buildFromBrainMeshes(pivot, rawModel);
      });

      this.organGroup = this.modelBuilder.loadRealBrainModel(
        (loadedGroup) => {
          console.log("Authentic 3D Human Brain loaded successfully!");
          const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
          this.registry.setTheme(initialTheme);
          this.registry.setCortexOpacity(0.22);
          this.hideLoadingScreen();
          this.cardiacFlow.hide();
          this.cardiacCycle.hide();

          if (this.currentMode === 'network') {
            this.networkGraph.show();
            if (this.organGroup) this.organGroup.visible = false;
          } else if (this.currentMode === 'pathways') {
            this.pathwayRenderer.renderPathway('corticospinal_tract');
          } else if (this.currentMode === 'cellular') {
            this.cellularScene.show();
            document.getElementById('cellular-panel')?.classList.remove('hidden');
          } else {
            this.networkGraph.show();
          }

          const enterBtn = document.getElementById('btn-enter-brain');
          if (enterBtn) {
            enterBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m10 8 4 4-4 4"/></svg> Enter Brain';
            enterBtn.title = "Fly camera inside the brain";
          }
          const slider = document.getElementById('opacity-slider');
          const valText = document.getElementById('opacity-val');
          if (slider) slider.value = 22;
          if (valText) valText.textContent = '22%';
        },
        (err) => {
          console.error("Brain model load error:", err);
          this.hideLoadingScreen();
        }
      );
      this.sceneManager.scene.add(this.organGroup);
    } else if (organId === 'heart') {
      this.modelBuilder = new HeartModelBuilder(this.registry);
      
      this.organGroup = this.modelBuilder.loadRealModel(
        (loadedGroup) => {
          console.log("Authentic 3D Human Heart loaded successfully!");
          const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
          this.registry.setTheme(initialTheme);
          this.registry.setCortexOpacity(0.22);
          this.hideLoadingScreen();
          this.networkGraph.hide();

          if (this.currentMode === 'network') {
            this.cardiacFlow.show();
            this.cardiacCycle.hide();
          } else if (this.currentMode === 'pathways') {
            this.cardiacFlow.hide();
            this.cardiacCycle.hide();
            this.pathwayRenderer.renderPathway('cardiac_conduction');
            const curve = this.pathwayGraph.getSplineCurve('cardiac_conduction');
            if (curve) {
              this.signalSystem.setPathway(curve, "#F59E0B");
              this.isConductionActive = true;
              this.conductionSignalProgress = 0;
            }
          } else if (this.currentMode === 'cellular') {
            this.cardiacFlow.hide();
            this.cardiacCycle.show();
          } else {
            // explore mode
            this.cardiacFlow.show();
            this.cardiacCycle.hide();
          }

          const enterBtn = document.getElementById('btn-enter-brain');
          if (enterBtn) {
            enterBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m10 8 4 4-4 4"/></svg> Enter Heart';
            enterBtn.title = "Fly camera inside the heart";
          }
          const slider = document.getElementById('opacity-slider');
          const valText = document.getElementById('opacity-val');
          if (slider) slider.value = 22;
          if (valText) valText.textContent = '22%';
        },
        (err) => {
          console.error("Heart model load error:", err);
          this.hideLoadingScreen();
        }
      );
      this.sceneManager.scene.add(this.organGroup);
    }
  }

  showLoadingScreen(message = "Loading...") {
    const loadingScreen = document.getElementById('loading-screen');
    const status = document.getElementById('loading-status');
    if (status) status.textContent = message;
    if (loadingScreen) {
      loadingScreen.classList.remove('fade-out');
      loadingScreen.style.display = 'flex';
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 500);
      }, 300);
    }
  }
}

// Instantiate NeuroScope when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.neuroScope = new NeuroScopeApp();
});
