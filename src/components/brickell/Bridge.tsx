import * as THREE from 'three';
import { BRIDGE_CONFIG } from './cityData';
import { MAT, PALETTE } from './materials';

const railMat = new THREE.MeshStandardMaterial({
  color: PALETTE.METAL_SILVER,
  roughness: 0.35,
  metalness: 0.80,
});

export default function Bridge() {
  const [bx, by, bz] = BRIDGE_CONFIG.position;
  const { deckLength, deckWidth, deckHeight, piers, pierWidth, pierHeight, pierDepth } = BRIDGE_CONFIG;

  return (
    <group name="bridge" position={[bx, by, bz]}>

      {/* ── 1. BRIDGE DECK & ROADWAY ── */}
      <mesh
        name="bridge-deck"
        castShadow
        receiveShadow
        material={MAT.BRIDGE_DECK}
      >
        <boxGeometry args={[deckLength, deckHeight, deckWidth]} />
      </mesh>

      {/* Centerline lane divider stripe */}
      <mesh position={[0, deckHeight / 2 + 0.005, 0]} material={MAT.CONCRETE_LIGHT}>
        <boxGeometry args={[deckLength * 0.95, 0.01, 0.04]} />
      </mesh>

      {/* ── 2. CONCRETE PIERS & MARINE NAVIGATION LIGHTS ── */}
      {piers.map((pier, i) => {
        const pierX = pier.x - deckLength / 2;
        const isStarboard = i === 1; // Right side pier has green marker, left red
        return (
          <group key={`pier-group-${i}`} position={[pierX, -pierHeight / 2 - deckHeight / 2, 0]}>
            {/* Concrete pier foundation */}
            <mesh castShadow receiveShadow material={MAT.CONCRETE_DARK}>
              <boxGeometry args={[pierWidth, pierHeight, pierDepth]} />
            </mesh>

            {/* Pier cap */}
            <mesh position={[0, pierHeight / 2 - 0.04, 0]} material={MAT.CONCRETE_MID}>
              <boxGeometry args={[pierWidth + 0.06, 0.08, pierDepth + 0.06]} />
            </mesh>

            {/* Marine navigation clearance light facing the river channel */}
            <mesh
              position={[0, 0.1, pierDepth / 2 + 0.03]}
              material={isStarboard ? MAT.NAV_GREEN : MAT.NAV_RED}
            >
              <sphereGeometry args={[0.045, 8, 8]} />
            </mesh>
            <mesh
              position={[0, 0.1, -pierDepth / 2 - 0.03]}
              material={isStarboard ? MAT.NAV_GREEN : MAT.NAV_RED}
            >
              <sphereGeometry args={[0.045, 8, 8]} />
            </mesh>
          </group>
        );
      })}

      {/* ── 3. BASCULE TRUNNION HOUSING (Brickell Drawbridge machinery box) ── */}
      <mesh
        name="bridge-bascule-box"
        position={[piers[0].x - deckLength / 2, deckHeight / 2 + 0.16, deckWidth / 2 + 0.12]}
        material={MAT.METAL_DARK}
        castShadow
      >
        <boxGeometry args={[0.65, 0.32, 0.28]} />
      </mesh>

      {/* ── 4. GUARDRAILS ── */}
      {/* Front rail */}
      <mesh
        name="bridge-rail-front"
        position={[0, deckHeight / 2 + 0.12, deckWidth / 2 - 0.03]}
        material={railMat}
      >
        <boxGeometry args={[deckLength, 0.12, 0.04]} />
      </mesh>

      {/* Back rail */}
      <mesh
        name="bridge-rail-back"
        position={[0, deckHeight / 2 + 0.12, -(deckWidth / 2 - 0.03)]}
        material={railMat}
      >
        <boxGeometry args={[deckLength, 0.12, 0.04]} />
      </mesh>

      {/* Rail vertical stanchions */}
      {Array.from({ length: Math.floor(deckLength) + 1 }).map((_, i) => {
        const x = -deckLength / 2 + i * (deckLength / Math.floor(deckLength));
        return (
          <group key={`bridge-posts-${i}`}>
            <mesh position={[x, deckHeight / 2 + 0.06, deckWidth / 2 - 0.03]} material={railMat}>
              <boxGeometry args={[0.035, 0.24, 0.035]} />
            </mesh>
            <mesh position={[x, deckHeight / 2 + 0.06, -(deckWidth / 2 - 0.03)]} material={railMat}>
              <boxGeometry args={[0.035, 0.24, 0.035]} />
            </mesh>
          </group>
        );
      })}

    </group>
  );
}
