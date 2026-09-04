import * as THREE from 'three';
import { PATHWAY_DATABASE } from '../data/pathwayData.js';

export class PathwayGraph {
  constructor() {
    this.pathways = PATHWAY_DATABASE;
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
