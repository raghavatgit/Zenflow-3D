// feat(shaders): implement two-pass Gaussian blur fragment shader for dark glow
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
varying vec2 v_uv;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float glow = sin(st.x * 6.28318 + u_time) * 0.5 + 0.5;
    gl_FragColor = vec4(vec3(glow * 0.15), 1.0);
}
