/**
 * Mirrors `packages/player_site_export/lib/html_linkify.dart` so the Astro site
 * can turn `[[recordType/recordId]]` (and legacy `@type/id`) into links when
 * export did not pre-linkify a field (e.g. location section bodies).
 */

const _legacyRefPattern = /^@([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/;
const _canonicalTargetPattern = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/;

type RefToken = {
  recordType: string;
  recordId: string;
  start: number;
  end: number;
  raw: string;
  alias: string | null;
};

function playerSiteEscapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function newlinesToBr(s: string): string {
  return s.replaceAll('\n', '<br>\n');
}

function escapeHrefAttr(s: string): string {
  return playerSiteEscapeHtml(s).replaceAll('\n', ' ');
}

export function playerSiteRecordPath(
  recordType: string,
  recordId: string,
): string {
  const t = encodeURIComponent(recordType);
  const i = encodeURIComponent(recordId);
  return `/records/${t}/${i}/`;
}

function parseBracketToken(text: string, start: number): RefToken | null {
  const close = text.indexOf(']]', start + 2);
  if (close < 0) return null;
  const inner = text.slice(start + 2, close);
  if (inner.trim().length === 0) return null;
  const pipe = inner.indexOf('|');
  const target = (pipe >= 0 ? inner.slice(0, pipe) : inner).trim();
  if (!_canonicalTargetPattern.test(target)) return null;
  const slash = target.indexOf('/');
  return {
    recordType: target.slice(0, slash),
    recordId: target.slice(slash + 1),
    start,
    end: close + 2,
    raw: text.slice(start, close + 2),
    alias: pipe >= 0 ? inner.slice(pipe + 1).trim() : null,
  };
}

function parseRefs(text: string): RefToken[] {
  if (text.length === 0) return [];
  const out: RefToken[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    const bracketStart = text.indexOf('[[', cursor);
    const legacyStart = text.indexOf('@', cursor);

    let nextStart = -1;
    let parseBracket = false;
    if (
      bracketStart >= 0 &&
      (legacyStart < 0 || bracketStart <= legacyStart)
    ) {
      nextStart = bracketStart;
      parseBracket = true;
    } else if (legacyStart >= 0) {
      nextStart = legacyStart;
    }
    if (nextStart < 0) break;

    if (parseBracket) {
      const token = parseBracketToken(text, nextStart);
      if (token != null) {
        out.push(token);
        cursor = token.end;
        continue;
      }
      cursor = nextStart + 2;
      continue;
    }

    const slice = text.slice(nextStart);
    const match = slice.match(_legacyRefPattern);
    if (match == null || match.index !== 0) {
      cursor = nextStart + 1;
      continue;
    }
    out.push({
      recordType: match[1]!,
      recordId: match[2]!,
      start: nextStart,
      end: nextStart + match[0].length,
      raw: match[0],
      alias: null,
    });
    cursor = nextStart + match[0].length;
  }
  return out;
}

/**
 * When the string has no record references, returns it unchanged (may already
 * be HTML from export). Otherwise matches Dart `playerSiteHtmlLinkify`.
 */
export function enrichWithRecordLinks(
  text: string,
  isPublished: (recordType: string, recordId: string) => boolean,
): string {
  if (!text) return text;
  const tokens = parseRefs(text);
  if (tokens.length === 0) return text;

  const buf: string[] = [];
  let cursor = 0;
  for (const t of tokens) {
    buf.push(
      newlinesToBr(playerSiteEscapeHtml(text.slice(cursor, t.start))),
    );
    const linkText =
      t.alias != null && t.alias.trim().length > 0 ? t.alias.trim() : t.raw;
    if (isPublished(t.recordType, t.recordId)) {
      const href = playerSiteRecordPath(t.recordType, t.recordId);
      buf.push(
        `<a href="${escapeHrefAttr(href)}">${playerSiteEscapeHtml(linkText)}</a>`,
      );
    } else {
      buf.push(
        '<span class="unpublished-ref" title="This note is not on the player site">',
        `${playerSiteEscapeHtml(linkText)}`,
        '</span>',
      );
    }
    cursor = t.end;
  }
  buf.push(newlinesToBr(playerSiteEscapeHtml(text.slice(cursor))));
  return buf.join('');
}
