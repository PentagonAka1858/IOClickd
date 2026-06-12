# Desarrollo Web en Entorno Cliente (2º DAW)

## Tecnologías utilizadas

- **React 18** como librería de UI — componentes funcionales con Hooks (`useState`, `useEffect`, `useContext`, `useRef`, `useCallback`).
- **Vite** como bundler y servidor de desarrollo — arranque en milisegundos, HMR nativo.
- **React Router v6** para el enrutado SPA: rutas anidadas, rutas protegidas y navegación programática con `useNavigate`.
- **SCSS** para los estilos — variables globales, partials y un sistema de diseño consistente con paleta oscura y glassmorphism.
- **Axios** para las peticiones HTTP, configurado con `withCredentials: true` para enviar las cookies de sesión de Sanctum.

## Organización del código

```
frontend/src/
├── App.jsx                  # Definición de rutas (BrowserRouter + Routes)
├── main.jsx                 # Punto de entrada
├── context/
│   └── AuthContext.jsx      # Estado global de autenticación (usuario, login, logout)
├── components/
│   ├── Navbar.jsx           # Barra de navegación con menú responsive
│   └── ProtectedRoute.jsx   # HOC que redirige a /login si no hay sesión
├── hooks/                   # Custom hooks reutilizables
├── layouts/
│   └── MainLayout.jsx       # Layout base con Navbar y contenido
├── pages/                   # Una página por ruta de la aplicación
├── services/
│   └── api.js               # Instancia de Axios con baseURL y configuración CSRF
├── styles/
│   ├── variables.scss       # Tokens de diseño (colores, fuentes, espaciados)
│   ├── partials/            # Fragmentos SCSS reutilizables
│   └── [Pagina].scss        # Estilos específicos por página
└── utils/                   # Funciones de utilidad puras
```

## Interactividad y CRUD implementado

### Gestión de estado con Context API

El `AuthContext` centraliza el estado del usuario autenticado. Al iniciar la app se hace una petición a `/api/user`; si responde correctamente se hidrata el contexto. El resto de componentes consumen el contexto con `useContext(AuthContext)` para saber si hay sesión y cuál es el rol.

### Formularios y validación

- **Register** (`Register.jsx`): validación de campos en el cliente (contraseñas coincidentes, email válido) antes de hacer el POST. Muestra errores inline por campo.
- **Login** (`Login.jsx`): manejo de errores 401/422 con mensajes de feedback al usuario.
- **AdminProductEdit / AdminProductCreate**: formularios con campos para modelo, marca, tipo, descripción, imagen y fecha de salida. Validación frontend antes de enviar.
- **Reseñas** (en `ProductoDetail.jsx`): slider de puntuación 1-10, textarea, control de si ya existe reseña propia para mostrar/ocultar el formulario.

### Operaciones CRUD completas

| Funcionalidad | Crear | Leer | Editar | Eliminar |
|--------------|-------|------|--------|---------|
| Productos (admin) | ✅ | ✅ | ✅ | ✅ |
| Inventario | ✅ | ✅ | ✅ (cantidad/principal) | ✅ |
| Listas personales | ✅ | ✅ | ✅ | ✅ |
| Reseñas | ✅ | ✅ | — | ✅ |
| Consultas | ✅ | ✅ | — | — |
| Mensajes de consulta | ✅ | ✅ | — | ✅ |
| Seguimientos | ✅ | ✅ | — | ✅ |
| Favoritos | ✅ | ✅ | — | ✅ |

### Flujo principal de ejemplo

1. Usuario entra en `/productos` → el componente `Productos.jsx` carga el catálogo con `GET /api/productos`.
2. Filtra por tipo (ej. `RATON`) → el estado `filtroTipo` actualiza el parámetro de la petición y re-renderiza.
3. Hace clic en "Añadir al inventario" → `POST /api/inventario` con `producto_id`.
4. Se muestra un toast de confirmación y el contador del inventario se actualiza localmente.
5. Va a `/inventario` → ve el producto, cambia la cantidad → `PUT /api/inventario/{id}`.

## Dónde encontrar en el repositorio

- Páginas: [`frontend/src/pages/`](../../frontend/src/pages/)
- Componentes: [`frontend/src/components/`](../../frontend/src/components/)
- Estado global: [`frontend/src/context/AuthContext.jsx`](../../frontend/src/context/AuthContext.jsx)
- Consumo de API: [`frontend/src/services/api.js`](../../frontend/src/services/api.js)
- Estilos globales: [`frontend/src/styles/variables.scss`](../../frontend/src/styles/variables.scss)
- Rutas: [`frontend/src/App.jsx`](../../frontend/src/App.jsx)
