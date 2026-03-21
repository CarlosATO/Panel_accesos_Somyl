import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Bell, HelpCircle, Trash2, Edit2 } from 'lucide-react'
import { useUsuarios } from './useUsuarios'
import UsuarioModal from './components/UsuarioModal'
import UsuariosTable from './components/UsuariosTable'

// ── DATIX Design System ──────────────────────────────────────────────────────
const COLORS = {
  bg:        '#3d1a6e',      // Fondo principal
  navBg:     '#2d1259',      // Fondo navbar
  navActive: 'rgba(255,255,255,0.15)', // Tab activo
  cardOff:   'rgba(255,255,255,0.04)', // Tarjeta sin acceso
  border:    'rgba(255,255,255,0.12)',
  borderOff: 'rgba(255,255,255,0.05)',
  text:      '#ffffff',
  textDim:   'rgba(255,255,255,0.45)',
  accent:    '#a78bfa',      // Púrpura claro acento
  danger:    '#f87171',
  success:   '#34d399',
}

function UsuariosPage() {
  const navigate = useNavigate()
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsuarios()
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [user, setUser] = useState(null)

  const handleShowModal = (u = null) => {
    setEditingUser(u)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
  }

  const handleSave = async (formData) => {
    const result = editingUser
      ? await updateUser(editingUser.id, formData)
      : await createUser(formData)

    if (result.success) {
      setSuccessMessage(editingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente')
      handleCloseModal()
      setTimeout(() => setSuccessMessage(''), 4000)
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Está seguro que desea eliminar este usuario?')) return
    const result = await deleteUser(userId)
    if (result.success) {
      setSuccessMessage('Usuario eliminado exitosamente')
      setTimeout(() => setSuccessMessage(''), 4000)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' })
      navigate('/login')
    } catch (err) { console.error('Error:', err) }
  }

  // Auto-logout por inactividad (10 min)
  useEffect(() => {
    const LIMIT = 10 * 60 * 1000
    let tid
    const reset = () => { if (tid) clearTimeout(tid); tid = setTimeout(handleLogout, LIMIT) }
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
    reset()
    events.forEach(e => window.addEventListener(e, reset))
    return () => { if (tid) clearTimeout(tid); events.forEach(e => window.removeEventListener(e, reset)) }
  }, [])

  useEffect(() => {
    const getCurrent = async () => {
      try {
        const resp = await fetch('/api/dashboard', { credentials: 'include' })
        if (resp.ok) {
          const data = await resp.json()
          setCurrentUserId(data.user?.id)
          setUser(data.user)
        }
      } catch (err) { console.error('Error:', err) }
    }
    getCurrent()
  }, [])

  const companyName = user?.empresa_nombre || 'Empresa'

  if (loading) {
    return (
      <div style={{ background: COLORS.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: `3px solid ${COLORS.accent}`, borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: COLORS.textDim, fontSize: '13px' }}>Cargando usuarios...</p>
        </div>
      </div>
    )
  }

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
            <img src="https://datix.cl/imagen/logo_letras_blancas_fix.png" alt="DATIX" style={{ height: '22px', width: 'auto', display: 'block' }} />
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
                cursor: 'default'
              }}
            >
              Ajustes
            </button>
          )}
        </div>

        {/* Right: Empresa / usuario / acciones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Empresa + email */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: COLORS.text, fontSize: '13px', fontWeight: '500', lineHeight: 1.2 }}>
              {companyName}
            </div>
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
            <span>Cerrar Sesión</span>
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
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div style={{
              background: 'rgba(52,211,153,0.12)',
              border: `1px solid rgba(52,211,153,0.3)`,
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#86efac',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              {successMessage}
            </div>
          )}
        </div>

        {/* Users Table */}
        <div style={{ maxWidth: '1200px', width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
          {users.length === 0 ? (
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
              <UsuariosTable
                users={users}
                currentUserId={currentUserId}
                onEdit={handleShowModal}
                onDelete={handleDelete}
              />
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
        <UsuarioModal
          show={showModal}
          onHide={handleCloseModal}
          onSave={handleSave}
          editingUser={editingUser}
          currentUserId={currentUserId}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default UsuariosPage
