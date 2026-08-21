export const vertexShader = `
uniform float uTime;
uniform float uProgress;
uniform float uDpr;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vDepth;

// Simple 3D noise
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
    vec3 pos = position;
    vec3 norm = normal;
    
    // Very subtle breathing displacement along normal (like the Lusion figure)
    float n = snoise(pos * 3.0 + uTime * 0.3);
    float breathe = sin(uTime * 0.8) * 0.02 + 0.02;
    pos += norm * n * breathe;
    
    // Slow gentle rotation
    float angle = uTime * 0.15;
    float c = cos(angle);
    float s = sin(angle);
    pos = vec3(pos.x * c - pos.z * s, pos.y, pos.x * s + pos.z * c);
    
    // === BURST on click (uProgress 0 -> 1) ===
    float burst = smoothstep(0.0, 0.6, uProgress);
    float scatter = smoothstep(0.2, 1.0, uProgress);
    
    // Each particle gets a unique outward direction based on its normal + noise
    vec3 burstDir = normalize(norm + vec3(
        snoise(pos * 2.0 + 10.0),
        snoise(pos * 2.0 + 20.0),
        snoise(pos * 2.0 + 30.0)
    ) * 0.4);
    
    // Smoothly expand outward
    pos += burstDir * burst * 8.0;
    
    // Add some scatter/turbulence as particles fly away
    pos += vec3(
        snoise(pos * 0.5 + uTime * 2.0),
        snoise(pos * 0.5 + uTime * 2.0 + 100.0),
        snoise(pos * 0.5 + uTime * 2.0 + 200.0)
    ) * scatter * 3.0;

    vNormal = norm;
    vPosition = pos;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Depth for varying brightness (like the Lusion figure)
    vDepth = -mvPosition.z;
    
    // Small, fine dots
    float baseSize = 1.2 * uDpr;
    gl_PointSize = baseSize * (8.0 / vDepth);
    
    // Points grow slightly during burst
    gl_PointSize *= 1.0 + burst * 0.5;
}
`;

export const fragmentShader = `
uniform float uProgress;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vDepth;

void main() {
    // Circular point
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float d = dot(uv, uv);
    if (d > 1.0) discard;
    
    // Soft falloff
    float alpha = 1.0 - smoothstep(0.0, 1.0, d);
    
    // Highlight scanline running through the ball (up and down)
    float scanline = sin(vPosition.y * 4.0 - uTime * 2.0) * 0.5 + 0.5;
    scanline = smoothstep(0.97, 1.0, scanline); // Sharp thin highlight
    
    // Depth-based brightness (closer = brighter, like the Lusion figure)
    float depthBrightness = smoothstep(8.0, 3.0, vDepth);
    
    // Grey gradient (darker grey for far dots, bright white-grey for close dots)
    vec3 color = mix(
        vec3(0.1, 0.1, 0.1),  
        vec3(0.85, 0.85, 0.85),    
        depthBrightness
    );
    
    // Add the pure white scanning highlight
    color = mix(color, vec3(1.0), scanline * 0.9);
    
    // Fade out during burst
    float burstFade = 1.0 - smoothstep(0.5, 1.0, uProgress);
    alpha *= burstFade;
    
    gl_FragColor = vec4(color, alpha);
}
`;
