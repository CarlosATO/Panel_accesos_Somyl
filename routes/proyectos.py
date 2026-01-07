from flask import Blueprint, jsonify, session, request
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

proyectos_bp = Blueprint('proyectos', __name__)

# Variables de conexión para la DB de proyectos
url = os.environ.get("DB_PROYECTOS_URL")
key = os.environ.get("DB_PROYECTOS_KEY")

# Inicializamos el cliente de proyectos de forma segura. Si faltan las
# variables NO interrumpimos el arranque de la aplicación: dejamos
# `supabase_proyectos` en None y las rutas responderán de forma controlada.
supabase_proyectos: Client | None = None
if not url or not key:
    print("⚠️ DB_PROYECTOS no configurada en .env. Algunas rutas devolverán respuestas vacías o 503.")
else:
    try:
        supabase_proyectos = create_client(url, key)
    except Exception as e:
        print(f"❌ Error cliente Supabase: {e}")
        supabase_proyectos = None

# --- RUTAS DE LECTURA ---

@proyectos_bp.route('/api/proyectos', methods=['GET'])
def obtener_proyectos():
    try:
        if 'user_data' not in session:
            return jsonify({'error': 'No autorizado'}), 401

        # Si el cliente de proyectos no está inicializado, devolvemos lista vacía
        if supabase_proyectos is None:
            print("⚠️ Acceso a /api/proyectos solicitado pero DB_PROYECTOS no está configurada.")
            return jsonify([]), 200

        user = session['user_data']
        user_id = user.get('id')
        
        # 1. Roles y Banderas
        rol_produccion = str(user.get('rol_produccion', 'false')).lower().strip()
        es_superuser = bool(user.get('is_superuser', False))

        # 2. ESCENARIO ADMIN O SUPERUSUARIO (Ven Todo)
        if es_superuser or rol_produccion == 'admin':
            response = supabase_proyectos.table('proyectos')\
                .select('*')\
                .order('proyecto', desc=True)\
                .execute()
            return jsonify(response.data), 200

        # 3. ESCENARIO USUARIO NORMAL (Filtro por Tabla)
        elif rol_produccion in ['true', 'usuario', 'user']:
            permisos = supabase_proyectos.table('prod_acceso_proyectos')\
                .select('proyecto_id')\
                .eq('user_id', user_id)\
                .execute()
            
            ids_permitidos = [item['proyecto_id'] for item in permisos.data]

            if not ids_permitidos:
                return jsonify([]), 200

            response = supabase_proyectos.table('proyectos')\
                .select('*')\
                .in_('id', ids_permitidos)\
                .order('proyecto', desc=True)\
                .execute()
            
            return jsonify(response.data), 200

        else:
            return jsonify([]), 200

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': str(e)}), 500

@proyectos_bp.route('/api/mis-accesos/<string:user_id>', methods=['GET'])
def obtener_mis_accesos(user_id):
    """
    Obtiene los IDs de proyectos permitidos para un usuario específico.
    Se usa para pre-cargar los checkboxes en el Modal de Edición.
    """
    try:
        if supabase_proyectos is None:
            print("⚠️ Petición a /api/mis-accesos pero DB_PROYECTOS no está configurada.")
            return jsonify([]), 200

        response = supabase_proyectos.table('prod_acceso_proyectos')\
            .select('proyecto_id')\
            .eq('user_id', user_id)\
            .execute()
        ids = [item['proyecto_id'] for item in response.data]
        return jsonify(ids), 200
    except Exception as e:
        print(f"Error obteniendo accesos: {e}")
        return jsonify([]), 200

# --- NUEVA RUTA DE ESCRITURA (ADMINISTRACIÓN) ---

@proyectos_bp.route('/api/admin/asignar-proyectos', methods=['POST'])
def asignar_proyectos_usuario():
    """
    Guarda la lista de proyectos permitidos para un usuario.
    Lógica: Borra todo lo anterior e inserta lo nuevo.
    """
    try:
        # 1. Seguridad: Quien ejecuta esto debe ser Admin o Superuser
        if 'user_data' not in session:
            return jsonify({'error': 'No autorizado'}), 401
            
        admin_user = session['user_data']
        es_superuser = bool(admin_user.get('is_superuser', False))
        # Permitimos si es Superuser O si es Admin de Producción específicamente
        rol_prod_admin = str(admin_user.get('rol_produccion', '')).lower() == 'admin'

        if not (es_superuser or rol_prod_admin):
             return jsonify({'error': 'No tienes permisos para asignar proyectos'}), 403

        # 2. Obtener datos del Frontend
        data = request.get_json()
        target_user_id = data.get('user_id')
        nuevos_proyectos_ids = data.get('proyectos_ids', []) # Lista de IDs [1, 5, 8]

        if not target_user_id:
            return jsonify({'error': 'Falta el ID del usuario objetivo'}), 400

        print(f"💾 Guardando permisos para {target_user_id}. IDs: {nuevos_proyectos_ids}")

        # Si el cliente no está disponible, respondemos con error 503
        if supabase_proyectos is None:
            print("⚠️ Intento de guardar permisos pero DB_PROYECTOS no está configurada.")
            return jsonify({'error': 'DB_PROYECTOS no configurada en el servidor'}), 503

        # 3. Transacción (Simulada)
        # Paso A: Borrar permisos antiguos de este usuario
        supabase_proyectos.table('prod_acceso_proyectos')\
            .delete()\
            .eq('user_id', target_user_id)\
            .execute()

        # Paso B: Si hay nuevos proyectos, insertarlos
        if nuevos_proyectos_ids:
            # Preparamos los datos para insertar en lote
            rows_to_insert = [
                {'user_id': target_user_id, 'proyecto_id': pid} 
                for pid in nuevos_proyectos_ids
            ]
            supabase_proyectos.table('prod_acceso_proyectos').insert(rows_to_insert).execute()

        return jsonify({'message': 'Permisos actualizados correctamente'}), 200

    except Exception as e:
        print(f"❌ Error guardando permisos: {e}")
        return jsonify({'error': 'Error al guardar permisos en base de datos'}), 500