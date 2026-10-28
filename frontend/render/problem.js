import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

// ELVARA · "The problem" film — rendered offline, frame by frame, deterministic.
//  0–10 s  An ocean of floating plastic under a smoggy sun; the debris is drawn
//          into a vast gyre.
// 10–15 s  The planet, sealed inside a plastic bag that tightens and twists shut,
//          circled by a ring of debris.
// 15–20 s  Title and three figures; fades to black so the film loops cleanly.

const q = new URLSearchParams(location.search);
const W = +q.get('w') || 1920;
const H = +q.get('h') || 1080;
const SS = +q.get('ss') || 1.5; // supersampling
const FPS = 30;
const DUR = 20;
const portrait = H > W;

// ── helpers ──────────────────────────────────────────────────────────────
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const outCubic = (t) => 1 - Math.pow(1 - t, 3);
const outExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const span = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
const R = rng(7);
const col = (hex) => new THREE.Color(hex);

// ── renderer ─────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(W * SS, H * SS, false);
renderer.domElement.id = 'gl';
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);
const out = document.getElementById('out');
out.width = W; out.height = H;
const octx = out.getContext('2d');
const status = document.getElementById('status');

const camera = new THREE.PerspectiveCamera(portrait ? 60 : 36, W / H, 0.1, 2000);
const pmrem = new THREE.PMREMGenerator(renderer);

// ── shared GLSL ──────────────────────────────────────────────────────────
const NOISE = /* glsl */ `
  float hash3(vec3 p){ p = fract(p*0.3183099+.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float vnoise(vec3 x){ vec3 i=floor(x); vec3 f=fract(x); f=f*f*(3.-2.*f);
    return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x), mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x), mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z); }
  float fbm(vec3 p){ float a=0.5, s=0.; for(int i=0;i<6;i++){ s+=a*vnoise(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=0.5; } return s; }
`;

// Ocean waves — the same sum is evaluated in GLSL and JS so debris rides the swell.
const WAVES = [
  [0.9, 0.4, 0.22, 0.34, 0.9], [-0.3, 1.0, 0.31, 0.22, 1.1], [0.6, -0.8, 0.47, 0.13, 1.4],
  [-0.95, -0.3, 0.71, 0.07, 1.8], [0.2, 0.98, 1.13, 0.04, 2.3], [0.75, 0.66, 1.7, 0.025, 2.9],
].map(([x, z, k, a, w], i) => { const l = Math.hypot(x, z); return [x / l, z / l, k, a, w, i * 1.7]; });
const waveGLSL = `float waveH(vec2 p, float t){ float h = 0.0;\n${WAVES.map(
  ([x, z, k, a, w, ph]) => `h += ${a.toFixed(4)}*sin(${k.toFixed(4)}*dot(vec2(${x.toFixed(4)},${z.toFixed(4)}),p) + ${w.toFixed(4)}*t + ${ph.toFixed(4)});`
).join('\n')}\nreturn h; }`;
const waveH = (x, z, t) => WAVES.reduce((h, [dx, dz, k, a, w, ph]) => h + a * Math.sin(k * (dx * x + dz * z) + w * t + ph), 0);
// The gyre: from 5 s the sea sinks into a whirlpool that swallows the debris.
const GX = 0, GZ = -70;
const gyreAmt = (t) => sstep(4.8, 8.4, t);
const surfGLSL = /* glsl */ `
  uniform float uGyre;
  float surfH(vec2 p, float t){
    vec2 d = p - vec2(${GX.toFixed(1)}, ${GZ.toFixed(1)}); float r2 = dot(d,d);
    return waveH(p, t)*(1.0 - 0.6*uGyre*exp(-r2/1400.0)) - uGyre*11.0*exp(-r2/420.0);
  }`;
const surfH = (x, z, t) => {
  const g = gyreAmt(t), r2 = (x - GX) ** 2 + (z - GZ) ** 2;
  return waveH(x, z, t) * (1 - 0.6 * g * Math.exp(-r2 / 1400)) - g * 11 * Math.exp(-r2 / 420);
};

