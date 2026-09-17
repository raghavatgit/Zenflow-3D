/**
 * Web Audio 3D Spatial Positioning
 * Binds focus chime audio nodes to virtual 3D coordinates.
 */

export class SpatialAudioDirector {
  constructor() {
    this.ctx = null;
    this.panner = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.panner = this.ctx.createPanner();
      this.panner.panningModel = "HRTF";
      this.panner.distanceModel = "inverse";
      this.panner.refDistance = 1;
      this.panner.maxDistance = 10000;
      this.panner.rolloffFactor = 1;
      this.panner.connect(this.ctx.destination);
    }
  }

  updateListenerPosition(x, y, z) {
    this.init();
    if (this.ctx.listener.positionX) {
      this.ctx.listener.positionX.setValueAtTime(x, this.ctx.currentTime);
      this.ctx.listener.positionY.setValueAtTime(y, this.ctx.currentTime);
      this.ctx.listener.positionZ.setValueAtTime(z, this.ctx.currentTime);
    } else {
      this.ctx.listener.setPosition(x, y, z);
    }
  }

  updateSourcePosition(x, y, z) {
    this.init();
    if (this.panner.positionX) {
      this.panner.positionX.setValueAtTime(x, this.ctx.currentTime);
      this.panner.positionY.setValueAtTime(y, this.ctx.currentTime);
      this.panner.positionZ.setValueAtTime(z, this.ctx.currentTime);
    } else {
      this.panner.setPosition(x, y, z);
    }
  }
}
