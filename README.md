# Documentación del Proyecto

## 1. Manual de Usuario

### 1.1 Registro e inicio de sesión

- Accede a la aplicación frontend en `/login` o `/register`.
- Registro: completa nombre, email, contraseña y confirmación de contraseña.
- Inicio de sesión: utiliza email y contraseña.
- El frontend maneja la sesión con cookies y hace peticiones a `/api/login`, `/api/register` y `/api/user`.
- Tras iniciar sesión, se desbloquean rutas protegidas como inventario, listas, consultas y administración.

### 1.2 Uso de favoritos

- El backend incluye rutas de favoritos (`/api/favoritos`), pero en la interfaz actual no existe un flujo visible finalizado para marcar un producto como favorito.
- Si se desea completar esta funcionalidad, se recomienda añadir botones en la lista de productos y un apartado en el frontend.

### 1.3 Uso de listas personales

- Ruta disponible para usuarios autenticados: `/listas`.
- Permite:
  - Crear nuevas listas personales.
  - Editar nombre, descripción y visibilidad (pública/privada).
  - Eliminar listas.
- Desde el catálogo de productos (`/productos`) se pueden añadir productos a una lista existente o crear una lista nueva al vuelo.
- Cada lista puede agrupar productos para seguimiento posterior.

### 1.4 Uso de inventario

- Ruta disponible para usuarios autenticados: `/inventario`.
- Permite:
  - Añadir productos al inventario desde la vista de catálogo o detalle del producto.
  - Ajustar la cantidad de cada producto guardado.
  - Marcar un producto como principal/destacado.
  - Eliminar productos del inventario.

### 1.5 Uso de reseñas

- En la página de detalle de producto (`/productos/:id`) se puede:
  - Ver reseñas existentes.
  - Crear una nueva reseña si estás autenticado.
  - Puntuar de 1 a 10 y escribir un comentario.
  - Votar reseñas con pulgar arriba o abajo.
  - Eliminar tu propia reseña.

### 1.6 Uso de consultas y soporte

- Ruta disponible para usuarios autenticados: `/consultas`.
- Permite:
  - Crear una consulta o solicitud de soporte.
  - Ver el listado de consultas propias con su estado (`ABIERTA`, `EN_PROCESO`, `CERRADA`).
  - Acceder al detalle de cada consulta en `/consultas/:id` para ver el historial de mensajes.
- En la vista de detalles de consulta se puede continuar la conversación con el equipo de soporte.

### 1.7 Navegación y filtrado de productos

- Barra principal de la aplicación:
  - `Productos`
  - `Mi Inventario`
  - `Mis Listas`
  - `Consultas`
  - `Admin` (solo para usuarios con rol ADMIN/MOD)
- Catálogo de productos (`/productos`):
  - Búsqueda por texto libre en marca o modelo.
  - Filtrado por tipo de producto: `RATON`, `TECLADO`, `AURICULAR`, `MONITOR`, `ALFOMBRILLA`, `OTRO`.
  - Cada tarjeta de producto permite acceder al detalle y acciones adicionales si el usuario está autenticado.

## 2. Manual de Instalación y Despliegue

### 2.1 Requisitos del sistema

- PHP 8.1+ (recomendado para Laravel 11/12).
- Composer.
- Node.js 18+ / npm 10+.
- Base de datos compatible con Laravel: MySQL, MariaDB, SQLite, PostgreSQL.
- Git para clonar el repositorio.

### 2.2 Configuración del backend

1. En el directorio `backend`:
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   ```
2. Configura la base de datos en `backend/.env`:
   - `DB_CONNECTION`
   - `DB_HOST`
   - `DB_PORT`
   - `DB_DATABASE`
   - `DB_USERNAME`
   - `DB_PASSWORD`
3. Si usas SQLite, ajusta `DB_CONNECTION=sqlite` y crea el archivo de base de datos.
4. Ejecuta migraciones:
   ```bash
   php artisan migrate
   ```
5. Inicia el servidor backend:
   ```bash
   php artisan serve
   ```

### 2.3 Configuración del frontend

1. En el directorio `frontend`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. El frontend está configurado para consumir el backend en `http://localhost:8000/api`.
3. Si el backend se sirve en otra dirección, actualiza `frontend/src/services/api.js`.

### 2.4 Variables de entorno

