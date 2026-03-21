import { useNavigate } from 'react-router-dom'
import { LogOut, Bell, HelpCircle } from 'lucide-react'
import AlertasBox from './Facturacion/AlertasBox'

const COLORS = {
  navBg: '#2d1259',
  border: 'rgba(255,255,255,0.12)',
  text: '#ffffff',
  textDim: 'rgba(255,255,255,0.45)',
  accent: '#a78bfa',
}

function Navbar({ user, currentTab = 'inicio', onLogout }) {
  const navigate = useNavigate()

  const tabs = [
    { key: 'inicio', label: 'Inicio', path: '/' }
  ]

  // Mostrar Facturación solo si tiene permisos
  if (user?.is_superuser || user?.is_billing_admin) {
    tabs.push({ key: 'facturacion', label: 'Facturación', path: '/facturacion' })
  }

  if (user?.is_superuser) {
    tabs.push({ key: 'ajustes', label: 'Ajustes', path: '/admin' })
  }

  return (
    <nav style={{
      background: COLORS.navBg,
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      height: '70px',
      flexShrink: 0,
      borderBottom: `1px solid ${COLORS.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      gap: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
        <img
          src="/logo_datix.png"
          alt="DATIX"
          style={{ height: '70px', width: 'auto', display: 'block' }}
        />
      </div>

      {/* Nav Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => navigate(tab.path)}
            style={{
              background: currentTab === tab.key ? 'rgba(255,255,255,0.15)' : 'transparent',
              color: currentTab === tab.key ? COLORS.text : COLORS.textDim,
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '15px',
              fontWeight: currentTab === tab.key ? '500' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              if (currentTab !== tab.key) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = COLORS.text
              }
            }}
            onMouseLeave={e => {
              if (currentTab !== tab.key) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = COLORS.textDim
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right: Acciones */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Alertas de Facturación */}
        {user?.is_superuser && <AlertasBox user={user} />}

        {/* Ayuda */}
        <button
          title="Ayuda"
          style={{
            background: 'transparent',
            border: 'none',
            color: COLORS.textDim,
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = COLORS.text }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.textDim }}
        >
          <HelpCircle size={18} strokeWidth={1.5} />
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', background: COLORS.border }} />

        {/* User Email */}
        {user?.email && (
          <span style={{
            color: COLORS.text,
            fontSize: '14px',
            fontWeight: '400',
            background: 'rgba(255,255,255,0.05)',
            padding: '6px 12px',
            borderRadius: '6px',
            border: `1px solid ${COLORS.border}`,
            marginRight: '8px'
          }}>
            {user.email}
          </span>
        )}

        {/* Cerrar sesión */}
        <button
          onClick={onLogout}
          title="Cerrar Sesión"
          style={{
            background: 'transparent',
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text,
            cursor: 'pointer',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <LogOut size={14} strokeWidth={2} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </nav>
  )
}

export default Navbar
