import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  MapPin,
  Route,
  Database,
  Volume2,
  Sparkles,
  Bot,
  Activity,
  Layers,
  Box,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Globe2,
  ExternalLink,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { GarageVisual } from '@/components/GarageVisual';
import { SpotlightCard, ShinyText, DecryptedText } from '@/components/bits';

gsap.registerPlugin(ScrollTrigger);

// ─── Exhibit 1: Service Map Visual Simulator ───
function ServiceMapVisual() {
  const [activePin, setActivePin] = useState<number>(0);
  const pins = [
    { id: 0, name: 'Research University', location: 'Cambridge, MA', scanners: 6, status: 'Operational', x: '82%', y: '28%' },
    { id: 1, name: 'Research University', location: 'Palo Alto area, CA', scanners: 8, status: 'PM Due', x: '18%', y: '48%' },
    { id: 2, name: 'Research University', location: 'Chicago, IL', scanners: 4, status: 'Operational', x: '58%', y: '36%' },
    { id: 3, name: 'State University', location: 'Gainesville, FL', scanners: 5, status: 'Operational', x: '76%', y: '78%' },
    { id: 4, name: 'State University', location: 'Seattle, WA', scanners: 3, status: 'Upgrade', x: '22%', y: '20%' },
  ];

  return (
    <div className="relative w-full h-[440px] sm:h-[480px] rounded-2xl border border-[var(--border)] bg-[#070b12] text-white overflow-hidden shadow-2xl flex flex-col justify-between">
      {/* HUD Header */}
      <div className="relative z-10 flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#0b101b]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="font-mono text-xs font-bold tracking-wider text-blue-300">
            SERVICE MAP // OPERATIONS CONSOLE
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span>Accounts: <b className="text-white">100+</b></span>
          <span className="hidden sm:inline text-slate-300">Sample data</span>
        </div>
      </div>

      {/* Interactive Map Area */}
      <div className="relative flex-1 bg-[radial-gradient(ellipse_at_50%_50%,rgba(14,35,68,0.7)_0%,#070b12_100%)] overflow-hidden">
        {/* Geographic grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
          <defs>
            <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3B82F6" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mapGrid)" />
          {/* Animated flight/route lines */}
          <path
            d="M 680 340 Q 500 240 220 200"
            fill="none"
            stroke="#60A5FA"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="animate-[dash_20s_linear_infinite]"
          />
          <path
            d="M 680 340 Q 640 280 720 120"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
          <path
            d="M 680 340 Q 480 300 180 230"
            fill="none"
            stroke="#818CF8"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
        </svg>

        {/* Map Pins */}
        {pins.map((pin) => {
          const isSelected = activePin === pin.id;
          return (
            <button
              key={pin.id}
              type="button"
              onClick={() => setActivePin(pin.id)}
              className="absolute group -translate-x-1/2 -translate-y-1/2 focus:outline-none cursor-pointer z-20"
              style={{ left: pin.x, top: pin.y }}
              aria-label={`Select site ${pin.name}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-blue-500 text-white ring-4 ring-blue-400/30 scale-125'
                    : 'bg-slate-800 text-blue-300 border border-blue-400/40 hover:scale-110'
                }`}
              >
                <MapPin size={13} />
              </div>
              <span className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-black/80 text-slate-300 border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity">
                {pin.name}
              </span>
            </button>
          );
        })}

        {/* Active Node Detail Card Overlay */}
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80 p-4 rounded-xl border border-white/15 bg-black/80 backdrop-blur-md text-xs font-mono shadow-xl z-30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase text-blue-400 font-bold">Selected Institution</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] ${
                pins[activePin].status === 'PM Due'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
              }`}
            >
              {pins[activePin].status}
            </span>
          </div>
          <div className="font-bold text-sm text-white font-serif">{pins[activePin].name}</div>
          <div className="text-slate-400 text-[11px] mb-3">{pins[activePin].location}</div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Registered Scanners</span>
              <span className="text-white font-bold">{pins[activePin].scanners} High-Res Units</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Service Window</span>
              <span className="text-cyan-300 font-bold">Route Optimized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="px-5 py-2.5 border-t border-white/10 bg-[#080d17] flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Stack: Next.js &middot; TypeScript &middot; Firebase &middot; Google Maps</span>
        <span className="text-blue-400 font-semibold">GIS Routing Active</span>
      </div>
    </div>
  );
}

// ─── Exhibit 2: AAC Communication Platform Visual Simulator ───
function AACVisual() {
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [lastSpoken, setLastSpoken] = useState<string>('Yes, I agree.');

  const phrases = {
    en: {
      yes: 'YES',
      no: 'NO',
      help: 'I need assistance',
      water: 'I would like water',
      rest: 'I need to rest',
      more: 'Tell me more',
      clear: 'Clear',
      status: 'Offline Ready · High Contrast AA Compliant',
    },
    es: {
      yes: 'SÍ',
      no: 'NO',
      help: 'Necesito ayuda',
      water: 'Quiero agua',
      rest: 'Necesito descansar',
      more: 'Dime más',
      clear: 'Borrar',
      status: 'Listo sin conexión · Contraste accesible AA',
    },
  }[language];

  return (
    <div className="relative w-full h-[440px] sm:h-[480px] rounded-2xl border border-[var(--border)] bg-[#0c1416] text-white overflow-hidden shadow-2xl flex flex-col justify-between">
      {/* Tablet Frame Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#121c1f]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs font-bold tracking-wider text-emerald-300">
            AAC TABLET INTERFACE // HUMAN-CENTERED ACCESSIBILITY
          </span>
        </div>
        {/* Bilingual Language Switcher */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/10 border border-white/10">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
              language === 'en' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('es')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
              language === 'es' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ES
          </button>
        </div>
      </div>

      {/* Main Tablet Communication Stage */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        {/* Live Speech Feedback Bar */}
        <div className="p-4 rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Volume2 size={16} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Auditory Output</span>
              <span className="text-base sm:text-lg font-bold text-white font-serif">{lastSpoken}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLastSpoken('...')}
            className="px-3 py-1 rounded-md text-xs font-mono bg-white/10 text-slate-300 hover:text-white"
          >
            {phrases.clear}
          </button>
        </div>

        {/* High-Impact Primary YES / NO Controls */}
        <div className="grid grid-cols-2 gap-4 my-3">
          <button
            type="button"
            onClick={() => setLastSpoken(language === 'en' ? 'YES' : 'SÍ')}
            className="h-24 sm:h-28 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-serif text-3xl sm:text-4xl font-black shadow-lg border-2 border-emerald-400/40 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            {phrases.yes}
          </button>
          <button
            type="button"
            onClick={() => setLastSpoken('NO')}
            className="h-24 sm:h-28 rounded-2xl bg-rose-700 hover:bg-rose-600 text-white font-serif text-3xl sm:text-4xl font-black shadow-lg border-2 border-rose-400/40 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            {phrases.no}
          </button>
        </div>

        {/* Secondary Essential Expression Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: phrases.help, en: 'I need assistance', es: 'Necesito ayuda' },
            { label: phrases.water, en: 'I would like water', es: 'Quiero agua' },
            { label: phrases.rest, en: 'I need to rest', es: 'Necesito descansar' },
            { label: phrases.more, en: 'Tell me more', es: 'Dime más' },
          ].map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLastSpoken(language === 'en' ? item.en : item.es)}
              className="p-3 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/15 text-slate-200 text-xs sm:text-sm font-medium transition-all text-center cursor-pointer active:scale-95"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-5 py-2.5 border-t border-white/10 bg-[#091012] flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>{phrases.status}</span>
        <span className="text-emerald-400 font-semibold">ARASAAC symbols &middot; EN/ES</span>
      </div>
    </div>
  );
}

// ─── Exhibit 3: Agent Trading OS Visual Simulator ───
function AgentSystemVisual() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { agent: 'Market Data', action: 'Reading the Kalshi order book (best bid and ask)', latency: 'live' },
    { agent: 'Trader Agent', action: 'Proposing a trade from its strategy rules', latency: 'rules' },
    { agent: 'Risk Check', action: 'Validating position size, limits, and fees', latency: 'check' },
    { agent: 'Paper Account', action: 'Filling at the ask and logging the decision', latency: 'paper' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="relative w-full h-[440px] sm:h-[480px] rounded-2xl border border-[var(--border)] bg-[#090b14] text-white overflow-hidden shadow-2xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#0f1222]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="font-mono text-xs font-bold tracking-wider text-violet-300">
            AGENT TRADING OS // MULTI-AGENT INTELLIGENCE NETWORK
          </span>
        </div>
        <span className="text-xs font-mono text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded bg-emerald-500/10">
          Simulation Safety: STRICT
        </span>
      </div>

      {/* Network Visualization Area */}
      <div className="relative flex-1 p-6 flex flex-col justify-between bg-[radial-gradient(ellipse_at_50%_40%,rgba(67,34,136,0.25)_0%,#090b14_100%)]">
        {/* Animated Topology Nodes */}
        <div className="relative h-48 sm:h-56 flex items-center justify-center">
          {/* Connecting SVG conduits */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
            <line x1="50%" y1="50%" x2="80%" y2="25%" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
            <line x1="50%" y1="50%" x2="20%" y2="75%" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
            <line x1="50%" y1="50%" x2="80%" y2="75%" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
          </svg>

          {/* Center Manager Agent */}
          <div className="relative z-10 w-24 h-24 rounded-full border-2 border-violet-400 bg-violet-950/80 shadow-[0_0_35px_rgba(139,92,246,0.5)] flex flex-col items-center justify-center p-2 text-center">
            <Bot size={22} className="text-violet-300 mb-1" />
            <span className="text-[10px] font-mono font-bold leading-tight text-white uppercase">ORCHESTRATOR</span>
          </div>

          {/* Node 1: Ingestion */}
          <div className="absolute top-2 left-6 sm:left-16 p-2 rounded-xl border border-white/15 bg-slate-900/90 text-xs font-mono">
            <span className="text-[10px] text-violet-400 block font-bold">NODE 01</span>
            <span>Market Feed L2</span>
          </div>

          {/* Node 2: Risk Evaluator */}
          <div className="absolute top-2 right-6 sm:right-16 p-2 rounded-xl border border-white/15 bg-slate-900/90 text-xs font-mono text-right">
            <span className="text-[10px] text-emerald-400 block font-bold">NODE 02</span>
            <span>Risk Guardrail</span>
          </div>

          {/* Node 3: Alpha Strategy */}
          <div className="absolute bottom-2 left-6 sm:left-16 p-2 rounded-xl border border-white/15 bg-slate-900/90 text-xs font-mono">
            <span className="text-[10px] text-cyan-400 block font-bold">NODE 03</span>
            <span>Alpha Synthesis</span>
          </div>

          {/* Node 4: Execution Engine */}
          <div className="absolute bottom-2 right-6 sm:right-16 p-2 rounded-xl border border-white/15 bg-slate-900/90 text-xs font-mono text-right">
            <span className="text-[10px] text-amber-400 block font-bold">NODE 04</span>
            <span>FIX Execution</span>
          </div>
        </div>

        {/* Live Decision Trace Terminal */}
        <div className="p-3.5 rounded-xl border border-violet-500/20 bg-black/80 font-mono text-xs">
          <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-400 border-b border-white/10 pb-1">
            <span>AUTONOMOUS DECISION TRACE LOG</span>
            <span className="text-violet-300">STEP {activeStep + 1} OF 4</span>
          </div>
          <div className="flex items-center justify-between text-slate-200">
            <div>
              <span className="text-violet-400 font-bold mr-2">[{steps[activeStep].agent}]:</span>
              <span>{steps[activeStep].action}</span>
            </div>
            <span className="text-slate-500 text-[10px] shrink-0 ml-2">{steps[activeStep].latency}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-white/10 bg-[#06080e] flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Deterministic Architecture &middot; Replay &amp; Simulation Safety</span>
        <span className="text-violet-400 font-semibold">Graph Flow Verified</span>
      </div>
    </div>
  );
}

// ─── Exhibit 4: 3D Garage Configurator Stage ───
function GarageExhibitVisual() {
  return (
    <div className="w-full">
      <GarageVisual />
    </div>
  );
}

// ─── Main Scene 04 Component ───
export default function Scene04ProjectUniverse() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinSectionRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [activeExhibit, setActiveExhibit] = useState<number>(0);

  const [motionReduced, setMotionReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = (e: MediaQueryListEvent) => setMotionReduced(e.matches);
    reducedQuery.addEventListener('change', onMotionChange);
    return () => reducedQuery.removeEventListener('change', onMotionChange);
  }, []);

  const exhibits = [
    {
      id: 'service-map',
      title: 'Service Map Planner',
      subtitle: 'Internal Operations & Nationwide Field-Service GIS',
      category: 'ENTERPRISE OPERATIONS PLATFORM',
      color: '#3B82F6',
      description:
        'An internal operations platform designed and built to centralize institution accounts, optical scanner inventories, software versions, maintenance status, nationwide travel routing, and preventive scheduling in active daily use.',
      challenge:
        'Manual spreadsheets and fragmented customer emails caused scheduling friction and missing hardware maintenance history across 100+ nationwide institutions.',
      solution:
        'Architected a single-pane-of-glass operations hub integrating real-time geography routing, institutional equipment records, automated maintenance flags, and route optimization.',
      technologies: ['Next.js', 'React', 'TypeScript', 'Firebase', 'Google Maps API', 'Tailwind CSS'],
      impact: '100+ institutional accounts in one tool',
      link: '/projects/service-map-planner',
      component: ServiceMapVisual,
    },
    {
      id: 'aac-platform',
      title: 'AAC Communication Platform',
      subtitle: 'Bilingual Human-Centered Assistive Interface',
      category: 'ACCESSIBLE HEALTHCARE & EDUCATION',
      color: '#10B981',
      description:
        'A tablet-first Augmentative and Alternative Communication (AAC) platform engineered for individuals with speech and language differences, featuring prominent binary controls, ARASAAC symbols, and instant bilingual switching.',
      challenge:
        'Traditional speech devices are prohibitively complex, lack instant bilingual Spanish/English capability, and frequently fail in offline or high-stress clinical settings.',
      solution:
        'Engineered an accessible, tablet-optimized interface with prominent YES/NO binary tiles, high contrast ratios, instant bilingual phrase translation, and offline-first cache.',
      technologies: ['React', 'TypeScript', 'ARASAAC Symbols', 'SpeechSynthesis API', 'Offline PWA', 'High-contrast UI'],
      impact: 'Instant English/Spanish switch · Large, accessible YES/NO tiles',
      link: '/projects',
      component: AACVisual,
    },
    {
      id: 'agent-trading-os',
      title: 'Agent Trading OS',
      subtitle: 'Multi-Agent Paper-Trading Lab',
      category: 'MULTI-AGENT SIMULATION',
      color: '#8B5CF6',
      description:
        'A React and TypeScript lab where rule-based trading agents compete on paper accounts against live Kalshi prediction-market and Coinbase prices, coordinated by a portfolio-manager agent and a coach agent. No real money is traded.',
      challenge:
        'Automated trading ideas are easy to over-trust. Every agent decision, including the decision not to trade, should be recorded and checkable before a strategy earns real capital.',
      solution:
        'Built paper accounts with realistic fills (buy at the ask, sell at the bid, exchange fees), risk checks before every order, human-approved experiments, and a log of every proposal and skipped trade.',
      technologies: ['React', 'TypeScript', 'Python', 'FastAPI', 'Kalshi API', 'Coinbase API'],
      impact: 'Every proposal and skipped trade logged · Paper money only',
      link: '/projects',
      component: AgentSystemVisual,
    },
    {
      id: 'scale-garage',
      title: 'Scale Garage Studio',
      subtitle: 'Browser 3D Configurator & Digital Manufacturing Pipeline',
      category: 'PARAMETRIC 3D & HARDWARE FABRICATION',
      color: '#06B6D4',
      description:
        'A browser-based 3D configurator connecting custom scale diorama architecture, photorealistic PBR materials, and real-time WebGL assembly with direct-to-machine STL exports for 3D printing.',
      challenge:
        'Collector scale dioramas previously required bespoke manual drafting and tedious CAD back-and-forth before 3D printing could begin.',
      solution:
        'Built an in-browser parametric WebGL studio with layer explosion, 5000K lighting rigs, and instant slicing exports matching Bambu Lab print volumes (256 × 256 × 256 mm).',
      technologies: ['React', 'Three.js', 'React Three Fiber', 'WebGL', 'Bambu Lab 3D Printing', 'PBR Shaders'],
      impact: 'Direct STL export for 3D printing',
      link: '/projects/scale-garage-studio',
      component: GarageExhibitVisual,
    },
  ];

  useEffect(() => {
    if (!containerRef.current || !pinSectionRef.current) return;
    if (motionReduced) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px) and (min-height: 700px)', () => {
      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: '+=200%',
        pin: pinSectionRef.current,
        scrub: 0.4,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          if (progressLineRef.current) {
            progressLineRef.current.style.width = `${progress * 100}%`;
          }
          const exhibitIndex = Math.min(
            exhibits.length - 1,
            Math.floor(progress * exhibits.length)
          );
          setActiveExhibit(exhibitIndex);
        },
      });

      scrollTriggerRef.current = st;

      return () => {
        st.kill();
        scrollTriggerRef.current = null;
      };
    });

    return () => mm.revert();
  }, [motionReduced, exhibits.length]);

  const handleExhibitClick = (idx: number) => {
    if (scrollTriggerRef.current) {
      const st = scrollTriggerRef.current;
      const progressTarget = (idx + 0.15) / exhibits.length;
      const targetY = st.start + progressTarget * (st.end - st.start);
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    } else {
      setActiveExhibit(idx);
    }
  };

  const current = exhibits[activeExhibit];
  const VisualComponent = current.component;

  return (
    <section
      ref={containerRef}
      id="projects"
      className="relative w-full bg-[var(--bg)] text-[var(--text-primary)] border-t border-[var(--border)]"
      aria-label="Scene 04: Project Universe Case Study Exhibits"
    >
      <div
        ref={pinSectionRef}
        className="relative w-full min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-center px-6 sm:px-12 py-10 lg:py-8 max-w-7xl mx-auto overflow-hidden"
      >
        {/* Section Header */}
        <div className="mb-5 lg:mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="font-mono text-xs font-semibold tracking-widest text-[var(--accent)] uppercase">
              SCENE 04 // PROJECT UNIVERSE &middot; CASE STUDY EXHIBITS
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
                Engineered exhibits.{' '}
                <span className="italic font-normal text-[var(--accent)]">Real outcomes.</span>
              </h2>
            </div>
            <p className="max-w-md text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
              Explore the signature platforms and client systems I have architected and deployed. Scroll or select below to tour each live showcase.
            </p>
          </div>
        </div>

        {/* ─── Top Exhibit Selector & Scrubbed Progress Bar ─── */}
        <div className="relative mb-6">
          {/* Background track */}
          <div className="absolute top-5 inset-x-0 h-1 bg-[var(--border)] rounded-full" />
          {/* Active progress fill */}
          <div
            ref={progressLineRef}
            className="absolute top-5 left-0 h-1 bg-[var(--accent)] rounded-full transition-all duration-150"
            style={{ width: `${((activeExhibit + 0.5) / exhibits.length) * 100}%` }}
          />

          {/* Exhibit Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 relative z-10">
            {exhibits.map((ex, idx) => {
              const isActive = idx === activeExhibit;
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => handleExhibitClick(idx)}
                  className={`p-3 rounded-xl text-left border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'border-[var(--accent)] bg-[var(--surface)] shadow-[var(--shadow-medium)] ring-2 ring-[var(--accent)]/20'
                      : 'border-[var(--border)] bg-[var(--surface-warm)] hover:bg-[var(--surface)] opacity-75 hover:opacity-100'
                  }`}
                  aria-selected={isActive}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-[var(--accent)] uppercase">
                      EXHIBIT 0{idx + 1}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: ex.color }}
                    />
                  </div>
                  <div className="font-serif font-bold text-xs sm:text-sm text-[var(--text-primary)] line-clamp-1">
                    {ex.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Pinned Exhibit Showcase: Side-by-Side Visual Simulator + Dossier Card ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch flex-1 min-h-0">
          {/* Left Column: Interactive Visual Simulator */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="w-full transition-opacity duration-300">
              <VisualComponent />
            </div>
          </div>

          {/* Right Column: Case Study Dossier */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <SpotlightCard
              className="p-6 sm:p-7 flex-1 flex flex-col justify-between border-[var(--border)] shadow-[var(--shadow-medium)] bg-[var(--surface)]"
              spotlightColor="rgba(59, 130, 246, 0.15)"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                    EXHIBIT 0{activeExhibit + 1} OF 04
                  </span>
                  <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                    {current.category}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[var(--text-primary)] mb-1">
                  {current.title}
                </h3>
                <p className="font-mono text-xs text-[var(--accent)] mb-3">
                  {current.subtitle}
                </p>

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                  {current.description}
                </p>

                {/* Challenge & Solution snippets */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-[11px]">
                  <div className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-warm)]">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-rose-500 block mb-0.5">
                      Friction Point
                    </span>
                    <p className="text-[var(--text-secondary)] line-clamp-3">
                      {current.challenge}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-warm)]">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-blue-500 block mb-0.5">
                      Architecture
                    </span>
                    <p className="text-[var(--text-secondary)] line-clamp-3">
                      {current.solution}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                {/* Measured Impact */}
                <div className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-warm)] mb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono uppercase text-[var(--text-muted)] block">OUTCOME</span>
                    <span className="text-xs font-serif font-bold text-[var(--text-primary)]">
                      <DecryptedText text={current.impact} speed={35} maxIterations={8} />
                    </span>
                  </div>
                  <ShieldCheck size={16} className="text-emerald-500 shrink-0 ml-2" />
                </div>

                {/* Technologies tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {current.technologies.slice(0, 5).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[10px] font-mono border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Deep-dive link */}
                <Link
                  to={current.link}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-mono font-semibold tracking-wider uppercase hover:bg-[var(--accent-hover)] transition-all shadow-[var(--shadow-blue)] group"
                >
                  <span>Explore Case Study</span>
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}
