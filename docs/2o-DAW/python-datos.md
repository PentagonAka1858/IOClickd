# Programación en Python y Análisis de Datos (2º DAW)

## Qué hay implementado

En el directorio [`python/`](../../python/) hay un scraper completo que extrae datos de ratones desde RTINGS y los exporta a JSON y CSV para su posterior uso en el catálogo de la aplicación.

### Archivos

| Archivo | Descripción |
|---------|-------------|
| `webscrapper.py` | Script principal de scraping |
| `requirements.txt` | Dependencias Python |
| `mice_dataset.json` | Dataset exportado en JSON |
| `mice_dataset.csv` | Dataset exportado en CSV |

## Tecnologías Python utilizadas

- **Playwright** — automatización de navegador headless (Chromium). Se usa porque RTINGS carga el contenido de forma dinámica con JavaScript, así que `requests` solo no es suficiente.
- **BeautifulSoup4** + **lxml** — parsing del HTML obtenido por Playwright para extraer datos de las tablas.
- **requests** — para peticiones HTTP simples en las partes que no requieren JS.
- **Módulos estándar**: `json`, `csv`, `datetime`, `logging`, `typing`.

## Cómo funciona el scraper

La clase principal `MouseScraper` sigue este flujo:

```
1. Lanza Chromium en modo headless con Playwright
2. Navega a https://www.rtings.com/mouse/tools/table
3. Espera a que se cargue la tabla (<table tbody tr>)
4. Extrae el HTML resultante
5. Lo parsea con BeautifulSoup para obtener filas y columnas
6. Por cada ratón extrae: nombre, marca, año, scores (work/fps/mmo), precio
7. Guarda en mice_dataset.json y mice_dataset.csv
```

Si el scraping de RTINGS falla (bloqueo, timeout, cambio de estructura), el script tiene un **fallback** con una base de datos hardcodeada de ratones populares con sus especificaciones reales.

## Instalación y uso

```bash
# Crear entorno virtual (recomendado)
python -m venv .venv
.venv\Scripts\activate   # Windows
source .venv/bin/activate  # Linux/macOS

# Instalar dependencias
pip install -r requirements.txt

# Descargar los binarios del navegador de Playwright
playwright install chromium

# Ejecutar el scraper
python webscrapper.py
```

Los archivos `mice_dataset.json` y `mice_dataset.csv` se generan en el mismo directorio `python/`.

## Estructura de los datos

Ejemplo de entrada en el dataset:

```json
{
  "name": "Logitech G PRO X SUPERLIGHT 2",
  "brand": "Logitech",
  "release_year": 2023,
  "work_score": 8.4,
  "fps_score": 9.1,
  "mmo_score": 7.2,
  "performance_rating": "Outstanding",
  "price_usd": 99,
  "source": "RTINGS",
  "scraped_date": "2024-06-10T12:00:00"
}
```

## Integración con la aplicación

Los datos obtenidos con el scraper se usan para:

1. **Poblar el catálogo** de productos a través de los seeders de Laravel (`database/seeders/`).
2. **Alimentar el comparador de ratones** (`/productos/comparar-ratones`) con especificaciones técnicas detalladas.
3. Servir como base para las `caracteristicas_detalladas` de cada producto en la BD.

El flujo manual sería: ejecutar el scraper → revisar el JSON → importar los datos al seeder Laravel → hacer `php artisan db:seed`.

## Métricas del dataset (resumen)

El scraper incluye un método `get_summary()` que calcula:

- Número total de ratones scrapeados
- Peso promedio en gramos
- Precio promedio en USD
- Número de marcas distintas
- Conteo de ratones inalámbricos vs con cable

```bash
# El script imprime el resumen al terminar:
# === Dataset Summary ===
# total_mice: 47
# average_weight_g: 74.3
# average_price_usd: 82.5
# brands: 12
# wireless_count: 23
# wired_count: 24
```

## Dónde encontrar en el repositorio

- Script de scraping: [`python/webscrapper.py`](../../python/webscrapper.py)
- Dependencias: [`python/requirements.txt`](../../python/requirements.txt)
- Dataset JSON: [`python/mice_dataset.json`](../../python/mice_dataset.json)
- Dataset CSV: [`python/mice_dataset.csv`](../../python/mice_dataset.csv)
