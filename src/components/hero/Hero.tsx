import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  const scene = useRef<HTMLDivElement>(null);
  const [motionOff, setMotionOff] = useState(false);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = matchMedia('(min-width: 768px)');
    let frame = 0;
    const draw = () => {
      frame = 0;
      if (scene.current) scene.current.style.transform = `translateY(${!motionOff && !reduced.matches && desktop.matches ? Math.min(18, window.scrollY * .025) : 0}px)`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
    draw();
    window.addEventListener('scroll', schedule, { passive: true });
    reduced.addEventListener('change', schedule);
    desktop.addEventListener('change', schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); reduced.removeEventListener('change', schedule); desktop.removeEventListener('change', schedule); };
  }, [motionOff]);
  const base = import.meta.env.BASE_URL;
  return <section id="intro" className="editorial-hero" aria-labelledby="intro-title" tabIndex={-1}>
    <div className="waterfront-scene" ref={scene} aria-hidden="true"><picture><source media="(max-width: 767px)" srcSet={`${base}images/brickell_skyline_hero-768.webp`} /><img src={`${base}images/brickell_skyline_hero.webp`} alt="" width="1024" height="576" fetchPriority="high" /></picture></div>
    <div className="hero-shade" aria-hidden="true" />
    <div className="intro-copy">
      <p className="editorial-eyebrow">South Florida · Sales engineering & solutions consulting</p>
      <p className="intro-name">Jose Garcia</p>
      <h1 id="intro-title">I turn complex technology into <em>solutions people can use.</em></h1>
      <p className="intro-description">Customer-facing engineer bridging technical discovery, tailored demonstrations, hardware and software implementation, and long-term customer success.</p>
      <div className="editorial-actions"><Link className="editorial-button" to="/#work">View work <span aria-hidden="true">↗</span></Link><Link className="editorial-text-link" to="/#contact">Let’s connect <span aria-hidden="true">↗</span></Link></div>
      <div className="intro-person"><img src={`${base}images/jose-portrait-320.webp`} alt="Jose Garcia" width="320" height="320" fetchPriority="high" /><p><strong>Engineer. Builder. Translator.</strong><span>B.S. Computer Engineering · FAU<br />English & Spanish · Nationwide deployments</span></p></div>
    </div>
    <div className="intro-caption"><span>Miami River / Brickell, Florida</span><button type="button" aria-pressed={motionOff} onClick={() => setMotionOff(!motionOff)}>{motionOff ? 'Motion off' : 'Reduce motion'}</button><Link to="/#work">Selected work ↓</Link></div>
  </section>;
}
