/**
 * Spatial Audio Distance Attenuation Model
 * Calculates logarithmic volume roll-off and air absorption filtering
 * based on 3D Euclidean distance between listener and audio source.
 */

export class DistanceAttenuationModel {
  static computeGain(distance, refDistance = 1.0, maxDistance = 50.0, rolloffFactor = 1.0) {
    if (distance <= refDistance) return 1.0;
    if (distance >= maxDistance) return 0.0;

    // Logarithmic attenuation formula adhering to OpenAL standard
    return (refDistance / (refDistance + rolloffFactor * (distance - refDistance)));
  }

  static computeLowPassCutoff(distance, maxDistance = 50.0) {
    // Air absorbs high frequencies over distance: roll off from 20kHz down to 2kHz
    const normalized = Math.min(1.0, distance / maxDistance);
    return 20000 - normalized * 18000;
  }
}
