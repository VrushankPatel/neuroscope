# NeuroScope — Interactive 3D Neuroanatomy & Neural Signaling Laboratory

NeuroScope is a premium, web-based interactive neurobiology laboratory designed for medical students, neuroscience students, educators, and anatomy enthusiasts. It combines a floating 3D human brain and nervous system visualization with an event-driven deterministic neural signaling engine, pathway graph visualization, cellular action-potential/synapse simulator, clinical lesion localization mode, and active recall study quizzes.

---

## 🌟 Key Features

1. **Floating 3D Neuroanatomy Engine (Three.js)**:
   - Interactive 3D human brain with distinct anatomical structures (Frontal Lobe, Parietal Lobe, Temporal Lobe, Occipital Lobe, Wernicke's & Broca's areas, Insula, Thalamus, Basal Ganglia, Hippocampus, Corpus Callosum, Cerebellum, Brainstem, Pyramidal Decussation, Cervical/Lumbar Spinal Cord, Brachial Plexus, Peripheral Nerves, Neuromuscular Junction, Nociceptors).
   - Real-time **Cortex Opacity Control** (100% to 0%) to reveal subcortical deep nuclei (Thalamus, Hippocampus, Basal Ganglia).
   - **Exploded View Mode**: Animated spatial separation of cortical lobes, deep nuclei, brainstem, and cerebellum.
   - Smooth GSAP camera target focusing on selected structures.

2. **Neural Signal Propagation & 5 Core Flagship Scenarios**:
   - Luminous energy packets traveling along 3D CatmullRom splines with trailing glow and regional node emissive pulses.
   - **Raise my right arm**: Voluntary motor intention → Premotor planning → Primary Motor Cortex (M1) → Internal Capsule → Pyramidal Decussation → Cervical Spinal Cord → Peripheral Nerve → Neuromuscular Junction → Arm movement → Proprioceptive feedback loop.
   - **Walk forward**: Motor intention + Basal Ganglia gait gating + Cerebellar coordination → Spinal motor output → Rhythmic leg activation → Closed-loop feedback.
   - **Touch something hot**: Cutaneous nociceptors → Dual pathways: (1) Immediate spinal withdrawal reflex arc + (2) Ascending spinothalamic tract → Thalamus → S1 conscious pain perception.
   - **See an object**: Retinal phototransduction → Optic nerve → Optic chiasm decussation → Thalamic LGN relay → Primary Visual Cortex V1.
   - **Speak a word**: Wernicke's language comprehension → Arcuate fasciculus → Broca's speech planning → M1 motor output → Cranial nerve vocal muscle contraction.

3. **Deterministic Simulation Timeline Engine**:
   - Interactive horizontal scrubber track with labeled stage markers.
   - Play, Pause, Replay, 0.1x to 4.0x speed toggles, and step forward/backward.
   - Synchronized live stage explanation text.

4. **Cellular Scale & Micro-Exploration**:
   - Transition from macro brain down to 3D cellular neuron (Soma, Dendrites, Axon hillock, Myelin sheath, Nodes of Ranvier, Axon terminal).
   - **Action Potential Oscilloscope**: Real-time voltage curve (-70mV to +40mV) synced with ion channel ($Na^+$, $K^+$) state animation.
   - **Synapse Simulator**: Neurotransmitter exocytosis (Glutamate, GABA, Dopamine, Acetylcholine) and receptor dynamics.

