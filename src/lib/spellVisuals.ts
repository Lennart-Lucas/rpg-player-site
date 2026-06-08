/** Visual helpers shared by the spells list and detail pages. */

const SPELL_LEVEL_ORDER: Record<string, number> = {
  CANTRIP: 0,
  FIRST: 1,
  SECOND: 2,
  THIRD: 3,
  FOURTH: 4,
  FIFTH: 5,
  SIXTH: 6,
  SEVENTH: 7,
  EIGHTH: 8,
  NINTH: 9,
};

/** Short label used in headers and sub-band, mirrors `SpellLevel.displayName`. */
const SPELL_LEVEL_LABELS: Record<string, string> = {
  CANTRIP: 'Cantrip',
  FIRST: '1st',
  SECOND: '2nd',
  THIRD: '3rd',
  FOURTH: '4th',
  FIFTH: '5th',
  SIXTH: '6th',
  SEVENTH: '7th',
  EIGHTH: '8th',
  NINTH: '9th',
};

/** Section header label used by the list page grouping. */
const SPELL_LEVEL_GROUP_LABELS: Record<string, string> = {
  CANTRIP: 'Cantrips',
  FIRST: '1st level',
  SECOND: '2nd level',
  THIRD: '3rd level',
  FOURTH: '4th level',
  FIFTH: '5th level',
  SIXTH: '6th level',
  SEVENTH: '7th level',
  EIGHTH: '8th level',
  NINTH: '9th level',
};

const SPELL_SCHOOL_LABELS: Record<string, string> = {
  ABJURATION: 'Abjuration',
  CONJURATION: 'Conjuration',
  DIVINATION: 'Divination',
  ENCHANTMENT: 'Enchantment',
  EVOCATION: 'Evocation',
  ILLUSION: 'Illusion',
  NECROMANCY: 'Necromancy',
  TRANSMUTATION: 'Transmutation',
};

const SPELL_DURATION_LABELS: Record<string, string> = {
  INSTANTANEOUS: 'Instantaneous',
  ONE_ROUND: '1 round',
  ONE_MINUTE: '1 minute',
  TEN_MINUTES: '10 minutes',
  ONE_HOUR: '1 hour',
  EIGHT_HOURS: '8 hours',
  TWENTY_FOUR_HOURS: '24 hours',
};

const SPELL_RANGE_LABELS: Record<string, string> = {
  TOUCH: 'Touch',
  SELF: 'Self',
  FIVE_FEET: '5 feet',
  TEN_FEET: '10 feet',
  SELF_15_FEET: 'Self (15 feet)',
  SELF_30_FEET: 'Self (30 feet)',
  THIRTY_FEET: '30 feet',
  FORTY_FEET: '40 feet',
  SIXTY_FEET: '60 feet',
  NINETY_FEET: '90 feet',
  ONE_HUNDRED_TWENTY_FEET: '120 feet',
};

const SPELL_CASTING_TYPE_LABELS: Record<string, string> = {
  ACTION: 'Action',
  BONUS_ACTION: 'Bonus Action',
  REACTION: 'Reaction',
  MINUTES: 'Minute(s)',
  HOURS: 'Hour(s)',
};

function normalizeUpper(code: string | null | undefined): string {
  return (code ?? '').trim().toUpperCase();
}

export function spellLevelOrder(code: string | null | undefined): number {
  return SPELL_LEVEL_ORDER[normalizeUpper(code)] ?? 99;
}

export function spellLevelLabel(code: string | null | undefined): string {
  return SPELL_LEVEL_LABELS[normalizeUpper(code)] ?? (code ?? '');
}

export function spellLevelGroupLabel(code: string | null | undefined): string {
  return SPELL_LEVEL_GROUP_LABELS[normalizeUpper(code)] ?? spellLevelLabel(code);
}

export function spellSchoolLabel(code: string | null | undefined): string {
  return SPELL_SCHOOL_LABELS[normalizeUpper(code)] ?? (code ?? '');
}

export function spellDurationLabel(code: string | null | undefined): string {
  return SPELL_DURATION_LABELS[normalizeUpper(code)] ?? (code ?? '');
}

export function spellRangeLabel(code: string | null | undefined): string {
  return SPELL_RANGE_LABELS[normalizeUpper(code)] ?? (code ?? '');
}

export function spellCastingTypeLabel(
  code: string | null | undefined,
): string {
  return SPELL_CASTING_TYPE_LABELS[normalizeUpper(code)] ?? (code ?? '');
}

/**
 * Inline SVG path bodies for the 8 schools, mirroring `SpellSchoolIcons.listIcon`
 * (`shield_outlined`, `water_drop_outlined`, `visibility_outlined`,
 * `favorite_border`, `bolt_outlined`, `blur_on_outlined`, `dark_mode_outlined`,
 * `science_outlined`). Wrap via [spellSchoolIconSvg].
 */
