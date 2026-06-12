# Bases de Datos (1º DAW)

A ver, la base de datos de **IOClickd** es básicamente el motor de toda la plataforma. Aunque en primero de DAW hacíamos los diseños pensando más en papel y teoría pura, aquí en segundo, al meter Laravel Eloquent, la cosa se vuelve mucho más real. La base de datos corre en MySQL 8.0 y la tenemos metida en un contenedor de Docker para no pelearnos con configuraciones raras en local.

## Diseño y diagramas

El modelo relacional que he montado no es demasiado complejo, pero sí que tiene bastantes relaciones N:M y dependencias de claves foráneas. Las tablas principales son:

- **`users`**: Para los usuarios de la plataforma (nombre, email, password hasheada con bcrypt y el rol, que por defecto es `USER` pero puede ser `MOD` o `ADMIN`).
- **`productos`**: Almacena los periféricos. Guardamos la marca, el modelo, el tipo (`RATON`, `TECLADO`, etc.) y la imagen (o la ruta al SVG por defecto).
- **`listas_personales`** y **`productos_en_listas`**: Relación N:M clásica. Un usuario puede crear mil listas (privadas o públicas) y meter los productos que le dé la gana. Para eso usamos la tabla pivote `productos_en_listas`.
- **`inventario_personal`**: Para que el usuario se monte su setup. Guarda el `user_id`, `producto_id`, la cantidad y si es su periférico principal (`principal` como booleano).
- **`resenias`**: Los comentarios de la comunidad. Se relacionan con el usuario y el producto. También añadí campos para votos (`voto_up` y `voto_down`) para que la gente valore si una reseña es útil.
- **`consultas`** y **`mensajes`**: El sistema de soporte 1:N. Una consulta (ticket) la abre un cliente, la puede asignar un moderador, y contiene una tira de mensajes asociados.
- **`caracteristicas_detalladas`**: Datos técnicos avanzados para la comparación (por ejemplo, el sensor del ratón, DPIs máximos, peso, etc.). Está en una tabla separada con relación 1:1 con `productos` para no sobrecargar la tabla principal.
- **`seguimientos`**: Relación reflexiva para que los usuarios se puedan seguir entre ellos (seguidor -> seguido).

### Justificación de Normalización (3FN)
La verdad es que he normalizado el modelo hasta **Tercera Forma Normal (3FN)** casi sin querer, porque es lo más limpio:
1. **1FN**: Todos los atributos son atómicos. No hay listas de características metidas en un solo string raro.
2. **2FN**: No hay dependencias parciales. En las tablas con clave primaria compuesta (como `productos_en_listas` o `inventario_personal`), los atributos no clave dependen de toda la clave.
3. **3FN**: No hay dependencias transitivas. Por ejemplo, en vez de meter los detalles técnicos del comparador de ratones directamente en `productos` (lo que generaría un montón de campos nulos para teclados o auriculares), los he sacado a `caracteristicas_detalladas`.

---

## Código SQL y Estructura DDL

Aunque Laravel nos genera las tablas usando migraciones de PHP, por debajo lo que se acaba ejecutando en MySQL son sentencias DDL. Aquí dejo un ejemplo de cómo quedaría en SQL puro la creación de las tablas de productos y reseñas, que son críticas:

```sql
CREATE TABLE `productos` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `marca` VARCHAR(100) NOT NULL,
  `modelo` VARCHAR(150) NOT NULL,
  `tipo` ENUM('RATON', 'TECLADO', 'AURICULAR', 'MONITOR', 'ALFOMBRILLA', 'OTRO') NOT NULL,
  `descripcion` TEXT NULL,
  `imagen` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  INDEX `idx_marca_modelo` (`marca`, `modelo`) -- Optimización para búsquedas rápidas
);

CREATE TABLE `resenias` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `producto_id` BIGINT UNSIGNED NOT NULL,
  `puntuacion` TINYINT NOT NULL CHECK (`puntuacion` BETWEEN 1 AND 10),
  `comentario` TEXT NOT NULL,
  `voto_up` INT UNSIGNED DEFAULT 0,
  `voto_down` INT UNSIGNED DEFAULT 0,
  `visible` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
);
```

### Explicación de las claves y restricciones:
- **`ON DELETE CASCADE`**: Super importante. Si borramos un usuario de la base de datos o descatalogamos un producto, no queremos que se queden reseñas huérfanas rompiendo la integridad referencial. Así que se borran automáticamente.
- **Indexación**: He metido un índice simple en `productos` para el campo `marca`. Como el buscador del frontend filtra constantemente por este campo, con este índice MySQL no tiene que hacer un *full table scan*, sino que va directo usando el índice.

---

## Consultas DML Representativas

Para ver que todo funciona, aquí hay un par de consultas SQL que he usado para comprobar que los datos se recuperan correctamente y con buen rendimiento:

### 1. Obtener los productos mejor valorados (con media de reseñas)
Esta consulta calcula la puntuación media de los productos que tienen reseñas, los ordena de mejor a peor y los filtra para quedarnos solo con los ratones:

```sql
SELECT 
    p.id, 
    p.marca, 
    p.modelo, 
    ROUND(AVG(r.puntuacion), 1) AS nota_media,
    COUNT(r.id) AS total_resenias
FROM productos p
INNER JOIN resenias r ON p.id = r.producto_id
WHERE p.tipo = 'RATON' AND r.visible = TRUE
GROUP BY p.id, p.marca, p.modelo
HAVING total_resenias >= 3
ORDER BY nota_media DESC;
```

### 2. Comprobar el setup principal de un usuario
Buscamos el inventario personal de un usuario concreto (ej. `user_id = 5`) pero solo trayendo los periféricos que ha marcado como principales (su setup activo):

```sql
SELECT 
    i.cantidad, 
    p.marca, 
    p.modelo, 
    p.tipo
FROM inventario_personal i
INNER JOIN productos p ON i.producto_id = p.id
WHERE i.user_id = 5 AND i.principal = TRUE;
```

---

## Dónde encontrar en el repositorio

- **Migraciones (DDL)**: En la carpeta `backend/database/migrations`. Ahí está definida la estructura de las tablas en formato Laravel.
- **Modelos Eloquent**: En la carpeta `backend/app/Models` (ej.: `Producto.php`, `User.php`, `ListaPersonal.php`). Aquí se gestionan las relaciones (`hasMany`, `belongsTo`, `belongsToMany`) usando el ORM.
- **Seeds**: En la carpeta `backend/database/seeders` para poblar la base de datos al arrancar de cero.
