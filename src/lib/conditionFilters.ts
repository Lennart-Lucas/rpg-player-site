/**
 * Browser-side filter wiring for the Mechanics Conditions list.
 *
 * The Astro page renders every published condition card up-front and tags each
 * card with filterable fields as `data-*` attributes. This module keeps URL
 * state and visible cards in sync without fetching anything at runtime.
 */

export type ConditionFilterState = {
  search: string;
  rarities: Set<string>;
};

export function emptyConditionFilterState(): ConditionFilterState {
  return {
    search: '',
    rarities: new Set(),
  };
}

function parseCsv(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function upperCsv(raw: string | null): string[] {
  return parseCsv(raw).map((s) => s.toUpperCase());
}

export function readConditionFilterStateFromSearch(
  search: string,
): ConditionFilterState {
  const params = new URLSearchParams(search);
  return {
    search: (params.get('q') ?? '').trim(),
    rarities: new Set(upperCsv(params.get('rarity'))),
  };
}

export function writeConditionFilterStateToSearch(
  state: ConditionFilterState,
): string {
  const params = new URLSearchParams();
  if (state.search.trim().length > 0) {
    params.set('q', state.search.trim());
  }
  if (state.rarities.size > 0) {
    params.set('rarity', [...state.rarities].sort().join(','));
  }
  return params.toString();
}

export function hasActiveConditionFilters(
  state: ConditionFilterState,
): boolean {
  return state.search.trim().length > 0 || state.rarities.size > 0;
}

type CardSnapshot = {
  el: HTMLElement;
  rarity: string;
  searchText: string;
};

function readCardSnapshot(el: HTMLElement): CardSnapshot {
  return {
    el,
    rarity: (el.getAttribute('data-rarity') ?? '').toUpperCase(),
    searchText: (el.getAttribute('data-search') ?? '').toLowerCase(),
  };
}

function matches(
  card: CardSnapshot,
  state: ConditionFilterState,
): boolean {
  const q = state.search.trim().toLowerCase();
  if (q.length > 0 && !card.searchText.includes(q)) return false;
  if (state.rarities.size > 0 && !state.rarities.has(card.rarity)) {
    return false;
  }
  return true;
}

type ChipButton = HTMLButtonElement;

function chipButtons(root: ParentNode, group: string): ChipButton[] {
  return [
    ...root.querySelectorAll<ChipButton>(
      `button[data-filter-group="${group}"]`,
    ),
  ];
}

function syncChipPressed(buttons: ChipButton[], values: Set<string>): void {
  for (const b of buttons) {
    const v = b.getAttribute('data-filter-value') ?? '';
    b.setAttribute('aria-pressed', values.has(v) ? 'true' : 'false');
  }
}

function applyFilterState(
  root: HTMLElement,
  cards: CardSnapshot[],
  state: ConditionFilterState,
): number {
  let visible = 0;
  const visibleSections = new Set<string>();
  for (const card of cards) {
    const ok = matches(card, state);
    card.el.classList.toggle('is-hidden', !ok);
    if (ok) {
      visible += 1;
      const section = card.el.getAttribute('data-section') ?? '';
      if (section.length > 0) visibleSections.add(section);
    }
  }
  for (const section of root.querySelectorAll<HTMLElement>(
    'section[data-condition-section]',
  )) {
    const code = section.getAttribute('data-condition-section') ?? '';
    section.classList.toggle('is-hidden', !visibleSections.has(code));
  }
  return visible;
}

function syncResultCount(
  root: HTMLElement,
  total: number,
  visible: number,
  state: ConditionFilterState,
): void {
  const countEl = root.querySelector<HTMLElement>(
    '[data-condition-filter-count]',
  );
  if (!countEl) return;
  const active = hasActiveConditionFilters(state);
  if (!active) {
    countEl.textContent =
      total === 1 ? '1 condition' : `${total} conditions`;
    return;
  }
  const label = visible === 1 ? '1 condition' : `${visible} conditions`;
  countEl.textContent = `${label} match`;
}

function syncEmptyState(
  root: HTMLElement,
  visible: number,
  total: number,
): void {
  const empty = root.querySelector<HTMLElement>('[data-condition-empty]');
  if (!empty) return;
  empty.classList.toggle('is-hidden', !(total > 0 && visible === 0));
}

function syncClearButton(
  root: HTMLElement,
  state: ConditionFilterState,
): void {
  const btn = root.querySelector<HTMLButtonElement>(
    '[data-condition-filter-clear]',
  );
  if (!btn) return;
  btn.disabled = !hasActiveConditionFilters(state);
}

function syncSearchInput(
  root: HTMLElement,
  state: ConditionFilterState,
): void {
  const input = root.querySelector<HTMLInputElement>(
    '[data-condition-filter-search]',
  );
  if (!input) return;
  if (input.value !== state.search) input.value = state.search;
}

function syncUrl(state: ConditionFilterState): void {
  const query = writeConditionFilterStateToSearch(state);
  const next = query.length > 0 ? `?${query}` : window.location.pathname;
  window.history.replaceState(null, '', next);
}

export function initConditionFilters(root: HTMLElement | null): void {
  if (!root) return;
  const cardEls = [
    ...root.querySelectorAll<HTMLElement>('[data-condition-card]'),
  ];
  if (cardEls.length === 0) return;
  const cards = cardEls.map(readCardSnapshot);

  const state = readConditionFilterStateFromSearch(window.location.search);
  const rarityButtons = chipButtons(root, 'rarity');

  function render(): void {
    syncChipPressed(rarityButtons, state.rarities);
    syncSearchInput(root, state);
    const visible = applyFilterState(root, cards, state);
    syncResultCount(root, cards.length, visible, state);
    syncEmptyState(root, visible, cards.length);
    syncClearButton(root, state);
    syncUrl(state);
  }

  function toggleSet(set: Set<string>, value: string): void {
    if (set.has(value)) set.delete(value);
    else set.add(value);
  }

  for (const b of rarityButtons) {
    b.addEventListener('click', () => {
      const v = b.getAttribute('data-filter-value');
      if (!v) return;
      toggleSet(state.rarities, v);
      render();
    });
  }

  const searchInput = root.querySelector<HTMLInputElement>(
    '[data-condition-filter-search]',
  );
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      state.search = searchInput.value;
      render();
    });
  }

  const clearBtn = root.querySelector<HTMLButtonElement>(
    '[data-condition-filter-clear]',
  );
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.search = '';
      state.rarities.clear();
      render();
    });
  }

  render();
}
