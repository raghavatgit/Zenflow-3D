// WebGL Performance Diagnostic Monitor
// Tracks real-time frame rates, delta times, and WebGL renderer draw call counts.

import * as THREE from 'three';

export class PerformanceHUD {
    private lastTime: number = performance.now();
    private frames: number = 0;
    private fps: number = 60;

    public update(renderer: THREE.WebGLRenderer): { fps: number; drawCalls: number; triangles: number } {
        const now = performance.now();
        this.frames++;

        if (now - this.lastTime >= 1000) {
            this.fps = Math.round((this.frames * 1000) / (now - this.lastTime));
            this.frames = 0;
            this.lastTime = now;
        }

        return {
            fps: this.fps,
            drawCalls: renderer.info.render.calls,
            triangles: renderer.info.render.triangles
        };
    }
}
