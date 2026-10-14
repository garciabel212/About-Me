import { describe, expect, it } from 'vitest';
import { focusTarget } from '../focusTarget';

/** A stand-in element: `tabindex` attribute value (null when absent) and the section `closest` finds. */
const el = (tabindex: string | null, section: unknown = null) =>
  ({ tabIndex: -1, getAttribute: (n: string) => (n === 'tabindex' ? tabindex : null), closest: () => section }) as unknown as HTMLElement;

describe('focusTarget', () => {
  it('focuses a Read section directly', () => {
    const s = el('-1');
    expect(focusTarget(s)).toBe(s);
  });

  it('hands focus from a landing anchor to its point section, even though a plain span reports tabIndex -1', () => {
    const section = el('-1');
    expect(focusTarget(el(null, section))).toBe(section);
  });

  it('focuses nothing when neither is focusable', () => {
    expect(focusTarget(el(null))).toBeNull();
  });
});