#### Backend (`backend/.env`)

- `APP_NAME`
- `APP_ENV`
- `APP_KEY`
- `APP_DEBUG`
- `APP_URL`
- `DB_CONNECTION`
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `SESSION_DRIVER`
- `SESSION_DOMAIN`
- `MAIL_MAILER`
- `VITE_APP_NAME`

#### Frontend

- No hay variables de entorno definidas en el frontend para el API base en el proyecto actual.
- El backend se alcanza desde `frontend/src/services/api.js` mediante `http://localhost:8000`.

### 2.5 Despliegue con Docker

- No se ha podido llegar a realizar esto, por lo que este punto no consta.
- Por tanto, no se incluye un procedimiento de despliegue Docker en este README.

## 3. Documentación técnica

### 3.1 Arquitectura del sistema

- `backend/`: API REST construida con Laravel.
  - Autenticación con Sanctum y cookies.
  - Rutas públicas y rutas protegidas por `auth:sanctum`.
  - Controladores separados por recursos (productos, listas, inventario, consultas, reseñas, admin, etc.).
- `frontend/`: aplicación SPA con React y Vite.
  - Gestión del estado de usuario con `AuthContext`.
  - Axios con `withCredentials` para enviar cookies de sesión y token CSRF.
  - Rutas protegidas mediante `ProtectedRoute`.

### 3.2 Modelo de datos (E/R)

Tablas principales y relaciones:

- `users`
  - Usuarios registrados.
  - Relación con listas, inventario, favoritos, reseñas, consultas, seguimientos.

- `productos`
  - Productos con `modelo`, `marca`, `tipo`, `descripcion`, `fecha_salida`.
  - Relación con reseñas, inventario, favoritos, listas, características y usuarios.

- `listas_personales`
  - `user_id` → dueño de la lista.
  - `nombre_lista`, `descripcion`, `publica`.
  - Relación con `productos_en_listas`.

- `productos_en_listas`
  - Tabla pivote entre `listas_personales` y `productos`.

- `inventario_personal`
  - `user_id`, `producto_id`, `cantidad`, `principal`.
  - Representa productos guardados en el inventario de cada usuario.

- `favoritos`
  - `user_id`, `producto_id`.
  - Marca favoritos de producto por usuario.

- `resenias`
  - `user_id`, `producto_id`, `puntuacion`, `comentario`.
  - `voto_up`, `voto_down`, `visible`.
  - Cada usuario puede reseñar un producto una vez.

- `consultas`
  - `cliente_id`, `soporte_id`, `estado`, `fecha_cierre`.
  - Soporte interno asociado a la consulta.

- `mensajes`
  - `consulta_id`, `emisor_id`, `contenido`, `fecha_envio`.
  - Conversación ligada a cada consulta.

- `caracteristicas_detalladas`
  - Información técnica extendida de un producto.

- `caracteristicas_reales`
  - Datos de características prácticas o reales ligados a un producto.

- `seguimientos`
  - `seguidor_id`, `seguido_id`.
  - Representa la relación de seguimiento entre usuarios.

### 3.3 Wireframes principales

- **Home**: resumen de la aplicación, acceso a login/register y navegación principal.
- **Productos**: catálogo con búsqueda y filtro por tipo; acciones rápidas para inventario y listas.
- **Detalle de Producto**: información del producto, especificaciones, reseñas y formulario de opinión.
- **Mis Listas**: creación, edición y eliminación de listas personales.
- **Detalle de Lista**: visualización de los productos que contiene una lista.
- **Inventario**: edición de cantidades, marcado de producto destacado y borrado de productos guardados.
- **Consultas**: formulario para enviar solicitudes y listado de tickets de soporte.
- **Detalle de Consulta**: vista de mensajes de la consulta y estado de resolución.
- **Admin Dashboard**: métricas, gestión de usuarios, productos y reseñas (solo ADMIN/MOD).

## 4. Documentación de la API

### 4.1 Aviso

- No se ha podido llegar a realizar esto, por lo que este punto no consta.
- La documentación de la API se presenta aquí de forma manual.

### 4.2 Base URL

- `http://localhost:8000/api`

### 4.3 Endpoints principales

#### Autenticación pública

- `POST /register`
  - Registra un usuario.
  - Parámetros: `nombre`, `email`, `password`, `password_confirmation`.
  - Respuesta: objeto de usuario y datos de sesión.

