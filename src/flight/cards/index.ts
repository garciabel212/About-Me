import type { ComponentType } from 'react';
import type { StopId } from '../flightData';
import ApproachCard from './ApproachCard';
import CapabilitiesCard from './CapabilitiesCard';
import ContactCard from './ContactCard';
import ExperienceCard from './ExperienceCard';
import HeroCard from './HeroCard';
import WorkCard from './WorkCard';

export const CARD_BODY: Record<StopId, ComponentType> = {
  river: HeroCard,
  brickell: CapabilitiesCard,
  downtown: WorkCard,
  bay: ExperienceCard,
  beach: ApproachCard,
  sunset: ContactCard,
};
