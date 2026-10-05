/**
 * City data — configuration-driven building placement.
 *
 * Each entry drives a Building or SystemsTower component.
 * Changing position/dimensions/material here updates the composition
 * without touching render logic.
 *
 * Coordinate system (Three.js):
 *   +X = right   +Y = up   +Z = toward camera
 *
 * Composition goal:
 *   - Skyline mass right-of-center (camera left = hero text space)
 *   - Systems Tower prominent center-right
 *   - River runs left-to-right in the foreground / mid-ground
 *   - Buildings recede toward +Z-negative (depth)
 */

export type BuildingMaterial =
  | 'GLASS_DARK'
  | 'GLASS_MID'
  | 'GLASS_LIGHT'
  | 'GLASS_WARM'
  | 'CONCRETE_LIGHT'
  | 'CONCRETE_MID'
  | 'METAL_SILVER';

export interface BuildingConfig {
  id: string;
  position: [number, number, number];   // [x, y, z] — y is 0 (base on ground)
  dimensions: [number, number, number]; // [width, height, depth]
  rotation?: number;                     // Y-axis rotation in radians
  material: BuildingMaterial;
  variant: 'glass-slab' | 'stepped' | 'twin' | 'tapered' | 'residential' | 'curved' | 'needle' | 'wide';
  hasWindowStrips?: boolean;
  windowMaterial?: 'WINDOW_WARM' | 'WINDOW_COOL';
  receivesShadow?: boolean;
}

// ─── HYBRID FOREGROUND ARCHITECTURE (4 anchor structures) ────────────────────
// Selected foreground & midground forms that produce authentic 3D parallax
// without competing with or duplicating the photographic skyline in the background.
// Distant procedural boxes have been removed to let the real Brickell photograph shine.

export const SKYLINE_BUILDINGS: BuildingConfig[] = [
  // ── ANCHOR FOREGROUND CLUSTER (framing the Systems Tower) ──
  {
    id: 'tower-curved-front',
    position: [2.1, 0, -1.8],
    dimensions: [0.85, 5.8, 0.85],
    rotation: 0.15,
    material: 'GLASS_LIGHT',
    variant: 'curved', // Brickell Flatiron aerodynamic curved facade
    hasWindowStrips: true,
    windowMaterial: 'WINDOW_WARM',
  },
  {
    id: 'tower-res-a',
    position: [3.3, 0, -2.5],
    dimensions: [0.8, 6.4, 0.8],
    material: 'GLASS_WARM',
    variant: 'residential', // Wrap-around luxury balconies
    hasWindowStrips: true,
    windowMaterial: 'WINDOW_WARM',
  },

  // ── MIDGROUND CLUSTER (stepping upward to the right) ──
  {
    id: 'tower-stepped-b',
    position: [5.6, 0, -4.2],
    dimensions: [1.0, 9.2, 0.95],
    material: 'GLASS_MID',
    variant: 'stepped',
    hasWindowStrips: true,
    windowMaterial: 'WINDOW_COOL',
  },
  {
    id: 'tower-twin-b',
    position: [6.6, 0, -3.6],
    dimensions: [1.6, 7.8, 0.8],
    material: 'GLASS_DARK',
    variant: 'twin', // Icon Brickell style twin towers
    hasWindowStrips: true,
    windowMaterial: 'WINDOW_COOL',
  },
];

// ─── SYSTEMS TOWER (Hero Building) ──────────────────────────────────────────
// Architecturally prominent:
// - Height 13.8 units (tallest structure in the composition)
// - Tripartite massing: Grand podium atrium + setback shaft + illuminated crown
// - Positioned at [4.7, 0, -3.0], perfectly visible in the golden aperture between
//   hero typography (left) and portrait card (right).

export interface SystemsTowerConfig {
  position: [number, number, number];
  shaft: { width: number; height: number; depth: number };
  crown: { width: number; height: number; depth: number };
  setback: { width: number; height: number; depth: number };
  podium: { width: number; height: number; depth: number };
  spireHeight: number;
}

export const SYSTEMS_TOWER_CONFIG: SystemsTowerConfig = {
  position: [4.7, 0, -3.0],
  podium:  { width: 1.8, height: 1.1, depth: 1.6 },
  setback: { width: 1.3, height: 2.8, depth: 1.2 },
  shaft:   { width: 1.15, height: 8.8, depth: 1.05 },
  crown:   { width: 0.95, height: 1.5, depth: 0.85 },
  spireHeight: 1.2,
};

// ─── WATER & RIVERWALK PLANE ────────────────────────────────────────────────

export const RIVER_CONFIG = {
  position:   [4.0, -0.06, 2.4] as [number, number, number],
  dimensions: [36, 0.1, 7.5] as [number, number, number],
  riverwalkZ: 0.85, // Front edge of city embankment
};

// ─── BRICKELL AVENUE BRIDGE ─────────────────────────────────────────────────

export const BRIDGE_CONFIG = {
  position:   [2.4, 0.16, 1.8] as [number, number, number],
  deckLength: 7.2,
  deckWidth:  1.1,
  deckHeight: 0.16,
  piers: [
    { x: 1.6 },
    { x: 4.8 },
  ] as Array<{ x: number }>,
  pierWidth:  0.22,
  pierHeight: 0.85,
  pierDepth:  1.3,
};

// ─── GROUND PLANE ────────────────────────────────────────────────────────────
// Sized to cleanly support the foreground/midground architectural cluster
// without extending into the photographic horizon or bay.

export const GROUND_CONFIG = {
  position:   [5.0, -0.5, -3.2] as [number, number, number],
  dimensions: [18, 0.2, 10] as [number, number, number],
};
