# Programación (1º DAW)

En primero de DAW dimos Java y bases de programación estructurada y orientada a objetos. Al pasar a segundo, el chip te cambia por completo cuando trabajas con frameworks como Laravel (PHP 8.4) y React (JavaScript ES6+). La programación aquí es mucho más asíncrona, basada en eventos y APIs REST, lo que requiere un nivel técnico bastante alto para que todo fluya sin fallos de sincronización.

## Comunicación técnica y lógica estructurada

Para estructurar la lógica del proyecto, he seguido patrones consolidados de la industria:
- **Separación de responsabilidades**: En el backend de Laravel, los controladores solo reciben la petición, la validan usando `FormRequests` dedicados para no enguarrar el código, llaman al modelo correspondiente y devuelven una respuesta JSON consistente.
- **Relaciones Eloquent**: He programado las relaciones entre modelos usando la sintaxis nativa de Laravel, lo que permite que el ORM escriba consultas complejas por debajo de forma segura y eficiente.
- **State Management y Context API en React**: En el frontend, he programado contextos globales (como `AuthContext.jsx`) para que la información del usuario logueado esté accesible en cualquier componente de la aplicación sin tener que estar pasándola por "props" de padres a hijos (evitando el infierno del *prop drilling*).

---

## Resolución y documentación de problemas complejos

Durante el desarrollo me he peleado con varios bugs bastante guapos. Aquí detallo uno que me costó un poco solucionar pero que al final quedó de lujo:

### El problema de CORS con Laravel Sanctum y React
**Descripción**: Al principio, cuando el frontend intentaba iniciar sesión o pedir el usuario autenticado a la API (`/api/user`), el navegador bloqueaba las peticiones por problemas de CORS o no enviaba las cookies de sesión en las peticiones posteriores, por lo que el usuario aparecía siempre como no autenticado.

**La solución**: Después de pegarme con la documentación de Laravel Sanctum, vi que la autenticación basada en cookies requiere que el frontend y el backend compartan origen o que se especifique correctamente en el navegador que se deben incluir las credenciales.

1. Configuré Axios en el frontend para meter siempre la cabecera de credenciales:
   ```javascript
   // frontend/src/services/api.js
   import axios from 'axios';
   
   const api = axios.create({
     baseURL: 'http://localhost:8000/api',
     withCredentials: true, // Crucial para que envíe y reciba cookies
   });
   ```
2. Configuré el backend para aceptar el origen del frontend y permitir credenciales:
   ```php
   // backend/config/cors.php
   return [
       'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],
       'allowed_methods' => ['*'],
       'allowed_origins' => ['http://localhost:5173'], // URL de desarrollo de Vite
       'allowed_origins_patterns' => [],
       'allowed_headers' => ['*'],
       'exposed_headers' => [],
       'max_age' => 0,
       'supports_credentials' => true, // Habilita el intercambio de cookies
   ];
   ```
3. Petición previa del token CSRF: Antes de hacer login, programé que el frontend hiciera una llamada previa a `/sanctum/csrf-cookie` para inicializar las cookies de sesión en el navegador.

---

## Habilidades de comunicación (Para la Defensa Oral)

Para la defensa del proyecto ante el tribunal, he preparado un hilo argumental muy claro enfocado en el valor técnico:
- **Punto de dolor**: Explicar lo difícil que es para un usuario elegir periféricos gaming sin volverse loco entre especificaciones que las marcas inflan o meten en formatos incompatibles.
- **La solución técnica**: IOClickd centraliza esto usando un robot de extracción de datos automatizado, una API robusta y segura respaldada por Laravel y una SPA interactiva y rápida en React que permite la comparación en tiempo real de periféricos.
- **Demostración de destreza**: Destacar la robustez del sistema de autenticación (Sanctum con cookies seguras HttpOnly contra ataques XSS) y la contenedorización del entorno de desarrollo mediante Docker.

---

## Dónde encontrar en el repositorio

- **Controladores del Backend**: En la carpeta `backend/app/Http/Controllers/Api` (ej.: `ProductoController.php`, `AuthController.php`).
- **Servicio Axios del Frontend**: En el archivo `frontend/src/services/api.js`.
- **Gestión de Estado (Context)**: En el archivo `frontend/src/context/AuthContext.jsx` (si existe) u otros hooks de estado.
