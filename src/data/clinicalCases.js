/**
 * Clinical Case Vignettes for 3D Lesion Localization
 */

export const CLINICAL_CASES = [
  {
    id: "case_01",
    title: "Case 01: Acute Right Arm & Lower Face Paresis",
    vignette: "A 68-year-old patient presents to the ER with sudden weakness in the right arm and lower right face, accompanied by labored, non-fluent speech attempt. Sensory perception remains largely intact.",
    targetStructureId: "primary_motor_cortex",
    targetName: "Left Primary Motor Cortex (Superior Middle Cerebral Artery territory)",
    explanation: "Correct! Infarction of the left M1 motor homunculus region controlling the contralateral arm and lower face produces contralateral hemiparesis and Broca's motor speech deficit."
  },
  {
    id: "case_02",
    title: "Case 02: Resting Tremor & Bradykinesia",
    vignette: "A 72-year-old patient exhibits pill-rolling resting tremor, muscular rigidity, shuffle gait, and difficulty initiating voluntary movement.",
    targetStructureId: "basal_ganglia",
    targetName: "Basal Ganglia / Substantia Nigra",
    explanation: "Correct! Loss of dopaminergic neurons in the substantia nigra pars compacta disinhibits basal ganglia output, causing Parkinsonian hypokinesia."
  },
  {
    id: "case_03",
    title: "Case 03: Intentional Tremor & Ataxia",
    vignette: "A patient presents with wide-based unsteady gait, dysmetria on finger-to-nose testing, and intention tremor that worsens as the target is reached.",
    targetStructureId: "cerebellum",
    targetName: "Cerebellum",
    explanation: "Correct! Cerebellar hemisphere lesions impair error-correction and motor coordination, leading to ipsilateral limb ataxia and intention tremor."
  }
];
