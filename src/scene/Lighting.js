import * as THREE from 'three';

export class LightingManager {
  constructor(scene) {
    this.scene = scene;

    // Soft balanced ambient illumination
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(this.ambientLight);

    // Primary Key Directional Light revealing cortical gyri & sulci contours
    this.keyLight = new THREE.DirectionalLight(0xF8FAFC, 1.3);
    this.keyLight.position.set(4, 7, 5);
    this.keyLight.castShadow = true;
    this.scene.add(this.keyLight);

    // Subtle Fill Light illuminating medial and lateral fissures
    this.fillLight = new THREE.DirectionalLight(0xE2E8F0, 0.7);
    this.fillLight.position.set(-4, 3, -4);
    this.scene.add(this.fillLight);

    // Gentle Rim Light separating the brainstem and cerebellum from the dark void
    this.rimLight = new THREE.DirectionalLight(0xCBD5E1, 0.8);
    this.rimLight.position.set(0, -4, -5);
    this.scene.add(this.rimLight);
  }

  setTheme(theme) {
    if (theme === 'dark') {
      this.ambientLight.color.setHex(0xffffff);
      this.ambientLight.intensity = 0.9;
      this.keyLight.color.setHex(0xF8FAFC);
      this.keyLight.intensity = 1.3;
      this.fillLight.color.setHex(0xE2E8F0);
      this.rimLight.color.setHex(0xCBD5E1);
    } else {
      this.ambientLight.color.setHex(0xFFFFFF);
      this.ambientLight.intensity = 1.4;
      this.keyLight.color.setHex(0xFFFBF0);
      this.keyLight.intensity = 1.5;
      this.fillLight.color.setHex(0xDCE4EE);
      this.rimLight.color.setHex(0xB0C4DE);
    }
  }
}