// ═════════════════════════════ OCEAN WORLD ═════════════════════════════
const ocean = new THREE.Scene();
const SUN = new THREE.Vector3(0.12, 0.07, -1).normalize();
const skyU = {
  uSunDir: { value: SUN }, uSunCol: { value: col('#ffcf8a') },
  uHorizon: { value: col('#2e2b20') }, uZenith: { value: col('#020504') },
};
const SKY = /* glsl */ `
  uniform vec3 uSunDir, uSunCol, uHorizon, uZenith;
  vec3 sky(vec3 d){
    float h = max(d.y, 0.0);
    vec3 c = mix(uHorizon, uZenith, pow(h, 0.42));
    float s = max(dot(d, uSunDir), 0.0);
    c += uSunCol * (pow(s, 10.0) * 0.12 + pow(s, 90.0) * 0.3 + pow(s, 2200.0) * 22.0);
    return c;
  }
`;
const skyMat = new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false,
  vertexShader: `varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `${SKY} varying vec3 vD; void main(){ vec3 d = normalize(vD); vec3 c = d.y < 0. ? mix(uHorizon*0.5, uZenith*0.4, clamp(-d.y*4.,0.,1.)) : sky(d); gl_FragColor = vec4(c,1.); }`,
});
const skyDome = new THREE.Mesh(new THREE.SphereGeometry(900, 64, 32), skyMat);
ocean.add(skyDome);
{ // environment for reflections, drawn from the same smoggy sky
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 64, 32), skyMat));
  ocean.environment = pmrem.fromScene(envScene, 0.02, 0.1, 100).texture;
}

const waterU = {
  ...skyU, uTime: { value: 0 }, uGyre: { value: 0 },
  uDeep: { value: col('#000403') }, uShallow: { value: col('#0a2c22') },
};
const waterGeo = new THREE.PlaneGeometry(1600, 1600, 560, 560);
waterGeo.rotateX(-Math.PI / 2);
const water = new THREE.Mesh(waterGeo, new THREE.ShaderMaterial({
  uniforms: waterU,
  vertexShader: /* glsl */ `
    uniform float uTime; varying vec3 vW; varying vec3 vN; varying float vH;
    ${waveGLSL}
    ${surfGLSL}
    void main(){
      vec3 w = (modelMatrix*vec4(position,1.)).xyz;
      float e = 0.08;
      float h = surfH(w.xz, uTime);
      float hx = surfH(w.xz+vec2(e,0.), uTime), hz = surfH(w.xz+vec2(0.,e), uTime);
      w.y = h; vH = h;
      vN = normalize(vec3(-(hx-h)/e, 1.0, -(hz-h)/e));
      vW = w;
      gl_Position = projectionMatrix*viewMatrix*vec4(w,1.);
    }`,
  fragmentShader: /* glsl */ `
    ${SKY}
    uniform float uTime, uGyre; uniform vec3 uDeep, uShallow;
    varying vec3 vW; varying vec3 vN; varying float vH;
    void main(){
      vec3 n = vN;
      // Spiral foam streaks wound into the whirlpool.
      vec2 gd = vW.xz - vec2(${GX.toFixed(1)}, ${GZ.toFixed(1)});
      float gr = length(gd), ga = atan(gd.y, gd.x);
      float arms = sin(ga*5.0 + log(gr + 1.0)*7.0 + uTime*2.6) * 0.5 + 0.5;
      float fine = sin(ga*13.0 + log(gr + 1.0)*15.0 + uTime*3.4 + sin(gr*0.7)) * 0.5 + 0.5;
      float foam = (smoothstep(0.72, 1.0, arms)*0.8 + smoothstep(0.85, 1.0, fine)*0.4) * smoothstep(48.0, 10.0, gr) * smoothstep(1.5, 6.0, gr) * uGyre;
      // Fine ripples on top of the swell.
      n.xz += 0.07*vec2(sin(vW.x*3.1+uTime*2.1+sin(vW.z*2.3)), cos(vW.z*2.7-uTime*1.7+sin(vW.x*1.9)));
      n.xz += 0.03*vec2(sin(vW.x*9.7-uTime*3.3+vW.z*4.1), cos(vW.z*8.9+uTime*2.9-vW.x*3.7));
      n = normalize(n);
      vec3 V = normalize(cameraPosition - vW);
      float fres = 0.02 + 0.98*pow(1.0 - max(dot(n, V), 0.0), 5.0);
      vec3 Rr = reflect(-V, n); Rr.y = abs(Rr.y);
      vec3 refl = sky(Rr);
      vec3 body = mix(uDeep, uShallow, clamp(vH*0.9+0.35, 0., 1.)*0.55) * (0.35 + 0.65*max(dot(n, uSunDir), 0.));
      vec3 c = mix(body, refl*0.75, fres);
      // The throat of the whirlpool falls into darkness.
      c *= mix(1.0, 0.25, smoothstep(14.0, 2.0, gr)*uGyre);
      c += vec3(0.22, 0.23, 0.2) * foam * (0.25 + 0.75*max(dot(n, uSunDir), 0.2));
      float d = length(vW - cameraPosition);
      vec3 fogC = sky(normalize(vec3(vW.x-cameraPosition.x, 0.03, vW.z-cameraPosition.z)));
      c = mix(c, fogC, 1.0 - exp(-d*0.011));
      gl_FragColor = vec4(c, 1.0);
    }`,
}));
water.position.set(0, 0, -60);
ocean.add(water);
ocean.add(new THREE.HemisphereLight(0x3a3526, 0x02110c, 0.55));
const oSun = new THREE.DirectionalLight(0xffdcae, 2.0);
oSun.position.copy(SUN).multiplyScalar(100);
ocean.add(oSun);
// A soft fill from behind the camera so the film's camera-facing side reads pale and glossy.
const oFill = new THREE.DirectionalLight(0xdfe6dc, 1.3);
oFill.position.set(-20, 30, 60);
ocean.add(oFill);

// ── plastic debris geometry ──────────────────────────────────────────────
function sheetGeo(seed) {
  const g = new THREE.PlaneGeometry(1, 1, 16, 16);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i);
    const nx = x * (1 + 0.28 * Math.sin(y * 5 + seed)), ny = y * (1 + 0.22 * Math.sin(x * 4 + seed * 1.3));
    const z = 0.07 * Math.sin(nx * 9 + seed) * Math.cos(ny * 7 + seed * 0.7)
      + 0.05 * Math.sin((nx * 1.3 + ny) * 17 + seed * 3)
      + 0.02 * Math.sin(nx * 31 - ny * 23 + seed)
      + 0.16 * (nx * nx - ny * ny) * Math.sin(seed)
      + 0.2 * Math.max(0, nx * 0.8 - ny * 0.6 + 0.05) * Math.cos(seed * 2.1);
    p.setXYZ(i, nx, ny, z);
  }
  g.rotateX(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
}
function bagGeo(seed) {
  const g = new THREE.CylinderGeometry(0.42, 0.5, 1.1, 32, 18, true);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const a = Math.atan2(z, x), v = (y + 0.55) / 1.1;
    let r = Math.hypot(x, z);
    r *= 1 - 0.72 * sstep(0.55, 0.95, v); // gathered at the handles
    r += 0.05 * Math.sin(a * 9 + v * 6 + seed) + 0.03 * Math.sin(a * 17 - v * 11 + seed * 2) + 0.02 * Math.sin(v * 23 + a * 3);
    p.setXYZ(i, Math.cos(a) * r, y + 0.04 * Math.sin(a * 5 + seed), Math.sin(a) * r * 0.55);
  }
  g.rotateZ(Math.PI / 2); // floats on its side
  g.computeVertexNormals();
  return g;
}
const TINTS = ['#ffffff', '#f1ede2', '#dfe8ec', '#c9d9e2', '#e8e2d0', '#cfd8c8', '#b9c7cf', '#a85a4c', '#d9cfa8'].map(col);
const tintFor = () => { const r = R(); return TINTS[r < 0.6 ? Math.floor(R() * 3) : r < 0.92 ? 3 + Math.floor(R() * 4) : 7 + Math.floor(R() * 2)]; };
const plastic = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, roughness: 0.24, metalness: 0, transmission: 0.45, thickness: 0.05, ior: 1.4,
  iridescence: 0.6, iridescenceIOR: 1.3, iridescenceThicknessRange: [180, 520],
  clearcoat: 0.6, clearcoatRoughness: 0.18, side: THREE.DoubleSide, envMapIntensity: 2.4,
});
const plasticSolid = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, roughness: 0.28, metalness: 0, transparent: true, opacity: 0.86,
  iridescence: 0.7, iridescenceIOR: 1.3, iridescenceThicknessRange: [180, 520],
  clearcoat: 0.5, clearcoatRoughness: 0.2, side: THREE.DoubleSide, envMapIntensity: 0.45,
});

// Ocean debris, each with a floating home and a place in the gyre.
const GYRE = new THREE.Vector3(0, 0, -70);
function debrisField(geo, mat, n, opts) {
  const mesh = new THREE.InstancedMesh(geo, mat, n);
  mesh.frustumCulled = false;
  const d = [];
  for (let i = 0; i < n; i++) {
    const hero = i < (opts.hero || 0);
    const x = hero ? (R() - 0.5) * 12 : (R() - 0.5) * 100;
    const z = hero ? lerp(-26, 13, R()) : lerp(-140, 16, Math.pow(R(), 0.8));
    const gr = 4 + Math.pow(R(), 0.7) * 32;
    d.push({
      x, z, s: (hero ? lerp(1.1, 2.1, R()) : lerp(0.35, 1.5, R())) * opts.scale,
      sub: R() * 0.12, yaw: R() * Math.PI * 2, seed: R() * 100,
      delay: R() * 1.3, gr, gTheta: Math.atan2(z - GYRE.z, x - GYRE.x), gw: 2.4 / (1 + gr / 9),
      gy: 1.2 + Math.pow(1 - gr / 37, 2) * 22 * (0.35 + 0.65 * R()), tumble: (R() - 0.5) * 3,
    });
    mesh.setColorAt(i, tintFor());
  }
  mesh.userData.d = d;
  return mesh;
}
const oceanDebris = [
  debrisField(sheetGeo(1.3), plastic, 300, { scale: 1, hero: 26 }),
  debrisField(sheetGeo(4.7), plastic, 260, { scale: 0.9, hero: 14 }),
  debrisField(bagGeo(2.2), plastic, 90, { scale: 1.1, hero: 6 }),
];
oceanDebris.forEach((m) => ocean.add(m));

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
function updateOceanDebris(t) {
  for (const mesh of oceanDebris) {
    mesh.userData.d.forEach((o, i) => {
      const fx = o.x + 0.25 * Math.sin(t * 0.3 + o.seed), fz = o.z + 0.2 * Math.cos(t * 0.27 + o.seed);
      const fy = surfH(fx, fz, t) + 0.04 - o.sub;
      const e = 0.3;
      const sx = (surfH(fx + e, fz, t) - fy) / e, sz = (surfH(fx, fz + e, t) - fy) / e;
      const b = inOut(sstep(5.0 + o.delay, 8.6 + o.delay, t));
      // Riding the whirlpool: circling faster and spiralling inward and down.
      const th = o.gTheta + Math.max(0, t - 5 - o.delay) * o.gw * b * 1.4;
      const gr = o.gr * lerp(1, 0.5, sstep(5.5, 10, t));
      const gx = GYRE.x + Math.cos(th) * gr, gz = GYRE.z + Math.sin(th) * gr;
      const gy = surfH(gx, gz, t) + 0.1 + (o.tumble > 1.2 ? o.gy * 0.5 * b : 0); // a few are flung up
      _p.set(lerp(fx, gx, b), lerp(fy, gy, b), lerp(fz, gz, b));
      const tumble = b * (t - 5) * o.tumble * 0.4;
      _e.set(-sz * 0.8 + 0.1 * Math.sin(t * 0.8 + o.seed) + tumble, o.yaw + t * 0.05, sx * 0.8 + 0.08 * Math.cos(t * 0.7 + o.seed) + tumble * 0.6);
      _q.setFromEuler(_e);
      _s.setScalar(o.s);
      mesh.setMatrixAt(i, _m.compose(_p, _q, _s));
    });
    mesh.instanceMatrix.needsUpdate = true;
  }
}

// Microplastic dust: soft motes that catch the sun, later drawn into the swirl.
function dust(n, box, color, size) {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3), sz = new Float32Array(n), sd = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = lerp(box[0], box[1], R()); pos[i * 3 + 1] = lerp(box[2], box[3], Math.pow(R(), 1.6)); pos[i * 3 + 2] = lerp(box[4], box[5], R());
    sz[i] = size * lerp(0.4, 1.6, Math.pow(R(), 2)); sd[i] = R();
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
  g.setAttribute('aSeed', new THREE.BufferAttribute(sd, 1));
  const m = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPix: { value: H * SS / 1080 }, uSwirl: { value: 0 }, uCenter: { value: GYRE }, uCol: { value: col(color) }, uAlpha: { value: 1 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aSize, aSeed; uniform float uTime, uPix, uSwirl; uniform vec3 uCenter; varying float vA;
      void main(){
        vec3 p = position;
        p += vec3(sin(uTime*0.3+aSeed*20.)*0.7, sin(uTime*0.22+aSeed*13.)*0.5, cos(uTime*0.25+aSeed*7.)*0.7);
        vec2 d = p.xz - uCenter.xz; float a = uSwirl*(0.6 + 9.0/(length(d)+4.0));
        p.xz = uCenter.xz + mat2(cos(a),-sin(a),sin(a),cos(a))*d;
        vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv;
        float dist = -mv.z;
        gl_PointSize = min(aSize*uPix*(300.0/dist), 26.0*uPix);
        vA = smoothstep(2.0, 8.0, dist)*(1.0 - smoothstep(90., 160., dist))*(0.55+0.45*sin(uTime*1.7+aSeed*40.));
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uCol; uniform float uAlpha; varying float vA;
      void main(){ float r = length(gl_PointCoord-0.5)*2.; float a = smoothstep(1.0, 0.15, r); gl_FragColor = vec4(uCol*a*vA*uAlpha, 1.0); }`,
  });
  return new THREE.Points(g, m);
}
const motes = dust(5200, [-60, 60, 0.3, 26, -150, 18], '#e8c890', 0.13);
ocean.add(motes);

