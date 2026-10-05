import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * About Route Component
 * Seamlessly routes to the unified About Me cinematic experience at /#who-i-am,
 * preventing any duplicate or divergent About Me pages.
 */
export default function About() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ pathname: '/', hash: '#who-i-am' }, { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center font-mono text-xs text-[var(--text-muted)]">
      REDIRECTING TO STORY&hellip;
    </div>
  );
}
