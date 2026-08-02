/**
 * Iconos de UI: Heroicons outline (MIT, https://heroicons.com) + gota custom de marca.
 * Paths vendoreados (24×24 outline). Color vía CSS `currentColor`.
 */

const ATTRS =
  'xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ' +
  'stroke-width="1.5" stroke="currentColor" aria-hidden="true"';

/** @type {Record<string, string>} inner path markup only */
const PATHS = {
  magnifyingGlass:
    '<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />',
  mapPin:
    '<path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />' +
    '<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />',
  xMark:
    '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />',
  chevronDown:
    '<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />',
  exclamationTriangle:
    '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />',
  map:
    '<path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934a1.125 1.125 0 0 1 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />',
  share:
    '<path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />',
};

/** Gota de marca (fill, no outline Heroicons). */
const DROP =
  '<path fill="currentColor" stroke="none" d="M12 2.8C12 2.8 5.5 10.2 5.5 14.2a6.5 6.5 0 1 0 13 0C18.5 10.2 12 2.8 12 2.8z" />';

/**
 * @param {keyof typeof PATHS | 'drop'} name
 * @param {string} [className]
 * @returns {string}
 */
export function icon(name, className = "icon") {
  const cls = className ? ` class="${className}"` : "";
  if (name === "drop") {
    return `<svg${cls} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">${DROP}</svg>`;
  }
  const paths = PATHS[name];
  if (!paths) throw new Error(`Unknown icon: ${name}`);
  return `<svg${cls} ${ATTRS}>${paths}</svg>`;
}
