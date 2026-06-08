/**
 * Browser-side toggling for the Locations tree on the player site.
 *
 * Clicks on `[data-loc-expand]` inside a `[data-loc-tree]` root toggle the
 * sibling panel identified by `aria-controls` (scoped under that root).
 */

function toggle(button: HTMLButtonElement, panel: HTMLElement): void {
  const expanded = button.getAttribute('aria-expanded') === 'true';
  const next = !expanded;
  button.setAttribute('aria-expanded', next ? 'true' : 'false');
  if (next) {
    panel.removeAttribute('hidden');
  } else {
    panel.setAttribute('hidden', '');
  }
}

function escapeCssId(id: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(id);
  }
  return id.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function initLocationTree(root: HTMLElement | null): void {
  if (!root || root.dataset.locTreeInitialized === '1') return;
  root.dataset.locTreeInitialized = '1';

  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const btn = target?.closest<HTMLButtonElement>('[data-loc-expand]');
    if (!btn || !root.contains(btn)) return;

    const targetId = btn.getAttribute('aria-controls');
    if (!targetId) return;

    const panel = root.querySelector(`#${escapeCssId(targetId)}`);
    if (!(panel instanceof HTMLElement)) return;

    event.preventDefault();
    event.stopPropagation();
    toggle(btn, panel);
  });
}