5. **Clinical Mode & Active Recall Quizzes**:
   - **Clinical Mode**: Case vignettes (e.g. Middle Cerebral Artery stroke, Parkinson's disease, Cerebellar ataxia) with interactive 3D lesion localization challenges.
   - **Active Recall Quizzes**: Structure identification, pathway node sequence ordering, and scoring feedback.
   - **Cmd+K Search**: Global instant query for anatomy, pathways, functions, and clinical terms.
   - **Dual Themes**: Atmospheric Dark Theme (`#05070A`) with subtle spatial background particles, and warm scientific Light Theme (`#F8F9FA`).

---

## 🛠️ Project Setup & Commands

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```

---

## 🏗️ Architecture & Directory Structure

```text
HumanBrain/
├── index.html                      # Layout, modals, panels, timeline HTML shell
├── package.json                    # Dependencies (three, gsap, vite)
├── vite.config.js                  # Vite configuration
├── src/
│   ├── main.js                     # Master application bootstrapper & orchestrator
│   ├── style/
│   │   ├── variables.css           # CSS design tokens & semantic signal colors
│   │   ├── main.css                # Layout resets, glass panel styles & typography
│   │   ├── components.css          # Nav, timeline, right panel, modals, cellular oscilloscope
│   │   └── responsive.css          # Adaptive media queries (desktop, tablet, mobile)
│   ├── scene/
│   │   ├── SceneManager.js         # Three.js WebGLRenderer, scene, render loop
│   │   ├── CameraController.js     # OrbitControls & GSAP smooth camera focus
│   │   ├── Lighting.js             # Directional key, fill, and cyan rim lights
│   │   └── ParticleEnvironment.js  # Floating spatial background particles
│   ├── anatomy/
│   │   ├── AnatomicalAssetRegistry.js # Structure registration & mesh mapping
│   │   ├── BrainModelBuilder.js    # Procedural 3D anatomical structures
│   │   ├── AnatomySelectionManager.js # 3D Raycasting hover/click selection
│   │   └── ExplodedViewManager.js  # Animated spatial structure separation
│   ├── simulation/
│   │   ├── EventBus.js             # Decoupled publish/subscribe event system
│   │   ├── SimulationEngine.js     # Clock controller, play/pause, scrubbing, speed
│   │   ├── SignalParticleSystem.js # Luminous energy packet signal renderer
│   │   └── ScenarioRunner.js       # Synchronizes active step timing with 3D scene & UI
│   ├── pathways/
│   │   ├── PathwayGraph.js         # Directional graph of 3D node coordinates
│   │   └── PathwayRenderer.js      # 3D Bezier curve pathway tubes & node pulses
│   ├── cellular/
│   │   ├── CellularScene.js        # 3D Neuron & Synapse micro-model
│   │   ├── ActionPotentialSim.js   # Membrane potential oscilloscope canvas (-70mV to +40mV)
│   │   └── SynapseSimulator.js     # Neurotransmitter exocytosis & receptor profiling
│   ├── data/
│   │   ├── anatomyData.js          # Database of 30+ structures (functions, connections, clinical)
│   │   ├── pathwayData.js          # Corticospinal, Spinothalamic, Visual, Speech pathways
│   │   ├── scenariosData.js        # Timed event steps for 5 core scenarios
│   │   ├── cellularData.js         # Action potential phases & neurotransmitters
│   │   ├── clinicalCases.js        # Clinical case vignettes for 3D lesion localization
│   │   └── quizData.js             # Active recall quiz questions & explanations
│   ├── ui/
│   │   ├── Navigation.js           # Header navigation, theme toggle, quality selector
│   │   ├── LandingCards.js         # Spatial floating thought cards
│   │   ├── ContextPanel.js         # Right-side anatomical info panel
│   │   ├── TimelineUI.js           # Bottom scrubbing timeline track & controls
│   │   ├── SearchModal.js          # Cmd+K search dialog
│   │   ├── ExploredControlsUI.js   # Cortex opacity slider & exploded view button
│   │   ├── StudyQuizUI.js          # Active recall quiz modal
│   │   ├── ClinicalUI.js           # Clinical case presenter & lesion feedback
│   │   └── ExplainModal.js         # Multi-level educational explanation modal
│   └── utils/
│       └── PerformanceMonitor.js   # FPS monitor & debug overlay (Shift+D)
```

---

## 🎓 Extensibility Guide

### Adding a New Anatomical Structure
1. Add structure metadata entry in `src/data/anatomyData.js`.
2. Instantiate structure geometry in `src/anatomy/BrainModelBuilder.js` and register it with `this.registry.registerStructure("new_structure_id", mesh)`.

### Adding a New Scenario
1. Add scenario object to `src/data/scenariosData.js` defining `id`, `title`, `duration`, `pathwayId`, and `steps` array with timing, `structureId`, `narrative`, and `signalColor`.

---

## ⚕️ Educational Disclaimer
NeuroScope provides simplified conceptual visualizations for medical education and neuroanatomy study. It is intended for educational purposes and does not model every individual biological neuron or clinical diagnostic scenario.
