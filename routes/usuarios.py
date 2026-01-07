"""
Módulo de rutas para gestión de usuarios SSO
Contiene todos los endpoints API para CRUD de usuarios
"""
from flask import Blueprint, request, session, jsonify, current_app
import bcrypt
import os

# ⚠️ DEFINICIÓN DEL BLUEPRINT (Esto es lo que Python no encontraba)
usuarios_bp = Blueprint('usuarios', __name__, url_prefix='/api/admin')

def get_supabase_client():
    """Obtener cliente de Supabase desde la configuración global"""
    # Intentamos obtenerlo de la configuración de la app
    client = current_app.config.get('SUPABASE_CLIENT')
    if not client:
        # Fallback: Si por alguna razón no está en config, intentamos crearlo (aunque lo ideal es usar el de app)
        from supabase import create_client
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        if url and key:
            return create_client(url, key)
        raise ValueError("Cliente Supabase no inicializado en configuración")
    return client

def _current_user_db(session_email, sb):
    """Busca al usuario actual en la BD para verificar permisos frescos"""
    if not session_email:
        return None
    try:
        resp = sb.table('usuarios_sso').select('*').eq('email', session_email).execute()
        if resp.data:
            return resp.data[0]
    except Exception as e:
        print(f"Error verificando usuario: {e}")
    return None

# --- RUTAS ---

@usuarios_bp.route('/users', methods=['GET'])
def listar_usuarios():
    """Listar todos los usuarios del sistema"""
    try:
        sb = get_supabase_client()
        
        # 1. Verificar seguridad (Solo Superusuario)
        current = _current_user_db(session.get('user_email'), sb)
        if not current or not bool(current.get('is_superuser')):
            return jsonify({'error': 'No autorizado - Requiere permisos de Administrador'}), 403
    
        # 2. Obtener usuarios
        response = sb.table('usuarios_sso').select("*").order('email').execute()
        users = response.data or []

        # 3. Formatear respuesta segura
        lista_usuarios = []
        for user in users:
            lista_usuarios.append({
                'id': user.get('id'),
                'email': user.get('email'),
                'is_superuser': bool(user.get('is_superuser')),
                'rol_ordenes': user.get('rol_ordenes'),
                'rol_fibra': user.get('rol_fibra'),
                'rol_flota': user.get('rol_flota'),
                'rol_herramientas': user.get('rol_herramientas'),
                'rol_logistica': user.get('rol_logistica'),
                'rol_produccion': user.get('rol_produccion', 'false') # Aseguramos que venga este campo
            })

        return jsonify({'users': lista_usuarios}), 200
    except Exception as e:
        print(f"❌ Error listando usuarios: {e}")
        return jsonify({'error': str(e)}), 500

@usuarios_bp.route('/users', methods=['POST'])
def crear_usuario():
    """Crear un nuevo usuario"""
    try:
        sb = get_supabase_client()
        
        # 1. Verificar seguridad
        current = _current_user_db(session.get('user_email'), sb)
        if not current or not bool(current.get('is_superuser')):
            return jsonify({'error': 'No autorizado'}), 403
        
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        roles = data.get('roles', {})
        
        if not email or not password:
            return jsonify({'error': 'Email y contraseña requeridos'}), 400
        
        # 2. Verificar duplicados
        existing = sb.table('usuarios_sso').select('id').eq('email', email).execute()
        if existing.data:
            return jsonify({'error': 'El usuario ya existe'}), 400
        
        # 3. Hashear Password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # 4. Insertar
        new_user = {
            'email': email,
            'password_hash': password_hash,
            'is_superuser': bool(roles.get('admin', False)),
            'rol_ordenes': roles.get('ordenes', 'false'),
            'rol_fibra': roles.get('fibra', 'false'),
            'rol_flota': roles.get('flota', 'false'),
            'rol_herramientas': roles.get('herramientas', 'false'),
            'rol_logistica': roles.get('logistica', 'false'),
            'rol_produccion': roles.get('produccion', 'false')
        }
        
        sb.table('usuarios_sso').insert(new_user).execute()
        
        return jsonify({'message': 'Usuario creado exitosamente'}), 201

    except Exception as e:
        print(f"❌ Error creando usuario: {e}")
        return jsonify({'error': str(e)}), 500

@usuarios_bp.route('/users/<user_id>', methods=['PUT'])
def actualizar_usuario(user_id):
    """Actualizar un usuario existente"""
    try:
        sb = get_supabase_client()
        
        # 1. Verificar seguridad
        current = _current_user_db(session.get('user_email'), sb)
        if not current or not bool(current.get('is_superuser')):
            return jsonify({'error': 'No autorizado'}), 403
        
        data = request.get_json()
        password = data.get('password')
        roles = data.get('roles', {})
        
        update_data = {
            'is_superuser': bool(roles.get('admin', False)),
            'rol_ordenes': roles.get('ordenes', 'false'),
            'rol_fibra': roles.get('fibra', 'false'),
            'rol_flota': roles.get('flota', 'false'),
            'rol_herramientas': roles.get('herramientas', 'false'),
            'rol_logistica': roles.get('logistica', 'false'),
            'rol_produccion': roles.get('produccion', 'false')
        }
        
        # Si cambiaron la password
        if password and password.strip():
            update_data['password_hash'] = bcrypt.hashpw(
                password.encode('utf-8'), 
                bcrypt.gensalt()
            ).decode('utf-8')
        
        # Evitar auto-bloqueo (quitarse permisos a uno mismo)
        if str(user_id) == str(current.get('id')) and not update_data['is_superuser']:
            return jsonify({'error': 'No puedes revocar tu propio permiso de Superusuario'}), 400

        sb.table('usuarios_sso').update(update_data).eq('id', user_id).execute()
        
        return jsonify({'message': 'Usuario actualizado exitosamente'}), 200

    except Exception as e:
        print(f"❌ Error actualizando usuario: {e}")
        return jsonify({'error': str(e)}), 500

@usuarios_bp.route('/users/<user_id>', methods=['DELETE'])
def eliminar_usuario(user_id):
    """Eliminar un usuario"""
    try:
        sb = get_supabase_client()
        
        # 1. Verificar seguridad
        current = _current_user_db(session.get('user_email'), sb)
        if not current or not bool(current.get('is_superuser')):
            return jsonify({'error': 'No autorizado'}), 403

        # Evitar auto-eliminación
        if str(user_id) == str(current.get('id')):
             return jsonify({'error': 'No puedes eliminar tu propia cuenta'}), 400
        
        sb.table('usuarios_sso').delete().eq('id', user_id).execute()
        
        return jsonify({'message': 'Usuario eliminado exitosamente'}), 200

    except Exception as e:
        print(f"❌ Error eliminando usuario: {e}")
        return jsonify({'error': str(e)}), 500