const SPELL_SCHOOL_ICON_PATHS: Record<string, string> = {
  ABJURATION:
    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
  CONJURATION:
    '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  DIVINATION:
    '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  ENCHANTMENT:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>',
  EVOCATION:
    '<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/>',
  ILLUSION:
    '<circle cx="6" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18" cy="12" r="2"/><circle cx="9" cy="7" r="1.5"/><circle cx="15" cy="7" r="1.5"/><circle cx="9" cy="17" r="1.5"/><circle cx="15" cy="17" r="1.5"/>',
  NECROMANCY:
    '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  TRANSMUTATION:
    '<path d="M9 3a3 3 0 1 0 0 6"/><path d="M15 21a3 3 0 1 0 0-6"/><path d="M4.5 14a8.5 8.5 0 0 1 15-5"/><path d="M19.5 10a8.5 8.5 0 0 1-15 5"/>',
};

const FALLBACK_SCHOOL_ICON_PATHS =
  '<path d="M19.5 8.5 12 3 4.5 8.5V20a1 1 0 0 0 1 1H10v-6h4v6h4.5a1 1 0 0 0 1-1Z"/><path d="M9 14h6"/>';

export function spellSchoolIconPaths(code: string | null | undefined): string {
  return SPELL_SCHOOL_ICON_PATHS[normalizeUpper(code)] ?? FALLBACK_SCHOOL_ICON_PATHS;
}

export function spellSchoolIconSvg(code: string | null | undefined): string {
  const paths = spellSchoolIconPaths(code);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function componentAbbrev(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'verbal') return 'V';
  if (normalized === 'somatic') return 'S';
  if (normalized === 'material') return 'M';
  return value.trim();
}

/** Mirrors `_spellComponentsLine` — `V, S, M (material)` or `None`. */
export function spellComponentsLine(
  components: readonly string[] | null | undefined,
  materialDescription: string | null | undefined,
): string {
  const list = (components ?? []).filter((c) => c.trim().length > 0);
  const base = list.length === 0 ? 'None' : list.map(componentAbbrev).join(', ');
  const hasMaterial = list
    .map((c) => c.trim().toLowerCase())
    .includes('material');
  const mat = (materialDescription ?? '').trim();
  return hasMaterial && mat.length > 0 ? `${base} (${mat})` : base;
}

/** Mirrors `_spellCastingAndRangeValue` — `<time> <type>[ (<trigger>)] · <range>`. */
export function spellCastingAndRangeText(args: {
  castingTime: number | null | undefined;
  castingType: string | null | undefined;
  reactionTrigger: string | null | undefined;
  range: string | null | undefined;
}): string {
  const time = typeof args.castingTime === 'number' ? args.castingTime : 0;
  const typeLabel = spellCastingTypeLabel(args.castingType);
  let casting = `${time} ${typeLabel}`.trim();
  const trig = (args.reactionTrigger ?? '').trim();
  if (normalizeUpper(args.castingType) === 'REACTION' && trig.length > 0) {
    casting = `${casting} (${trig})`;
  }
  return `${casting} \u00b7 ${spellRangeLabel(args.range)}`;
}

/** Mirrors `_spellDurationCardDisplay` — appends ` (C)` and `Up to ...` when relevant. */
export function spellDurationCardDisplay(args: {
  duration: string | null | undefined;
  concentration: boolean;
}): string {
  const display = spellDurationLabel(args.duration);
  if (!args.concentration) return display;
  const upper = normalizeUpper(args.duration);
  if (upper === 'INSTANTANEOUS') return `${display} (C)`;
  return `Up to ${display} (C)`;
}

/** Sub-band string: `"<Level> · <School>[ · <tags>]"`. */
export function spellHeaderSummary(args: {
  level: string | null | undefined;
  school: string | null | undefined;
  tagNames: readonly string[] | null | undefined;
}): string {
  const parts = [spellLevelLabel(args.level), spellSchoolLabel(args.school)]
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const tags = (args.tagNames ?? [])
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (tags.length > 0) parts.push(tags.join(', '));
  return parts.join(' \u00b7 ');
}

export function spellRulesContentFromRecord(args: {
  description: string | null | undefined;
  forHigherLevels: string | null | undefined;
}): string {
  const desc = (args.description ?? '').trim();
  const higher = (args.forHigherLevels ?? '').trim();
  const higherBlock =
    higher.length === 0 ? '' : `<strong>At Higher Levels:</strong> ${higher}`;
  if (higherBlock.length === 0) return desc;
  if (desc.length === 0) return higherBlock;
  return `${desc}<br>${higherBlock}`;
}

/** Strip HTML tags to a plain string (used for list-card previews). */
export function stripSpellHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>(\s*)/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Two-line description preview (HTML stripped) for list cards. */
export function spellDescriptionPreview(
  html: string | null | undefined,
  maxChars = 180,
): string {
  const plain = stripSpellHtml(html);
  if (plain.length <= maxChars) return plain;
  return `${plain.slice(0, maxChars - 1).trimEnd()}\u2026`;
}
