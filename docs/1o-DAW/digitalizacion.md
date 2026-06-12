# Digitalización aplicada a los sectores productivos (1º DAW)

A ver, esta asignatura al principio parecía pura teoría aburrida, pero al llevarla a un proyecto real como **IOClickd**, se entiende mucho mejor. Básicamente, estamos hablando de cómo coger un sector tradicional (en este caso, la compra-venta y el asesoramiento de periféricos gaming, que suele hacerse en foros desorganizados o directamente a ciegas en tiendas online) y meterle tecnología para solucionar problemas típicos.

## Impacto en el sector

La digitalización que he metido aquí ataca varios puntos clave:
- **Centralización de la información**: En lugar de volverse loco buscando análisis de ratones en webs en inglés o hilos de Reddit de hace tres años, el usuario tiene una base de datos única y limpia con especificaciones reales estructuradas.
- **Inventario digital**: Los usuarios pueden gestionar sus setups en la nube. Ya no hay que apuntar qué tienes en un bloc de notas; controlas las cantidades, marcas qué es tu periférico principal y lo compartes con otros.
- **Soporte digitalizado**: El sistema de soporte mediante consultas (tickets) elimina la necesidad de mandar correos eternos que se pierden en el spam. Los moderadores los gestionan desde su panel, lo que agiliza un montón el servicio postventa o la ayuda técnica.
- **Transparencia en las valoraciones**: El sistema de reseñas con puntuación del 1 al 10 y votaciones evita la típica manipulación de opiniones. La gente puede reportar y votar si un comentario aporta valor o es spam.

## Innovación tecnológica (El Scraper en Python)

Aquí es donde el proyecto mete un plus de innovación que no es solo hacer formularios y pintar datos de una base de datos:
- **Scraping automatizado con Playwright y BeautifulSoup4**: He montado un script en Python que simula la navegación de un usuario (incluso en páginas SPA dinámicas, gracias al motor Headless de Playwright) para extraer información real de especificaciones técnicas de ratones desde RTINGS.
- **Procesamiento de datos**: Los datos extraídos en crudo se parsean, se limpian con Python y se guardan en ficheros JSON/CSV. Después, usando el Seeder de Laravel, los inyecto directamente en la base de datos de MySQL. Esto ahorra cientos de horas de meter especificaciones a mano.

## Madurez digital y escalabilidad

Para que este proyecto pueda considerarse una solución digital madura y lista para producción, he tenido en cuenta:
- **Nivel de adopción digital**: La interfaz está pensada para ser extremadamente intuitiva. No hace falta ser un experto informático; cualquiera que sepa navegar por internet puede registrarse, verificar su email y empezar a añadir productos a sus listas.
- **Monitorización**: En producción monitorizamos los contenedores de Docker (usando los comandos nativos y logs centralizados) y la salida de Laravel en `storage/logs/laravel.log`. Así, si una petición a la API falla o la base de datos devuelve un error 500, nos enteramos al instante.
- **Escalabilidad técnica**: La separación en microservicios mediante Docker nos permite escalar la aplicación. Si el frontend (React) recibe millones de visitas, podemos meterle un balanceador de carga o servirlo mediante una CDN (como Cloudflare), mientras que el backend de Laravel se puede replicar sin tocar la base de datos principal MySQL.

---

## Dónde encontrar en el repositorio

- **Frontend (Interfaz y UX)**: Todo el flujo dinámico está en `frontend/src/pages` y `frontend/src/components`.
- **Consumo de datos**: El servicio que gestiona las peticiones HTTP y la integración de la API está centralizado en `frontend/src/services/api.js`.
- **Código del Scraper de Python**: En la carpeta `python/`. El script principal es `webscrapper.py`, y tiene su propio archivo de dependencias en `requirements.txt`.
- **Lógica de importación**: La inyección de datos recolectados por el scraper está en `backend/database/seeders`.
