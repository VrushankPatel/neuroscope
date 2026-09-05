import { ANATOMY_DATABASE as BRAIN_ANATOMY } from './anatomyData.js';
import { PATHWAY_DATABASE as BRAIN_PATHWAYS } from './pathwayData.js';
import { SCENARIOS_DATABASE as BRAIN_SCENARIOS } from './scenariosData.js';

import { HEART_ANATOMY } from './heartAnatomyData.js';
// We'll create empty pathways and scenarios for the heart for now
export const HEART_PATHWAYS = {};
export const HEART_SCENARIOS = [
  {
    id: "normal_sinus",
    title: "Normal Sinus Rhythm",\n    icon: "💓",
    description: "Standard cardiac cycle.",
    category: "physiological",
    duration: 3.5,
    steps: [
      { time: 0.0, structureId: "right_atrium", explanation: "SA Node fires, causing atrial depolarization.", signalColor: "#F87171" },
      { time: 1.0, structureId: "left_ventricle", explanation: "AV Node delay, followed by ventricular depolarization (QRS complex) and contraction.", signalColor: "#EF4444" },
      { time: 2.5, structureId: "valves", explanation: "Aortic and Pulmonary valves open, ejecting blood.", signalColor: "#F8FAFC" }
    ]
  }
];

export class DataManager {
  constructor() {
    this.currentOrgan = 'brain';
  }

  setOrgan(organId) {
    this.currentOrgan = organId;
  }

  getAnatomy() {
    return this.currentOrgan === 'brain' ? BRAIN_ANATOMY : HEART_ANATOMY;
  }

  getPathways() {
    return this.currentOrgan === 'brain' ? BRAIN_PATHWAYS : HEART_PATHWAYS;
  }

  getScenarios() {
    return this.currentOrgan === 'brain' ? BRAIN_SCENARIOS : HEART_SCENARIOS;
  }
}

export const GlobalData = new DataManager();
