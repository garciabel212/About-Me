/**
 * The element a hash link should move keyboard focus to: a Read section
 * (tabIndex -1) itself, or the landing point that holds a zero-size anchor.
 */
export function focusTarget(target: HTMLElement): HTMLElement | null {
  // The attribute, not the property: elements that cannot take focus also report tabIndex -1.
  if (target.getAttribute('tabindex') === '-1') return target;
  return target.closest<HTMLElement>('[data-point]');
}
