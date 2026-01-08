"""
Módulo de rutas para autenticación
Contiene login, logout y verificación de sesión
"""
from flask import Blueprint, request, session, jsonify
import bcrypt
import jwt
import datetime
import os

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

def get_supabase_client():
    """Obtener cliente de Supabase desde el contexto de la app"""
    from flask import current_app
    return current_app.config['SUPABASE_CLIENT']

@auth_bp.route('/login', methods=['POST'])
def login():
    """Autenticar usuario y crear sesión"""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    try:
        sb = get_supabase_client()
        response = sb.table('usuarios_sso').select("*").eq('email', email).execute()
        
        if not response.data:
            return jsonify({'error': 'Usuario no encontrado'}), 401

        user = response.data[0]

        if bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            session['user_email'] = user['email']
            # Agregar campo rol_admin basado en rol_ordenes
            user['rol_admin'] = (user.get('rol_ordenes') == 'admin')
            # Definir is_superuser: por ahora sólo permitimos el superusuario definido
            # por la variable de entorno SUPERUSER_EMAIL. No derivamos is_superuser de
            # otros campos (rol_admin) para evitar accesos indeseados.
            super_email = (os.getenv('SUPERUSER_EMAIL') or '').strip().lower()
            # Normalize emails to avoid mismatches por mayúsculas/espacios
            user_email = (user.get('email') or '').strip().lower()
            # Prefer the DB flag 'is_superuser' if present, otherwise fall back to SUPERUSER_EMAIL
            user['is_superuser'] = bool(user.get('is_superuser')) or bool(super_email and user_email == super_email)
            session['user_data'] = user
            
            # Generar token SSO
            JWT_SECRET = os.getenv('JWT_SECRET_KEY') or os.getenv('SECRET_KEY')
            payload = {
                'sub': user['id'],
                'email': user['email'],
                'roles': {
                    'ordenes': user['rol_ordenes'],
                    'fibra': user['rol_fibra'],
                    'flota': user['rol_flota'],
                    'herramientas': user['rol_herramientas']
                },
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=8)
            }
            token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
            
            return jsonify({'token': token, 'user': user})
        else:
            return jsonify({'error': 'Contraseña incorrecta'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/dashboard')
def dashboard():
    """Obtener datos del dashboard del usuario"""
    if 'user_email' not in session:
        return jsonify({'error': 'No autorizado'}), 401
    
    # Refresh current user from DB to pick up changes to is_superuser
    sb = get_supabase_client()
    db_resp = sb.table('usuarios_sso').select('*').eq('email', session.get('user_email')).execute()
    if db_resp.data:
        user = db_resp.data[0]
        # update session with latest data
        session['user_data'] = user
    else:
        user = session.get('user_data')
    # Asegurar que rol_admin esté presente
    user['rol_admin'] = (user.get('rol_ordenes') == 'admin')
    # Asegurar campo is_superuser (en caso de sesión anterior). Solo habilitamos
    # superuser si el email coincide con SUPERUSER_EMAIL — esto fuerza un único
    # superusuario explícito hasta que se implemente la columna DB dedicada.
    super_email = (os.getenv('SUPERUSER_EMAIL') or '').strip().lower()
    user_email = (user.get('email') or '').strip().lower()
    # Prefer the stored DB flag when available, otherwise fall back to SUPERUSER_EMAIL
    user['is_superuser'] = bool(user.get('is_superuser')) or bool(super_email and user_email == super_email)
    
    JWT_SECRET = os.getenv('JWT_SECRET_KEY') or os.getenv('SECRET_KEY')
    payload = {
        'sub': user['id'],
        'email': user['email'],
        'roles': {
            'ordenes': user['rol_ordenes'],
            'fibra': user['rol_fibra'],
            'flota': user['rol_flota'],
            'herramientas': user['rol_herramientas'],
            'logistica': user['rol_logistica']
        },
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=8)
    }
    token_sso = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    
    # 1. Leemos las variables. Si no existen, por seguridad usamos localhost
    url_logistica = os.getenv("URL_LOGISTICA", "http://localhost:5160")
    url_flota = os.getenv("URL_FLOTA", "http://localhost:5175")
    url_construccion = os.getenv("URL_CONSTRUCCION", os.getenv("URL_PRODUCCION", "http://localhost:5180"))

    links = {
        'ordenes': f"https://pagos.datix.cl/sso/login?token={token_sso}",
        'fibra': f"https://pro.datix.cl/sso/login?token={token_sso}",
        'herramientas': f"https://herramientas.datix.cl/sso/login?token={token_sso}",
        
        # 2. Usamos las variables dinámicas para módulos locales
        # Para módulos locales mantenemos el comportamiento específico:
        # - Flota: volver al endpoint /sso/login (necesario para la integración existente)
        # - Logística: SPA que recibe token en la raíz
        'flota': f"{url_flota}/sso/login?token={token_sso}",
        'logistica': f"{url_logistica}/?token={token_sso}"
        ,
        # Construcción / Producción de obras
        'construccion': f"{url_construccion}/?token={token_sso}",
        # Alias 'produccion' para compatibilidad con el campo 'rol_produccion' en la BD
        'produccion': f"{url_construccion}/?token={token_sso}"
    }
    
    return jsonify({'user': user, 'links': links})

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Cerrar sesión del usuario"""
    session.clear()
    return jsonify({'message': 'Sesión cerrada exitosamente'})
