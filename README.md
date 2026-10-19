# Gravity MTB 🚵

Landing page interactiva de una tienda de **downhill MTB**, hecha para el Hackathon 1 de Generation México.

## Cómo ejecutarla

No necesita instalación: abre `index.html` en el navegador (o usa *Live Server* en VS Code).
Las pruebas del carrito están en `tests/index.html`.

## Qué incluye

- **Catálogo con filtros**: bicis, protección y componentes, cada uno con su **nivel de pista** (verde, azul, negra, doble negra) como en un bike park.
- **Servicios reservables**: afinación de suspensión, taller, shuttle y clínica de técnica; se agregan al carrito igual que un producto.
- **Carrito lateral** con cantidades, límite de stock, barra de progreso hacia envío gratis y pago simulado.
- **LocalStorage**: el carrito se guarda, se valida al cargar (descarta datos corruptos o productos inexistentes) y se sincroniza entre pestañas.
- **Animaciones**: el producto "vuela" en parábola al carrito, aparición al hacer scroll, montañas con parallax, línea de bajada que se dibuja, contadores animados.
- **Altímetro**: al bajar por la página, la altitud desciende de 2,450 m a la meta. En pantallas medianas y móviles se convierte en una barra de progreso.
- **Responsive y accesible**: menú móvil, navegación con teclado, `Escape` cierra paneles y se respeta `prefers-reduced-motion`.

## Estructura

```
index.html          Estructura y contenido de la página
css/styles.css      Estilos organizados por secciones con variables CSS
js/products.js      Catálogo de productos y servicios
js/art.js           Ilustraciones SVG de los servicios e ícono de respaldo
js/cart.js          Lógica del carrito (sin DOM, fácil de probar)
js/app.js           Interfaz: render, eventos y animaciones
img/products/       Fotos oficiales de los productos
tests/              Pruebas unitarias del carrito en el navegador
```

## Herramientas

HTML5, CSS3 (sin frameworks), JavaScript (vanilla) y Visual Studio Code.

## Créditos de imágenes

Las fotos en `img/products/` son imágenes oficiales de YT Industries, Alpinestars, Fox Factory y Maxxis,
usadas solo como referencia en este proyecto académico sin fines comerciales. Pertenecen a sus respectivas marcas.
