# Lenguajes de Marcas y Sistemas de Gestión de Información (1º DAW)

En primero de DAW, Lenguajes de Marcas consistía en XML, HTML5 y CSS3 a pelo. Al principio piensas que no sirve para mucho una vez sabes programar, pero cuando te metes a maquetar una aplicación web interactiva en React, si no tienes una buena base de maquetación semántica y estilos, el proyecto acaba pareciendo una web de los años 90.

## Diseño adaptativo (Responsive Design)

Para **IOClickd** no he usado frameworks de CSS prefabricados como Bootstrap o Tailwind (a no ser que hiciese falta por algún requisito puntual, pero prefiero SCSS puro porque te da el control absoluto). He estructurado los estilos usando Sass (SCSS) y variables globales:

- **Estructura móvil-primero (Mobile-First)**: He usado media queries para asegurar que la web se ve de lujo tanto en un monitor 4K (para comparar ratones lado a lado en pantalla dividida) como en un smartphone en la cama.
- **Flexbox y CSS Grid**: Son mis mejores amigos para estructurar layouts. Por ejemplo, el catálogo de productos (`/productos`) usa un layout en cuadrícula (`grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`) que se ajusta solo según el ancho de la pantalla, sin romper las tarjetas. Los formularios de login y registro usan Flexbox para centrar y alinear los elementos de forma limpia.
- **SCSS Modular**: Tengo las variables en `variables.scss` para los colores primarios, secundarios, espaciados y sombras. Así, si mañana quiero cambiar el color corporativo o meter un modo oscuro, cambio una línea y se actualiza toda la web.

---

## Sintaxis y SEO (Search Engine Optimization)

Aunque en las aplicaciones SPA (Single Page Application) el SEO puede ser más complicado porque el servidor solo sirve un `index.html` casi vacío y React renderiza todo por JavaScript, he aplicado buenas prácticas para que los buscadores no nos ignoren:

- **HTML Semántico**: Nada de usar `<div>` para todo. He usado etiquetas semánticas de HTML5 para estructurar los layouts: `<header>`, `<nav>` para la navegación principal, `<main>` para el contenido, `<section>` para separar bloques lógicos (como el catálogo del comparador), `<article>` para cada tarjeta de producto y `<footer>`.
- **Estructura de Headings**: Solo hay un `<h1>` por página (con el título principal) y luego va bajando en jerarquía (`<h2>`, `<h3>`) sin saltarse niveles.
- **Accesibilidad (A11y)**: Todas las imágenes tienen su atributo `alt` descriptivo (por ejemplo, si no hay imagen de producto se carga un SVG con un `aria-label` que describe el tipo de periférico). Los botones y campos de formulario tienen etiquetas `<label>` claras o `aria-label` asociados, para que los lectores de pantalla puedan leerlos sin problemas.
- **SEO Dinámico**: Las páginas importantes tienen títulos descriptivos en la pestaña del navegador para mejorar el CTR si alguien busca la web en Google.

---

## React JSX: XML metido en JavaScript

Una de las cosas más chulas de React es **JSX**. Básicamente es una extensión de la sintaxis de JavaScript que se parece un montón a HTML/XML (lo que veíamos en primero). 
En vez de estar haciendo `document.createElement` en JavaScript para meter elementos en el DOM, en React escribimos el marcado directamente dentro de los componentes. Por debajo, Babel traduce esa sintaxis de marcas a funciones de JavaScript nativas. Es súper cómodo porque te permite mezclar la lógica de programación (bucles, condicionales) con la estructura visual en el mismo archivo.

---

## Dónde encontrar en el repositorio

- **Estilos globales y variables**: `frontend/src/styles/variables.scss`
- **Maquetación JSX (Frontend)**: Toda la estructura de componentes y páginas está bajo `frontend/src/components` y `frontend/src/pages`.
- **Layout principal**: `frontend/src/layouts/MainLayout.jsx` (donde se definen las cabeceras, menús y pie de página semánticos).
- **Vistas del Backend**: Las plantillas de email (Blade, que es el motor de plantillas HTML de Laravel) están en `backend/resources/views` (por ejemplo, el correo de verificación de cuenta).
