# Diseño de Interfaces Web (2º DAW)

## Estética y sistema de diseño

La interfaz de IOClickd sigue un diseño moderno de tema oscuro con glassmorphism, inspirado en las interfaces de aplicaciones gaming y tech premium.

### Paleta de colores

Definida en [`frontend/src/styles/variables.scss`](../../frontend/src/styles/variables.scss):

- **Fondo base**: colores oscuros (`#0a0a0f`, `#111118`) — da sensación de profundidad.
- **Acento principal**: violeta/morado (tipo `#7c3aed` / `#6d28d9`) — color asociado al gaming y tecnología.
- **Acento secundario**: cian/teal para highlights y hover states.
- **Texto**: blanco con distintos niveles de opacidad para jerarquía visual.
- **Tarjetas y modales**: efecto glassmorphism con `backdrop-filter: blur()` y bordes semitransparentes.

### Tipografía

- Fuente principal: **Inter** (sans-serif moderna, muy legible a cualquier tamaño).
- Jerarquía clara: `h1` para títulos de página, `h2` para secciones, `h3` para tarjetas.

### Iconografía

- Se usan SVGs inline para iconos críticos (estado vacío, productos sin imagen) — sin dependencias de librerías de iconos.
- Los emojis se evitan en favor de SVGs para mayor consistencia cross-platform.

## Responsive design

El layout se adapta a distintos tamaños de pantalla:

- **Desktop** (≥ 1024px): grid de múltiples columnas para el catálogo, navbar horizontal.
- **Tablet** (768px – 1023px): grid reducido, navbar adaptada.
- **Móvil** (< 768px): layout de una columna, navbar con menú hamburguesa.

Los breakpoints se gestionan con media queries en SCSS, sin frameworks externos.

## Componentes y páginas con diseño destacado

### Navbar (`Navbar.jsx` + `Navbar.scss`)

- Barra fija en la parte superior con fondo semi-transparente + blur.
- Menú de navegación que se adapta: en móvil colapsa en un menú hamburguesa animado.
- Muestra el nombre del usuario y acceso al perfil si hay sesión activa.
- Indicador visual de la ruta activa.

### Catálogo de productos (`Productos.jsx` + `Productos.scss`)

- Grid de tarjetas con animación de entrada.
- Filtros por tipo con botones pill.
- Barra de búsqueda con respuesta inmediata (debounce).
- Cada tarjeta tiene hover con elevación y transición suave.
- Acciones inline (añadir al inventario, añadir a lista) aparecen en el hover.

### Comparador de ratones (`CompararRatones.jsx` + `Compare.scss`)

- Diseño de dos columnas para comparar especificaciones lado a lado.
- Resaltado visual del ganador en cada categoría de especificación.

### Inventario (`Inventario.jsx` + `Inventario.scss`)

- Layout tipo dashboard con tarjetas expandibles.
- Controles inline para modificar cantidad con `+`/`-`.
- Badge visual para el producto marcado como principal.

### Admin Dashboard (`AdminDashboard.jsx` + `Admin.scss`)

- Cards de métricas con números grandes y color de acento.
- Tabla de gestión con acciones inline (editar, eliminar, moderar).
- Tabs para navegar entre secciones (usuarios, productos, reseñas).

### Perfiles públicos (`PerfilPublico.jsx` + `PerfilPublico.scss`)

- Layout tipo "profile page" con header de cover + avatar.
- Secciones para inventario compartido, listas públicas, seguidores y seguidos.
- Botón de seguir/dejar de seguir con actualización de estado inmediata.

## Usabilidad y accesibilidad

- **Feedback visual inmediato**: toasts/notificaciones en operaciones de éxito o error.
- **Estados vacíos**: mensajes descriptivos cuando una lista o inventario está vacío, en lugar de pantallas en blanco.
- **Loading states**: indicadores de carga en las peticiones asíncronas.
- **Navegación con teclado**: los botones y links son accesibles mediante Tab.
- **Contraste**: el ratio de contraste entre texto y fondo supera los mínimos WCAG AA.
- **Atributos semánticos**: uso de `<main>`, `<nav>`, `<section>`, `<article>` y `aria-label` donde corresponde.
- **Botones descriptivos**: los botones tienen texto significativo (no solo iconos sin label).

## Dónde encontrar en el repositorio

- Estilos globales y variables: [`frontend/src/styles/`](../../frontend/src/styles/)
- Variables de diseño: [`frontend/src/styles/variables.scss`](../../frontend/src/styles/variables.scss)
- Layout base: [`frontend/src/layouts/MainLayout.jsx`](../../frontend/src/layouts/MainLayout.jsx)
- Navbar: [`frontend/src/components/Navbar.jsx`](../../frontend/src/components/Navbar.jsx)
- Páginas con diseño completo: [`frontend/src/pages/`](../../frontend/src/pages/)
