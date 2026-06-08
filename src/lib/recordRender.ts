import { applyInlineMarkdownHtml } from './cardBodyHtml';
import { creatureTypeIconSvg } from './creatureIcons';
import { enrichWithRecordLinks } from './htmlLinkify';

/** Row from `locations-index.json` (used for hierarchy links on location pages). */
export type LocationIndexEntry = {
  id: string;
  name: string;
  locationType: string;
  parentLocationId: string | null;
};

/** Row from `creatures-index.json` (used for hierarchy links on creature pages). */
export type CreatureIndexEntry = {
  id: string;
  name: string;
  parentCreatureTypeId: string | null;
  size: string;
};

export type HtmlForRecordOptions = {
  locationIndexById?: Map<string, LocationIndexEntry>;
  creatureIndexById?: Map<string, CreatureIndexEntry>;
  /**
   * When set, location quote / section bodies still containing `[[type/id]]`
   * (or legacy `@type/id`) are turned into links if the target record JSON
   * exists under `public/rpg-export/records/`.
   */
  recordJsonExists?: (recordType: string, recordId: string) => boolean;
  /** Resolve a published record's display name (e.g. language rows). */
  resolveRecordName?: (recordType: string, recordId: string) => string | null;
};

/** Build display HTML from exported record JSON (`payload.data`). */
export function htmlForRecord(
  recordType: string,
  data: Record<string, unknown>,
  options?: HtmlForRecordOptions,
): string {
  if (recordType === 'session') {
    return htmlForSessionRecord(data);
  }
  if (recordType === 'location') {
    return htmlForLocationRecord(
      data,
      options?.locationIndexById ?? new Map(),
      options?.recordJsonExists,
    );
  }
  if (recordType === 'creature_type') {
    return htmlForCreatureTypeRecord(
      data,
      options?.creatureIndexById ?? new Map(),
      options?.recordJsonExists,
      options?.resolveRecordName,
    );
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

  if (recordType !== 'location') {
    htmlSection('Description', strField('description'));
  }
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

const LOCATION_TYPE_LABELS: Record<string, string> = {
  continent: 'Continent',
  nation: 'Nation',
  region: 'Region',
  city: 'City',
  village: 'Village',
  district: 'District',
  building: 'Building',
  dungeon: 'Dungeon',
  cave: 'Cave',
  landmark: 'Landmark',
  other: 'Other',
};

/** Matches [LocationType.rank] in the RPG Manager app. */
function locationTypeRank(code: string): number {
  const ranks: Record<string, number> = {
    continent: 0,
    nation: 1,
    region: 2,
    city: 3,
    village: 3,
    district: 4,
    building: 5,
    dungeon: 5,
    cave: 5,
    landmark: 5,
    other: 5,
  };
  return ranks[code] ?? 5;
}

function displayLocationType(code: string): string {
  return LOCATION_TYPE_LABELS[code] ?? code;
}

function resultTitle(raw: string | undefined): string {
  const value = (raw ?? '').trim();
  if (!value) return '';
  const periodIndex = value.indexOf('.');
  if (periodIndex <= 0) return value;
  return value.slice(0, periodIndex).trim();
}

function aliasesFromData(data: Record<string, unknown>): string[] {
  const raw = data.aliases;
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const e of raw) {
    if (typeof e === 'string') {
      const t = e.trim();
      if (t.length > 0) out.push(t);
    }
  }
  return out;
}

function locationHref(id: string): string {
  return `/records/location/${encodeURIComponent(id)}/`;
}

function ancestorOfType(
  byId: Map<string, LocationIndexEntry>,
  startParentId: unknown,
  targetType: string,
): LocationIndexEntry | null {
  let id =
    typeof startParentId === 'string' && startParentId.trim().length > 0
      ? startParentId.trim()
      : '';
  while (id.length > 0) {
    const row = byId.get(id);
    if (!row) return null;
    if (row.locationType === targetType) return row;
    const p = row.parentLocationId;
    id =
      typeof p === 'string' &&
      p.trim().length > 0 &&
      byId.has(p.trim())
        ? p.trim()
        : '';
  }
  return null;
}

function visibleLocationSections(
  sections: unknown,
): { title: string; contents: string }[] {
  if (!Array.isArray(sections)) return [];
  const out: { title: string; contents: string }[] = [];
  for (const s of sections) {
    if (!s || typeof s !== 'object') continue;
    const o = s as Record<string, unknown>;
    const title = typeof o.title === 'string' ? o.title : '';
    const contents = typeof o.contents === 'string' ? o.contents : '';
    if (title.trim().length > 0 || contents.trim().length > 0) {
      out.push({ title, contents });
    }
  }
  return out;
}

/** Layout aligned with the in-app location detail (overview card + flowing body). */
function htmlForLocationRecord(
  data: Record<string, unknown>,
  indexById: Map<string, LocationIndexEntry>,
  recordJsonExists?: (recordType: string, recordId: string) => boolean,
): string {
  const linkifyBlob = (raw: string): string => {
    if (!recordJsonExists || raw.length === 0) return raw;
    return enrichWithRecordLinks(raw, recordJsonExists);
  };
  const name =
    (typeof data.name === 'string' && data.name.trim()) ||
    (typeof data.id === 'string' && data.id) ||
    'Location';
  const locationTypeCode =
    typeof data.locationType === 'string' ? data.locationType : 'other';
  const currentRank = locationTypeRank(locationTypeCode);
  const parentRaw = data.parentLocationId;

  const nationAncestor =
    currentRank > locationTypeRank('nation')
      ? ancestorOfType(indexById, parentRaw, 'nation')
      : null;
  const regionAncestor =
    currentRank > locationTypeRank('region')
      ? ancestorOfType(indexById, parentRaw, 'region')
      : null;
  const cityAncestor =
    currentRank > locationTypeRank('city')
      ? ancestorOfType(indexById, parentRaw, 'city')
      : null;
  const villageAncestor =
    currentRank > locationTypeRank('village')
      ? ancestorOfType(indexById, parentRaw, 'village')
      : null;

  const hierarchyRows: { label: string; entry: LocationIndexEntry }[] = [];
  if (nationAncestor)
    hierarchyRows.push({ label: 'Nation', entry: nationAncestor });
  if (regionAncestor)
    hierarchyRows.push({ label: 'Region', entry: regionAncestor });
  if (cityAncestor) hierarchyRows.push({ label: 'City', entry: cityAncestor });
  if (villageAncestor)
    hierarchyRows.push({ label: 'Village', entry: villageAncestor });

  const villageData =
    data.villageData && typeof data.villageData === 'object'
      ? (data.villageData as Record<string, unknown>)
      : null;
  const villageAge = villageData
    ? resultTitle(
        typeof villageData.age === 'string' ? villageData.age : undefined,
      )
    : '';
  const villageSize = villageData
    ? resultTitle(
        typeof villageData.size === 'string' ? villageData.size : undefined,
      )
    : '';

  const detailRows: { label: string; value: string; href?: string }[] = [
    {
      label: 'Type',
      value: displayLocationType(locationTypeCode),
    },
  ];
  if (villageAge.length > 0)
    detailRows.push({ label: 'Age', value: villageAge });
  if (villageSize.length > 0)
    detailRows.push({ label: 'Size', value: villageSize });

  const aliases = aliasesFromData(data);
  const aliasesLine = aliases.join(', ');
  const imageUrl =
    typeof data.imageUrl === 'string' ? data.imageUrl.trim() : '';

  const quote = typeof data.quote === 'string' ? data.quote.trim() : '';
  const author = typeof data.author === 'string' ? data.author.trim() : '';

  const pinSvg = `<svg class="loc-pin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

  let imageBlock: string;
  if (imageUrl.length > 0) {
    imageBlock = `<div class="loc-overview-media"><img src="${escapeAttr(imageUrl)}" alt="" loading="lazy" decoding="async" /></div>`;
  } else {
    imageBlock = `<div class="loc-overview-media loc-overview-media--placeholder"><div class="loc-overview-ph-inner">${pinSvg}<div class="loc-overview-ph-title">Image Placeholder</div>${
      name.trim().length > 0
        ? `<div class="loc-overview-ph-sub">${escapeHtml(name)}</div>`
        : ''
    }</div></div>`;
  }

  function overviewRow(
    label: string,
    value: string,
    href: string | undefined,
  ): string {
    const valueInner =
      href && value.length > 0
        ? `<a href="${escapeAttr(href)}">${escapeHtml(value)}</a>`
        : escapeHtml(value);
    return `<div class="loc-orow"><div class="loc-olabel">${escapeHtml(label)}</div><div class="loc-ovalue">${valueInner}</div></div>`;
  }

  let hierarchyHtml = '';
  if (hierarchyRows.length > 0) {
    const rows = hierarchyRows
      .map((r) =>
        overviewRow(r.label, r.entry.name, locationHref(r.entry.id)),
      )
      .join('');
    hierarchyHtml = `<div class="loc-band"><div class="loc-band-inner"><span class="loc-band-title">Location</span></div></div><div class="loc-otable">${rows}</div>`;
  }

  const detailBodyRows = detailRows
    .map((r) => overviewRow(r.label, r.value, r.href))
    .join('');
  const detailsHtml = `<div class="loc-band${hierarchyRows.length > 0 ? ' loc-band--divider' : ''}"><div class="loc-band-inner"><span class="loc-band-title">Details</span></div></div><div class="loc-otable">${detailBodyRows}</div>`;

  const metaHtml =
    hierarchyRows.length > 0 || detailBodyRows.length > 0
      ? `<div class="loc-meta">${hierarchyHtml}${detailsHtml}</div>`
      : '';

  const overviewInner = `
    <div class="loc-overview-inner">
      <header class="loc-overview-head">
        <div class="loc-overview-icon" aria-hidden="true">${pinSvg}</div>
        <div class="loc-overview-titles">
          <div class="loc-overview-name">${escapeHtml(name)}</div>
          ${
            aliasesLine.trim().length > 0
              ? `<p class="loc-overview-aliases">${escapeHtml(aliasesLine)}</p>`
              : ''
          }
        </div>
      </header>
      ${imageBlock}
      ${metaHtml}
    </div>`;

  const overview = `<aside class="loc-overview" aria-label="Location summary">${overviewInner}</aside>`;

  let quoteBlock = '';
  if (quote.length > 0) {
    const cite =
      author.length > 0
        ? `<footer class="loc-quote-author">${linkifyBlob(author)}</footer>`
        : '';
    quoteBlock = `<figure class="loc-quote"><blockquote class="loc-quote-text prose">${linkifyBlob(quote)}</blockquote>${cite}</figure>`;
  }

  const sectionBlocks = visibleLocationSections(data.sections)
    .map((sec) => {
      const titleHtml =
        sec.title.trim().length > 0
          ? `<div class="loc-sec-title">${escapeHtml(sec.title)}</div>`
          : '';
      const bodyHtml =
        sec.contents.trim().length > 0
          ? `<div class="loc-sec-body prose">${linkifyBlob(sec.contents)}</div>`
          : '';
      return `<section class="loc-sec">${titleHtml}${bodyHtml}</section>`;
    })
    .join('\n');

  const asset = data.playerSiteAssetUrl;
  let downloadBlock = '';
  if (typeof asset === 'string' && asset.length > 0) {
    downloadBlock = `<section class="loc-download"><h2 class="loc-download-h">Download</h2><p><a href="${escapeAttr(asset)}">${escapeHtml(name)}</a></p></section>`;
  }

  const pageLead = `<header class="loc-page-lead"><h1 class="loc-page-name">${escapeHtml(name)}</h1></header>`;

  const bodyMain = `<div class="loc-body">${pageLead}${quoteBlock}${sectionBlocks}${downloadBlock}</div>`;

  return `<div class="location-detail-page"><div class="location-detail-grid">${overview}${bodyMain}</div></div>`;
}

const CREATURE_SIZE_LABELS: Record<string, string> = {
  TINY: 'Tiny',
  SMALL: 'Small',
  MEDIUM: 'Medium',
  LARGE: 'Large',
  HUGE: 'Huge',
  GARGANTUAN: 'Gargantuan',
};

function displayCreatureSize(code: unknown): string {
  if (typeof code !== 'string') return '';
  const t = code.trim();
  if (!t) return '';
  return CREATURE_SIZE_LABELS[t.toUpperCase()] ?? t;
}

function creatureTypeHref(id: string): string {
  return `/records/creature_type/${encodeURIComponent(id)}/`;
}

function stringList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter((v) => v.length > 0);
}

function commaSeparatedNonemptyLabels(items: unknown): string {
  if (!Array.isArray(items)) return '';
  const parts: string[] = [];
  for (const e of items) {
    if (!e || typeof e !== 'object') continue;
    const label =
      typeof (e as Record<string, unknown>).label === 'string'
        ? ((e as Record<string, unknown>).label as string).trim()
        : '';
    if (label.length > 0) parts.push(label);
  }
  return parts.join(', ');
}

function movementPaceFromNormalSpeed(movement: unknown): string | null {
  if (!Array.isArray(movement)) return null;
  let amount: number | null = null;
  for (const e of movement) {
    if (!e || typeof e !== 'object') continue;
    const o = e as Record<string, unknown>;
    const label = typeof o.label === 'string' ? o.label.trim().toLowerCase() : '';
    if (label !== 'normal') continue;
    if (typeof o.amount === 'number' && !Number.isNaN(o.amount)) {
      amount = o.amount;
      break;
    }
  }
  if (amount == null) return null;
  if (amount < 30) return 'Slow';
  if (amount > 30) return 'Fast';
  return 'Normal';
}

function formatCreatureLanguages(
  data: Record<string, unknown>,
  resolveRecordName?: (recordType: string, recordId: string) => string | null,
): string {
  const parts: string[] = [];
  for (const id of stringList(data.languageIds)) {
    const name = resolveRecordName?.('language', id)?.trim();
    if (name && name.length > 0) parts.push(name);
  }
  for (const custom of stringList(data.customLanguages)) {
    parts.push(custom);
  }
  return parts.join(', ');
}

function formatCreatureTraitNames(traits: unknown): string {
  if (!Array.isArray(traits)) return '';
  const names: string[] = [];
  for (const tr of traits) {
    if (!tr || typeof tr !== 'object') continue;
    const o = tr as Record<string, unknown>;
    if (o.showOnMonsterTypePage === false) continue;
    const n = typeof o.name === 'string' ? o.name.trim() : '';
    if (n.length > 0) names.push(n);
  }
  return names.join(', ');
}

function visibleCreatureSections(
  sections: unknown,
): { title: string; contents: string }[] {
  if (!Array.isArray(sections)) return [];
  const out: { title: string; contents: string }[] = [];
  for (const s of sections) {
    if (!s || typeof s !== 'object') continue;
    const o = s as Record<string, unknown>;
    const title = typeof o.title === 'string' ? o.title : '';
    const contents = typeof o.contents === 'string' ? o.contents : '';
    if (title.trim().length > 0 || contents.trim().length > 0) {
      out.push({ title, contents });
    }
  }
  return out;
}

function formatCreatureSectionHtml(
  raw: string,
  recordJsonExists?: (recordType: string, recordId: string) => boolean,
): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const linkify = (line: string): string => {
    if (recordJsonExists) {
      return enrichWithRecordLinks(line, recordJsonExists);
    }
    return escapeHtml(line);
  };
  const lines = trimmed.split('\n');
  const blocks: string[] = [];
  for (const line of lines) {
    const heading3 = line.startsWith('### ');
    const heading2 = !heading3 && line.startsWith('## ');
    const working = heading3
      ? line.slice(4)
      : heading2
        ? line.slice(3)
        : line;
    const linked = applyInlineMarkdownHtml(linkify(working));
    if (heading2) {
      blocks.push(`<div class="loc-sec-title">${linked}</div>`);
    } else if (heading3) {
      blocks.push(`<div class="loc-sec-subtitle">${linked}</div>`);
    } else if (working.trim().length > 0) {
      blocks.push(`<p>${linked}</p>`);
    } else {
      blocks.push('<br />');
    }
  }
  return blocks.join('\n');
}

/** Layout aligned with the in-app creature type detail (infobox + quote + sections). */
function htmlForCreatureTypeRecord(
  data: Record<string, unknown>,
  indexById: Map<string, CreatureIndexEntry>,
  recordJsonExists?: (recordType: string, recordId: string) => boolean,
  resolveRecordName?: (recordType: string, recordId: string) => string | null,
): string {
  const linkifyBlob = (raw: string): string => {
    if (!recordJsonExists || raw.length === 0) return raw;
    return enrichWithRecordLinks(raw, recordJsonExists);
  };

  const name =
    (typeof data.name === 'string' && data.name.trim()) ||
    (typeof data.id === 'string' && data.id) ||
    'Creature';

  const pawSvg = creatureTypeIconSvg('creature-pin');

  const classificationRows: { label: string; value: string; href?: string }[] =
    [];
  const detailRows: { label: string; value: string; href?: string }[] = [];

  const parentRaw = data.parentCreatureTypeId;
  const parentId =
    typeof parentRaw === 'string' && parentRaw.trim().length > 0
      ? parentRaw.trim()
      : '';
  if (parentId.length > 0 && indexById.has(parentId)) {
    const direct = indexById.get(parentId)!;
    let root = direct;
    while (
      root.parentCreatureTypeId &&
      indexById.has(root.parentCreatureTypeId)
    ) {
      root = indexById.get(root.parentCreatureTypeId)!;
    }
    const directIsTopLevel =
      !direct.parentCreatureTypeId ||
      direct.parentCreatureTypeId.trim().length === 0;

    if (directIsTopLevel) {
      classificationRows.push({
        label: 'Creature type',
        value: direct.name,
        href: creatureTypeHref(direct.id),
      });
    } else {
      classificationRows.push({
        label: 'Creature type',
        value: root.name,
        href: creatureTypeHref(root.id),
      });
      classificationRows.push({
        label: 'Creature subtype',
        value: direct.name,
        href: creatureTypeHref(direct.id),
      });
    }
  }

  const sizeLabel = displayCreatureSize(data.size);
  if (sizeLabel.length > 0) {
    classificationRows.push({ label: 'Size', value: sizeLabel });
  }

  const movementPace = movementPaceFromNormalSpeed(data.movement);
  if (movementPace) {
    detailRows.push({ label: 'Movement', value: movementPace });
  }

  const sensesLabels = commaSeparatedNonemptyLabels(data.senses);
  if (sensesLabels.length > 0) {
    detailRows.push({ label: 'Senses', value: sensesLabels });
  }

  const languagesLine = formatCreatureLanguages(data, resolveRecordName);
  if (languagesLine.length > 0) {
    detailRows.push({ label: 'Languages', value: languagesLine });
  }

  const traitNames = formatCreatureTraitNames(data.traits);
  if (traitNames.length > 0) {
    detailRows.push({ label: 'Traits', value: traitNames });
  }

  function overviewRow(
    label: string,
    value: string,
    href: string | undefined,
  ): string {
    const valueInner =
      href && value.length > 0
        ? `<a href="${escapeAttr(href)}">${escapeHtml(value)}</a>`
        : escapeHtml(value);
    return `<div class="loc-orow"><div class="loc-olabel">${escapeHtml(label)}</div><div class="loc-ovalue">${valueInner}</div></div>`;
  }

  let classificationHtml = '';
  if (classificationRows.length > 0) {
    const rows = classificationRows
      .map((r) => overviewRow(r.label, r.value, r.href))
      .join('');
    classificationHtml = `<div class="loc-otable">${rows}</div>`;
  }

  let detailHtml = '';
  if (detailRows.length > 0) {
    const rows = detailRows
      .map((r) => overviewRow(r.label, r.value, r.href))
      .join('');
    detailHtml = `<div class="loc-otable">${rows}</div>`;
  }

  const metaHtml =
    classificationRows.length > 0 || detailRows.length > 0
      ? `<div class="loc-meta creature-overview-meta">${classificationHtml}${
          classificationRows.length > 0 && detailRows.length > 0
            ? '<div class="creature-overview-meta-gap"></div>'
            : ''
        }${detailHtml}</div>`
      : '';

  const imageBlock = `<div class="loc-overview-media loc-overview-media--placeholder"><div class="loc-overview-ph-inner">${pawSvg}<div class="loc-overview-ph-title">Image Placeholder</div>${
    name.trim().length > 0
      ? `<div class="loc-overview-ph-sub">${escapeHtml(name)}</div>`
      : ''
  }</div></div>`;

  const overviewInner = `
    <div class="loc-overview-inner creature-overview-inner">
      <header class="creature-overview-titleband">${escapeHtml(name)}</header>
      ${imageBlock}
      ${metaHtml}
    </div>`;

  const overview = `<aside class="loc-overview creature-overview" aria-label="Creature summary">${overviewInner}</aside>`;

  const quote = typeof data.quote === 'string' ? data.quote.trim() : '';
  const author = typeof data.author === 'string' ? data.author.trim() : '';

  let quoteBlock = '';
  if (quote.length > 0) {
    const cite =
      author.length > 0
        ? `<footer class="creature-quote-author">${linkifyBlob(author)}</footer>`
        : '';
    quoteBlock = `<figure class="creature-quote"><blockquote class="creature-quote-text prose">"${linkifyBlob(quote)}"</blockquote>${cite}</figure>`;
  }

  const sectionBlocks = visibleCreatureSections(data.sections)
    .map((sec) => {
      const titleHtml =
        sec.title.trim().length > 0
          ? `<div class="loc-sec-title">${escapeHtml(sec.title)}</div>`
          : '';
      const bodyHtml =
        sec.contents.trim().length > 0
          ? `<div class="loc-sec-body prose">${formatCreatureSectionHtml(sec.contents, recordJsonExists)}</div>`
          : '';
      return `<section class="loc-sec">${titleHtml}${bodyHtml}</section>`;
    })
    .join('\n');

  const pageLead = `<header class="loc-page-lead"><h1 class="loc-page-name">${escapeHtml(name)}</h1></header>`;
  const bodyMain = `<div class="loc-body">${pageLead}${quoteBlock}${sectionBlocks}</div>`;

  return `<div class="location-detail-page creature-detail-page"><div class="location-detail-grid">${overview}${bodyMain}</div></div>`;
}
