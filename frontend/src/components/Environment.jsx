import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { atmo } from '../lib/atmosphere';
import { scrollState, reducedMotion } from '../lib/scroll';

const silkVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// Domain-warped fbm folded into satin bands — the emerald silk with
// champagne highlights from the colour reference, recoloured live.
const silkFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime, uScroll, uHiAmt, uAspect;
  uniform vec2 uMouse;
  uniform vec3 uDeep, uMid, uHi;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = r * p * 2.02; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uAspect, 1.0) * 1.35;
    p += (uMouse - 0.5) * 0.08;
    float t = uTime * 0.035;
    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(p + 2.6 * q + vec2(1.7, 9.2) + 0.6 * t + uScroll * 0.9),
                  fbm(p + 2.6 * q + vec2(8.3, 2.8) - 0.5 * t));
    float f = fbm(p + 2.2 * r);

    float folds = sin(f * 10.0 + r.x * 6.0 - uScroll * 2.0) * 0.5 + 0.5;
    float sheen = pow(folds, 7.0) * smoothstep(0.25, 0.85, r.y);
    float shadow = smoothstep(0.55, 0.0, folds) * 0.35;

    vec3 col = mix(uDeep, uMid, smoothstep(0.15, 0.85, f));
    col = mix(col, uDeep, shadow);
    col += uHi * sheen * uHiAmt * 0.9;

    float vig = smoothstep(1.25, 0.25, length((uv - 0.5) * vec2(uAspect * 0.8, 1.0)));
    col = mix(uDeep, col, 0.35 + 0.65 * vig);
    col += (hash(uv * 900.0 + uTime) - 0.5) * 0.018;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function Silk() {
  const mat = useRef();
  const { size } = useThree();
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uHiAmt: { value: 0.5 },
      uAspect: { value: 1 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uDeep: { value: new THREE.Color() },
      uMid: { value: new THREE.Color() },
      uHi: { value: new THREE.Color() },
    }),
    []
  );

  useFrame((state, dt) => {
    const u = uniforms;
    u.uTime.value += reducedMotion ? 0 : dt;
    u.uAspect.value = size.width / size.height;
    u.uScroll.value += (scrollState.progress * 3 - u.uScroll.value) * 0.05;
    mouse.current.set(state.pointer.x * 0.5 + 0.5, state.pointer.y * 0.5 + 0.5);
    u.uMouse.value.lerp(mouse.current, 0.04);
    u.uDeep.value.setRGB(atmo.deep.r / 255, atmo.deep.g / 255, atmo.deep.b / 255);
    u.uMid.value.setRGB(atmo.mid.r / 255, atmo.mid.g / 255, atmo.mid.b / 255);
    u.uHi.value.setRGB(atmo.hi.r / 255, atmo.hi.g / 255, atmo.hi.b / 255);
    u.uHiAmt.value = atmo.hiAmt;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} vertexShader={silkVert} fragmentShader={silkFrag} uniforms={uniforms} depthWrite={false} depthTest={false} />
    </mesh>
  );
}

const fibreVert = /* glsl */ `
  attribute float aSeed;
  uniform float uTime, uVel, uPx;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float t = uTime * (0.04 + aSeed * 0.05);
    p.y = mod(p.y + t * 6.0 + uVel * aSeed * 0.6 + 10.0, 20.0) - 10.0;
    p.x += sin(t * 3.0 + aSeed * 40.0) * 0.6;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.0 + aSeed * 7.0) * uPx * (12.0 / -mv.z);
    vAlpha = (0.25 + aSeed * 0.75) * smoothstep(-28.0, -6.0, mv.z) * smoothstep(-1.0, -5.0, mv.z);
  }
`;
const fibreFrag = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform float uStretch;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    c.x *= 1.0 + uStretch;
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * a * vAlpha * 0.55);
  }
`;

// Floating lignin fibres and seed inclusions — the texture of the material itself.
function Fibres({ count = 700 }) {
  const { gl } = useThree();
  const [geo, uniforms] = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = -Math.random() * 26 - 2;
      seed[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    return [
      g,
      { uTime: { value: 0 }, uVel: { value: 0 }, uPx: { value: 1 }, uStretch: { value: 0 }, uColor: { value: new THREE.Color() } },
    ];
  }, [count]);
  const vel = useRef(0);

  useFrame((state, dt) => {
    uniforms.uTime.value += reducedMotion ? 0 : dt;
    vel.current += (scrollState.velocity * 0.04 - vel.current) * 0.08;
    uniforms.uVel.value += vel.current * dt * 4;
    uniforms.uStretch.value = Math.min(Math.abs(vel.current) * 0.3, 2.0);
    uniforms.uPx.value = gl.getPixelRatio();
    uniforms.uColor.value.setRGB(atmo.hi.r / 255, atmo.hi.g / 255, atmo.hi.b / 255);
    state.camera.position.x += (state.pointer.x * 0.6 - state.camera.position.x) * 0.03;
    state.camera.position.y += (state.pointer.y * 0.4 - state.camera.position.y) * 0.03;
  });

  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial vertexShader={fibreVert} fragmentShader={fibreFrag} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function Environment() {
  // The product room covers the whole screen; stop rendering the silk behind it.
  const [covered, setCovered] = useState(false);
  useEffect(() => {
    const on = (e) => setCovered(e.detail);
    addEventListener('elvara:room', on);
    return () => removeEventListener('elvara:room', on);
  }, []);
  return (
    <div className="environment" aria-hidden="true">
      <Canvas frameloop={covered ? 'never' : 'always'} dpr={[0.5, 0.65]} gl={{ antialias: false, powerPreference: 'high-performance', stencil: false, depth: false }} camera={{ position: [0, 0, 6], fov: 50 }}>
        <Silk />
        <Fibres />
      </Canvas>
    </div>
  );
}
