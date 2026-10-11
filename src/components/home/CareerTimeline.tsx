import { experience } from '@/data/content';

const months = ([y, m]: [number, number]) => y * 12 + (m - 1);

/** The two roles on one time axis, from the first start year to today. Decorative: the dates are in the text. */
export default function CareerTimeline() {
  const now = new Date();
  const today: [number, number] = [now.getFullYear(), now.getMonth() + 1];
  const roles = [...experience].sort((a, b) => months(a.start) - months(b.start));
  const first = roles[0].start[0];
  const from = months([first, 1]);
  const to = months(today) + 1;
  const pct = (m: number) => `${((m - from) / (to - from)) * 100}%`;
  const years = Array.from({ length: today[0] - first + 1 }, (_, i) => first + i);

  return (
    <div className="timeline" aria-hidden="true">
      <p className="timeline__heading">Customer delivery since {roles.find((r) => r.weight === 'primary')!.start[0]}</p>
      <div className="timeline__track">
        {years.map((y) => (
          <span key={y} className="timeline__year" style={{ left: pct(months([y, 1])) }}>{y}</span>
        ))}
        {roles.map((r) => {
          const end = r.end ? months(r.end) + 1 : to;
          return (
            <div
              key={r.id}
              className={`timeline__role timeline__role--${r.weight}`}
              style={{ left: pct(months(r.start)), width: `calc(${pct(end)} - ${pct(months(r.start))})` }}
            >
              <span className="timeline__bar" />
              <b>{r.organization.split(' / ').pop()}</b>
              <span>{r.title}</span>
            </div>
          );
        })}
        <span className="timeline__now" style={{ left: pct(to) }}>Now</span>
      </div>
    </div>
  );
}
