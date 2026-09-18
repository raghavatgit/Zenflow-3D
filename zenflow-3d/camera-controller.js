/**
 * Inertial Orbit Camera Physics Controller
 * Smoothly interpolates spherical coordinates with friction damping.
 */

export class InertialCameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.theta = 0;
    this.phi = Math.PI / 4;
    this.radius = 15;

    this.targetTheta = this.theta;
    this.targetPhi = this.phi;

    this.dampingFactor = 0.08;
    this.isDragging = false;
    this.prevMouse = { x: 0, y: 0 };

    this.bindEvents();
  }

  bindEvents() {
    this.domElement.addEventListener("pointerdown", (e) => {
      this.isDragging = true;
      this.prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("pointermove", (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.prevMouse.x;
      const deltaY = e.clientY - this.prevMouse.y;
      this.prevMouse = { x: e.clientX, y: e.clientY };

      this.targetTheta -= deltaX * 0.005;
      this.targetPhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.targetPhi - deltaY * 0.005));
    });

    window.addEventListener("pointerup", () => {
      this.isDragging = false;
    });
  }

  update() {
    this.theta += (this.targetTheta - this.theta) * this.dampingFactor;
    this.phi += (this.targetPhi - this.phi) * this.dampingFactor;

    this.camera.position.x = this.radius * Math.sin(this.phi) * Math.sin(this.theta);
    this.camera.position.y = this.radius * Math.cos(this.phi);
    this.camera.position.z = this.radius * Math.sin(this.phi) * Math.cos(this.theta);
    this.camera.lookAt(0, 0, 0);
  }
}
