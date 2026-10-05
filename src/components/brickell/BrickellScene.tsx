/**
 * BrickellScene — root Three.js scene.
 *
 * Responsibilities:
 *   - Lighting setup (late-afternoon golden-hour)
 *   - Scene fog / atmosphere
 *   - Compositing all sub-scenes: City, SystemsTower, MiamiRiver, Bridge
 *   - CameraRig
 *
 * Does NOT contain the Canvas — that lives in BrickellHero3D
 * to allow Error Boundary + Suspense wrapping at a higher level.
 *
 * Lighting architecture (prepared for future day→night transition):
 *   HemisphereLight  — sky/ground ambient fill
 *   DirectionalLight — main sun (golden hour angle)
 *   DirectionalLight — fill / bounce from water side
 *
 * Future: replace intensities and colors with uniforms
 * driven by a time-of-day value (0–1) wired to scroll progress.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import City from './City';
import SystemsTower from './SystemsTower';
import MiamiRiver from './MiamiRiver';
import Bridge from './Bridge';
import CameraRig from './CameraRig';

interface BrickellSceneProps {
  /** Mutable ref for high-frequency scroll progress (0.00 → 1.00) without React re-renders */
  progressRef?: React.MutableRefObject<number>;
  /** Scalar scroll progress 0–1 fallback */
  scrollProgress?: number;
  /** Active theme: 'light' | 'dark' */
  theme?: 'light' | 'dark';
}

export default function BrickellScene({
  progressRef,
  scrollProgress = 0,
  theme = 'light',
}: BrickellSceneProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const isDark = theme === 'dark';

  const sunRef = useRef<THREE.DirectionalLight>(null);
  const fogRef = useRef<THREE.Fog>(null);

  // Base theme colors calibrated to the Brickell photographic golden-hour sunset
  const baseSunColor = useRef(new THREE.Color(isDark ? '#E5A468' : '#FFAE5C'));
  const midSunColor = useRef(new THREE.Color(isDark ? '#D99860' : '#FFBA70'));
  const endSunColor = useRef(new THREE.Color(isDark ? '#7BAFD6' : '#FFDFB8'));

  // Subtle lighting and fog response across camera journey
  useFrame(() => {
    if (reducedMotion) return;
    const p = Math.max(0, Math.min(1, progressRef ? progressRef.current : scrollProgress));

    // 1. Directional sun temperature progression:
    // start (0.0): warm golden sunset -> mid (0.5): architectural gold -> end (1.0): serene evening ambient
    if (sunRef.current) {
      if (p < 0.5) {
        const factor = p / 0.5;
        sunRef.current.color.lerpColors(baseSunColor.current, midSunColor.current, factor);
        sunRef.current.intensity = isDark ? 1.5 + factor * 0.15 : 2.3 + factor * 0.1;
      } else {
        const factor = (p - 0.5) / 0.5;
        sunRef.current.color.lerpColors(midSunColor.current, endSunColor.current, factor);
        sunRef.current.intensity = isDark ? 1.65 - factor * 0.2 : 2.4 - factor * 0.3;
      }
    }

    // 2. Subtle atmospheric fog breathing:
    // Retains crisp foreground clarity while softening distant architecture into the photo horizon
    if (fogRef.current) {
      if (p > 0.55 && p < 0.80) {
        fogRef.current.near = THREE.MathUtils.lerp(fogRef.current.near, isDark ? 18 : 20, 0.05);
        fogRef.current.far = THREE.MathUtils.lerp(fogRef.current.far, isDark ? 48 : 56, 0.05);
      } else if (p >= 0.80) {
        fogRef.current.near = THREE.MathUtils.lerp(fogRef.current.near, isDark ? 15 : 17, 0.05);
        fogRef.current.far = THREE.MathUtils.lerp(fogRef.current.far, isDark ? 42 : 48, 0.05);
      } else {
        fogRef.current.near = THREE.MathUtils.lerp(fogRef.current.near, isDark ? 16 : 18, 0.05);
        fogRef.current.far = THREE.MathUtils.lerp(fogRef.current.far, isDark ? 44 : 52, 0.05);
      }
    }
  });

  const fogColor = isDark ? '#141922' : '#ECE2D4';
  const skyAmbient = isDark ? '#1E2B3E' : '#8CBEE0';
  const groundAmbient = isDark ? '#0E1722' : '#1C424E';
  const waterBounceColor = isDark ? '#D99860' : '#FFCA82';

  return (
    <>
      {/* ── CAMERA RIG ── */}
      <CameraRig
        progressRef={progressRef}
        progress={scrollProgress}
        reducedMotion={reducedMotion}
      />

      {/* ── ATMOSPHERE: Dynamic fog blends 3D geometry into photographic horizon ── */}
      <fog ref={fogRef} attach="fog" args={[fogColor, isDark ? 16 : 18, isDark ? 44 : 52]} />

      {/* ── LIGHTING SETUP: Low-angle golden sunset matching photograph ── */}
      <hemisphereLight
        args={[skyAmbient, groundAmbient, isDark ? 0.90 : 1.0]}
        name="sky-ambient"
      />

      {/* Main Directional Sun: Low on the left horizon casting warm golden rim light eastward */}
      <directionalLight
        ref={sunRef}
        name="sun"
        position={[-14, 4.5, -3.5]}
        intensity={isDark ? 1.5 : 2.3}
        color={isDark ? '#E5A468' : '#FFAE5C'}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0008}
      />

      {/* Golden River Specular Bounce & Soft Sky Fill */}
      <directionalLight
        name="water-fill"
        position={[-6, 1.2, 4]}
        intensity={isDark ? 0.60 : 0.80}
        color={waterBounceColor}
      />

      {/* ── ARCHITECTURAL SCENE CONTENTS ── */}
      <City />
      <SystemsTower />
      <MiamiRiver reducedMotion={reducedMotion} />
      <Bridge />
    </>
  );
}
