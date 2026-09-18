/**
 * Procedural Celestial Background Shader
 * Vertex and fragment shaders generating volumetric starfields
 * with smooth radial falloff.
 */

export const NebulaShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      float dist = length(uv);

      // Subtle atmospheric center glow
      float glow = 0.05 / (dist + 0.1);

      // Procedural micro-stars
      vec2 grid = floor(vUv * 120.0);
      float star = step(0.992, hash(grid));

      vec3 baseColor = vec3(0.04, 0.05, 0.08);
      vec3 starColor = vec3(0.85, 0.9, 1.0) * star;
      vec3 glowColor = vec3(0.2, 0.35, 0.5) * glow;

      gl_FragColor = vec4(baseColor + starColor + glowColor, 1.0);
    }
  `
};
