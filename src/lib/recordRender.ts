/** Build display HTML from exported record JSON (`payload.data`). */
export function htmlForRecord(
  recordType: string,
  data: Record<string, unknown>,
): string {
  if (recordType === 'session') {
    return htmlForSessionRecord(data);
  }
  const parts: string[] = [];

  const title =
    (typeof data.name === 'string' && data.name) ||
    (typeof data.title === 'string' && data.title) ||
    (typeof data.id === 'string' && data.id) ||
    'Record';
  parts.push(`<h1 class="record-title">${escapeHtml(title)}</h1>`);
  parts.push(`<p class="meta">${escapeHtml(recordType)}</p>`);

  if (recordType === 'campaign') {
    const ids = data.characterIds;
    const n = Array.isArray(ids) ? ids.length : 0;
    const rosterLine =
      n > 0
        ? `${n} linked character(s). Character sheets and lore pages appear here only if you add those records to the player site manifest in RPG Manager (Settings → Player site).`
        : 'No characters linked on this campaign yet.';
    parts.push(
      `<section class="block"><h2>Player site</h2><div class="prose"><p>${escapeHtml(
        rosterLine,
      )}</p><p>Campaign records do not include a long description field; publish locations, NPCs, or other notes from the manifest for players to read.</p></div></section>`,
    );
  }

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

function htmlForSessionRecord(data: Record<string, unknown>): string {
  const parts: string[] = [];
  const id = typeof data.id === 'string' ? data.id : 'session';
  const short = id.includes('_') ? (id.split('_').pop() ?? id) : id;
  parts.push(`<h1 class="record-title">${escapeHtml(`Session ${short}`)}</h1>`);
  parts.push(`<p class="meta">session</p>`);
  const plannedRaw = data.plannedAt;
  if (typeof plannedRaw === 'string' && plannedRaw.trim().length > 0) {
    const dt = new Date(plannedRaw);
    if (!Number.isNaN(dt.getTime())) {
      parts.push(
        `<section class="block"><h2>Planned</h2><div class="prose"><p>${escapeHtml(
          dt.toISOString().slice(0, 16).replace('T', ' '),
        )} UTC</p></div></section>`,
      );
    }
  }
  const notes = typeof data.notes === 'string' ? data.notes : '';
  if (notes.trim().length > 0) {
    parts.push(
      `<section class="block"><h2>Notes</h2><div class="prose">${notes}</div></section>`,
    );
  }
  if (parts.length <= 2) {
    parts.push('<p class="empty">No session notes.</p>');
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