// ═════════════════════════════ PLANET WORLD ════════════════════════════
const space = new THREE.Scene();
const SUN2 = new THREE.Vector3(1.0, 0.42, 0.3).normalize();
{ // reflections: one soft warm source and a faint green bounce, so the film reads as a sheen
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 64, 32), new THREE.ShaderMaterial({
    side: THREE.BackSide, uniforms: { uSun: { value: SUN2 } },
    vertexShader: `varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform vec3 uSun; varying vec3 vD; void main(){ vec3 d = normalize(vD); float s = max(dot(d,uSun),0.);
      vec3 c = vec3(0.004,0.008,0.006) + vec3(1.0,0.86,0.66)*(pow(s,18.)*2.2 + pow(s,3.)*0.12)
             + vec3(0.18,0.32,0.24)*pow(max(-d.x*0.7+d.y*0.3,0.),2.)*0.35;
      gl_FragColor = vec4(c,1.); }`,
  })));
  space.environment = pmrem.fromScene(envScene, 0, 0.1, 100).texture;
}
{ // deep emerald void, a faint warm bloom toward the sun
  space.add(new THREE.Mesh(new THREE.SphereGeometry(1200, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: { uSun: { value: SUN2 } },
    vertexShader: `varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform vec3 uSun; varying vec3 vD; void main(){ vec3 d = normalize(vD); float s = max(dot(d,uSun),0.);
      vec3 c = vec3(0.002,0.006,0.005) + vec3(0.03,0.05,0.035)*pow(s,3.) + vec3(0.12,0.09,0.05)*pow(s,24.);
      gl_FragColor = vec4(c,1.); }`,
  })));
  space.add(dust(2600, [-700, 700, -700, 700, -700, 700], '#f3ebd6', 0.035));
}
const tilt = new THREE.Group();
tilt.rotation.set(0.12, 0, 0.3);
space.add(tilt);
const earthU = { uSunDir: { value: SUN2 }, uSunCol: { value: col('#fff1dc') }, uTime: { value: 0 } };
const earth = new THREE.Mesh(new THREE.SphereGeometry(10, 192, 128), new THREE.ShaderMaterial({
  uniforms: earthU,
  vertexShader: `varying vec3 vP; varying vec3 vN; varying vec3 vW;
    void main(){ vP = position; vN = normalize(mat3(modelMatrix)*normal); vW = (modelMatrix*vec4(position,1.)).xyz; gl_Position = projectionMatrix*viewMatrix*vec4(vW,1.); }`,
  fragmentShader: /* glsl */ `
    ${NOISE}
    uniform vec3 uSunDir, uSunCol; uniform float uTime;
    varying vec3 vP; varying vec3 vN; varying vec3 vW;
    void main(){
      vec3 n = normalize(vP);
      float c = fbm(n*1.7 + 3.1);
      float land = smoothstep(0.505, 0.53, c);
      float det = fbm(n*7.0 + 1.3);
      vec3 sea = mix(vec3(0.004,0.022,0.028), vec3(0.012,0.06,0.058), det);
      vec3 ground = mix(vec3(0.045,0.065,0.03), vec3(0.12,0.095,0.055), smoothstep(0.38,0.66,det));
      float ice = smoothstep(0.8, 0.9, abs(n.y) + det*0.12);
      vec3 surf = mix(mix(sea, ground, land), vec3(0.42,0.44,0.42), ice);
      vec3 N = normalize(vN);
      float dif = max(dot(N, uSunDir), 0.0);
      vec3 V = normalize(cameraPosition - vW);
      float spec = pow(max(dot(N, normalize(V+uSunDir)), 0.), 70.)*(1.-land)*(1.-ice);
      float cl = smoothstep(0.56, 0.8, fbm(n*3.3 + vec3(uTime*0.025, 0., uTime*0.012)));
      vec3 c3 = surf*(dif*1.5*uSunCol + 0.012) + spec*uSunCol*0.9;
      c3 = mix(c3, vec3(0.78,0.78,0.74)*(dif*1.25 + 0.01), cl*0.72);
      float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
      c3 += vec3(0.32,0.5,0.4)*fres*(0.08 + dif)*0.7;
      gl_FragColor = vec4(c3, 1.0);
    }`,
}));
tilt.add(earth);
tilt.add(new THREE.Mesh(new THREE.SphereGeometry(10.75, 96, 64), new THREE.ShaderMaterial({
  side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uSun: { value: SUN2 } },
  vertexShader: `varying vec3 vN; varying vec3 vWN; void main(){ vN = normalize(normalMatrix*normal); vWN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 uSun; varying vec3 vN; varying vec3 vWN; void main(){ float i = pow(clamp(0.66 - dot(vN, vec3(0,0,1.)), 0., 1.), 3.2);
    float lit = 0.15 + 0.85*smoothstep(-0.3, 0.6, dot(vWN, uSun)); gl_FragColor = vec4(vec3(0.55,0.78,0.62)*i*lit*1.6, 1.); }`,
})));

