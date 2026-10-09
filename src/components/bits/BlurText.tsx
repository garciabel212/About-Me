import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export default function BlurText({
  text,
  delay = 50,
  className = '',
  animateBy = 'words',
  direction = 'top',
  as: Tag = 'span',
}: BlurTextProps) {
  const containerRef = useRef<HTMLElement>(null);

  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  useEffect(() => {
    if (!containerRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const items = containerRef.current.querySelectorAll('.blur-item');
    const yOffset = direction === 'top' ? -20 : 20;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        {
          opacity: 0,
          filter: 'blur(10px)',
          y: yOffset,
        },
        {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          duration: 0.8,
          stagger: delay / 1000,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [delay, direction]);

  return (
    <Tag ref={containerRef as any} className={`inline-block ${className}`}>
      {elements.map((el, i) => (
        <span
          key={i}
          className="blur-item inline-block will-change-[filter,opacity,transform]"
        >
          {el}
          {animateBy === 'words' && i < elements.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </Tag>
  );
}
