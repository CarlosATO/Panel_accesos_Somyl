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

```bash
python app.py
# O usar otro puerto si 5000 está en uso:
# PORT=5005 python app.py
```
Iniciar apps. : cd /Users/carlos
alegria/Desktop/Aplicaciones\ Carlos\ Alegria/portal_sso && /Users/car
losalegria/Desktop/Aplicaciones\ Carlos\ Alegria/portal_sso/.venv/bin/
python app.py