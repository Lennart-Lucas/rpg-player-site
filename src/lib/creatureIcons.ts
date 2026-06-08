/**
 * Material `pets_outlined` (matches RPG Manager `Icons.pets_outlined`).
 * @see https://fonts.google.com/icons?selected=Material+Icons+Outlined:pets
 */
export const CREATURE_TYPE_ICON_PATH =
  'M4.5 9.5C4.5 11.43 6.07 13 8 13s3.5-1.57 3.5-3.5S9.93 6 8 6 4.5 7.57 4.5 9.5zm7 0c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5S16.93 6 15 6s-3.5 1.57-3.5 3.5zm7 0c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5S23.93 6 22 6s-3.5 1.57-3.5 3.5zM8 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-2c0-2.66-5.33-4-8-4z';

/** Full SVG markup for inline HTML (`set:html`, tree cards, infobox placeholder). */
export function creatureTypeIconSvg(className?: string): string {
  const cls = className ? ` class="${className}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"${cls} aria-hidden="true"><path d="${CREATURE_TYPE_ICON_PATH}"/></svg>`;
}
