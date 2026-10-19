// VincentHosting fragment shader, unchanged except green output mapped to red.
export const fragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

out vec4 outColor;

#define PI 3.14159265359
#define TAU 6.28318530718
#define MAX_STEPS 80
#define MAX_DIST 50.0
#define SURF_DIST 0.001

mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c);
}

float sdOctahedron(vec3 p, float s) {
  p = abs(p);
  float m = p.x + p.y + p.z - s;
  vec3 q;
  if (3.0 * p.x < m) q = p.xyz;
  else if (3.0 * p.y < m) q = p.yzx;
  else if (3.0 * p.z < m) q = p.zxy;
  else return m * 0.57735027;
  float k = clamp(0.5 * (q.z - q.y + s), 0.0, s);
  return length(vec3(q.x, q.y - s + k, q.z - k));
}

float sdTriPrism(vec3 p, vec2 h) {
  vec3 q = abs(p);
  return max(q.z - h.y, max(q.x * 0.866025 + p.y * 0.5, -p.y) - h.x * 0.5);
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float smax(float a, float b, float k) {
  return -smin(-a, -b, k);
}

float map(vec3 p) {
  vec2 m = (u_mouse - 0.5) * 0.6;
  p.xy += m * 0.25;

  p.xz *= rot(u_time * 0.05);
  p.xy *= rot(u_time * 0.035);

  float d = 100.0;

  vec3 p1 = p;
  p1.yz *= rot(u_time * 0.065);

  float coreDistort = sin(p1.x * 3.0 + u_time * 0.5) * sin(p1.y * 3.0 + u_time * 0.5) * sin(p1.z * 3.0 + u_time * 0.5) * 0.1;
  float core = sdOctahedron(p1, 1.6) + coreDistort;

  vec3 p2 = p1;
  p2.xy *= rot(PI * 0.25 + u_time * 0.09);
  float prism = sdTriPrism(p2, vec2(1.4, 2.0));
  core = smax(core, -prism, 0.2);

  d = core;

  float kBlend = 0.2 + 0.15 * (0.5 + 0.5 * sin(u_time * 0.7));

  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float angle = fi * TAU / 4.0 + u_time * 0.13;
    float radius = 3.0 + 0.3 * sin(u_time * 0.18 + fi);

    vec3 pos = vec3(
      cos(angle) * radius,
      sin(angle * 0.7) * 1.0,
      sin(angle) * radius
    );

    vec3 po = p - pos;
    po.xy *= rot(u_time * 0.22 + fi);

    float satDistort = sin(po.x * 5.0 + fi) * sin(po.y * 5.0 + fi) * sin(po.z * 5.0 + fi) * 0.05;
    float satellite = sdOctahedron(po, 0.4) + satDistort;

    d = smin(d, satellite, kBlend);
  }

  return d;
}

vec3 getNormal(vec3 p) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

float raymarch(vec3 ro, vec3 rd) {
  float t = 0.0;
  for (int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    if (abs(d) < SURF_DIST || t > MAX_DIST) break;
    t += d * 0.7;
  }
  return t;
}

vec3 getGlow(vec3 rd) {
  float a = 0.5 + 0.5 * sin(rd.x * 2.0 + u_time * 0.15);
  float b = 0.5 + 0.5 * sin(rd.y * 2.5 + u_time * 0.12 + 1.3);
  float c = 0.5 + 0.5 * sin(rd.z * 1.7 + u_time * 0.10 + 2.6);

  vec3 dark   = vec3(0.01, 0.08, 0.02);
  vec3 mid    = vec3(0.04, 0.42, 0.10);
  vec3 bright = vec3(0.12, 0.88, 0.22);
  vec3 pale   = vec3(0.55, 1.00, 0.45);

  vec3 col = mix(dark, mid, a);
  col = mix(col, bright, b * 0.75);
  col += pale * pow(c, 3.0) * 0.35;
  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

  vec2 m = (u_mouse - 0.5) * 0.15;
  vec3 ro = vec3(m.x * 2.0, m.y * 2.0, 5.5);
  vec3 rd = normalize(vec3(uv, -1.0));

  rd.xy *= rot(m.x * 0.08);
  rd.yz *= rot(m.y * 0.08);

  float t = raymarch(ro, rd);

  vec3 color = vec3(0.0);
  float edgeAccent = 0.0;

  if (t < MAX_DIST) {
    vec3 p = ro + rd * t;
    vec3 normal = getNormal(p);
    vec3 viewDir = normalize(ro - p);

    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);

    float ior = 1.5;
    vec3 refractDir = refract(rd, normal, 1.0 / ior);

    if (length(refractDir) > 0.0) {
      float t2 = raymarch(p - normal * 0.01, refractDir);

      if (t2 < MAX_DIST) {
        vec3 p2 = p - normal * 0.01 + refractDir * t2;
        vec3 normal2 = getNormal(p2);

        vec3 r = refract(refractDir, -normal2, ior - 0.2);
        vec3 g = refract(refractDir, -normal2, ior);
        vec3 b = refract(refractDir, -normal2, ior + 0.2);

        vec3 bgR = getGlow(r) * vec3(0.50, 0.90, 0.08);
        vec3 bgG = getGlow(g) * vec3(0.25, 1.50, 0.10);
        vec3 bgB = getGlow(b) * vec3(0.15, 1.10, 0.05);

        color = vec3(bgR.x, bgG.y, bgB.z);
        color = pow(color, vec3(0.7)) * 5.0;
      } else {
        color = getGlow(refractDir) * 2.0;
      }
    }

    vec3 lightDir = normalize(vec3(1.0, 1.0, -1.0));
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 150.0);
    color += spec * vec3(1.0, 1.0, 1.0) * 3.5;

    float fresWave = 0.5 + 0.5 * sin(fresnel * TAU + u_time);
    vec3 fresnelColor = mix(vec3(0.06, 0.65, 0.20), vec3(0.55, 1.00, 0.45), fresWave);
    color += fresnel * fresnelColor * 1.4;

    float edge = pow(1.0 - abs(dot(viewDir, normal)), 4.0);
    color += edge * vec3(0.20, 1.00, 0.30) * 0.8;
    edgeAccent = smoothstep(0.55, 0.95, edge);

    float sss = pow(max(dot(-normal, lightDir), 0.0), 2.0);
    color += sss * vec3(0.08, 0.85, 0.15) * 0.6;
  } else {
    color = vec3(0.0);
  }

  float vignette = 1.0 - length(uv) * 0.4;
  vignette = smoothstep(0.3, 1.0, vignette);
  color *= vignette;

  color = pow(color, vec3(0.88));
  color *= 1.12;

  outColor = vec4(t < MAX_DIST ? max((138.0 / 255.0) * clamp(0.65 + 0.35 * color.g, 0.0, 1.0), edgeAccent) : 0.0, 0.0, 0.0, 1.0);
}
`;
