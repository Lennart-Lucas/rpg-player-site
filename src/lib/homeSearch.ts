/**
 * Browser-side filter wiring for the home page global search.
 *
 * The home page renders every published record across all known record types
 * as a hidden list of result rows tagged with `data-search`. This module
 * shows/hides those rows in response to the search input, caps the visible
 * count per type, and reveals a "see all" link when more matches exist.
 *
 * Keep this module dependency-free so the bundled client script stays small.
 */

const MAX_PER_GROUP = 8;

type GroupState = {
  el: HTMLElement;
  entries: HTMLElement[];
  countEl: HTMLElement | null;
  moreEl: HTMLElement | null;
  moreCountEl: HTMLElement | null;
};

function collectGroups(root: HTMLElement): GroupState[] {
  const groupEls = [
    ...root.querySelectorAll<HTMLElement>('[data-result-group]'),
  ];
  return groupEls.map((el) => ({
    el,
    entries: [...el.querySelectorAll<HTMLElement>('[data-search-entry]')],
    countEl: el.querySelector<HTMLElement>('[data-result-count]'),
    moreEl: el.querySelector<HTMLElement>('[data-result-more]'),
    moreCountEl: el.querySelector<HTMLElement>('[data-result-more-count]'),
  }));
}

export function initHomeSearch(root: HTMLElement | null): void {
  if (!root) return;
  const input = root.querySelector<HTMLInputElement>('[data-home-search]');
  if (!input) return;

  const groups = collectGroups(root);
  if (groups.length === 0) return;

  const emptyEl = root.querySelector<HTMLElement>('[data-home-empty]');
  const summaryEl = root.querySelector<HTMLElement>('[data-home-summary]');
  const matchCountEl = root.querySelector<HTMLElement>(
    '[data-home-match-count]',
  );

  function render(): void {
    const q = input!.value.trim().toLowerCase();
    const hasQuery = q.length > 0;
    let totalMatched = 0;

    for (const group of groups) {
      let matchedInGroup = 0;
      let visibleInGroup = 0;
      for (const entry of group.entries) {
        if (!hasQuery) {
          entry.classList.add('is-hidden');
          continue;
        }
        const txt = entry.getAttribute('data-search') ?? '';
        const matches = txt.includes(q);
        if (matches) matchedInGroup += 1;
        const show = matches && visibleInGroup < MAX_PER_GROUP;
        entry.classList.toggle('is-hidden', !show);
        if (show) visibleInGroup += 1;
      }
      totalMatched += matchedInGroup;

      if (group.countEl) {
        group.countEl.textContent = matchedInGroup > 0 ? `${matchedInGroup}` : '';
      }
      if (group.moreEl && group.moreCountEl) {
        const extra = matchedInGroup - visibleInGroup;
        group.moreEl.classList.toggle('is-hidden', extra <= 0);
        group.moreCountEl.textContent = `${extra}`;
      }
      group.el.classList.toggle(
        'is-hidden',
        !hasQuery || matchedInGroup === 0,
      );
    }

    if (summaryEl) {
      summaryEl.classList.toggle('is-hidden', hasQuery);
    }
    if (emptyEl) {
      emptyEl.classList.toggle('is-hidden', !hasQuery || totalMatched > 0);
    }
    if (matchCountEl) {
      if (!hasQuery) {
        matchCountEl.textContent = '';
        matchCountEl.classList.add('is-hidden');
      } else {
        matchCountEl.classList.remove('is-hidden');
        matchCountEl.textContent =
          totalMatched === 1 ? '1 match' : `${totalMatched} matches`;
      }
    }
  }

  input.addEventListener('input', render);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && input.value.length > 0) {
      input.value = '';
      render();
      e.preventDefault();
    }
  });

  render();
}
