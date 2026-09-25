// Audio-Reactive Point Lights
// Modulates Three.js ambient and point light intensities according to audio spectrum amplitudes.

import * as THREE from 'three';

export class AudioReactiveLights {
    private pointLight: THREE.PointLight;
    private baseIntensity: number = 1.2;

    constructor(scene: THREE.Scene) {
        this.pointLight = new THREE.PointLight(0x70a0ff, this.baseIntensity, 400);
        this.pointLight.position.set(0, 50, 0);
        scene.add(this.pointLight);
    }

    public updateIntensity(audioEnergyNormalized: number): void {
        // audioEnergyNormalized: 0.0 to 1.0
        this.pointLight.intensity = this.baseIntensity + audioEnergyNormalized * 2.5;
    }
}
