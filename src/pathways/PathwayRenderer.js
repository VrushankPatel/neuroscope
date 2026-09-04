import * as THREE from 'three';

export class PathwayRenderer {
  constructor(scene, graph) {
    this.scene = scene;
    this.graph = graph;

    this.activePathwayGroup = new THREE.Group();
    this.activePathwayGroup.name = "ActivePathwayGroup";
    this.scene.add(this.activePathwayGroup);

    this.currentPathwayMesh = null;
    this.currentGlowMesh = null;
  }

  renderPathway(pathwayId) {
    this.clear();

    const pathway = this.graph.getPathway(pathwayId);
    if (!pathway) return;

    const curve = this.graph.getSplineCurve(pathwayId);
    if (!curve) return;

    // 1. Ultra-thin core luminous fiber (radius reduced from 0.022 to 0.005 for whisper-thin elegance)
    const geometry = new THREE.TubeGeometry(curve, 96, 0.005, 6, false);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(pathway.color),
      transparent: true,
      opacity: 0.95
    });

    this.currentPathwayMesh = new THREE.Mesh(geometry, material);
    this.activePathwayGroup.add(this.currentPathwayMesh);

    // 2. Very subtle soft outer glow halo (radius reduced from 0.045 to 0.011)
    const glowGeometry = new THREE.TubeGeometry(curve, 96, 0.011, 6, false);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(pathway.color),
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.currentGlowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    this.activePathwayGroup.add(this.currentGlowMesh);
  }

  pulseNode(nodeIndex) {
    if (this.currentPathwayMesh) {
      this.currentPathwayMesh.material.opacity = 1.0;
      setTimeout(() => {
        if (this.currentPathwayMesh) this.currentPathwayMesh.material.opacity = 0.95;
      }, 250);
    }
  }

  clear() {
    while (this.activePathwayGroup.children.length > 0) {
      const child = this.activePathwayGroup.children[0];
      this.activePathwayGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }
    this.currentPathwayMesh = null;
    this.currentGlowMesh = null;
  }
}
