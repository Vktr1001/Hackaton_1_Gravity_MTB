/**
 * Pruebas del carrito (js/cart.js) sin librerías externas.
 * Abre tests/index.html en el navegador para ver los resultados.
 */
(() => {
  "use strict";

  /* ---------------- Mini framework de pruebas ---------------- */

  const results = [];

  function test(name, fn) {
    try {
      fn();
      results.push({ name, ok: true });
    } catch (error) {
      results.push({ name, ok: false, message: error.message });
    }
  }

  function assertEqual(actual, expected, label = "") {
    if (actual !== expected) {
      throw new Error(`${label} esperado ${JSON.stringify(expected)}, recibido ${JSON.stringify(actual)}`);
    }
  }

  /** Almacenamiento falso en memoria (imita localStorage). */
  function createMemoryStorage(initial = {}) {
    const data = { ...initial };
    return {
      getItem: (key) => (key in data ? data[key] : null),
      setItem: (key, value) => { data[key] = String(value); },
      removeItem: (key) => { delete data[key]; }
    };
  }

  /** Almacenamiento que siempre falla (ej. cuota llena o bloqueado). */
  const brokenStorage = {
    getItem: () => { throw new Error("bloqueado"); },
    setItem: () => { throw new Error("cuota llena"); },
    removeItem: () => {}
  };

  const newCart = (storage = createMemoryStorage(), onStorageError) =>
    createCart({ catalog: CATALOG, storage, onStorageError });

  // Artículos de referencia
  const GLOVES = CATALOG.find((item) => item.id === "gloves-grip");      // $690, producto
  const HELMET = CATALOG.find((item) => item.id === "helmet-fullface");  // $7,850, producto
  const SHUTTLE = CATALOG.find((item) => item.id === "service-shuttle"); // $950, servicio

  /* ---------------- Casos ---------------- */

  test("Un carrito nuevo está vacío", () => {
    const { count, total } = newCart().getSummary();
    assertEqual(count, 0, "count");
    assertEqual(total, 0, "total");
  });

  test("Agregar un producto suma 1 pieza", () => {
    const cart = newCart();
    assertEqual(cart.add(GLOVES.id).ok, true, "ok");
    assertEqual(cart.getQty(GLOVES.id), 1, "qty");
  });

  test("Agregar el mismo producto incrementa la cantidad (no duplica líneas)", () => {
    const cart = newCart();
    cart.add(GLOVES.id);
    cart.add(GLOVES.id);
    assertEqual(cart.getItems().length, 1, "líneas");
    assertEqual(cart.getQty(GLOVES.id), 2, "qty");
  });

  test("Rechaza productos que no existen", () => {
    const result = newCart().add("bici-fantasma");
    assertEqual(result.ok, false, "ok");
    assertEqual(result.error, CART_ERRORS.UNKNOWN_ITEM, "error");
  });

  test("No permite superar el stock", () => {
    const cart = newCart();
    cart.setQty(HELMET.id, HELMET.stock);
    const result = cart.add(HELMET.id);
    assertEqual(result.error, CART_ERRORS.STOCK_LIMIT, "error");
    assertEqual(cart.getQty(HELMET.id), HELMET.stock, "qty");
  });

  test("Rechaza cantidades negativas o decimales", () => {
    const cart = newCart();
    assertEqual(cart.setQty(GLOVES.id, -2).error, CART_ERRORS.INVALID_QTY, "negativa");
    assertEqual(cart.setQty(GLOVES.id, 1.5).error, CART_ERRORS.INVALID_QTY, "decimal");
  });

  test("Cantidad 0 elimina el artículo", () => {
    const cart = newCart();
    cart.add(GLOVES.id);
    cart.setQty(GLOVES.id, 0);
    assertEqual(cart.getItems().length, 0, "líneas");
  });

  test("Cobra envío si el subtotal es menor a $3,000", () => {
    const cart = newCart();
    cart.add(GLOVES.id); // $690
    const summary = cart.getSummary();
    assertEqual(summary.shipping, SHIPPING_COST, "envío");
    assertEqual(summary.total, 690 + SHIPPING_COST, "total");
    assertEqual(summary.missingForFreeShipping, FREE_SHIPPING_FROM - 690, "faltante");
  });

  test("Envío gratis desde $3,000", () => {
    const cart = newCart();
    cart.add(HELMET.id); // $7,850
    assertEqual(cart.getSummary().shipping, 0, "envío");
  });

  test("Los servicios no pagan envío", () => {
    const cart = newCart();
    cart.add(SHUTTLE.id); // $950 sin productos físicos
    assertEqual(cart.getSummary().shipping, 0, "envío");
  });

  test("Guarda y recupera el carrito desde el almacenamiento", () => {
    const storage = createMemoryStorage();
    const first = newCart(storage);
    first.add(GLOVES.id);
    first.add(GLOVES.id);
    first.add(SHUTTLE.id);

    const second = newCart(storage); // simula recargar la página
    assertEqual(second.getQty(GLOVES.id), 2, "guantes");
    assertEqual(second.getQty(SHUTTLE.id), 1, "shuttle");
  });

  test("Ignora JSON corrupto sin romperse", () => {
    let errors = 0;
    const storage = createMemoryStorage({ [CART_STORAGE_KEY]: "{esto no es json" });
    const cart = newCart(storage, () => errors++);
    assertEqual(cart.getSummary().count, 0, "count");
    assertEqual(errors, 1, "errores reportados");
  });

  test("Filtra entradas inválidas y respeta el stock al cargar", () => {
    const saved = [
      { id: GLOVES.id, qty: 3 },
      { id: "no-existe", qty: 1 },
      { id: HELMET.id, qty: -4 },
      { id: SHUTTLE.id, qty: 999 },
      null
    ];
    const storage = createMemoryStorage({ [CART_STORAGE_KEY]: JSON.stringify(saved) });
    const cart = newCart(storage);
    assertEqual(cart.getItems().length, 2, "líneas válidas");
    assertEqual(cart.getQty(SHUTTLE.id), SHUTTLE.stock, "cantidad recortada al stock");
  });

  test("Sigue funcionando si el almacenamiento falla", () => {
    let errors = 0;
    const cart = newCart(brokenStorage, () => errors++);
    assertEqual(cart.add(GLOVES.id).ok, true, "agrega en memoria");
    assertEqual(cart.getQty(GLOVES.id), 1, "qty");
    assertEqual(errors >= 1, true, "reporta el error");
  });

  test("Vaciar el carrito también limpia lo guardado", () => {
    const storage = createMemoryStorage();
    const cart = newCart(storage);
    cart.add(GLOVES.id);
    cart.clear();
    assertEqual(newCart(storage).getSummary().count, 0, "count tras recargar");
  });

  /* ---------------- Reporte ---------------- */

  const passed = results.filter((result) => result.ok).length;
  const summary = document.getElementById("summary");
  summary.textContent = `${passed} de ${results.length} pruebas pasaron`;
  summary.className = `summary ${passed === results.length ? "pass" : "fail"}`;

  document.getElementById("results").innerHTML = results
    .map((result) => `<li class="${result.ok ? "pass" : "fail"}">${result.ok ? "✔" : "✘"} ${result.name}
      ${result.ok ? "" : `<br><code>${result.message}</code>`}</li>`)
    .join("");

  // También en consola, útil para revisar rápido
  console.table(results);
})();
