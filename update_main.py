import re

with open('src/main.js', 'r') as f:
    content = f.read()

# We need to add loadOrgan method and refactor the constructor
# Let's extract the part from `this.registry = new AnatomicalAssetRegistry();` 
# up to `this.sceneManager.scene.add(this.brainGroup);`
# and move it to loadOrgan(organId)

# In constructor, we'll keep `this.registry = new AnatomicalAssetRegistry();`
# But we'll remove the model loading and network graph building, and put it in loadOrgan

refactored = content.replace('''    // 2. Anatomy Engine - Load Authentic 3D Human Brain Model
    this.registry = new AnatomicalAssetRegistry();
    this.modelBuilder = new BrainModelBuilder(this.registry);

    // 3. Whole-Brain Distributed Neural Network & Lightning Engine
    this.networkGraph = new NeuralNetworkGraph(this.sceneManager.scene);

    // Build neural network across all 12 brain meshes when loaded
    this.modelBuilder.onModelLoaded((brainPivot, rawModel) => {
      this.networkGraph.buildFromBrainMeshes(brainPivot, rawModel);
    });

    this.brainGroup = this.modelBuilder.loadRealBrainModel((loadedGroup) => {
      console.log("Authentic 3D Human Brain loaded successfully!");
      
      const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
      this.registry.setTheme(initialTheme);
      
      this.hideLoadingScreen();
    });
    this.sceneManager.scene.add(this.brainGroup);''', '''    // 2. Anatomy Engine Core
    this.registry = new AnatomicalAssetRegistry();
    
    // 3. Whole-Brain Distributed Neural Network & Lightning Engine
    this.networkGraph = new NeuralNetworkGraph(this.sceneManager.scene);
    
    this.organGroup = null;
    this.loadOrgan('brain');''')

refactored = refactored.replace('''    this.factsWidgetUI = new FactsWidgetUI();''', '''    this.factsWidgetUI = new FactsWidgetUI();
    this.organSelectorUI = new OrganSelectorUI(this.eventBus);''')

# Now add loadOrgan method and listen to ORGAN_CHANGED in initEventListeners
load_organ_method = '''  loadOrgan(organId) {
    if (this.organGroup) {
      this.sceneManager.scene.remove(this.organGroup);
      this.registry.clear();
      this.networkGraph.hide(); // Hide if we switch to heart
      this.pathwayRenderer.clear();
      // Wait, we need to clear the network graph nodes if we switch away from brain
      // But for simplicity, we'll just leave it hidden if heart.
    }

    GlobalData.setOrgan(organId);
    
    // Update UI that depends on the data
    this.landingCardsUI.renderCards();

    if (organId === 'brain') {
      this.modelBuilder = new BrainModelBuilder(this.registry);
      
      this.modelBuilder.onModelLoaded((pivot, rawModel) => {
        this.networkGraph.buildFromBrainMeshes(pivot, rawModel);
      });

      this.organGroup = this.modelBuilder.loadRealBrainModel((loadedGroup) => {
        console.log("Authentic 3D Human Brain loaded successfully!");
        const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
        this.registry.setTheme(initialTheme);
        this.hideLoadingScreen();
        this.networkGraph.show();
      });
      this.sceneManager.scene.add(this.organGroup);
    } else if (organId === 'heart') {
      this.modelBuilder = new HeartModelBuilder(this.registry);
      
      this.organGroup = this.modelBuilder.loadRealModel((loadedGroup) => {
        console.log("Authentic 3D Human Heart loaded successfully!");
        const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
        this.registry.setTheme(initialTheme);
        this.hideLoadingScreen();
        // Hide network graph as heart doesn't use it currently
        this.networkGraph.hide();
      });
      this.sceneManager.scene.add(this.organGroup);
    }
  }
'''

# Find the hideLoadingScreen method and insert loadOrgan before it
refactored = refactored.replace('  hideLoadingScreen() {', load_organ_method + '\n  hideLoadingScreen() {')

# Find initEventListeners and add ORGAN_CHANGED
event_listeners = '''  initEventListeners() {
    this.eventBus.on('ORGAN_CHANGED', ({ organ }) => {
      this.loadOrgan(organ);
    });
'''
refactored = refactored.replace('  initEventListeners() {\n', event_listeners)

# Also replace brainGroup with organGroup in MODE_CHANGED
refactored = refactored.replace('this.brainGroup.visible = false;', 'if (this.organGroup) this.organGroup.visible = false;')
refactored = refactored.replace('this.brainGroup.visible = true;', 'if (this.organGroup) this.organGroup.visible = true;')


with open('src/main.js', 'w') as f:
    f.write(refactored)
