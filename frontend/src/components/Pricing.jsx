import { useState } from 'react'
import { Check, CreditCard, Shield, AlertTriangle, Lock } from 'lucide-react'

const Pricing = ({ user, onClose }) => {
  const [loading, setLoading] = useState(false)
  
  // Solo usuarios con is_billing_admin o is_superuser pueden ver precios y pagar
  const canManageBilling = user?.is_billing_admin || user?.is_superuser

  const handleSubscribe = async () => {
    if (!canManageBilling) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/billing/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
      const data = await response.json()
      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        alert(data.error || 'Error al iniciar el pago')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error de conexión')
    }
    setLoading(false)
  }

  // Modal para usuarios SIN permiso de facturación
  if (!canManageBilling) {
    return (
      <div className="position-fixed inset-0 w-100 h-100 d-flex align-items-center justify-content-center" 
           style={{ zIndex: 1050, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
           onClick={(e) => e.target === e.currentTarget && onClose()}>
        
        <div className="p-4 rounded-4 border position-relative text-center" 
             style={{ background: '#18181b', borderColor: 'rgba(239, 68, 68, 0.3)', maxWidth: '360px', width: '90%' }}>
          
          <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle mb-3" 
               style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <Lock size={28} style={{ color: '#f87171' }} />
          </div>
          
          <h5 className="fw-bold text-white mb-2">Acceso Restringido</h5>
          <p className="mb-4" style={{ color: '#a1a1aa', fontSize: '14px' }}>
            Tu cuenta no tiene permisos para gestionar la suscripción. Contacta al administrador de facturación de tu empresa.
          </p>
          
          <button 
            className="btn w-100"
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.1)', color: '#d4d4d8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '14px' }}
          >
            Entendido
          </button>
        </div>
      </div>
    )
  }

  // Modal para usuarios CON permiso de facturación
  return (
    <div className="position-fixed inset-0 w-100 h-100 d-flex align-items-center justify-content-center" 
         style={{ zIndex: 1050, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      
      <div className="p-4 rounded-4 border position-relative" 
           style={{ background: '#18181b', borderColor: 'rgba(239, 68, 68, 0.3)', maxWidth: '380px', width: '90%' }}>
        
        {/* Header con alerta */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center p-2 rounded-circle mb-3" 
               style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <AlertTriangle size={24} style={{ color: '#f87171' }} />
          </div>
          <h5 className="fw-bold text-white mb-1">Suscripción Requerida</h5>
          <p className="mb-0" style={{ color: '#71717a', fontSize: '13px' }}>
            Activa tu plan para acceder a los módulos
          </p>
        </div>

        {/* Features compactas */}
        <div className="mb-4" style={{ fontSize: '13px' }}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <Check size={14} style={{ color: '#22c55e' }} />
            <span style={{ color: '#a1a1aa' }}>Acceso ilimitado a todos los módulos</span>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <Check size={14} style={{ color: '#22c55e' }} />
            <span style={{ color: '#a1a1aa' }}>Soporte técnico 24/7</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Check size={14} style={{ color: '#22c55e' }} />
            <span style={{ color: '#a1a1aa' }}>Actualizaciones continuas</span>
          </div>
        </div>

        {/* Precio */}
        <div className="p-3 rounded-3 mb-4" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="d-block text-white fw-bold fs-5">16 UF</span>
              <span style={{ color: '#52525b', fontSize: '11px' }}>neto / mes + IVA</span>
            </div>
            <div className="text-end">
              <Shield size={16} style={{ color: '#22c55e' }} />
              <span className="d-block" style={{ color: '#22c55e', fontSize: '9px' }}>Pago Seguro</span>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="d-grid gap-2">
          <button 
            className="btn py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
            onClick={handleSubscribe}
            style={{ background: '#0ea5e9', color: 'white', borderRadius: '10px', border: 'none', fontSize: '14px' }}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              <><CreditCard size={16} /> Activar Suscripción</>
            )}
          </button>
          
          <button 
            className="btn border-0" 
            onClick={onClose}
            style={{ fontSize: '12px', color: '#71717a' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default Pricing
