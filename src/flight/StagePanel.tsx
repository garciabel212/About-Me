import type { ReactNode } from 'react';
import type { FlightMode } from './useFlightMode';

interface StagePanelProps {
  mode: FlightMode;
  /** Receives the element whose opacity/transform the scroll driver updates. */
  panelRef: (element: HTMLDivElement | null) => void;
  children: ReactNode;
}

const LAYOUT: Record<FlightMode, string> = {
  desktop: 'absolute inset-0 flex items-center pt-20',
  mobile: 'absolute inset-x-0 bottom-0 pb-24',
  static: 'relative',
};

export default function StagePanel({ mode, panelRef, children }: StagePanelProps) {
  return (
    <div ref={panelRef} className={`${LAYOUT[mode]} will-change-[opacity,transform]`}>
      <div className="section-container w-full">{children}</div>
    </div>
  );
}
