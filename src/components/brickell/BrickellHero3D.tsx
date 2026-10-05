/**
 * BrickellHero3D — mounts the R3F Canvas with all safety wrappers.
 *
 * Responsibilities:
 *   - Canvas sizing / DPR
 *   - WebGL error boundary
 *   - Graceful fallback when WebGL is unavailable
 *   - Loading fade-in
 *   - Responsive canvas sizing
 *   - Resize handling (R3F handles this natively)
 *
 * This component is lazy-loaded from Hero.tsx so Three.js
 * does NOT block the initial HTML render or LCP score.
 *
 * Usage in Hero.tsx (right column):
 *   const BrickellHero3D = lazy(() => import('@/components/brickell/BrickellHero3D'))
 *
 * Milestone 2 integration point:
 *   Accept a `scrollProgress` prop here and thread it to BrickellScene → CameraRig.
 */
import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '@/components/theme/ThemeProvider';
import BrickellScene from './BrickellScene';
import { globalCameraDebug } from './cameraKeyframes';

// ── Inline fallback for WebGL failure ─────────────────────────────────────
function WebGLFallback() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-3 text-center px-6">
        <div className="w-12 h-12 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] flex items-center justify-center">
          <div className="w-4 h-4 rounded border border-[var(--accent)] rotate-45" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Brickell · Miami
        </span>
      </div>
    </div>
  );
}

// ── Loading shimmer ────────────────────────────────────────────────────────
function CanvasLoader() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-6" aria-hidden="true">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)] animate-pulse">
        Loading scene&hellip;
      </span>
    </div>
  );
}

// ── DEV-ONLY Diagnostic HUD ───────────────────────────────────────────────
function BrickellDevHUD() {
  const [hudState, setHudState] = useState({ ...globalCameraDebug });

  useEffect(() => {
    const timer = setInterval(() => {
      setHudState({ ...globalCameraDebug });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="fixed bottom-3 left-3 z-50 pointer-events-none font-mono text-[10px] tracking-wider text-emerald-400 bg-neutral-950/85 px-3 py-2 rounded-lg border border-emerald-500/30 shadow-xl backdrop-blur-md flex flex-wrap items-center gap-3"
      role="status"
      aria-label="3D Camera Diagnostics"
    >
      <span className="flex items-center gap-1.5 font-semibold text-white">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        BRICKELL 3D
      </span>
      <span className="text-neutral-400">|</span>
      <span>P: <strong className="text-emerald-300 font-bold">{hudState.progress.toFixed(3)}</strong></span>
      <span className="text-neutral-400">|</span>
      <span className="text-amber-300 font-semibold">{hudState.shotName}</span>
      <span className="text-neutral-400">|</span>
      <span>CAM: [{hudState.posX.toFixed(1)}, {hudState.posY.toFixed(1)}, {hudState.posZ.toFixed(1)}]</span>
      <span className="text-neutral-400">|</span>
      <span>FOV: {hudState.fov.toFixed(1)}&deg;</span>
    </div>
  );
}

export interface BrickellHero3DProps {
  /** CSS class applied to the wrapper div */
  className?: string;
  /** High-frequency mutable scroll progress ref */
  progressRef?: React.MutableRefObject<number>;
  /** Forwarded to CameraRig for scalar fallback */
  scrollProgress?: number;
}

export default function BrickellHero3D({
  className = '',
  progressRef,
  scrollProgress = 0,
}: BrickellHero3DProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [webGLFailed] = useState(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      return !gl;
    } catch {
      return true;
    }
  });

  if (webGLFailed) {
    return (
      <div ref={containerRef} className={`relative w-full h-full ${className}`}>
        <WebGLFallback />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      aria-hidden="true"
      role="presentation"
    >
      {/* Loading hint — fades out once scene is ready */}
      {!canvasReady && <CanvasLoader />}

      {/* Development Diagnostic Display (stripped in production) */}
      {import.meta.env.DEV && <BrickellDevHUD />}

      {/* Fade-in wrapper */}
      <div
        className="absolute inset-0 transition-opacity duration-700 ease-out"
        style={{ opacity: canvasReady ? 1 : 0 }}
      >
        <Canvas
          onCreated={() => setCanvasReady(true)}
          camera={{ position: [3.2, 4.2, 11.2], fov: 40, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          shadows={{ type: THREE.PCFShadowMap }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            <BrickellScene
              progressRef={progressRef}
              scrollProgress={scrollProgress}
              theme={resolvedTheme}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
