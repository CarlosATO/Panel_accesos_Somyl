# Nota importante — SPA only

This repository has been trimmed: the old server-side templates (login, dashboard and server-rendered admin pages) were removed. The React SPA under `frontend/` is now the canonical UI and communicates with Flask API endpoints under `/api`.

# portal_sso

Pequeño portal SSO para lanzar aplicaciones desde un menú.

Requisitos
- Python 3.11+

Instalación

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Variables de entorno
- Copia `.env` y actualiza `SSO_USER`, `SSO_PASS`, `SECRET_KEY` (IMPORTANTE: `SECRET_KEY` permite a Flask usar sesiones y mensajes flash). No subas `.env` a repositorios públicos.

Además, define `SUPERUSER_EMAIL` para controlar quién tendrá acceso al módulo "Administración / Usuarios SSO". Por ahora la app considera superusuario únicamente si
el email del usuario coincide exactamente con `SUPERUSER_EMAIL`.

Ejemplo mínimo para desarrollo (archivo `.env`):

```
SSO_USER=usuario_de_prueba@example.com
SSO_PASS=secret
SECRET_KEY=alguna_clave_segura
SUPERUSER_EMAIL=carlosalegria@me.com
```

Migración (agregar columna `is_superuser`)
Si quieres almacenar los superusuarios en la base de datos, añade la columna booleana `is_superuser` a la tabla `usuarios_sso`.
Puedes ejecutar el SQL de migración desde la consola SQL de Supabase (o desde psql si tienes acceso):

```sql
ALTER TABLE public.usuarios_sso
	ADD COLUMN IF NOT EXISTS is_superuser boolean DEFAULT false;

-- (opcional) marcar un usuario específico como superuser
UPDATE public.usuarios_sso SET is_superuser = TRUE WHERE email = 'carlosalegria@me.com';
```

También viene incluido un script `set_admin.py` que actualiza el campo `is_superuser` para un email dado (requiere `SUPABASE_URL` y `SUPABASE_KEY` en tu `.env`).

Si `SECRET_KEY` no está configurada, la app generará una clave temporal para pruebas locales — cambia a una clave segura para producción.

JWT (SSO) token
- `JWT_SECRET_KEY` se usa para firmar los tokens SSO que el portal genera para que las apps destino los validen.
- Si no defines `JWT_SECRET_KEY`, la app usará `SECRET_KEY` como fallback o generará una clave temporal para desarrollo. En producción define `JWT_SECRET_KEY` en `.env` o en un Secret Manager.

Ejecutar

```bash
flask --app app --debug run
# El servidor usa por defecto el puerto 5000 (configuración fija en `app.py`).
# Si necesitas forzar otro puerto, modifica la línea `app.run(port=5000, ...)` en `app.py` o levanta un proxy/reverse-proxy.
```

O

# Nota importante — SPA only

This repository has been trimmed: the old server-side templates (login, dashboard and server-rendered admin pages) were removed. The React SPA under `frontend/` is now the canonical UI and communicates with Flask API endpoints under `/api`.

If you want to push this cleaned project into a fresh repo for a clean Railway deployment, see the section "Deploy to Railway" below.
python app.py
# O usar otro puerto si 5000 está en uso:
# PORT=5005 python app.py
```




Despliegue (opción para que la nueva SPA ocupe la URL antigua)
1) Construir la app React y colocar los archivos de build en `frontend/dist` (Flask servirá desde ahí):

```bash
cd frontend
npm install
npm run build
# o desde la raíz del repo usando el helper
./scripts/build_and_copy.sh
```

2) Asegúrate de que el backend siga corriendo (Flask) — ahora `app.py` está configurado para servir `frontend/dist` y tiene una ruta "catch-all" que devuelve `index.html`.

3) Resultado: las otras apps que redirigen a la URL antigua del panel (por ejemplo `https://portal.example.com` o `http://localhost:5001`) aterrizarán en la nueva SPA sin cambios en sus redirecciones, y la sesión se mantendrá (si la cookie/SSO es válida) porque la SPA consulta `/api/dashboard` con credenciales.

---

Deploy to Railway — minimal steps
- Create a new repo in GitHub (e.g. `CarlosATO/Panel_accesos_Somyl`) and push this branch there.
- In Railway create a new project and connect to the new GitHub repo.
- In Railway service settings choose "Use Dockerfile" (root = repo root). This repo includes a multi-stage Dockerfile which builds the SPA and bundles the backend.
- Ensure the service has environment variables set: `SUPABASE_URL`, `SUPABASE_KEY`, `SECRET_KEY`, `JWT_SECRET_KEY`, `SUPERUSER_EMAIL` (if desired); Railway will provide a `PORT` env for the container — the container `start.sh` validates `PORT` and falls back to 5001 if not present.

If you want, I can help prepare the new repository (create minimal README, branch, and instructions) — tell me when to proceed.

Replacing the logo / favicon
--------------------------------
I added placeholder assets in `frontend/public` named `logo-somyl.svg` and `favicon.svg` so the login page shows a Somyl-branded header. To use the official Somyl logo and favicon:

- Download the official logo and favicon files from https://www.somyl.com/ (or from your marketing assets).
- Replace `frontend/public/logo-somyl.svg` and `frontend/public/favicon.svg` with the real files (keep the same filenames) and commit.
- Rebuild the frontend (`cd frontend && npm run build`) so the updated assets are copied into `frontend/dist` and served by Flask in production.

Terminal 1 - Backend (Flask): 
cd /Users/carlosalegria/Desktop/Aplicaciones Carlos Alegria/PORTAL_SOMYL_2026/portal_sso" && source .venv/bin/activate && python app.py

Terminal 2 - Frontend (React): 
cd /Users/carlosalegria/Desktop/Aplicaciones Carlos Alegria/PORTAL_SOMYL_2026/portal_sso/frontend" && npm run dev 