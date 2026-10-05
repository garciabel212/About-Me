/**
 * Brickell Material System
 *
 * Centralized, shared material definitions for the Brickell 3D scene.
 * Keeping materials as module-level singletons avoids recreating them
 * every render and minimizes WebGL state changes.
 *
 * Architecture note: These are lazily instantiated on first import.
 * Later milestones can swap individual entries for PBR materials or
 * materials driven by time-of-day uniforms.
 */
import * as THREE from 'three';

// ─── COLOR PALETTE ─────────────────────────────────────────────────────────
// Drawn from Brickell's architectural palette:
// warm concrete, blue-gray glass, silver brushed metal, aqua water, evening glow

export const PALETTE = {
  GLASS_DARK:        '#2A4255',   // deep slate-cyan reflective glass matching photo high-rises
  GLASS_MID:         '#476B85',   // mid-tone coastal glass
  GLASS_LIGHT:       '#769FB8',   // light reflective glass catching sky azure
  GLASS_WARM:        '#687D8C',   // warm-toned glass catching sunset rim
  CONCRETE_LIGHT:    '#DCD5CA',   // warm sunlit architectural limestone/concrete
  CONCRETE_MID:      '#A8A096',   // mid concrete frame
  CONCRETE_DARK:     '#4A4642',   // darker concrete seawall / foundation
  METAL_SILVER:      '#BAC3CD',   // brushed aluminum mullions & balconies
  METAL_DARK:        '#464B56',   // structural steel louvers
  WINDOW_WARM:       '#F5BF6A',   // warm golden lit windows
  WINDOW_COOL:       '#8EC7EB',   // cool sky-reflecting window accents
  WATER_DEEP:        '#124857',   // rich coastal teal water matching photographic Miami River
  WATER_SURFACE:     '#1A6275',   // turquoise surface shimmer
  WATER_GOLD:        '#E8B368',   // golden sunset specular reflection track
  BRIDGE_CONCRETE:   '#A4ACB6',   // bridge deck concrete
  SKY_AZURE:         '#7EAED2',   // sky azure from upper photographic frame
  SUN_WARMTH:        '#FFAE5C',   // warm sunset golden-amber direct sunlight
  BEACON_RED:        '#FF3344',   // FAA tower obstacle beacon
  LOBBY_GLOW:        '#FFDF94',   // double-height lobby warm atrium glow
  BALCONY_EDGE:      '#EDE8E0',   // crisp white/ivory cantilevered balcony fascia
  NAV_GREEN:         '#22C55E',   // maritime channel navigation green
  NAV_RED:           '#EF4444',   // maritime channel navigation red
  RIVERWALK_FLOOR:   '#C2B8AA',   // riverside promenade pavers
  BOLLARD_GLOW:      '#FFD278',   // riverwalk walkway illumination
} as const;

// ─── SHARED MATERIAL INSTANCES ─────────────────────────────────────────────
// Create once, reuse across meshes to maintain single-draw-batch efficiency.

function mat(
  color: string,
  opts: Partial<{
    roughness: number;
    metalness: number;
    transparent: boolean;
    opacity: number;
    emissive: string;
    emissiveIntensity: number;
  }> = {}
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, ...opts });
}

export const MAT = {
  GLASS_DARK:  mat(PALETTE.GLASS_DARK,  { roughness: 0.08, metalness: 0.72, transparent: true, opacity: 0.88 }),
  GLASS_MID:   mat(PALETTE.GLASS_MID,   { roughness: 0.10, metalness: 0.68, transparent: true, opacity: 0.84 }),
  GLASS_LIGHT: mat(PALETTE.GLASS_LIGHT, { roughness: 0.12, metalness: 0.64, transparent: true, opacity: 0.80 }),
  GLASS_WARM:  mat(PALETTE.GLASS_WARM,  { roughness: 0.10, metalness: 0.70, transparent: true, opacity: 0.85 }),

  CONCRETE_LIGHT: mat(PALETTE.CONCRETE_LIGHT, { roughness: 0.84, metalness: 0.02 }),
  CONCRETE_MID:   mat(PALETTE.CONCRETE_MID,   { roughness: 0.86, metalness: 0.02 }),
  CONCRETE_DARK:  mat(PALETTE.CONCRETE_DARK,  { roughness: 0.90, metalness: 0.01 }),

  METAL_SILVER: mat(PALETTE.METAL_SILVER, { roughness: 0.22, metalness: 0.85 }),
  METAL_DARK:   mat(PALETTE.METAL_DARK,   { roughness: 0.30, metalness: 0.80 }),

  WINDOW_WARM: mat(PALETTE.WINDOW_WARM, {
    roughness: 0.35, metalness: 0.0,
    emissive: PALETTE.WINDOW_WARM, emissiveIntensity: 0.45,
  }),
  WINDOW_COOL: mat(PALETTE.WINDOW_COOL, {
    roughness: 0.35, metalness: 0.0,
    emissive: PALETTE.WINDOW_COOL, emissiveIntensity: 0.30,
  }),

  WATER: mat(PALETTE.WATER_DEEP, {
    roughness: 0.06, metalness: 0.55, transparent: true, opacity: 0.88,
  }),

  BRIDGE_DECK: mat(PALETTE.BRIDGE_CONCRETE, { roughness: 0.78, metalness: 0.05 }),
  BRIDGE_RAIL: mat(PALETTE.METAL_SILVER,  { roughness: 0.32, metalness: 0.78 }),

  // Architectural accents
  BEACON_RED: mat(PALETTE.BEACON_RED, {
    roughness: 0.2, metalness: 0.1,
    emissive: PALETTE.BEACON_RED, emissiveIntensity: 1.2,
  }),
  LOBBY_GLOW: mat(PALETTE.LOBBY_GLOW, {
    roughness: 0.4, metalness: 0.0,
    emissive: PALETTE.LOBBY_GLOW, emissiveIntensity: 0.80,
    transparent: true, opacity: 0.90,
  }),
  BALCONY_EDGE: mat(PALETTE.BALCONY_EDGE, { roughness: 0.68, metalness: 0.05 }),
  NAV_GREEN: mat(PALETTE.NAV_GREEN, {
    roughness: 0.2, emissive: PALETTE.NAV_GREEN, emissiveIntensity: 0.95,
  }),
  NAV_RED: mat(PALETTE.NAV_RED, {
    roughness: 0.2, emissive: PALETTE.NAV_RED, emissiveIntensity: 0.95,
  }),
  RIVERWALK_FLOOR: mat(PALETTE.RIVERWALK_FLOOR, { roughness: 0.88, metalness: 0.02 }),
  BOLLARD_GLOW: mat(PALETTE.BOLLARD_GLOW, {
    roughness: 0.3, emissive: PALETTE.BOLLARD_GLOW, emissiveIntensity: 0.85,
  }),
} as const;

/** Dispose all shared materials (call on unmount if needed) */
export function disposeMaterials(): void {
  Object.values(MAT).forEach((m) => m.dispose());
}
