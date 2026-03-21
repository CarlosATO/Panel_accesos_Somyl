import os
import mercadopago
from flask import Blueprint, request, jsonify, current_app, session
from functools import wraps

billing_bp = Blueprint('billing', __name__, url_prefix='/api/billing')

def get_mp_access_token():
    return os.getenv("MP_ACCESS_TOKEN")

def get_supabase():
    return current_app.config['SUPABASE_CLIENT']

def billing_admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_email' not in session:
            return jsonify({'error': 'No autorizado'}), 401
        
        user_data = session.get('user_data', {})
        if not user_data.get('is_billing_admin') and not user_data.get('is_superuser'):
            return jsonify({'error': 'Se requieren permisos de administrador de facturación'}), 403
        return f(*args, **kwargs)
    return decorated_function

def get_user_rut():
    """Obtiene el RUT de la empresa del usuario actual desde la sesión"""
    user_data = session.get('user_data', {})
    # Asumiendo que el RUT está en los datos del usuario o se deriva del email/empresa
    # Por ahora retornamos un RUT fijo para Somyl
    return user_data.get('empresa_rut', '96.511.940-0')

@billing_bp.route('/config', methods=['GET'])
def get_config():
    """Retorna la llave pública de Stripe y si el sistema SaaS está habilitado"""
    return jsonify({
        'publishableKey': os.getenv('STRIPE_PUBLIC_KEY'),
        'enabled': os.getenv('SaaS_ENABLED', 'false').lower() == 'true'
    })

