/**
 * Format exported card body HTML for the player site.
 *
 * Mirrors bullet / ordered-list handling in
 * `lib/features/shared/widgets/styled_record_rich_text.dart` (Flutter app).
 * Exported descriptions use `<br>` line breaks and markdown-like `*` bullets.
 */

const BULLET_LINE = /^\s*[-*]\s+(.*)$/;
const ORDERED_LINE = /^\s*(\d+)\.\s+(.*)$/;
const INLINE_MARKDOWN =
  /(\*\*[^*]+\*\*|\+\+[^+]+\+\+|_[^_]+_)/g;

/** Mirrors `anvilInlineMarkdownSpans` — `**bold**`, `_italic_`, `++underline++`. */
export function applyInlineMarkdownHtml(text: string): string {
  return text.replace(INLINE_MARKDOWN, (match) => {
    if (match.startsWith('**') && match.endsWith('**') && match.length > 4) {
      return `<strong>${match.slice(2, -2)}</strong>`;
    }
    if (match.startsWith('++') && match.endsWith('++') && match.length > 4) {
      return `<u>${match.slice(2, -2)}</u>`;
    }
    if (match.startsWith('_') && match.endsWith('_') && match.length > 2) {
      return `<em>${match.slice(1, -1)}</em>`;
    }
    return match;
  });
}

function normalizeToLines(html: string): string[] {
  return html
    // Export uses `<br>\n` between lines; eat trailing whitespace so we do not
    // insert spurious blank lines that would split one bullet list into many.
    .replace(/<br\s*\/?>\s*/gi, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n');
}

function flushBullets(buffer: string[], out: string[]): void {
  if (buffer.length === 0) return;
  out.push(
    `<ul class="card-body-list">${buffer.map((item) => `<li>${item}</li>`).join('')}</ul>`,
  );
  buffer.length = 0;
}

function flushOrdered(
  buffer: { index: string; content: string }[],
  out: string[],
): void {
  if (buffer.length === 0) return;
  out.push(
    `<ol class="card-body-list">${buffer.map((item) => `<li value="${item.index}">${item.content}</li>`).join('')}</ol>`,
  );
  buffer.length = 0;
}

/**
 * Turn `<br>`-separated lines with `*` / `-` / `1.` prefixes into semantic HTML.
 * Existing inline markup (links, spans) inside each line is preserved.
 */
export function formatCardBodyHtml(html: string | null | undefined): string {
  const raw = (html ?? '').trim();
  if (!raw) return '';

  const lines = normalizeToLines(raw);
  const out: string[] = [];
  const bulletBuffer: string[] = [];
  const orderedBuffer: { index: string; content: string }[] = [];

  const flushAll = (): void => {
    flushBullets(bulletBuffer, out);
    flushOrdered(orderedBuffer, out);
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushAll();
      continue;
    }

    const bullet = BULLET_LINE.exec(line);
    if (bullet) {
      flushOrdered(orderedBuffer, out);
      bulletBuffer.push(applyInlineMarkdownHtml(bullet[1] ?? ''));
      continue;
    }

    const ordered = ORDERED_LINE.exec(line);
    if (ordered) {
      flushBullets(bulletBuffer, out);
      orderedBuffer.push({
        index: ordered[1] ?? '1',
        content: applyInlineMarkdownHtml(ordered[2] ?? ''),
      });
      continue;
    }

    flushAll();
    out.push(`<p>${applyInlineMarkdownHtml(trimmed)}</p>`);
  }

  flushAll();
  return out.join('');
}
