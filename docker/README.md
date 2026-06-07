# PFG Docker Setup

Este directorio contiene la configuración de Docker para la aplicación PFG.

## Estructura

- **docker-compose.yml**: Orquestación de servicios (DB, Backend, Frontend, Nginx)
- **Dockerfile.backend**: Imagen para el backend Laravel
- **Dockerfile.frontend**: Imagen para el frontend React/Vite
- **Dockerfile.nginx**: Imagen para el servidor web Nginx
- **nginx.conf**: Configuración de Nginx (proxy, SSL, etc.)
- **entrypoint.sh**: Script de inicio para el backend (migraciones y seeders)
- **.env.docker**: Archivo de configuración de variables de entorno para Docker
- **.env.example**: Ejemplo de variables de entorno para Docker
- **db_init.sql**: Script SQL de inicialización de la base de datos

## Requisitos Previos

- Docker
- Docker Compose (v1.29+)

## Cómo Usar

### 1. Preparar el Entorno

```bash
cd docker
# Copiar archivo de entorno (opcional, usa valores por defecto)
cp .env.example .env
```

### 2. Construir Imágenes y Levantar Servicios

```bash
# Desde el directorio docker/
docker-compose up -d --build
```

Esto levantará:
- **MySQL Database** (puerto 3306): Base de datos
- **Laravel Backend** (puerto 8000): API REST
- **React Frontend** (puerto 5173): Interfaz web
- **Nginx** (puerto 80): Servidor web frontal

### 3. Acceder a la Aplicación

- Frontend: http://localhost
- Backend API: http://localhost:8000/api/
- Directamente backend: http://localhost:8000

### 4. Comandos Útiles

```bash
# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
docker-compose logs -f nginx

# Ejecutar comandos en el backend
docker-compose exec backend php artisan tinker
docker-compose exec backend php artisan migrate
docker-compose exec backend php artisan db:seed

# Ver estado de los servicios
docker-compose ps

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: elimina la BD)
docker-compose down -v

# Reconstruir sin usar caché
docker-compose build --no-cache
```

### 5. Variables de Entorno

Puedes personalizar la configuración editando el archivo `.env`:

- `DB_DATABASE`: Nombre de la base de datos (default: pfg_db)
- `DB_USERNAME`: Usuario MySQL (default: pfg_user)
- `DB_PASSWORD`: Contraseña MySQL (default: pfg_password)
- `DB_ROOT_PASSWORD`: Contraseña root MySQL (default: root)
- `APP_ENV`: Entorno de la aplicación (default: production)
- `APP_DEBUG`: Debug mode (default: false)

### 6. Migraciones y Seeders

El script `entrypoint.sh` ejecuta automáticamente:
- Migrations: `php artisan migrate --force`
- Seeders: `php artisan db:seed`

Estos se ejecutan cada vez que inicia el servicio backend.

### 7. Bases de Datos Persistentes

Los datos de la base de datos se almacenan en el volumen `db_data`, que persiste entre reinicios de contenedores.

Para eliminar todos los datos:
```bash
docker-compose down -v
```

## Solución de Problemas

### El backend no puede conectarse a la BD

Verifica que:
1. El servicio `db` esté corriendo: `docker-compose ps`
2. Las credenciales en `.env` sean correctas
3. Espera un momento - MySQL necesita tiempo para iniciar

```bash
docker-compose logs db
```

### El frontend no puede conectarse al backend

Asegúrate que:
1. El backend esté disponible: `curl http://localhost:8000/api/`
2. La URL del API sea correcta en el frontend

### Puerto ya está en uso

Cambia los puertos en `docker-compose.yml` o cierra la aplicación que usa el puerto.

### Limpiar todo y reiniciar

```bash
docker-compose down -v
docker-compose up -d --build
```

## Desarrollo

Para desarrollo local (sin Docker):

```bash
# Backend
cd backend
composer install
php artisan migrate
php artisan db:seed
php artisan serve

# Frontend (en otra terminal)
cd frontend
npm install
npm run frontend
```

## Producción

Para desplegar en producción:

1. Cambiar `APP_ENV=production` y `APP_DEBUG=false` en `.env`
2. Generar una `APP_KEY` segura
3. Configurar SSL en Nginx
4. Usar variables de entorno seguras
5. Considerar usar un load balancer y múltiples instancias

## Soporte

Para reportar problemas o dudas, revisa los logs:

```bash
docker-compose logs -f
```
