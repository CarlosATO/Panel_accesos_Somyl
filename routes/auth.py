"""
Módulo de rutas para autenticación
Contiene login, logout y verificación de sesión
"""
from flask import Blueprint, request, session, jsonify
import bcrypt
import jwt
import datetime
import os
from utils import get_active_url

auth_bp = Blueprint('auth', __name__, url_prefix='/api')
# Deshabilitar strict_slashes para evitar errores 404 con/sin slash final
auth_bp.url_value_preprocessor(lambda endpoint, values: None)  # Hack para evitar efecto secundario
# Mejor opción: definir strict_slashes=False en cada ruta o globalmente si es posible.
# Flask Blueprint no tiene argumento strict_slashes en el constructor.
# Lo aplicaremos ruta por ruta o manejaremos la redirección.
# Pero dado que el error 404 es persistente, aseguraremos que funcione con ambos.

def get_supabase_client():
    """Obtener cliente de Supabase desde el contexto de la app"""
    from flask import current_app
    return current_app.config['SUPABASE_CLIENT']

@auth_bp.route('/login', methods=['POST'], strict_slashes=False)
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
                    'herramientas': user['rol_herramientas'],
                    'rrhh': user.get('rol_rrhh', 'false')
                },
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
            }
            token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
            
            return jsonify({'token': token, 'user': user})
        else:
            return jsonify({'error': 'Contraseña incorrecta'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/dashboard', strict_slashes=False)
def dashboard():
    """Obtener datos del dashboard del usuario"""
    if 'user_email' not in session:
        return jsonify({'error': 'No autorizado'}), 401
    
    # Refresh current user
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
            'logistica': user['rol_logistica'],
            'produccion': user.get('rol_produccion', 'false'),  # ✅ Agregar rol producción
            'rrhh': user.get('rol_rrhh', 'false')
        },
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }
    token_sso = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    
    # 1. Leemos las variables usando el helper para soportar overrides locales
    url_logistica = get_active_url("URL_LOGISTICA") or "http://localhost:5174"
    url_flota = get_active_url("URL_FLOTA") or "http://localhost:5176" 
    url_rrhh = get_active_url("URL_RRHH") or "https://rrhhsomyl2026-production.up.railway.app"
    url_construccion = get_active_url("URL_CONSTRUCCION") or get_active_url("URL_PRODUCCION") or "http://localhost:5180"
    url_ordenes = get_active_url("URL_ORDENES") or "https://pagos.datix.cl/sso/login"
    
    # Helper para unir URL y params correctamente
    def make_sso_url(base_url, token):
        sep = "&" if "?" in base_url else "?"
        return f"{base_url}{sep}token={token}"

    links = {
        'ordenes': make_sso_url(url_ordenes, token_sso),
        'fibra': f"https://pro.datix.cl/sso/login?token={token_sso}",
        'herramientas': f"https://herramientas.datix.cl/sso/login?token={token_sso}",
        
        # 2. Usamos las variables dinámicas para módulos locales
        'flota': f"{url_flota}/sso/login?token={token_sso}",
        'logistica': f"{url_logistica}/?token={token_sso}",
        'rrhh': f"{url_rrhh}/?token={token_sso}",

        # Construcción / Producción de obras
        'construccion': f"{url_construccion}/?token={token_sso}",
        # Alias 'produccion' para compatibilidad con el campo 'rol_produccion' en la BD
        'produccion': f"{url_construccion}/?token={token_sso}"
    }
    
    # Obtener estado de suscripción si SaaS está habilitado
    subscription = None
    saas_enabled = os.getenv('SaaS_ENABLED', 'false').lower() == 'true'
    
    # MODO TEST: Forzar suscripción vencida para pruebas
    saas_test_expired = os.getenv('SaaS_TEST_EXPIRED', 'false').lower() == 'true'
    
    if saas_enabled:
        if saas_test_expired:
            # Modo prueba: simular suscripción vencida
            subscription = {'status': 'inactive', 'test_mode': True}
        else:
            try:
                user_rut = user.get('empresa_rut', '76.693.850-3')
                resp = sb.table('empresa_suscripciones').select('*').eq('rut_empresa', user_rut).execute()
                if resp.data:
                    suscripcion = resp.data[0]
                    subscription = {
                        'status': 'active' if suscripcion.get('estado') == 'ACTIVA' else 'inactive',
                        'estado': suscripcion.get('estado'),
                        'expiry_date': suscripcion.get('fecha_vencimiento')
                    }
                else:
                    subscription = {'status': 'inactive'}
            except Exception as e:
                print(f"Error obteniendo suscripción: {e}")
                subscription = {'status': 'inactive'}
    
    return jsonify({
        'user': user, 
        'links': links,
        'subscription': subscription,
        'saas_enabled': saas_enabled
    })

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Cerrar sesión del usuario"""
    session.clear()
    return jsonify({'message': 'Sesión cerrada exitosamente'})
