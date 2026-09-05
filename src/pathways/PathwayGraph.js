import * as THREE from 'three';
import { GlobalData } from '../data/GlobalData.js';

export class PathwayGraph {
  constructor() {
    this.pathways = GlobalData.getPathways();
  }

  getPathway(pathwayId) {
    return this.pathways[pathwayId];
  }

  getSplineCurve(pathwayId) {
    const pathway = this.getPathway(pathwayId);
    if (!pathway) return null;

    const points = pathway.nodes.map(node => new THREE.Vector3(...node.pos));
    return new THREE.CatmullRomCurve3(points);
  }
}
