import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Layers } from 'lucide-react';

interface LayerState {
  id: string;
  name: string;
  category: string;
  color: string;
  active: boolean;
  offsetY: number;
}

export function GarageVisual() {
  const [exploded, setExploded] = useState(false);
  const [activeTab, setActiveTab] = useState<'3d' | 'specs' | 'render'>('3d');
  const [lightingPreset, setLightingPreset] = useState<'cyber' | 'studio' | 'amber'>('cyber');

  const layers: LayerState[] = [
    { id: 'roof', name: 'Truss & Ceiling Grid', category: 'Structure', color: '#60A5FA', active: true, offsetY: exploded ? -70 : 0 },
    { id: 'lighting', name: 'Dual LED Light Bars (5000K)', category: 'Illumination', color: '#22D3EE', active: true, offsetY: exploded ? -35 : 0 },
    { id: 'storage', name: 'Modular Wall Racks & Cabinets', category: 'Fixtures', color: '#A78BFA', active: true, offsetY: exploded ? -10 : 0 },
    { id: 'equipment', name: 'Hydraulic 2-Post Vehicle Lift', category: 'Machinery', color: '#3B82F6', active: true, offsetY: exploded ? 15 : 0 },
    { id: 'floor', name: 'Interlocking Modular Poly Floor', category: 'Base', color: '#1E293B', active: true, offsetY: exploded ? 40 : 0 },
  ];

  const lightingStyles = {
    cyber: {
      glow: 'rgba(6, 182, 212, 0.25)',
      accent: '#22D3EE',
      ambient: 'radial-gradient(ellipse at 50% 30%, rgba(6,182,212,0.18) 0%, rgba(15,23,42,0.8) 70%)',
    },
    studio: {
      glow: 'rgba(59, 130, 246, 0.25)',
      accent: '#60A5FA',
      ambient: 'radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.2) 0%, rgba(15,23,42,0.8) 70%)',
    },
    amber: {
      glow: 'rgba(245, 158, 11, 0.2)',
      accent: '#FBBF24',
      ambient: 'radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.15) 0%, rgba(15,23,42,0.8) 70%)',
    },
  }[lightingPreset];

  return (
    <div className="relative w-full h-[520px] rounded-2xl border border-white/10 bg-[#0c1010] overflow-hidden shadow-float">
      {/* Dynamic ambient backdrop */}
      <div
        className="absolute inset-0 transition-all duration-700 pointer-events-none"
        style={{ background: lightingStyles.ambient }}
      />

      {/* Grid line background */}
      <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none">
        <defs>
          <pattern id="garageGrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#60A5FA" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#garageGrid)" />
      </svg>

      {/* Top HUD Controls */}
      <div className="relative z-20 flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#111616]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-300">
            <Box size={14} />
            <span>SCALE GARAGE 3D</span>
          </div>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            1:18 GARAGE CONFIGURATOR
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExploded(!exploded)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all ${
              exploded
                ? 'bg-white/10 border border-white/25 text-white font-medium shadow-card'
                : 'bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white'
            }`}
          >
            <Layers size={13} />
            <span>{exploded ? 'LAYER EXPLODE: ON' : 'EXPLODED VIEW'}</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

          {/* Lighting Mode presets */}
          <div className="hidden sm:flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            {(['cyber', 'studio', 'amber'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setLightingPreset(preset)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono capitalize transition-all ${
                  lightingPreset === preset
                    ? 'bg-accent-blue/30 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 3D Stage */}
      <div className="relative z-10 w-full h-[calc(100%-110px)] flex items-center justify-center p-6 select-none">
        {/* Stage Perspective Container */}
        <div
          className="relative w-full max-w-lg h-72 transition-all duration-700 ease-out"
          style={{
            perspective: '1200px',
            perspectiveOrigin: '50% 35%',
          }}
        >
          {/* Isometric garage assembly */}
          <motion.div
            className="relative w-full h-full"
            style={{
              transformStyle: 'preserve-3d',
              transform: 'rotateX(30deg) rotateZ(-20deg)',
            }}
            animate={{
              rotateZ: exploded ? -28 : -20,
              rotateX: exploded ? 35 : 30,
            }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          >
            {/* Layer 5: Base Floor */}
            <motion.div
              className="absolute inset-0 rounded-xl border border-slate-700/60 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl overflow-hidden"
              animate={{
                transform: `translateZ(${exploded ? -60 : 0}px)`,
              }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              {/* Floor Checker pattern */}
              <div className="absolute inset-0 opacity-25 grid grid-cols-8 grid-rows-6">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className={`border border-white/[0.05] ${
                      (Math.floor(i / 8) + (i % 8)) % 2 === 0 ? 'bg-white/[0.04]' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
              {/* Parking bay yellow lines */}
              <div className="absolute inset-x-12 inset-y-8 border-2 border-dashed border-yellow-400/40 rounded" />
              <div className="absolute top-2 left-4 font-mono text-[9px] text-slate-500 tracking-wider">
                BAY 01 // HEAVY DUTY LIFT
              </div>
            </motion.div>

            {/* Layer 4: 2-Post Lift & Equipment */}
            <motion.div
              className="absolute inset-x-16 inset-y-12 flex items-center justify-between pointer-events-none"
              animate={{
                transform: `translateZ(${exploded ? 20 : 15}px)`,
              }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              {/* Lift Post Left */}
              <div className="w-5 h-36 bg-gradient-to-t from-blue-700 to-blue-500 rounded-t shadow-lg border border-blue-400/40 flex flex-col justify-between p-0.5">
                <div className="w-full h-1 bg-yellow-400 rounded-sm" />
                <div className="w-full h-1 bg-slate-900 rounded-sm" />
              </div>

              {/* Lift Cradle */}
              <div className="flex-1 mx-2 h-2.5 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 rounded shadow-md border border-white/20 flex items-center justify-around">
                <span className="w-8 h-1 bg-yellow-400/80 rounded" />
                <span className="w-8 h-1 bg-yellow-400/80 rounded" />
              </div>

              {/* Lift Post Right */}
              <div className="w-5 h-36 bg-gradient-to-t from-blue-700 to-blue-500 rounded-t shadow-lg border border-blue-400/40 flex flex-col justify-between p-0.5">
                <div className="w-full h-1 bg-yellow-400 rounded-sm" />
                <div className="w-full h-1 bg-slate-900 rounded-sm" />
              </div>
            </motion.div>

            {/* Layer 3: Tool Wall & Workbenches */}
            <motion.div
              className="absolute -left-3 inset-y-6 w-12 bg-gradient-to-r from-red-900/60 to-red-800/40 rounded-lg border border-red-500/30 p-1 flex flex-col justify-around pointer-events-none backdrop-blur-sm"
              animate={{
                transform: `translateZ(${exploded ? 70 : 30}px) rotateY(45deg)`,
              }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              <div className="h-4 rounded bg-red-600/60 border border-red-400/40" />
              <div className="h-4 rounded bg-red-600/60 border border-red-400/40" />
              <div className="h-4 rounded bg-red-600/60 border border-red-400/40" />
              <div className="h-6 rounded bg-slate-800/90 border border-white/10" />
            </motion.div>

            {/* Layer 2: LED Light Bars */}
            <motion.div
              className="absolute inset-x-8 top-10 flex flex-col gap-6 pointer-events-none"
              animate={{
                transform: `translateZ(${exploded ? 130 : 60}px)`,
              }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              <div
                className="h-2 rounded-full border border-white/40 shadow-sm"
                style={{
                  background: lightingStyles.accent,
                }}
              />
              <div
                className="h-2 rounded-full border border-white/40 shadow-sm"
                style={{
                  background: lightingStyles.accent,
                }}
              />
            </motion.div>

            {/* Layer 1: Ceiling Truss System */}
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-dashed border-sky-400/30 pointer-events-none"
              animate={{
                transform: `translateZ(${exploded ? 180 : 80}px)`,
              }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="border border-sky-400/20" />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating live telemetry overlays */}
        <div className="absolute top-6 left-6 flex flex-col gap-2 pointer-events-none font-mono">
          <div className="float-label-accent text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block mr-1.5" />
            LIVE RENDER // 60 FPS
          </div>
          <div className="float-label text-[10px] text-slate-300">
            142,800 Polygons &middot; Three.js PBR
          </div>
        </div>

        <div className="absolute bottom-6 right-6 flex flex-col items-end gap-1.5 pointer-events-none font-mono text-[11px]">
          <div className="float-label-cyan text-[11px]">
            {exploded ? 'LAYER SEPARATION: +180mm' : 'ASSEMBLY MODE: LOCKED'}
          </div>
          <div className="text-slate-500 text-[10px]">
            Modular wall system &middot; Concept render
          </div>
        </div>
      </div>

      {/* Bottom telemetry footer */}
      <div className="relative z-20 flex flex-wrap items-center justify-between px-5 py-3 border-t border-white/[0.06] bg-navy-950/90 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span><strong className="text-white">SCALE:</strong> 1:18</span>
          <span><strong className="text-white">LIGHTING:</strong> 5000K Color Temp</span>
          <span className="hidden md:inline"><strong className="text-white">MATERIALS:</strong> PBR Diamond Plate, Raw Steel, Powder Coat</span>
        </div>
        <div className="text-accent-blue-light font-medium">
          Interactive Configurator Demo &rarr;
        </div>
      </div>
    </div>
  );
}
