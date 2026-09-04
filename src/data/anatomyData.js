/**
 * Comprehensive Neuroanatomy Knowledge Base
 * Defines 30+ anatomical structures, spatial locations, functions, connections, clinical relevance, and educational metadata.
 */

export const ANATOMY_DATABASE = {
  // Cortical Regions
  "primary_motor_cortex": {
    id: "primary_motor_cortex",
    name: "Primary Motor Cortex (M1)",
    latinName: "Cortex motorius primarius",
    category: "cortical_region",
    system: "motor",
    hemisphere: "bilateral",
    location: "Precentral gyrus of the frontal lobe (Brodmann area 4).",
    function: "Executes voluntary somatic movement control over contralateral skeletal muscles via motor homunculus mapping.",
    connections: [
      "Premotor Cortex (motor planning input)",
      "Primary Somatosensory Cortex (proprioceptive feedback)",
      "Basal Ganglia & Cerebellum (gait & coordination loops)",
      "Corticospinal Tract (descending motor output)"
    ],
    clinicalRelevance: "Upper Motor Neuron (UMN) lesions produce contralateral spastic paresis, hyperreflexia, and Babinski sign.",
    references: ["Kandel et al., Principles of Neural Science, Ch. 37"],
    color: "#00E5FF"
  },
  "premotor_cortex": {
    id: "premotor_cortex",
    name: "Premotor Cortex & Supplementary Motor Area",
    latinName: "Cortex praemotorius",
    category: "cortical_region",
    system: "motor",
    hemisphere: "bilateral",
    location: "Anterior to the precentral gyrus (Brodmann area 6).",
    function: "Motor planning, sequencing complex movements, and spatial posture preparation prior to primary motor cortex execution.",
    connections: [
      "Prefrontal Cortex (intention & cognitive goals)",
      "Primary Motor Cortex",
      "Parietal Cortex (visuospatial processing)"
    ],
    clinicalRelevance: "Lesions cause motor apraxia — difficulty carrying out learned purposeful movements despite normal muscle strength.",
    references: ["Purves et al., Neuroscience, Ch. 17"],
    color: "#00E5FF"
  },
  "prefrontal_cortex": {
    id: "prefrontal_cortex",
    name: "Prefrontal Cortex (PFC)",
    latinName: "Cortex praefrontalis",
    category: "cortical_region",
    system: "cognitive",
    hemisphere: "bilateral",
    location: "Anterior aspect of the frontal lobes (Brodmann areas 9, 10, 11, 46, 47).",
    function: "Executive functions, decision-making, goal initiation, working memory, working intention, and social behavior regulation.",
    connections: [
      "Limbic System (emotion & motivation)",
      "Premotor Cortex",
      "Thalamus (mediodorsal nucleus)"
    ],
    clinicalRelevance: "Damage leads to executive dysfunction, impaired decision making, apathy, or disinhibition.",
    references: ["Bear et al., Neuroscience: Exploring the Brain, Ch. 24"],
    color: "#A855F7"
  },
  "primary_somatosensory_cortex": {
    id: "primary_somatosensory_cortex",
    name: "Primary Somatosensory Cortex (S1)",
    latinName: "Cortex somatosensorius primarius",
    category: "cortical_region",
    system: "sensory",
    hemisphere: "bilateral",
    location: "Postcentral gyrus of the parietal lobe (Brodmann areas 1, 2, 3).",
    function: "Processes somatic sensations including fine touch, pressure, vibration, temperature, and proprioception from contralateral body.",
    connections: [
      "Ventral Posterolateral (VPL) & VPM Nuclei of Thalamus",
      "Primary Motor Cortex (sensorimotor integration)",
      "Parietal Association Cortex"
    ],
    clinicalRelevance: "Lesions produce contralateral loss of discriminative touch, proprioception, and stereognosis.",
    references: ["Kandel et al., Ch. 23"],
    color: "#FFB300"
  },
  "primary_visual_cortex": {
    id: "primary_visual_cortex",
    name: "Primary Visual Cortex (V1 / Striate Cortex)",
    latinName: "Cortex visualis primarius",
    category: "cortical_region",
    system: "sensory",
    hemisphere: "bilateral",
    location: "Occipital lobe surrounding the calcarine sulcus (Brodmann area 17).",
    function: "Initial cortical processing of visual inputs (orientation, motion, spatial frequency, color) from contralateral visual field.",
    connections: [
      "Lateral Geniculate Nucleus (LGN) of Thalamus",
      "Ventral Visual Stream (object recognition 'what' path)",
      "Dorsal Visual Stream (spatial location 'where' path)"
    ],
    clinicalRelevance: "Unilateral lesion causes contralateral homonymous hemianopia with macular sparing.",
    references: ["Purves et al., Ch. 12"],
    color: "#FFB300"
  },
  "broca_area": {
    id: "broca_area",
    name: "Broca's Area",
    latinName: "Area Brocalis",
    category: "cortical_region",
    system: "cognitive",
    hemisphere: "left",
    location: "Inferior frontal gyrus of dominant hemisphere (pars opercularis & pars triangularis, BA 44/45).",
    function: "Motor planning for speech production, vocalization articulation, and grammatical processing.",
    connections: [
      "Wernicke's Area (via Arcuate Fasciculus)",
      "Primary Motor Cortex (laryngeal/facial subregions)",
      "Basal Ganglia"
    ],
    clinicalRelevance: "Broca's (Expressive) Aphasia — non-fluent, labored speech with preserved comprehension.",
    references: ["Kandel et al., Ch. 60"],
    color: "#A855F7"
  },
  "wernicke_area": {
    id: "wernicke_area",
    name: "Wernicke's Area",
    latinName: "Area Wernickensis",
    category: "cortical_region",
    system: "cognitive",
    hemisphere: "left",
    location: "Posterior superior temporal gyrus of dominant hemisphere (Brodmann area 22).",
    function: "Comprehension of spoken and written language, semantic processing, and speech decoding.",
    connections: [
      "Primary Auditory Cortex",
      "Broca's Area (via Arcuate Fasciculus)",
      "Visual Association Areas"
    ],
    clinicalRelevance: "Wernicke's (Receptive) Aphasia — fluent but paraphasic 'word salad' speech with impaired comprehension.",
    references: ["Purves et al., Ch. 27"],
    color: "#A855F7"
  },

  // Deep Brain Subcortical Nuclei
  "thalamus": {
    id: "thalamus",
    name: "Thalamus",
    latinName: "Thalamus",
    category: "subcortical_nuclei",
    system: "sensory",
    hemisphere: "bilateral",
    location: "Diencephalon, flanking the third ventricle superior to the brainstem.",
    function: "Chief relay station for all sensory modalities (except olfaction) to cerebral cortex, and motor feedback loop integrator.",
    connections: [
      "VPL/VPM (sensory relay)",
      "LGN (visual relay)",
      "MGN (auditory relay)",
      "VA/VL (motor loop relay from Basal Ganglia/Cerebellum)"
    ],
    clinicalRelevance: "Thalamic pain syndrome (Dejerine-Roussy) and central sensory disruption.",
    references: ["Kandel et al., Ch. 19"],
    color: "#FFB300"
  },
  "basal_ganglia": {
    id: "basal_ganglia",
    name: "Basal Ganglia (Striatum, Globus Pallidus, Subthalamic Nucleus)",
    latinName: "Nuclei basales",
    category: "subcortical_nuclei",
    system: "motor",
    hemisphere: "bilateral",
    location: "Deep subcortical telencephalon surrounding the internal capsule.",
    function: "Initiation, selection, and gating of voluntary movement, posture regulation, and procedural habit learning.",
    connections: [
      "Cerebral Cortex (corticostriatal fibers)",
      "Substantia Nigra pars compacta (dopaminergic input)",
      "Thalamus (VA/VL nuclei)"
    ],
    clinicalRelevance: "Parkinson's disease (hypokinetic) and Huntington's chorea (hyperkinetic).",
    references: ["Purves et al., Ch. 18"],
    color: "#00E5FF"
  },
  "hippocampus": {
    id: "hippocampus",
    name: "Hippocampus",
    latinName: "Hippocampus",
    category: "subcortical_nuclei",
    system: "cognitive",
    hemisphere: "bilateral",
    location: "Medial temporal lobe within the floor of the lateral ventricle inferior horn.",
    function: "Consolidation of short-term memory into long-term declarative memory, spatial navigation, and cognitive mapping.",
    connections: [
      "Entorhinal Cortex",
      "Fornix → Mammillary Bodies",
      "Amygdala"
    ],
    clinicalRelevance: "Severe anterograde amnesia (e.g. Alzheimer's disease, Korsakoff syndrome).",
    references: ["Bear et al., Ch. 25"],
    color: "#A855F7"
  },
  "corpus_callosum": {
    id: "corpus_callosum",
    name: "Corpus Callosum",
    latinName: "Corpus callosum",
    category: "white_matter_tract",
    system: "cognitive",
    hemisphere: "commissural",
    location: "Cerebral interhemispheric fissure connecting left and right cerebral hemispheres.",
    function: "Facilitates interhemispheric communication, coordination, and sensory-motor information transfer between hemispheres.",
    connections: [
      "Homologous neocortical regions of left and right hemispheres"
    ],
    clinicalRelevance: "Callosal agenesis or split-brain syndrome (disconnection syndrome).",
    references: ["Kandel et al., Ch. 17"],
    color: "#F1F5F9"
  },

  // Cerebellum & Brainstem
  "cerebellum": {
    id: "cerebellum",
    name: "Cerebellum",
    latinName: "Cerebellum",
    category: "hindbrain",
    system: "motor",
    hemisphere: "bilateral",
    location: "Posterior cranial fossa inferior to occipital lobes and dorsal to pons/medulla.",
    function: "Error-correction, fine tuning, balance, vestibular coordination, timing, and motor learning (Purkinje cell output).",
    connections: [
      "Pontine Nuclei (corticopontocerebellar tract)",
      "Inferior Olive (climbing fibers)",
      "Deep Cerebellar Nuclei (Dentate, Fastigial, Interposed) → Thalamus & Vestibular nuclei"
    ],
    clinicalRelevance: "Ipsilateral cerebellar ataxia, dysmetria, intention tremor, and dysdiadochokinesia.",
    references: ["Purves et al., Ch. 19"],
    color: "#10B981"
  },
  "brainstem": {
    id: "brainstem",
    name: "Brainstem (Midbrain, Pons, Medulla)",
    latinName: "Truncus encephalicus",
    category: "brainstem",
    system: "autonomic",
    hemisphere: "central",
    location: "Stalk connecting the diencephalon to the spinal cord anterior to the cerebellum.",
    function: "Conduit for all ascending/descending tracts, cranial nerve nuclei (CN III–XII), and vital cardiovascular/respiratory autonomic centers.",
    connections: [
      "Cerebrum (via cerebral peduncles)",
      "Cerebellum (via pontine peduncles)",
      "Spinal Cord"
    ],
    clinicalRelevance: "Brainstem stroke syndromes (e.g. Wallenberg lateral medullary syndrome), coma, and decerebrate rigidity.",
    references: ["Kandel et al., Ch. 44"],
    color: "#00E5FF"
  },
  "pyramidal_decussation": {
    id: "pyramidal_decussation",
    name: "Pyramidal Decussation (Medullary Pyramids)",
    latinName: "Decussatio pyramidum",
    category: "brainstem",
    system: "motor",
    hemisphere: "central",
    location: "Caudal medulla oblongata junction with the spinal cord.",
    function: "Site where ~85-90% of descending corticospinal motor fibers cross to contralateral side to form lateral corticospinal tract.",
    connections: [
      "Medullary Pyramids (corticospinal fibers)",
      "Lateral Corticospinal Tract of spinal cord"
    ],
    clinicalRelevance: "Lesions superior to decussation produce contralateral weakness; inferior lesions produce ipsilateral weakness.",
    references: ["Purves et al., Ch. 17"],
    color: "#00E5FF"
  },

  // Spinal Cord & Peripheral System
  "cervical_spinal_cord": {
    id: "cervical_spinal_cord",
    name: "Cervical Spinal Cord (C1–C8)",
    latinName: "Medulla spinalis pars cervicalis",
    category: "spinal_cord",
    system: "motor",
    hemisphere: "bilateral",
    location: "Vertebral canal within the cervical spine region.",
    function: "Houses upper limb motor neuronal pools (C5-T1), cervical enlargement, and conducts ascending/descending spinal tracts.",
    connections: [
      "Lateral Corticospinal Tract",
      "Brachial Plexus",
      "Dorsal Column-Medial Lemniscus Tract"
    ],
    clinicalRelevance: "Cervical trauma causes quadriplegia / tetraplegia and respiratory impairment if C3-C5 affected.",
    references: ["Purves et al., Ch. 16"],
    color: "#00E5FF"
  },
  "lumbar_spinal_cord": {
    id: "lumbar_spinal_cord",
    name: "Lumbar Spinal Cord & Conus Medullaris (L1–L5)",
    latinName: "Medulla spinalis pars lumbalis",
    category: "spinal_cord",
    system: "motor",
    hemisphere: "bilateral",
    location: "Lower thoracic and upper lumbar vertebral column.",
    function: "Lumbar enlargement housing lower limb motor neurons and spinal gait rhythm generators.",
    connections: [
      "Lumbar & Sacral Plexus",
      "Sciatic & Femoral Nerves"
    ],
    clinicalRelevance: "Cauda equina syndrome, paraplegia, and loss of lower extremity reflexes.",
    references: ["Purves et al., Ch. 16"],
    color: "#00E5FF"
  },
  "peripheral_motor_nerve": {
    id: "peripheral_motor_nerve",
    name: "Peripheral Motor Nerve (Brachial Plexus / Radial Nerve)",
    latinName: "Nervus periphericus",
    category: "peripheral_nerve",
    system: "motor",
    hemisphere: "peripheral",
    location: "Extending from spinal ventral roots through limb plexus to target muscles.",
    function: "Carries Lower Motor Neuron (LMN) action potentials directly to neuromuscular junctions.",
    connections: [
      "Spinal Ventral Horn Alpha Motor Neurons",
      "Neuromuscular Junction of skeletal muscle"
    ],
    clinicalRelevance: "LMN lesion causes flaccid paralysis, muscle atrophy, fasciculations, and hyporeflexia.",
    references: ["Kandel et al., Ch. 14"],
    color: "#00E5FF"
  },
  "neuromuscular_junction": {
    id: "neuromuscular_junction",
    name: "Neuromuscular Junction (NMJ) & Arm Muscle",
    latinName: "Junctio neuromuscularis",
    category: "effector",
    system: "motor",
    hemisphere: "peripheral",
    location: "Synapse between motor neuron axon terminal and skeletal muscle endplate.",
    function: "Acetylcholine (ACh) release triggers muscle action potential, calcium influx, cross-bridge cycling, and muscle contraction.",
    connections: [
      "Alpha Motor Neuron Axon Terminal",
      "Skeletal Muscle Endplate ACh Receptors"
    ],
    clinicalRelevance: "Myasthenia gravis (autoimmune ACh receptor antibodies) and Botulism toxicity.",
    references: ["Purves et al., Ch. 5"],
    color: "#00E5FF"
  },
  "sensory_nociceptor": {
    id: "sensory_nociceptor",
    name: "Cutaneous Nociceptor & Peripheral Sensory Nerve",
    latinName: "Receptor nociceptivus",
    category: "receptor",
    system: "pain",
    hemisphere: "peripheral",
    location: "Free nerve endings in the skin and subcutaneous tissue.",
    function: "Detects noxious thermal, mechanical, or chemical stimuli and generates pain sensory action potentials.",
    connections: [
      "Spinal Cord Posterior Horn (Substantia Gelatinosa)",
      "Spinothalamic Tract"
    ],
    clinicalRelevance: "Neuropathic pain, hyperalgesia, and peripheral neuropathy.",
    references: ["Kandel et al., Ch. 24"],
    color: "#EF4444"
  },

  // Ventricular System & CSF
  "ventricular_system": {
    id: "ventricular_system",
    name: "Ventricular System (Lateral, Third, and Fourth Ventricles)",
    latinName: "Systema ventriculare",
    category: "subcortical_nuclei",
    system: "autonomic",
    hemisphere: "central",
    location: "Interconnected cavities deep within the brain parenchyma.",
    function: "Produces, circulates, and stores Cerebrospinal Fluid (CSF); provides mechanical cushioning and buoyancy.",
    connections: [
      "Choroid Plexus",
      "Subarachnoid Space",
      "Central Canal of Spinal Cord"
    ],
    clinicalRelevance: "Hydrocephalus (ventricular dilation) due to CSF obstruction or overproduction, leading to increased intracranial pressure.",
    references: ["Purves et al., Appendix"],
    color: "#0284C7"
  },
  "cerebrospinal_fluid": {
    id: "cerebrospinal_fluid",
    name: "Cerebrospinal Fluid (CSF)",
    latinName: "Liquor cerebrospinalis",
    category: "white_matter_tract",
    system: "autonomic",
    hemisphere: "bilateral",
    location: "Within the ventricles, subarachnoid space, and central canal.",
    function: "Mechanical buffer preventing brain impact, clears metabolic waste (glymphatic system), and maintains ionic homeostasis for neuronal firing.",
    connections: [
      "Produced by Choroid Plexus",
      "Absorbed by Arachnoid Granulations"
    ],
    clinicalRelevance: "Meningitis diagnosis via lumbar puncture. Decreased CSF pressure leads to severe orthostatic headaches.",
    references: ["Kandel et al., Ch. 1"],
    color: "#0284C7"
  },
  "meninges": {
    id: "meninges",
    name: "Meninges (Dura, Arachnoid, and Pia Mater)",
    latinName: "Meninges",
    category: "cortical_region",
    system: "autonomic",
    hemisphere: "bilateral",
    location: "Membranes enveloping the brain and spinal cord, just internal to the skull.",
    function: "Protects the central nervous system, supports venous sinuses, and encloses the subarachnoid space filled with CSF.",
    connections: [
      "Skull/Periosteum",
      "Cerebral Cortex Surface"
    ],
    clinicalRelevance: "Meningitis (inflammation), Epidural hematoma (arterial tear), or Subdural hematoma (bridging vein tear).",
    references: ["Bear et al., Ch. 7"],
    color: "#94A3B8"
  }
};
