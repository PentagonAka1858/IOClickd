# Bases de Datos (1º DAW)

## Diseño y diagramas
- Referencias encontradas en el proyecto: en [common/project-readme.md](../common/project-readme.md) hay un resumen del modelo de datos (tablas principales y relaciones).
- Modelo E/R (extraído): `users`, `productos`, `listas_personales`, `productos_en_listas`, `inventario_personal`, `favoritos`, `resenias`, `consultas`, `mensajes`, `caracteristicas_detalladas`, `caracteristicas_reales`, `seguimientos`.
- TODO: incluir diagramas E/R y paso a tablas (añadir imágenes o exportaciones de la herramienta gráfica).

## Código SQL
- TODO: añadir DDL (scripts `CREATE TABLE`) y ejemplos de DML (inserts, consultas representativas).
- Sugerencia: añadir vistas o procedimientos almacenados críticos (paginación de productos, agregados de reseñas).

## Justificación técnica
- TODO: justificar la elección de claves, normalización, índices y estrategias de consultas.

## Dónde encontrar en el repositorio

- Migraciones (DDL): [backend/database/migrations](backend/database/migrations)
- Modelos Eloquent: [backend/app/Models](backend/app/Models) (ej.: Producto.php, User.php, ListaPersonal.php)
- Endpoints relacionados: [backend/routes/api.php](backend/routes/api.php)
- Controladores que implementan lógica: [backend/app/Http/Controllers/Api](backend/app/Http/Controllers/Api)
- Ejemplos de consultas y uso desde frontend: [frontend/src/services/api.js](frontend/src/services/api.js)
