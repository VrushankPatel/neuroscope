/**
 * Cardiovascular Physiology & Anatomy Active Recall Quiz Dataset
 */

export const HEART_QUIZ_QUESTIONS = [
  {
    id: "hq1",
    question: "Where does the primary physiological pacemaker impulse originate in the healthy human heart?",
    options: [
      "Atrioventricular (AV) Node",
      "Sinoatrial (SA) Node in the posterior wall of the Right Atrium",
      "Bundle of His in the interventricular septum",
      "Purkinje fiber arborization"
    ],
    correctIndex: 1,
    explanation: "The Sinoatrial (SA) node acts as the intrinsic pacemaker (~60-100 BPM) due to Phase 4 spontaneous diastolic depolarization via hyperpolarization-activated funny (If) sodium channels."
  },
  {
    id: "hq2",
    question: "During which phase of the cardiac cycle do the coronary arteries primarily perfuse the ventricular myocardium?",
    options: [
      "Ventricular Diastole (during myocardial relaxation)",
      "Rapid Ventricular Ejection (Systole)",
      "Isovolumetric Contraction",
      "Atrial Systole only"
    ],
    correctIndex: 0,
    explanation: "During ventricular systole, high intramyocardial pressure compresses intramural coronary vessels. Perfusion occurs predominantly in diastole when the aortic valve closes and myocardium relaxes."
  },
  {
    id: "hq3",
    question: "The First Heart Sound (S1, 'Lub') is primarily produced by which mechanical event?",
    options: [
      "Closure of the Aortic and Pulmonary semilunar valves",
      "Closure of the Mitral and Tricuspid atrioventricular (AV) valves at the onset of ventricular systole",
      "Rapid passive blood filling of the ventricles in early diastole",
      "Atrial contraction against stiff ventricular walls"
    ],
    correctIndex: 1,
    explanation: "S1 marks the onset of ventricular systole as rising intraventricular pressure exceeds atrial pressure, abruptly slamming the Mitral and Tricuspid valves shut."
  },
  {
    id: "hq4",
    question: "What is the primary function of the intrinsic delay (~0.12s) introduced at the Atrioventricular (AV) Node?",
    options: [
      "To prevent premature semilunar valve opening",
      "To allow adequate time for atrial systole to complete ventricular filling before ventricular contraction",
      "To regenerate resting potassium equilibrium potential",
      "To accelerate signal conduction to the bundle branches"
    ],
    correctIndex: 1,
    explanation: "The AV nodal delay ensures that atrial contraction (atrial kick) finishes topping off ventricular end-diastolic volume (EDV) before the ventricles forcefully contract."
  },
  {
    id: "hq5",
    question: "Which chamber of the heart generates the highest systolic pressure and has the thickest muscular wall?",
    options: [
      "Right Atrium",
      "Right Ventricle",
      "Left Ventricle",
      "Left Atrium"
    ],
    correctIndex: 2,
    explanation: "The Left Ventricle pumps against high-resistance systemic vascular resistance (afterload ~120 mmHg), requiring a myocardium roughly three times thicker than the low-pressure right ventricle."
  }
];
