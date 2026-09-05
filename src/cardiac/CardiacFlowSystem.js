import * as THREE from 'three';

export class CardiacFlowSystem {
  constructor(scene) {
    this.scene = scene;
    this.flowGroup = new THREE.Group();
    this.flowGroup.name = "CardiacFlowGroup";
    this.flowGroup.visible = false;
    this.scene.add(this.flowGroup);

    this.fluidStreams = [];
    this.heartRateBpm = 72;

    this.initFlowCircuits();
  }

  // Body-space (y: 0=feet, 168=head) → world-space transform for heart mode
  // bodyWrapper: scale=0.35, position=(0, -133*0.35, 1.2*0.35)
  bw(bx, by, bz) {
    return new THREE.Vector3(bx * 0.35, by * 0.35 - 46.55, bz * 0.35 + 0.42);
  }

  createFluidMaterial(colorHex, isArterial = true, opacity = 0.35) {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPulse: { value: 1.0 },
        uBloodColor: { value: new THREE.Color(colorHex) },
        uFlowDirection: { value: isArterial ? 1.0 : -1.0 },
        uBaseOpacity: { value: opacity }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uPulse;
        uniform vec3 uBloodColor;
        uniform float uFlowDirection;
        uniform float uBaseOpacity;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          // Flow along length of vessel tube lumen (vUv.x goes from 0 to 1 along tube path)
          float flowPos = vUv.x * uFlowDirection * 18.0 - uTime * 2.8 * (0.8 + 0.4 * uPulse);
          
          // Continuous fluid stream density waves
          float wave1 = sin(flowPos) * 0.5 + 0.5;
          float wave2 = sin(flowPos * 2.2 + 1.4) * 0.5 + 0.5;
          float fluidStream = mix(wave1, wave2, 0.45);

          // Systolic ejection surge modulation
          float surge = fluidStream * (0.45 + 0.55 * uPulse);

          // Fresnel rim transparency for 3D liquid volume inside translucent vessel wall
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 1.6);

          // Final fluid luminance and alpha
          float finalAlpha = clamp(uBaseOpacity + surge * 0.35 + fresnel * 0.18, 0.08, 0.85);
          vec3 finalColor = uBloodColor + vec3(surge * 0.22);

