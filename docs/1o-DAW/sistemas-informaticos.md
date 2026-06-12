# Sistemas Informáticos (1º DAW)

En primero dábamos sistemas operativos, redes, comandos de bash y cómo configurar Apache y MySQL en local de forma tradicional. Para este proyecto he querido aplicar todo eso pero de forma moderna: en vez de instalar mil cosas en mi sistema operativo local, he metido todo en **Docker**, aislando los servicios en una red interna virtual.

## Esquema de infraestructura en red (Docker)

He diseñado una arquitectura de microservicios usando contenedores Docker. La verdad es que es comodísimo porque con un solo comando levantas toda la infraestructura. Los contenedores están conectados a una red virtual interna llamada `pfg_network` y se comunican entre ellos de la siguiente manera:

- **Nginx (Proxy Inverso y servidor web)**: Es el único contenedor que expone puertos al exterior (puertos `80` y `443` en producción). Recibe todas las peticiones del navegador del usuario.
  - Si la petición va a `/api/*` o `/sanctum/*`, Nginx hace de proxy inverso y se la reenvía por la red interna al contenedor `backend` (en el puerto `8000`).
  - Si la petición va a la aplicación web, Nginx sirve directamente los archivos HTML/JS compilados del frontend o los pide al contenedor de desarrollo de Vite (puerto `4173` / `5173`).
- **Backend (PHP 8.4-FPM + Composer)**: Corre Laravel y atiende las peticiones de Nginx. Se conecta al contenedor de la base de datos por el puerto interno `3306`.
- **MySQL 8.0**: Almacena los datos y usa un volumen persistente en el host para que los datos no se borren cuando apagamos los contenedores. Expone el puerto `3307` solo hacia el host local para poder conectarnos con herramientas de desarrollo (como DBeaver o TablePlus) de forma cómoda.

---

## Instalación, compatibilidad y pruebas

### Requisitos y arranque
Para desplegar el sistema completo en cualquier máquina compatible con Docker:
```bash
# clonar el repo y entrar en la carpeta docker
cd docker
cp .env.example .env
docker-compose up -d --build
```
Esto descarga las imágenes, monta las redes y volúmenes virtuales, ejecuta las migraciones de base de datos y mete los datos de prueba automatically.

### Compatibilidad multiplataforma
He probado la aplicación en diferentes entornos para certificar que el comportamiento es idéntico:
- **Sistemas Operativos**: Windows 11 (usando WSL2 para Docker), macOS y Ubuntu 22.04 LTS. Gracias al aislamiento de Docker, el rendimiento es idéntico.
- **Navegadores**: Google Chrome, Mozilla Firefox, Microsoft Edge y Safari (en iOS). Al usar estándares modernos de HTML5 y JavaScript ES6 transpilado con Vite, no hay fallos de compatibilidad en la UI.

---

## Escalabilidad de la infraestructura

Si de repente IOClickd se hace súper famoso y entran miles de usuarios al mismo tiempo, el contenedor único de MySQL y Laravel petaría. Para solucionarlo, he planeado la siguiente escalabilidad en la nube (ej. AWS):

1. **Base de Datos Dedicada (RDS)**: Sacar la base de datos de Docker a una instancia de AWS RDS MySQL con réplicas de lectura. El backend leería de las réplicas y escribiría en la primaria.
2. **Balanceador de Carga (ALB)**: Colocar un balanceador de carga que reciba el tráfico HTTPS y lo distribuya entre varias instancias del backend.
3. **Escalado Horizontal (ECS/Fargate)**: Configurar un clúster de contenedores para el backend (Laravel) y frontend (React preview) que cree o destruya instancias automáticamente según la CPU o las peticiones HTTP concurrentes.
4. **Contenido Estático en CDN**: Subir todas las imágenes de periféricos a un bucket S3 y servirlas con Cloudfront para no saturar al servidor de archivos de Nginx.

---

## Dónde encontrar en el repositorio

- **Configuración de Docker**: En la carpeta `docker/` (ahí están el `docker-compose.yml`, los Dockerfiles de frontend y backend, y la configuración de `nginx.conf`).
- **Variables de Entorno**: `backend/.env.example` y `docker/.env.example`.
- **README de Despliegue**: `docker/README.md` y las notas de despliegue general en `docs/2o-DAW/despliegue.md`.
