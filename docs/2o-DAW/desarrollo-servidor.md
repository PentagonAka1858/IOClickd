# Desarrollo Web en Entorno Servidor (2º DAW)

## Tecnologías utilizadas

- **Laravel 11** con **PHP 8.4** — framework MVC, Eloquent ORM, sistema de rutas expresivo.
- **Laravel Sanctum** — autenticación stateful mediante cookies para SPAs. No se usan tokens JWT en localStorage; la sesión se maneja con cookies HttpOnly.
- **MySQL 8.0** como base de datos relacional.
- **Eloquent ORM** para el modelado y las relaciones entre entidades.
- **Laravel Mail** con plantillas Blade para emails (verificación de cuenta, etc.).

## Arquitectura del backend

El backend sigue la estructura estándar de Laravel, aplicando el patrón MVC con controladores ligeros:

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/     # Un controlador por recurso
│   │   └── Middleware/          # Middlewares de autenticación y CORS
│   └── Models/                  # Modelos Eloquent con relaciones definidas
├── database/
│   ├── migrations/              # Historial de cambios del esquema
│   └── seeders/                 # Datos de ejemplo para desarrollo
├── resources/
│   └── views/emails/            # Plantillas Blade para correos
└── routes/
    └── api.php                  # Todas las rutas de la API REST
```

## Autenticación con Sanctum

La autenticación funciona de la siguiente forma:

1. El frontend llama a `GET /sanctum/csrf-cookie` para obtener la cookie CSRF.
2. Se hace `POST /api/login` con las credenciales.
3. Laravel crea una sesión y devuelve una cookie de sesión HttpOnly.
4. A partir de ahí, todas las peticiones llevan automáticamente la cookie + el header XSRF-TOKEN.
5. Las rutas protegidas usan el middleware `auth:sanctum`.

Esto evita tener que gestionar tokens en el frontend y protege contra CSRF de forma automática.

## Controladores implementados

| Controlador | Recurso gestionado |
|------------|-------------------|
| `AuthController` | Login, registro, logout, usuario actual |
| `EmailVerificationController` | Verificación y reenvío de email |
| `ProductoController` | CRUD completo de productos |
| `InventarioController` | CRUD del inventario personal |
| `ListaPersonalController` | CRUD de listas y productos en listas |
| `ReseniaController` | CRUD de reseñas y sistema de votos |
| `ConsultaController` | Consultas de soporte (crear, asignar, cerrar) |
| `MensajeController` | Mensajes dentro de una consulta |
| `FavoritoController` | Añadir/eliminar favoritos |
| `SeguimientoController` | Seguir/dejar de seguir usuarios |
| `CaracteristicasDetalladasController` | Specs técnicas de productos |
| `CaracteristicasRealesController` | Características reales reportadas por usuarios |
| `AdminController` | Estadísticas y gestión administrativa |

## Relaciones Eloquent principales

- `User` hasMany `ListaPersonal`, `InventarioPersonal`, `Resenia`, `Consulta`, `Favorito`
- `User` belongsToMany `User` (seguimientos — tabla `seguimientos`)
- `Producto` hasMany `Resenia`, `CaracteristicasDetalladas`, `CaracteristicasReales`
- `Producto` belongsToMany `ListaPersonal` (through `productos_en_listas`)
- `Consulta` hasMany `Mensaje`

## Variables de entorno clave

| Variable | Uso |
|----------|-----|
| `APP_KEY` | Clave de cifrado de sesiones |
| `APP_URL` | URL pública del backend |
| `FRONTEND_URL` | URL del frontend (CORS + links en emails) |
| `DB_*` | Conexión MySQL |
| `SESSION_DRIVER` | Debe ser `cookie` para Sanctum SPA |
| `SESSION_DOMAIN` | Dominio compartido con el frontend |
| `SANCTUM_STATEFUL_DOMAINS` | Dominios que pueden usar autenticación stateful |
| `MAIL_*` | Configuración del servidor de correo |

Ver ejemplo completo en [`backend/.env.example`](../../backend/.env.example).

## Respuestas de la API

Todos los endpoints responden en **JSON**. Ejemplo de respuesta de `GET /api/productos/{id}`:

```json
{
  "id": 42,
  "modelo": "G PRO X SUPERLIGHT 2",
  "marca": "Logitech",
  "tipo": "RATON",
  "descripcion": "Ratón gaming inalámbrico ultraligero...",
  "imagen": "https://...",
  "fecha_salida": "2023-01-15",
  "created_at": "2024-03-01T10:00:00Z"
}
```

Los errores siguen la estructura estándar de Laravel: código HTTP correspondiente + campo `message` y opcionalmente `errors` con validación por campo.

## Dónde encontrar en el repositorio

- Rutas API: [`backend/routes/api.php`](../../backend/routes/api.php)
- Controladores: [`backend/app/Http/Controllers/Api/`](../../backend/app/Http/Controllers/Api/)
- Modelos: [`backend/app/Models/`](../../backend/app/Models/)
- Migraciones: [`backend/database/migrations/`](../../backend/database/migrations/)
- Seeders: [`backend/database/seeders/`](../../backend/database/seeders/)
- Variables de entorno: [`backend/.env.example`](../../backend/.env.example)
