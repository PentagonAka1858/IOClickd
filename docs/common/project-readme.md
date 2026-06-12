
# Documentación técnica completa — IOClickd

Este fichero es la referencia principal del proyecto. Consulta el índice de asignaturas en [`docs/index.md`](../index.md).

---

## 1. Manual de usuario

### 1.1 Registro e inicio de sesión

- Accede a `/register` para crear una cuenta: nombre, email, contraseña y confirmación.
- Tras registrarte recibes un **email de verificación**; hasta que no lo confirmes algunas rutas pueden estar restringidas.
- Si no has recibido el correo, puedes reenvíarlo desde `/resend-verification`.
- Inicio de sesión en `/login` con email y contraseña.
- La sesión se gestiona con **cookies HttpOnly** a través de Laravel Sanctum — no hay tokens JWT en localStorage.
- Tras autenticarte se desbloquean: inventario, listas, consultas, perfil propio y (si eres admin) el panel de administración.

### 1.2 Catálogo de productos

- Ruta pública: `/productos`.
- Búsqueda por texto libre (marca o modelo) y filtro por tipo: `RATON`, `TECLADO`, `AURICULAR`, `MONITOR`, `ALFOMBRILLA`, `OTRO`.
- Cada tarjeta muestra imagen (o icono SVG si no hay), marca, modelo y tipo.
- Sin iniciar sesión puedes navegar al detalle; con sesión puedes añadir al inventario o a una lista directamente desde la tarjeta.

### 1.3 Detalle de producto

- Ruta: `/productos/:id`.
- Información básica del producto + especificaciones técnicas detalladas + características reales reportadas por la comunidad.
- Sección de reseñas: puntuación de 1 a 10, comentario, votos (👍/👎), borrado de la propia reseña.
- El nombre de cada reseñador es un enlace a su perfil público (`/perfiles/:id`).
- Acciones rápidas: añadir al inventario, añadir a lista existente o crear una nueva al vuelo.

### 1.4 Comparador de ratones

- Ruta pública: `/productos/comparar-ratones`.
- Permite seleccionar hasta 2 ratones del catálogo y ver sus especificaciones lado a lado.
- Los datos de comparación vienen de `caracteristicas_detalladas` en la API.

### 1.5 Inventario personal

- Ruta protegida: `/inventario`.
- Lista de productos que el usuario ha guardado.
- Operaciones: ajustar cantidad, marcar como **principal/destacado**, eliminar.
- Notificación visual de éxito al añadir un producto desde el catálogo.

### 1.6 Listas personales

- Ruta protegida: `/listas`.
- Crear, editar (nombre, descripción, visibilidad pública/privada) y eliminar listas.
- Detalle de lista en `/listas/:id`: ver y eliminar productos de la lista.
- Desde el catálogo o detalle de producto se puede añadir a una lista existente o crear una nueva directamente.

### 1.7 Consultas y soporte

- Ruta protegida: `/consultas`.
- Crear una consulta nueva (mensaje inicial).
- Listado de tus consultas con estado: `ABIERTA`, `EN_PROCESO`, `CERRADA`.
- Detalle en `/consultas/:id`: historial de mensajes y botón para continuar la conversación.
- El equipo de soporte (usuarios con rol `MOD` o `ADMIN`) puede asignar y cerrar consultas.

### 1.8 Perfiles de usuario

- Tu propio perfil: `/perfil` (protegido). Puedes editar datos básicos.
- Perfiles públicos: `/perfiles` (búsqueda) y `/perfiles/:id` (detalle).
- En el perfil público puedes ver el inventario compartido del usuario, sus listas públicas y seguirle/dejar de seguirle.

### 1.9 Panel de administración

- Ruta protegida (solo `ADMIN`/`MOD`): `/admin`.
- Métricas generales: usuarios, productos, reseñas.
- Gestión de usuarios: ver listado, activar/desactivar cuenta, eliminar.
- Gestión de productos: crear (`/admin/productos/create`), editar (`/admin/productos/:id/edit`), eliminar.
- Moderación de reseñas: ocultar/mostrar reseñas reportadas.

---

## 2. Manual de instalación y despliegue

### 2.1 Requisitos del sistema

**Desarrollo local:**
- PHP 8.2+ (el Dockerfile usa PHP 8.4)
- Composer 2
- Node.js 20+ / npm 10+
- MySQL 8.0 (o MariaDB compatible)
- Git

**Despliegue con Docker (recomendado):**
- Docker Engine 24+
- Docker Compose v2

