import { Film, BookOpen, Pause, Play } from 'lucide-react';
import { useViewMode, type ViewMode } from './ViewMode';

const MODES: { id: ViewMode; label: string; Icon: typeof Film }[] = [
  { id: 'cinematic', label: 'Cinematic', Icon: Film },
  { id: 'read', label: 'Read page', Icon: BookOpen },
];

/** Cinematic / Read page switch. Both modes show the same content in the same order. */
export function ViewSwitch({ className = '' }: { className?: string }) {
  const { mode, setMode } = useViewMode();
  return (
    <div className={`view-switch ${className}`} role="group" aria-label="Viewing mode">
      {MODES.map(({ id, label, Icon }) => (
        <button key={id} type="button" aria-pressed={mode === id} onClick={() => setMode(id)}>
          <Icon size={15} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

/** Pauses or plays the flight. Starts paused when the system asks for reduced motion. */
export function MotionToggle({ className = '' }: { className?: string }) {
  const { motion, setMotion } = useViewMode();
  const Icon = motion ? Pause : Play;
  return (
    <button
      type="button"
      className={`motion-toggle ${className}`}
      aria-pressed={motion}
      onClick={() => setMotion(!motion)}
      title={motion ? 'Pause the flight; show still scenes' : 'Play the flight between sections'}
    >
      <Icon size={15} aria-hidden="true" />
      <span>Motion</span>
      <span className="motion-toggle__state" aria-hidden="true">{motion ? 'On' : 'Off'}</span>
    </button>
  );
}
