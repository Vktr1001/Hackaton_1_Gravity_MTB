/**
 * Ilustraciones de línea (SVG) para los servicios, que no tienen foto.
 *
 * Se dibujan con "currentColor", así que el color lo decide el CSS
 * de la tarjeta. Todas usan el mismo viewBox de 160 x 100.
 */
const ART = Object.freeze({
  shock: `
    <circle cx="26" cy="50" r="8"/>
    <circle cx="134" cy="50" r="8"/>
    <path d="M34 50 H52 M108 50 H126"/>
    <rect x="52" y="40" width="56" height="20" rx="5"/>
    <path d="M58 30 L64 70 L70 30 L76 70 L82 30 L88 70 L94 30 L100 70"/>`,

  wrench: `
    <path d="M36 88 L92 32"/>
    <path d="M92 32 C84 18 96 2 114 8 L102 20 L106 28 L114 32 L126 22 C130 40 112 50 98 42"/>
    <circle cx="36" cy="88" r="5"/>`,

  van: `
    <path d="M14 72 V40 C14 34 18 30 24 30 H100 L124 48 H138 C142 48 146 52 146 56 V72 Z"/>
    <circle cx="44" cy="74" r="11"/>
    <circle cx="116" cy="74" r="11"/>
    <path d="M100 30 V48 H124 M30 22 L56 12 L82 22"/>`,

  stopwatch: `
    <circle cx="80" cy="56" r="34"/>
    <path d="M80 56 L96 40 M70 12 H90 M80 12 V22 M108 26 L116 18"/>`
});

/**
 * Devuelve el SVG completo de una ilustración.
 * Sin nombre o con uno que no existe (p. ej. la foto de un producto
 * no cargó) regresa una montaña genérica para que nada quede vacío.
 * @param {string} [name]
 * @returns {string}
 */
function getArt(name) {
  const shapes = ART[name] || `<path d="M10 90 L60 20 L90 60 L110 35 L150 90 Z"/>`;
  return `<svg viewBox="0 0 160 100" aria-hidden="true" focusable="false">${shapes}</svg>`;
}