@billing_bp.route('/status', methods=['GET'])
def get_subscription_status():
    """Obtiene el estado actual de la suscripción de la empresa"""
    if 'user_email' not in session:
        return jsonify({'error': 'No autorizado'}), 401

    # Para MercadoPago, consultamos la tabla empresa_suscripciones
    sb = get_supabase()
    user_rut = get_user_rut()
    
    try:
        # Consultar suscripción por RUT de empresa
        resp = sb.table('empresa_suscripciones').select('*').eq('rut_empresa', user_rut).execute()
        
        if resp.data:
            suscripcion = resp.data[0]
            estado = suscripcion.get('estado', 'PENDIENTE')
            return jsonify({
                'status': 'ACTIVO' if estado == 'ACTIVA' else 'PENDIENTE',
                'fecha_vencimiento': suscripcion.get('fecha_vencimiento'),
                'rut_empresa': suscripcion.get('rut_empresa')
            })
        else:
            # No existe suscripción, crear una pendiente
            sb.table('empresa_suscripciones').insert({
                'rut_empresa': user_rut,
                'estado': 'PENDIENTE'
            }).execute()
            
            return jsonify({
                'status': 'PENDIENTE',
                'fecha_vencimiento': None,
                'rut_empresa': user_rut
            })
            
    except Exception as e:
        print(f"Error consultando suscripción: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@billing_bp.route('/create-preference', methods=['POST'])
def create_mp_preference():
    """Crea una preferencia de pago en MercadoPago por $813.960 CLP"""
    if 'user_email' not in session:
        return jsonify({'error': 'No autorizado'}), 401
    
    mp_token = get_mp_access_token()
    if not mp_token:
        return jsonify({'error': 'Token de MercadoPago no configurado'}), 500
    
    try:
        # Inicializar SDK de MercadoPago
        sdk = mercadopago.SDK(mp_token)
        
        user_rut = get_user_rut()
        user_email = session.get('user_email', '')
        
        # Crear preferencia de pago
        preference_data = {
            "items": [
                {
                    "title": "Licenciamiento Plataforma Datix",
                    "quantity": 1,
                    "unit_price": 813960,
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
                'preference_id': preference['id']
            })
        else:
            return jsonify({'error': 'Error creando preferencia de pago'}), 500
            
    except Exception as e:
        print(f"Error creando preferencia MP: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@billing_bp.route('/create-checkout-session', methods=['POST'])
@billing_admin_required
def create_checkout_session():
    """Crea una sesión de Checkout de Stripe para iniciar la suscripción"""
    stripe.api_key = get_stripe_key()
    data = request.get_json()
    price_id = data.get('priceId') # ID del precio en Stripe (ej: price_H5ggY...)

    if not price_id:
        return jsonify({'error': 'Price ID es requerido'}), 400

    try:
        # En una app multi-tenant aquí usaríamos el ID de la organización
        # Para Datix/Somyl, usamos un identificador fijo por ahora
        checkout_session = stripe.checkout.Session.create(
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=request.host_url + 'billing/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=request.host_url + 'billing/cancel',
        )
        return jsonify({'url': checkout_session.url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@billing_bp.route('/create-portal-session', methods=['POST'])
@billing_admin_required
def create_portal_session():
    """Crea una sesión del Portal de Clientes de Stripe para que el usuario gestione su facturación"""
    stripe.api_key = get_stripe_key()
    
    # Obtener el customer_id desde la DB para esta empresa
    sb = get_supabase()
    resp = sb.table('sso_subscriptions').select('stripe_customer_id').limit(1).execute()
    
    if not resp.data or not resp.data[0].get('stripe_customer_id'):
        return jsonify({'error': 'No se encontró un cliente de Stripe activo para esta cuenta'}), 400
    
    customer_id = resp.data[0]['stripe_customer_id']

    try:
        # El portal permite descargar facturas, cambiar planes y actualizar tarjetas
        portal_session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=request.host_url + 'dashboard',
        )
        return jsonify({'url': portal_session.url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@billing_bp.route('/webhook', methods=['POST'])
def webhook():
    """Manejador de eventos de Stripe (Webhooks)"""
    stripe.api_key = get_stripe_key()
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    # Manejar eventos específicos
    sb = get_supabase()
    
    if event['type'] == 'checkout.session.completed':
        session_obj = event['data']['object']
        # Actualizar suscripción en DB
        customer_id = session_obj.get('customer')
        subscription_id = session_obj.get('subscription')
        
        # En el futuro, buscar el tenant/empresa basado en metadata enviada en el checkout
        # Por ahora actualizamos el registro global
        sb.table('sso_subscriptions').upsert({
            'stripe_customer_id': customer_id,
            'stripe_subscription_id': subscription_id,
            'status': 'active',
            'plan_id': 'professional', # O derivarlo del price_id
            'updated_at': 'now()'
        }).execute()

    elif event['type'] == 'customer.subscription.deleted':
        subscription_obj = event['data']['object']
        sb.table('sso_subscriptions').update({
            'status': 'canceled',
            'updated_at': 'now()'
        }).eq('stripe_subscription_id', subscription_obj.get('id')).execute()

    return jsonify({'status': 'success'})

@billing_bp.route('/mp-webhook', methods=['POST'])
def mp_webhook():
    """Webhook para notificaciones de MercadoPago"""
    try:
        data = request.get_json()
        
        # MercadoPago envía el tipo de notificación
        if data.get('type') == 'payment':
            payment_id = data.get('data', {}).get('id')
            
            if payment_id:
                # Consultar el pago en MercadoPago
                mp_token = get_mp_access_token()
                if mp_token:
                    sdk = mercadopago.SDK(mp_token)
                    payment = sdk.payment().get(payment_id)
                    
                    if payment["status"] == 200:
                        payment_data = payment["response"]
                        external_reference = payment_data.get('external_reference')  # RUT empresa
                        status = payment_data.get('status')
                        
                        if external_reference and status == 'approved':
                            # Activar suscripción
                            sb = get_supabase()
                            from datetime import datetime, timedelta
                            
                            fecha_vencimiento = datetime.now() + timedelta(days=365)  # 1 año
                            
                            sb.table('empresa_suscripciones').update({
                                'estado': 'ACTIVA',
                                'fecha_vencimiento': fecha_vencimiento.isoformat()
                            }).eq('rut_empresa', external_reference).execute()
        
        return jsonify({'status': 'ok'})
        
    except Exception as e:
        print(f"Error en webhook MP: {e}")
        return jsonify({'error': 'Error procesando webhook'}), 500