### 2.2 Configuración del backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Edita `backend/.env` con tus datos de base de datos:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pfg_db
DB_USERNAME=root
DB_PASSWORD=tu_password
```

Luego:

```bash
php artisan migrate
php artisan db:seed   # opcional, carga datos de ejemplo
php artisan serve     # escucha en http://localhost:8000
```

### 2.3 Configuración del frontend

```bash
cd frontend
npm install
npm run dev   # Vite arranca en http://localhost:5173
```

El frontend consume la API en `http://localhost:8000/api`. Si cambias el puerto del backend, actualiza la baseURL en [`frontend/src/services/api.js`](../../frontend/src/services/api.js).

### 2.4 Variables de entorno relevantes

#### Backend (`backend/.env`)

| Variable | Descripción |
|----------|-------------|
| `APP_NAME` | Nombre de la app (IOClickd) |
| `APP_ENV` | `local` / `production` |
| `APP_KEY` | Clave generada por `artisan key:generate` |
| `APP_DEBUG` | `true` en dev, `false` en prod |
| `APP_URL` | URL del backend |
| `FRONTEND_URL` | URL del frontend (para CORS y redirects de email) |
| `DB_*` | Conexión a MySQL |
| `SESSION_DRIVER` | `cookie` (necesario para Sanctum SPA) |
| `SESSION_DOMAIN` | Dominio compartido entre front y back |
| `MAIL_MAILER` | Driver de correo (`smtp`, `log`, etc.) |
| `MAIL_FROM_ADDRESS` | Email de origen para verificaciones |

#### Frontend

- En desarrollo no se necesita ningún `.env` especial.
- En producción (Docker), se inyecta `VITE_API_URL` como variable de entorno al hacer `npm run build`.

### 2.5 Despliegue con Docker

El directorio `docker/` contiene toda la configuración necesaria para levantar el proyecto en contenedores.

**Servicios incluidos en `docker-compose.yml`:**

| Servicio | Imagen base | Función |
|----------|------------|---------|
| `db` | `mysql:8.0` | Base de datos persistente |
| `backend` | `php:8.4-fpm` + Composer | API Laravel |
| `frontend` | `node:20-alpine` | Build de Vite y preview |
| `nginx` | `nginx:alpine` | Proxy inverso, SSL y servicio de estáticos |

**Pasos para levantar:**

```bash
cd docker
cp .env.example .env   # ajusta credenciales si quieres
docker-compose up -d --build
```

Al arrancar, el entrypoint del backend ejecuta automáticamente:
- `php artisan config:clear`
- `php artisan migrate --force`
- `php artisan db:seed`

**Acceso:**

| Recurso | URL |
|---------|-----|
| Aplicación web | `http://localhost` |
| API REST | `http://localhost:8000/api` |
| MySQL (externo) | `localhost:3307` |

**Comandos útiles:**

```bash
# Ver logs en tiempo real
docker-compose logs -f backend

# Ejecutar Artisan dentro del contenedor
docker-compose exec backend php artisan tinker

# Parar todo (conserva la BD)
docker-compose down

# Parar y borrar volúmenes (DESTRUYE la BD)
docker-compose down -v
```

Más detalle en [`docker/README.md`](../../docker/README.md).

---

## 3. Documentación técnica

### 3.1 Arquitectura del sistema

```
┌─────────────────────────────────┐
│  Navegador (usuario)            │
│  React 18 + Vite + SCSS         │
│  React Router v6 (SPA)          │
│  Axios + cookies (Sanctum)      │
└──────────────┬──────────────────┘
               │ HTTP/HTTPS (JSON)
┌──────────────▼──────────────────┐
│  Nginx (proxy inverso + SSL)    │
└──────┬──────────────┬───────────┘
       │              │
┌──────▼──────┐  ┌────▼───────────┐
│  Laravel 11 │  │  Vite preview  │
│  PHP 8.4    │  │  /dist estático│
│  Sanctum    │  └────────────────┘
└──────┬──────┘
       │
┌──────▼──────┐
│  MySQL 8.0  │
└─────────────┘
```

**Backend (`backend/`):**
- API REST con Laravel 11.
- Autenticación stateful con **Laravel Sanctum** y cookies HttpOnly — no hay JWT.
- CORS configurado para aceptar el origen del frontend con `withCredentials`.
- Rutas separadas: públicas y protegidas por `auth:sanctum`.
- Controladores organizados en `app/Http/Controllers/Api/`.
- Modelos en `app/Models/`.
- Verificación de email con enlace firmado.

**Frontend (`frontend/`):**
- SPA con **React 18** y **Vite** como bundler.
- Estilos con **SCSS** (variables globales en `styles/variables.scss`, partials en `styles/partials/`).
- Estado de autenticación global con `AuthContext` (Context API).
- Rutas protegidas con el componente `ProtectedRoute`.
- Peticiones HTTP con **Axios** configurado con `withCredentials: true`.
- Páginas principales en `src/pages/`, componentes reutilizables en `src/components/`, servicios API en `src/services/api.js`.

