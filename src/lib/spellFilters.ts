/**
 * Browser-side filter wiring for the player Spells list.
 *
 * The Astro page renders every published spell card up-front and tags each
 * card with the filterable fields as `data-*` attributes. The functions here
 * read/write the URL query string and toggle card visibility in place.
 *
 * Keep this module dependency-free so the bundled client script stays small.
 */

export type ConcentrationFilter = 'any' | 'with' | 'without';

export type SpellFilterState = {
  search: string;
  levels: Set<string>;
  schools: Set<string>;
  castingTypes: Set<string>;
  tags: Set<string>;
  classes: Set<string>;
  concentration: ConcentrationFilter;
  spellListId: string | null;
};

export type SpellListMembership = Record<string, string[]>;

const TAG_CLASS_QUERY_LIMIT = 16;

export function emptyFilterState(): SpellFilterState {
  return {
    search: '',
    levels: new Set(),
    schools: new Set(),
    castingTypes: new Set(),
    tags: new Set(),
    classes: new Set(),
    concentration: 'any',
    spellListId: null,
  };
}

export function slugifyName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

function lowerCsv(raw: string | null): string[] {
  return parseCsv(raw).map((s) => s.toLowerCase());
}

function clampConcentration(raw: string | null): ConcentrationFilter {
  const normalized = (raw ?? '').trim().toLowerCase();
  if (normalized === 'with') return 'with';
  if (normalized === 'without') return 'without';
  return 'any';
}

export function readFilterStateFromSearch(
  search: string,
  validSpellListIds?: Set<string>,
): SpellFilterState {
  const params = new URLSearchParams(search);
  const rawList = (params.get('list') ?? '').trim();
  const spellListId =
    rawList.length > 0 &&
    (validSpellListIds == null || validSpellListIds.has(rawList))
      ? rawList
      : null;
  return {
    search: (params.get('q') ?? '').trim(),
    levels: new Set(upperCsv(params.get('level'))),
    schools: new Set(upperCsv(params.get('school'))),
    castingTypes: new Set(upperCsv(params.get('casting'))),
    tags: new Set(lowerCsv(params.get('tag'))),
    classes: new Set(lowerCsv(params.get('class'))),
    concentration: clampConcentration(params.get('conc')),
    spellListId,
  };
}

export function writeFilterStateToSearch(state: SpellFilterState): string {
  const params = new URLSearchParams();
  if (state.search.trim().length > 0) {
    params.set('q', state.search.trim());
  }
  if (state.levels.size > 0) {
    params.set('level', [...state.levels].sort().join(','));
  }
  if (state.schools.size > 0) {
    params.set('school', [...state.schools].sort().join(','));
  }
  if (state.castingTypes.size > 0) {
    params.set('casting', [...state.castingTypes].sort().join(','));
  }
  if (state.tags.size > 0) {
    params.set('tag', [...state.tags].sort().join(','));
  }
  if (state.classes.size > 0) {
    params.set('class', [...state.classes].sort().join(','));
  }
  if (state.concentration !== 'any') {
    params.set('conc', state.concentration);
  }
  if (state.spellListId != null && state.spellListId.length > 0) {
    params.set('list', state.spellListId);
  }
  return params.toString();
}

export function hasActiveFilters(state: SpellFilterState): boolean {
  return (
    state.search.trim().length > 0 ||
    state.levels.size > 0 ||
    state.schools.size > 0 ||
    state.castingTypes.size > 0 ||
    state.tags.size > 0 ||
    state.classes.size > 0 ||
    state.concentration !== 'any' ||
    state.spellListId != null
  );
}

type CardSnapshot = {
  el: HTMLElement;
  spellId: string;
  level: string;
  school: string;
  castingType: string;
  concentration: boolean;
  tagSlugs: Set<string>;
  classSlugs: Set<string>;
  searchText: string;
};

function readCardSnapshot(el: HTMLElement): CardSnapshot {
  const tagAttr = el.getAttribute('data-tag-slugs') ?? '';
  const classAttr = el.getAttribute('data-class-slugs') ?? '';
  return {
    el,
    spellId: el.getAttribute('data-spell-id') ?? '',
    level: (el.getAttribute('data-level') ?? '').toUpperCase(),
    school: (el.getAttribute('data-school') ?? '').toUpperCase(),
    castingType: (el.getAttribute('data-casting-type') ?? '').toUpperCase(),
    concentration: el.getAttribute('data-concentration') === 'true',
    tagSlugs: new Set(
      tagAttr.split('|').map((s) => s.trim()).filter((s) => s.length > 0),
    ),
    classSlugs: new Set(
      classAttr.split('|').map((s) => s.trim()).filter((s) => s.length > 0),
    ),
    searchText: (el.getAttribute('data-search') ?? '').toLowerCase(),
  };
}