// The plastic bag around the planet: a transparent film that tightens, creases
// and twists shut at the top. Displaced on the CPU so the normals stay true.
const wrapGeo = new THREE.SphereGeometry(1, 256, 180);
const wrapBase = wrapGeo.attributes.position.array.slice();
const wrap = new THREE.Mesh(wrapGeo, new THREE.MeshPhysicalMaterial({
  color: 0xf6f3ea, roughness: 0.16, metalness: 0, transmission: 1, thickness: 0.12, ior: 1.38,
  iridescence: 0.85, iridescenceIOR: 1.32, iridescenceThicknessRange: [220, 640],
  clearcoat: 1, clearcoatRoughness: 0.12, specularIntensity: 0.8, envMapIntensity: 1.6,
  attenuationColor: col('#e6dfcc'), attenuationDistance: 10,
}));
const wrapTilt = new THREE.Group();
wrapTilt.rotation.set(0.05, 0, 0.22);
wrapTilt.add(wrap);
space.add(wrapTilt);
function updateWrap(t) {
  const u = inOut(span(t, 10, 14.6));
  const rad = 10 * lerp(1.17, 1.035, u);
  const wr = lerp(0.25, 1, u);
  const tie = inOut(span(t, 11.2, 14.9));
  const p = wrapGeo.attributes.position.array;
  for (let i = 0; i < p.length; i += 3) {
    const nx = wrapBase[i], ny = wrapBase[i + 1], nz = wrapBase[i + 2];
    const lon = Math.atan2(nz, nx);
    const k = sstep(0.76, 1.0, ny) * tie;
    const pleat = (0.008 * Math.sin(lon * 26 + 2 * Math.sin(ny * 7)) + 0.004 * Math.sin(lon * 47 - ny * 13))
      * (0.05 + 0.95 * sstep(0.1, 1, ny)) * wr * (1 + 6 * k);
    const crinkle = wr * (0.004 * Math.sin(nx * 23 + ny * 17) * Math.sin(nz * 19 - ny * 29) + 0.004 * Math.sin(nx * 41 - nz * 37 + ny * 11));
    const r = 1 + pleat + crinkle;
    const lon2 = lon + k * k * 2.4 + 0.06 * Math.sin(t * 0.5);
    let ring = Math.sqrt(Math.max(0, 1 - ny * ny)) * r * (1 - 0.9 * k);
    ring *= 1 + 3.2 * sstep(0.972, 1.0, ny) * tie; // the gathered tuft above the twist
    p[i] = Math.cos(lon2) * ring * rad;
    p[i + 1] = (ny * r + k * k * 0.42) * rad;
    p[i + 2] = Math.sin(lon2) * ring * rad;
  }
  wrapGeo.attributes.position.needsUpdate = true;
  wrapGeo.computeVertexNormals();
}

