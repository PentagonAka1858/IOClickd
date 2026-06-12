# Entornos de Desarrollo (1º DAW)

En Entornos de Desarrollo de primero nos machacaron un montón con Git, la depuración y los diagramas de flujo. Al final, todo eso sirve para no volverse loco cuando trabajas en un proyecto real como este. La idea básica de IOClickd es tener un entorno súper automatizado y cómodo para picar código sin que digas "a mí en mi máquina me funciona".

## Control de versiones (Git)

En este proyecto he seguido un flujo de trabajo bastante ordenado con Git. Nada de subir commits directamente a `main` a lo loco:

- **Estructura de ramas**:
  - `main`: Aquí solo va el código estable y probado de producción.
  - `develop`: La rama de integración. Todo lo nuevo se junta aquí primero para ver que no explota nada.
  - Ramas de características (`feat/*`, `fix/*`): Ramas temporales que salen de `develop` para hacer tareas concretas. Por ejemplo: `feat/admin-create-product` para la gestión de productos desde el panel, o `fix/user-follow` para arreglar el botón de seguir.
- **Formato de los commits**: Intento que los mensajes de commit sean claros, técnicos pero sin pasarse. Ejemplos de mi historial:
  - `feat: add admin dashboard product list and delete controller`
  - `fix: update email verification styles and append fallback URL`
  - `refactor: clean profile follow states in BuscarPerfiles`

Si quieres cotillear todo el historial de cambios, solo tienes que tirar un `git log` o abrir el repo en GitKraken/VS Code.

---

## Pruebas y depuración

No hay nada peor que subir código y que deje de funcionar lo que ya estaba hecho. Para evitarlo, he configurado pruebas automáticas en el backend:

- **Testing en Laravel**: Usamos PHPUnit integrado en Laravel. La estructura de pruebas está organizada en `backend/tests`, dividida en:
  - *Feature tests*: Pruebas de integración para verificar que los endpoints de la API responden correctamente (por ejemplo, registrarse, verificar email, crear una reseña).
  - *Unit tests*: Pruebas más atómicas para lógica específica.
- **Comando para ejecutar los tests**:
  ```powershell
  # Entra al directorio del backend
  cd backend
  # Ejecuta la suite de pruebas unitarias y de integración
  php artisan test
  ```
- **Depuración**: Para el backend uso el `Log` de Laravel (`Log::info()`, `Log::error()`) y PHP Laravel Tinker para probar cosas en consola al vuelo. En el frontend (React), tiro a muerte de la pestaña *Network* de las Developer Tools de Chrome para controlar los requests, y de `console.warn()` o la extensión de React Developer Tools.

---

## Documentación técnica del entorno

Para que cualquiera pueda levantar el proyecto en 5 minutos, el entorno local está súper estandarizado:

- **IDE Recomendado**: VS Code.
- **Extensiones clave que uso**:
  - *Intelephense*: Para que el autocompletado de PHP en Laravel no sea un dolor de cabeza.
  - *ES7+ React/Redux/React-Native snippets*: Clave para crear componentes de React en dos segundos.
  - *Prettier*: Para formatear el código automáticamente al guardar y no discutir por los espacios.
  - *GitLens*: Para ver quién ha roto qué línea de código en el repo.
- **Configuración del entorno**:
  - **Docker**: Gracias a Docker, el entorno (Nginx, PHP 8.4, Node 20, MySQL 8.0) se levanta exactamente igual en cualquier ordenador con `docker-compose up -d --build`.
  - **Variables**: Las credenciales de base de datos, URLs y configuraciones de correo se gestionan a través de archivos `.env` (que nunca se suben al control de versiones por seguridad, se usa un `.env.example`).

---

## Dónde encontrar en el repositorio

- **Historial de control de versiones**: En la carpeta oculta `.git` de la raíz.
- **Tests del backend**: En la carpeta `backend/tests` (Feature y Unit tests).
- **Configuración del entorno local**:
  - En Laravel: `backend/composer.json` y `backend/.env.example`
  - En React: `frontend/package.json`
- **Instrucciones completas**: En la documentación del README en `docs/common/project-readme.md`.
