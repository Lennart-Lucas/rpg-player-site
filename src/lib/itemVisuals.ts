/** Visual helpers shared by the items list and detail pages. */

const ITEM_TYPE_ORDER: Record<string, number> = {
  armor: 0,
  shield: 1,
  weapon: 2,
  equipment: 3,
  tool: 4,
  potion: 5,
  scroll: 6,
  book: 7,
  ring: 8,
  rod: 9,
  stave: 10,
  wand: 11,
  wondrous_item: 12,
};

/** Singular type label, mirrors `ItemType.label` in the app. */
const ITEM_TYPE_LABELS: Record<string, string> = {
  armor: 'Armor',
  shield: 'Shield',
  weapon: 'Weapon',
  equipment: 'Equipment',
  tool: 'Tool',
  potion: 'Potion',
  scroll: 'Scroll',
  book: 'Book',
  ring: 'Ring',
  rod: 'Rod',
  stave: 'Stave',
  wand: 'Wand',
  wondrous_item: 'Wondrous Item',
};

/** Plural / group label used as the section header on the items list page. */
const ITEM_TYPE_GROUP_LABELS: Record<string, string> = {
  armor: 'Armor',
  shield: 'Shield',
  weapon: 'Weapons',
  equipment: 'Equipment',
  tool: 'Tools',
  potion: 'Potions',
  scroll: 'Scrolls',
  book: 'Books',
  ring: 'Rings',
  rod: 'Rods',
  stave: 'Staves',
  wand: 'Wands',
  wondrous_item: 'Wondrous Items',
};

const ITEM_RARITY_LABELS: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  very_rare: 'Very Rare',
  ledgendary: 'Legendary',
  artifact: 'Artifact',
};

export function itemTypeOrder(code: string | null | undefined): number {
  const key = (code ?? '').trim().toLowerCase();
  return ITEM_TYPE_ORDER[key] ?? 99;
}

export function itemTypeLabel(code: string | null | undefined): string {
  const key = (code ?? '').trim().toLowerCase();
  return ITEM_TYPE_LABELS[key] ?? (code ?? '');
}

export function itemTypeGroupLabel(code: string | null | undefined): string {
  const key = (code ?? '').trim().toLowerCase();
  return ITEM_TYPE_GROUP_LABELS[key] ?? itemTypeLabel(code);
}

export function itemRarityLabel(code: string | null | undefined): string {
  const key = (code ?? '').trim().toLowerCase();
  return ITEM_RARITY_LABELS[key] ?? (code ?? '');
}

/**
 * Inline SVG path bodies for each item type, mirroring the Material icons used
 * by `ItemTypeIcons.listIcon` in the Flutter app. Consumers wrap these in a
 * 24x24 stroked svg via [itemTypeIconSvg].
 */
const ITEM_TYPE_ICON_PATHS: Record<string, string> = {
  armor:
    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
  shield:
    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
  book:
    '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  scroll:
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>',
  equipment:
    '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  potion:
    '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>',
  ring: '<circle cx="12" cy="12" r="8"/>',
  rod:
    '<path d="M4 4v16"/><path d="M12 4v16"/><path d="M20 4v16"/>',
  stave:
    '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
  wand:
    '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  tool:
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 1 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  weapon:
    '<path d="m14 13-7.5 7.5a2.12 2.12 0 1 1-3-3L11 10"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/>',
  wondrous_item:
    '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
};

const FALLBACK_ITEM_ICON_PATHS =
  '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>';

export function itemTypeIconPaths(code: string | null | undefined): string {
  const key = (code ?? '').trim().toLowerCase();
  return ITEM_TYPE_ICON_PATHS[key] ?? FALLBACK_ITEM_ICON_PATHS;
}

export function itemTypeIconSvg(code: string | null | undefined): string {
  const paths = itemTypeIconPaths(code);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function formatGpAmount(value: number): string {
  return value.toLocaleString('en-US');
}

/** Mirrors `_suggestedGoldRangeForRarity` in `item_sheet.dart`. */
export function suggestedGoldRangeForRarity(
  code: string | null | undefined,
): string {
  const key = (code ?? '').trim().toLowerCase();
  switch (key) {
    case 'common':
      return `${formatGpAmount(50)} \u2013 ${formatGpAmount(100)} gp`;
    case 'uncommon':
      return `${formatGpAmount(101)} \u2013 ${formatGpAmount(500)} gp`;
    case 'rare':
      return `${formatGpAmount(501)} \u2013 ${formatGpAmount(5000)} gp`;
    case 'very_rare':
      return `${formatGpAmount(5001)} \u2013 ${formatGpAmount(50000)} gp`;
    case 'ledgendary':
    case 'artifact':
      return `${formatGpAmount(50001)}+ gp`;
    default:
      return '';
  }
}

export type ItemFlagSummary = {
  rarity: string;
  magic: boolean;
  consumable: boolean;
  requiresAttunement: boolean;
};

/** Subtitle row: rarity then Magic / Attunement / Consumable flags. */
export function itemSubtitleText(item: ItemFlagSummary): string {
  const parts: string[] = [itemRarityLabel(item.rarity)];
  if (item.magic) parts.push('Magic');
  if (item.requiresAttunement) parts.push('Attunement');
  if (item.consumable) parts.push('Consumable');
  return parts.filter((p) => p.length > 0).join(' \u00b7 ');
}

/** Strip HTML tags to a plain string (used for typeReference cell). */
export function stripItemHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
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

/** Mirrors `_detailsColumn` in `ItemListItemCard`. */
export function itemDetailsColumnText(args: {
  typeReference: string | null | undefined;
  magic: boolean;
  consumable: boolean;
  requiresAttunement: boolean;
}): string {
  const refRaw = stripItemHtml(args.typeReference);
  if (refRaw.length > 0) return refRaw;
  const parts: string[] = [];
  if (args.magic) parts.push('Magic');
  if (args.requiresAttunement) parts.push('Attunement');
  if (args.consumable) parts.push('Consumable');
  return parts.length === 0 ? '\u2014' : parts.join(' \u00b7 ');
}

/** Two-line description preview (HTML stripped) for list cards. */
export function itemDescriptionPreview(
  html: string | null | undefined,
  maxChars = 180,
): string {
  const plain = stripItemHtml(html);
  if (plain.length <= maxChars) return plain;
  return `${plain.slice(0, maxChars - 1).trimEnd()}\u2026`;
}
