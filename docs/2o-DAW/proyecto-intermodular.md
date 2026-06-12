# Proyecto Intermodular de Desarrollo de Aplicaciones Web (2º DAW)

## Descripción del proyecto

**IOClickd** es una plataforma web para catalogar, comparar y gestionar periféricos gaming. Los usuarios pueden explorar un catálogo de ratones, teclados, auriculares, monitores y alfombrillas; mantener un inventario personal; crear listas temáticas; dejar reseñas y abrir consultas de soporte. Los administradores disponen de un panel completo de gestión.

El proyecto integra todos los módulos del ciclo de DAW:
- Frontend SPA con React + Vite (Desarrollo Cliente)
- API REST con Laravel 11 (Desarrollo Servidor)
- Base de datos relacional MySQL (Bases de Datos)
- Despliegue con Docker + Nginx (Despliegue)
- Scraping de datos con Python + Playwright (Python y Análisis de Datos)
- Diseño responsive con SCSS (Diseño de Interfaces)

## Herramientas de gestión y desarrollo

| Herramienta | Uso |
|-------------|-----|
| **Git** | Control de versiones con ramas por funcionalidad |
| **GitHub** | Repositorio remoto y revisión de código |
| **VS Code** | Editor principal de desarrollo |
| **Postman** | Pruebas manuales de la API durante el desarrollo |
| **Docker Desktop** | Entorno de despliegue local y de producción |
| **TablePlus / DBeaver** | Inspección de la base de datos en desarrollo |

## Planificación y desarrollo iterativo

El proyecto se desarrolló de forma incremental, empezando por la base de datos y la autenticación, y añadiendo funcionalidades en este orden aproximado:

1. **Sprint 1 – Base**: Modelos, migraciones, autenticación con Sanctum, login/register en frontend.
2. **Sprint 2 – Catálogo**: CRUD de productos, catálogo con filtros, detalle de producto.
3. **Sprint 3 – Usuario**: Inventario, listas personales, favoritos.
4. **Sprint 4 – Comunidad**: Reseñas con sistema de votos, perfiles públicos, seguimientos.
5. **Sprint 5 – Soporte**: Sistema de consultas y mensajería entre usuario y soporte.
6. **Sprint 6 – Admin**: Dashboard de administración, gestión de usuarios, moderación de reseñas.
7. **Sprint 7 – Docker**: Dockerización completa del proyecto con Nginx, SSL y entrypoint automático.
8. **Sprint 8 – Pulido**: Verificación de email, comparador de ratones, scraper Python, estilos finales.

## Riesgos identificados y soluciones

| Riesgo | Solución aplicada |
|--------|-----------------|
| CORS entre frontend y backend | Configuración de `SESSION_DOMAIN` y `SANCTUM_STATEFUL_DOMAINS`; Axios con `withCredentials: true` |
| Autenticación con cookies en SPA | Uso de Sanctum SPA mode en lugar de API tokens; llamada previa a `/sanctum/csrf-cookie` |
| Scraping bloqueado por RTINGS | Playwright con navegador headless + fallback con datos estáticos |
| Rutas SPA en producción (404) | Configuración de Nginx para devolver `index.html` en rutas no encontradas |
| Permisos de storage en Docker | `chown www-data` + `chmod 775` en el Dockerfile del backend |

## Demo técnica — Checklist de funcionalidades

### Autenticación

- [x] Registro con verificación de email
- [x] Login / Logout con cookies Sanctum
- [x] Reenvío de email de verificación
- [x] Rutas protegidas (redirigen a /login si no hay sesión)

### Catálogo y productos

- [x] Listado con búsqueda por texto y filtro por tipo
- [x] Detalle de producto con especificaciones técnicas y reales
- [x] Comparador de ratones lado a lado
- [x] Imagen de producto con fallback SVG

### Inventario y listas

- [x] Añadir/editar/eliminar productos del inventario
- [x] Marcar producto como principal
- [x] CRUD completo de listas personales (públicas/privadas)
- [x] Añadir/quitar productos de una lista

### Reseñas y comunidad

- [x] Crear reseña con puntuación y comentario
- [x] Votar reseñas (👍/👎)
- [x] Eliminar propia reseña
- [x] Perfiles públicos de usuario
- [x] Sistema de seguimiento (seguir/dejar de seguir)
- [x] Búsqueda de perfiles

### Soporte

- [x] Crear consulta
- [x] Historial de mensajes por consulta
- [x] Estados de consulta (ABIERTA / EN_PROCESO / CERRADA)
- [x] Asignación de soporte y cierre de consulta

### Administración

- [x] Dashboard con métricas
- [x] Gestión de usuarios (activar/desactivar/eliminar)
- [x] Crear, editar y eliminar productos
- [x] Moderación de reseñas (ocultar/mostrar)

### Despliegue

- [x] Docker Compose con 4 servicios (MySQL, Laravel, Vite, Nginx)
- [x] Entrypoint automático (migraciones + seeders al arrancar)
- [x] Scripts de conveniencia (start/stop para Windows y Linux)
- [x] Soporte SSL en Nginx

## Dónde encontrar en el repositorio

- Historial de desarrollo: `git log --oneline` en el repositorio.
- Documentación técnica: [`docs/common/project-readme.md`](../common/project-readme.md)
- Todas las rutas de la aplicación: [`frontend/src/App.jsx`](../../frontend/src/App.jsx)
- Todos los endpoints de la API: [`backend/routes/api.php`](../../backend/routes/api.php)
