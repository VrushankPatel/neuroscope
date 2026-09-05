import * as THREE from 'three';

export class NeuralNetworkGraph {
  constructor(scene) {
    this.scene = scene;
    this.networkGroup = new THREE.Group();
    this.networkGroup.name = "EmbeddedNeuralCircuitry";
    this.scene.add(this.networkGroup);
    this.networkGroup.visible = true;

    this.allNodes = []; // { pos: Vector3, regionId: string, color: Color }
    this.edges = [];    // { start: Vector3, end: Vector3, dist: number }
    this.pulses = [];   // Active continuous traveling pulses
    this.activeLightningBranches = []; // Dynamic growing lightning strikes

    this.lightningGroup = new THREE.Group();
    this.lightningGroup.name = "NeuralLightningStrikes";
    this.networkGroup.add(this.lightningGroup);

    this.lastSpontaneousLightningTime = 0;
    this.lastActiveRegionLightningTime = 0;
  }

  // Build uniform, whole-brain neural network directly from authentic brain mesh vertices
  buildFromBrainMeshes(brainPivot, rawModel) {
    this.clear();

    const sampledPositions = [];
    const sampledColors = [];
    const meshSamples = [];

    // Traverse all 12 anatomical parts in the loaded model
    rawModel.traverse((child) => {
      if (child.isMesh && child.geometry && child.geometry.attributes.position) {
        const posAttr = child.geometry.attributes.position;
        const totalVerts = posAttr.count;
        const partName = (child.name || "").toLowerCase();
        const regionColor = new THREE.Color(child.userData.color || "#00E5FF");

        // Determine proportional sample count based on anatomical volume
        let sampleTarget = 90;
        if (partName.includes("brainstem")) sampleTarget = 110;
        else if (partName.includes("cerebellum")) sampleTarget = 140;
        else if (partName.includes("semantic")) sampleTarget = 80;
        else if (partName.includes("process")) sampleTarget = 85;
        else if (partName.includes("episodic")) sampleTarget = 95;
        else if (partName.includes("affective") || partName.includes("analytic")) sampleTarget = 75;
        else if (partName.includes("bridge")) sampleTarget = 65;
        else if (partName.includes("amygdala")) sampleTarget = 45;

        const step = Math.max(1, Math.floor(totalVerts / sampleTarget));
        const localPos = new THREE.Vector3();

        for (let i = 0; i < totalVerts; i += step) {
          localPos.fromBufferAttribute(posAttr, i);

          // Slightly pull inward towards interior white matter (scale 0.88 - 0.98)
          // so neurons inhabit both cortex surface and internal depth
          const depthFactor = 0.88 + Math.random() * 0.12;
          const adjustedLocal = localPos.clone().multiplyScalar(depthFactor);

          // Transform point through model and pivot to get exact scene coordinates
          adjustedLocal.applyMatrix4(child.matrixWorld);

          this.allNodes.push({
            pos: adjustedLocal,
            structureId: child.userData.structureId || "cortex",
            color: regionColor
          });

          sampledPositions.push(adjustedLocal.x, adjustedLocal.y, adjustedLocal.z);
          sampledColors.push(regionColor.r, regionColor.g, regionColor.b);
        }
      }
    });

    if (this.allNodes.length === 0) return;

    // 1. Build Multi-Layer Synaptic Connections (Distance-based K-Nearest Neighbors)
    const maxConnectionDist = 0.26;
    for (let i = 0; i < this.allNodes.length; i++) {
      let connections = 0;
      for (let j = i + 1; j < this.allNodes.length; j++) {
        const d = this.allNodes[i].pos.distanceTo(this.allNodes[j].pos);
        if (d < maxConnectionDist) {
          this.edges.push({
            start: this.allNodes[i].pos,
            end: this.allNodes[j].pos,
            dist: d
          });
          connections++;
          if (connections >= 4) break; // Limit per-node degree for clean, thin network
        }
      }
    }

    // 2. Render Thin Delicate Neuron Points (Whisper-thin pinpoints)
    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sampledPositions, 3));
    nodeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(sampledColors, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.25, 'rgba(0, 229, 255, 0.9)');
    grad.addColorStop(0.6, 'rgba(0, 229, 255, 0.2)');
    grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(16, 16, 16, 0, Math.PI * 2);
    ctx.fill();

    const nodeTexture = new THREE.CanvasTexture(canvas);
    this.nodeTexture = nodeTexture;

    this.nodeMaterial = new THREE.PointsMaterial({
      size: 0.038, // Delicate pinpoint nodes
      map: nodeTexture,
      transparent: true,
      opacity: 0.88,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const nodePoints = new THREE.Points(nodeGeometry, this.nodeMaterial);
    this.networkGroup.add(nodePoints);

    // 3. Render Fine Axon Fibers Across the Whole Brain
    const linePositions = [];
    this.edges.forEach((edge) => {
      linePositions.push(
        edge.start.x, edge.start.y, edge.start.z,
        edge.end.x, edge.end.y, edge.end.z
      );
    });

    const edgeGeometry = new THREE.BufferGeometry();
    edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

    this.edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x38BDF8,
      transparent: true,
      opacity: 0.12, // Subtle, whisper-thin filaments across the whole brain
      blending: THREE.AdditiveBlending
    });

    const edgeLines = new THREE.LineSegments(edgeGeometry, this.edgeMaterial);
    this.networkGroup.add(edgeLines);

    // 4. Background Spiking Action Potential Stream
    const pulseCount = 60;
    for (let i = 0; i < pulseCount; i++) {
      const edge = this.edges[Math.floor(Math.random() * this.edges.length)];
      if (edge) {
        this.pulses.push({
          edge,
          progress: Math.random(),
          speed: 0.35 + Math.random() * 0.75
        });
      }
    }

    const pulseGeometry = new THREE.BufferGeometry();
    const pulsePositions = new Float32Array(this.pulses.length * 3);
    pulseGeometry.setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3));

    this.pulseMaterial = new THREE.PointsMaterial({
      color: 0x00E5FF,
      size: 0.048,
      map: nodeTexture,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.pulsePoints = new THREE.Points(pulseGeometry, this.pulseMaterial);
    this.networkGroup.add(this.pulsePoints);
    
    // Apply current theme
    if (this.currentTheme) {
      this.setTheme(this.currentTheme);
    }
  }

  // Trigger electric branching lightning strike when neurons activate for something
  triggerLightningStrike(originPos, targetPos, colorHex = "#00E5FF", depth = 3) {
    if (!originPos || !targetPos) return;

    // Generate jagged, fractal lightning branches from origin toward target
    const branches = [];
    const buildBranch = (start, end, currentDepth) => {
      if (currentDepth <= 0) return;

      const segCount = 6;
      const points = [start.clone()];
      const dir = end.clone().sub(start);
      const totalLen = dir.length();

      for (let i = 1; i < segCount; i++) {
        const ratio = i / segCount;
        const p = start.clone().add(dir.clone().multiplyScalar(ratio));
        // Jagged electric displacement perpendicular to direction
        const jitterMag = (1.0 - ratio) * 0.08 * (totalLen + 0.1);
        p.x += (Math.random() - 0.5) * jitterMag;
        p.y += (Math.random() - 0.5) * jitterMag;
        p.z += (Math.random() - 0.5) * jitterMag;
        points.push(p);

        // Branching fork like electric neural arborization
        if (Math.random() < 0.45 && currentDepth > 1) {
          const forkTarget = p.clone().add(new THREE.Vector3(
            (Math.random() - 0.5) * 0.4,
            (Math.random() - 0.5) * 0.4,
            (Math.random() - 0.5) * 0.4
          ));
          buildBranch(p, forkTarget, currentDepth - 1);
        }
      }
      points.push(end.clone());
      branches.push(points);
    };

    buildBranch(originPos, targetPos, depth);

    // Create dynamic growing lightning strike meshes
    branches.forEach((branchPts, bIdx) => {
      const linePositions = [];
      for (let i = 0; i < branchPts.length - 1; i++) {
        linePositions.push(
          branchPts[i].x, branchPts[i].y, branchPts[i].z,
          branchPts[i + 1].x, branchPts[i + 1].y, branchPts[i + 1].z
        );
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: 1.0,
        blending: (this.currentTheme === 'light') ? THREE.NormalBlending : THREE.AdditiveBlending
      });

      const line = new THREE.LineSegments(geom, mat);
      this.lightningGroup.add(line);

      this.activeLightningBranches.push({
        line,
        lifetime: 0,
        maxLife: 0.35 + (bIdx * 0.05), // Rapid electric flash
        color: colorHex
      });
    });
  }

  // Trigger lightning strike between active neural regions during scenario
  triggerRegionalBurst(sourceRegionId, targetRegionId, colorHex = "#00E5FF") {
    if (this.allNodes.length === 0) return;

    const sourceNodes = this.allNodes.filter(n => n.structureId === sourceRegionId);
    const targetNodes = this.allNodes.filter(n => n.structureId === targetRegionId);

    const sNode = sourceNodes.length > 0
      ? sourceNodes[Math.floor(Math.random() * sourceNodes.length)].pos
      : this.allNodes[Math.floor(Math.random() * this.allNodes.length)].pos;

    const tNode = targetNodes.length > 0
      ? targetNodes[Math.floor(Math.random() * targetNodes.length)].pos
      : this.allNodes[Math.floor(Math.random() * this.allNodes.length)].pos;

    this.triggerLightningStrike(sNode, tNode, colorHex, 3);
  }

  setActiveScenarioRegion(regionId, colorHex) {
    if (this.activeNodesGroup) {
      this.networkGroup.remove(this.activeNodesGroup);
      if (this.activeNodesGroup.geometry) this.activeNodesGroup.geometry.dispose();
      if (this.activeNodesGroup.material) this.activeNodesGroup.material.dispose();
      this.activeNodesGroup = null;
    }
    this.activeScenarioNodes = null;
    this.activeScenarioColor = null;

    if (!regionId) return;

    const activeNodes = this.allNodes.filter(n => n.structureId === regionId);
    if (activeNodes.length === 0) return;

    this.activeScenarioNodes = activeNodes;
    this.activeScenarioColor = colorHex || "#FFEA00";

    const positions = [];
    const colors = [];
    const c = new THREE.Color(this.activeScenarioColor);
    
    activeNodes.forEach(n => {
      positions.push(n.pos.x, n.pos.y, n.pos.z);
      colors.push(c.r, c.g, c.b);
    });

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.12,
      map: this.nodeTexture,
      transparent: true,
      opacity: 0.9,
      vertexColors: true,
      blending: (this.currentTheme === 'light') ? THREE.NormalBlending : THREE.AdditiveBlending,
      depthWrite: false
    });

    this.activeNodesGroup = new THREE.Points(geom, mat);
    this.networkGroup.add(this.activeNodesGroup);
  }

  update(delta, time) {
    if (!this.networkGroup.visible) return;

    // 1. Update continuous traveling action potentials
    if (this.pulsePoints && this.pulses.length > 0) {
      const posAttr = this.pulsePoints.geometry.attributes.position;
      for (let i = 0; i < this.pulses.length; i++) {
        const pulse = this.pulses[i];
        pulse.progress += delta * pulse.speed;
        if (pulse.progress > 1.0) {
          pulse.progress = 0;
          pulse.edge = this.edges[Math.floor(Math.random() * this.edges.length)];
        }

        if (pulse.edge) {
          const currentPos = new THREE.Vector3().lerpVectors(pulse.edge.start, pulse.edge.end, pulse.progress);
          posAttr.setXYZ(i, currentPos.x, currentPos.y, currentPos.z);
        }
      }
      posAttr.needsUpdate = true;
    }

    // 2. Animate and dissipate active electric lightning branches
    for (let i = this.activeLightningBranches.length - 1; i >= 0; i--) {
      const b = this.activeLightningBranches[i];
      b.lifetime += delta;

      // Electric flicker and fade out
      const progress = b.lifetime / b.maxLife;
      if (progress >= 1.0) {
        this.lightningGroup.remove(b.line);
        if (b.line.geometry) b.line.geometry.dispose();
        if (b.line.material) b.line.material.dispose();
        this.activeLightningBranches.splice(i, 1);
      } else {
        const flicker = (Math.random() * 0.4 + 0.6);
        b.line.material.opacity = (1.0 - progress) * flicker;
      }
    }

    // 3. Subtle spontaneous neural lightning discharges every ~3 seconds between brain regions
    if (time - this.lastSpontaneousLightningTime > 3.2 && this.allNodes.length > 20) {
      this.lastSpontaneousLightningTime = time;
      const n1 = this.allNodes[Math.floor(Math.random() * this.allNodes.length)];
      const n2 = this.allNodes[Math.floor(Math.random() * this.allNodes.length)];
      if (n1 && n2 && n1.pos.distanceTo(n2.pos) > 0.4) {
        this.triggerLightningStrike(n1.pos, n2.pos, "#38BDF8", 2);
      }
    }

    // 4. Pulse the active scenario region and fire intense local lightning
    if (this.activeNodesGroup) {
      this.activeNodesGroup.material.opacity = 0.5 + Math.sin(time * 10) * 0.5;
      
      if (!this.lastActiveRegionLightningTime) this.lastActiveRegionLightningTime = 0;
      
      if (time - this.lastActiveRegionLightningTime > 0.4 && this.activeScenarioNodes && this.activeScenarioNodes.length > 5) {
        this.lastActiveRegionLightningTime = time;
        const n1 = this.activeScenarioNodes[Math.floor(Math.random() * this.activeScenarioNodes.length)];
        const n2 = this.activeScenarioNodes[Math.floor(Math.random() * this.activeScenarioNodes.length)];
        if (n1 && n2 && n1.pos.distanceTo(n2.pos) > 0.05) {
           this.triggerLightningStrike(n1.pos, n2.pos, this.activeScenarioColor, 2);
        }
      }
    }
  }

  setTheme(theme) {
    this.currentTheme = theme;
    
    if (theme === 'light') {
      if (this.edgeMaterial) {
        this.edgeMaterial.color.setHex(0x0284C7); // Darker blue for light background
        this.edgeMaterial.opacity = 0.25; // More opaque
        this.edgeMaterial.blending = THREE.NormalBlending; // Avoid washing out on white background
        this.edgeMaterial.needsUpdate = true;
      }
      if (this.nodeMaterial) {
        this.nodeMaterial.blending = THREE.NormalBlending;
        this.nodeMaterial.color.setHex(0x555555); // Darken the vertex colors for contrast on white
        this.nodeMaterial.needsUpdate = true;
      }
      if (this.pulseMaterial) {
        this.pulseMaterial.color.setHex(0x0369A1); // Deep blue pulses
        this.pulseMaterial.blending = THREE.NormalBlending;
        this.pulseMaterial.needsUpdate = true;
      }
      if (this.activeNodesGroup) {
        this.activeNodesGroup.material.blending = THREE.NormalBlending;
        this.activeNodesGroup.material.color.setHex(0x555555);
        this.activeNodesGroup.material.needsUpdate = true;
      }
    } else {
      // Dark mode defaults
      if (this.edgeMaterial) {
        this.edgeMaterial.color.setHex(0x38BDF8);
        this.edgeMaterial.opacity = 0.12;
        this.edgeMaterial.blending = THREE.AdditiveBlending;
        this.edgeMaterial.needsUpdate = true;
      }
      if (this.nodeMaterial) {
        this.nodeMaterial.blending = THREE.AdditiveBlending;
        this.nodeMaterial.color.setHex(0xffffff);
        this.nodeMaterial.needsUpdate = true;
      }
      if (this.pulseMaterial) {
        this.pulseMaterial.color.setHex(0x00E5FF);
        this.pulseMaterial.blending = THREE.AdditiveBlending;
        this.pulseMaterial.needsUpdate = true;
      }
      if (this.activeNodesGroup) {
        this.activeNodesGroup.material.blending = THREE.AdditiveBlending;
        this.activeNodesGroup.material.color.setHex(0xffffff);
        this.activeNodesGroup.material.needsUpdate = true;
      }
    }
  }

  show() {
    this.networkGroup.visible = true;
  }

  hide() {
    this.networkGroup.visible = false;
  }

  toggle() {
    this.networkGroup.visible = !this.networkGroup.visible;
    return this.networkGroup.visible;
  }

  clear() {
    while (this.networkGroup.children.length > 0) {
      const child = this.networkGroup.children[0];
      this.networkGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }
    this.allNodes = [];
    this.edges = [];
    this.pulses = [];
    this.activeLightningBranches = [];

    this.lightningGroup = new THREE.Group();
    this.lightningGroup.name = "NeuralLightningStrikes";
    this.networkGroup.add(this.lightningGroup);

    if (this.activeNodesGroup) {
      this.networkGroup.remove(this.activeNodesGroup);
      if (this.activeNodesGroup.geometry) this.activeNodesGroup.geometry.dispose();
      if (this.activeNodesGroup.material) this.activeNodesGroup.material.dispose();
      this.activeNodesGroup = null;
    }
    this.activeScenarioNodes = null;
    this.activeScenarioColor = null;
  }
}
