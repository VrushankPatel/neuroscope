/**
 * Declarative Scenario Definitions for Neural Signaling Simulation
 * Embedded directly into the authentic 3D human brain model.
 */

export const SCENARIOS_DATABASE = [
  {
    id: "raise-arm",
    title: "Raise my right arm",
    category: "motor",
    icon: "🦾",
    description: "Follow voluntary motor intention from prefrontal planning through M1 and the corticospinal tract.",
    duration: 3.2,
    pathwayId: "corticospinal_tract",
    steps: [
      {
        time: 0.0,
        endTime: 0.6,
        stage: "Motor Intention",
        structureId: "prefrontal_cortex",
        narrative: "Prefrontal cortex initiates motor goal: 'Raise right arm'.",
        signalColor: "#A855F7"
      },
      {
        time: 0.6,
        endTime: 1.2,
        stage: "M1 Motor Execution",
        structureId: "primary_motor_cortex",
        narrative: "Primary Motor Cortex (M1) upper limb homunculus initiates upper motor neuron firing.",
        signalColor: "#00E5FF"
      },
      {
        time: 1.2,
        endTime: 1.8,
        stage: "Internal Capsule Descent",
        structureId: "corpus_callosum",
        narrative: "Descending corticospinal axons travel through posterior limb of internal capsule.",
        signalColor: "#00E5FF"
      },
      {
        time: 1.8,
        endTime: 2.5,
        stage: "Brainstem & Pyramidal Decussation",
        structureId: "brainstem",
        narrative: "Fibers descend through cerebral peduncles and decussate in the medullary pyramids.",
        signalColor: "#00E5FF"
      },
      {
        time: 2.5,
        endTime: 3.2,
        stage: "Sensory Feedback Loop",
        structureId: "primary_somatosensory_cortex",
        narrative: "Proprioceptive feedback returns to Somatosensory Cortex confirming limb elevation.",
        signalColor: "#10B981"
      }
    ]
  },
  {
    id: "touch-hot",
    title: "Touch something hot",
    category: "sensory_reflex",
    icon: "🔥",
    description: "Cutaneous nociception ascending through the spinothalamic tract to thalamus and primary somatosensory cortex.",
    duration: 2.8,
    pathwayId: "spinothalamic_tract",
    steps: [
      {
        time: 0.0,
        endTime: 0.8,
        stage: "Ascending Spinothalamic Signal",
        structureId: "brainstem",
        narrative: "Nociceptive signal ascends through the anterolateral system of the brainstem.",
        signalColor: "#EF4444"
      },
      {
        time: 0.8,
        endTime: 1.8,
        stage: "Thalamic Gating (VPL)",
        structureId: "thalamus",
        narrative: "Ventral posterolateral nucleus of thalamus relays pain signals to cerebral cortex.",
        signalColor: "#EF4444"
      },
      {
        time: 1.8,
        endTime: 2.8,
        stage: "Conscious Pain Perception (S1)",
        structureId: "primary_somatosensory_cortex",
        narrative: "Somatosensory cortex maps acute pain localization to index finger.",
        signalColor: "#EF4444"
      }
    ]
  },
  {
    id: "walk",
    title: "Walk forward",
    category: "motor_coordination",
    icon: "🚶",
    description: "Cortical motor initiation integrated with cerebellar coordination for rhythmic gait control.",
    duration: 3.0,
    pathwayId: "corticospinal_tract",
    steps: [
      {
        time: 0.0,
        endTime: 0.8,
        stage: "Gait Initiation",
        structureId: "prefrontal_cortex",
        narrative: "Executive goal disinhibits basal ganglia and motor planning.",
        signalColor: "#A855F7"
      },
      {
        time: 0.8,
        endTime: 1.6,
        stage: "Cerebellar Coordination",
        structureId: "cerebellum",
        narrative: "Cerebellum coordinates posture, timing, and ongoing motor adjustments.",
        signalColor: "#10B981"
      },
      {
        time: 1.6,
        endTime: 2.3,
        stage: "Cortical Motor Command",
        structureId: "primary_motor_cortex",
        narrative: "Lower extremity motor cortex fires descending corticospinal motor command.",
        signalColor: "#00E5FF"
      },
      {
        time: 2.3,
        endTime: 3.0,
        stage: "Brainstem Motor Conduit",
        structureId: "brainstem",
        narrative: "Reticulospinal and vestibulospinal tracts maintain balance and locomotor rhythm.",
        signalColor: "#00E5FF"
      }
    ]
  },
  {
    id: "see-object",
    title: "See an object",
    category: "sensory",
    icon: "👁️",
    description: "Transmission from optic tract through thalamic LGN to primary visual cortex (V1).",
    duration: 2.5,
    pathwayId: "visual_pathway",
    steps: [
      {
        time: 0.0,
        endTime: 1.2,
        stage: "LGN Thalamic Relay",
        structureId: "thalamus",
        narrative: "Lateral geniculate nucleus separates color, motion, and contrast streams.",
        signalColor: "#FFB300"
      },
      {
        time: 1.2,
        endTime: 2.5,
        stage: "V1 Striate Cortex Processing",
        structureId: "primary_visual_cortex",
        narrative: "Primary Visual Cortex (V1) processes spatial orientation columns and feeds visual streams.",
        signalColor: "#FFB300"
      }
    ]
  },
  {
    id: "speak",
    title: "Speak a word",
    category: "cognitive_speech",
    icon: "🗣️",
    description: "Language comprehension in Wernicke's area linked to Broca's area motor speech planning.",
    duration: 2.8,
    pathwayId: "speech_language_pathway",
    steps: [
      {
        time: 0.0,
        endTime: 0.7,
        stage: "Language Comprehension (Wernicke's)",
        structureId: "wernicke_area",
        narrative: "Superior temporal gyrus decodes semantic representation of spoken word.",
        signalColor: "#A855F7"
      },
      {
        time: 0.7,
        endTime: 1.4,
        stage: "Arcuate Fasciculus Transfer",
        structureId: "corpus_callosum",
        narrative: "Association white matter tract transfers linguistic data to frontal planning region.",
        signalColor: "#A855F7"
      },
      {
        time: 1.4,
        endTime: 2.1,
        stage: "Motor Speech Planning (Broca's)",
        structureId: "broca_area",
        narrative: "Broca's area coordinates vocal tract, lip, and tongue articulation patterns.",
        signalColor: "#A855F7"
      },
      {
        time: 2.1,
        endTime: 2.8,
        stage: "M1 Orofacial Motor Output",
        structureId: "primary_motor_cortex",
        narrative: "Primary Motor Cortex fires corticobulbar fibers driving laryngeal muscles.",
        signalColor: "#00E5FF"
      }
    ]
  }
];
