/**
 * Browser-side filter wiring for the player Items list.
 *
 * The Astro page renders every published item card up-front and tags each
 * card with the filterable fields as `data-*` attributes. The functions here
 * read/write the URL query string and toggle card visibility in place.
 *
 * Keep this module dependency-free so the bundled client script stays small.
 */

export type ItemFilterState = {
  search: string;
  types: Set<string>;
  rarities: Set<string>;
  magicOnly: boolean;
  attunementOnly: boolean;
  consumableOnly: boolean;
};

export function emptyItemFilterState(): ItemFilterState {
  return {
    search: '',
    types: new Set(),
    rarities: new Set(),
    magicOnly: false,
    attunementOnly: false,
    consumableOnly: false,
  };
}

function parseCsv(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function lowerCsv(raw: string | null): string[] {
  return parseCsv(raw).map((s) => s.toLowerCase());
}

function parseBool(raw: string | null): boolean {
  if (raw == null) return false;
  const v = raw.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

export function readItemFilterStateFromSearch(search: string): ItemFilterState {
  const params = new URLSearchParams(search);
  return {
    search: (params.get('q') ?? '').trim(),
    types: new Set(lowerCsv(params.get('type'))),
    rarities: new Set(lowerCsv(params.get('rarity'))),
    magicOnly: parseBool(params.get('magic')),
    attunementOnly: parseBool(params.get('attunement')),
    consumableOnly: parseBool(params.get('consumable')),
  };
}

export function writeItemFilterStateToSearch(state: ItemFilterState): string {
  const params = new URLSearchParams();
  if (state.search.trim().length > 0) {
    params.set('q', state.search.trim());
  }
  if (state.types.size > 0) {
    params.set('type', [...state.types].sort().join(','));
  }
  if (state.rarities.size > 0) {
    params.set('rarity', [...state.rarities].sort().join(','));
  }
  if (state.magicOnly) params.set('magic', '1');
  if (state.attunementOnly) params.set('attunement', '1');
  if (state.consumableOnly) params.set('consumable', '1');
  return params.toString();
}

export function hasActiveItemFilters(state: ItemFilterState): boolean {
  return (
    state.search.trim().length > 0 ||
    state.types.size > 0 ||
    state.rarities.size > 0 ||
    state.magicOnly ||
    state.attunementOnly ||
    state.consumableOnly
  );
}

type CardSnapshot = {
  el: HTMLElement;
  type: string;
  rarity: string;
  magic: boolean;
  attunement: boolean;
  consumable: boolean;
  searchText: string;
};

function readCardSnapshot(el: HTMLElement): CardSnapshot {
  return {
    el,
    type: (el.getAttribute('data-type') ?? '').toLowerCase(),
    rarity: (el.getAttribute('data-rarity') ?? '').toLowerCase(),
    magic: el.getAttribute('data-magic') === 'true',
    attunement: el.getAttribute('data-attunement') === 'true',
    consumable: el.getAttribute('data-consumable') === 'true',
    searchText: (el.getAttribute('data-search') ?? '').toLowerCase(),
  };
}

function matches(card: CardSnapshot, state: ItemFilterState): boolean {
  const q = state.search.trim().toLowerCase();
  if (q.length > 0 && !card.searchText.includes(q)) return false;
  if (state.types.size > 0 && !state.types.has(card.type)) return false;
  if (state.rarities.size > 0 && !state.rarities.has(card.rarity)) return false;
  if (state.magicOnly && !card.magic) return false;
  if (state.attunementOnly && !card.attunement) return false;
  if (state.consumableOnly && !card.consumable) return false;
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

function syncToggle(btn: HTMLButtonElement | null, value: boolean): void {
  if (!btn) return;
  btn.setAttribute('aria-pressed', value ? 'true' : 'false');
}

function applyFilterState(
  root: HTMLElement,
  cards: CardSnapshot[],
  state: ItemFilterState,
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
    'section[data-item-section]',
  )) {
    const code = section.getAttribute('data-item-section') ?? '';
    section.classList.toggle('is-hidden', !visibleSections.has(code));
  }
  return visible;
}

function syncResultCount(
  root: HTMLElement,
  total: number,
  visible: number,
  state: ItemFilterState,
): void {
  const countEl = root.querySelector<HTMLElement>('[data-item-filter-count]');
  if (!countEl) return;
  const active = hasActiveItemFilters(state);
  if (!active) {
    countEl.textContent = total === 1 ? '1 item' : `${total} items`;
    return;
  }
  const label = visible === 1 ? '1 item' : `${visible} items`;
  countEl.textContent = `${label} match`;
}

function syncEmptyState(
  root: HTMLElement,
  visible: number,
  total: number,
): void {
  const empty = root.querySelector<HTMLElement>('[data-item-empty]');
  if (!empty) return;
  empty.classList.toggle('is-hidden', !(total > 0 && visible === 0));
}

function syncClearButton(root: HTMLElement, state: ItemFilterState): void {
  const btn = root.querySelector<HTMLButtonElement>(
    '[data-item-filter-clear]',
  );
  if (!btn) return;
  btn.disabled = !hasActiveItemFilters(state);
}

function syncSearchInput(root: HTMLElement, state: ItemFilterState): void {
  const input = root.querySelector<HTMLInputElement>(
    '[data-item-filter-search]',
  );
  if (!input) return;
  if (input.value !== state.search) input.value = state.search;
}

function syncUrl(state: ItemFilterState): void {
  const query = writeItemFilterStateToSearch(state);
  const next = query.length > 0 ? `?${query}` : window.location.pathname;
  window.history.replaceState(null, '', next);
}

export function initItemFilters(root: HTMLElement | null): void {
  if (!root) return;
  const cardEls = [
    ...root.querySelectorAll<HTMLElement>('[data-item-card]'),
  ];
  if (cardEls.length === 0) return;
  const cards = cardEls.map(readCardSnapshot);

  const state = readItemFilterStateFromSearch(window.location.search);

  const typeButtons = chipButtons(root, 'type');
  const rarityButtons = chipButtons(root, 'rarity');
  const magicToggle = root.querySelector<HTMLButtonElement>(
    '[data-filter-toggle="magic"]',
  );
  const attunementToggle = root.querySelector<HTMLButtonElement>(
    '[data-filter-toggle="attunement"]',
  );
  const consumableToggle = root.querySelector<HTMLButtonElement>(
    '[data-filter-toggle="consumable"]',
  );

  function render(): void {
    syncChipPressed(typeButtons, state.types);
    syncChipPressed(rarityButtons, state.rarities);
    syncToggle(magicToggle, state.magicOnly);
    syncToggle(attunementToggle, state.attunementOnly);
    syncToggle(consumableToggle, state.consumableOnly);
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

  function bindGroup(buttons: ChipButton[], set: Set<string>): void {
    for (const b of buttons) {
      b.addEventListener('click', () => {
        const v = b.getAttribute('data-filter-value');
        if (!v) return;
        toggleSet(set, v);
        render();
      });
    }
  }

  bindGroup(typeButtons, state.types);
  bindGroup(rarityButtons, state.rarities);

  magicToggle?.addEventListener('click', () => {
    state.magicOnly = !state.magicOnly;
    render();
  });
  attunementToggle?.addEventListener('click', () => {
    state.attunementOnly = !state.attunementOnly;
    render();
  });
  consumableToggle?.addEventListener('click', () => {
    state.consumableOnly = !state.consumableOnly;
    render();
  });

  const searchInput = root.querySelector<HTMLInputElement>(
    '[data-item-filter-search]',
  );
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      state.search = searchInput.value;
      render();
    });
  }

  const clearBtn = root.querySelector<HTMLButtonElement>(
    '[data-item-filter-clear]',
  );
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.search = '';
      state.types.clear();
      state.rarities.clear();
      state.magicOnly = false;
      state.attunementOnly = false;
      state.consumableOnly = false;
      render();
    });
  }

  render();
}
