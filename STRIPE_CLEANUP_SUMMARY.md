# 🧹 LIMPIEZA DE STRIPE - SOLO MERCADOPAGO

## ✅ Cambios Realizados

### 1. Archivos Eliminados
- ❌ `migrations/saas_schema.sql` - Migración de Stripe eliminada

### 2. Archivos Modificados

#### `app.py`
- ✅ Cambiado `from routes.billing import stripe_bp` → `billing_bp`
- ✅ Cambiado `app.register_blueprint(stripe_bp)` → `billing_bp`

#### `routes/billing.py` - **COMPLETAMENTE REESCRITO**
- ❌ Eliminado import `stripe`
- ❌ Eliminado `get_stripe_key()`
- ❌ Eliminados endpoints Stripe:
  - `/create-checkout-session` (Stripe)
  - `/create-portal-session` (Stripe)
  - `/webhook` (Stripe)
- ✅ Mantenidos endpoints MercadoPago:
  - `/config` - Configuración
  - `/status` - Estado de suscripción
  - `/create-preference` - Crear pago MP
  - `/mp-webhook` - Webhook MP

#### `routes/auth.py`
- ❌ Eliminada verificación de `sso_subscriptions` en `/session`

#### `scripts/update_check_schema.py`
- ✅ Actualizado para usar `empresa_suscripciones` en lugar de `sso_subscriptions`

### 3. Migración SQL Creada

**Archivo:** `migrations/clean_stripe.sql`

Ejecutar este archivo en Supabase para:
- ❌ Eliminar columna `is_billing_admin` de `usuarios_sso`
- ❌ Eliminar tabla `sso_subscriptions`
- ✅ Verificar/crear tabla `empresa_suscripciones`

---

## 🗄️ Estructura Final de Base de Datos

### Tabla: `empresa_suscripciones` (MercadoPago)
```sql
CREATE TABLE public.empresa_suscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rut_empresa VARCHAR(32) UNIQUE NOT NULL,
    estado VARCHAR(32) NOT NULL DEFAULT 'ACTIVA',
    fecha_vencimiento TIMESTAMPTZ,
    mp_preference_id VARCHAR(255)
);
```

**Campos:**
- `rut_empresa` - Identificador único de la empresa
- `estado` - ACTIVA | PENDIENTE | VENCIDA
- `fecha_vencimiento` - Hasta cuándo está activa
- `mp_preference_id` - ID de preferencia de MercadoPago

---

## 🚀 Pasos para Aplicar

### 1. Ejecutar migración en Supabase
```sql
-- Copiar y ejecutar: migrations/clean_stripe.sql
```

### 2. Reiniciar backend
```bash
cd portal_sso
python app.py
```

### 3. Verificar funcionamiento
- ✅ Login debería funcionar
- ✅ `/api/billing/status` debería funcionar
- ✅ No más errores de Stripe

---

## 📋 Endpoints de Facturación Activos

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/billing/config` | GET | Configuración pública |
| `/api/billing/status` | GET | Estado de suscripción |
| `/api/billing/create-preference` | POST | Crear pago MP |
| `/api/billing/mp-webhook` | POST | Webhook MP |

---

## ⚠️ Importante

**Antes de continuar:**
1. ✅ Ejecutar `migrations/clean_stripe.sql` en Supabase
2. ✅ Verificar que existe tabla `empresa_suscripciones`
3. ✅ Reiniciar backend de portal

**Sistema limpio:** Solo MercadoPago, sin Stripe.