// A ring of debris circling the sealed planet.
const ringGroup = new THREE.Group();
ringGroup.rotation.set(0.38, 0, -0.16);
space.add(ringGroup);
function ringField(geo, n, scale) {
  const mesh = new THREE.InstancedMesh(geo, plasticSolid, n);
  mesh.frustumCulled = false;
  const d = [];
  for (let i = 0; i < n; i++) {
    const r = lerp(15, 25, Math.pow(R(), 0.8));
    d.push({ r, th: R() * Math.PI * 2, y: (R() - 0.5) * 1.6 * (r / 15), s: lerp(0.18, 0.62, R()) * scale, w: 0.16 * Math.pow(15 / r, 1.5), rx: R() * 6, ry: R() * 6, sp: (R() - 0.5) * 1.2 });
    mesh.setColorAt(i, tintFor());
  }
  mesh.userData.d = d;
  ringGroup.add(mesh);
  return mesh;
}
const ringDebris = [ringField(sheetGeo(3.1), 340, 1), ringField(sheetGeo(8.2), 220, 1), ringField(bagGeo(5.5), 60, 1.2)];
function updateRing(t) {
  const grow = outCubic(span(t, 10, 13));
  for (const mesh of ringDebris) {
    mesh.userData.d.forEach((o, i) => {
      const th = o.th + t * o.w;
      const r = o.r * lerp(1.6, 1, grow);
      _p.set(Math.cos(th) * r, o.y, Math.sin(th) * r);
      _e.set(o.rx + t * o.sp, o.ry + t * o.sp * 0.7, 0);
      _q.setFromEuler(_e);
      _s.setScalar(o.s);
      mesh.setMatrixAt(i, _m.compose(_p, _q, _s));
    });
    mesh.instanceMatrix.needsUpdate = true;
  }
}
space.add(new THREE.AmbientLight(0x1a2a22, 0.25));
const sSun = new THREE.DirectionalLight(0xfff1dc, 2.2);
sSun.position.copy(SUN2).multiplyScalar(200);
space.add(sSun);
const rim = new THREE.DirectionalLight(0x7fae96, 0.9);
rim.position.set(-120, 40, -160);
space.add(rim);

