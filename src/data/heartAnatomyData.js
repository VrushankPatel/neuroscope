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
    color: "#F1F5F9"
  },
  "pericardium": {
    id: "pericardium",
    name: "Pericardium & Epicardial Shell",
    latinName: "Pericardium",
    category: "pericardium",
    system: "cardiovascular",
    hemisphere: "central",
    location: "Fibroserous sac enclosing the heart and the roots of the great vessels.",
    function: "Protects the heart from infection, lubricates cardiac motion, and restricts acute distension.",
    connections: [
      "Diaphragm (Pericardiacophrenic ligament)",
      "Sternum (Sternopericardial ligaments)"
    ],
    clinicalRelevance: "Acute pericarditis, cardiac tamponade, and pericardial effusion.",
    references: ["Netter's Atlas of Human Anatomy"],
    color: "#0F172A"
  },
  "septum": {
    id: "septum",
    name: "Interventricular Septum",
    latinName: "Septum interventriculare cordis",
    category: "septum",
    system: "cardiovascular",
    hemisphere: "central",
    location: "Muscular and membranous dividing wall separating the left and right ventricles.",
    function: "Provides structural partition and carries the Bundle of His and bundle branches for ventricular depolarization.",
    connections: [
      "AV Node",
      "Purkinje Fibers",
      "Left & Right Ventricular Walls"
    ],
    clinicalRelevance: "Ventricular Septal Defect (VSD) and asymmetric septal hypertrophy in HOCM.",
    references: ["Guyton & Hall, Medical Physiology"],
    color: "#312E81"
  },
  "coronary_arteries": {
    id: "coronary_arteries",
    name: "Coronary Arterial Vasculature",
    latinName: "Arteriae coronariae",
    category: "vessel",
    system: "cardiovascular",
    hemisphere: "central",
    location: "Arise from the aortic sinuses at the base of the aorta, traversing the atrioventricular and interventricular sulci.",
    function: "Supplies oxygen-rich blood, glucose, and nutrients to the contracting myocardium.",
    connections: [
      "Aortic Root (Sinuses of Valsalva)",
      "Myocardial Capillary Bed"
    ],
    clinicalRelevance: "Coronary artery disease (atherosclerosis), angina pectoris, and acute ST-elevation myocardial infarction (STEMI).",
    references: ["Braunwald's Heart Disease"],
    color: "#B45309"
  }
};
