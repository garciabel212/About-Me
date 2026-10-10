import { CARD_BODY } from './cards';
import ApproachCard from './cards/ApproachCard';
import type { StopId } from './flightData';
import type { BeachTab } from './stops';

export default function StopContent({ id, beachTab }: { id: StopId; beachTab?: BeachTab }) {
  if (id === 'beach') return <ApproachCard initialTab={beachTab} />;
  const Body = CARD_BODY[id];
  return <Body />;
}
