/**
 * Spatial Ambient Particle Simulation
 * Lightweight math kernel computing 3D floating dust particles
 * for kinetic focus visualization.
 */

export class AmbientParticleKernel {
  constructor(particleCount = 200) {
    this.count = particleCount;
    this.positions = new Float32Array(particleCount * 3);
    this.velocities = new Float32Array(particleCount * 3);
    this.initParticles();
  }

  initParticles() {
    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      this.positions[idx] = (Math.random() - 0.5) * 20;
      this.positions[idx + 1] = (Math.random() - 0.5) * 20;
      this.positions[idx + 2] = (Math.random() - 0.5) * 20;

      this.velocities[idx] = (Math.random() - 0.5) * 0.01;
      this.velocities[idx + 1] = Math.random() * 0.01 + 0.005;
      this.velocities[idx + 2] = (Math.random() - 0.5) * 0.01;
    }
  }

  tick(deltaMs = 16) {
    const scale = deltaMs / 16.0;
    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      this.positions[idx] += this.velocities[idx] * scale;
      this.positions[idx + 1] += this.velocities[idx + 1] * scale;
      this.positions[idx + 2] += this.velocities[idx + 2] * scale;

      // Wrap around bounding box
      if (this.positions[idx + 1] > 10) {
        this.positions[idx + 1] = -10;
        this.positions[idx] = (Math.random() - 0.5) * 20;
        this.positions[idx + 2] = (Math.random() - 0.5) * 20;
      }
    }
  }
}
