/** Build display HTML from exported record JSON (`payload.data`). */
export function htmlForRecord(
  recordType: string,
  data: Record<string, unknown>,
): string {
  const parts: string[] = [];

  const title =
    (typeof data.name === 'string' && data.name) ||
    (typeof data.title === 'string' && data.title) ||
    (typeof data.id === 'string' && data.id) ||
    'Record';
  parts.push(`<h1 class="record-title">${escapeHtml(title)}</h1>`);
  parts.push(`<p class="meta">${escapeHtml(recordType)}</p>`);

  const htmlSection = (label: string, html: string) => {
    if (!html.trim()) return;
    parts.push(
      `<section class="block"><h2>${escapeHtml(label)}</h2><div class="prose">${html}</div></section>`,
    );
  };

  const strField = (key: string) =>
    typeof data[key] === 'string' ? (data[key] as string) : '';

  htmlSection('Description', strField('description'));
  htmlSection('Higher levels', strField('forHigherLevels'));
  htmlSection('Quote', strField('quote'));
  htmlSection('Author line', strField('author'));
  htmlSection('Type reference', strField('typeReference'));

  const sections = data.sections;
  if (Array.isArray(sections)) {
    for (const s of sections) {
      if (!s || typeof s !== 'object') continue;
      const o = s as Record<string, unknown>;
      const t = typeof o.title === 'string' ? o.title : 'Section';
      const c = typeof o.contents === 'string' ? o.contents : '';
      htmlSection(t, c);
    }
  }

  const traits = data.traits;
  if (Array.isArray(traits)) {
    for (const tr of traits) {
      if (!tr || typeof tr !== 'object') continue;
      const o = tr as Record<string, unknown>;
      const n = typeof o.name === 'string' ? o.name : 'Trait';
      const d = typeof o.description === 'string' ? o.description : '';
      htmlSection(n, d);
    }
  }

  const asset = data.playerSiteAssetUrl;
  if (typeof asset === 'string' && asset.length > 0) {
    const name = typeof data.name === 'string' ? data.name : 'File';
    parts.push(
      `<section class="block"><h2>Download</h2><p><a href="${escapeAttr(asset)}">${escapeHtml(name)}</a></p></section>`,
    );
  }

  if (parts.length <= 2) {
    parts.push(
      '<p class="empty">No player-facing body fields were detected for this record type.</p>',
    );
  }

  return parts.join('\n');
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replaceAll('\n', ' ');
}
