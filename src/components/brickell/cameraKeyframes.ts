/**
 * cameraKeyframes.ts — Architectural Camera Trajectory for Brickell Cinematic Scroll
 *
 * Defines the multi-shot cinematic journey through Downtown Miami / Brickell:
 *   - Shot 1: ESTABLISH    (0.00 → 0.20) Exact Milestone 1.5 opening frame + slow dolly
 *   - Shot 2: APPROACH     (0.20 → 0.40) Inward descent, feeling tower scale
 *   - Shot 3: SYSTEMS      (0.40 → 0.58) Hero 3/4 architectural composition of Systems Tower
 *   - Shot 4: RIVER        (0.58 → 0.76) Low waterfront drone sweep along Miami River & Bridge
 *   - Shot 5: PROJECT_SPACE(0.76 → 0.90) Spatial framing leaving negative space for project cards
 *   - Shot 6: OVERVIEW     (0.90 → 1.00) Elevated calm panoramic pull-back
 *
 * Uses CatmullRomCurve3 for position interpolation to guarantee C1 smooth,
 * corner-free camera movement without snapping or visible kinks.
 */
import * as THREE from 'three';

export interface CameraKeyframe {
  id: string;
  name: string;
  progress: number;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

// ─── DESKTOP CAMERA KEYFRAMES ───────────────────────────────────────────────
// Starting position [3.2, 4.2, 11.2], target [4.7, 3.6, -1.0], FOV 40°
// EXACTLY matches the approved Milestone 1.5 composition.

export const DESKTOP_KEYFRAMES: CameraKeyframe[] = [
  {
    id: 'shot-1-establish',
    name: 'ESTABLISH',
    progress: 0.00,
    position: [3.2, 4.2, 11.2],
    target: [4.7, 3.6, -1.0],
    fov: 40.0,
  },
  {
    id: 'shot-1-dolly',
    name: 'ESTABLISH_DOLLY',
    progress: 0.15,
    position: [3.28, 4.15, 10.5],
    target: [4.7, 3.62, -1.1],
    fov: 40.0,
  },
  {
    id: 'shot-2-approach',
    name: 'APPROACH',
    progress: 0.35,
    position: [3.45, 3.95, 9.2],
    target: [4.7, 3.75, -1.5],
    fov: 39.5,
  },
  {
    id: 'shot-3-systems',
    name: 'SYSTEMS_TOWER',
    progress: 0.55,
    position: [3.65, 3.70, 7.8],
    target: [4.7, 4.20, -2.4],
    fov: 38.5,
  },
  {
    id: 'shot-4-river',
    name: 'MIAMI_RIVER',
    progress: 0.75,
    position: [3.10, 3.15, 6.8],
    target: [4.5, 2.60, 0.4],
    fov: 40.5,
  },
  {
    id: 'shot-5-projects',
    name: 'PROJECT_SPACE',
    progress: 0.88,
    position: [3.35, 3.80, 8.8],
    target: [5.0, 3.30, -1.2],
    fov: 40.0,
  },
  {
    id: 'shot-6-overview',
    name: 'FINAL_OVERVIEW',
    progress: 1.00,
    position: [3.45, 4.40, 11.5],
    target: [4.7, 3.50, -1.0],
    fov: 41.0,
  },
];

// ─── MOBILE CAMERA KEYFRAMES ────────────────────────────────────────────────
// Streamlined, calm path with higher elevation and wider FOV to avoid
// rapid motion or clipping on narrow viewports.

export const MOBILE_KEYFRAMES: CameraKeyframe[] = [
  {
    id: 'shot-1-m-establish',
    name: 'ESTABLISH_M',
    progress: 0.00,
    position: [4.2, 4.9, 13.5],
    target: [4.7, 3.2, -0.5],
    fov: 48.0,
  },
  {
    id: 'shot-2-m-approach',
    name: 'APPROACH_M',
    progress: 0.35,
    position: [4.30, 4.65, 11.8],
    target: [4.7, 3.40, -1.0],
    fov: 47.0,
  },
  {
    id: 'shot-3-m-systems',
    name: 'SYSTEMS_M',
    progress: 0.65,
    position: [4.25, 4.30, 9.8],
    target: [4.7, 3.90, -1.8],
    fov: 45.0,
  },
  {
    id: 'shot-4-m-overview',
    name: 'OVERVIEW_M',
    progress: 1.00,
    position: [4.35, 5.10, 13.6],
    target: [4.7, 3.20, -0.8],
    fov: 48.0,
  },
];

// ─── SPLINE INTERPOLATION ENGINE ───────────────────────────────────────────

class CameraSplineTrack {
  private keyframes: CameraKeyframe[];
  private positionSpline: THREE.CatmullRomCurve3;
  private targetSpline: THREE.CatmullRomCurve3;

