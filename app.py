import os
import jwt
import bcrypt
import datetime
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify, send_from_directory, abort
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
JWT_SECRET = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET:
    JWT_SECRET = os.getenv('SECRET_KEY')
if not JWT_SECRET:
    import secrets
    JWT_SECRET = secrets.token_urlsafe(32)
    print('WARNING: JWT_SECRET_KEY no encontrada en .env — usando valor temporal (cambiar para producción)')

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
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        try:
            # A. Buscamos al usuario en la tabla maestra
            sb = get_supabase()
            response = sb.table('usuarios_sso').select("*").eq('email', email).execute()
            
            if not response.data:
                flash('Usuario no encontrado', 'danger')
                return redirect(url_for('login'))

            user = response.data[0]

            # B. Verificamos la contraseña (asumiendo que usas bcrypt)
            # Nota: El hash en la DB debe ser string, encodeamos a bytes para comparar
            if bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                
                # C. ¡Login Exitoso! Guardamos sesión LOCAL en el portal
                session['user_email'] = user['email']
                session['user_data'] = user # Guardamos roles para usarlos en el dashboard
                return redirect(url_for('dashboard'))
            else:
                flash('Contraseña incorrecta', 'danger')

        except Exception as e:
            print(f"Error: {e}")
            flash('Error de conexión', 'danger')

    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    # Serve SPA's dashboard route so external apps that redirect to /dashboard
    # land in the new React app (which will call /api/dashboard and create UI based on session).
    index_file = os.path.join(app.static_folder or '', 'index.html')
    if os.path.exists(index_file):
        return send_from_directory(app.static_folder, 'index.html')

    if 'user_email' not in session:
        return redirect(url_for('login'))

    user = session['user_data']

    # D. Generamos el SUPER TOKEN (El Pasaporte)
    # Este token expira en 8 horas y contiene los roles
    payload = {
        'sub': user['id'], # ID del usuario
        'email': user['email'],
        'roles': {
            'ordenes': user['rol_ordenes'],
            'fibra': user['rol_fibra'],
            'flota': user['rol_flota'],
            'herramientas': user['rol_herramientas']
        },
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=8)
    }
    
    # Firmamos el token con la LLAVE MAESTRA
    token_sso = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    
    # URLs de tus proyectos (AJUSTA ESTAS URLS A TUS PROYECTOS REALES)
    # Nota: Les adjuntamos el token como parámetro GET
    links = {
        # EN PRODUCCIÓN (app.py del Portal)
        # Apuntamos a los dominios reales + la ruta /sso/login
        'ordenes': f"https://pagos.datix.cl/sso/login?token={token_sso}",
        'fibra':   f"https://pro.datix.cl/sso/login?token={token_sso}",
        'flota':   f"https://flota.datix.cl/sso/login?token={token_sso}",
        'herramientas': f"https://herramientas.datix.cl/sso/login?token={token_sso}"
    }

    return render_template('dashboard.html', user=user, links=links)


@app.route('/health')
def health():
    return {'status': 'ok'}, 200

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# Módulo de Administración de Usuarios SSO
@app.route('/admin')
def admin():
    # Refresh user from DB to ensure we check the current is_superuser state
    try:
        sb = get_supabase()
        db_user_resp = sb.table('usuarios_sso').select('*').eq('email', session.get('user_email')).execute()
        current = db_user_resp.data[0] if db_user_resp.data else session.get('user_data')
        session['user_data'] = current
    except Exception:
        current = session.get('user_data')

    if not current or not current.get('is_superuser'):
        flash('Acceso denegado: se requieren permisos de superusuario', 'danger')
        return redirect(url_for('dashboard'))
    
    try:
        sb = get_supabase()
        response = sb.table('usuarios_sso').select("*").execute()
        users = response.data
    except Exception as e:
        flash(f'Error al cargar usuarios: {e}', 'danger')
        users = []
    
    return render_template('admin.html', users=users)

