import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap, reducedMotion } from '../lib/scroll';
import { useReveal } from '../lib/hooks';
import { Words } from '../lib/Split';
import { BRAND, PALETTE } from '../data/content';

/* The material itself, live: a sheet of ELVARA film that ripples like silk,
   turns under the visitor's hand, and shows its freshness strip shifting
   from purple (fresh) to green (spoiling), as the prototype does. */

const filmVert = /* glsl */ `
  uniform float uTime, uAmp;
  uniform vec3 uRipple;     // xy: point on the sheet, z: age of the touch
  varying vec2 vUv;
  varying vec3 vNormal, vView;
  varying float vLift;

  float wave(vec2 p) {
    float t = uTime;
    float w = sin(p.x * 1.6 + t * 0.9) * 0.16 + sin(p.y * 2.2 - t * 0.7) * 0.11
            + sin((p.x + p.y) * 3.1 + t * 1.3) * 0.045;
    // A curl along the right edge, like film lifting off a roll.
    w += smoothstep(0.6, 1.6, p.x) * pow(p.x - 0.6, 2.0) * 0.35;
    // Touch ripple spreading from where the cursor met the sheet.
    float d = distance(p, uRipple.xy);
    float age = uRipple.z;
    w += sin(d * 16.0 - age * 9.0) * 0.07 * exp(-d * 2.4) * exp(-age * 1.6) * step(0.0, age);
    return w * uAmp;
  }
  void main() {
    vUv = uv;
    vec3 p = position;
    float h = wave(p.xy);
    float e = 0.01;
    vec3 n = normalize(vec3(-(wave(p.xy + vec2(e, 0.0)) - h) / e, -(wave(p.xy + vec2(0.0, e)) - h) / e, 1.0));
    p.z += h;
    vLift = h;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vNormal = normalize(normalMatrix * n);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const filmFrag = /* glsl */ `
  precision highp float;
  uniform float uTime, uFresh;
  uniform vec3 uFreshCol, uSpoilCol, uGold;
  uniform sampler2D uLogo;
  varying vec2 vUv;
  varying vec3 vNormal, vView;
  varying float vLift;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  void main() {
    vec3 n = normalize(gl_FrontFacing ? vNormal : -vNormal);
    // Paper-like body: cream, with fibres and the brown agro-waste flecks of the real products.
    float fib = noise(vUv * vec2(260.0, 30.0)) * 0.5 + noise(vUv * vec2(30.0, 260.0)) * 0.5;
    vec3 base = mix(vec3(0.93, 0.89, 0.80), vec3(0.87, 0.82, 0.71), fib);
    float fleck = step(0.993, hash(floor(vUv * vec2(360.0, 270.0)))) + step(0.9975, hash(floor(vUv * vec2(120.0, 90.0)) + 7.0)) * 0.7;
    base = mix(base, vec3(0.45, 0.33, 0.21), clamp(fleck, 0.0, 1.0) * 0.7);

    // The ELVARA mark, pressed into the centre of the sheet.
    vec2 lu = (vUv - vec2(0.5, 0.52)) * vec2(1.0, 1.33) / 0.34 + 0.5;
    if (lu.x > 0.0 && lu.x < 1.0 && lu.y > 0.0 && lu.y < 1.0) {
      vec3 logo = texture2D(uLogo, lu).rgb;
      float r = length(lu - 0.5);
      base *= mix(vec3(1.0), logo, smoothstep(0.5, 0.44, r));
    }

    // Freshness strip laminated along the seal edge.
    float strip = smoothstep(0.05, 0.06, vUv.y) * smoothstep(0.115, 0.105, vUv.y) * smoothstep(0.04, 0.06, vUv.x) * smoothstep(0.96, 0.94, vUv.x);
    float sweep = smoothstep(uFresh - 0.25, uFresh + 0.25, vUv.x * 0.6 + 0.2 + noise(vUv * 8.0 + uTime * 0.2) * 0.2);
    vec3 ind = mix(uFreshCol, uSpoilCol, sweep);
    base = mix(base, ind, strip * 0.92);

    // Light: soft key from upper left, gold rim where the sheet turns away.
    vec3 L = normalize(vec3(-0.5, 0.7, 0.9));
    float diff = 0.55 + 0.45 * max(dot(n, L), 0.0);
    float spec = pow(max(dot(reflect(-L, n), vView), 0.0), 40.0);
    float fres = pow(1.0 - max(dot(n, vView), 0.0), 3.0);
    vec3 col = base * diff + vec3(1.0, 0.97, 0.9) * spec * 0.35 + uGold * fres * 0.9;
    col += uGold * smoothstep(0.08, 0.2, vLift) * 0.12;
    col += ind * strip * 0.25; // the strip glows faintly
    gl_FragColor = vec4(col, 1.0);
  }