**Python (`python/`):**
- Script `webscrapper.py` que usa **Playwright** (navegador headless) + **BeautifulSoup4** para extraer datos de ratones desde RTINGS.
- Genera `mice_dataset.json` y `mice_dataset.csv` usados para poblar el catálogo.
- Dependencias en `requirements.txt`.

### 3.2 Modelo de datos (E/R simplificado)

| Tabla | Campos clave | Relaciones |
|-------|-------------|-----------|
| `users` | `nombre`, `email`, `password`, `rol` | listas, inventario, favoritos, reseñas, consultas, seguimientos |
| `productos` | `modelo`, `marca`, `tipo`, `descripcion`, `imagen`, `fecha_salida` | reseñas, inventario, favoritos, listas, características |
| `listas_personales` | `user_id`, `nombre_lista`, `descripcion`, `publica` | `productos_en_listas` (pivote) |
| `productos_en_listas` | `lista_id`, `producto_id` | pivote N:M |
| `inventario_personal` | `user_id`, `producto_id`, `cantidad`, `principal` | — |
| `favoritos` | `user_id`, `producto_id` | — |
| `resenias` | `user_id`, `producto_id`, `puntuacion`, `comentario`, `voto_up`, `voto_down`, `visible` | — |
| `consultas` | `cliente_id`, `soporte_id`, `estado`, `fecha_cierre` | `mensajes` |
| `mensajes` | `consulta_id`, `emisor_id`, `contenido`, `fecha_envio` | — |
| `caracteristicas_detalladas` | `producto_id` + campos técnicos extendidos | — |
| `caracteristicas_reales` | `producto_id`, `user_id` + datos prácticos reportados | — |
| `seguimientos` | `seguidor_id`, `seguido_id` | — |

### 3.3 Páginas del frontend

| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/` | `Home.jsx` | Público |
| `/login` | `Login.jsx` | Público |
| `/register` | `Register.jsx` | Público |
| `/verify-email` | `EmailVerification.jsx` | Público |
| `/resend-verification` | `ResendVerificationEmail.jsx` | Público |
| `/productos` | `Productos.jsx` | Público |
| `/productos/comparar-ratones` | `CompararRatones.jsx` | Público |
| `/productos/:id` | `ProductoDetail.jsx` | Público |
| `/inventario` | `Inventario.jsx` | 🔒 Auth |
| `/listas` | `MisListas.jsx` | 🔒 Auth |
| `/listas/:id` | `ListaDetalle.jsx` | 🔒 Auth |
| `/consultas` | `Consultas.jsx` | 🔒 Auth |
| `/consultas/:id` | `ConsultaDetail.jsx` | 🔒 Auth |
| `/perfil` | `Perfil.jsx` | 🔒 Auth |
| `/perfiles` | `BuscarPerfiles.jsx` | Público |
| `/perfiles/:id` | `PerfilPublico.jsx` | Público |
| `/admin` | `AdminDashboard.jsx` | 🔒 Admin/Mod |
| `/admin/productos/create` | `AdminProductCreate.jsx` | 🔒 Admin/Mod |
| `/admin/productos/:id/edit` | `AdminProductEdit.jsx` | 🔒 Admin/Mod |

---

## 4. Documentación de la API

### 4.1 Base URL

```
http://localhost:8000/api
```

Todas las peticiones requieren la cabecera `X-XSRF-TOKEN` (gestionada automáticamente por Axios al tener `withCredentials: true`) y que se haya obtenido previamente la cookie CSRF desde `/sanctum/csrf-cookie`.

### 4.2 Endpoints públicos

#### Autenticación

| Método | Ruta | Descripción | Parámetros |
|--------|------|-------------|-----------|
| `POST` | `/register` | Registro de usuario | `nombre`, `email`, `password`, `password_confirmation` |
| `POST` | `/login` | Inicio de sesión | `email`, `password` |
| `POST` | `/logout` | Cerrar sesión | — (auth) |
| `GET` | `/user` | Usuario autenticado | — (auth) |
| `GET` | `/email/verify/{id}/{hash}` | Verificar email | firmado |
| `POST` | `/email/resend` | Reenviar verificación | — (auth) |

#### Productos

| Método | Ruta | Descripción | Parámetros |
|--------|------|-------------|-----------|
| `GET` | `/productos` | Catálogo (filtrable) | `buscar`, `tipo` |
| `GET` | `/productos/{id}` | Detalle de producto | — |
| `GET` | `/productos/{id}/caracteristicas-detalladas` | Specs técnicas | — |
| `GET` | `/productos/{id}/resenias` | Reseñas del producto | — |
| `GET` | `/productos/{id}/caracteristicas-reales` | Características reales | — |
| `GET` | `/productos/{id}/usuarios` | Usuarios que lo tienen | — |

### 4.3 Endpoints autenticados (`auth:sanctum`)

#### Favoritos

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/favoritos` | Mis favoritos |
| `POST` | `/favoritos` | Añadir favorito (`producto_id`) |
| `DELETE` | `/favoritos/{producto_id}` | Eliminar favorito |

