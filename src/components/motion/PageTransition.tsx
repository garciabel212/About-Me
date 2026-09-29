import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { motionDurations, motionEase } from './tokens';

export default function PageTransition({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 14, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
      exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8, filter: 'blur(2px)' }}
      transition={{ duration: motionDurations.page, ease: motionEase }}
    >
      {children}
    </motion.div>
  );
}

