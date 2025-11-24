import os
# jwt/bcrypt/datetime moved to API blueprints (auth/usuarios). Keep app.py small.
from flask import Flask, request, redirect, url_for, session, flash, jsonify, send_from_directory, abort
from supabase import create_client, Client
from dotenv import load_dotenv
from flask_cors import CORS

# Importar blueprints
from routes.usuarios import usuarios_bp
from routes.auth import auth_bp

load_dotenv()

# Serve React build files from frontend/dist so the SPA can occupy the old portal URL
static_dir = os.path.join(os.path.dirname(__file__), 'frontend', 'dist')
app = Flask(__name__, static_folder=static_dir, template_folder='templates')
CORS(app, supports_credentials=True, origins=['http://localhost:5173', 'http://localhost:5174'])

# Asegura que exista una secret key para usar la sesión y mensajes flash.
app.secret_key = os.getenv("SECRET_KEY")
if not app.secret_key:
    import secrets
    app.secret_key = secrets.token_urlsafe(24)
    print("WARNING: SECRET_KEY no encontrada en .env — usando clave temporal (cambiar para producción)")

# 1. Conexión a la Base de Datos Central
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client | None = None

def get_supabase() -> Client:
    global supabase
    if supabase is None:
        try:
            if not url or not key:
                raise RuntimeError('SUPABASE_URL o SUPABASE_KEY no definidas')
            supabase = create_client(url, key)
        except Exception as e:
            print(f"WARNING: no se pudo inicializar Supabase en import: {e}")
            raise
    return supabase

# Configurar Supabase client en la app
app.config['SUPABASE_CLIENT'] = get_supabase()

# 2. Configuración del Token
# JWT signing is handled by the /api/auth blueprint (see routes/auth.py)

@app.route('/')
def index():
    # Serve SPA front-end at root so external apps that redirect to the old
    # portal root continue to land on the new React app. The SPA will then
    # call /api/dashboard to check session and decide whether to show login.
    index_file = os.path.join(app.static_folder or '', 'index.html')
    if os.path.exists(index_file):
        return send_from_directory(app.static_folder, 'index.html')
    # fallback to old behaviour if no build exists
    if 'user_email' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Legacy route removed — SPA handles login via /api/login. Redirect to root so client-side router takes over."""
    # The SPA should handle login; keep a safe redirect here for backwards compatibility
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    """Legacy server-rendered dashboard removed — redirect to SPA root so client-side router handles the dashboard route."""
    return redirect(url_for('index'))


@app.route('/health')
def health():
    return {'status': 'ok'}, 200

@app.route('/logout')
def logout():
    """Keep a simple logout redirect for compatibility; SPA uses POST /api/logout for API-based logouts."""
    session.clear()
    return redirect(url_for('index'))

# Módulo de Administración de Usuarios SSO
@app.route('/admin')
def admin():
    """Legacy admin page removed — admin UI is now in the React SPA at /admin. Redirect to SPA root."""
    return redirect(url_for('index'))

@app.route('/admin/create', methods=['GET', 'POST'])
def create_user():
    """Legacy server-side create user page removed — use the SPA and the /api/admin endpoints instead."""
    return redirect(url_for('index'))

@app.route('/admin/edit/<user_id>', methods=['GET', 'POST'])
def edit_user(user_id):
    """Legacy server-side edit user page removed — SPA uses /api/admin endpoints for CRUD."""
    return redirect(url_for('index'))

@app.route('/admin/delete/<user_id>', methods=['POST'])
def delete_user(user_id):
    """Legacy server-side delete user endpoint removed — use /api/admin users DELETE instead."""
    return redirect(url_for('index'))


# (removed) endpoint for toggling users from table view — toggling must be done via edit modal

# Registrar Blueprints (módulos separados)
# Registrar Blueprints (módulos separados)
app.register_blueprint(auth_bp)
app.register_blueprint(usuarios_bp)


# SPA catch-all: serve index.html for any non-API path so the new React app
# can handle client-side routes (this allows external apps to keep redirecting
# to the old portal URL and land on the new SPA). We must ignore API paths
# so they continue to be routed to Flask endpoints.
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def spa_catch_all(path):
    # If path begins with api/, let Flask handle it (should be matched earlier by routes)
    if path.startswith('api'):
        abort(404)

    # If static file exists in the build, serve it directly
    static_path = os.path.join(app.static_folder or '', path)
    if path and os.path.exists(static_path) and os.path.isfile(static_path):
        return send_from_directory(app.static_folder, path)

    # Otherwise return index.html so the SPA router takes over
    index_file = os.path.join(app.static_folder or '', 'index.html')
    if os.path.exists(index_file):
        return send_from_directory(app.static_folder, 'index.html')

    # No build available: hint to developer
    return "React build not found. Run `cd frontend && npm run build` and place the output in frontend/dist.", 500

if __name__ == '__main__':
    # Fija explícitamente el puerto por defecto a 5001 (5000 ocupado)
    # Si necesitas otro puerto manualmente, cambia aquí o usa un proxy/reverse-proxy.
    app.run(port=5001, debug=True)
