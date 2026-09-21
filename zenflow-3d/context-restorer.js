/**
 * WebGL Context Loss Recovery Manager
 * Attaches to canvas WebGL context loss events to prevent app crashes
 * and orchestrates automatic shader program and buffer re-instantiation.
 */

export class WebGLContextRestorer {
  constructor(canvas, onRestore) {
    this.canvas = canvas;
    this.onRestore = onRestore;
    this.isContextLost = false;
    this.bindEvents();
  }

  bindEvents() {
    this.canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault(); // Prevents browser default action of discarding WebGL context permanently
      this.isContextLost = true;
      console.warn("[Zenflow-3D] WebGL context lost. Suspending render pipeline.");
    }, false);

    this.canvas.addEventListener("webglcontextrestored", () => {
      this.isContextLost = false;
      console.info("[Zenflow-3D] WebGL context restored. Recompiling shaders and reallocating buffers.");
      if (this.onRestore) {
        this.onRestore();
      }
    }, false);
  }
}