function matches(card: CardSnapshot, state: SpellFilterState): boolean {
  const q = state.search.trim().toLowerCase();
  if (q.length > 0 && !card.searchText.includes(q)) return false;
  if (state.levels.size > 0 && !state.levels.has(card.level)) return false;
  if (state.schools.size > 0 && !state.schools.has(card.school)) return false;
  if (
    state.castingTypes.size > 0 &&
    !state.castingTypes.has(card.castingType)
  ) {
    return false;
  }
  if (state.tags.size > 0) {
    let any = false;
    for (const t of state.tags) {
      if (card.tagSlugs.has(t)) {
        any = true;
        break;
      }
    }
    if (!any) return false;
  }
  if (state.classes.size > 0) {
    let any = false;
    for (const c of state.classes) {
      if (card.classSlugs.has(c)) {
        any = true;
        break;
      }
    }
    if (!any) return false;
  }
  if (state.concentration === 'with' && !card.concentration) return false;
  if (state.concentration === 'without' && card.concentration) return false;
  return true;
}

type ChipButton = HTMLButtonElement;

function chipButtons(
  root: ParentNode,
  group: string,
): ChipButton[] {
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

function syncConcentrationChips(
  buttons: ChipButton[],
  value: ConcentrationFilter,
): void {
  for (const b of buttons) {
    const v = b.getAttribute('data-filter-value') ?? '';
    b.setAttribute('aria-pressed', v === value ? 'true' : 'false');
  }
}

function applyFilterState(
  root: HTMLElement,
  cards: CardSnapshot[],
  state: SpellFilterState,
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
    'section[data-spell-section]',
  )) {
    const code = section.getAttribute('data-spell-section') ?? '';
    section.classList.toggle('is-hidden', !visibleSections.has(code));
  }
  return visible;
}

function syncResultCount(
  root: HTMLElement,
  total: number,
  visible: number,
  state: SpellFilterState,
): void {
  const countEl = root.querySelector<HTMLElement>('[data-spell-filter-count]');
  if (!countEl) return;
  const active = hasActiveFilters(state);
  if (!active) {
    countEl.textContent =
      total === 1 ? '1 spell' : `${total} spells`;
    return;
  }
  const label = visible === 1 ? '1 spell' : `${visible} spells`;
  countEl.textContent = `${label} match`;
}

function syncEmptyState(
  root: HTMLElement,
  visible: number,
  total: number,
): void {
  const empty = root.querySelector<HTMLElement>('[data-spell-empty]');
  if (!empty) return;
  empty.classList.toggle('is-hidden', !(total > 0 && visible === 0));
}

function syncClearButton(
  root: HTMLElement,
  state: SpellFilterState,
): void {
  const btn = root.querySelector<HTMLButtonElement>(
    '[data-spell-filter-clear]',
  );
  if (!btn) return;
  btn.disabled = !hasActiveFilters(state);
}

function syncSearchInput(
  root: HTMLElement,
  state: SpellFilterState,
): void {
  const input = root.querySelector<HTMLInputElement>(
    '[data-spell-filter-search]',
  );
  if (!input) return;
  if (input.value !== state.search) input.value = state.search;
}

function syncSpellListSelect(
  root: HTMLElement,
  state: SpellFilterState,
): void {
  const select = root.querySelector<HTMLSelectElement>(
    '[data-spell-filter-list]',
  );
  if (!select) return;
  const value = state.spellListId ?? '';
  if (select.value !== value) select.value = value;
}

function readSpellListMembership(root: HTMLElement): Map<string, Set<string>> {
  const raw = root.getAttribute('data-spell-list-membership');
  if (raw == null || raw.trim().length === 0) return new Map();
  try {
    const parsed = JSON.parse(raw) as SpellListMembership;
    const out = new Map<string, Set<string>>();
    for (const [listId, spellIds] of Object.entries(parsed)) {
      if (!Array.isArray(spellIds)) continue;
      out.set(
        listId,
        new Set(spellIds.filter((id) => typeof id === 'string' && id.length > 0)),
      );
    }
    return out;
  } catch {
    return new Map();
  }
}

