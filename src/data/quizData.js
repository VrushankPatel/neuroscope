/**
 * Active Recall Study Quiz Dataset
 */

export const QUIZ_QUESTIONS = [
  {
    id: "q1",
    question: "Where do the majority (~85-90%) of corticospinal tract motor fibers cross to the contralateral side of the nervous system?",
    options: [
      "Internal Capsule",
      "Pyramidal Decussation in the caudal Medulla",
      "Thalamus VPL nucleus",
      "Cervical Spinal Cord ventral horn"
    ],
    correctIndex: 1,
    explanation: "Corticospinal fibers descend through the cerebral peduncles and pons into the medullary pyramids, where 85-90% cross at the pyramidal decussation to form the lateral corticospinal tract."
  },
  {
    id: "q2",
    question: "A patient with a lesion in Wernicke's area would most likely exhibit which of the following deficits?",
    options: [
      "Fluent speech but severe language comprehension impairment ('word salad')",
      "Non-fluent, slow, labored speech with preserved comprehension",
      "Contralateral hyperreflexia and spastic arm paralysis",
      "Loss of pain and temperature sensation in the lower limbs"
    ],
    correctIndex: 0,
    explanation: "Wernicke's aphasia is characterized by receptive language loss. Speech remains fluent in rhythm, but words lack semantic meaning."
  },
  {
    id: "q3",
    question: "Which anatomical structure acts as the primary sensory relay station for all modalities EXCEPT smell before reaching cerebral cortex?",
    options: [
      "Hippocampus",
      "Basal Ganglia",
      "Thalamus",
      "Hypothalamus"
    ],
    correctIndex: 2,
    explanation: "The Thalamus relays somatosensory (VPL/VPM), visual (LGN), and auditory (MGN) inputs directly to sensory cortical target regions."
  },
  {
    id: "q4",
    question: "During an action potential, what ion movement is responsible for the rapid DEPOLARIZATION phase up to +40mV?",
    options: [
      "Inflow of Na+ ions through voltage-gated Na+ channels",
      "Outflow of K+ ions through voltage-gated K+ channels",
      "Inflow of Cl- ions",
      "Efflux of Ca2+ ions"
    ],
    correctIndex: 0,
    explanation: "When threshold (-55mV) is reached, voltage-gated Na+ channels open rapidly, allowing Na+ influx down its electrochemical gradient to depolarize the membrane."
  },
  {
    id: "q5",
    question: "What structural white matter tract connects Wernicke's area to Broca's area?",
    options: [
      "Corpus Callosum",
      "Internal Capsule",
      "Arcuate Fasciculus",
      "Corticospinal Tract"
    ],
    correctIndex: 2,
    explanation: "The Arcuate Fasciculus is the associative association fiber bundle connecting posterior temporal language comprehension areas with frontal speech motor planning regions."
  }
];
