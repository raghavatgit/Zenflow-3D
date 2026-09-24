// Smooth Camera Orbit Damping
// Interpolates camera position and orientation using spherical coordinates and friction damping.

import * as THREE from 'three';

export class SmoothOrbitController {
    private camera: THREE.Camera;
    private targetRadius: number = 200;
    private currentRadius: number = 200;
    private targetTheta: number = 0;
    private currentTheta: number = 0;
    private targetPhi: number = Math.PI / 4;
    private currentPhi: number = Math.PI / 4;
    private dampingFactor: number = 0.05;

    constructor(camera: THREE.Camera) {
        this.camera = camera;
    }

    public update(): void {
        this.currentRadius += (this.targetRadius - this.currentRadius) * this.dampingFactor;
        this.currentTheta += (this.targetTheta - this.currentTheta) * this.dampingFactor;
        this.currentPhi += (this.targetPhi - this.currentPhi) * this.dampingFactor;

        this.camera.position.x = this.currentRadius * Math.sin(this.currentPhi) * Math.sin(this.currentTheta);
        this.camera.position.y = this.currentRadius * Math.cos(this.currentPhi);
        this.camera.position.z = this.currentRadius * Math.sin(this.currentPhi) * Math.cos(this.currentTheta);
        this.camera.lookAt(0, 0, 0);
    }
}
