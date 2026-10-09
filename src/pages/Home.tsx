import Scene01Hero from '@/components/scenes/Scene01Hero';
import Scene02WhoIAm from '@/components/scenes/Scene02WhoIAm';
import Scene03Experience from '@/components/scenes/Scene03Experience';
import Scene04ProjectUniverse from '@/components/scenes/Scene04ProjectUniverse';
import Scene05Capabilities from '@/components/scenes/Scene05Capabilities';
import Scene06Philosophy from '@/components/scenes/Scene06Philosophy';
import Scene07Contact from '@/components/scenes/Scene07Contact';

export default function Home() {
  return (
    <main className="relative z-10 w-full bg-[var(--bg)] text-[var(--text-primary)]">
      {/* 01. SCENE 01 — OPENING / SOUTH FLORIDA PARALLAX HERO */}
      <Scene01Hero />

      {/* 02. SCENE 02 — WHO I AM / CUSTOMER TECHNOLOGY LIFECYCLE */}
      <Scene02WhoIAm />

      {/* 03. SCENE 03 — EXPERIENCE / EDITORIAL CHRONOLOGY & POSITIONING */}
      <Scene03Experience />

      {/* 04. SCENE 04 — PROJECT UNIVERSE / EXHIBIT CASE STUDIES */}
      <Scene04ProjectUniverse />

      {/* 05. SCENE 05 — CAPABILITIES / CONNECTED CONSTELLATION GRAPH */}
      <Scene05Capabilities />

      {/* 06. SCENE 06 — PHILOSOPHY / MOMENT OF VISUAL CALM */}
      <Scene06Philosophy />

      {/* 07. FINAL SCENE — MINIMAL PROFESSIONAL CONTACT */}
      <Scene07Contact />
    </main>
  );
}
