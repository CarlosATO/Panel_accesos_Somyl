import os
import jwt
import bcrypt
import datetime
from flask import Flask, render_template, request, redirect, url_for, session, flash
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Asegura que exista una secret key para usar la sesión y mensajes flash.
# En entornos de desarrollo aceptamos un fallback, pero para producción debe definirse
# SECRET_KEY en tu .env y NO subirse a git.
app.secret_key = os.getenv("SECRET_KEY")
if not app.secret_key:
    # Genera un secreto temporal para desarrollo y muestra advertencia.
    import secrets
    app.secret_key = secrets.token_urlsafe(24)
    print("WARNING: SECRET_KEY no encontrada en .env — usando clave temporal (cambiar para producción)")

# 1. Conexión a la Base de Datos Central (App Cargos)
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
# Creamos el cliente de Supabase de forma perezosa para evitar errores o bloqueos
# durante la importación del módulo (útil en entornos de despliegue).
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
            # Re-lanzar para que los handlers lo manejen si es necesario
            raise
    return supabase

# 2. Configuración del Token
JWT_SECRET = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET:
    # Fallback: usa SECRET_KEY si está presente; si no, genera una clave temporal.
    JWT_SECRET = os.getenv('SECRET_KEY')
if not JWT_SECRET:
    import secrets
    JWT_SECRET = secrets.token_urlsafe(32)
    print('WARNING: JWT_SECRET_KEY no encontrada en .env — usando valor temporal (cambiar para producción)')

@app.route('/')
def index():
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

if __name__ == '__main__':
    # Fija explícitamente el puerto por defecto a 5000
    # Si necesitas otro puerto manualmente, cambia aquí o usa un proxy/reverse-proxy.
    app.run(port=5000, debug=True)