function syncUrl(state: SpellFilterState): void {
  const query = writeFilterStateToSearch(state);
  const next = query.length > 0 ? `?${query}` : window.location.pathname;
  window.history.replaceState(null, '', next);
}

export function initSpellFilters(root: HTMLElement | null): void {
  if (!root) return;
  const cardEls = [
    ...root.querySelectorAll<HTMLElement>('[data-spell-card]'),
  ];
  if (cardEls.length === 0) return;
  const cards = cardEls.map(readCardSnapshot);

  const spellListMembership = readSpellListMembership(root);
  const validSpellListIds = new Set(spellListMembership.keys());
  const state = readFilterStateFromSearch(
    window.location.search,
    validSpellListIds,
  );

  const levelButtons = chipButtons(root, 'level');
  const schoolButtons = chipButtons(root, 'school');
  const castingButtons = chipButtons(root, 'casting');
  const tagButtons = chipButtons(root, 'tag');
  const classButtons = chipButtons(root, 'class');
  const concButtons = chipButtons(root, 'concentration');

  function render(): void {
    syncChipPressed(levelButtons, state.levels);
    syncChipPressed(schoolButtons, state.schools);
    syncChipPressed(castingButtons, state.castingTypes);
    syncChipPressed(tagButtons, state.tags);
    syncChipPressed(classButtons, state.classes);
    syncConcentrationChips(concButtons, state.concentration);
    syncSearchInput(root, state);
    syncSpellListSelect(root, state);
    const visible = applyFilterState(root, cards, state, spellListMembership);
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

  bindGroup(levelButtons, state.levels);
  bindGroup(schoolButtons, state.schools);
  bindGroup(castingButtons, state.castingTypes);
  bindGroup(tagButtons, state.tags);
  bindGroup(classButtons, state.classes);

  for (const b of concButtons) {
    b.addEventListener('click', () => {
      const v = (b.getAttribute('data-filter-value') ?? 'any') as
        | 'any'
        | 'with'
        | 'without';
      state.concentration = v;
      render();
    });
  }

  const searchInput = root.querySelector<HTMLInputElement>(
    '[data-spell-filter-search]',
  );
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      state.search = searchInput.value;
      render();
    });
  }

  const listSelect = root.querySelector<HTMLSelectElement>(
    '[data-spell-filter-list]',
  );
  if (listSelect) {
    listSelect.addEventListener('change', () => {
      const value = listSelect.value.trim();
      state.spellListId =
        value.length > 0 && validSpellListIds.has(value) ? value : null;
      render();
    });
  }

  const clearBtn = root.querySelector<HTMLButtonElement>(
    '[data-spell-filter-clear]',
  );
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.search = '';
      state.levels.clear();
      state.schools.clear();
      state.castingTypes.clear();
      state.tags.clear();
      state.classes.clear();
      state.concentration = 'any';
      state.spellListId = null;
      render();
    });
  }

  // Collapse tag/class groups when they would otherwise be very long. Items
  // beyond the limit are kept in the DOM behind a "Show all" toggle so the
  // filter strip does not dominate the page for big libraries.
  for (const groupName of ['tag', 'class'] as const) {
    const wrapper = root.querySelector<HTMLElement>(
      `[data-filter-collapsible="${groupName}"]`,
    );
    if (!wrapper) continue;
    const buttons = chipButtons(wrapper, groupName);
    if (buttons.length <= TAG_CLASS_QUERY_LIMIT) continue;
    const toggle = wrapper.querySelector<HTMLButtonElement>(
      '[data-filter-collapse-toggle]',
    );
    if (!toggle) continue;
    let expanded = false;
    const updateCollapsed = () => {
      for (let i = TAG_CLASS_QUERY_LIMIT; i < buttons.length; i++) {
        buttons[i].classList.toggle('is-hidden', !expanded);
      }
      toggle.textContent = expanded
        ? 'Show fewer'
        : `Show all (${buttons.length})`;
    };
    toggle.classList.remove('is-hidden');
    updateCollapsed();
    toggle.addEventListener('click', () => {
      expanded = !expanded;
      updateCollapsed();
    });
  }

  render();
}
