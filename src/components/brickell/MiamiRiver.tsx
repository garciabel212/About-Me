import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RIVER_CONFIG } from './cityData';
import { MAT, PALETTE } from './materials';

interface MiamiRiverProps {
  reducedMotion: boolean;
}

const SEGMENTS_X = 64;
const SEGMENTS_Z = 24;

export default function MiamiRiver({ reducedMotion }: MiamiRiverProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const { geometry, originalPositions } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      RIVER_CONFIG.dimensions[0],
      RIVER_CONFIG.dimensions[2],
      SEGMENTS_X,
      SEGMENTS_Z
    );
    geo.rotateX(-Math.PI / 2);
    const orig = (geo.attributes.position as THREE.BufferAttribute).array.slice() as Float32Array;
    return { geometry: geo, originalPositions: orig };
  }, []);

  // Dynamic feathering alpha map: smoothly fades 3D water into photographic water at far edge
  const alphaTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Linear gradient: foreground (high opacity) -> far bank / bay (0 opacity, revealing photo)
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.92)');   // Foreground (z > 0)
      grad.addColorStop(0.50, 'rgba(255, 255, 255, 0.85)'); // Mid-channel
      grad.addColorStop(0.80, 'rgba(255, 255, 255, 0.40)'); // Soft transition zone
      grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');   // Completely transparent blend into photo
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 256);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);

  const waterMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(PALETTE.WATER_DEEP),
        roughness: 0.06,
        metalness: 0.52,
        transparent: true,
        opacity: 0.88,
        alphaMap: alphaTexture,
        side: THREE.FrontSide,
      }),
    [alphaTexture]
  );

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    if (!meshRef.current) return;

    const t = clock.getElapsedTime();
    timeRef.current = t;
    const positions = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const orig = originalPositions;

    for (let i = 0; i < positions.count; i++) {
      const ox = orig[i * 3];
      const oz = orig[i * 3 + 2];

      // Multi-frequency wave formula modeling river channel surface currents
      const wave1 = Math.sin(ox * 0.45 + t * 0.7) * 0.035;
      const wave2 = Math.sin(oz * 0.8 + t * 0.5 + 1.4) * 0.022;
      const wave3 = Math.sin((ox * 0.7 - oz * 0.5) + t * 0.4) * 0.015;

      positions.setY(i, orig[i * 3 + 1] + wave1 + wave2 + wave3);
    }

    positions.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  const [rx, ry, rz] = RIVER_CONFIG.position;
  const riverWidth = RIVER_CONFIG.dimensions[0];
  const riverDepth = RIVER_CONFIG.dimensions[2];

  // Riverwalk promenade bollards along the urban waterfront
  const bollardCount = 10;
  const bollards: React.ReactNode[] = [];
  const bollardStartX = rx - 8;
  const bollardSpacing = 2.4;
  for (let i = 0; i < bollardCount; i++) {
    const bx = bollardStartX + i * bollardSpacing;
    bollards.push(
      <group key={`bollard-${i}`} position={[bx, 0.12, rz - riverDepth / 2 + 0.15]}>
        {/* Post */}
        <mesh material={MAT.METAL_DARK} castShadow={false}>
          <cylinderGeometry args={[0.025, 0.03, 0.22, 6]} />
        </mesh>
        {/* Glowing cap */}
        <mesh position={[0, 0.12, 0]} material={MAT.BOLLARD_GLOW}>
          <sphereGeometry args={[0.028, 6, 6]} />
        </mesh>
      </group>
    );
  }

  return (
    <group name="miami-river">
      {/* ── 1. ACTIVE WATER SURFACE ── */}
      <mesh
        ref={meshRef}
        position={[rx, ry, rz]}
        geometry={geometry}
        material={waterMaterial}
        receiveShadow
      />

      {/* ── 2. BRICKELL RIVERWALK PROMENADE (Urban Bank) ── */}
      {/* Promenade pedestrian deck */}
      <mesh
        name="riverwalk-deck"
        position={[rx, 0.02, rz - riverDepth / 2 - 0.4]}
        material={MAT.RIVERWALK_FLOOR}
        receiveShadow
      >
        <boxGeometry args={[riverWidth * 0.85, 0.08, 0.85]} />
      </mesh>

      {/* Concrete seawall bulkhead dropping into water */}
      <mesh
        name="riverwalk-bulkhead"
        position={[rx, -0.25, rz - riverDepth / 2]}
        material={MAT.CONCRETE_DARK}
        receiveShadow
      >
        <boxGeometry args={[riverWidth * 0.85, 0.55, 0.18]} />
      </mesh>

      {/* Seawall granite coping ledge */}
      <mesh
        name="riverwalk-coping"
        position={[rx, 0.05, rz - riverDepth / 2 + 0.02]}
        material={MAT.CONCRETE_MID}
      >
        <boxGeometry args={[riverWidth * 0.85, 0.06, 0.14]} />
      </mesh>

      {/* Riverwalk promenade illuminated bollards */}
      {bollards}

      {/* ── 3. OPPOSITE BANK (South Bay Edge) ── */}
      <mesh
        name="river-opposite-bank"
        position={[rx, -0.2, rz + riverDepth / 2 + 0.1]}
        material={MAT.CONCRETE_DARK}
        receiveShadow
      >
        <boxGeometry args={[riverWidth * 0.85, 0.5, 0.25]} />
      </mesh>
    </group>
  );
}
