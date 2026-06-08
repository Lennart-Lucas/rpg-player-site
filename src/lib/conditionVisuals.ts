/** Visual helpers shared by the conditions list and detail pages. */

const HEX6 = /^([0-9a-fA-F]{6})$/;
const HEX8 = /^([0-9a-fA-F]{8})$/;

/**
 * Normalize a stored color string into a `#RRGGBB` CSS color.
 * Accepts `#RRGGBB`, `RRGGBB`, `0xRRGGBB`, and `#RRGGBBAA` (alpha discarded).
 */
export function conditionAccentHex(
  raw: string | null | undefined,
  fallback = '#8ab4f8',
): string {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return fallback;
  let hex = trimmed;
  if (hex.startsWith('#')) hex = hex.slice(1);
  else if (hex.toLowerCase().startsWith('0x')) hex = hex.slice(2);
  if (HEX8.test(hex)) return `#${hex.slice(0, 6).toUpperCase()}`;
  if (HEX6.test(hex)) return `#${hex.toUpperCase()}`;
  return fallback;
}

/**
 * Convert a `#RRGGBB` accent into a slightly darker variant for the sub-band,
 * mirroring `_darkerVariant` in `condition_sheet.dart`.
 */
export function darkenHex(hex: string, amount = 0.12): string {
  const value = conditionAccentHex(hex);
  const r = parseInt(value.slice(1, 3), 16);
  const g = parseInt(value.slice(3, 5), 16);
  const b = parseInt(value.slice(5, 7), 16);
  const factor = Math.max(0, 1 - amount);
  const out = (n: number): string => {
    const v = Math.max(0, Math.min(255, Math.round(n * factor)));
    return v.toString(16).padStart(2, '0');
  };
  return `#${out(r)}${out(g)}${out(b)}`.toUpperCase();
}

/** Pick a readable foreground (black/white) for a `#RRGGBB` background. */
export function readableForeground(hex: string): string {
  const value = conditionAccentHex(hex);
  const r = parseInt(value.slice(1, 3), 16) / 255;
  const g = parseInt(value.slice(3, 5), 16) / 255;
  const b = parseInt(value.slice(5, 7), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6 ? '#0f1115' : '#ffffff';
}

const RARITY_LABELS: Record<string, string> = {
  COMMON: 'Common',
  UNCOMMON: 'Uncommon',
  RARE: 'Rare',
};

export function conditionRarityLabel(code: string | null | undefined): string {
  const key = (code ?? '').trim().toUpperCase();
  return RARITY_LABELS[key] ?? (code ?? '');
}

/**
 * Inline SVG path content (no wrapping <svg>) keyed by the same legacy icon
 * names / condition names that `ConditionRecord.iconForName` resolves in Dart.
 * Falls back to a heart-pulse glyph (mirrors `Icons.healing_outlined`).
 */
const ICON_PATHS: Record<string, string> = {
  air_outlined:
    '<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>',
  block_outlined:
    '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
  bedtime_outlined:
    '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  psychology_outlined:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>',
  pan_tool_outlined:
    '<path d="M18 11V6a2 2 0 1 0-4 0v0"/><path d="M14 10V4a2 2 0 1 0-4 0v2"/><path d="M10 10.5V6a2 2 0 1 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  hearing_disabled_outlined:
    '<path d="M6 18.5a3.5 3.5 0 1 0 7 0c0-1.57.92-2.52 2.04-3.46"/><path d="M6 8.5c0-.74.13-1.47.4-2.16"/><path d="M9.79 2.41c4.39-.36 7.74 3.6 6.7 8.36"/><path d="m2 2 20 20"/><path d="M11 8a3 3 0 0 1 1.5.39"/>',
  visibility_off_outlined:
    '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="m2 2 20 20"/>',
  mode_night_outlined:
    '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  sick_outlined:
    '<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>',
  fitness_center_outlined:
    '<path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"/>',
};

const NAME_ALIASES: Record<string, string> = {
  blinded: 'air_outlined',
  restrained: 'block_outlined',
  unconscious: 'bedtime_outlined',
  charmed: 'psychology_outlined',
  grappled: 'pan_tool_outlined',
  deafened: 'hearing_disabled_outlined',
  invisible: 'visibility_off_outlined',
  frightened: 'mode_night_outlined',
  poisoned: 'sick_outlined',
  exhaustion: 'fitness_center_outlined',
};

const HEALING_FALLBACK =
  '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>';

/** Inline SVG path content for a condition icon. */
export function conditionIconPaths(
  iconKey: string | null | undefined,
  nameFallback: string | null | undefined,
): string {
  const key = (iconKey ?? '').trim().toLowerCase();
  if (key && ICON_PATHS[key]) return ICON_PATHS[key];
  if (key && NAME_ALIASES[key]) return ICON_PATHS[NAME_ALIASES[key]];
  const name = (nameFallback ?? '').trim().toLowerCase();
  if (name && NAME_ALIASES[name]) return ICON_PATHS[NAME_ALIASES[name]];
  return HEALING_FALLBACK;
}

/** Wrap path content in a 24×24 stroke SVG with rounded joins. */
export function conditionIconSvg(
  iconKey: string | null | undefined,
  nameFallback: string | null | undefined,
): string {
  const paths = conditionIconPaths(iconKey, nameFallback);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

const BULLET_LINE = /^\s*[-*]\s+(.*)$/;

function stripDescriptionHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>\s*/gi, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Plain-text condition body with `*` / `-` lines shown as `•` bullets.
 * Used for card previews and search indexing on the mechanics list page.
 */
export function plainTextFromDescriptionHtml(
  html: string | null | undefined,
): string {
  const stripped = stripDescriptionHtml((html ?? '').trim());
  if (!stripped) return '';

  return stripped
    .split('\n')
    .map((line) => {
      const normalized = line.replace(/\r/g, '').trim();
      if (!normalized) return '';
      const bullet = BULLET_LINE.exec(normalized);
      if (bullet) return `• ${(bullet[1] ?? '').trim()}`;
      return normalized;
    })
    .filter((line) => line.length > 0)
    .join('\n')
    .trim();
}

function truncatePlainText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const slice = text.slice(0, maxChars);
  const lastBreak = slice.lastIndexOf('\n');
  const cut =
    lastBreak > maxChars * 0.45 ? slice.slice(0, lastBreak) : slice;
  return `${cut.trimEnd()}…`;
}

/** Truncated plain-text preview for condition cards on `/mechanics/conditions`. */
export function conditionCardPreviewText(
  html: string | null | undefined,
  maxChars = 520,
): string {
  const text = plainTextFromDescriptionHtml(html);
  if (!text) return '';
  return truncatePlainText(text, maxChars);
}

/**
 * Strip HTML tags from a description blob and clamp to `maxChars` for use as a
 * 2-line preview on a list card.
 */
export function conditionDescriptionPreview(
  html: string | null | undefined,
  maxChars = 180,
): string {
  const text = plainTextFromDescriptionHtml(html);
  if (!text) return '';
  return truncatePlainText(text, maxChars);
}
