# Desarrollo Web en Entorno Cliente (2º DAW)

## Interactividad y CRUD
- Proyecto: SPA React con rutas protegidas y formularios para CRUD (productos, listas, inventario, reseñas, consultas).
- TODO: enlazar ejemplos concretos de validación de formularios y casos de prueba.

## Organización del código
- Buenas prácticas: separación en archivos `HTML`/JSX, CSS/SCSS y ficheros JS; en este proyecto hay `src/` con `components`, `pages`, `styles`.
- TODO: añadir ejemplos de estructura de carpetas y explicación de responsabilidades.

## Explicación de la lógica
- TODO: describir la interacción principal (ej.: flujo de creación de lista → añadir producto → ver en inventario) y cómo se gestiona el estado.

## Dónde encontrar en el repositorio

- Páginas y forms: [frontend/src/pages](frontend/src/pages) (ej.: `Register.jsx`, `Login.jsx`, `Productos.jsx`, `ProductoDetail.jsx`)
- Componentes reutilizables: [frontend/src/components](frontend/src/components) (ej.: `Navbar.jsx`, `ProtectedRoute.jsx`)
- Gestión de estado/Context: [frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx)
- Consumo de API: [frontend/src/services/api.js](frontend/src/services/api.js)
