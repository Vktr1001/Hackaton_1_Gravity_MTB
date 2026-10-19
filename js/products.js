/**
 * Catálogo de Gravity MTB.
 *
 * Precios en MXN convertidos del precio de lista (referencia, oct. 2026):
 *   bicis YT en EUR a 20.67 MXN/EUR + 25% (importación y armado);
 *   el resto en USD.
 *
 * Productos y servicios comparten la misma estructura para que el carrito
 * los trate igual. Campos:
 *   id        identificador único (se guarda en LocalStorage)
 *   type      "product" | "service" (los servicios no pagan envío)
 *   brand     marca (opcional, solo productos)
 *   category  usada por los filtros y para el color de la tarjeta
 *   level     nivel de pista: green | blue | black | double
 *   image     foto oficial (productos)
 *   art       ilustración SVG en js/art.js (servicios, que no tienen foto)
 *   price     precio unitario en MXN
 *   oldPrice  precio anterior si está en oferta (opcional)
 *   stock     máximo de piezas que se pueden agregar
 */
const CATALOG = Object.freeze([
  // ---------- Bicis (YT Industries) ----------
  {
    id: "yt-tues-core2",
    type: "product",
    category: "bicis",
    brand: "YT Industries",
    name: "Tues Core 2 Mullet",
    description: "Bici de downhill con cuadro de carbono, Boxxer y shock de resorte Vivid.",
    specs: ["200 mm", "Carbono", "Downhill"],
    level: "double",
    image: "img/products/yt-tues-core2.png",
    price: 111100,
    stock: 3
  },
  {
    id: "yt-capra-core1",
    type: "product",
    category: "bicis",
    brand: "YT Industries",
    name: "Capra Core 1",
    description: "Enduro de aluminio con suspensión Marzocchi Bomber: sube y baja como bici de park.",
    specs: ["170 mm", "Aluminio", "MX 29"],
    level: "black",
    tag: "Best seller",
    image: "img/products/yt-capra-core1.png",
    price: 72300,
    stock: 4
  },
  {
    id: "yt-jeffsy-core2-al",
    type: "product",
    category: "bicis",
    brand: "YT Industries",
    name: "Jeffsy Core 2 AL",
    description: "All mountain de aluminio con suspensión Fox 36 y Float X.",
    specs: ["150/145 mm", "Aluminio", "29\""],
    level: "blue",
    tag: "Oferta",
    image: "img/products/yt-jeffsy-core2-al.png",
    price: 63300,
    oldPrice: 90400,
    stock: 5
  },

  // ---------- Protección (Alpinestars) ----------
  {
    id: "as-missile-tech-helmet",
    type: "product",
    category: "proteccion",
    brand: "Alpinestars",
    name: "Missile Tech Solid Helmet",
    description: "Casco integral de downhill con MIPS, 22 ventilas y liberación de emergencia.",
    specs: ["MIPS", "22 ventilas", "ERS"],
    level: "green",
    tag: "Best seller",
    image: "img/products/as-missile-tech-helmet.png",
    price: 7399,
    stock: 10
  },
  {
    id: "as-plasma-knee",
    type: "product",
    category: "proteccion",
    brand: "Alpinestars",
    name: "A-Impact Plasma Elite Shield Knee",
    description: "Rodilleras con inserto viscoelástico PLASMA y concha TPU contra rocas.",
    specs: ["EN 1621-1 Nivel 2", "Concha TPU"],
    level: "blue",
    image: "img/products/as-plasma-knee.png",
    price: 3249,
    stock: 8
  },
  {
    id: "as-plasma-elbow",
    type: "product",
    category: "proteccion",
    brand: "Alpinestars",
    name: "A-Impact Plasma Elite Shield Elbow",
    description: "Coderas con doble correa y forro de silicón para que no se muevan.",
    specs: ["EN 1621-1 Nivel 2", "Concha TPU"],
    level: "black",
    image: "img/products/as-plasma-elbow.png",
    price: 2849,
    stock: 8
  },
  {
    id: "as-a5-plasma-chest",
    type: "product",
    category: "proteccion",
    brand: "Alpinestars",
    name: "A-5 Plasma Chest Protector",
    description: "Peto con protección de pecho y espalda sobre chasis de malla 3D ventilada.",
    specs: ["CE Nivel 2", "Pecho + espalda"],
    level: "double",
    tag: "Best seller",
    image: "img/products/as-a5-plasma-chest.png",
    price: 4249,
    stock: 6
  },
  {
    id: "as-a-dura-gloves",
    type: "product",
    category: "proteccion",
    brand: "Alpinestars",
    name: "A-Dura Gloves",
    description: "Guantes con puño de neopreno, cierre de velcro y dedos táctiles.",
    specs: ["Touch", "Neopreno"],
    level: "green",
    image: "img/products/as-a-dura-gloves.png",
    price: 869,
    stock: 20
  },
  {
    id: "as-vision5-goggles",
    type: "product",
    category: "proteccion",
    brand: "Alpinestars",
    name: "Vision 5 Corp Goggles",
    description: "Mica espejo antiempañante, marco flexible A-FLEX y ventilación RAM-AIR.",
    specs: ["Mica espejo", "Anti-fog"],
    level: "green",
    image: "img/products/as-vision5-goggles.png",
    price: 1099,
    stock: 15
  },

  // ---------- Componentes (Fox y Maxxis) ----------
  {
    id: "fox-40-factory",
    type: "product",
    category: "componentes",
    brand: "Fox Factory",
    name: "FOX 40 Factory",
    description: "La horquilla doble corona más ganadora de la Copa del Mundo de DH.",
    specs: ["203 mm", "GRIP X2", "Kashima"],
    level: "double",
    image: "img/products/fox-40-factory.png",
    price: 36990,
    stock: 3
  },
  {
    id: "fox-dhx2",
    type: "product",
    category: "componentes",
    brand: "Fox Factory",
    name: "FOX DHX2",
    description: "Shock de resorte monotubo con 4 ajustes externos de compresión y rebote.",
    specs: ["Coil", "4 ajustes", "Eje ½\""],
    level: "black",
    tag: "Best seller",
    image: "img/products/fox-dhx2.png",
    price: 11990,
    stock: 5
  },
  {
    id: "maxxis-minion-dhx",
    type: "product",
    category: "componentes",
    brand: "Maxxis",
    name: "Minion DHX 29 x 2.50",
    description: "Carcasa NEW DH y compuesto 3C MaxxGrip para máximo agarre. Ref. TB00659800.",
    specs: ["NEW DH", "MaxxGrip", "Tubeless"],
    level: "blue",
    image: "img/products/maxxis-minion-dhx.jpg",
    price: 1749,
    stock: 20
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
