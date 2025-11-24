"""
Módulo de rutas para gestión de usuarios SSO
Contiene todos los endpoints API para CRUD de usuarios
"""
from flask import Blueprint, request, session, jsonify
import bcrypt
from supabase import Client

usuarios_bp = Blueprint('usuarios', __name__, url_prefix='/api/admin')

def get_supabase_client():
    """Obtener cliente de Supabase desde el contexto de la app"""
    from flask import current_app
    return current_app.config['SUPABASE_CLIENT']


def _current_user_db(session_email: str, sb: Client):
    """Return the current user record from DB by email or None."""
    if not session_email:
        return None
    try:
        resp = sb.table('usuarios_sso').select('*').eq('email', session_email).execute()
        if resp.data:
            return resp.data[0]
    except Exception:
        pass
    return None

@usuarios_bp.route('/users', methods=['GET'])
def listar_usuarios():
    """Listar todos los usuarios del sistema"""
    # Verify the caller is a superuser using fresh DB data (avoid stale sessions)
    sb = get_supabase_client()
    current = _current_user_db(session.get('user_email'), sb)
    if not current or not bool(current.get('is_superuser')):
        return jsonify({'error': 'No autorizado - se requieren permisos de administrador'}), 403
    
    try:
        sb = get_supabase_client()
        response = sb.table('usuarios_sso').select("*").execute()
        return jsonify({'users': response.data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@usuarios_bp.route('/users', methods=['POST'])
def crear_usuario():
    """Crear un nuevo usuario"""
    # Verify caller of create is superuser using fresh DB data
    sb = get_supabase_client()
    current = _current_user_db(session.get('user_email'), sb)
    if not current or not bool(current.get('is_superuser')):
        return jsonify({'error': 'No autorizado - se requieren permisos de administrador'}), 403
    
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    roles = data.get('roles', {})
    
    if not email or not password:
        return jsonify({'error': 'Email y contraseña requeridos'}), 400
    
    try:
        sb = get_supabase_client()
        
        # Verificar si el usuario ya existe
        existing = sb.table('usuarios_sso').select('*').eq('email', email).execute()
        if existing.data:
            return jsonify({'error': 'Usuario ya existe'}), 400
        
        # Hashear contraseña
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Crear usuario
        # Allow creating is_superuser (boolean) but only if the caller is a superuser
        is_super = bool(roles.get('admin', False))
        new_user = {
            'email': email,
            'password_hash': password_hash,
            # Persist only is_superuser; avoid writing rol_admin to prevent errors
            'is_superuser': is_super,
            'rol_ordenes': roles.get('ordenes', 'false'),
            'rol_fibra': roles.get('fibra', 'false'),
            'rol_flota': roles.get('flota', 'false'),
            'rol_herramientas': roles.get('herramientas', 'false')
        }
        
        sb.table('usuarios_sso').insert(new_user).execute()
        
        return jsonify({'message': 'Usuario creado exitosamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@usuarios_bp.route('/users/<user_id>', methods=['PUT'])
def actualizar_usuario(user_id):
    """Actualizar un usuario existente"""
    # Verify caller of update is superuser using fresh DB data
    sb = get_supabase_client()
    current = _current_user_db(session.get('user_email'), sb)
    if not current or not bool(current.get('is_superuser')):
        return jsonify({'error': 'No autorizado - se requieren permisos de administrador'}), 403
    
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    roles = data.get('roles', {})
    
    try:
        sb = get_supabase_client()
        
        # Allow updating is_superuser (and rol_admin) when present in roles
        update_data = {
            'email': email,
            'is_superuser': bool(roles.get('admin', False)),
            'rol_ordenes': roles.get('ordenes', 'false'),
            'rol_fibra': roles.get('fibra', 'false'),
            'rol_flota': roles.get('flota', 'false'),
            'rol_herramientas': roles.get('herramientas', 'false')
        }
        
        # Si se proporciona nueva contraseña, actualizarla
        if password:
            update_data['password_hash'] = bcrypt.hashpw(
                password.encode('utf-8'), 
                bcrypt.gensalt()
            ).decode('utf-8')
        
        # Prevent a user from revoking their own superuser status (would lock them out)
        if str(user_id) == str(current.get('id')) and not update_data.get('is_superuser'):
            return jsonify({'error': 'No puedes revocar tu propio rol de superusuario desde aquí'}), 400

        sb.table('usuarios_sso').update(update_data).eq('id', user_id).execute()
        
        return jsonify({'message': 'Usuario actualizado exitosamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@usuarios_bp.route('/users/<user_id>', methods=['DELETE'])
def eliminar_usuario(user_id):
    """Eliminar un usuario"""
    # Verify caller of delete is superuser using fresh DB data
    sb = get_supabase_client()
    current = _current_user_db(session.get('user_email'), sb)
    if not current or not bool(current.get('is_superuser')):
        return jsonify({'error': 'No autorizado - se requieren permisos de administrador'}), 403
    
    try:
        sb = get_supabase_client()
        sb.table('usuarios_sso').delete().eq('id', user_id).execute()
        
        return jsonify({'message': 'Usuario eliminado exitosamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
