import { ANATOMY_DATABASE as BRAIN_ANATOMY } from './anatomyData.js';
import { PATHWAY_DATABASE as BRAIN_PATHWAYS } from './pathwayData.js';
import { SCENARIOS_DATABASE as BRAIN_SCENARIOS } from './scenariosData.js';

import { HEART_ANATOMY } from './heartAnatomyData.js';
import { HEART_PATHWAYS } from './heartPathwayData.js';
import { CLINICAL_CASES as BRAIN_CLINICAL } from './clinicalCases.js';
import { HEART_CLINICAL_CASES } from './heartClinicalCases.js';
import { QUIZ_QUESTIONS as BRAIN_QUIZ } from './quizData.js';
import { HEART_QUIZ_QUESTIONS } from './heartQuizData.js';

export { HEART_PATHWAYS };
export const HEART_SCENARIOS = [
  {
    id: "cardiac_cycle",
    title: "Normal Sinus Rhythm",
    icon: "💓",
    description: "Sequential cardiac conduction and blood ejection cycle.",
    category: "physiological",
    duration: 3.6,
    steps: [
      { time: 0.0, structureId: "right_atrium", explanation: "SA Node fires in the right atrium, triggering synchronized atrial depolarization (P Wave).", signalColor: "#1E293B" },
      { time: 0.8, structureId: "valves", explanation: "Tricuspid and Mitral valves open; atria contract to top off ventricular filling (Atrial Kick).", signalColor: "#F1F5F9" },
      { time: 1.6, structureId: "septum", explanation: "AV Node delay allows filling, then Bundle of His rapidly depolarizes the interventricular septum.", signalColor: "#312E81" },
      { time: 2.2, structureId: "left_ventricle", explanation: "Ventricular myocardium contracts with high pressure (QRS Complex). Isovolumetric contraction ends.", signalColor: "#581C87" },
      { time: 2.8, structureId: "aorta", explanation: "Aortic and Pulmonary valves open; blood surges forcefully into systemic and pulmonary circulation.", signalColor: "#78350F" },
      { time: 3.4, structureId: "coronary_arteries", explanation: "Diastole begins: Aortic valve closes (S2); coronary arteries perfuse the relaxing myocardium.", signalColor: "#B45309" }
    ]
  },
  {
    id: "fight_or_flight",
    title: "Adrenaline Surge (Sympathetic)",
    icon: "⚡",
    description: "Epinephrine increases chronotropic heart rate and inotropic ventricular contractility.",
    category: "physiological",
    duration: 3.0,
    steps: [
      { time: 0.0, structureId: "right_atrium", explanation: "Sympathetic beta-1 adrenergic stimulation accelerates SA nodal pacemaker firing rate.", signalColor: "#1E293B" },
      { time: 1.0, structureId: "left_ventricle", explanation: "Intracellular calcium influx intensifies ventricular contractility, elevating stroke volume.", signalColor: "#581C87" },
      { time: 2.0, structureId: "aorta", explanation: "Systolic blood pressure surges as rapid stroke volume is ejected into the aorta and systemic vasculature.", signalColor: "#78350F" }
    ]
  },
  {
    id: "coronary_stemi",
    title: "Acute Coronary Occlusion (STEMI)",
    icon: "⚠️",
    description: "Acute thrombosis of the Left Anterior Descending (LAD) artery causing ischemic injury.",
    category: "clinical",
    duration: 3.2,
    steps: [
      { time: 0.0, structureId: "coronary_arteries", explanation: "Rupture of an atherosclerotic plaque in the proximal LAD produces occlusive thrombosis.", signalColor: "#B45309" },
      { time: 1.2, structureId: "septum", explanation: "Anteroseptal myocardium suffers acute hypoxia and cessation of aerobic ATP generation.", signalColor: "#312E81" },
      { time: 2.2, structureId: "left_ventricle", explanation: "Left ventricular anterior wall hypokinesis occurs, risking cardiogenic shock without PCI revascularization.", signalColor: "#581C87" }
    ]
  }
];

export class DataManager {
  constructor() {
    this.currentOrgan = localStorage.getItem('neuroscope_selected_organ') || 'brain';
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

  getClinicalCases() {
    return this.currentOrgan === 'brain' ? BRAIN_CLINICAL : HEART_CLINICAL_CASES;
  }

  getQuizQuestions() {
    return this.currentOrgan === 'brain' ? BRAIN_QUIZ : HEART_QUIZ_QUESTIONS;
  }
}

export const GlobalData = new DataManager();
