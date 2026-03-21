import os
import mercadopago
import requests
from flask import Blueprint, request, jsonify, current_app, session
from functools import wraps
from datetime import datetime, timedelta

billing_bp = Blueprint('billing', __name__, url_prefix='/api/billing')

# Precio fijo en UF (neto, sin IVA)
PRECIO_UF_NETO = 16.00
IVA_RATE = 0.19

def get_mp_access_token():
    return os.getenv("MP_ACCESS_TOKEN")

def get_supabase():
    return current_app.config['SUPABASE_CLIENT']

def get_valor_uf():
    """Obtiene el valor UF del día desde mindicador.cl"""
    try:
        response = requests.get('https://mindicador.cl/api/uf', timeout=5)
        if response.status_code == 200:
            data = response.json()
            # Obtener el valor más reciente
            if data.get('serie') and len(data['serie']) > 0:
                return float(data['serie'][0]['valor'])
    except Exception as e:
        print(f"Error obteniendo UF: {e}")
    
    # Valor de respaldo si falla la API (actualizar periódicamente)
    return 38500.00  # Valor aproximado marzo 2026

def calcular_precio_clp():
    """Calcula el precio en CLP basado en 16 UF + IVA"""
    valor_uf = get_valor_uf()
    neto = PRECIO_UF_NETO * valor_uf
    iva = neto * IVA_RATE
    total = round(neto + iva)
    return {
        'valor_uf': valor_uf,
        'precio_uf': PRECIO_UF_NETO,
        'neto_clp': round(neto),
        'iva_clp': round(iva),
        'total_clp': total
    }

@billing_bp.route('/config', methods=['GET'])
def get_config():
    """Retorna configuración pública de facturación con precio en UF"""
    precio = calcular_precio_clp()
    return jsonify({
        'provider': 'mercadopago',
        'currency': 'CLP',
        'precio_uf': PRECIO_UF_NETO,
        'valor_uf_hoy': precio['valor_uf'],
        'neto_clp': precio['neto_clp'],
        'iva_clp': precio['iva_clp'],
        'total_clp': precio['total_clp']
    })

@billing_bp.route('/status', methods=['GET'])
def get_billing_status():
    """Obtiene el estado de suscripción de la empresa (opcional, no bloquea acceso)"""
    if 'user_email' not in session:
        return jsonify({'error': 'No autorizado'}), 401
    
    try:
        user_data = session.get('user_data', {})
        user_rut = user_data.get('rut_empresa') or user_data.get('empresa_rut') or '96.511.940-0'
        
        # Si no hay RUT, retornar estado por defecto sin error
        if not user_rut:
            return jsonify({
                'has_subscription': True,  # Por defecto permitir acceso
                'status': 'DEMO',
                'message': 'Acceso sin suscripción configurada'
            })
        
        # Para MercadoPago, consultamos la tabla empresa_suscripciones
        sb = get_supabase()
        resp = sb.table('empresa_suscripciones').select('*').eq('rut_empresa', user_rut).execute()
        
        if not resp.data:
            # No tiene suscripción registrada, permitir acceso de todos modos
            return jsonify({
                'has_subscription': True,  # Permitir acceso
                'status': 'DEMO',
                'message': 'No hay suscripción activa'
            })
        
        suscripcion = resp.data[0]
        estado = suscripcion.get('estado', 'PENDIENTE')
        has_subscription = (estado == 'ACTIVA')
        
        if not has_subscription:
            return jsonify({
                'has_subscription': False,
                'status': estado,
                'locked': True,
                'message': f'Suscripción {estado}'
            }), 403
            
        return jsonify({
            'has_subscription': True,
            'status': estado,
            'expiry_date': suscripcion.get('fecha_vencimiento'),
            'mp_preference_id': suscripcion.get('mp_preference_id')
        })
        
    except Exception as e:
        print(f"Error consultando suscripción: {e}")
        # En caso de error, permitir acceso de todos modos
        return jsonify({
            'has_subscription': True,
            'status': 'ERROR',
            'message': 'Error consultando estado, acceso permitido'
        })

# ============================================================
# MERCADOPAGO ENDPOINTS
# ============================================================

