/**
 * Catálogo de Gravity MTB.
 *
 * Productos y servicios comparten la misma estructura para que el carrito
 * los trate igual. Campos:
 *   id        identificador único (se guarda en LocalStorage)
 *   type      "product" | "service" (los servicios no pagan envío)
 *   category  usada por los filtros y para el color de la tarjeta
 *   level     nivel de pista: green | blue | black | double
 *   art       nombre de la ilustración en js/art.js
 *   price     precio unitario en MXN
 *   stock     máximo de piezas que se pueden agregar
 */
const CATALOG = Object.freeze([
  // ---------- Bicis ----------
  {
    id: "bike-descenso-pro",
    type: "product",
    category: "bicis",
    name: "Descenso Pro 29",
    description: "Cuadro de carbono pensado para copas de DH y pistas rotas.",
    specs: ["200 mm", "Carbono", "29\""],
    level: "double",
    tag: "Nuevo",
    art: "bike",
    price: 89900,
    stock: 3
  },
  {
    id: "bike-freeride-mullet",
    type: "product",
    category: "bicis",
    name: "Freeride Mullet",
    description: "Rueda 29 adelante, 27.5 atrás: estabilidad y giro rápido.",
    specs: ["180 mm", "Aluminio", "MX"],
    level: "black",
    art: "bike",
    price: 54500,
    stock: 5
  },
  {
    id: "bike-park-start",
    type: "product",
    category: "bicis",
    name: "Park Start 27.5",
    description: "Tu primera bici de bike park, robusta y fácil de manejar.",
    specs: ["160 mm", "Aluminio", "27.5\""],
    level: "blue",
    art: "bike",
    price: 32900,
    stock: 6
  },

  // ---------- Protección ----------
  {
    id: "helmet-fullface",
    type: "product",
    category: "proteccion",
    name: "Casco Integral Carbon",
    description: "Certificado ASTM F1952 para descenso, con sistema MIPS.",
    specs: ["ASTM DH", "MIPS", "980 g"],
    level: "green",
    tag: "Top ventas",
    art: "helmet",
    price: 7850,
    stock: 10
  },
  {
    id: "goggles-mud",
    type: "product",
    category: "proteccion",
    name: "Goggles Lodo Pro",
    description: "Mica antiempañante con tear-offs para días de lodo.",
    specs: ["Anti-fog", "Tear-off"],
    level: "green",
    art: "goggles",
    price: 1450,
    stock: 15
  },
  {
    id: "armor-body",
    type: "product",
    category: "proteccion",
    name: "Peto Body Shield",
    description: "Protección de pecho y espalda nivel 2, ventilada.",
    specs: ["CE Nivel 2", "Espalda"],
    level: "blue",
    art: "armor",
    price: 3900,
    stock: 8
  },
  {
    id: "gloves-grip",
    type: "product",
    category: "proteccion",
    name: "Guantes Grip DH",
    description: "Palma delgada para sentir el manubrio, nudillos reforzados.",
    specs: ["Touch", "Refuerzo"],
    level: "green",
    art: "gloves",
    price: 690,
    stock: 20
  },

  // ---------- Componentes ----------
  {
    id: "fork-dual-crown",
    type: "product",
    category: "componentes",
    name: "Horquilla Doble Corona",
    description: "Barras de 38 mm y cartucho de amortiguación ajustable.",
    specs: ["200 mm", "38 mm", "Aire"],
    level: "double",
    art: "fork",
    price: 21900,
    stock: 4
  },
  {
    id: "tire-dh",
    type: "product",
    category: "componentes",
    name: "Llanta Gravity DH 29 x 2.5",
    description: "Carcasa doble y compuesto suave para agarre en raíces.",
    specs: ["DH casing", "Tubeless"],
    level: "black",
    art: "tire",
    price: 1350,
    stock: 20
  },
  {
    id: "pedals-flat",
    type: "product",
    category: "componentes",
    name: "Pedales Plataforma Mg",
    description: "Magnesio, 10 pines por lado y perfil cóncavo.",
    specs: ["Magnesio", "20 pines"],
    level: "blue",
    art: "pedal",
    price: 1890,
    stock: 12
  },

  // ---------- Servicios ----------
  {
    id: "service-suspension",
    type: "service",
    category: "servicios",
    name: "Afinación de suspensión",
    description: "Servicio de horquilla y shock, ajustado a tu peso.",
    specs: ["48 h", "Incluye aceites"],
    art: "shock",
    price: 1800,
    stock: 2
  },
  {
    id: "service-workshop",
    type: "service",
    category: "servicios",
    name: "Servicio completo",
    description: "Revisión de frenos, transmisión, rodamientos y torque.",
    specs: ["24 h express"],
    art: "wrench",
    price: 1200,
    stock: 2
  },
  {
    id: "service-shuttle",
    type: "service",
    category: "servicios",
    name: "Shuttle a bike park",
    description: "Día completo de subidas en van con remolque para bicis.",
    specs: ["8 subidas", "Por persona"],
    art: "van",
    price: 950,
    stock: 6
  },
  {
    id: "service-clinic",
    type: "service",
    category: "servicios",
    name: "Clínica de técnica DH",
    description: "Saltos, drops y líneas con coach certificado.",
    specs: ["4 h", "Grupos de 6"],
    art: "stopwatch",
    price: 1500,
    stock: 4
  }
]);

/** Nombres legibles de los niveles de pista. */
const LEVEL_LABELS = Object.freeze({
  green: "Verde",
  blue: "Azul",
  black: "Negra",
  double: "Doble negra"
});
