export const HEART_ANATOMY = {
  "left_ventricle": {
    id: "left_ventricle",
    name: "Left Ventricle",
    latinName: "Ventriculus sinister",
    category: "ventricle",
    system: "cardiovascular",
    hemisphere: "left",
    location: "Lower left portion of the heart.",
    function: "Pumps oxygenated blood through the aortic valve to the entire body. Features the thickest myocardium.",
    connections: [
      "Left Atrium (via Mitral Valve)",
      "Aorta (via Aortic Valve)"
    ],
    clinicalRelevance: "Left ventricular hypertrophy (LVH), myocardial infarction, and congestive heart failure.",
    references: ["Guyton & Hall, Medical Physiology, Ch. 9"],
    color: "#EF4444" // Deep Red
  },
  "right_ventricle": {
    id: "right_ventricle",
    name: "Right Ventricle",
    latinName: "Ventriculus dexter",
    category: "ventricle",
    system: "cardiovascular",
    hemisphere: "right",
    location: "Lower right portion of the heart.",
    function: "Pumps deoxygenated blood through the pulmonary valve to the lungs for oxygenation.",
    connections: [
      "Right Atrium (via Tricuspid Valve)",
      "Pulmonary Artery (via Pulmonary Valve)"
    ],
    clinicalRelevance: "Right-sided heart failure (Cor Pulmonale) often secondary to pulmonary hypertension.",
    references: ["Guyton & Hall, Medical Physiology, Ch. 9"],
    color: "#EF4444"
  },
  "left_atrium": {
    id: "left_atrium",
    name: "Left Atrium",
    latinName: "Atrium sinistrum",
    category: "atrium",
    system: "cardiovascular",
    hemisphere: "left",
    location: "Upper left chamber.",
    function: "Receives oxygenated blood from the pulmonary veins and pumps it to the left ventricle.",
    connections: [
      "Pulmonary Veins",
      "Left Ventricle"
    ],
    clinicalRelevance: "Atrial fibrillation can lead to blood stasis and subsequent stroke.",
    references: ["Netter's Clinical Anatomy"],
    color: "#F87171"
  },
  "right_atrium": {
    id: "right_atrium",
    name: "Right Atrium",
    latinName: "Atrium dextrum",
    category: "atrium",
    system: "cardiovascular",
    hemisphere: "right",
    location: "Upper right chamber.",
    function: "Receives deoxygenated blood from the body via vena cavae and pumps it to the right ventricle.",
    connections: [
      "Superior & Inferior Vena Cava",
      "Right Ventricle"
    ],
    clinicalRelevance: "Site of the Sinoatrial (SA) node. Enlargement can occur with pulmonary hypertension.",
    references: ["Netter's Clinical Anatomy"],
    color: "#F87171"
  },
  "aorta": {
    id: "aorta",
    name: "Aorta",
    latinName: "Aorta",
    category: "vessel",
    system: "cardiovascular",
    hemisphere: "central",
    location: "Emerges from the left ventricle, arches over the heart.",
    function: "The main artery that carries oxygen-rich blood away from the heart to the rest of the body.",
    connections: [
      "Left Ventricle",
      "Systemic Arterial Circulation"
    ],
    clinicalRelevance: "Aortic aneurysm, aortic dissection, or coarctation of the aorta.",
    references: ["Guyton & Hall, Medical Physiology"],
    color: "#DC2626"
  },
  "pulmonary_artery": {
    id: "pulmonary_artery",
    name: "Pulmonary Artery",
    latinName: "Truncus pulmonalis",
    category: "vessel",
    system: "cardiovascular",
    hemisphere: "central",
    location: "Emerges from the right ventricle, splitting into left and right branches.",
    function: "Carries deoxygenated blood from the heart to the lungs.",
    connections: [
      "Right Ventricle",
      "Lungs"
    ],
    clinicalRelevance: "Pulmonary embolism or pulmonary arterial hypertension.",
    references: ["Guyton & Hall, Medical Physiology"],
    color: "#3B82F6" // Blue for deoxygenated
  },
  "superior_vena_cava": {
    id: "superior_vena_cava",
    name: "Superior Vena Cava (SVC)",
    latinName: "Vena cava superior",
    category: "vessel",
    system: "cardiovascular",
    hemisphere: "right",
    location: "Enters the superior aspect of the right atrium.",
    function: "Returns deoxygenated blood from the head, neck, and upper limbs to the right atrium.",
    connections: [
      "Upper Systemic Venous Circulation",
      "Right Atrium"
    ],
    clinicalRelevance: "SVC syndrome caused by obstruction (often neoplastic).",
    references: ["Netter's Clinical Anatomy"],
    color: "#2563EB"
  },
  "valves": {
    id: "valves",
    name: "Cardiac Valves (Mitral, Tricuspid, Aortic, Pulmonary)",
    latinName: "Valvae cordis",
    category: "valve",
    system: "cardiovascular",
    hemisphere: "central",
    location: "Between atria and ventricles, and ventricles and outflow tracts.",
    function: "Ensures unidirectional blood flow through the heart chambers.",
    connections: [
      "Atria to Ventricles",
      "Ventricles to Great Vessels"
    ],
    clinicalRelevance: "Valvular stenosis (narrowing) or regurgitation (leaking) requiring repair or replacement.",
    references: ["Guyton & Hall, Medical Physiology"],
    color: "#F8FAFC"
  }
};
