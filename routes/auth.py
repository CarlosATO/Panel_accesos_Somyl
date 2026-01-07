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

"""
Módulo de rutas para autenticación
"""
from flask import Blueprint, request, session, jsonify
import bcrypt
import jwt
import datetime
import os

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

def get_supabase_client():
    from flask import current_app
    return current_app.config['SUPABASE_CLIENT']

@auth_bp.route('/login', methods=['POST'])
def login():
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
            # Guardamos datos en sesión
            session['user_email'] = user['email']
            
            # Normalización de Superusuario
            super_email = (os.getenv('SUPERUSER_EMAIL') or '').strip().lower()
            user_email = (user.get('email') or '').strip().lower()
            user['is_superuser'] = bool(user.get('is_superuser')) or bool(super_email and user_email == super_email)
            
            session['user_data'] = user # <--- ESTO ES VITAL PARA PROYECTOS.PY
            
            # Generación de Token para otros módulos
            jwt_secret = os.getenv('JWT_SECRET_KEY') or os.getenv('SECRET_KEY')
            secret = jwt_secret.strip() if jwt_secret else "secret"
            
            now = datetime.datetime.utcnow()
            payload = {
                "iss": "supabase",
                "sub": str(user['id']),
                "aud": "authenticated",
                "role": "authenticated",
                "email": user['email'],
                "exp": now + datetime.timedelta(hours=8),
                "iat": now,
                "user_metadata": {
                    "roles": {
                        'produccion': user.get('rol_produccion')
                    }
                }
            }
            
            token = jwt.encode(payload, secret, algorithm='HS256')

            return jsonify({'token': token, 'user': user})
        else:
            return jsonify({'error': 'Contraseña incorrecta'}), 401
    except Exception as e:
        print(f"Error Login: {e}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/dashboard', methods=['GET'])
def dashboard():
    if 'user_email' not in session:
        return jsonify({'error': 'No autorizado'}), 401
    
    # Refrescamos datos de usuario
    sb = get_supabase_client()
    try:
        db_resp = sb.table('usuarios_sso').select('*').eq('email', session.get('user_email')).execute()
        if db_resp.data:
            user = db_resp.data[0]
            # Recalcular superuser
            super_email = (os.getenv('SUPERUSER_EMAIL') or '').strip().lower()
            user_email = (user.get('email') or '').strip().lower()
            user['is_superuser'] = bool(user.get('is_superuser')) or bool(super_email and user_email == super_email)
            session['user_data'] = user
        else:
            user = session.get('user_data')
    except:
        user = session.get('user_data')

    # Token simple para links
    jwt_secret = os.getenv('JWT_SECRET_KEY') or os.getenv('SECRET_KEY')
    secret = jwt_secret.strip() if jwt_secret else "secret"
    payload = {
        "sub": str(user['id']),
        "email": user['email'],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8)
    }
    token_sso = jwt.encode(payload, secret, algorithm='HS256')
    
    url_produccion = os.getenv("URL_PRODUCCION", "http://localhost:5180")
    url_logistica = os.getenv('URL_LOGISTICA')
    url_flota = os.getenv('URL_FLOTA')
    url_compras = os.getenv('URL_COMPRAS')

    links = {}
    # Agregar solo si la URL está definida en el entorno
    if url_produccion:
        links['produccion'] = f"{url_produccion}/?token={token_sso}"
    if url_logistica:
        links['logistica'] = f"{url_logistica}/?token={token_sso}"
    if url_flota:
        links['flota'] = f"{url_flota}/?token={token_sso}"
    if url_compras:
        # 'ordenes' corresponde al módulo de órdenes de pago/compras
        links['ordenes'] = f"{url_compras}/?token={token_sso}"
    
    return jsonify({'user': user, 'links': links})

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Sesión cerrada'})
    
