import * as THREE from 'three';

export class CellularScene {
  constructor(scene) {
    this.scene = scene;
    this.cellularGroup = new THREE.Group();
    this.cellularGroup.name = "CellularMicroGroup";
    this.scene.add(this.cellularGroup);
    this.cellularGroup.visible = false;
  }

  buildNeuronModel() {
    this.clear();

    const neuronMat = new THREE.MeshStandardMaterial({
      color: 0x38BDF8,
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x0284C7,
      emissiveIntensity: 0.2
    });

    // 1. Soma (Cell Body)
    const somaGeom = new THREE.SphereGeometry(0.5, 24, 24);
    const somaMesh = new THREE.Mesh(somaGeom, neuronMat);
    somaMesh.position.set(-2, 0, 0);
    this.cellularGroup.add(somaMesh);

    // 2. Dendrites
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const dendriteCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2, 0, 0),
        new THREE.Vector3(-2 + Math.cos(angle) * 0.8, Math.sin(angle) * 0.8, (Math.random() - 0.5) * 0.5),
        new THREE.Vector3(-2 + Math.cos(angle) * 1.3, Math.sin(angle) * 1.3, (Math.random() - 0.5) * 0.8)
      ]);
      const dendriteGeom = new THREE.TubeGeometry(dendriteCurve, 12, 0.04, 6, false);
      const dendriteMesh = new THREE.Mesh(dendriteGeom, neuronMat);
      this.cellularGroup.add(dendriteMesh);
    }

    // 3. Axon & Myelin Sheath
    const axonGeom = new THREE.CylinderGeometry(0.06, 0.06, 4.0, 16);
    axonGeom.rotateZ(Math.PI / 2);
    const axonMesh = new THREE.Mesh(axonGeom, neuronMat);
    axonMesh.position.set(0.2, 0, 0);
    this.cellularGroup.add(axonMesh);

    // Myelin Sheath Segments
    const myelinMat = new THREE.MeshStandardMaterial({
      color: 0xF1F5F9,
      roughness: 0.6,
      metalness: 0.1
    });

    for (let i = 0; i < 4; i++) {
      const myelinGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 16);
      myelinGeom.rotateZ(Math.PI / 2);
      const myelinMesh = new THREE.Mesh(myelinGeom, myelinMat);
      myelinMesh.position.set(-1.0 + i * 0.9, 0, 0);
      this.cellularGroup.add(myelinMesh);
    }

    // 4. Axon Terminal & Synapse
    const terminalGeom = new THREE.SphereGeometry(0.3, 16, 16);
    const terminalMesh = new THREE.Mesh(terminalGeom, neuronMat);
    terminalMesh.position.set(2.4, 0, 0);
    this.cellularGroup.add(terminalMesh);
  }

  show() {
    this.cellularGroup.visible = true;
  }

  hide() {
    this.cellularGroup.visible = false;
  }

  clear() {
    while (this.cellularGroup.children.length > 0) {
      const child = this.cellularGroup.children[0];
      this.cellularGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }
  }
}
