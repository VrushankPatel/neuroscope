/**
 * Neural Pathways Data Model
 * Maps 3D spatial node coordinates and CatmullRom spline trajectories embedded inside the authentic 3D brain model.
 */

export const PATHWAY_DATABASE = {
  "corticospinal_tract": {
    id: "corticospinal_tract",
    name: "Lateral Corticospinal Tract",
    type: "motor",
    color: "#00E5FF",
    description: "Primary descending motor pathway originating in M1, passing through internal capsule and medullary pyramids to the spinal cord.",
    nodes: [
      { id: "prefrontal_cortex", pos: [-0.68, 0.65, 0.72], label: "Motor Intention (PFC)" },
      { id: "primary_motor_cortex", pos: [-0.72, 0.82, -0.68], label: "Execution (M1)" },
      { id: "corpus_callosum", pos: [0.00, 0.35, 0.10], label: "Internal Capsule" },
      { id: "brainstem", pos: [0.06, -0.42, 0.15], label: "Brainstem (Pons & Medulla)" },
      { id: "pyramidal_decussation", pos: [0.06, -0.75, 0.15], label: "Pyramidal Decussation" },
      { id: "cervical_spinal_cord", pos: [0.06, -1.25, 0.15], label: "Spinal Motor Output" }
    ]
  },
  "spinothalamic_tract": {
    id: "spinothalamic_tract",
    name: "Spinothalamic Pain & Temperature Pathway",
    type: "pain",
    color: "#EF4444",
    description: "Ascending sensory pathway conveying nociceptive signals through spinal cord and brainstem to thalamus and somatosensory cortex.",
    nodes: [
      { id: "cervical_spinal_cord", pos: [0.06, -1.25, 0.15], label: "Spinal Posterior Horn" },
      { id: "brainstem", pos: [0.06, -0.42, 0.15], label: "Brainstem Ascending Tract" },
      { id: "thalamus", pos: [0.00, 0.25, 0.10], label: "Thalamus (VPL Relay)" },
      { id: "primary_somatosensory_cortex", pos: [0.68, -0.08, -1.29], label: "Primary Somatosensory Cortex (S1)" }
    ]
  },
  "visual_pathway": {
    id: "visual_pathway",
    name: "Visual Pathway",
    type: "sensory",
    color: "#FFB300",
    description: "Visual signal transmission from optic tract through thalamic LGN to primary visual cortex (V1).",
    nodes: [
      { id: "optic_tract", pos: [0.00, -0.15, 0.35], label: "Optic Chiasm / Tract" },
      { id: "thalamus", pos: [0.00, 0.25, 0.10], label: "LGN (Thalamus)" },
      { id: "primary_visual_cortex", pos: [-0.68, -0.09, -1.29], label: "Primary Visual Cortex (V1)" }
    ]
  },
  "speech_language_pathway": {
    id: "speech_language_pathway",
    name: "Language & Speech Planning Pathway",
    type: "cognitive",
    color: "#A855F7",
    description: "Wernicke's language comprehension linked through arcuate fasciculus to Broca's speech motor planning and M1.",
    nodes: [
      { id: "wernicke_area", pos: [-0.80, -0.19, 0.06], label: "Wernicke's Area (Comprehension)" },
      { id: "corpus_callosum", pos: [0.00, 0.35, 0.10], label: "Arcuate Fasciculus Tract" },
      { id: "broca_area", pos: [0.67, 0.65, 0.72], label: "Broca's Area (Motor Speech Plan)" },
      { id: "primary_motor_cortex", pos: [-0.72, 0.82, -0.68], label: "M1 Speech Motor Output" }
    ]
  }
};
