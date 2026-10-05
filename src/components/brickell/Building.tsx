/**
 * Building — renders a single procedural skyscraper from config.
 *
 * Each variant uses a different geometric profile but the same
 * shared material system to minimize draw calls.
 *
 * Future: swap `geometry + material` for `<primitive object={glb.scene} />`
 * with zero changes to cityData.ts or City.tsx.
 */
import { useRef } from 'react';
import * as THREE from 'three';
import type { BuildingConfig } from './cityData';
import { MAT } from './materials';

interface BuildingProps {
  config: BuildingConfig;
  /** 0–1 normalized idle time for subtle breathing motion */
  time?: React.MutableRefObject<number>;
}

// Vertical window-strip geometry reused across buildings
const STRIP_GEO = new THREE.BoxGeometry(0.06, 1, 0.04);

function WindowStrips({
  height,
  width,
  depth,
  matKey,
}: {
  height: number;
  width: number;
  depth: number;
  matKey: 'WINDOW_WARM' | 'WINDOW_COOL';
}) {
  const stripMat = MAT[matKey];
  const stripCount = Math.floor(height / 1.2);
  const cols = Math.max(1, Math.round(width * 3));

  const strips: React.ReactNode[] = [];
  for (let row = 0; row < stripCount; row++) {
    for (let col = 0; col < cols; col++) {
      const y = -height / 2 + 0.6 + row * 1.2;
      const x = -width / 2 + (col + 0.5) * (width / cols);
      // Only front + back face strips for performance
      strips.push(
        <mesh
          key={`f-${row}-${col}`}
          position={[x, y, depth / 2 + 0.01]}
          geometry={STRIP_GEO}
          material={stripMat}
          scale={[1, Math.min(0.9, height / stripCount / 1.2), 1]}
          castShadow={false}
          receiveShadow={false}
        />
      );
    }
  }
  return <>{strips}</>;
}

