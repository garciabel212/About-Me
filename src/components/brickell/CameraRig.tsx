import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { sampleCameraPath, globalCameraDebug } from './cameraKeyframes';

export interface CameraRigProps {
  /** Mutable ref for high-frequency scroll progress (0.00 → 1.00) without React re-renders */
  progressRef?: React.MutableRefObject<number>;
  /** Fallback scalar progress prop */
  progress?: number;
  reducedMotion?: boolean;
}

// Subtle idle breathing drift amplitude & frequency (active only at start)
const DRIFT_AMPLITUDE = { x: 0.06, y: 0.04, z: 0.03 };
const DRIFT_FREQUENCY = { x: 0.10, y: 0.07, z: 0.06 };

export default function CameraRig({
  progressRef,
  progress: progressScalar = 0,
  reducedMotion = false,
}: CameraRigProps) {
  const { camera, size } = useThree();
  const currentPos = useRef(new THREE.Vector3(3.2, 4.2, 11.2));
  const currentTarget = useRef(new THREE.Vector3(4.7, 3.6, -1.0));
  const initialized = useRef(false);

  useFrame(({ clock }, delta) => {
    const isMobile = size.width < 768;
    const p = progressRef ? progressRef.current : progressScalar;
    const clampedProgress = Math.max(0, Math.min(1, p));

    // Sample the continuous Catmull-Rom spline trajectory
    const sample = sampleCameraPath(clampedProgress, isMobile);

    // Calculate subtle idle breathing drift (only active near the opening hero frame)
    let driftX = 0;
    let driftY = 0;
    let driftZ = 0;

    if (!reducedMotion && clampedProgress < 0.10) {
      // Fade out drift as user scrolls forward
      const driftFade = 1.0 - clampedProgress / 0.10;
      const t = clock.getElapsedTime();
      driftX = Math.sin(t * DRIFT_FREQUENCY.x) * DRIFT_AMPLITUDE.x * driftFade;
      driftY = Math.sin(t * DRIFT_FREQUENCY.y + 0.8) * DRIFT_AMPLITUDE.y * driftFade;
      driftZ = Math.sin(t * DRIFT_FREQUENCY.z + 1.5) * DRIFT_AMPLITUDE.z * driftFade;
    }

    const desiredX = sample.position.x + driftX;
    const desiredY = sample.position.y + driftY;
    const desiredZ = sample.position.z + driftZ;

    const desiredTargetX = sample.target.x;
    const desiredTargetY = sample.target.y;
    const desiredTargetZ = sample.target.z;

    // First frame initialization: snap directly to position
    if (!initialized.current) {
      camera.position.set(desiredX, desiredY, desiredZ);
      currentPos.current.set(desiredX, desiredY, desiredZ);
      currentTarget.current.set(desiredTargetX, desiredTargetY, desiredTargetZ);
      camera.lookAt(currentTarget.current);
      if ('fov' in camera) {
        (camera as THREE.PerspectiveCamera).fov = sample.fov;
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      }
      initialized.current = true;
      return;
    }

    // Reduced motion: preserve static opening frame, no scroll trajectory
    if (reducedMotion) {
      const staticSample = sampleCameraPath(0.0, isMobile);
      camera.position.copy(staticSample.position);
      camera.lookAt(staticSample.target);
      if ('fov' in camera) {
        (camera as THREE.PerspectiveCamera).fov = staticSample.fov;
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      }
      return;
    }

    // Smooth dampening to eliminate any micro-stutter
    const dampFactor = Math.min(1.0, delta * 14.0);

    currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, desiredX, dampFactor);
    currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, desiredY, dampFactor);
    currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, desiredZ, dampFactor);
    camera.position.copy(currentPos.current);

    currentTarget.current.x = THREE.MathUtils.lerp(currentTarget.current.x, desiredTargetX, dampFactor);
    currentTarget.current.y = THREE.MathUtils.lerp(currentTarget.current.y, desiredTargetY, dampFactor);
    currentTarget.current.z = THREE.MathUtils.lerp(currentTarget.current.z, desiredTargetZ, dampFactor);
    camera.lookAt(currentTarget.current);

    // Update FOV smoothly
    if ('fov' in camera) {
      const persp = camera as THREE.PerspectiveCamera;
      if (Math.abs(persp.fov - sample.fov) > 0.02) {
        persp.fov = THREE.MathUtils.lerp(persp.fov, sample.fov, dampFactor);
        persp.updateProjectionMatrix();
      }
    }

    // Update global debug state for DEV HUD
    if (import.meta.env.DEV) {
      globalCameraDebug.progress = clampedProgress;
      globalCameraDebug.shotId = sample.shotId;
      globalCameraDebug.shotName = sample.shotName;
      globalCameraDebug.posX = currentPos.current.x;
      globalCameraDebug.posY = currentPos.current.y;
      globalCameraDebug.posZ = currentPos.current.z;
      globalCameraDebug.targetX = currentTarget.current.x;
      globalCameraDebug.targetY = currentTarget.current.y;
      globalCameraDebug.targetZ = currentTarget.current.z;
      globalCameraDebug.fov = 'fov' in camera ? (camera as THREE.PerspectiveCamera).fov : sample.fov;
    }
  });

  return null;
}
