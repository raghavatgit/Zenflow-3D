/**
 * Infinite Holographic Floor Grid
 * Fragment shader calculating distance-attenuated grid lines
 * for spatial immersion in the 3D focus viewport.
 */

export const InfiniteGridShader = {
  vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vWorldPosition;

    void main() {
      vec2 coord = vWorldPosition.xz;
      vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
      float line = min(grid.x, grid.y);

      float dist = length(vWorldPosition.xz);
      float alpha = (1.0 - min(line, 1.0)) * (1.0 - smoothstep(5.0, 25.0, dist));

      gl_FragColor = vec4(0.3, 0.6, 0.9, alpha * 0.4);
    }
  `
};
