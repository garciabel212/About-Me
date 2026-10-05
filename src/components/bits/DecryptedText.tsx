import { useEffect, useState, useRef } from 'react';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: 'view' | 'hover';
}

export default function DecryptedText({
  text,
  speed = 45,
  maxIterations = 10,
  sequential = true,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?',
  className = '',
  parentClassName = '',
  encryptedClassName = 'opacity-60 font-mono text-[var(--accent)]',
  animateOn = 'view',
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayText(text);
      return;
    }

    let interval: ReturnType<typeof setInterval>;
    let currentIteration = 0;

    const startScramble = () => {
      setIsScrambling(true);
      currentIteration = 0;

      interval = setInterval(() => {
        setDisplayText(() => {
          return text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (sequential) {
                if (index < (currentIteration / maxIterations) * text.length) {
                  return text[index];
                }
              }
              if (currentIteration >= maxIterations) {
                return text[index];
              }
              return characters[Math.floor(Math.random() * characters.length)];
            })
            .join('');
        });

        currentIteration += 1;
        if (currentIteration > maxIterations + (sequential ? text.length : 0)) {
          clearInterval(interval);
          setIsScrambling(false);
          setDisplayText(text);
        }
      }, speed);
    };

    if (animateOn === 'view') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasAnimated) {
              setHasAnimated(true);
              startScramble();
            }
          });
        },
        { threshold: 0.2 }
      );

      if (containerRef.current) observer.observe(containerRef.current);
      return () => {
        clearInterval(interval);
        observer.disconnect();
      };
    } else if (animateOn === 'hover' && isHovering) {
      startScramble();
      return () => clearInterval(interval);
    }
  }, [animateOn, characters, hasAnimated, isHovering, maxIterations, sequential, speed, text]);

  return (
    <span
      ref={containerRef}
      className={`inline-block whitespace-nowrap ${parentClassName}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <span className={isScrambling ? encryptedClassName : className}>
        {displayText}
      </span>
    </span>
  );
}
