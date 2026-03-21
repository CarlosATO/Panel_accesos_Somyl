import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Bell, HelpCircle, Trash2, Edit2, X } from 'lucide-react'

// ── DATIX Design System (mismo que Dashboard) ────────────────────────────────
const COLORS = {
  bg:        '#3d1a6e',      // Fondo principal
  navBg:     '#2d1259',      // Fondo navbar
  navActive: 'rgba(255,255,255,0.15)', // Tab activo
  cardOn:    'rgba(255,255,255,0.12)', // Tarjeta con acceso
  cardOff:   'rgba(255,255,255,0.04)', // Tarjeta sin acceso
  cardHover: 'rgba(255,255,255,0.20)', // Tarjeta hover
  border:    'rgba(255,255,255,0.12)',
  borderOff: 'rgba(255,255,255,0.05)',
  text:      '#ffffff',
  textDim:   'rgba(255,255,255,0.45)',
  accent:    '#a78bfa',      // Púrpura claro acento
  danger:    '#f87171',
  success:   '#34d399',
}

function Admin({ user, setUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    roles: {
      admin: false,
      ordenes: false,
      flota: false,
      produccion: false,
      logistica: false,
      rrhh: false,
      billing: false
    }
  })

  useEffect(() => { fetchUsers() }, [])

  // ── Auto-logout (10 min) ─────────────────────────────────────────────────
  useEffect(() => {
    const LIMIT = 10 * 60 * 1000
    let tid
    const reset = () => { if (tid) clearTimeout(tid); tid = setTimeout(handleLogout, LIMIT) }
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
    reset()
    events.forEach(e => window.addEventListener(e, reset))
    return () => { if (tid) clearTimeout(tid); events.forEach(e => window.removeEventListener(e, reset)) }
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' })
      setUser(null)
      navigate('/login')
    } catch (err) { console.error('Logout error:', err) }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        setError('Error al cargar usuarios')
      }
    } catch (err) { setError('Error de conexión') }
    setLoading(false)
  }

  const handleShowModal = (u = null) => {
    setEditingUser(u)
    if (u) {
      setFormData({
        email: u.email,
        password: '',
        roles: {
          admin:     u.is_superuser || u.rol_admin || false,
          ordenes:   u.rol_ordenes || false,
          flota:     u.rol_flota || false,
          produccion:u.rol_produccion || false,
          logistica: u.rol_logistica || false,
          rrhh:      u.rol_rrhh || false,
          billing:   u.is_billing_admin || false
        }
      })
    } else {
      setFormData({ email: '', password: '', roles: { admin:false, ordenes:false, flota:false, produccion:false, logistica:false, rrhh:false, billing:false } })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => { setShowModal(false); setEditingUser(null); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const url    = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users'
      const method = editingUser ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (response.ok) { fetchUsers(); handleCloseModal() }
      else setError(data.error || 'Error al guardar usuario')
    } catch (err) { setError('Error de conexión') }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Eliminar usuario?')) return
    try {
      const response = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE', credentials: 'include' })
      if (response.ok) { fetchUsers() }
      else { const data = await response.json(); setError(data.error || 'Error al eliminar') }
    } catch (err) { setError('Error de conexión') }
  }

  const handleRoleChange = (role, value) => {
    setFormData(prev => ({
      ...prev,
      roles: { ...prev.roles, [role]: value }
    }))
  }

  const companyName = user?.empresa_nombre || 'Empresa'
  const userName = user?.full_name || user?.email?.split('@')[0] || 'Usuario'

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── NAVBAR (idéntico a Dashboard) ── */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '24px' }}>
          <div style={{
            background: '#1a0a40',
            borderRadius: '10px',
            padding: '5px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${COLORS.border}`
          }}>
            <img
              src="https://datix.cl/imagen/logo_letras_blancas_fix.png"
              alt="DATIX"
              style={{ height: '22px', width: 'auto', display: 'block' }}
            />
          </div>
        </div>

        {/* Nav Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
          {/* Inicio */}
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              color: COLORS.textDim,
              border: 'none',
              borderRadius: '8px',
              padding: '7px 16px',
              fontSize: '14px',
              fontWeight: '400',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = COLORS.text }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.textDim }}
          >
            Inicio
          </button>

          {/* Facturación */}
          <button
            onClick={() => navigate('/facturacion')}
            style={{
              background: 'transparent',
              color: COLORS.textDim,
              border: 'none',
              borderRadius: '8px',
              padding: '7px 16px',
              fontSize: '14px',
              fontWeight: '400',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = COLORS.text }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.textDim }}
          >
            Facturación
          </button>

          {/* Ajustes — activo */}
          {user?.is_superuser && (
            <button
              style={{
                background: COLORS.navActive,
                color: COLORS.text,
                border: 'none',
                borderRadius: '8px',
                padding: '7px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'default',
                transition: 'all 0.2s'
              }}
            >
              Ajustes
            </button>
          )}
        </div>

        {/* Right: Empresa / usuario / acciones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Empresa + email */}
          <div style={{ textAlign: 'right', display: 'none' }} className="d-md-block">
            <div style={{ color: COLORS.text, fontSize: '13px', fontWeight: '500', lineHeight: 1.2 }}>
              {companyName}
            </div>
            <div style={{ color: COLORS.textDim, fontSize: '11px' }}>{user?.email}</div>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '28px', background: COLORS.border }} />

          {/* Notificaciones */}
          <button
            title="Notificaciones"
            style={{ background: 'transparent', border: 'none', color: COLORS.textDim, cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = COLORS.text }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.textDim }}
          >
            <Bell size={18} strokeWidth={1.5} />
          </button>

          {/* Ayuda */}
          <button
            title="Ayuda"
            style={{ background: 'transparent', border: 'none', color: COLORS.textDim, cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = COLORS.text }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.textDim }}
          >
            <HelpCircle size={18} strokeWidth={1.5} />
          </button>

          {/* Cerrar sesión */}
          <button
            onClick={handleLogout}
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
            <span className="d-none d-sm-inline">Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      {/* ── CONTENT AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', maxWidth: '1200px', width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h1 style={{ color: COLORS.text, fontSize: '28px', fontWeight: '700', margin: 0, marginBottom: '4px' }}>
                Usuarios del Sistema
              </h1>
              <p style={{ color: COLORS.textDim, fontSize: '14px', margin: 0 }}>
                Administra el acceso y permisos del sistema
              </p>
            </div>
            <button
              onClick={() => handleShowModal()}
              style={{
                background: COLORS.accent,
                color: '#1a0a40',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              + Nuevo Usuario
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.12)',
              border: `1px solid rgba(239,68,68,0.3)`,
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#fca5a5',
              fontSize: '13px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>{error}</span>
              <button
                onClick={() => setError('')}
                style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '18px' }}
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div style={{ maxWidth: '1200px', width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ color: COLORS.accent, fontSize: '14px' }}>Cargando usuarios...</div>
            </div>
          ) : users.length === 0 ? (
            <div style={{
              background: COLORS.cardOff,
              border: `1px solid ${COLORS.borderOff}`,
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center'
            }}>
              <p style={{ color: COLORS.textDim, fontSize: '14px' }}>No hay usuarios registrados</p>
            </div>
          ) : (
            <div style={{
              background: COLORS.cardOff,
              border: `1px solid ${COLORS.borderOff}`,
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${COLORS.borderOff}`, background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '14px 16px', textAlign: 'left', color: COLORS.textDim, fontWeight: '600', fontSize: '12px' }}>EMAIL</th>
                      <th style={{ padding: '14px 16px', textAlign: 'center', color: COLORS.textDim, fontWeight: '600', fontSize: '12px' }}>ADQUISICIONES</th>
                      <th style={{ padding: '14px 16px', textAlign: 'center', color: COLORS.textDim, fontWeight: '600', fontSize: '12px' }}>FLOTA</th>
                      <th style={{ padding: '14px 16px', textAlign: 'center', color: COLORS.textDim, fontWeight: '600', fontSize: '12px' }}>CONSTRUCCIÓN</th>
                      <th style={{ padding: '14px 16px', textAlign: 'center', color: COLORS.textDim, fontWeight: '600', fontSize: '12px' }}>LOGÍSTICA</th>
                      <th style={{ padding: '14px 16px', textAlign: 'center', color: COLORS.textDim, fontWeight: '600', fontSize: '12px' }}>RRHH</th>
                      <th style={{ padding: '14px 16px', textAlign: 'center', color: COLORS.textDim, fontWeight: '600', fontSize: '12px' }}>FACTURACIÓN</th>
                      <th style={{ padding: '14px 16px', textAlign: 'center', color: COLORS.textDim, fontWeight: '600', fontSize: '12px' }}>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, idx) => (
                      <tr key={u.id} style={{
                        borderBottom: idx < users.length - 1 ? `1px solid ${COLORS.borderOff}` : 'none',
                        background: 'transparent'
                      }}>
                        <td style={{ padding: '14px 16px', color: COLORS.text, fontSize: '13px' }}>{u.email}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <RoleBadge value={u.rol_ordenes} />
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <RoleBadge value={u.rol_flota} />
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <RoleBadge value={u.rol_produccion} />
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <RoleBadge value={u.rol_logistica} />
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <RoleBadge value={u.rol_rrhh} />
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <RoleBadge value={u.is_billing_admin} isBilling />
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleShowModal(u)}
                            style={{
                              background: 'rgba(167, 139, 250, 0.15)',
                              border: '1px solid rgba(167, 139, 250, 0.3)',
                              color: COLORS.accent,
                              borderRadius: '6px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167, 139, 250, 0.25)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167, 139, 250, 0.15)' }}
                          >
                            <Edit2 size={12} />
                            <span className="d-none d-sm-inline">Editar</span>
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            style={{
                              background: 'rgba(248, 113, 113, 0.15)',
                              border: '1px solid rgba(248, 113, 113, 0.3)',
                              color: COLORS.danger,
                              borderRadius: '6px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.25)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.15)' }}
                          >
                            <Trash2 size={12} />
                            <span className="d-none d-sm-inline">Eliminar</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ padding: '16px', textAlign: 'center', borderTop: `1px solid ${COLORS.borderOff}` }}>
        <small style={{ color: COLORS.textDim, fontSize: '11px' }}>
          © {new Date().getFullYear()} SOLUCIONES TECNOLÓGICAS DATIX SpA — Todos los derechos reservados
        </small>
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <Modal open={showModal} onClose={handleCloseModal} error={error} setError={setError} user={user} formData={formData} handleRoleChange={handleRoleChange} handleSubmit={handleSubmit} editingUser={editingUser} />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .d-md-block { display: none; }
        @media (min-width: 768px) { .d-md-block { display: block !important; } }
        .d-none { display: none; }
        .d-sm-inline { display: none; }
        @media (min-width: 576px) { .d-sm-inline { display: inline !important; } }
      `}</style>
    </div>
  )
}

// ── Componente Modal personalizado ─────────────────────────────────────────────
function Modal({ open, onClose, error, setError, user, formData, handleRoleChange, handleSubmit, editingUser }) {
  if (!open) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: COLORS.navBg,
        borderRadius: '16px',
        border: `1px solid ${COLORS.border}`,
        maxWidth: '600px',
        width: '90%',
        maxHeight: '85vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: `1px solid ${COLORS.borderOff}`
        }}>
          <h2 style={{ color: COLORS.text, fontSize: '18px', fontWeight: '700', margin: 0 }}>
            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: COLORS.textDim,
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = COLORS.text }}
            onMouseLeave={e => { e.currentTarget.style.color = COLORS.textDim }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.12)',
              border: `1px solid rgba(239,68,68,0.3)`,
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#fca5a5',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: COLORS.text, fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!!editingUser}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.08)',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '8px',
                padding: '10px 12px',
                color: COLORS.text,
                fontSize: '13px',
                transition: 'all 0.2s',
                opacity: editingUser ? 0.6 : 1
              }}
              onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.12)'; e.target.style.borderColor = COLORS.accent }}
              onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = COLORS.border }}
            />
          </div>

          {/* Password */}
          {!editingUser && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: COLORS.text, fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.08)',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: COLORS.text,
                  fontSize: '13px',
                  transition: 'all 0.2s'
                }}
                onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.12)'; e.target.style.borderColor = COLORS.accent }}
                onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = COLORS.border }}
              />
            </div>
          )}

          {/* Roles Section */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: COLORS.textDim, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
              Permisos
            </h3>

            {/* Admin toggle */}
            <RoleToggle
              id="admin"
              label="Administrador del Sistema"
              hint="Acceso total a todas las funciones"
              checked={formData.roles.admin}
              disabled={editingUser && String(editingUser.id) === String(user?.id)}
              onChange={v => handleRoleChange('admin', v)}
              color={COLORS.accent}
            />

            {/* Billing toggle */}
            <RoleToggle
              id="billing"
              label="Gestor de Facturación"
              hint="Puede ver precios y realizar pagos de suscripción"
              checked={formData.roles.billing}
              onChange={v => handleRoleChange('billing', v)}
              color={COLORS.accent}
            />

            {/* Módulos grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
              {[
                { id: 'ordenes', label: 'Adquisiciones', color: '#34d399' },
                { id: 'flota', label: 'Control Flota', color: '#38bdf8' },
                { id: 'produccion', label: 'Construcción', color: '#fb923c' },
                { id: 'logistica', label: 'Logística', color: '#fbbf24' },
                { id: 'rrhh', label: 'RRHH', color: '#f472b6' },
              ].map(r => (
                <RoleCheck
                  key={r.id}
                  id={r.id}
                  label={r.label}
                  color={r.color}
                  checked={formData.roles[r.id]}
                  onChange={v => handleRoleChange(r.id, v)}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: `1px solid ${COLORS.borderOff}`, paddingTop: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${COLORS.border}`,
                color: COLORS.textDim,
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                background: COLORS.accent,
                border: 'none',
                color: '#1a0a40',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Badge de rol ─────────────────────────────────────────────────────────────
function RoleBadge({ value, isBilling }) {
  const isAdmin = value === 'admin' || value === 'true' || value === true
  return (
    <span style={{
      display: 'inline-block',
      background: isAdmin ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.05)',
      color: isAdmin ? '#86efac' : COLORS.textDim,
      fontSize: '11px',
      fontWeight: '500',
      padding: '4px 10px',
      borderRadius: '6px',
      border: `1px solid ${isAdmin ? 'rgba(52, 211, 153, 0.3)' : 'rgba(255,255,255,0.08)'}`
    }}>
      {isAdmin ? 'Admin' : 'Sin acceso'}
    </span>
  )
}

// ── Toggle grande para permisos ─────────────────────────────────────────────
function RoleToggle({ id, label, hint, checked, disabled, onChange, color }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 14px',
      marginBottom: '8px',
      borderRadius: '8px',
      background: checked ? color + '15' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${checked ? color + '40' : 'rgba(255,255,255,0.08)'}`,
      transition: 'all 0.2s'
    }}>
      <div>
        <div style={{ color: COLORS.text, fontSize: '13px', fontWeight: '500' }}>{label}</div>
        {hint && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{hint}</div>}
      </div>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={e => onChange(e.target.checked)}
        style={{
          width: '18px',
          height: '18px',
          accentColor: color,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1
        }}
      />
    </div>
  )
}

// ── Check pequeño para módulos ─────────────────────────────────────────────
function RoleCheck({ id, label, checked, onChange, color }) {
  return (
    <label htmlFor={id} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      background: checked ? color + '15' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${checked ? color + '40' : 'rgba(255,255,255,0.08)'}`,
      transition: 'all 0.2s'
    }}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{
          accentColor: color,
          width: '16px',
          height: '16px',
          cursor: 'pointer'
        }}
      />
      <span style={{ color: COLORS.text, fontSize: '13px', fontWeight: '500' }}>{label}</span>
    </label>
  )
}

export default Admin
