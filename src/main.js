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
    
    // 3. Whole-Brain Distributed Neural Network & Lightning Engine
    this.networkGraph = new NeuralNetworkGraph(this.sceneManager.scene);
    
    this.organGroup = null;
    this.loadOrgan('brain');

    this.eventBus.on('THEME_CHANGED', ({ theme }) => {
      this.registry.setTheme(theme);
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
    this.exploredControlsUI = new ExploredControlsUI(this.registry, this.explodedManager, this.cameraController, this.eventBus);
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
      this.simEngine.tick(delta);
    });

    this.initEventListeners();
    this.sceneManager.startLoop();
  }

  initEventListeners() {
    this.eventBus.on('ORGAN_CHANGED', ({ organ }) => {
      this.loadOrgan(organ);
    });
    // Neural Network Overlay Toggle Button
    const toggleNetBtn = document.getElementById('btn-toggle-network');
    if (toggleNetBtn) {
      toggleNetBtn.addEventListener('click', () => {
        const active = this.networkGraph.toggle();
        toggleNetBtn.classList.toggle('active', active);
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
      if (mode === 'network') {
        if (this.organGroup) this.organGroup.visible = false;
        this.networkGraph.show();
        this.cellularScene.hide();
        document.getElementById('cellular-panel')?.classList.add('hidden');
      } else if (mode === 'cellular') {
        if (this.organGroup) this.organGroup.visible = false;
        this.networkGraph.hide();
        this.pathwayRenderer.clear();
        this.signalSystem.clear();
        this.cellularScene.show();
        document.getElementById('cellular-panel')?.classList.remove('hidden');
      } else {
        if (this.organGroup) this.organGroup.visible = true;
        this.cellularScene.hide();
        document.getElementById('cellular-panel')?.classList.add('hidden');
      }

      if (mode === 'pathways') {
        this.pathwayRenderer.renderPathway('corticospinal_tract');
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
    if (this.organGroup) {
      this.sceneManager.scene.remove(this.organGroup);
      this.registry.clear();
      this.networkGraph.hide(); // Hide if we switch to heart
      this.pathwayRenderer.clear();
      // Wait, we need to clear the network graph nodes if we switch away from brain
      // But for simplicity, we'll just leave it hidden if heart.
    }

    GlobalData.setOrgan(organId);
    
    // Update UI that depends on the data
    this.landingCardsUI.render();

    if (organId === 'brain') {
      this.modelBuilder = new BrainModelBuilder(this.registry);
      
      this.modelBuilder.onModelLoaded((pivot, rawModel) => {
        this.networkGraph.buildFromBrainMeshes(pivot, rawModel);
      });

      this.organGroup = this.modelBuilder.loadRealBrainModel((loadedGroup) => {
        console.log("Authentic 3D Human Brain loaded successfully!");
        const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
        this.registry.setTheme(initialTheme);
        this.hideLoadingScreen();
        this.networkGraph.show();
      });
      this.sceneManager.scene.add(this.organGroup);
    } else if (organId === 'heart') {
      this.modelBuilder = new HeartModelBuilder(this.registry);
      
      this.organGroup = this.modelBuilder.loadRealModel((loadedGroup) => {
        console.log("Authentic 3D Human Heart loaded successfully!");
        const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
        this.registry.setTheme(initialTheme);
        this.hideLoadingScreen();
        // Hide network graph as heart doesn't use it currently
        this.networkGraph.hide();
      });
      this.sceneManager.scene.add(this.organGroup);
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.classList.add('fade-out');
      }, 400);
    }
  }
}

// Instantiate NeuroScope when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.neuroScope = new NeuroScopeApp();
});