@app.route('/admin/create', methods=['GET', 'POST'])
def create_user():
    # Ensure we have the latest user from DB for permission check
    try:
        sb = get_supabase()
        db_user_resp = sb.table('usuarios_sso').select('*').eq('email', session.get('user_email')).execute()
        current = db_user_resp.data[0] if db_user_resp.data else session.get('user_data')
        session['user_data'] = current
    except Exception:
        current = session.get('user_data')

    if not current or not current.get('is_superuser'):
        flash('Acceso denegado: se requieren permisos de superusuario', 'danger')
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        rol_admin = request.form.get('rol_admin') == 'on'
        rol_ordenes = request.form.get('rol_ordenes') == 'on'
        rol_fibra = request.form.get('rol_fibra') == 'on'
        rol_flota = request.form.get('rol_flota') == 'on'
        rol_herramientas = request.form.get('rol_herramientas') == 'on'
        
        if not email or not password:
            flash('Email y contraseña son obligatorios', 'danger')
            return redirect(url_for('create_user'))
        
        try:
            sb = get_supabase()
            # Verificar si el usuario ya existe
            existing = sb.table('usuarios_sso').select("*").eq('email', email).execute()
            if existing.data:
                flash('Usuario ya existe', 'danger')
                return redirect(url_for('create_user'))
            
            # Hash de la contraseña
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Insertar nuevo usuario
            # Insertar 'is_superuser' igual al checkbox rol_admin para compatibilidad
            sb.table('usuarios_sso').insert({
                'email': email,
                'password_hash': password_hash,
                'is_superuser': rol_admin,
                'rol_ordenes': rol_ordenes,
                'rol_fibra': rol_fibra,
                'rol_flota': rol_flota,
                'rol_herramientas': rol_herramientas
            }).execute()
            
            flash('Usuario creado exitosamente', 'success')
            return redirect(url_for('admin'))
        except Exception as e:
            flash(f'Error al crear usuario: {e}', 'danger')
    
    return render_template('create_user.html')

@app.route('/admin/edit/<user_id>', methods=['GET', 'POST'])
def edit_user(user_id):
    # Ensure latest permission check before editing
    try:
        sb = get_supabase()
        db_user_resp = sb.table('usuarios_sso').select('*').eq('email', session.get('user_email')).execute()
        current = db_user_resp.data[0] if db_user_resp.data else session.get('user_data')
        session['user_data'] = current
    except Exception:
        current = session.get('user_data')

    if not current or not current.get('is_superuser'):
        flash('Acceso denegado: se requieren permisos de superusuario', 'danger')
        return redirect(url_for('dashboard'))
    
    try:
        sb = get_supabase()
        if request.method == 'POST':
            email = request.form.get('email')
            password = request.form.get('password')
            rol_admin = request.form.get('rol_admin') == 'on'
            rol_ordenes = request.form.get('rol_ordenes') == 'on'
            rol_fibra = request.form.get('rol_fibra') == 'on'
            rol_flota = request.form.get('rol_flota') == 'on'
            rol_herramientas = request.form.get('rol_herramientas') == 'on'
            
            # Prevent a user from revoking their own superuser flag here
            if str(user_id) == str(current.get('id')) and not rol_admin:
                flash('No puedes revocar tu propio rol de superusuario desde aquí', 'danger')
                return redirect(url_for('edit_user', user_id=user_id))

            update_data = {
                'email': email,
                'is_superuser': rol_admin,
                'rol_ordenes': rol_ordenes,
                'rol_fibra': rol_fibra,
                'rol_flota': rol_flota,
                'rol_herramientas': rol_herramientas
            }
            
            if password:
                update_data['password_hash'] = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            sb.table('usuarios_sso').update(update_data).eq('id', user_id).execute()
            flash('Usuario actualizado', 'success')
            return redirect(url_for('admin'))
        
        # GET: cargar datos del usuario
        response = sb.table('usuarios_sso').select("*").eq('id', user_id).execute()
        if not response.data:
            flash('Usuario no encontrado', 'danger')
            return redirect(url_for('admin'))
        user = response.data[0]
    except Exception as e:
        flash(f'Error: {e}', 'danger')
        return redirect(url_for('admin'))
    
    return render_template('edit_user.html', user=user)

@app.route('/admin/delete/<user_id>', methods=['POST'])
def delete_user(user_id):
    # Ensure latest permission check for delete
    try:
        sb = get_supabase()
        db_user_resp = sb.table('usuarios_sso').select('*').eq('email', session.get('user_email')).execute()
        current = db_user_resp.data[0] if db_user_resp.data else session.get('user_data')
        session['user_data'] = current
    except Exception:
        current = session.get('user_data')

    if not current or not current.get('is_superuser'):
        flash('Acceso denegado: se requieren permisos de superusuario', 'danger')
        return redirect(url_for('dashboard'))
    
    try:
        sb = get_supabase()
        sb.table('usuarios_sso').delete().eq('id', user_id).execute()
        flash('Usuario eliminado', 'success')
    except Exception as e:
        flash(f'Error al eliminar: {e}', 'danger')
    
    return redirect(url_for('admin'))


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
