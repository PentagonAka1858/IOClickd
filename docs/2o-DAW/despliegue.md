# Despliegue de Aplicaciones Web (2º DAW)

## Configuración del entorno con Docker

El proyecto está completamente dockerizado. El directorio [`docker/`](../../docker/) contiene toda la infraestructura necesaria para levantar el proyecto en cualquier máquina con Docker instalado.

### Servicios y contenedores

| Servicio | Imagen base | Puerto expuesto | Función |
|----------|------------|----------------|---------|
| `db` | `mysql:8.0` | `3307` (host) | Base de datos persistente con volumen |
| `backend` | `php:8.4-fpm` + Composer | `8000` | API REST Laravel |
| `frontend` | `node:20-alpine` | `4173` | Build de Vite + preview del bundle |
| `nginx` | `nginx:alpine` | `80` / `443` | Proxy inverso, archivos estáticos y SSL |

### Arquitectura de red Docker

```
                    ┌──────────────┐
       :80/:443     │    Nginx     │
  ───────────────►  │  pfg_nginx   │
                    └──────┬───────┘
                           │ pfg_network (bridge)
              ┌────────────┴────────────┐
              │                         │
    ┌─────────▼──────┐       ┌──────────▼───────┐
    │  backend:8000  │       │ /dist (estáticos)│
    │  pfg_backend   │       └──────────────────┘
    └────────┬───────┘
             │
    ┌────────▼───────┐
    │   db:3306      │
    │   pfg_db       │
    │ (volumen MySQL)│
    └────────────────┘
```

### Levantar el entorno

```bash
cd docker
cp .env.example .env   # personaliza credenciales si quieres

# Construir imágenes y arrancar en background
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f

# Parar (conserva la BD)
docker-compose down

# Parar y eliminar volúmenes (DESTRUYE los datos)
docker-compose down -v
```

Acceso una vez arriba:

| Recurso | URL |
|---------|-----|
| Aplicación web | `http://localhost` |
| API directa | `http://localhost:8000/api` |
| Base de datos | `localhost:3307` |

### Proceso de arranque automático del backend

El script [`docker/entrypoint.sh`](../../docker/entrypoint.sh) se ejecuta al iniciar el contenedor del backend y se encarga de:

1. Limpiar la caché de configuración (`php artisan config:clear`)
2. Ejecutar las migraciones (`php artisan migrate --force`)
3. Ejecutar los seeders (`php artisan db:seed`)
4. Arrancar el servidor Laravel (`php artisan serve --host=0.0.0.0 --port=8000`)

Esto garantiza que en cada despliegue el esquema de BD esté actualizado sin intervención manual.

### Variables de entorno Docker

Se configuran en `docker/.env` (se crea a partir de `.env.example`):

| Variable | Valor por defecto | Descripción |
|----------|------------------|-------------|
| `DB_DATABASE` | `pfg_db` | Nombre de la BD |
| `DB_USERNAME` | `pfg_user` | Usuario MySQL |
| `DB_PASSWORD` | `pfg_password` | Contraseña MySQL |
| `DB_ROOT_PASSWORD` | `root` | Contraseña root |
| `APP_ENV` | `production` | Entorno Laravel |
| `APP_DEBUG` | `false` | Debug desactivado en prod |
| `APP_KEY` | — | **Cambia esto en producción** |

## Servidor web: Nginx

El fichero [`docker/nginx.conf`](../../docker/nginx.conf) configura Nginx como proxy inverso:

- Sirve el bundle estático de React (generado por `npm run build`) desde `/usr/share/nginx/html`.
- Hace proxy de las peticiones `/api/` y `/sanctum/` hacia el backend Laravel en el puerto 8000.
- Gestiona la redirección de rutas SPA (todas las rutas no reconocidas devuelven `index.html` para que React Router las maneje).
- Soporte SSL/TLS en puerto 443 con certificados en `docker/ssl/` (configurar certificados propios en producción).

## Despliegue en producción

Para un despliegue real en un VPS o servidor cloud, los pasos clave son:

1. **Generar una APP_KEY segura**:
   ```bash
   docker-compose exec backend php artisan key:generate
   ```

2. **Configurar SSL** — colocar los certificados en `docker/ssl/` y actualizar `nginx.conf` con el dominio real.

3. **Variables seguras** — nunca subir `.env` al repositorio. Usar secretos del CI/CD o variables de entorno del hosting.

4. **Cambiar APP_ENV y APP_DEBUG**:
   ```dotenv
   APP_ENV=production
   APP_DEBUG=false
   ```

5. **Base de datos** — para producción seria, considera usar un servicio gestionado (RDS, PlanetScale) en lugar del contenedor MySQL incluido.

## Scripts de conveniencia

En `docker/` hay scripts para Windows y Linux:

| Script | Plataforma | Función |
|--------|-----------|---------|
| `start.bat` | Windows | Levanta el entorno |
| `start.sh` | Linux/macOS | Levanta el entorno |
| `stop.bat` | Windows | Para los contenedores |
| `stop.sh` | Linux/macOS | Para los contenedores |

## Dónde encontrar en el repositorio

- Configuración Docker completa: [`docker/`](../../docker/)
- `docker-compose.yml`: [`docker/docker-compose.yml`](../../docker/docker-compose.yml)
- Dockerfile del backend (PHP 8.4): [`docker/Dockerfile.backend`](../../docker/Dockerfile.backend)
- Dockerfile del frontend (Node 20): [`docker/Dockerfile.frontend`](../../docker/Dockerfile.frontend)
- Configuración Nginx: [`docker/nginx.conf`](../../docker/nginx.conf)
- Entrypoint del backend: [`docker/entrypoint.sh`](../../docker/entrypoint.sh)
- README Docker detallado: [`docker/README.md`](../../docker/README.md)
