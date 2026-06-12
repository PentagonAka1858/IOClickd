# IOClickd — Catálogo e Inventario de Periféricos

> Proyecto Final de Grado (PFG) — Desarrollo de Aplicaciones Web · 2º DAW

Aplicación web fullstack para catalogar, comparar y gestionar periféricos gaming (ratones, teclados, auriculares, monitores y alfombrillas). Los usuarios pueden explorar el catálogo, mantener un inventario personal, crear listas, dejar reseñas y abrir consultas de soporte. Los administradores disponen de un panel completo de gestión.

La documentación técnica detallada está en [`docs/`](docs/index.md).

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 18 + Vite · SCSS · React Router v6 |
| Backend | Laravel 11 (PHP 8.4) · Sanctum (autenticación por cookies) |
| Base de datos | MySQL 8.0 |
| Despliegue | Docker · Docker Compose · Nginx |
| Python / Datos | Python 3 · Playwright · BeautifulSoup4 · requests |

---

## Arranque rápido (desarrollo local)

### Backend

```powershell
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configura DB_* en .env
php artisan migrate
php artisan db:seed
php artisan serve
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

El frontend estará en `http://localhost:5173` y consumirá el backend en `http://localhost:8000/api`.

---

## Arranque con Docker

```bash
cd docker
cp .env.example .env        # ajusta las variables si quieres
docker compose up -d --build
```

Servicios levantados:

| Servicio | Puerto |
|----------|--------|
| Nginx (entrada principal) | `80` / `443` |
| Backend Laravel | `8000` |
| Frontend React (Vite preview) | `4173` |
| MySQL | `3307` (host) |

Ver más detalles en [`docker/README.md`](docker/README.md).

---

## Estructura del repositorio

```
.
├── backend/        # API REST con Laravel 11
├── frontend/       # SPA con React 18 + Vite
├── docker/         # Dockerfiles, docker-compose.yml y nginx.conf
├── python/         # Scraper de datos de ratones (Playwright + BeautifulSoup)
├── db/             # Scripts SQL auxiliares
└── docs/           # Documentación del proyecto (índice en docs/index.md)
```

---

## Documentación

- **Índice de asignaturas**: [`docs/index.md`](docs/index.md)
- **Documentación técnica completa**: [`docs/common/project-readme.md`](docs/common/project-readme.md)
- **Docker**: [`docker/README.md`](docker/README.md)
