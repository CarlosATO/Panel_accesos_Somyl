import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt, Truck, Package, Building2, Users, LogOut, Lock, CreditCard, Bell, HelpCircle } from 'lucide-react'
import Pricing from './Pricing'
import SubscriptionWall from './SubscriptionWall'
import AlertasBox from './Facturacion/AlertasBox'
import Navbar from "./Navbar"

// ── DATIX Design System ──────────────────────────────────────────────────────
const COLORS = {
  bg:        '#3d1a6e',      // Fondo principal
  navBg:     '#2d1259',      // Fondo navbar
  navActive: 'rgba(255,255,255,0.15)', // Tab activo
  cardOn:    'rgba(255,255,255,0.12)',
  cardDisabled: 'rgba(255,255,255,0.04)', // Tarjeta deshabilitada
  cardOff:   'rgba(255,255,255,0.04)', // Tarjeta sin acceso
  cardHover: 'rgba(255,255,255,0.20)', // Tarjeta hover
  border:    'rgba(255,255,255,0.12)',
  borderOff: 'rgba(255,255,255,0.05)',
  text:      '#ffffff',
  textDim:   'rgba(255,255,255,0.45)',
  accent:    '#a78bfa',      // Púrpura claro acento
  danger:    '#f87171',
}

function Dashboard({ user, setUser }) {
  const [links, setLinks]                       = useState({})
  const [subscription, setSubscription]         = useState(null)
  const [saasEnabled, setSaasEnabled]           = useState(false)
  const [showPricing, setShowPricing]           = useState(false)
  const [showSubscriptionWall, setShowSubscriptionWall] = useState(false)
  const [loading, setLoading]                   = useState(true)
  const navigate = useNavigate()

  // ── Módulos del Portal ────────────────────────────────────────────────────
  const apps = [
    { key: 'ordenes',    name: 'Adquisiciones',    Icon: Receipt,   category: 'finance'   },
    { key: 'flota',      name: 'Control Flota',    Icon: Truck,     category: 'logistics' },
    { key: 'logistica',  name: 'Logística',        Icon: Package,   category: 'logistics' },
    { key: 'produccion', name: 'Construcción',      Icon: Building2, category: 'logistics' },
    { key: 'rrhh',       name: 'Recursos Humanos', Icon: Users,     category: 'finance'   },
  ]

  // ── Cargar datos del Dashboard ────────────────────────────────────────────
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/dashboard', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setLinks(data.links)
          setSubscription(data.subscription)
          setSaasEnabled(data.saas_enabled)
          if (data.user) setUser(data.user)
        } else if (response.status === 403) {
          const errorData = await response.json().catch(() => ({}))
          if (errorData.locked) { setShowSubscriptionWall(true); return }
          setUser(null)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error)
      }
      setLoading(false)
    

    }
    fetchDashboard()

    // ── Listener para recargar datos cuando la pestaña gana foco (usuario vuelve)
    const handleFocus = () => fetchDashboard()
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [navigate, setUser])

  // ── Sincronización entre pestañas (Storage Event) ─────────────────────────
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/dashboard', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          if (data.subscription) {
            setSubscription(data.subscription)
          }
        }
      } catch (err) { console.error(err) }
    }

    const handleStorageChange = (e) => {
      if (e.key === 'subscriptionUpdated') {
        fetchStatus()
      }
    }
    
    // Escuchar evento 'storage' (cross-tab)
    window.addEventListener('storage', handleStorageChange)
    
    // Escuchar evento custom (mismo tab)
    const handleCustomEvent = () => fetchStatus()
    window.addEventListener('subscriptionStateChanged', handleCustomEvent)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('subscriptionStateChanged', handleCustomEvent)
    }
  }, [])

  // ── API helper con subscription check ────────────────────────────────────
  const handleApiCall = async (url, options = {}) => {
    try {
      const response = await fetch(url, { credentials: 'include', ...options })
      if (response.status === 403) {
        const data = await response.json().catch(() => ({}))
        if (data.locked) { setShowSubscriptionWall(true); return null }
      }
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' })
      setUser(null)
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  // ── Portal de Facturación (Stripe/MP) ─────────────────────────────────────
  const handleOpenBillingPortal = async () => {
    try {
      const resp = await handleApiCall('/api/billing/create-portal-session', { method: 'POST' })
      if (!resp) return
      const data = await resp.json()
      if (data.url) window.open(data.url, '_blank')
      else alert(data.error || 'No se pudo abrir el portal de facturación')
    } catch (error) {
      console.error('Error opening billing portal:', error)
    }
  }

  // ── Auto-logout por inactividad (10 min) ──────────────────────────────────
  useEffect(() => {
    const INACTIVITY_LIMIT = 10 * 60 * 1000
    let timeoutId
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => { console.log('Auto-logout'); handleLogout() }, INACTIVITY_LIMIT)
    }
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
    resetTimer()
    events.forEach(e => window.addEventListener(e, resetTimer))
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      events.forEach(e => window.removeEventListener(e, resetTimer))
    }
  }, [])

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: (subscription?.estado === 'VENCIDA' || subscription?.estado === 'SUSPENDIDA') ? '#8b2c2c' : COLORS.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <div className="spinner-border" role="status" style={{ width: '2.5rem', height: '2.5rem', color: COLORS.accent, borderWidth: '3px' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3" style={{ color: COLORS.textDim, fontSize: '13px' }}>Cargando Módulos...</p>
        </div>
      </div>
    )
  }

  const isSubscriptionExpired = subscription?.estado === 'VENCIDA' || subscription?.estado === 'SUSPENDIDA'
  const userName = user.full_name || user.email?.split('@')[0] || 'Usuario'
  const companyName = user.empresa_nombre || 'Empresa'

  return (
    <div style={{ background: (subscription?.estado === 'VENCIDA' || subscription?.estado === 'SUSPENDIDA') ? '#8b2c2c' : COLORS.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── NAVBAR ── */}
      <Navbar user={user} currentTab="inicio" onLogout={handleLogout} />

      {/* ── CONTENT AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>

        {/* Banner suscripción vencida */}
        {isSubscriptionExpired && (
          <div style={{
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '12px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px',
            maxWidth: '600px',
            width: '100%'
          }}>
            <CreditCard size={20} style={{ color: '#f87171', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: '#f87171', fontWeight: '600', fontSize: '14px' }}>
                {subscription?.estado === 'VENCIDA' ? 'Suscripción Vencida' : 'Suscripción Suspendida'}
              </div>
              <div style={{ color: '#fca5a5', fontSize: '12px' }}>
                {subscription?.estado === 'VENCIDA' ? 'Tu suscripción ha vencido. Contacta a Carlos Alegria' : 'Tu suscripción está suspendida'}
              </div>
            </div>
            <button
              onClick={() => navigate('/facturacion')}
              style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer' }}
            >
              Ver Facturación
            </button>
          </div>
        )}

        {/* Grid de módulos */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          justifyContent: 'center',
          maxWidth: '800px',
          width: '100%'
        }}>
          {apps.map(app => {
            const roleValue = user[`rol_${app.key}`]
            const hasAccess = roleValue === 'admin' || roleValue === 'true' || roleValue === true
            const isBlocked = saasEnabled && subscription?.status !== 'active'

            return (
              <ModuleCard
                key={app.key}
                app={app}
                hasAccess={hasAccess}
                isBlocked={isBlocked}
                href={links[app.key]}
                onSubscribe={() => setShowPricing(true)}
              />
            )
          })}
        </div>

        {/* SaaS: Estado de suscripción */}
        {saasEnabled && (
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: subscription?.status === 'active' ? '#86efac' : COLORS.textDim,
              background: 'rgba(255,255,255,0.05)',
              padding: '4px 12px',
              borderRadius: '20px',
              border: `1px solid ${subscription?.status === 'active' ? 'rgba(134,239,172,0.2)' : COLORS.borderOff}`
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: subscription?.status === 'active' ? '#22c55e' : '#f87171'
              }} />
              {subscription?.status === 'active' ? 'Suscripción Activa' : 'Sin Suscripción Activa'}
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ padding: '16px', textAlign: 'center', borderTop: `1px solid ${COLORS.borderOff}` }}>
        <small style={{ color: COLORS.textDim, fontSize: '11px' }}>
          © {new Date().getFullYear()} SOLUCIONES TECNOLÓGICAS DATIX SpA — Todos los derechos reservados
        </small>
      </div>

      {/* ── MODALS ── */}
      {showPricing && <Pricing user={user} onClose={() => setShowPricing(false)} />}
      {showSubscriptionWall && <SubscriptionWall onClose={() => setShowSubscriptionWall(false)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .d-md-block { display: none; }
        @media (min-width: 768px) { .d-md-block { display: block !important; } }
        .d-sm-inline { display: none; }
        @media (min-width: 576px) { .d-sm-inline { display: inline !important; } }
      `}</style>
    </div>
  )
}

// ── Componente tarjeta de módulo ─────────────────────────────────────────────
function ModuleCard({ app, hasAccess, isBlocked, href, onSubscribe }) {
  const [hovered, setHovered] = useState(false)

  const disabled = !hasAccess

  const handleClick = (e) => {
    if (disabled) { e.preventDefault(); return }
    if (isBlocked) { e.preventDefault(); onSubscribe(); return }
    // Si tiene acceso y no está bloqueado, el <a> navega normalmente
  }

  const cardBg = disabled
    ? COLORS.cardOff
    : hovered
      ? COLORS.cardHover
      : COLORS.cardOn

  const iconColor = disabled ? 'rgba(255,255,255,0.25)' : '#ffffff'
  const textColor = disabled ? 'rgba(255,255,255,0.30)' : '#ffffff'

  return (
    <a
      href={disabled || isBlocked ? '#' : href}
      onClick={handleClick}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        cursor: disabled ? 'default' : 'pointer',
        width: '120px',
      }}
    >
      {/* Caja cuadrada */}
      <div style={{
        width: '110px',
        height: '110px',
        borderRadius: '22px',
        background: cardBg,
        border: `1px solid ${disabled ? COLORS.borderOff : COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered && !disabled ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered && !disabled
          ? '0 16px 32px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.15)'
          : 'none',
        position: 'relative',
        flexShrink: 0,
      }}>
        {/* Ícono del módulo */}
        <app.Icon size={36} strokeWidth={1.4} style={{ color: iconColor }} />

        {/* Candado si no tiene acceso */}
        {disabled && (
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            <Lock size={12} strokeWidth={2.5} style={{ color: 'rgba(255,255,255,0.2)' }} />
          </div>
        )}
      </div>

      {/* Nombre del módulo */}
      <span style={{
        color: textColor,
        fontSize: '13px',
        fontWeight: disabled ? '400' : '500',
        textAlign: 'center',
        lineHeight: 1.3,
        maxWidth: '110px'
      }}>
        {app.name}
      </span>
    </a>
  )
}

export default Dashboard