import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SYSTEMS_TOWER_CONFIG } from './cityData';
import { MAT } from './materials';

const cfg = SYSTEMS_TOWER_CONFIG;

export default function SystemsTower() {
  const crownMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const beaconRef = useRef<THREE.Mesh>(null);

  // ── Shaft window strips: regular rhythmic distribution ──
  const shaftStripCount = Math.floor(cfg.shaft.height / 1.1);
  const shaftCols = 4;
  const shaftStrips: React.ReactNode[] = [];
  for (let row = 0; row < shaftStripCount; row++) {
    for (let col = 0; col < shaftCols; col++) {
      const y = -cfg.shaft.height / 2 + 0.6 + row * 1.1;
      const x = -cfg.shaft.width / 2 + (col + 0.5) * (cfg.shaft.width / shaftCols);
      // Alternate occasional warm accent windows for realistic urban life
      const isWarm = (row + col * 3) % 7 === 0;
      shaftStrips.push(
        <mesh
          key={`st-w-${row}-${col}`}
          position={[x, y, cfg.shaft.depth / 2 + 0.012]}
          material={isWarm ? MAT.WINDOW_WARM : MAT.WINDOW_COOL}
          castShadow={false}
        >
          <boxGeometry args={[0.07, 0.72, 0.02]} />
        </mesh>
      );
    }
  }

  // ── Vertical architectural louvers / pinstripe fins ──
  const finCount = 6;
  const verticalFins: React.ReactNode[] = [];
  for (let i = 0; i <= finCount; i++) {
    const x = -cfg.shaft.width / 2 + i * (cfg.shaft.width / finCount);
    verticalFins.push(
      <mesh
        key={`fin-${i}`}
        position={[x, 0, cfg.shaft.depth / 2 + 0.025]}
        material={MAT.METAL_SILVER}
        castShadow={false}
      >
        <boxGeometry args={[0.022, cfg.shaft.height * 0.98, 0.04]} />
      </mesh>
    );
  }

  // FAA beacon pulse & crown ambient breathing
  const timeRef = useRef(0);
  useFrame((_state, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    // Crown subtle breathing glow
    if (crownMatRef.current) {
      crownMatRef.current.emissiveIntensity = 0.22 + Math.sin(t * 0.8) * 0.10;
    }

    // FAA red warning beacon strobe (pulse peak every ~1.4s)
    if (beaconRef.current) {
      const beaconMat = beaconRef.current.material as THREE.MeshStandardMaterial;
      const strobePhase = (t % 1.4) / 1.4;
      // Sharp quick flash curve
      const strobe = Math.exp(-Math.pow((strobePhase - 0.1) * 12, 2));
      beaconMat.emissiveIntensity = 0.4 + strobe * 2.2;
    }
  });

  const [px, , pz] = cfg.position;
  const shaftBaseY = cfg.podium.height + cfg.setback.height + cfg.shaft.height / 2;

  return (
    <group name="systems-tower" position={[px, 0, pz]}>

      {/* ── 1. GRAND PODIUM & ATRIUM (Base) ── */}
      <group name="systems-tower__podium" position={[0, cfg.podium.height / 2, 0]}>
        {/* Main podium mass */}
        <mesh castShadow receiveShadow material={MAT.CONCRETE_LIGHT}>
          <boxGeometry args={[cfg.podium.width, cfg.podium.height, cfg.podium.depth]} />
        </mesh>

        {/* Illuminated glass grand entrance lobby */}
        <mesh position={[0, -cfg.podium.height * 0.1, cfg.podium.depth / 2 + 0.02]} material={MAT.LOBBY_GLOW}>
          <boxGeometry args={[cfg.podium.width * 0.75, cfg.podium.height * 0.65, 0.05]} />
        </mesh>

        {/* Cantilevered entrance marquee / canopy facing the river */}
        <mesh
          position={[0, -cfg.podium.height * 0.05, cfg.podium.depth / 2 + 0.35]}
          material={MAT.METAL_SILVER}
          castShadow
        >
          <boxGeometry args={[cfg.podium.width * 0.85, 0.06, 0.65]} />
        </mesh>

        {/* Perimeter structural columns at base */}
        <mesh position={[-cfg.podium.width / 2 + 0.12, 0, cfg.podium.depth / 2 - 0.05]} material={MAT.CONCRETE_DARK}>
          <boxGeometry args={[0.16, cfg.podium.height, 0.16]} />
        </mesh>
        <mesh position={[cfg.podium.width / 2 - 0.12, 0, cfg.podium.depth / 2 - 0.05]} material={MAT.CONCRETE_DARK}>
          <boxGeometry args={[0.16, cfg.podium.height, 0.16]} />
        </mesh>

        {/* Podium top parapet cap */}
        <mesh position={[0, cfg.podium.height / 2 + 0.04, 0]} material={MAT.METAL_SILVER}>
          <boxGeometry args={[cfg.podium.width + 0.08, 0.08, cfg.podium.depth + 0.08]} />
        </mesh>
      </group>

      {/* ── 2. TRANSITIONAL SETBACK TIER ── */}
      <group
        name="systems-tower__setback"
        position={[0, cfg.podium.height + cfg.setback.height / 2, 0]}
      >
        <mesh castShadow receiveShadow material={MAT.GLASS_DARK}>
          <boxGeometry args={[cfg.setback.width, cfg.setback.height, cfg.setback.depth]} />
        </mesh>

        {/* Setback terrace reveal trim */}
        <mesh position={[0, cfg.setback.height / 2 + 0.05, 0]} material={MAT.BALCONY_EDGE}>
          <boxGeometry args={[cfg.setback.width + 0.06, 0.10, cfg.setback.depth + 0.06]} />
        </mesh>
      </group>

      {/* ── 3. MAIN TOWER SHAFT ── */}
      <group name="systems-tower__shaft" position={[0, shaftBaseY, 0]}>
        {/* Core reflective curtain wall */}
        <mesh castShadow receiveShadow material={MAT.GLASS_DARK}>
          <boxGeometry args={[cfg.shaft.width, cfg.shaft.height, cfg.shaft.depth]} />
        </mesh>

        {/* Vertical architectural louvers */}
        {verticalFins}

        {/* Matrix of illuminated window modules */}
        {shaftStrips}

        {/* Cantilevered "Systems Loggia" — observation bay at 60% height */}
        <group position={[0.22, cfg.shaft.height * 0.12, cfg.shaft.depth / 2 + 0.14]}>
          <mesh castShadow receiveShadow material={MAT.GLASS_LIGHT}>
            <boxGeometry args={[cfg.shaft.width * 0.55, 1.4, 0.32]} />
          </mesh>
          <mesh position={[0, -0.7, 0]} material={MAT.METAL_SILVER}>
            <boxGeometry args={[cfg.shaft.width * 0.57, 0.08, 0.34]} />
          </mesh>
          <mesh position={[0, 0.7, 0]} material={MAT.METAL_SILVER}>
            <boxGeometry args={[cfg.shaft.width * 0.57, 0.08, 0.34]} />
          </mesh>
        </group>

        {/* Western wing massing (sculptural asymmetry) */}
        <mesh
          position={[-cfg.shaft.width / 2 - 0.12, -cfg.shaft.height * 0.10, 0]}
          castShadow
          receiveShadow
          material={MAT.GLASS_MID}
        >
          <boxGeometry args={[0.22, cfg.shaft.height * 0.72, cfg.shaft.depth * 0.75]} />
        </mesh>

        {/* Upper shaft collar band */}
        <mesh position={[0, cfg.shaft.height / 2 + 0.06, 0]} material={MAT.METAL_SILVER}>
          <boxGeometry args={[cfg.shaft.width + 0.08, 0.14, cfg.shaft.depth + 0.08]} />
        </mesh>
      </group>

      {/* ── 4. SCULPTED CROWN & FAA SPIRE ── */}
      <group
        name="systems-tower__crown"
        position={[0, shaftBaseY + cfg.shaft.height / 2 + cfg.crown.height / 2, 0]}
      >
        {/* Sculpted glass crown: catches warm sunset specular and cool azure sky */}
        <mesh
          castShadow
          material={
            new THREE.MeshStandardMaterial({
              color: '#6590AD',
              roughness: 0.08,
              metalness: 0.75,
              transparent: true,
              opacity: 0.88,
              emissive: new THREE.Color('#FFBE7A'),
              emissiveIntensity: 0.16,
            })
          }
        >
          <boxGeometry args={[cfg.crown.width, cfg.crown.height, cfg.crown.depth]} />
        </mesh>

        {/* Crown horizontal mechanical louvers */}
        <mesh position={[0, 0, cfg.crown.depth / 2 + 0.02]} material={MAT.METAL_DARK}>
          <boxGeometry args={[cfg.crown.width * 0.9, cfg.crown.height * 0.7, 0.02]} />
        </mesh>

        {/* Tapered architectural spire mast */}
        <mesh
          position={[0, cfg.crown.height / 2 + cfg.spireHeight / 2, 0]}
          material={MAT.METAL_SILVER}
        >
          <cylinderGeometry args={[0.02, 0.06, cfg.spireHeight, 8]} />
        </mesh>

        {/* FAA warning obstacle beacon (pulsing red jewel at top of spire) */}
        <mesh
          ref={beaconRef}
          position={[0, cfg.crown.height / 2 + cfg.spireHeight + 0.05, 0]}
          material={MAT.BEACON_RED}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
        </mesh>
      </group>

    </group>
  );
}
