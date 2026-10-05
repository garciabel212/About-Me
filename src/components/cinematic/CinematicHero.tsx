import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import './cinematic.css';

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const invlerp = (a: number, b: number, n: number) => clamp((n - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const fadeWindow = (p: number, a: number, b: number, c: number, d: number) =>
  smooth(invlerp(a, b, p)) * (1 - smooth(invlerp(c, d, p)));

export default function CinematicHero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const systemRef = useRef<HTMLDivElement>(null);
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const path3Ref = useRef<SVGPathElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  // City layer refs for direct transform
  const photoBaseRef = useRef<HTMLDivElement>(null);
  const sliceLeftRef = useRef<HTMLDivElement>(null);
  const sliceCenterRef = useRef<HTMLDivElement>(null);
  const sliceRightRef = useRef<HTMLDivElement>(null);
  const edgeRightRef = useRef<HTMLDivElement>(null);
  const hazeRef = useRef<HTMLDivElement>(null);
  const fogRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const cityLabelRef = useRef<HTMLDivElement>(null);
  const cityContainerRef = useRef<HTMLDivElement>(null);

  const [motionReduced, setMotionReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const baseUrl = import.meta.env.BASE_URL;
  const skylineUrl = `${baseUrl}images/brickell_skyline_hero.webp`;

  useEffect(() => {
    const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = (e: MediaQueryListEvent) => setMotionReduced(e.matches);
    reducedQuery.addEventListener('change', onMotionChange);
    return () => reducedQuery.removeEventListener('change', onMotionChange);
  }, []);

  useEffect(() => {
    let animId = 0;
    const root = document.documentElement;

    const render = () => {
      if (!trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const scrollable = trackRef.current.offsetHeight - window.innerHeight;
      const p = clamp(-rect.top / (scrollable || 1));

      root.style.setProperty('--progress', p.toFixed(4));

      // ─── SCENE 1: HERO (0% - 20%) ───
      const heroO = 1 - smooth(invlerp(0.10, 0.20, p));
      const heroY = -40 * smooth(invlerp(0.08, 0.20, p));
      const heroS = 1 - 0.04 * smooth(invlerp(0.08, 0.20, p));
      if (heroRef.current) {
        heroRef.current.style.opacity = heroO.toFixed(3);
        heroRef.current.style.transform = `translateY(${heroY.toFixed(1)}px) scale(${heroS.toFixed(4)})`;
        heroRef.current.style.pointerEvents = heroO > 0.1 ? 'auto' : 'none';
      }

      const hintO = 1 - smooth(invlerp(0.02, 0.10, p));
      if (hintRef.current) {
        hintRef.current.style.opacity = hintO.toFixed(3);
      }

      // ─── SCENE 2: IDENTITY STATEMENT (16% - 46%) ───
      const stO = fadeWindow(p, 0.16, 0.25, 0.36, 0.46);
      const stY = 24 - 48 * smooth(invlerp(0.16, 0.46, p));
      const stS = 0.96 + 0.04 * smooth(invlerp(0.16, 0.26, p));
      if (statementRef.current) {
        statementRef.current.style.opacity = stO.toFixed(3);
        statementRef.current.style.transform = `translateY(${stY.toFixed(1)}px) scale(${stS.toFixed(4)})`;
        statementRef.current.style.pointerEvents = stO > 0.1 ? 'auto' : 'none';
      }

      // ─── 2.5D REAL BRICKELL CAMERA DEPTH ───
      const cam = smooth(invlerp(0.0, 0.68, p));
      const fly = smooth(invlerp(0.02, 0.52, p));
      const peel = smooth(invlerp(0.20, 0.62, p));
      const dissolve = smooth(invlerp(0.48, 0.76, p));
      const cityOpacity = 1 - 0.92 * smooth(invlerp(0.62, 0.82, p));

      if (cityContainerRef.current) {
        cityContainerRef.current.style.opacity = cityOpacity.toFixed(3);
        cityContainerRef.current.style.filter = `blur(${(dissolve * 6).toFixed(2)}px) saturate(${(1 - 0.35 * dissolve).toFixed(3)})`;
      }

      if (!motionReduced) {
        if (photoBaseRef.current) {
          photoBaseRef.current.style.transform = `translate3d(${(-42 * cam).toFixed(1)}px, ${(-22 * cam).toFixed(1)}px, 0) scale(${(1.045 + cam * 0.10).toFixed(4)})`;
        }
        if (sliceLeftRef.current) {
          sliceLeftRef.current.style.transform = `translate3d(${(-22 * peel).toFixed(1)}px, ${(-18 * fly).toFixed(1)}px, 0) scale(${(1.045 + fly * 0.16).toFixed(4)})`;
          sliceLeftRef.current.style.opacity = (0.96 * (1 - 0.72 * dissolve)).toFixed(3);
        }
        if (sliceCenterRef.current) {
          sliceCenterRef.current.style.transform = `translate3d(${(28 * peel).toFixed(1)}px, ${(-15 * fly).toFixed(1)}px, 0) scale(${(1.045 + fly * 0.11).toFixed(4)})`;
          sliceCenterRef.current.style.opacity = (0.96 * (1 - 0.72 * dissolve)).toFixed(3);
        }
        if (sliceRightRef.current) {
          sliceRightRef.current.style.transform = `translate3d(${(82 * peel).toFixed(1)}px, ${(-18 * fly).toFixed(1)}px, 0) scale(${(1.045 + fly * 0.16).toFixed(4)})`;
          sliceRightRef.current.style.opacity = (0.96 * (1 - 0.72 * dissolve)).toFixed(3);
        }
        if (edgeRightRef.current) {
          edgeRightRef.current.style.transform = `perspective(1200px) translate3d(${(285 * peel).toFixed(1)}px, ${(-30 * fly).toFixed(1)}px, 0) rotateY(-5deg) scale(${(1.03 + fly * 0.32).toFixed(4)})`;
          edgeRightRef.current.style.opacity = (0.68 * (1 - smooth(invlerp(0.36, 0.62, p)))).toFixed(3);
        }
      }

      if (hazeRef.current) {
        hazeRef.current.style.opacity = (0.55 + 0.16 * fly - 0.46 * dissolve).toFixed(3);
      }
      if (fogRef.current) {
        fogRef.current.style.opacity = (0.34 + 0.16 * fly - 0.40 * dissolve).toFixed(3);
        fogRef.current.style.transform = `translateY(${(-14 * fly).toFixed(1)}px)`;
      }
      if (sheenRef.current) {
        sheenRef.current.style.opacity = (0.48 * (1 - 0.75 * dissolve)).toFixed(3);
        sheenRef.current.style.transform = `translate3d(${(12 * Math.sin(p * Math.PI)).toFixed(1)}px, 0, 0) skewY(-1deg)`;
      }
      if (cityLabelRef.current) {
        cityLabelRef.current.style.opacity = (0.8 * (1 - smooth(invlerp(0.10, 0.22, p)))).toFixed(3);
      }

      // ─── SCENE 3: SYSTEMS OVERLAY (40% - 74%) ───
      const sysO = fadeWindow(p, 0.40, 0.50, 0.64, 0.74);
      const sysScale = 0.96 + 0.04 * smooth(invlerp(0.40, 0.55, p));
      if (systemRef.current) {
        systemRef.current.style.opacity = sysO.toFixed(3);
        systemRef.current.style.transform = `scale(${sysScale.toFixed(4)})`;
        systemRef.current.style.pointerEvents = sysO > 0.1 ? 'auto' : 'none';
      }

      // Animated line drawing
      const dashOffset = (-220 * p).toFixed(1);
      if (path1Ref.current) path1Ref.current.style.strokeDashoffset = dashOffset;
      if (path2Ref.current) path2Ref.current.style.strokeDashoffset = dashOffset;
      if (path3Ref.current) path3Ref.current.style.strokeDashoffset = dashOffset;

      // ─── SCENE 4: SERVICE MAP PLANNER REVEAL (68% - 100%) ───
      const prodO = smooth(invlerp(0.68, 0.78, p));
      const q = smooth(invlerp(0.69, 0.95, p));
      const deviceY = 85 - 85 * q;
      const deviceScale = 0.56 + 0.44 * q;
      const deviceRX = 8 - 8 * q;

      if (productRef.current) {
        productRef.current.style.opacity = prodO.toFixed(3);
        productRef.current.style.pointerEvents = prodO > 0.1 ? 'auto' : 'none';
      }
      if (deviceRef.current) {
        deviceRef.current.style.transform = `perspective(1600px) translateY(${deviceY.toFixed(1)}px) scale(${deviceScale.toFixed(4)}) rotateX(${deviceRX.toFixed(2)}deg)`;
      }

      const capO = fadeWindow(p, 0.82, 0.90, 0.98, 1.0);
      const capY = 24 - 24 * smooth(invlerp(0.82, 0.91, p));
      if (captionRef.current) {
        captionRef.current.style.opacity = capO.toFixed(3);
        captionRef.current.style.transform = `translateX(-50%) translateY(${capY.toFixed(1)}px)`;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [motionReduced]);

  return (
    <div className="cinematic-wrapper" id="intro">
      <section className="cinematic-track" ref={trackRef} aria-label="Cinematic Portfolio Experience">
        <div className="cinematic-stage">
          {/* 2.5D Real Brickell Depth Layer */}
          <div className="cinematic-city" ref={cityContainerRef} aria-hidden="true">
            <div
              className="photo-base"
              ref={photoBaseRef}
              style={{ backgroundImage: `url("${skylineUrl}")` }}
            />
            <div
              className="photo-slice slice-left"
              ref={sliceLeftRef}
              style={{ backgroundImage: `url("${skylineUrl}")` }}
            />
            <div
              className="photo-slice slice-center"
              ref={sliceCenterRef}
              style={{ backgroundImage: `url("${skylineUrl}")` }}
            />
            <div
              className="photo-slice slice-right"
              ref={sliceRightRef}
              style={{ backgroundImage: `url("${skylineUrl}")` }}
            />
            <div
              className="edge-plane edge-right"
              ref={edgeRightRef}
              style={{ backgroundImage: `url("${skylineUrl}")` }}
            />
            <div className="city-haze" ref={hazeRef} />
            <div className="depth-fog" ref={fogRef} />
            <div className="river-sheen" ref={sheenRef} />
            <div className="city-grade" />
            <div className="city-label" ref={cityLabelRef}>
              Brickell · Miami // Systems in Depth
            </div>
          </div>

          {/* Scene 1: Jose Garcia Hero */}
          <div className="cinematic-scene scene-hero" ref={heroRef} style={{ opacity: 1 }}>
            <div className="scene-inner">
              <div className="cinematic-eyebrow">South Florida · Technical Solutions</div>
              <h1 className="text-white drop-shadow-md">
                <span>JOSE</span>
                <span>GARCIA</span>
              </h1>
              <p className="role text-white/80">Sales Engineer · Solutions Consultant · Technical Systems</p>
            </div>
          </div>

          {/* Scene 2: Identity Statement */}
          <div className="cinematic-scene scene-statement" ref={statementRef} style={{ opacity: 0 }}>
            <div className="scene-inner">
              <div className="cinematic-eyebrow">01 / Philosophy</div>
              <h2 className="text-white">
                I work where <span className="accent">technology, people,</span> and complex systems meet.
              </h2>
              <p className="text-white/70">
                Turning technical complexity into clear demonstrations, confident decisions, successful deployments,
                and lasting customer value.
              </p>
            </div>
          </div>

          {/* Scene 3: Sales Engineering System Flow */}
          <div className="system-wrap" ref={systemRef} id="workflow" style={{ opacity: 0 }}>
            <div className="system-grid" />
            <svg className="system-lines" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
              <path ref={path1Ref} d="M130 390 C250 220 320 220 380 270 S510 380 600 285 S770 240 885 410" />
              <path ref={path2Ref} d="M500 490 C480 420 475 365 500 315" />
              <path ref={path3Ref} d="M220 210 C350 330 420 350 500 315 S680 310 790 215" />
            </svg>

            {/* Workflow Nodes */}
            <div className="node n1">
              <i />
              Discovery
            </div>
            <div className="node n2">
              <i />
              Solution Design
            </div>
            <div className="node n3">
              <i />
              Technical Demo
            </div>
            <div className="node n4">
              <i />
              Implementation
            </div>
            <div className="node n5">
              <i />
              Support &amp; Scale
            </div>

            <div className="system-title">
              <div className="cinematic-eyebrow">How I Work</div>
              <h2 className="text-white">
                Technology.
                <br />
                People. Systems.
              </h2>
              <p className="text-white/70">
                I connect complex products to real customer needs—from technical discovery and customized
                demonstrations through implementation, customer training, and long-term support.
              </p>
            </div>
          </div>

          {/* Scene 4: Service Map Planner Reveal */}
          <div className="product-layer" ref={productRef} style={{ opacity: 0 }}>
            <div className="device" ref={deviceRef}>
              <div className="appbar">
                <div className="dots">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="appname">Service Map Planner</div>
                <div className="status">Live Operations</div>
              </div>
              <div className="appbody">
                <aside className="sidebar">
                  <div className="mini-title">Institutions</div>
                  <div className="search" />
                  <div className="list-item active">
                    <div className="li-line" />
                    <div className="li-line sm" />
                  </div>
                  <div className="list-item">
                    <div className="li-line" />
                    <div className="li-line sm" />
                  </div>
                  <div className="list-item">
                    <div className="li-line" />
                    <div className="li-line sm" />
                  </div>
                  <div className="list-item">
                    <div className="li-line" />
                    <div className="li-line sm" />
                  </div>
                </aside>
                <div className="map">
                  <div className="roads" />
                  <i className="pin p1" />
                  <i className="pin p2" />
                  <i className="pin p3" />
                  <i className="pin p4" />
                  <i className="pin p5" />
                  <i className="pin p6" />
                  <div className="map-card">
                    <div className="mini-title">Customer Overview</div>
                    <div className="big text-white">Service intelligence.</div>
                    <p>
                      Customers, equipment, maintenance, service history, travel planning and operational context in
                      one system.
                    </p>
                    <div className="kpis">
                      <div className="kpi">
                        <b className="text-white">128</b>
                        <span>Sites</span>
                      </div>
                      <div className="kpi">
                        <b className="text-white">214</b>
                        <span>Systems</span>
                      </div>
                      <div className="kpi">
                        <b className="text-white">31</b>
                        <span>Due</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="product-caption" ref={captionRef} style={{ opacity: 0 }}>
              <div className="cinematic-eyebrow">02 / Signature Platform</div>
              <h2 className="text-white">Service Map Planner</h2>
              <p className="text-white/70">
                An internal operational platform designed around the way field service actually works.
              </p>
            </div>
          </div>

          <div className="cinematic-vignette" />
          <div className="cinematic-grain" />

          {/* Scroll Hint */}
          <div className="scroll-hint" ref={hintRef}>
            <span>Scroll to explore</span>
            <span className="line" />
          </div>
        </div>
      </section>

      {/* Story Continues Bridge */}
      <section className="cinematic-after" id="work">
        <div className="label">The story continues</div>
        <h2>From customer problem to working system.</h2>
        <div className="after-grid">
          <p className="after-copy">
            The cinematic opening hands off into a focused case-study presentation. This is where real customer
            deployments, technical architecture, and measurable outcomes live.
          </p>
          <div className="facts">
            <div className="fact">
              <span>Focus</span>
              <b>Sales Engineering</b>
            </div>
            <div className="fact">
              <span>Strength</span>
              <b>Technical Demos</b>
            </div>
            <div className="fact">
              <span>Delivery</span>
              <b>Implementation</b>
            </div>
            <div className="fact">
              <span>Experience</span>
              <b>Customer Systems</b>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#c9c9c4] text-xs font-mono tracking-wider text-[#74787e]">
          <span>MIAMI RIVER / BRICKELL, FL &middot; NATIONWIDE DEPLOYMENTS</span>
          <div className="flex items-center gap-6">
            <button
              type="button"
              className="hover:text-black underline transition-colors cursor-pointer"
              onClick={() => setMotionReduced(!motionReduced)}
            >
              {motionReduced ? 'Enable 2.5D Parallax' : 'Reduce Motion'}
            </button>
            <a href="#service-map-planner" className="inline-flex items-center gap-1 font-semibold text-black hover:text-blue-600 transition-colors">
              <span>Explore Service Map Case Study</span>
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