  constructor(keyframes: CameraKeyframe[]) {
    this.keyframes = keyframes;
    const positions = keyframes.map((k) => new THREE.Vector3(...k.position));
    const targets = keyframes.map((k) => new THREE.Vector3(...k.target));

    // Centripetal Catmull-Rom prevents overshoot loops around sharp turns
    this.positionSpline = new THREE.CatmullRomCurve3(positions, false, 'centripetal', 0.5);
    this.targetSpline = new THREE.CatmullRomCurve3(targets, false, 'centripetal', 0.5);
  }

  public sample(progress: number): {
    position: THREE.Vector3;
    target: THREE.Vector3;
    fov: number;
    shotId: string;
    shotName: string;
  } {
    const clamped = Math.max(0, Math.min(1, progress));

    // 1. Smooth position & target along splines
    const position = this.positionSpline.getPointAt(clamped);
    const target = this.targetSpline.getPointAt(clamped);

    // 2. Locate active keyframe bracket for FOV & shot identification
    let lowerIdx = 0;
    for (let i = 0; i < this.keyframes.length - 1; i++) {
      if (clamped >= this.keyframes[i].progress && clamped <= this.keyframes[i + 1].progress) {
        lowerIdx = i;
        break;
      }
    }
    const kA = this.keyframes[lowerIdx];
    const kB = this.keyframes[Math.min(lowerIdx + 1, this.keyframes.length - 1)];

    const span = kB.progress - kA.progress;
    const localT = span > 0.0001 ? (clamped - kA.progress) / span : 0;
    // Smoothstep interpolation for FOV
    const smoothT = localT * localT * (3 - 2 * localT);
    const fov = THREE.MathUtils.lerp(kA.fov, kB.fov, smoothT);

    const activeKeyframe = localT < 0.5 ? kA : kB;

    return {
      position,
      target,
      fov,
      shotId: activeKeyframe.id,
      shotName: activeKeyframe.name,
    };
  }
}

// Singleton instances for desktop and mobile tracks
export const desktopTrack = new CameraSplineTrack(DESKTOP_KEYFRAMES);
export const mobileTrack = new CameraSplineTrack(MOBILE_KEYFRAMES);

/**
 * Sample camera position, target, FOV, and active shot name for a given scroll progress.
 */
export function sampleCameraPath(progress: number, isMobile = false) {
  const track = isMobile ? mobileTrack : desktopTrack;
  return track.sample(progress);
}

// Development debug data holder (zero React re-renders)
export interface CameraDebugData {
  progress: number;
  shotId: string;
  shotName: string;
  posX: number;
  posY: number;
  posZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  fov: number;
}

export const globalCameraDebug: CameraDebugData = {
  progress: 0,
  shotId: 'shot-1-establish',
  shotName: 'ESTABLISH',
  posX: 3.2,
  posY: 4.2,
  posZ: 11.2,
  targetX: 4.7,
  targetY: 3.6,
  targetZ: -1.0,
  fov: 40,
};
