/**
 * Lógica del carrito (sin DOM).
 *
 * Se separa de la interfaz para poder probarla de forma aislada
 * (ver tests/index.html). El almacenamiento se inyecta: en la página
 * es window.localStorage y en las pruebas un objeto falso.
 */

const CART_STORAGE_KEY = "gravity-mtb-cart";
const FREE_SHIPPING_FROM = 3000;
const SHIPPING_COST = 199;

/** Códigos de error que puede devolver el carrito. */
const CART_ERRORS = Object.freeze({
  UNKNOWN_ITEM: "UNKNOWN_ITEM",
  INVALID_QTY: "INVALID_QTY",
  STOCK_LIMIT: "STOCK_LIMIT"
});

/**
 * Crea un carrito.
 * @param {Object}   options
 * @param {Array}    options.catalog         Lista de productos/servicios.
 * @param {Storage}  [options.storage]       Almacenamiento con getItem/setItem/removeItem.
 * @param {Function} [options.onStorageError] Se llama con (error, "read" | "write")
 *                                            si no se puede leer o guardar.
 */
function createCart({ catalog, storage = null, onStorageError = () => {} }) {
  // Índice id → producto para buscar en O(1) en vez de recorrer el arreglo
  const catalogById = new Map(catalog.map((item) => [item.id, item]));

  // Estado: id → cantidad. Map conserva el orden en que se agregaron.
  const lines = new Map();

  /* ---------------- Persistencia ---------------- */

  /** Guarda el carrito como [{ id, qty }]. Devuelve false si falla. */
  function save() {
    if (!storage) return false;
    try {
      const data = Array.from(lines, ([id, qty]) => ({ id, qty }));
      storage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      // Ej. modo privado de Safari o cuota llena
      onStorageError(error, "write");
      return false;
    }
  }

  /**
   * Lee el carrito guardado. Ignora datos corruptos, productos que ya
   * no existen y cantidades inválidas en lugar de romper la página.
   */
  function load() {
    lines.clear();
    if (!storage) return;

    let saved;
    try {
      saved = JSON.parse(storage.getItem(CART_STORAGE_KEY) || "[]");
    } catch (error) {
      onStorageError(error, "read");
      storage.removeItem?.(CART_STORAGE_KEY);
      return;
    }

    if (!Array.isArray(saved)) return;

    saved.forEach((entry) => {
      const product = catalogById.get(entry?.id);
      const qty = Number(entry?.qty);
      if (product && Number.isInteger(qty) && qty > 0) {
        lines.set(product.id, Math.min(qty, product.stock));
      }
    });
  }

  /* ---------------- Operaciones ---------------- */

  /**
   * Fija la cantidad de un artículo (0 lo elimina).
   * @returns {{ ok: boolean, error?: string, qty?: number }}
   */
  function setQty(id, qty) {
    const product = catalogById.get(id);
    if (!product) return { ok: false, error: CART_ERRORS.UNKNOWN_ITEM };
    if (!Number.isInteger(qty) || qty < 0) return { ok: false, error: CART_ERRORS.INVALID_QTY };
    if (qty > product.stock) {
      return { ok: false, error: CART_ERRORS.STOCK_LIMIT, qty: lines.get(id) || 0 };
    }

    if (qty === 0) {
      lines.delete(id);
    } else {
      lines.set(id, qty);
    }
    save();
    return { ok: true, qty };
  }

  /** Suma `amount` piezas (por defecto 1). */
  function add(id, amount = 1) {
    return setQty(id, (lines.get(id) || 0) + amount);
  }

  function remove(id) {
    return setQty(id, 0);
  }

  function clear() {
    lines.clear();
    save();
  }

  /* ---------------- Consultas ---------------- */

  /** Artículos con datos del catálogo, listos para pintar. */
  function getItems() {
    return Array.from(lines, ([id, qty]) => {
      const product = catalogById.get(id);
      return { ...product, qty, lineTotal: product.price * qty };
    });
  }

  /**
   * Calcula todos los totales en una sola pasada.
   * El envío solo aplica si hay productos físicos y no se alcanza el mínimo.
   */
  function getSummary() {
    let count = 0;
    let subtotal = 0;
    let hasPhysical = false;

    lines.forEach((qty, id) => {
      const product = catalogById.get(id);
      count += qty;
      subtotal += product.price * qty;
      hasPhysical = hasPhysical || product.type === "product";
    });

    const freeShipping = !hasPhysical || subtotal >= FREE_SHIPPING_FROM;
    const shipping = count === 0 || freeShipping ? 0 : SHIPPING_COST;

    return {
      count,
      subtotal,
      shipping,
      total: subtotal + shipping,
      missingForFreeShipping: hasPhysical ? Math.max(0, FREE_SHIPPING_FROM - subtotal) : 0
    };
  }

  function getQty(id) {
    return lines.get(id) || 0;
  }

  function getProduct(id) {
    return catalogById.get(id);
  }

  load();

  return { load, add, setQty, remove, clear, getItems, getSummary, getQty, getProduct };
}
