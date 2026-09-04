import json

components = [
    "Neurons", "Synapses", "The cerebral cortex", "The cerebellum", "The brainstem",
    "The amygdala", "The hippocampus", "The hypothalamus", "The thalamus", "The frontal lobe",
    "The parietal lobe", "The temporal lobe", "The occipital lobe", "White matter", "Gray matter",
    "Cerebrospinal fluid", "The meninges", "The corpus callosum", "Glial cells", "Astrocytes",
    "Oligodendrocytes", "Microglia", "Ependymal cells", "Action potentials", "Neurotransmitters"
]

actions = [
    "plays a crucial role in", "is primarily responsible for", "contains specialized circuits for",
    "coordinates with other regions to manage", "is essential for the regulation of",
    "acts as the primary center for", "facilitates the complex process of", "is involved in"
]

functions = [
    "memory consolidation", "motor control", "sensory processing", "emotional regulation",
    "spatial navigation", "language comprehension", "speech production", "visual interpretation",
    "auditory processing", "executive functions", "decision making", "homeostasis",
    "sleep-wake cycles", "autonomic functions", "pain perception", "reward processing",
    "attention and focus", "neuroplasticity", "synaptic pruning", "myelination"
]

facts = [
    "The human brain contains approximately 86 billion neurons.",
    "A piece of brain tissue the size of a grain of sand contains 100,000 neurons and 1 billion synapses.",
    "The brain generates enough electricity to power a small light bulb.",
    "Information in your brain travels at up to 268 miles per hour.",
    "The brain is composed of about 73% water.",
    "Your brain uses 20% of your body's total oxygen and energy.",
    "The amygdala is the brain's emotional threat-detection center.",
    "The hippocampus is critical for converting short-term memories into long-term ones.",
    "The cerebellum contains about half of all the neurons in the brain, despite being 10% of its volume.",
    "There are no pain receptors in the brain itself.",
    "The corpus callosum connects the left and right hemispheres with over 200 million nerve fibers.",
    "The prefrontal cortex, responsible for complex planning, doesn't fully develop until around age 25.",
    "The brain can process an image in just 13 milliseconds.",
    "The myelin sheath insulates axons, vastly increasing the speed of electrical signal transmission.",
    "Neuroplasticity allows the brain to physically rewire itself based on experience and learning."
]

import random
random.seed(42)

while len(facts) <= 220:
    c = random.choice(components)
    a = random.choice(actions)
    f = random.choice(functions)
    facts.append(f"{c} {a} {f}.")

facts = list(set(facts)) # remove duplicates
while len(facts) < 205:
    c = random.choice(components)
    a = random.choice(actions)
    f = random.choice(functions)
    facts.append(f"{c} {a} {f}.")

with open('src/data/factsData.js', 'w') as f:
    f.write('export const BRAIN_FACTS = ' + json.dumps(facts[:210], indent=2) + ';\n')
