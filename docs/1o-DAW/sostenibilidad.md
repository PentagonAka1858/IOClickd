# Sostenibilidad aplicada al sistema productivo (1º DAW)

La asignatura de Sostenibilidad a veces se ve como algo metido con calzador, pero cuando te pones a programar te das cuenta de que un servidor mal optimizado consume recursos a lo loco. Esto se traduce en más electricidad consumida y más huella de carbono digital. Para **IOClickd** he aplicado algunas pautas de **Green Code** (código limpio y eficiente) que no solo hacen que la web vaya más rápido, sino que también cuidan el servidor.

## Eficiencia del software (Green Code)

En el desarrollo de software, "sostenible" es sinónimo de "optimizado". He metido varias mejoras para reducir el consumo de CPU y memoria en el servidor:

- **Estrategia contra el problema de consulta N+1**: En Laravel, si pides las reseñas de varios productos sin optimizar, Eloquent puede acabar ejecutando una consulta a la base de datos por cada producto individual. He usado la carga previa (*eager loading*) con `with()` para traer los datos relacionados en una sola consulta. Esto ahorra un montón de peticiones a MySQL y baja el consumo de CPU.
- **Paginación en la API**: En lugar de escupir todo el catálogo de periféricos de golpe (lo que consumiría un montón de ancho de banda y memoria RAM del servidor al procesar la respuesta), he programado paginación. Los productos se devuelven en paquetes pequeños, reduciendo la carga y haciendo que las peticiones se completen antes.
- **Indexación inteligente**: Como explico en la parte de bases de datos, meter índices en las columnas por las que más se busca evita que la base de datos lea miles de filas inútilmente en el disco duro.

---

## Impacto socio-ambiental (Economía circular y e-waste)

Aunque somos un catálogo digital, el impacto indirecto es real:
- **Reducción de residuos electrónicos (E-waste)**: Uno de los grandes problemas hoy en día es que la gente compra periféricos a ciegas, no le gustan o no se adaptan a su mano, los devuelven o los dejan tirados en un cajón. Al ofrecer un comparador técnico real basado en datos empíricos de la comunidad, ayudamos a que los usuarios compren exactamente el ratón o teclado que necesitan, alargando su vida útil y reduciendo devoluciones de transporte innecesarias.
- **Sin tracking invasivo**: No metemos scripts de analítica pesados ni cookies de rastreo que estén constantemente mandando peticiones en segundo plano en el navegador del usuario (lo que gasta batería del móvil y datos innecesarios). La autenticación es directa con cookies de sesión minimalistas.

---

## Viabilidad y mantenimiento del sistema

Un sistema sostenible debe durar en el tiempo sin requerir una inversión absurda de horas o recursos:
- **Estructura estandarizada**: El uso de frameworks consolidados (Laravel y React) asegura que cualquier otro programador que entre al proyecto pueda entenderlo y mantenerlo en dos minutos sin tener que reescribir código.
- **Backups sencillos**: El volumen de la base de datos de MySQL está aislado, lo que facilita programar un script cron en el host para hacer volcados `mysqldump` nocturnos y guardarlos comprimidos, ocupando el mínimo espacio en disco.

---

## Dónde encontrar en el repositorio

- **Carga optimizada de consultas**: En los controladores en la carpeta `backend/app/Http/Controllers/Api` (donde verás el uso de Eloquent con paginación y eager loading).
- **Esquema de índices y claves**: En las migraciones de base de datos en la carpeta `backend/database/migrations`.
- **Scripts de despliegue ligeros**: En el directorio `docker/`.
