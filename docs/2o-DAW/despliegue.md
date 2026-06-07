# Despliegue de Aplicaciones Web (2º DAW)

## Configuración del servidor y hosting
- Estado actual: no hay procedimiento Docker documentado en el `README.md` (se indica que no se pudo realizar). 
- TODO: documentar alternativa elegida (Cloud, VPS, contenedores) y pasos de configuración.

## Seguridad y protocolos
- Recomendación: uso de certificados SSL/HTTPS, gestión de dominios y prácticas básicas de hardening.
- TODO: documentar qué se ha implementado y cómo (certificados, cabeceras de seguridad, CSP, etc.).

## Automatización (CI/CD)
- TODO: añadir pipeline de despliegue o scripts para automatizar la puesta en marcha (GitHub Actions, GitLab CI, etc.).

## Dónde encontrar en el repositorio

- No hay configuración de Docker ni CI en el repo actualmente.
- Notas de instalación y despliegue: [docs/common/project-readme.md](../common/project-readme.md)
- Sugerencia: añadir `Dockerfile`, `docker-compose.yml` y un workflow en `.github/workflows/` para CI/CD.