          gl_FragColor = vec4(finalColor, finalAlpha);
        },
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
  }

  initFlowCircuits() {
    // ================================================================
    // ARTERIAL OUTFLOW (Lumen flow: Heart → Systemic Arteries)
    // ================================================================

    // --- Ascending Aorta → Arch → R. Carotid ---
    this.addFluidStream([
      [-1,133,2], [-2,146,2], [-1,148.5,1], [2,149,1],
      [3,153,1.5], [3.5,157,2], [3.5,161,2], [3,165,2.5], [4,169,2], [5,173,1.5]
    ], 0.38, "#94A3B8", true, 0.40);

    // --- Ascending Aorta → Arch → L. Carotid ---
    this.addFluidStream([
      [-1,133,2], [-2,146,2], [-1,148.5,1], [-2,149.5,0.5],
      [-3,153,1], [-3.5,157,1.5], [-3.5,161,2], [-3,165,2], [-4,169,2], [-5,173,1.5]
    ], 0.38, "#94A3B8", true, 0.40);

    // --- Aorta → R. Subclavian / Arm ---
    this.addFluidStream([
      [-1,133,2], [-2,146,2], [-1,148.5,1], [3,149,1],
      [7,148,0.5], [12,147,0], [20,145,0], [22,130,0], [23,100,0], [24.5,87,0.5], [25,82,0]
    ], 0.35, "#A7B4C2", true, 0.38);

    // --- Aorta → L. Subclavian / Arm ---
    this.addFluidStream([
      [-1,133,2], [-2,146,2], [-1,148.5,1], [-3,149.5,0.5],
      [-7,148.5,0.5], [-12,147.5,0], [-20,145.5,0], [-22,130,0], [-23,100,0], [-24.5,87,0.5], [-25,82,0]
    ], 0.35, "#A7B4C2", true, 0.38);

    // --- Descending Thoracic & Abdominal Aorta → Lower Body ---
    this.addFluidStream([
      [-1,133,2], [-2,146,2], [-2,149,-0.5], [-4,147,-2],
      [-3,138,-3], [-2.5,120,-2.8], [-1.5,100,-2], [-0.5,85,-1], [0,78,0],
      [4,72,0.5], [8,65,0], [8,48,0.5], [8,32,0], [8,15,-1], [7,5,1.5], [7,2,2]
    ], 0.42, "#B4BEC8", true, 0.42);

    this.addFluidStream([
      [-1,133,2], [-2,146,2], [-2,149,-0.5], [-4,147,-2],
      [-3,138,-3], [-2.5,120,-2.8], [-1.5,100,-2], [-0.5,85,-1], [0,78,0],
      [-4,72,0.5], [-8,65,0], [-8,48,0.5], [-8,32,0], [-8,15,-1], [-7,5,1.5], [-7,2,2]
    ], 0.42, "#B4BEC8", true, 0.42);

    // --- Coronary Perfusion (Heart Wall Outflow) ---
    this.addFluidStream([
      [0,134,2.5], [1.5,132,3], [2,130,2.5], [1,128,1.5], [-0.5,127,1]
    ], 0.28, "#C1CAD3", true, 0.45);
    this.addFluidStream([
      [0,134,2.5], [-1.5,132,3], [-2,130,2.5], [-1,128,1.5], [0.5,127,1]
    ], 0.28, "#C1CAD3", true, 0.45);

    // ================================================================
    // VENOUS RETURN (Lumen flow: Periphery → Heart RA)
    // ================================================================

    // --- Head → Jugular → SVC ---
    this.addFluidStream([
      [4,165,3], [5,160,2.5], [5,155,2], [5,149,1], [5,143,0.5], [4,138,0], [3.5,133,0]
    ], 0.36, "#899AA9", false, 0.38);
    this.addFluidStream([
      [-4,165,3], [-5,160,2.5], [-5,155,2], [-5,149.5,1], [5,149,1], [5,143,0.5], [4,133,0]
    ], 0.36, "#899AA9", false, 0.38);

    // --- Lower Body → IVC ---
    this.addFluidStream([
      [8,2,-1], [8,15,-1], [8,32,0], [8,48,0.5], [8,65,0],
      [5,72,0.5], [2,78,1], [2.5,88,0.5], [3,100,-0.5], [3.5,115,-1], [3.5,133,0]
    ], 0.38, "#899AA9", false, 0.38);
    this.addFluidStream([
      [-8,2,-1], [-8,15,-1], [-8,32,0], [-8,48,0.5], [-8,65,0],
      [-5,72,0.5], [-2,78,1], [2.5,88,0.5], [3,100,-0.5], [3.5,115,-1], [3.5,133,0]
    ], 0.38, "#899AA9", false, 0.38);

    // --- Arms → Subclavian Vein → SVC ---
    this.addFluidStream([
      [24,82,0], [23,100,0], [22,120,0], [20,145,0], [12,147,0], [5,149,1], [5,143,0.5], [4,133,0]
    ], 0.32, "#899AA9", false, 0.36);
    this.addFluidStream([
      [-24,82,0], [-23,100,0], [-22,120,0], [-20,145.5,0], [-12,147.5,0],
      [-5,149.5,1], [5,149,1], [5,143,0.5], [4,133,0]
    ], 0.32, "#899AA9", false, 0.36);

    // ================================================================
    // PULMONARY CIRCUIT
    // ================================================================
    this.addFluidStream([
      [-1,136,3], [3,135,4], [7,133,5], [10,131,4]
    ], 0.32, "#9EADB9", true, 0.40);
    this.addFluidStream([
      [-1,136,3], [-4,135,4], [-8,133,5], [-11,131,4]
    ], 0.32, "#9EADB9", true, 0.40);
  }

  addFluidStream(bodyPts, radius, colorHex, isArterial = true, opacity = 0.35) {
    const worldPts = bodyPts.map(p => this.bw(p[0], p[1], p[2]));
    const curve = new THREE.CatmullRomCurve3(worldPts);
    
    // Geometry constrained strictly inside the inner lumen of the vessel
    const geometry = new THREE.TubeGeometry(curve, 48, radius, 14, false);
    const material = this.createFluidMaterial(colorHex, isArterial, opacity);
    const mesh = new THREE.Mesh(geometry, material);

    this.flowGroup.add(mesh);
    this.fluidStreams.push({ mesh, material });
  }

  update(delta, time) {
    if (!this.flowGroup.visible) return;

    // Synchronize fluid propagation wave with cardiac pumping cycle (systolic ejection pulse)
    const beatFrequency = (this.heartRateBpm / 60) * Math.PI * 2;
    const cardiacPhase = (Math.sin(time * beatFrequency) + 1.0) / 2.0;
    // Systolic ejection surge calculation
    const pulseFactor = Math.pow(cardiacPhase, 3.5);

    for (const stream of this.fluidStreams) {
      stream.material.uniforms.uTime.value = time;
      stream.material.uniforms.uPulse.value = pulseFactor;
    }
  }

  show() {
    this.flowGroup.visible = true;
  }

  hide() {
    this.flowGroup.visible = false;
  }

  toggle() {
    this.flowGroup.visible = !this.flowGroup.visible;
    return this.flowGroup.visible;
  }

  clear() {
    while (this.flowGroup.children.length > 0) {
      const child = this.flowGroup.children[0];
      this.flowGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }
    this.fluidStreams = [];
  }
}