@billing_bp.route('/create-preference', methods=['POST'])
def create_mp_preference():
    """Crea una preferencia de pago en MercadoPago (16 UF + IVA)"""
    if 'user_email' not in session:
        return jsonify({'error': 'No autorizado'}), 401
    
    mp_token = get_mp_access_token()
    if not mp_token:
        return jsonify({'error': 'Token de MercadoPago no configurado'}), 500
    
    try:
        # Calcular precio en CLP
        precio = calcular_precio_clp()
        total_clp = precio['total_clp']
        
        # Inicializar SDK de MercadoPago
        sdk = mercadopago.SDK(mp_token)
        
        user_data = session.get('user_data', {})
        user_rut = user_data.get('rut_empresa', 'NO_RUT')
        user_email = session.get('user_email', '')
        
        # Descripción con detalle de UF
        descripcion = f"Licenciamiento Plataforma Datix - {PRECIO_UF_NETO} UF + IVA (UF ${precio['valor_uf']:,.0f})"
        
        # Crear preferencia de pago
        preference_data = {
            "items": [
                {
                    "title": descripcion,
                    "quantity": 1,
                    "unit_price": total_clp,
                    "currency_id": "CLP"
                }
            ],
            "payer": {
                "email": user_email
            },
            "back_urls": {
                "success": request.host_url + "billing/success",
                "failure": request.host_url + "billing/failure", 
                "pending": request.host_url + "billing/pending"
            },
            "auto_return": "approved",
            "external_reference": user_rut,
            "notification_url": request.host_url + "api/billing/mp-webhook"
        }
        
        preference_response = sdk.preference().create(preference_data)
        preference = preference_response["response"]
        
        if preference_response["status"] == 201:
            # Guardar preference_id en la base de datos
            sb = get_supabase()
            sb.table('empresa_suscripciones').upsert({
                'rut_empresa': user_rut,
                'mp_preference_id': preference['id'],
                'estado': 'PENDIENTE'
            }).execute()
            
            return jsonify({
                'init_point': preference['init_point'],
                'sandbox_init_point': preference['sandbox_init_point'],
                'preference_id': preference['id'],
                'precio': precio  # Incluir desglose de precio
            })
        else:
            return jsonify({'error': 'Error creando preferencia de pago'}), 500
            
    except Exception as e:
        print(f"Error creando preferencia MP: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@billing_bp.route('/mp-webhook', methods=['POST'])
def mp_webhook():
    """Webhook de MercadoPago para procesar notificaciones de pago"""
    try:
        data = request.get_json()
        
        # MercadoPago envía diferentes tipos de notificaciones
        notification_type = data.get('type')
        
        if notification_type == 'payment':
            payment_id = data.get('data', {}).get('id')
            
            if not payment_id:
                return jsonify({'status': 'error', 'message': 'ID de pago no encontrado'}), 400
            
            # Consultar el pago en MercadoPago
            mp_token = get_mp_access_token()
            sdk = mercadopago.SDK(mp_token)
            payment_info = sdk.payment().get(payment_id)
            
            if payment_info["status"] != 200:
                return jsonify({'status': 'error', 'message': 'Error consultando pago'}), 500
            
            payment = payment_info["response"]
            status = payment.get('status')
            external_reference = payment.get('external_reference')  # RUT de la empresa
            
            # Actualizar estado de suscripción según el pago
            if status == 'approved' and external_reference:
                sb = get_supabase()
                
                # Calcular fecha de vencimiento (30 días desde ahora)
                fecha_vencimiento = datetime.now() + timedelta(days=30)
                
                sb.table('empresa_suscripciones').update({
                    'estado': 'ACTIVA',
                    'fecha_vencimiento': fecha_vencimiento.isoformat(),
                    'updated_at': datetime.now().isoformat()
                }).eq('rut_empresa', external_reference).execute()
                
                return jsonify({'status': 'success', 'message': 'Suscripción activada'})
            
        return jsonify({'status': 'received'})
        
    except Exception as e:
        print(f"Error en webhook MP: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ============================================================
# NUEVOS ENDPOINTS: FACTURACIÓN Y GESTIÓN DE SUSCRIPCIÓN
# ============================================================

def require_superuser(f):
    """Decorador: verifica que el usuario sea superusuario"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_email' not in session:
            return jsonify({'error': 'No autorizado'}), 401
        
        try:
            user_data = session.get('user_data', {})
            is_superuser = user_data.get('is_superuser', False)
            
            if not is_superuser:
                return jsonify({'error': 'Solo superusuarios pueden acceder'}), 403
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return decorated_function

def require_billing_admin(f):
    """Decorador: verifica que el usuario sea billing admin"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_email' not in session:
            return jsonify({'error': 'No autorizado'}), 401
        
        try:
            user_data = session.get('user_data', {})
            is_billing_admin = user_data.get('is_billing_admin', False)
            is_superuser = user_data.get('is_superuser', False)
            
            # Superusuarios también pueden hacer acciones de billing admin
            if not (is_billing_admin or is_superuser):
                return jsonify({'error': 'No tienes permisos para facturación'}), 403
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return decorated_function

@billing_bp.route('/company/<rut>', methods=['GET'])
@require_billing_admin
def get_company_billing_info(rut):
    """
    GET /api/billing/company/:rut
    Obtiene información de facturación de la empresa
    Requiere: is_billing_admin o is_superuser
    """
    try:
        sb = get_supabase()
        user_id = session.get('user_data', {}).get('id')
        
        # Obtener info de la suscripción
        resp = sb.table('empresa_suscripciones').select('*').eq('rut_empresa', rut).execute()
        
        if not resp.data:
            return jsonify({'error': 'Empresa no encontrada'}), 404
        
        empresa = resp.data[0]
        
        # Obtener solicitudes pendientes
        solicitudes_resp = sb.table('facturacion_solicitudes')\
            .select('*')\
            .eq('empresa_id', empresa['id'])\
            .eq('estado', 'PENDIENTE')\
            .execute()
        
        solicitudes_pendientes = len(solicitudes_resp.data) if solicitudes_resp.data else 0
        
        return jsonify({
            'empresa_id': empresa['id'],
            'rut_empresa': empresa['rut_empresa'],
            'nombre_empresa': empresa.get('nombre_empresa'),
            'estado': empresa['estado'],
            'forma_pago_actual': empresa.get('forma_pago_actual'),
            'monto_referencia_uf': empresa.get('monto_referencia_uf'),
            'fecha_vencimiento': empresa.get('fecha_vencimiento'),
            'fecha_inicio': empresa.get('fecha_inicio'),
            'plan': empresa.get('plan'),
            'precio_uf': empresa.get('precio_uf'),
            'solicitudes_pendientes': solicitudes_pendientes
        })
        
    except Exception as e:
        print(f"Error obteniendo info de empresa: {e}")
        return jsonify({'error': str(e)}), 500

@billing_bp.route('/change-status', methods=['POST'])
@require_superuser
def change_subscription_status():
    """
    POST /api/billing/change-status
    Cambia el estado de la suscripción (ACTIVA -> VENCIDA, etc)
    Requiere: is_superuser
    Registra en auditoria y crea alertas
    
    Body:
    {
        "empresa_id": "uuid",
        "nuevo_estado": "ACTIVA|VENCIDA|SUSPENDIDA",
        "motivo": "opcional"
    }
    """
    try:
        data = request.get_json()
        empresa_id = data.get('empresa_id')
        nuevo_estado = data.get('nuevo_estado', '').upper()
        motivo = data.get('motivo', '')
        
        if not empresa_id or not nuevo_estado:
            return jsonify({'error': 'empresa_id y nuevo_estado son requeridos'}), 400
        
        if nuevo_estado not in ['ACTIVA', 'VENCIDA', 'SUSPENDIDA']:
            return jsonify({'error': 'nuevo_estado inválido'}), 400
        
        sb = get_supabase()
        user_id = session.get('user_data', {}).get('id')
        user_email = session.get('user_email')
        
        # Obtener estado actual
        empresa_resp = sb.table('empresa_suscripciones').select('*').eq('id', empresa_id).execute()
        
        if not empresa_resp.data:
            return jsonify({'error': 'Empresa no encontrada'}), 404
        
        empresa = empresa_resp.data[0]
        estado_anterior = empresa['estado']
        
        # Si el estado es igual, retornar sin hacer nada
        if estado_anterior == nuevo_estado:
            return jsonify({'message': 'El estado ya es el solicitado'}), 200
        
        # Actualizar estado en empresa_suscripciones
        sb.table('empresa_suscripciones').update({
            'estado': nuevo_estado,
            'updated_at': datetime.now().isoformat()
        }).eq('id', empresa_id).execute()
        
        # Crear registro en facturacion_auditoria
        auditoria_resp = sb.table('facturacion_auditoria').insert({
            'empresa_id': empresa_id,
            'usuario_id': user_id,
            'estado_anterior': estado_anterior,
            'estado_nuevo': nuevo_estado,
            'motivo': motivo,
            'fecha_cambio': datetime.now().isoformat()
        }).execute()
        
        auditoria_id = auditoria_resp.data[0]['id'] if auditoria_resp.data else None
        
        # Crear alerta para el superusuario
        mensaje = f"Estado de suscripción cambiado de {estado_anterior} a {nuevo_estado} por {user_email}"
        if motivo:
            mensaje += f". Motivo: {motivo}"
        
        sb.table('facturacion_alertas').insert({
            'empresa_id': empresa_id,
            'superusuario_id': user_id,
            'tipo_alerta': 'ESTADO_CAMBIO',
            'mensaje': mensaje,
            'referencia_id': auditoria_id,
            'referencia_tipo': 'AUDITORIA'
        }).execute()
        
        return jsonify({
            'success': True,
            'message': f'Estado cambiado de {estado_anterior} a {nuevo_estado}',
            'empresa_id': empresa_id,
            'nuevo_estado': nuevo_estado
        })
        
    except Exception as e:
        print(f"Error cambiando estado: {e}")
        return jsonify({'error': str(e)}), 500

@billing_bp.route('/solicitar-facturacion', methods=['POST'])
@require_billing_admin
def solicitar_facturacion():
    """
    POST /api/billing/solicitar-facturacion
    Crea una solicitud de facturación electrónica
    Requiere: is_billing_admin o is_superuser
    
    Body:
    {
        "empresa_id": "uuid",
        "tipo_solicitud": "FACTURA_ELECTRONICA|LIQUIDACION|TRANSFERENCIA",
        "monto_solicitado": 500000 (opcional)
    }
    """
    try:
        data = request.get_json()
        empresa_id = data.get('empresa_id')
        tipo_solicitud = data.get('tipo_solicitud', 'FACTURA_ELECTRONICA').upper()
        monto = data.get('monto_solicitado')
        
        if not empresa_id:
            return jsonify({'error': 'empresa_id es requerido'}), 400
        
        sb = get_supabase()
        user_id = session.get('user_data', {}).get('id')
        user_email = session.get('user_email')
        
        # Obtener RUT de empresa para el mensaje
        empresa_resp = sb.table('empresa_suscripciones').select('rut_empresa').eq('id', empresa_id).execute()
        if not empresa_resp.data:
            return jsonify({'error': 'Empresa no encontrada'}), 404
        
        rut_empresa = empresa_resp.data[0]['rut_empresa']
        
        # Obtener email del superusuario para notificaciones
        super_resp = sb.table('usuarios_sso').select('id').eq('is_superuser', True).execute()
        superusuario_id = super_resp.data[0]['id'] if super_resp.data else None
        
        # Crear solicitud
        solicitud_resp = sb.table('facturacion_solicitudes').insert({
            'empresa_id': empresa_id,
            'usuario_id': user_id,
            'tipo_solicitud': tipo_solicitud,
            'estado': 'PENDIENTE',
            'monto_solicitado': monto,
            'descripcion': f'Solicitud de {tipo_solicitud} por {user_email}'
        }).execute()
        
        solicitud_id = solicitud_resp.data[0]['id'] if solicitud_resp.data else None
        
        # Crear alerta para el superusuario
        if superusuario_id:
            mensaje_alerta = f"Nueva solicitud de facturación ({tipo_solicitud}) de {rut_empresa}. "
            mensaje_alerta += f"Contactar con: Carlos Alegria - Fono: 9 2081 7988"
            
            sb.table('facturacion_alertas').insert({
                'empresa_id': empresa_id,
                'superusuario_id': superusuario_id,
                'tipo_alerta': 'SOLICITUD_RECIBIDA',
                'mensaje': mensaje_alerta,
                'referencia_id': solicitud_id,
                'referencia_tipo': 'SOLICITUD'
            }).execute()
        
        return jsonify({
            'success': True,
            'message': 'Solicitud enviada a Carlos Alegria - Fono: 9 2081 7988. Nos contactaremos pronto.',
            'solicitud_id': solicitud_id,
            'tipo_solicitud': tipo_solicitud
        })
        
    except Exception as e:
        print(f"Error creando solicitud: {e}")
        return jsonify({'error': str(e)}), 500

@billing_bp.route('/alertas', methods=['GET'])
@require_superuser
def get_alertas():
    """
    GET /api/billing/alertas
    Obtiene alertas no leídas del superusuario
    Requiere: is_superuser
    """
    try:
        sb = get_supabase()
        user_id = session.get('user_data', {}).get('id')
        
        # Obtener solo alertas no leídas
        alertas_resp = sb.table('facturacion_alertas')\
            .select('*')\
            .eq('superusuario_id', user_id)\
            .eq('leida', False)\
            .order('fecha_alerta', desc=True)\
            .execute()
        
        alertas = alertas_resp.data if alertas_resp.data else []
        
        return jsonify({
            'total': len(alertas),
            'alertas': alertas
        })
        
    except Exception as e:
        print(f"Error obteniendo alertas: {e}")
        return jsonify({'error': str(e)}), 500

@billing_bp.route('/alertas/<alerta_id>/marcar-leida', methods=['PUT'])
@require_superuser
def marcar_alerta_leida(alerta_id):
    """
    PUT /api/billing/alertas/:id/marcar-leida
    Marca una alerta como leída
    Requiere: is_superuser
    """
    try:
        sb = get_supabase()
        user_id = session.get('user_data', {}).get('id')
        
        # Verificar que la alerta pertenece al superusuario
        alerta_resp = sb.table('facturacion_alertas').select('*').eq('id', alerta_id).execute()
        
        if not alerta_resp.data:
            return jsonify({'error': 'Alerta no encontrada'}), 404
        
        alerta = alerta_resp.data[0]
        
        if alerta['superusuario_id'] != user_id:
            return jsonify({'error': 'No tienes permiso para marcar esta alerta'}), 403
        
        # Marcar como leída
        sb.table('facturacion_alertas').update({
            'leida': True,
            'fecha_lectura': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }).eq('id', alerta_id).execute()
        
        return jsonify({'success': True, 'message': 'Alerta marcada como leída'})
        
    except Exception as e:
        print(f"Error marcando alerta: {e}")
        return jsonify({'error': str(e)}), 500

@billing_bp.route('/auditoria', methods=['GET'])
@require_superuser
def get_auditoria():
    """
    GET /api/billing/auditoria
    Obtiene historial de cambios de estado
    Requiere: is_superuser
    """
    try:
        sb = get_supabase()
        
        # Obtener auditoria ordenada por fecha descendente
        auditoria_resp = sb.table('facturacion_auditoria')\
            .select('*, usuarios_sso(email)')\
            .order('fecha_cambio', desc=True)\
            .execute()
        
        historial = auditoria_resp.data if auditoria_resp.data else []
        
        return jsonify({
            'total': len(historial),
            'historial': historial
        })
        
    except Exception as e:
        print(f"Error obteniendo auditoria: {e}")
        return jsonify({'error': str(e)}), 500

@billing_bp.route('/solicitudes', methods=['GET'])
@require_billing_admin
def get_solicitudes():
    """
    GET /api/billing/solicitudes
    Obtiene historial de solicitudes de facturación
    Requiere: is_billing_admin o is_superuser
    """
    try:
        sb = get_supabase()
        user_id = session.get('user_data', {}).get('id')
        
        # Si es billing admin, ver solo sus solicitudes
        # Si es superusuario, ver todas
        user_data = session.get('user_data', {})
        is_superuser = user_data.get('is_superuser', False)
        
        if is_superuser:
            # Ver todas las solicitudes
            solicitudes_resp = sb.table('facturacion_solicitudes')\
                .select('*')\
                .order('fecha_solicitud', desc=True)\
                .execute()
        else:
            # Ver solo las propias
            solicitudes_resp = sb.table('facturacion_solicitudes')\
                .select('*')\
                .eq('usuario_id', user_id)\
                .order('fecha_solicitud', desc=True)\
                .execute()
        
        solicitudes = solicitudes_resp.data if solicitudes_resp.data else []
        
        return jsonify({
            'total': len(solicitudes),
            'solicitudes': solicitudes
        })
        
    except Exception as e:
        print(f"Error obteniendo solicitudes: {e}")
        return jsonify({'error': str(e)}), 500
