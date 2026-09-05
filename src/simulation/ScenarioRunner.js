import * as THREE from 'three';

export class ScenarioRunner {
  constructor(simulationEngine, pathwayRenderer, signalSystem, registry, cameraController, eventBus, networkGraph) {
    this.simEngine = simulationEngine;
    this.pathwayRenderer = pathwayRenderer;
    this.signalSystem = signalSystem;
    this.registry = registry;
    this.cameraController = cameraController;
    this.eventBus = eventBus;
    this.networkGraph = networkGraph;

    this.currentScenario = null;
    this.activeStepIndex = -1;

    // Listen to simulation clock ticks
    this.eventBus.on('SIMULATION_TICK', this.onTick.bind(this));
    this.eventBus.on('SCENARIO_LOADED', this.onScenarioLoaded.bind(this));
  }

  onScenarioLoaded({ scenario }) {
    this.currentScenario = scenario;
    this.activeStepIndex = -1;

    // We no longer render the standalone spline pathways when a scenario runs,
    // the NeuralNetworkGraph will handle activation visualization.
    this.pathwayRenderer.clear();
    this.signalSystem.clear();
    
    // Switch into network mode to see the nodes glowing if we want?
    // Actually, maybe we just leave the current mode but make sure we can see it.
    // If we want to hide the brain for scenario, we could dispatch MODE_CHANGED. 
    // The user just said "Note that when i click on Neural network on top tabs, it should hide the brains and show only the neural networks being activated and doing whatever they are doing, properly distributed and all" 
  }

  onTick({ currentTime, progressRatio }) {
    if (!this.currentScenario) return;

    // 2. Determine current step based on currentTime
    const steps = this.currentScenario.steps;
    let newStepIndex = steps.length - 1;

    for (let i = 0; i < steps.length; i++) {
      if (currentTime >= steps[i].time && currentTime < steps[i].endTime) {
        newStepIndex = i;
        break;
      }
    }

    if (newStepIndex !== this.activeStepIndex) {
      this.activeStepIndex = newStepIndex;
      const currentStep = steps[this.activeStepIndex];

      // Highlight active anatomical structure with dynamic signal glow
      if (currentStep.structureId) {
        this.registry.highlightStructure(currentStep.structureId, currentStep.signalColor);
        
        // Pulse actual neural network nodes in that region
        if (this.networkGraph) {
          const mesh = this.registry.getStructure(currentStep.structureId);
          let colorHex = currentStep.signalColor; // fallback
          if (mesh && mesh.material && mesh.material.color) {
            colorHex = "#" + mesh.material.color.getHexString();
          }
          this.networkGraph.setActiveScenarioRegion(currentStep.structureId, colorHex);
        }
      } else {
        if (this.networkGraph) {
          this.networkGraph.setActiveScenarioRegion(null);
        }
      }

      // Pulse pathway node (if we still have the UI timeline using it)
      this.pathwayRenderer.pulseNode(this.activeStepIndex);

      // Emit stage change event to UI
      this.eventBus.emit('STAGE_CHANGED', {
        stepIndex: this.activeStepIndex,
        step: currentStep
      });
    }
  }
}