#### Reseñas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/resenias` | Crear reseña (`producto_id`, `puntuacion`, `comentario`) |
| `PUT` | `/resenias/{id}` | Editar reseña |
| `DELETE` | `/resenias/{id}` | Eliminar reseña |
| `POST` | `/resenias/{id}/votar` | Votar reseña (`voto`: `up`/`down`) |

#### Listas personales

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/listas` | Mis listas |
| `POST` | `/listas` | Crear lista (`nombre_lista`, `descripcion`, `publica`) |
| `PUT` | `/listas/{id}` | Editar lista |
| `DELETE` | `/listas/{id}` | Eliminar lista |
| `POST` | `/listas/{id}/productos` | Añadir producto (`producto_id`) |
| `DELETE` | `/listas/{id}/productos/{producto_id}` | Quitar producto |

#### Inventario

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/inventario` | Mi inventario |
| `POST` | `/inventario` | Añadir producto (`producto_id`, `cantidad`, `principal`) |
| `PUT` | `/inventario/{producto_id}` | Actualizar (`cantidad`, `principal`) |
| `DELETE` | `/inventario/{producto_id}` | Eliminar del inventario |

#### Consultas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/consultas` | Mis consultas |
| `POST` | `/consultas` | Nueva consulta (`contenido`) |
| `GET` | `/consultas/{id}` | Detalle de consulta |
| `POST` | `/consultas/{id}/mensajes` | Enviar mensaje (`contenido`) |
| `GET` | `/consultas/{id}/mensajes` | Listar mensajes |
| `DELETE` | `/consultas/{id}/mensajes/{msg_id}` | Eliminar mensaje |
| `POST` | `/consultas/{id}/cerrar` | Cerrar consulta (soporte) |
| `POST` | `/consultas/{id}/asignar` | Asignar agente (soporte) |

#### Seguimientos

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/seguimientos/{id}` | Seguir usuario |
| `DELETE` | `/seguimientos/{id}` | Dejar de seguir |
| `GET` | `/seguimientos/seguidores` | Mis seguidores |
| `GET` | `/seguimientos/siguiendo` | A quién sigo |

#### Características reales

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/caracteristicas-reales` | Añadir característica real |
| `DELETE` | `/caracteristicas-reales/{id}` | Eliminar |

### 4.4 Endpoints de administración (rol `ADMIN`/`MOD`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/productos` | Crear producto |
| `PUT` | `/productos/{id}` | Editar producto |
| `DELETE` | `/productos/{id}` | Eliminar producto |
| `PATCH` | `/resenias/{id}/moderar` | Moderar reseña (ocultar/mostrar) |
| `GET` | `/admin/estadisticas` | Métricas generales |
| `GET` | `/admin/usuarios` | Listado de usuarios |
| `GET` | `/admin/productos` | Listado de productos (admin) |
| `GET` | `/admin/resenias` | Listado de reseñas |
| `DELETE` | `/admin/usuarios/{id}` | Eliminar usuario |
| `PATCH` | `/admin/usuarios/{id}/visibilidad` | Activar/desactivar cuenta |

---

## 5. Documentación legal

### 5.1 Política de privacidad

- Los datos personales almacenados son los mínimos necesarios: nombre, email y contraseña (hasheada con bcrypt).
- Se usan exclusivamente para autenticación, gestión de cuenta, soporte y funcionalidades propias de la aplicación.
- No existe seguimiento comercial, publicidad ni venta de datos a terceros.
- El usuario puede eliminar su cuenta a través del panel de administración (solicitándolo a un administrador).

### 5.2 Aviso legal

- El software se proporciona con fines académicos, "tal cual", sin garantía expresa.
- La información de productos, reseñas y consultas es gestionada internamente por los propios usuarios.
- No se garantiza la disponibilidad permanente del servicio ni la exactitud de los datos de catálogo.

### 5.3 Política de cookies

- La aplicación usa **cookies de sesión y CSRF** gestionadas por Laravel Sanctum para la autenticación stateful.
- Son cookies **HttpOnly** y **SameSite=Lax** — no accesibles desde JavaScript, lo que las protege de XSS.
- No se implementan cookies de tracking, analíticas ni publicidad.
- Si en el futuro se añaden herramientas de analítica, habrá que implementar el banner de consentimiento correspondiente (RGPD).
