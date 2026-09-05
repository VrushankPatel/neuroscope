/**
 * Clinical Case Vignettes for Heart 3D Lesion Localization
 */

export const HEART_CLINICAL_CASES = [
  {
    id: "heart_case_01",
    title: "Case 01: Acute Anterior ST-Elevation Myocardial Infarction",
    vignette: "A 55-year-old patient presents with crushing substernal chest pressure radiating to the left arm and jaw, diaphoresis, and ECG revealing ST-segment elevations in leads V1-V4.",
    targetStructureId: "coronary_arteries",
    targetName: "Left Anterior Descending (LAD) Coronary Artery",
    explanation: "Correct! Acute thrombotic occlusion of the Left Anterior Descending (LAD) artery causes acute transmural infarction of the anterior left ventricular wall and septum (STEMI)."
  },
  {
    id: "heart_case_02",
    title: "Case 02: Dyspnea, Angina & Systolic Ejection Murmur",
    vignette: "A 78-year-old patient presents with exertional syncope, progressive dyspnea, and a harsh crescendo-decrescendo systolic ejection murmur radiating to the carotids with a diminished S2 sound.",
    targetStructureId: "valves",
    targetName: "Aortic Valve (Calcific Aortic Stenosis)",
    explanation: "Correct! Age-related calcific degeneration of the aortic valve leaflets restricts systolic left ventricular outflow, producing LV concentric hypertrophy and classic exertional triad of angina, syncope, and heart failure."
  },
  {
    id: "heart_case_03",
    title: "Case 03: Palpitations, Irregular Pulse & Left Atrial Thrombus",
    vignette: "A 64-year-old patient experiences sudden palpitations, fatigue, and an 'irregularly irregular' pulse. Transthoracic echocardiogram reveals marked atrial dilatation and stasis.",
    targetStructureId: "left_atrium",
    targetName: "Left Atrium / Left Atrial Appendage",
    explanation: "Correct! Atrial fibrillation impairs organized atrial contraction, leading to blood stasis, especially within the left atrial appendage (LAA), creating high risk of cardioembolic stroke."
  }
];
