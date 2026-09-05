with open('src/anatomy/AnatomicalAssetRegistry.js', 'r') as f:
    lines = f.readlines()
for i in range(len(lines)-1, -1, -1):
    if lines[i].strip() == '}':
        lines.insert(i, """
  clear() {
    this.structureMap.clear();
    this.originalMaterials.clear();
    this.selectedStructureId = null;
    this.hoveredStructureId = null;
  }
""")
        break
with open('src/anatomy/AnatomicalAssetRegistry.js', 'w') as f:
    f.writelines(lines)