`;

function Film({ fresh, drag }) {
  const mesh = useRef();
  const group = useRef();
  const logo = useLoader(THREE.TextureLoader, BRAND.logo);
  const { camera, size } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 1 },
      uFresh: { value: 1 },
      uRipple: { value: new THREE.Vector3(0, 0, -1) },
      uLogo: { value: logo },
      uFreshCol: { value: new THREE.Color(PALETTE.indicatorFresh) },
      uSpoilCol: { value: new THREE.Color(PALETTE.indicatorSpoilt) },
      uGold: { value: new THREE.Color('#e8d7ae') },
    }),
    [logo]
  );
  const ray = useMemo(() => new THREE.Raycaster(), []);

  useFrame((state, dt) => {
    const u = uniforms;
    u.uTime.value += reducedMotion ? 0 : dt;
    u.uFresh.value += (fresh.current - u.uFresh.value) * 0.06;
    u.uRipple.value.z += dt;
    // Turn: the visitor's drag, easing back to a gentle idle sway.
    const d = drag.current;
    d.ry += (d.ty - d.ry) * 0.08;
    d.rx += (d.tx - d.rx) * 0.08;
    if (!d.down) {
      d.ty *= 0.985;
      d.tx *= 0.985;
    }
    const idle = reducedMotion ? 0 : state.clock.elapsedTime;
    group.current.rotation.y = d.ry + Math.sin(idle * 0.35) * 0.28 - 0.25;
    group.current.rotation.x = d.rx + Math.sin(idle * 0.27) * 0.08 - 0.32;
    group.current.position.y = Math.sin(idle * 0.6) * 0.05;
    // Where the cursor meets the sheet, start a ripple.
    if (d.hover && !d.down) {
      ray.setFromCamera(state.pointer, camera);
      const hit = ray.intersectObject(mesh.current)[0];
      if (hit && u.uRipple.value.z > 0.5) {
        const local = mesh.current.worldToLocal(hit.point.clone());
        u.uRipple.value.set(local.x, local.y, 0);
      }
    }
  });

  const aspect = size.width / size.height;
  return (
    <group ref={group} scale={aspect < 0.9 ? 0.78 : 1}>
      <mesh ref={mesh}>
        <planeGeometry args={[3.2, 2.4, 180, 140]} />
        <shaderMaterial vertexShader={filmVert} fragmentShader={filmFrag} uniforms={uniforms} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Golden fibres drifting around the sheet.
function Motes({ count = 260 }) {
  const ref = useRef();
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.8 + Math.random() * 1.8;
      p.set([Math.cos(a) * r, (Math.random() - 0.5) * 3, Math.sin(a) * r - 0.5], i * 3);
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, [count]);
  useFrame((_, dt) => {
    if (!reducedMotion) ref.current.rotation.y += dt * 0.06;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.035} color="#e8d7ae" transparent opacity={0.75} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  );
}

const STATES = [
  { at: 1, k: 'Fresh', d: 'Deep purple: the food inside is fresh.', ph: 'Low pH' },
  { at: 0.5, k: 'Turning', d: 'The strip begins to shift as spoilage volatiles build.', ph: 'pH rising' },
  { at: 0, k: 'Spoiling', d: 'Green: amines have raised the pH — time to discard.', ph: 'High pH' },
];

export default function LivingFilm({ ready }) {
  const root = useReveal(ready);
  const stage = useRef();
  const fresh = useRef(1);
  const drag = useRef({ down: false, hover: false, x: 0, y: 0, tx: 0, ty: 0, rx: 0, ry: 0 });
  const [value, setValue] = useState(100);
  const [inView, setInView] = useState(false);
  const touched = useRef(false);

  // Render only while the stage is on screen.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '120px' });
    io.observe(stage.current);
    return () => io.disconnect();
  }, []);

  // Until the visitor takes over, the strip demonstrates itself: fresh → spoiling → fresh.
  useEffect(() => {
    if (!inView || reducedMotion) return;
    const o = { v: value };
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2, delay: 0.8 });
    tl.to(o, { v: 0, duration: 3.2, ease: 'sine.inOut', onUpdate: () => !touched.current && set(o.v) })
      .to(o, { v: 100, duration: 3.2, ease: 'sine.inOut', delay: 1.2, onUpdate: () => !touched.current && set(o.v) });
    return () => tl.kill();
  }, [inView]);

  const set = (v) => {
    fresh.current = v / 100;
    setValue(Math.round(v));
  };
  const state = STATES.reduce((best, s) => (Math.abs(s.at * 100 - value) < Math.abs(best.at * 100 - value) ? s : best), STATES[0]);
  const mix = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t));
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const swatch = `rgb(${mix(hex(PALETTE.indicatorSpoilt), hex(PALETTE.indicatorFresh), value / 100).join(',')})`;

  const pointer = {
    onPointerDown: (e) => {
      const d = drag.current;
      d.down = true;
      d.x = e.clientX;
      d.y = e.clientY;
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e) => {
      const d = drag.current;
      if (!d.down) return;
      d.ty += (e.clientX - d.x) * 0.008;
      d.tx += (e.clientY - d.y) * 0.006;
      d.tx = Math.max(-0.9, Math.min(0.9, d.tx));
      d.x = e.clientX;
      d.y = e.clientY;
    },
    onPointerUp: () => (drag.current.down = false),
    onPointerEnter: () => (drag.current.hover = true),
    onPointerLeave: () => {
      drag.current.hover = false;
      drag.current.down = false;
    },
  };

  return (
    <section className="living wrap" ref={root} data-atmo="emerald">
      <div className="living__copy">
        <p className="eyebrow">Hold the material</p>
        <h2 className="display-lg"><Words text="A living film," /> <em><Words text="in your hands." /></em></h2>
        <p className="lede" data-r>
          Three layers of agricultural waste, made into a film as strong as plastic. Drag it to turn it, and touch it to watch it ripple.
          Slide the freshness strip to see what your customers will see.
        </p>
        <div className="living__control" data-r>
          <div className="living__read">
            <span className="living__swatch" style={{ background: swatch, boxShadow: `0 0 24px ${swatch}` }} />
            <div>
              <b>{state.k}</b>
              <span>{state.d}</span>
            </div>
            <span className="living__ph tnum">{state.ph}</span>
          </div>
          <label className="living__slider">
            <span className="sr-only">Freshness</span>
            <input
              type="range" min="0" max="100" value={value}
              onChange={(e) => {
                touched.current = true;
                set(+e.target.value);
              }}
              style={{ '--v': `${value}%` }}
              aria-valuetext={state.k}
            />
          </label>
          <div className="living__scale"><span>Spoiling</span><span>Turning</span><span>Fresh</span></div>
        </div>
        <p className="living__hint" data-r><i aria-hidden="true" />Drag to turn · move over it to ripple</p>
      </div>
      <div className="living__stage" ref={stage} data-cursor="Drag" {...pointer}>
        <span className="living__halo" aria-hidden="true" />
        <Canvas
          frameloop={inView ? 'always' : 'never'}
          dpr={[1, 1.6]}
          camera={{ position: [0, 0, 5.2], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          aria-label="Interactive 3D view of the ELVARA film"
        >
          <Suspense fallback={null}><Film fresh={fresh} drag={drag} /></Suspense>
          <Motes />
        </Canvas>
      </div>
    </section>
  );
}
