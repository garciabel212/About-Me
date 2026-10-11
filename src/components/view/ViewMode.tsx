import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export type ViewMode = 'cinematic' | 'read';

interface ViewModeValue {
  /** Cinematic: the Miami flight behind the page. Read: the same content on a plain page. */
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  /** Whether the flight may move. Off: it shows a still per section. */
  motion: boolean;
  setMotion: (on: boolean) => void;
}

const MODE_KEY = 'jg-view-mode';
const MOTION_KEY = 'jg-motion';
const REDUCED = '(prefers-reduced-motion: reduce)';

const ViewModeContext = createContext<ViewModeValue | null>(null);

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private windows may refuse storage; the choice still holds for this visit.
  }
}

/** `?view=page` (older links) or `?view=read` asks for Read mode; `?view=cinematic` for Cinematic. */
export function modeFromSearch(search: string): ViewMode | null {
  const view = new URLSearchParams(search).get('view');
  if (view === 'page' || view === 'read') return 'read';
  if (view === 'cinematic' || view === 'flight') return 'cinematic';
  return null;
}

function systemWantsStill(): boolean {
  if (typeof window === 'undefined') return true;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return window.matchMedia(REDUCED).matches || connection?.saveData === true;
}

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const { search } = useLocation();
  const [mode, setModeState] = useState<ViewMode>(() => {
    const fromUrl = modeFromSearch(search) ?? modeFromSearch(window.location.search);
    if (fromUrl) return fromUrl;
    return read(MODE_KEY) === 'read' ? 'read' : 'cinematic';
  });
  const [explicitMotion, setExplicitMotion] = useState<boolean | null>(() => {
    const saved = read(MOTION_KEY);
    return saved === 'on' ? true : saved === 'off' ? false : null;
  });
  const [systemStill, setSystemStill] = useState(systemWantsStill);

  useEffect(() => {
    const query = window.matchMedia(REDUCED);
    const onChange = () => setSystemStill(systemWantsStill());
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // A link that names a mode wins over the saved choice, and becomes the saved choice.
  const [seenSearch, setSeenSearch] = useState(search);
  if (seenSearch !== search) {
    setSeenSearch(search);
    const fromUrl = modeFromSearch(search);
    if (fromUrl && fromUrl !== mode) setModeState(fromUrl);
  }
  useEffect(() => {
    write(MODE_KEY, mode);
  }, [mode]);

  const setMode = useCallback((next: ViewMode) => setModeState(next), []);
  const setMotion = useCallback((on: boolean) => {
    setExplicitMotion(on);
    write(MOTION_KEY, on ? 'on' : 'off');
  }, []);

  const motion = explicitMotion ?? !systemStill;
  const value = useMemo(() => ({ mode, setMode, motion, setMotion }), [mode, setMode, motion, setMotion]);
  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
}

export function useViewMode(): ViewModeValue {
  const value = useContext(ViewModeContext);
  if (!value) throw new Error('useViewMode must be used inside ViewModeProvider');
  return value;
}