- `POST /login`
  - Autentica al usuario.
  - Parámetros: `email`, `password`.
  - Respuesta: objeto de usuario.

#### Productos

- `GET /productos`
  - Recupera catálogo de productos.
  - Parámetros opcionales: `buscar`, `tipo`.
  - Respuesta: lista paginada o arreglo de productos.

- `GET /productos/{producto}`
  - Recupera detalle de un producto.

- `GET /productos/{producto}/caracteristicas-detalladas`
  - Recupera especificaciones técnicas detalladas de un producto.

- `GET /productos/{productoId}/resenias`
  - Recupera reseñas de un producto.

- `GET /productos/{productoId}/caracteristicas-reales`
  - Recupera características reales del producto.

- `GET /productos/{productoId}/usuarios`
  - Recupera usuarios que tienen ese producto en inventario.

#### Rutas autenticadas

- `POST /logout`
  - Cierra la sesión.

- `GET /user`
  - Obtiene usuario autenticado.

##### Favoritos

- `GET /favoritos`
- `POST /favoritos`
  - Parámetros: `producto_id`.
- `DELETE /favoritos/{producto_id}`

##### Reseñas

- `POST /resenias`
  - Parámetros: `producto_id`, `puntuacion`, `comentario`.

- `PUT /resenias/{resenia}`
- `DELETE /resenias/{resenia}`
- `POST /resenias/{resenia}/votar`
  - Parámetros: `voto` (`up`/`down`).

##### Listas personales

- `GET /listas`
- `POST /listas`
  - Parámetros: `nombre_lista`, `descripcion`, `publica`.

- `PUT /listas/{lista}`
- `DELETE /listas/{lista}`
- `POST /listas/{lista}/productos`
  - Parámetros: `producto_id`.

- `DELETE /listas/{lista}/productos/{producto_id}`

##### Inventario

- `GET /inventario`
- `POST /inventario`
  - Parámetros: `producto_id`, `cantidad`, `principal`.

- `PUT /inventario/{producto_id}`
  - Parámetros: `cantidad`, `principal`.

- `DELETE /inventario/{producto_id}`

##### Consultas

- `GET /consultas`
- `POST /consultas`
  - Parámetros: `contenido`.

- `GET /consultas/{consulta}`
- `POST /consultas/{consulta}/mensajes`
  - Parámetros: `contenido`.

- `POST /consultas/{consulta}/cerrar`
- `POST /consultas/{consulta}/asignar`

##### Mensajes de consulta

- `GET /consultas/{consulta}/mensajes`
- `GET /consultas/{consulta}/mensajes/{mensaje}`
- `DELETE /consultas/{consulta}/mensajes/{mensaje}`

##### Características reales

- `POST /caracteristicas-reales`
- `DELETE /caracteristicas-reales/{caracteristicaReal}`

##### Moderación y administración

- `POST /productos`
- `PUT /productos/{producto}`
- `DELETE /productos/{producto}`
- `PATCH /resenias/{resenia}/moderar`
- `GET /admin/estadisticas`
- `GET /admin/usuarios`
- `GET /admin/productos`
- `GET /admin/resenias`
- `DELETE /admin/usuarios/{user}`
- `PATCH /admin/usuarios/{user}/visibilidad`

## 5. Documentación legal

### 5.1 Política de privacidad

- La aplicación almacena y procesa datos personales mínimos: nombre, email y credenciales de usuario.
- Los datos se utilizan para autenticación, gestión de cuentas, soporte y funcionalidades relacionadas con productos.
- No hay mecanismos adicionales de seguimiento comercial implementados en el frontend actual.
- Los datos de usuario no deben compartirse con terceros fuera del propósito de la aplicación.

### 5.2 Aviso legal

- El software se ofrece "tal cual" y sin garantía expresa.
- La información de productos, reseñas y consultas está orientada a la gestión interna de la aplicación.
- No se garantiza la disponibilidad permanente del servicio ni la exactitud total de datos de terceros.

### 5.3 Política de Cookies

- La aplicación emplea cookies de sesión y CSRF a través de Laravel Sanctum para autenticación segura.
- No hay política de cookies separada implementada en el repositorio actual.
- Si en el futuro se agregan cookies de tracking o analíticas, será necesario documentar y aceptar su uso.
