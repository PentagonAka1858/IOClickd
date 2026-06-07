# Proyecto: Catálogo e Inventario (Resumen)

Esta es la página principal del proyecto. La documentación técnica completa y el índice organizado se encuentran en `docs/`.

- Índice principal de asignaturas: [docs/index.md](docs/index.md)
- Documentación completa (extractada del README original): [docs/common/project-readme.md](docs/common/project-readme.md)

Instalación rápida:

1. Backend:

```powershell
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

2. Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Si necesitas la documentación completa (endpoints, modelo de datos, wireframes y pasos detallados de despliegue), consulta [docs/common/project-readme.md](docs/common/project-readme.md).

