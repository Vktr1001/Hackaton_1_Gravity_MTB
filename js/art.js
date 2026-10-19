/**
 * Ilustraciones de línea (SVG) para productos y servicios.
 *
 * Se dibujan con "currentColor", así que el color lo decide el CSS
 * de la tarjeta. Todas usan el mismo viewBox de 160 x 100.
 */
const ART = Object.freeze({
  bike: `
    <circle cx="35" cy="68" r="22"/>
    <circle cx="125" cy="68" r="22"/>
    <path d="M35 68 L76 68 L64 36 M35 68 L66 44 L108 36 L76 68 M108 36 L125 68 M56 32 H74 M108 36 L110 22 M100 22 H120"/>
    <path d="M82 44 L92 52" stroke-width="7"/>`,

  helmet: `
    <path d="M44 66 C38 38 60 14 92 14 C122 14 140 36 138 60 L136 74 C134 84 124 88 112 86 L98 82 L92 90 L64 90 C52 90 46 80 44 66 Z"/>
    <path d="M90 38 H134 C136 48 134 58 126 60 H96 C88 58 86 46 90 38 Z"/>
    <path d="M70 16 L54 4 H118"/>
    <path d="M104 72 H120 M104 78 H116"/>`,

  goggles: `
    <path d="M28 40 C28 28 40 24 80 24 C120 24 132 28 132 40 V58 C132 70 120 74 104 74 C94 74 90 64 80 64 C70 64 66 74 56 74 C40 74 28 70 28 58 Z"/>
    <path d="M28 46 L8 52 M132 46 L152 52"/>
    <path d="M44 36 H64"/>`,

  armor: `
    <path d="M56 14 L80 22 L104 14 L122 28 L118 60 C114 76 100 86 80 92 C60 86 46 76 42 60 L38 28 Z"/>
    <path d="M80 22 V90 M48 42 H112 M52 62 H108"/>`,

  gloves: `
    <path d="M54 94 V56 L44 42 C40 34 48 28 56 34 L64 44 V18 C64 10 74 10 74 18 V42 V12 C74 4 84 4 84 12 V42 V16 C84 8 94 8 94 16 V44 V26 C94 18 104 18 104 26 V66 C104 82 96 94 82 94 Z"/>
    <path d="M54 82 H104"/>`,

  tire: `
    <circle cx="80" cy="50" r="42"/>
    <circle cx="80" cy="50" r="34" stroke-width="9" stroke-dasharray="6 7"/>
    <circle cx="80" cy="50" r="22"/>
    <circle cx="80" cy="50" r="4"/>`,

  fork: `
    <path d="M80 18 V2 M52 14 H108 M52 30 H108 M64 14 V44 M96 14 V44"/>
    <path d="M58 44 H70 V88 H58 Z M90 44 H102 V88 H90 Z"/>
    <path d="M58 86 H102"/>`,

  pedal: `
    <rect x="34" y="24" width="90" height="52" rx="12"/>
    <path d="M58 24 V76 M100 24 V76 M124 50 H152"/>
    <path d="M44 34 h0 M44 66 h0 M114 34 h0 M114 66 h0 M79 34 h0 M79 66 h0" stroke-width="7"/>`,

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
 * Si el nombre no existe, regresa una ilustración genérica (montaña)
 * para que la interfaz nunca se rompa.
 * @param {string} name
 * @returns {string}
 */
function getArt(name) {
  const shapes = ART[name] || `<path d="M10 90 L60 20 L90 60 L110 35 L150 90 Z"/>`;
  return `<svg viewBox="0 0 160 100" aria-hidden="true" focusable="false">${shapes}</svg>`;
}
