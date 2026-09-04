/**
 * Cellular Scale Data Model
 * Action potential voltage curve coordinates & Neurotransmitter profiles.
 */

export const ACTION_POTENTIAL_DATA = {
  restingVoltage: -70, // mV
  thresholdVoltage: -55,
  peakVoltage: +40,
  hyperpolarizationVoltage: -80,
  phases: [
    { time: 0.0, voltage: -70, phase: "Resting State (Na+/K+ ATPase active)" },
    { time: 0.2, voltage: -55, phase: "Threshold (-55mV reached)" },
    { time: 0.4, voltage: 40, phase: "Depolarization (Voltage-gated Na+ channels open)" },
    { time: 0.6, voltage: -10, phase: "Repolarization (Na+ inactivate, K+ open)" },
    { time: 0.8, voltage: -80, phase: "Hyperpolarization (Undershoot)" },
    { time: 1.0, voltage: -70, phase: "Return to Resting State" }
  ]
};

export const NEUROTRANSMITTERS = {
  glutamate: {
    name: "Glutamate",
    type: "Excitatory",
    description: "Primary excitatory neurotransmitter in CNS. Binds AMPA & NMDA ionotropic receptors causing Na+ influx and EPSP depolarization.",
    clinical: "Excessive glutamate release causes excitotoxicity in ischemic stroke.",
    color: "#00E5FF"
  },
  gaba: {
    name: "GABA (γ-Aminobutyric Acid)",
    type: "Inhibitory",
    description: "Primary inhibitory neurotransmitter in CNS. Binds GABA-A receptors triggering Cl- influx, hyperpolarization, and IPSP inhibition.",
    clinical: "Targeted by benzodiazepines, barbiturates, and general anesthetics.",
    color: "#3B82F6"
  },
  dopamine: {
    name: "Dopamine",
    type: "Modulatory / Reward",
    description: "Catecholamine involved in motor initiation (nigrostriatal path), reward/motivation (mesolimbic path), and executive control.",
    clinical: "Degeneration of substantia nigra dopaminergic neurons causes Parkinson's disease.",
    color: "#A855F7"
  },
  acetylcholine: {
    name: "Acetylcholine (ACh)",
    type: "Neuromuscular / Autonomic",
    description: "Transmitter at neuromuscular junction triggering muscle contraction, and parasympathetic autonomic pre/postganglionic synapses.",
    clinical: "Deactivated by Acetylcholinesterase; targeted in Alzheimer's therapy and Myasthenia Gravis.",
    color: "#10B981"
  }
};