// ── post ─────────────────────────────────────────────────────────────────
const composer = new EffectComposer(renderer);
composer.setPixelRatio(1);
composer.setSize(W * SS, H * SS);
const renderPass = new RenderPass(ocean, camera);
composer.addPass(renderPass);
composer.addPass(new UnrealBloomPass(new THREE.Vector2(W * SS, H * SS), 0.55, 0.55, 0.92));
composer.addPass(new OutputPass());

// ── cameras ──────────────────────────────────────────────────────────────
const _look = new THREE.Vector3();
function oceanCamera(t) {
  // 0–5 s: a low glide just above the swell, through drifting debris.
  const a = inOut(span(t, 0, 5.4));
  const ax = lerp(-2.2, 1.4, a), az = lerp(13, -14, a), ay = 2.1 + 0.35 * Math.sin(t * 0.7) + waveH(ax, az, t) * 0.25;
  const aLook = new THREE.Vector3(ax * 0.4, 1.0, az - 22);
  // 5–10 s: crane up and around to look down into the gyre.
  const b = inOut(span(t, 4.6, 10));
  const phi = lerp(-0.15, 0.75, b);
  const bx = GYRE.x + Math.sin(phi) * 50, bz = GYRE.z + Math.cos(phi) * 50, by = 30;
  camera.position.set(lerp(ax, bx, b), lerp(ay, by, b), lerp(az, bz, b));
  _look.lerpVectors(aLook, new THREE.Vector3(GYRE.x, 5, GYRE.z), b);
  const roll = 0.025 * Math.sin(t * 0.45) + b * 0.06;
  camera.up.set(Math.sin(roll), Math.cos(roll), 0);
  camera.lookAt(_look);
}
function spaceCamera(t) {
  const a = outCubic(span(t, 9.9, 15.2));
  const c = inOut(span(t, 15, 20));
  let dist = lerp(lerp(92, 50, a), 47, c);
  if (portrait) dist *= 1.35;
  const az = lerp(lerp(0.95, 0.4, a), 0.24, c);
  const el = lerp(lerp(0.34, 0.15, a), 0.1, c);
  camera.position.set(dist * Math.cos(el) * Math.sin(az), dist * Math.sin(el), dist * Math.cos(el) * Math.cos(az));
  // For the title: the planet moves aside (left on landscape, up on portrait).
  const shift = inOut(span(t, 14.8, 16.8));
  const right = new THREE.Vector3(Math.cos(az), 0, -Math.sin(az));
  _look.set(0, 0, 0);
  if (portrait) _look.y -= shift * 15;
  else _look.addScaledVector(right, shift * 10.5);
  camera.up.set(0, 1, 0);
  camera.lookAt(_look);
}

