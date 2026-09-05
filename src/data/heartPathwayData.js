/**
 * Cardiac Electrical Conduction & Coronary Circulation Pathways
 * Accurately mapped to the authentic 3D human heart coordinates.
 */

export const HEART_PATHWAYS = {
  "cardiac_conduction": {
    id: "cardiac_conduction",
    name: "Cardiac Conduction System",
    type: "electrical",
    color: "#F59E0B", // Luminous Gold / Amber
    description: "Sinoatrial (SA) node pacemaker initiates the cardiac impulse, traversing internodal pathways to the AV node delay, through the Bundle of His, bundle branches, and Purkinje fibers to trigger coordinated ventricular systole.",
    nodes: [
      { id: "sa_node", pos: [0.75, 0.70, 0.12], label: "Sinoatrial (SA) Node Pacemaker" },
      { id: "internodal_tract", pos: [0.35, 0.40, 0.18], label: "Internodal Pathways (Atrial Kick)" },
      { id: "av_node", pos: [0.15, 0.18, 0.16], label: "Atrioventricular (AV) Node (0.12s delay)" },
      { id: "bundle_of_his", pos: [0.00, 0.00, 0.18], label: "Bundle of His" },
      { id: "septal_branches", pos: [-0.10, -0.45, 0.22], label: "Left & Right Bundle Branches" },
      { id: "apical_conduction", pos: [-0.45, -0.92, 0.25], label: "Interventricular Apical Turn" },
      { id: "purkinje_fibers", pos: [-0.68, -0.65, 0.20], label: "Purkinje Fiber Arborization (LV & RV)" }
    ]
  },
  "coronary_circulation": {
    id: "coronary_circulation",
    name: "Coronary Arterial Perfusion",
    type: "vascular",
    color: "#EF4444", // Vascular Red
    description: "Myocardial perfusion originating from the aortic root sinuses, delivering oxygenated blood to the left and right ventricular myocardium during diastole.",
    nodes: [
      { id: "aortic_root", pos: [-0.05, 0.55, 0.15], label: "Sinuses of Valsalva (Aortic Root)" },
      { id: "left_main", pos: [-0.20, 0.35, 0.28], label: "Left Main Coronary Artery" },
      { id: "lad_artery", pos: [-0.12, 0.00, 0.42], label: "Left Anterior Descending (LAD)" },
      { id: "diagonal_branch", pos: [-0.30, -0.40, 0.35], label: "Diagonal & Septal Perforators" },
      { id: "apical_perfusion", pos: [-0.48, -0.88, 0.24], label: "Apical Microvascular Plexus" }
    ]
  }
};
