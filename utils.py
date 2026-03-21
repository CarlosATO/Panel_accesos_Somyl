import os
import jwt
from datetime import datetime
from functools import wraps
from flask import session, jsonify, current_app, request

def get_active_url(env_key: str):
    """
    Retorna la URL activa considerando overrides locales si APP_ENV=local.
    """
    app_env = os.getenv('APP_ENV', 'production')
    if app_env == 'local':
        local_key = f'LOCAL_{env_key}'
        local_val = os.getenv(local_key)
        if local_val:
            return local_val
    return os.getenv(env_key)

def get_user_rut_from_session():
    """Obtiene el RUT de la empresa del usuario actual desde la sesión"""
    user_data = session.get('user_data', {})
    # Por ahora retornamos un RUT fijo para Somyl - en el futuro se derivará del usuario
    return user_data.get('empresa_rut', '96.511.940-0')

def is_authenticated():
    """
    Verifica si el usuario está autenticado por sesión o JWT token.
    Retorna True si está autenticado, False si no.
    """
    # 1. Verificar sesión Flask
    if 'user_email' in session:
        return True
    
    # 2. Verificar Bearer token en header Authorization
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        try:
            jwt_secret = os.getenv('JWT_SECRET_KEY', 'somyl-jwt-secret-key-2024')
            jwt.decode(token, jwt_secret, algorithms=['HS256'])
            return True
        except:
            return False
    
    return False

def require_active_subscription(f):
    """
    Decorador que verifica si la empresa tiene una suscripción activa.
    Acepta autenticación por sesión Flask o Bearer token JWT.
    Si está pendiente o expirada, retorna error 403 con {"locked": true}.
    EXCEPCIÓN: Superusuarios siempre tienen acceso (para poder administrar).
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Verificar primero que esté autenticado (por sesión o JWT)
        if not is_authenticated():
            return jsonify({'error': 'No autorizado'}), 401
        
        # Superusuarios siempre tienen acceso (para poder administrar)
        user_data = session.get('user_data', {})
        if user_data.get('is_superuser'):
            return f(*args, **kwargs)
        
        # Por ahora, deshabilitar verificación de suscripción para desarrollo
        # TODO: Reactivar cuando empresa_suscripciones esté configurada
        saas_enabled = os.getenv('SaaS_ENABLED', 'false').lower() == 'true'
        if not saas_enabled:
            return f(*args, **kwargs)
        
        try:
            sb = current_app.config['SUPABASE_CLIENT']
            user_rut = get_user_rut_from_session()
            
            # Consultar estado de suscripción
            resp = sb.table('empresa_suscripciones').select('*').eq('rut_empresa', user_rut).execute()
            
            if not resp.data:
                # No existe registro de suscripción - crear uno pendiente y bloquear
                sb.table('empresa_suscripciones').insert({
                    'rut_empresa': user_rut,
                    'estado': 'PENDIENTE'
                }).execute()
                
                return jsonify({
                    'locked': True,
                    'message': 'Pago requerido'
                }), 403
            
            suscripcion = resp.data[0]
            estado = suscripcion.get('estado', 'PENDIENTE')
            
            # Verificar estado
            if estado != 'ACTIVA':
                return jsonify({
                    'locked': True,
                    'message': 'Pago requerido'
                }), 403
            
            # Verificar fecha de vencimiento si existe
            fecha_vencimiento = suscripcion.get('fecha_vencimiento')
            if fecha_vencimiento:
                try:
                    # Parsear fecha (viene como string ISO)
                    fecha_venc = datetime.fromisoformat(fecha_vencimiento.replace('Z', '+00:00'))
                    if datetime.now(fecha_venc.tzinfo) > fecha_venc:
                        # Expirada - cambiar estado a PENDIENTE
                        sb.table('empresa_suscripciones').update({
                            'estado': 'PENDIENTE'
                        }).eq('rut_empresa', user_rut).execute()
                        
                        return jsonify({
                            'locked': True,
                            'message': 'Pago requerido'
                        }), 403
                except (ValueError, TypeError):
                    # Error parseando fecha - mejor ser conservador y permitir
                    pass
            
            # Todo OK - ejecutar función original
            return f(*args, **kwargs)
            
        except Exception as e:
            print(f"Error verificando suscripción: {e}")
            # En caso de error, permitir acceso para evitar bloqueos por problemas técnicos
            return f(*args, **kwargs)
    
    return decorated_function