// ── title & figures (2D, over the frame) ─────────────────────────────────
const CREAM = '#f3ebd6', CHAMP = '#e8d7ae', GOLD = '#b9a27a';
const STATS = [
  { n: 500, fmt: (v) => `${Math.round(v)}`, u: 'years', l: ['for one plastic wrapper', 'to break down'] },
  { n: 11, fmt: (v) => `${Math.round(v)}M`, u: 'tonnes', l: ['of plastic enter our', 'oceans every year'] },
  { n: 33, fmt: (v) => `${Math.round(v)}%`, u: '', l: ['of all food is lost', 'or wasted'] },
];
function line(ctx, t, at, dur, draw, rise = 46) {
  const p = outExpo(span(t, at, at + dur));
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, p * 1.4);
  ctx.translate(0, (1 - p) * rise);
  draw();
  ctx.restore();
}
function drawTitle(ctx, t) {
  if (t < 14.9) return;
  const s = portrait ? W / 1080 : H / 1080;
  const L = portrait
    ? { x: 90 * s, y: 1120 * s, w: 900 * s, h1: 74 * s, eb: 22 * s, num: 64 * s, lab: 23 * s, col: 300 * s, gap: 88 * s }
    : { x: 1030 * s, y: 320 * s, w: 800 * s, h1: 80 * s, eb: 18 * s, num: 66 * s, lab: 20 * s, col: 272 * s, gap: 90 * s };
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  // Soft shade so type always sits on calm darkness.
  const g = portrait
    ? ctx.createLinearGradient(0, L.y - 260 * s, 0, H)
    : ctx.createLinearGradient(L.x - 260 * s, 0, W, 0);
  const shade = inOut(span(t, 14.9, 16));
  g.addColorStop(0, 'rgba(1,6,4,0)');
  g.addColorStop(0.45, `rgba(1,6,4,${0.55 * shade})`);
  g.addColorStop(1, `rgba(1,6,4,${0.78 * shade})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  line(ctx, t, 15.15, 1.1, () => {
    ctx.font = `500 ${L.eb}px Author`;
    ctx.letterSpacing = `${0.34 * L.eb}px`;
    ctx.fillStyle = GOLD;
    ctx.fillText('01  ·  THE PROBLEM', L.x, L.y);
  }, 24 * s);
  ctx.letterSpacing = '0px';
  const y1 = L.y + L.gap * 1.25, y2 = y1 + L.h1 * 1.08;
  const mask = (y, h, fn) => { ctx.save(); ctx.beginPath(); ctx.rect(0, y - h, W, h * 1.32); ctx.clip(); fn(); ctx.restore(); };
  mask(y1, L.h1, () => line(ctx, t, 15.35, 1.3, () => {
    ctx.font = `300 ${L.h1}px Zodiak`; ctx.letterSpacing = `${-0.02 * L.h1}px`; ctx.fillStyle = CREAM;
    ctx.fillText('We sealed our planet', L.x, y1);
  }, L.h1));
  mask(y2, L.h1, () => line(ctx, t, 15.6, 1.3, () => {
    ctx.font = `italic 300 ${L.h1}px Zodiak`; ctx.letterSpacing = `${-0.01 * L.h1}px`; ctx.fillStyle = CHAMP;
    ctx.fillText('in plastic.', L.x, y2);
  }, L.h1));
  ctx.letterSpacing = '0px';
  // Hairline rule draws across.
  const ry = y2 + L.gap * 0.62;
  const rp = inOut(span(t, 16.1, 17.1));
  ctx.fillStyle = 'rgba(185,162,122,0.6)';
  ctx.fillRect(L.x, ry, L.w * rp, Math.max(1, s * 1.2));
  // Three figures, counting up.
  const sy = ry + L.gap * 1.05;
  STATS.forEach((st, i) => {
    const at = 16.45 + i * 0.28;
    const x = L.x + i * L.col;
    const v = st.n * outCubic(span(t, at, at + 1.5));
    line(ctx, t, at, 1.1, () => {
      ctx.font = `300 ${L.num}px Zodiak`; ctx.letterSpacing = `${-0.03 * L.num}px`; ctx.fillStyle = CREAM;
      const txt = st.fmt(v);
      ctx.fillText(txt, x, sy);
      const w = ctx.measureText(txt).width;
      ctx.letterSpacing = `${0.22 * L.lab * 0.8}px`;
      ctx.font = `500 ${L.lab * 0.78}px Author`; ctx.fillStyle = GOLD;
      if (st.u) ctx.fillText(st.u.toUpperCase(), x + w + 10 * s, sy);
      ctx.letterSpacing = '0px';
      ctx.font = `400 ${L.lab}px Author`; ctx.fillStyle = 'rgba(243,235,214,0.74)';
      st.l.forEach((ln, j) => ctx.fillText(ln, x, sy + L.lab * 2.1 + j * L.lab * 1.45));
    }, 26 * s);
  });
  line(ctx, t, 17.6, 1, () => {
    ctx.font = `400 ${L.lab * 0.72}px Author`; ctx.letterSpacing = `${0.18 * L.lab * 0.72}px`; ctx.fillStyle = 'rgba(243,235,214,0.42)';
    ctx.fillText('SOURCES  ·  UNEP  ·  FAO', L.x, sy + L.lab * 6.4);
  }, 10 * s);
  ctx.restore();
}

// ── frame ────────────────────────────────────────────────────────────────
function update(t) {
  const inSpace = t >= 9.95;
  renderPass.scene = inSpace ? space : ocean;
  if (!inSpace) {
    waterU.uTime.value = t;
    waterU.uGyre.value = gyreAmt(t);
    motes.material.uniforms.uTime.value = t;
    // Swirl angle integrates a speed that ramps up as the gyre forms.
    const ramp = (x) => (x <= 5 ? 0 : (x - 5) * sstep(5, 8.5, x));
    motes.material.uniforms.uSwirl.value = ramp(t) * 0.5;
    updateOceanDebris(t);
    oceanCamera(t);
    skyDome.position.copy(camera.position);
  } else {
    earthU.uTime.value = t;
    earth.rotation.y = 1.2 + t * 0.035;
    updateWrap(t);
    updateRing(t);
    spaceCamera(t);
  }
}
function fadeBlack(t) {
  return Math.max(
    1 - inOut(span(t, 0, 1.1)),
    sstep(9.2, 9.9, t) * (1 - sstep(9.95, 10.9, t)),
    sstep(19.15, 19.95, t)
  );
}
function composite(t) {
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = 'high';
  octx.drawImage(renderer.domElement, 0, 0, W, H);
  // Lens vignette.
  const v = octx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.6);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.55)');
  octx.fillStyle = v;
  octx.fillRect(0, 0, W, H);
  drawTitle(octx, t);
  const f = fadeBlack(t);
  if (f > 0) { octx.fillStyle = `rgba(0,0,0,${f})`; octx.fillRect(0, 0, W, H); }
}
function renderAt(t) {
  update(t);
  composer.render();
  composite(t);
}

window.preview = (t) => { renderAt(t); return t; };
// Review aid: renders several moments into one tiled sheet on screen.
window.sheet = (ts, cols = 3) => {
  const rows = Math.ceil(ts.length / cols);
  const tw = W / cols, th = H / cols;
  const c = document.createElement('canvas');
  c.width = W; c.height = th * rows;
  const x = c.getContext('2d');
  ts.forEach((t, i) => {
    renderAt(t);
    x.drawImage(out, (i % cols) * tw, Math.floor(i / cols) * th, tw, th);
    x.fillStyle = '#fff'; x.font = '20px system-ui'; x.fillText(`${t}s`, (i % cols) * tw + 10, Math.floor(i / cols) * th + 28);
  });
  out.height = c.height;
  octx.drawImage(c, 0, 0);
  return ts.length;
};
window.renderRange = async (name, a = 0, b = FPS * DUR) => {
  for (let f = a; f < b; f++) {
    renderAt(f / FPS);
    const blob = await new Promise((r) => out.toBlob(r, 'image/jpeg', 0.95));
    await fetch(`/__frame?name=${name}&f=${f}`, { method: 'POST', body: blob });
    status.textContent = `${name} ${f + 1}/${b}`;
    window.__progress = f + 1;
  }
  return 'done';
};

await document.fonts.load('300 40px Zodiak');
await document.fonts.load('italic 300 40px Zodiak');
await document.fonts.load('400 20px Author');
await document.fonts.load('500 20px Author');
renderer.compile(ocean, camera);
renderer.compile(space, camera);
renderAt(+q.get('t') || 2);
status.textContent = 'ready';
window.__ready = true;
