import { sectionIds } from '@/data/routes';
import type { StopId } from './flightData';

export type SectionId = (typeof sectionIds)[number];

/** Which Home sections each stop carries, in the brief's page order. */
export const STOP_SECTIONS: Record<StopId, readonly SectionId[]> = {
  river: ['intro'],
  brickell: ['capabilities'],
  downtown: ['projects'],
  bay: ['experience'],
  beach: ['who-i-am', 'about'],
  sunset: ['resume', 'contact'],
};

export const STOP_LABEL: Record<StopId, string> = {
  river: 'Stop 01',
  brickell: 'Stop 02',
  downtown: 'Stop 03',
  bay: 'Stop 04',
  beach: 'Stop 05',
  sunset: 'Stop 06',
};

export function stopForSection(id: string): StopId | null {
  for (const [stop, ids] of Object.entries(STOP_SECTIONS) as [StopId, readonly string[]][]) {
    if (ids.includes(id)) return stop;
  }
  return null;
}
