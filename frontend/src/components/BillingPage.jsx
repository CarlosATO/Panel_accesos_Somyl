import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CreditCard, CheckCircle, AlertTriangle, Clock,
  Receipt, Download, ArrowLeft, Shield, CalendarDays,
  TrendingUp, FileText
} from 'lucide-react'
import { LogOut } from 'lucide-react'

// ── DATIX Design System (mismo que Dashboard y Admin) ────────────────────────
const COLORS = {
  bg:       '#3d1a6e',
  navBg:    '#2d1259',
  border:   'rgba(255,255,255,0.12)',
  borderOff:'rgba(255,255,255,0.05)',
  text:     '#ffffff',
  textDim:  'rgba(255,255,255,0.45)',
  accent:   '#a78bfa',
  cardBg:   'rgba(255,255,255,0.05)',
}

function BillingPage({ user }) {
  const [subscription, setSubscription]   = useState(null)
  const [loading, setLoading]             = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [error, setError]                 = useState('')
  const navigate = useNavigate()

  // Facturas mock — en implementación real vendrán de la API
  const mockInvoices = [
    { id: 'INV-2024-001', date: '2024-01-15', amount: 813960, status: 'paid', period: 'Enero 2024 – Enero 2025' },
    { id: 'INV-2023-001', date: '2023-01-15', amount: 750000, status: 'paid', period: 'Enero 2023 – Enero 2024' },
  ]

  useEffect(() => { fetchBillingStatus() }, [])

  const fetchBillingStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/billing/status', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      } else {
        setError('No se pudo cargar el estado de facturación')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePayment = async () => {
    setPaymentLoading(true)
    setError('')
    try {
      const response = await fetch('/api/billing/create-preference', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      if (response.ok && data.init_point) {
        window.location.href = data.init_point
      } else {
        setError(data.error || 'Error al procesar el pago')
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo nuevamente.')
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' })
      navigate('/login')
    } catch (err) { console.error('Logout error:', err) }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
  const formatCLP  = (n) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n)

  if (loading) {
    return (
      <div style={{ background: COLORS.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <div className="spinner-border" role="status" style={{ width: '2.5rem', height: '2.5rem', color: COLORS.accent, borderWidth: '3px' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3" style={{ color: COLORS.textDim, fontSize: '13px' }}>Cargando facturación...</p>
        </div>
      </div>
    )
  }

  const isActive = subscription?.status === 'ACTIVO' || subscription?.status === 'active'

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        background: COLORS.navBg,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        height: '56px',
        flexShrink: 0,
        borderBottom: `1px solid ${COLORS.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '8px'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '20px' }}>
          <div style={{ background: '#1a0a40', borderRadius: '10px', padding: '5px 10px', border: `1px solid ${COLORS.border}` }}>
            <img src="https://datix.cl/imagen/logo_letras_blancas_fix.png" alt="DATIX" style={{ height: '22px', width: 'auto' }} />
          </div>
        </div>

        {/* Back */}
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: `1px solid ${COLORS.border}`,
            color: COLORS.textDim,
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.color = COLORS.text; e.currentTarget.style.background = 'rgba(255,255,255,0.14)' }}
          onMouseLeave={e => { e.currentTarget.style.color = COLORS.textDim; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
        >
          <ArrowLeft size={14} strokeWidth={2} />
          Volver al Portal
        </button>

        {/* Section title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
          <div style={{ width: '1px', height: '24px', background: COLORS.border }} />
          <CreditCard size={16} strokeWidth={1.5} style={{ color: COLORS.accent }} />
          <span style={{ color: COLORS.text, fontSize: '14px', fontWeight: '500' }}>Facturación y Suscripción</span>
        </div>

        {/* Right */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="d-none d-md-block" style={{ textAlign: 'right' }}>
            <div style={{ color: COLORS.text, fontSize: '13px', fontWeight: '500' }}>{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
              cursor: 'pointer',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={14} strokeWidth={2} />
            <span className="d-none d-sm-inline">Salir</span>
          </button>
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, padding: '32px 24px', maxWidth: '1100px', width: '100%', margin: '0 auto' }}>

        {/* Page Title */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: COLORS.text, fontWeight: '700', fontSize: '2rem', margin: 0 }}>Centro de Facturación</h1>
          <p style={{ color: COLORS.textDim, margin: '6px 0 0', fontSize: '14px' }}>
            Gestiona tu suscripción y revisa el historial de pagos
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {/* Top row: 2 cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '20px', marginBottom: '20px' }}>

          {/* Estado de Suscripción */}
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ color: COLORS.text, margin: 0, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} style={{ color: COLORS.accent }} />
                Estado de Suscripción
              </h3>
              {subscription && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                  background: isActive ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)',
                  color:      isActive ? '#34d399'               : '#fbbf24',
                  border:     `1px solid ${isActive ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`
                }}>
                  {isActive ? <CheckCircle size={14} /> : <Clock size={14} />}
                  {isActive ? 'Suscripción Activa' : 'Pago Pendiente'}
                </span>
              )}
            </div>

            {subscription && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {/* Vencimiento */}
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <CalendarDays size={14} style={{ color: COLORS.accent }} />
                    <span style={{ color: COLORS.textDim, fontSize: '12px', fontWeight: '600' }}>Próximo Vencimiento</span>
                  </div>
                  <div style={{ color: COLORS.text, fontWeight: '600', fontSize: '15px' }}>
                    {subscription.fecha_vencimiento ? formatDate(subscription.fecha_vencimiento) : 'No definido'}
                  </div>
                </div>
                {/* Plan */}
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <TrendingUp size={14} style={{ color: COLORS.accent }} />
                    <span style={{ color: COLORS.textDim, fontSize: '12px', fontWeight: '600' }}>Plan Actual</span>
                  </div>
                  <div style={{ color: COLORS.text, fontWeight: '600', fontSize: '15px' }}>Licencia Anual Datix</div>
                </div>
              </div>
            )}

            {/* Botón de pago */}
            <div style={{ borderTop: `1px solid ${COLORS.borderOff}`, paddingTop: '20px' }}>
              <button
                onClick={handleCreatePayment}
                disabled={paymentLoading}
                style={{
                  background: `linear-gradient(135deg, ${COLORS.accent}, #7c3aed)`,
                  border: 'none',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '12px 24px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: paymentLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  opacity: paymentLoading ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {paymentLoading ? (
                  <><div className="spinner-border spinner-border-sm" style={{ width: '1rem', height: '1rem' }} />Procesando...</>
                ) : (
                  <><CreditCard size={16} />{isActive ? 'Renovar Suscripción' : 'Activar Suscripción'}</>
                )}
              </button>
              <p style={{ color: COLORS.textDim, fontSize: '12px', marginTop: '8px' }}>
                Serás redirigido a Mercado Pago para completar el pago
              </p>
            </div>
          </div>

          {/* Información de Pago */}
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ color: COLORS.text, margin: '0 0 20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={20} style={{ color: COLORS.accent }} />
              Información de Pago
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: COLORS.textDim, fontSize: '14px' }}>Precio Anual</span>
                <span style={{ color: COLORS.text, fontWeight: '700', fontSize: '18px' }}>{formatCLP(813960)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: COLORS.textDim, fontSize: '14px' }}>Método de Pago</span>
                <span style={{ color: COLORS.accent, fontSize: '14px', fontWeight: '500' }}>Mercado Pago</span>
              </div>
            </div>

            <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={18} style={{ color: '#34d399', flexShrink: 0 }} />
              <div>
                <div style={{ color: '#34d399', fontWeight: '600', fontSize: '13px' }}>Pago Seguro</div>
                <div style={{ color: '#6ee7b7', fontSize: '12px' }}>Protegido por Mercado Pago</div>
              </div>
            </div>
          </div>
        </div>

        {/* Historial de Facturas */}
        <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${COLORS.borderOff}` }}>
            <h3 style={{ color: COLORS.text, margin: 0, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} style={{ color: COLORS.accent }} />
              Historial de Facturas
            </h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.borderOff}` }}>
                {['Factura', 'Fecha', 'Período', 'Monto', 'Estado', 'Acción'].map((h, i) => (
                  <th key={h} style={{
                    padding: '12px 20px', color: COLORS.textDim, fontSize: '11px',
                    fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px',
                    textAlign: i === 3 ? 'right' : 'left',
                    background: 'rgba(255,255,255,0.02)'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockInvoices.map((inv, idx) => (
                <tr key={inv.id} style={{ borderBottom: idx < mockInvoices.length - 1 ? `1px solid ${COLORS.borderOff}` : 'none' }}>
                  <td style={{ padding: '14px 20px', color: COLORS.accent, fontWeight: '500', fontSize: '14px' }}>{inv.id}</td>
                  <td style={{ padding: '14px 20px', color: COLORS.textDim, fontSize: '14px' }}>{formatDate(inv.date)}</td>
                  <td style={{ padding: '14px 20px', color: COLORS.textDim, fontSize: '14px' }}>{inv.period}</td>
                  <td style={{ padding: '14px 20px', color: COLORS.text, fontWeight: '600', fontSize: '14px', textAlign: 'right' }}>{formatCLP(inv.amount)}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '6px', padding: '2px 10px', fontSize: '12px', fontWeight: '600' }}>
                      Pagada
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${COLORS.border}`, color: COLORS.textDim, borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Download size={14} />Descargar
                    </button>
                  </td>
                </tr>
              ))}
              {mockInvoices.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: COLORS.textDim }}>No hay facturas disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .billing-grid { grid-template-columns: 1fr !important; }
        }
        .d-none { display: none; }
        .d-md-block { display: none; }
        @media (min-width: 768px) { .d-md-block { display: block; } }
        .d-sm-inline { display: none; }
        @media (min-width: 576px) { .d-sm-inline { display: inline; } }
      `}</style>
    </div>
  )
}

export default BillingPage