/**
 * Interfaz de Gravity MTB.
 *
 * Conecta el catálogo (products.js) y la lógica del carrito (cart.js)
 * con el DOM: pinta tarjetas, maneja eventos, animaciones y notificaciones.
 * Todo vive dentro de una IIFE para no contaminar el ámbito global.
 */
(() => {
  "use strict";

  /* =================================================================
     CONFIGURACIÓN Y REFERENCIAS
     ================================================================= */

  const ALTITUDE_TOP = 2450;
  const ALTITUDE_FINISH = 1150;
  const TOAST_DURATION = 3200;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const currency = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  });
  const numberFormat = new Intl.NumberFormat("es-MX");

  /** Referencias al DOM que se usan más de una vez. */
  const dom = {
    header: document.querySelector(".header"),
    nav: document.getElementById("main-nav"),
    menuBtn: document.getElementById("menu-btn"),
    productGrid: document.getElementById("product-grid"),
    serviceGrid: document.getElementById("service-grid"),
    filters: document.querySelector(".filters"),
    cartBtn: document.getElementById("cart-btn"),
    cartCount: document.getElementById("cart-count"),
    cartDrawer: document.getElementById("cart-drawer"),
    cartClose: document.getElementById("cart-close"),
    cartList: document.getElementById("cart-list"),
    overlay: document.getElementById("overlay"),
    subtotal: document.getElementById("cart-subtotal"),
    shipping: document.getElementById("cart-shipping"),
    total: document.getElementById("cart-total"),
    shippingText: document.getElementById("shipping-text"),
    shippingBar: document.getElementById("shipping-bar"),
    checkoutBtn: document.getElementById("checkout-btn"),
    clearBtn: document.getElementById("clear-btn"),
    toasts: document.getElementById("toasts"),
    altimeter: document.querySelector(".altimeter"),
    altimeterValue: document.getElementById("altimeter-value"),
    mountains: document.querySelectorAll(".mountain"),
    hero: document.querySelector(".hero"),
    newsletterForm: document.getElementById("newsletter-form"),
    newsletterEmail: document.getElementById("newsletter-email"),
    newsletterError: document.getElementById("newsletter-error"),
    year: document.getElementById("year")
  };

  /* =================================================================
     ALMACENAMIENTO Y CARRITO
     ================================================================= */

  /**
   * Devuelve localStorage solo si realmente se puede escribir en él
   * (puede estar bloqueado por el navegador o en modo privado).
   */
  function getAvailableStorage() {
    try {
      const testKey = "__gravity_test__";
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch {
      return null;
    }
  }

  const storage = getAvailableStorage();
  let storageWarningShown = false;

  /**
   * Avisa al usuario de problemas con LocalStorage.
   * - "read":  los datos guardados estaban dañados y se descartaron.
   * - "write": no se puede guardar (se avisa una sola vez).
   */
  function warnStorageProblem(error, operation = "write") {
    if (operation === "read") {
      showToast("Tu carrito guardado estaba dañado, así que lo reiniciamos.", "info");
      return;
    }
    if (storageWarningShown) return;
    storageWarningShown = true;
    showToast("No pudimos guardar tu carrito en este navegador. Seguirá activo mientras no recargues.", "error");
  }

  const cart = createCart({
    catalog: CATALOG,
    storage,
    onStorageError: warnStorageProblem
  });

  /** Mensajes amigables para cada error del carrito. */
  const ERROR_MESSAGES = {
    [CART_ERRORS.STOCK_LIMIT]: (product) => `Solo hay ${product.stock} disponible(s) de ${product.name}.`,
    [CART_ERRORS.UNKNOWN_ITEM]: () => "Ese artículo ya no está disponible.",
    [CART_ERRORS.INVALID_QTY]: () => "Cantidad no válida."
  };

  function showCartError(result, id) {
    const buildMessage = ERROR_MESSAGES[result.error] || (() => "Algo salió mal, intenta de nuevo.");
    showToast(buildMessage(cart.getProduct(id) || {}), "error");
  }

  /* =================================================================
     PLANTILLAS (HTML de tarjetas y líneas del carrito)
     ================================================================= */

  function levelBadge(level) {
    if (!level) return "";
    return `<span class="level level--${level} card__level">${LEVEL_LABELS[level]}</span>`;
  }

  /** Foto del producto o, si no tiene (servicios), su ilustración SVG. */
  function mediaTemplate(item) {
    if (!item.image) return getArt(item.art);
    return `<img src="${item.image}" alt="${item.brand || ""} ${item.name}" loading="lazy"
                 decoding="async" data-photo>`;
  }

  function specsList(specs = []) {
    return `<ul class="card__specs">${specs.map((spec) => `<li>${spec}</li>`).join("")}</ul>`;
  }

  /**
   * Tarjeta reutilizable para productos y servicios.
   * @param {Object} item   elemento del catálogo
   * @param {number} index  posición, usada para escalonar la animación
   */
  function cardTemplate(item, index) {
    const isService = item.type === "service";
    const buttonLabel = isService ? "Reservar" : "Agregar";
    const priceNote = isService ? "por servicio" : "IVA incluido";

    return `
      <article class="card ${isService ? "card--service" : ""}" data-category="${item.category}" style="--i:${index}">
        <div class="card__art ${item.image ? "has-photo" : ""}">
          ${mediaTemplate(item)}
          ${levelBadge(item.level)}
          ${item.tag ? `<span class="card__tag">${item.tag}</span>` : ""}
        </div>
        <div class="card__body">
          ${item.brand ? `<p class="card__brand">${item.brand}</p>` : ""}
          <h3 class="card__title">${item.name}</h3>
          <p class="card__text">${item.description}</p>
          ${specsList(item.specs)}
          <div class="card__footer">
            <p class="card__price">
              ${item.oldPrice ? `<s class="card__old-price">${currency.format(item.oldPrice)}</s>` : ""}
              ${currency.format(item.price)}<small>${priceNote}</small>
            </p>
            <button class="btn btn--primary add-btn" type="button" data-add="${item.id}"
                    data-label="${buttonLabel}" aria-label="${buttonLabel} ${item.name}">
              ${buttonLabel}
            </button>
          </div>
        </div>
      </article>`;
  }

  function cartItemTemplate(item) {
    const atLimit = item.qty >= item.stock;
    return `
      <li class="cart-item" data-id="${item.id}">
        <div class="cart-item__art ${item.image ? "has-photo" : ""}">${mediaTemplate(item)}</div>
        <div>
          <p class="cart-item__name">${item.name}</p>
          <p class="cart-item__price">${currency.format(item.price)} c/u</p>
        </div>
        <div class="cart-item__side">
          <div class="qty" role="group" aria-label="Cantidad de ${item.name}">
            <button class="qty__btn" type="button" data-action="decrease" aria-label="Quitar uno">−</button>
            <span class="qty__value">${item.qty}</span>
            <button class="qty__btn" type="button" data-action="increase" aria-label="Agregar uno"
                    ${atLimit ? "disabled" : ""}>+</button>
          </div>
          <button class="cart-item__remove" type="button" data-action="remove">Quitar</button>
        </div>
      </li>`;
  }

  /* =================================================================
     RENDER
     ================================================================= */

  /** Pinta productos filtrados por categoría ("all" = todos). */
  function renderProducts(category = "all") {
    const products = CATALOG.filter(
      (item) => item.type === "product" && (category === "all" || item.category === category)
    );
    dom.productGrid.innerHTML = products.map(cardTemplate).join("");
    syncAllAddButtons();
  }

  function renderServices() {
    const services = CATALOG.filter((item) => item.type === "service");
    dom.serviceGrid.innerHTML = services.map(cardTemplate).join("");
  }

  /** Vuelve a pintar el carrito completo y sus totales. */
  function renderCart() {
    const items = cart.getItems();
    const summary = cart.getSummary();

    dom.cartList.innerHTML = items.map(cartItemTemplate).join("");
    dom.cartDrawer.dataset.empty = String(items.length === 0);
    dom.cartCount.textContent = summary.count;

    dom.subtotal.textContent = currency.format(summary.subtotal);
    dom.shipping.textContent = summary.shipping === 0 ? "Gratis" : currency.format(summary.shipping);
    dom.total.textContent = currency.format(summary.total);

    renderShippingMeter(summary);
  }

  /** Barra de progreso hacia el envío gratis. */
  function renderShippingMeter({ subtotal, missingForFreeShipping }) {
    const progress = Math.min(1, subtotal / FREE_SHIPPING_FROM);
    dom.shippingBar.style.width = `${progress * 100}%`;
    dom.shippingText.innerHTML = missingForFreeShipping > 0
      ? `Te faltan <strong>${currency.format(missingForFreeShipping)}</strong> para envío gratis.`
      : "<strong>¡Tienes envío gratis!</strong> 🤘";
  }

  /** Actualiza el botón "Agregar" de un artículo según su stock en el carrito. */
  function syncAddButton(button) {
    const id = button.dataset.add;
    const product = cart.getProduct(id);
    const isFull = cart.getQty(id) >= product.stock;
    button.disabled = isFull;
    button.textContent = isFull ? "Máximo" : button.dataset.label;
  }

  function syncAddButtonById(id) {
    const button = document.querySelector(`[data-add="${id}"]`);
    if (button) syncAddButton(button);
  }

  function syncAllAddButtons() {
    document.querySelectorAll("[data-add]").forEach(syncAddButton);
  }

  /* =================================================================
     ACCIONES DEL CARRITO
     ================================================================= */

  /** Clic en "Agregar"/"Reservar" (delegación de eventos en las rejillas). */
  function handleAddClick(event) {
    const button = event.target.closest("[data-add]");
    if (!button) return;

    const id = button.dataset.add;
    const result = cart.add(id);

    if (!result.ok) {
      showCartError(result, id);
      return;
    }

    const product = cart.getProduct(id);
    const media = button.closest(".card").querySelector(".card__art img, .card__art svg");

    flyToCart(media, product);
    flashButton(button);
    renderCart();
    showToast(`${product.name} agregado al carrito.`);
  }

  /** Clic en +, − o Quitar dentro del carrito. */
  function handleCartClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const id = button.closest(".cart-item").dataset.id;
    const actions = {
      increase: () => cart.add(id),
      decrease: () => cart.add(id, -1),
      remove: () => animateRemoval(id)
    };

    const result = actions[button.dataset.action]();
    if (result && !result.ok) {
      showCartError(result, id);
      return;
    }
    if (button.dataset.action === "remove") return;

    // Si bajó a 0 se elimina con la misma animación
    if (cart.getQty(id) === 0) {
      animateRemoval(id, false);
      return;
    }
    renderCart();
    syncAddButtonById(id);
  }

  /**
   * Desliza la línea fuera del carrito y luego la elimina.
   * @param {string}  id
   * @param {boolean} [removeFromCart=true] false si ya se quitó del estado
   */
  function animateRemoval(id, removeFromCart = true) {
    const row = dom.cartList.querySelector(`[data-id="${id}"]`);
    const finish = () => {
      if (removeFromCart) cart.remove(id);
      renderCart();
      syncAddButtonById(id);
    };

    if (!row || prefersReducedMotion) {
      finish();
      return;
    }
    row.classList.add("is-removing");
    row.addEventListener("animationend", finish, { once: true });
  }

  function handleClear() {
    if (!window.confirm("¿Vaciar todo el carrito?")) return;
    cart.clear();
    renderCart();
    syncAllAddButtons();
    showToast("Carrito vacío.", "info");
  }

  /** Simula el pago: no hay backend, así que solo confirma y limpia. */
  function handleCheckout() {
    const { count, total } = cart.getSummary();
    if (count === 0) {
      showToast("Agrega algo al carrito antes de pagar.", "error");
      return;
    }

    dom.checkoutBtn.disabled = true;
    dom.checkoutBtn.textContent = "Procesando…";

    window.setTimeout(() => {
      const orderNumber = `GRV-${Date.now().toString().slice(-6)}`;
      cart.clear();
      renderCart();
      syncAllAddButtons();
      closeCart();
      dom.checkoutBtn.disabled = false;
      dom.checkoutBtn.textContent = "Finalizar compra";
      showToast(`¡Pedido ${orderNumber} confirmado por ${currency.format(total)}! Nos vemos en la pista.`);
    }, 1200);
  }

  /* =================================================================
     ANIMACIONES
     ================================================================= */

  /**
   * Hace "volar" una copia de la ilustración hasta el botón del carrito
   * siguiendo una parábola: el eje X se mueve lineal y el eje Y con
   * una curva que primero sube y luego cae.
   */
  function flyToCart(sourceEl, product) {
    if (!sourceEl || prefersReducedMotion) {
      bumpCart();
      return;
    }

    const from = sourceEl.getBoundingClientRect();
    const to = dom.cartBtn.getBoundingClientRect();
    const size = Math.min(from.width, 140);

    const outer = document.createElement("div");
    const inner = document.createElement("div");
    outer.className = "fly-item";
    outer.style.cssText = `left:${from.left + (from.width - size) / 2}px; top:${from.top + (from.height - size) / 2}px; width:${size}px; height:${size}px;`;
    inner.style.cssText = "width:100%; height:100%;";
    inner.innerHTML = sourceEl.tagName === "IMG"
      ? `<img src="${sourceEl.currentSrc}" alt="">`
      : getArt(product.art);
    outer.append(inner);
    document.body.append(outer);

    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const duration = 750;

    outer.animate(
      [{ transform: "translateX(0)" }, { transform: `translateX(${dx}px)` }],
      { duration, easing: "linear", fill: "forwards" }
    );
    inner.animate(
      [
        { transform: "translateY(0) scale(1) rotate(0)", opacity: 1 },
        { transform: `translateY(${dy}px) scale(0.15) rotate(-25deg)`, opacity: 0.7 }
      ],
      { duration, easing: "cubic-bezier(0.5, -0.5, 0.9, 0.6)", fill: "forwards" }
    ).finished.then(() => {
      outer.remove();
      bumpCart();
    });
  }

  /**
   * Si una foto no carga (sin conexión, archivo faltante), se cambia por
   * el ícono genérico de montaña para que la tarjeta nunca quede vacía.
   */
  function handleImageError(event) {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || !img.hasAttribute("data-photo")) return;

    img.parentElement.classList.remove("has-photo");
    img.outerHTML = getArt();
  }

  /** Pequeño rebote del botón del carrito. */
  function bumpCart() {
    dom.cartBtn.classList.remove("is-bumping");
    void dom.cartBtn.offsetWidth; // fuerza reflow para reiniciar la animación
    dom.cartBtn.classList.add("is-bumping");
  }

  /** Muestra "✓ Listo" un momento en el botón presionado. */
  function flashButton(button) {
    button.classList.add("is-added");
    button.textContent = "✓ Listo";
    window.setTimeout(() => {
      button.classList.remove("is-added");
      syncAddButton(button);
    }, 900);
  }

  /** Cuenta animada de 0 al valor final para las cifras del hero. */
  function animateCounter(element) {
    const target = Number(element.dataset.count);
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = numberFormat.format(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* =================================================================
     NOTIFICACIONES
     ================================================================= */

  /**
   * @param {string} message
   * @param {"success"|"error"|"info"} [type="success"]
   */
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.textContent = message; // textContent evita inyectar HTML
    dom.toasts.append(toast);

    window.setTimeout(() => {
      toast.classList.add("is-leaving");
      toast.addEventListener("animationend", () => toast.remove(), { once: true });
    }, TOAST_DURATION);
  }

  /* =================================================================
     PANEL DEL CARRITO (abrir / cerrar)
     ================================================================= */

  function openCart() {
    dom.cartDrawer.classList.add("is-open");
    dom.cartDrawer.setAttribute("aria-hidden", "false");
    dom.cartBtn.setAttribute("aria-expanded", "true");
    dom.overlay.hidden = false;
    document.body.classList.add("is-locked");
    dom.cartClose.focus();
  }

  function closeCart() {
    if (!dom.cartDrawer.classList.contains("is-open")) return;
    dom.cartDrawer.classList.remove("is-open");
    dom.cartDrawer.setAttribute("aria-hidden", "true");
    dom.cartBtn.setAttribute("aria-expanded", "false");
    dom.overlay.hidden = true;
    document.body.classList.remove("is-locked");
    dom.cartBtn.focus();
  }

  /* =================================================================
     INICIALIZADORES
     ================================================================= */

  function initFilters() {
    dom.filters.addEventListener("click", (event) => {
      const chip = event.target.closest("[data-filter]");
      if (!chip || chip.classList.contains("is-active")) return;

      dom.filters.querySelector(".is-active").classList.remove("is-active");
      dom.filters.querySelector("[aria-pressed='true']").setAttribute("aria-pressed", "false");
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      renderProducts(chip.dataset.filter);
    });
  }

  function initCart() {
    dom.productGrid.addEventListener("click", handleAddClick);
    dom.serviceGrid.addEventListener("click", handleAddClick);
    dom.cartList.addEventListener("click", handleCartClick);

    // "error" no burbujea: se escucha en fase de captura para todas las fotos
    document.addEventListener("error", handleImageError, true);
    dom.cartBtn.addEventListener("click", openCart);
    dom.cartClose.addEventListener("click", closeCart);
    dom.overlay.addEventListener("click", closeCart);
    dom.clearBtn.addEventListener("click", handleClear);
    dom.checkoutBtn.addEventListener("click", handleCheckout);
    document.querySelector("[data-close-cart]").addEventListener("click", closeCart);

    // Mantiene el carrito sincronizado si se modifica en otra pestaña
    window.addEventListener("storage", (event) => {
      if (event.key !== CART_STORAGE_KEY) return;
      cart.load();
      renderCart();
      syncAllAddButtons();
    });
  }

  function initNav() {
    const toggleMenu = (open) => {
      dom.nav.classList.toggle("is-open", open);
      dom.menuBtn.setAttribute("aria-expanded", String(open));
    };

    dom.menuBtn.addEventListener("click", () => toggleMenu(!dom.nav.classList.contains("is-open")));
    dom.nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) toggleMenu(false);
    });

    // Escape cierra cualquier panel abierto
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      toggleMenu(false);
      closeCart();
    });

    // Resalta el enlace de la sección visible
    const links = new Map(
      Array.from(dom.nav.querySelectorAll(".nav__link"), (link) => [link.hash.slice(1), link])
    );
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        links.get(entry.target.id)?.classList.toggle("is-current", entry.isIntersecting);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    links.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /** Aparición de elementos al entrar en pantalla + contadores del hero. */
  function initReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        entry.target.querySelectorAll("[data-count]").forEach(animateCounter);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
  }

  /**
   * Un solo manejador de scroll (limitado con requestAnimationFrame) para:
   * encabezado, altímetro y parallax de las montañas.
   */
  function initScrollEffects() {
    let ticking = false;

    const update = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, scrollY / maxScroll) : 0;
      const altitude = ALTITUDE_TOP - progress * (ALTITUDE_TOP - ALTITUDE_FINISH);

      dom.header.classList.toggle("is-scrolled", scrollY > 10);
      dom.altimeter.style.setProperty("--progress", progress.toFixed(4));
      dom.altimeterValue.textContent = `${numberFormat.format(Math.round(altitude))} m`;

      // Parallax solo mientras el hero está visible
      if (!prefersReducedMotion && scrollY < dom.hero.offsetHeight) {
        dom.mountains.forEach((mountain) => {
          mountain.style.transform = `translateY(${scrollY * Number(mountain.dataset.depth)}px)`;
        });
      }
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  function initNewsletter() {
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const setError = (message) => {
      dom.newsletterError.textContent = message;
      dom.newsletterEmail.classList.toggle("is-invalid", Boolean(message));
      dom.newsletterEmail.setAttribute("aria-invalid", String(Boolean(message)));
    };

    dom.newsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = dom.newsletterEmail.value.trim();

      if (!email) {
        setError("Escribe tu correo para unirte.");
      } else if (!EMAIL_PATTERN.test(email)) {
        setError("Ese correo no parece válido (ej. rider@correo.com).");
      } else {
        setError("");
        dom.newsletterForm.reset();
        showToast(`¡Bienvenido a la crew! Te escribiremos a ${email}.`);
        return;
      }
      // Reinicia la animación de "sacudida" en cada intento fallido
      dom.newsletterEmail.classList.remove("is-invalid");
      void dom.newsletterEmail.offsetWidth;
      dom.newsletterEmail.classList.add("is-invalid");
      dom.newsletterEmail.focus();
    });

    dom.newsletterEmail.addEventListener("input", () => setError(""));
  }

  /* =================================================================
     ARRANQUE
     ================================================================= */

  function init() {
    dom.year.textContent = new Date().getFullYear();
    renderServices();
    renderProducts(); // también sincroniza los botones de los servicios
    renderCart();
    initFilters();
    initCart();
    initNav();
    initReveal();
    initScrollEffects();
    initNewsletter();

    if (!storage) warnStorageProblem(null, "write");
  }

  init();
})();
