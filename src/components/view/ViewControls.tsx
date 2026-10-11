import { Film, BookOpen, Pause, Play } from 'lucide-react';
import { useViewMode } from './ViewMode';

/**
 * Cinematic / Read page switch, with the flight's motion control attached to
 * Cinematic. Both modes show the same content in the same order.
 */
export function ViewSwitch({ className = '' }: { className?: string }) {
  const { mode, setMode, motion, setMotion } = useViewMode();
  const cinematic = mode === 'cinematic';
  const MotionIcon = motion ? Pause : Play;
  return (
    <div className={`view-switch ${className}`} role="group" aria-label="Viewing mode">
      <button type="button" aria-pressed={cinematic} onClick={() => setMode('cinematic')}>
        <Film size={15} aria-hidden="true" />
        <span>Cinematic</span>
      </button>
      {cinematic && (
        <button
          type="button"
          className="view-switch__motion"
          aria-pressed={motion}
          aria-label="Motion"
          title={motion ? 'Pause the flight and show still scenes' : 'Play the flight between sections'}
          onClick={() => setMotion(!motion)}
        >
          <MotionIcon size={14} aria-hidden="true" />
        </button>
      )}
      <button type="button" aria-pressed={!cinematic} onClick={() => setMode('read')}>
        <BookOpen size={15} aria-hidden="true" />
        <span>Read<span className="hide-below-sm"> page</span></span>
      </button>
    </div>
  );
}
