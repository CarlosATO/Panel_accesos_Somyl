# Despliegue a Producción — guía rápida

Este repo ahora incluye todo lo necesario para desplegar la nueva SPA (React) junto con el backend Flask en la misma URL (la SPA se sirve desde `frontend/dist`).

Opciones soportadas por los artefactos incluidos:

- Docker (multi-stage build) — `Dockerfile` construye frontend y empaqueta el backend para producción.
- Docker Compose — `docker-compose.prod.yml` para ejecutar localmente/servidor.
- GitHub Actions — workflow `ci-deploy.yml` que construye la SPA, empaqueta la imagen Docker y la publica en GitHub Container Registry (GHCR). Tiene soporte opcional para desplegar a Heroku si definiste secretos.

Requisitos mínimos / Secrets
- En tu repo GitHub: añade los secretos siguientes (Settings → Secrets):
  - `GITHUB_TOKEN` (ya existe por defecto, se usa para GHCR write if enabled)
  - opcional: `HEROKU_API_KEY`, `HEROKU_APP_NAME`, `HEROKU_EMAIL` si quieres que el workflow despliegue a Heroku

Despliegue manual (Docker)

1) Construir la imagen con Docker (ejemplo local):

```bash
# desde la raíz del repo
docker build -t portal_sso:latest .

# ejecutar
docker run -e SECRET_KEY=xxx -e SUPABASE_URL=... -e SUPABASE_KEY=... -p 5001:5001 portal_sso:latest
```

2) O usando compose:

```bash
SECRET_KEY=algoseguro SUPABASE_URL=... SUPABASE_KEY=... docker compose -f docker-compose.prod.yml up -d --build
```

Despliegue con GitHub Actions
1. Asegúrate que tu repo está en GitHub y que `ghcr` está autorizado.
2. Añade secretos (HEROKU... si usas Heroku). El workflow construirá y empujará imagen a GHCR.

Notas de seguridad
- No pase tokens JWT en querystring en producción; en su lugar, use un end-point de intercambio POST que genere la cookie de sesión.
- Asegúrate de revisar y configurar `SECRET_KEY` y `JWT_SECRET_KEY` en el entorno de producción.