export default function Building({ config }: BuildingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [w, h, d] = config.dimensions;
  const [px, , pz] = config.position;
  const py = h / 2;

  const facadeMat = MAT[config.material];
  const rotation = config.rotation ?? 0;

  // Stepped variant parameters
  const stepH = h * 0.32;
  const stepW = w * 0.72;
  const stepD = d * 0.72;

  // Tapered variant parameters
  const taperH = h * 0.38;
  const taperW = w * 0.68;
  const taperD = d * 0.68;

  // Residential wrap-around balcony slabs (every ~1.1 units)
  const balconyCount = Math.floor(h / 1.1);
  const balconySlabs: React.ReactNode[] = [];
  if (config.variant === 'residential') {
    for (let i = 1; i < balconyCount; i++) {
      const y = -h / 2 + i * 1.1;
      balconySlabs.push(
        <mesh
          key={`balcony-${i}`}
          position={[0, y, 0]}
          material={MAT.BALCONY_EDGE}
          castShadow={false}
          receiveShadow
        >
          <boxGeometry args={[w + 0.12, 0.05, d + 0.12]} />
        </mesh>
      );
    }
  }

  // Twin towers parameters
  const twinTowerWidth = (w - 0.15) / 2;
  const podiumH = 0.8;

  return (
    <group
      ref={groupRef}
      position={[px, py, pz]}
      rotation={[0, rotation, 0]}
    >
      {/* ── 1. TWIN TOWERS (e.g. Icon Brickell style) ── */}
      {config.variant === 'twin' ? (
        <group>
          {/* Shared podium */}
          <mesh
            position={[0, -h / 2 + podiumH / 2, 0]}
            castShadow
            receiveShadow
            material={MAT.CONCRETE_LIGHT}
          >
            <boxGeometry args={[w, podiumH, d]} />
          </mesh>
          {/* Tower 1 (West) */}
          <mesh
            position={[-twinTowerWidth / 2 - 0.075, podiumH / 2, 0]}
            castShadow
            receiveShadow
            material={facadeMat}
          >
            <boxGeometry args={[twinTowerWidth, h - podiumH, d * 0.9]} />
          </mesh>
          {/* Tower 2 (East) */}
          <mesh
            position={[twinTowerWidth / 2 + 0.075, podiumH / 2, 0]}
            castShadow
            receiveShadow
            material={facadeMat}
          >
            <boxGeometry args={[twinTowerWidth, h - podiumH, d * 0.9]} />
          </mesh>
          {/* Rooftop mechanical penthouse on each */}
          <mesh
            position={[-twinTowerWidth / 2 - 0.075, h / 2 + 0.1, 0]}
            material={MAT.METAL_DARK}
          >
            <boxGeometry args={[twinTowerWidth * 0.7, 0.2, d * 0.6]} />
          </mesh>
          <mesh
            position={[twinTowerWidth / 2 + 0.075, h / 2 + 0.1, 0]}
            material={MAT.METAL_DARK}
          >
            <boxGeometry args={[twinTowerWidth * 0.7, 0.2, d * 0.6]} />
          </mesh>
        </group>
      ) : config.variant === 'curved' ? (
        /* ── 2. CURVED AERODYNAMIC TOWER (e.g. Brickell Flatiron) ── */
        <group>
          <mesh castShadow receiveShadow material={facadeMat}>
            <cylinderGeometry args={[w / 2, w / 2, h, 24]} />
          </mesh>
          {/* Curved crown ring */}
          <mesh position={[0, h / 2 + 0.08, 0]} material={MAT.METAL_SILVER}>
            <cylinderGeometry args={[w / 2 + 0.04, w / 2 + 0.04, 0.16, 24]} />
          </mesh>
        </group>
      ) : config.variant === 'needle' ? (
        /* ── 3. NEEDLE / PINNACLE TOWER ── */
        <group>
          {/* Slender glass shaft */}
          <mesh castShadow receiveShadow material={facadeMat}>
            <boxGeometry args={[w, h, d]} />
          </mesh>
          {/* Tapered crown */}
          <mesh
            position={[0, h / 2 + 0.4, 0]}
            castShadow
            material={MAT.GLASS_LIGHT}
          >
            <boxGeometry args={[w * 0.6, 0.8, d * 0.6]} />
          </mesh>
          {/* Thin architectural spire */}
          <mesh position={[0, h / 2 + 1.2, 0]} material={MAT.METAL_SILVER}>
            <cylinderGeometry args={[0.015, 0.03, 1.2, 6]} />
          </mesh>
        </group>
      ) : config.variant === 'stepped' ? (
        /* ── 4. STEPPED TOWER ── */
        <group>
          <mesh castShadow receiveShadow material={facadeMat}>
            <boxGeometry args={[w, h - stepH, d]} />
          </mesh>
          <mesh
            position={[0, (h - stepH) / 2 + stepH / 2, 0]}
            castShadow
            receiveShadow
            material={facadeMat}
          >
            <boxGeometry args={[stepW, stepH, stepD]} />
          </mesh>
          {/* Terrace ledge band */}
          <mesh
            position={[0, (h - stepH) / 2 + 0.04, 0]}
            material={MAT.METAL_SILVER}
          >
            <boxGeometry args={[w + 0.06, 0.08, d + 0.06]} />
          </mesh>
        </group>
      ) : config.variant === 'tapered' ? (
        /* ── 5. TAPERED TOWER ── */
        <group>
          <mesh castShadow receiveShadow material={facadeMat}>
            <boxGeometry args={[w, h - taperH, d]} />
          </mesh>
          <mesh
            position={[0, (h - taperH) / 2 + taperH / 2, 0]}
            castShadow
            receiveShadow
            material={facadeMat}
          >
            <boxGeometry args={[taperW, taperH, taperD]} />
          </mesh>
        </group>
      ) : (
        /* ── 6. DEFAULT SLAB / WIDE / RESIDENTIAL CORE ── */
        <group>
          <mesh castShadow receiveShadow material={facadeMat}>
            <boxGeometry args={[w, h, d]} />
          </mesh>
          {balconySlabs}
        </group>
      )}

      {/* ── WINDOW STRIPS ── */}
      {config.hasWindowStrips && config.windowMaterial && config.variant !== 'curved' && (
        <WindowStrips
          height={h}
          width={w}
          depth={d}
          matKey={config.windowMaterial}
        />
      )}

      {/* ── ROOFTOP PARAPET (for non-needle and non-curved variants) ── */}
      {config.variant !== 'needle' && config.variant !== 'curved' && config.variant !== 'twin' && (
        <mesh
          position={[0, h / 2 + 0.05, 0]}
          material={MAT.METAL_DARK}
          castShadow={false}
        >
          <boxGeometry args={[w + 0.06, 0.1, d + 0.06]} />
        </mesh>
      )}
    </group>
  );
}
