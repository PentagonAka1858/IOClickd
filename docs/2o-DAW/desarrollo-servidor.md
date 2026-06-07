# Desarrollo Web en Entorno Servidor (2º DAW)

## Arquitectura del código
- Backend construido con Laravel: separación por controladores, modelos y rutas; autenticación con Sanctum.
- Recomendación: mantener lógica de negocio en servicios y modelos, controladores ligeros.

## Funcionalidades del backend
- Implementadas: login/registro (`/login`, `/register`), gestión de productos, listas, inventario, reseñas, consultas y rutas administrativas.
- Variables de entorno relevantes: `MAIL_MAILER`, `DB_*`, `APP_*` (ver [common/project-readme.md](../common/project-readme.md)).

## Control del código
- TODO: evidenciar la separación servidor/cliente con ejemplos de endpoints y cómo responden (JSON), y añadir pruebas de integración si procede.

## Dónde encontrar en el repositorio

- Rutas API: [backend/routes/api.php](backend/routes/api.php)
- Controladores API: [backend/app/Http/Controllers/Api](backend/app/Http/Controllers/Api)
- Modelos: [backend/app/Models](backend/app/Models)
- Variables de entorno y configuración: [backend/.env.example](backend/.env.example) y [docs/common/project-readme.md](../common/project-readme.md)
- Tests: [backend/tests](backend/tests)
