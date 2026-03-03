import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, Shield, LogOut, Search, Users } from 'lucide-react'
import { useUsuarios } from './useUsuarios'
import UsuarioModal from './components/UsuarioModal'
import UsuariosTable from './components/UsuariosTable'

function UsuariosPage() {
  const navigate = useNavigate()
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsuarios()
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // SOMYL CORPORATE IDENTITY
  const brandCyan = '#00AEEF'
  const brandNavy = '#002855'

  const handleShowModal = (user = null) => {
    setEditingUser(user)
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
    const result = await deleteUser(userId)
    if (result.success) {
      setSuccessMessage('Usuario eliminado exitosamente')
      setTimeout(() => setSuccessMessage(''), 4000)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      })
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  // AUTO-LOGOUT LOGIC (10 Minutes)
  useEffect(() => {
    const INACTIVITY_LIMIT = 10 * 60 * 1000
    let timeoutId

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        handleLogout()
      }, INACTIVITY_LIMIT)
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
    resetTimer()
    events.forEach(event => window.addEventListener(event, resetTimer))

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      events.forEach(event => window.removeEventListener(event, resetTimer))
    }
  }, [])

  useEffect(() => {
    const getCurrent = async () => {
      try {
        const resp = await fetch('/api/dashboard', { credentials: 'include' })
        if (resp.ok) {
          const data = await resp.json()
          setCurrentUserId(data.user?.id)
        }
      } catch (err) {
        // ignore
      }
    }
    getCurrent()
  }, [])

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#09090b' }}>
        <div className="text-center">
          <div
            className="spinner-border"
            role="status"
            style={{ width: '3rem', height: '3rem', color: '#0ea5e9', borderWidth: '3px' }}
          >
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 fw-medium" style={{ color: '#52525b', fontSize: '13px' }}>Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100" style={{ background: '#09090b', position: 'relative', overflow: 'hidden' }}>

      {/* ── Ambient Blob Layer ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '45vw', height: '45vw', borderRadius: '50%', background: '#0ea5e9', opacity: 0.10, filter: 'blur(120px)', animation: 'blob1 22s infinite alternate ease-in-out' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: '#4f46e5', opacity: 0.09, filter: 'blur(130px)', animation: 'blob2 26s infinite alternate ease-in-out', animationDelay: '2s' }} />
        <div style={{ position: 'absolute', top: '5%', right: '10%', width: '30vw', height: '30vw', borderRadius: '50%', background: '#10b981', opacity: 0.07, filter: 'blur(110px)', animation: 'blob3 18s infinite alternate ease-in-out', animationDelay: '4s' }} />
      </div>

      {/* ── Foreground Content ── */}
      <div className="d-flex flex-column p-3 gap-3" style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>

        {/* Header — Glass Panel */}
        <nav style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={() => navigate('/')}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '7px 14px', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#f4f4f5' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#a1a1aa' }}
            >
              <ArrowLeft size={14} strokeWidth={1.5} /> Volver
            </button>
            <div className="d-flex align-items-center gap-3">
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '7px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <img src="/logo-somyl.ico" alt="Somyl" style={{ width: 22, height: 'auto', display: 'block' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: '#f4f4f5' }}>Portal Unificado</div>
                <div style={{ fontSize: '11px', color: '#52525b' }}>Módulo de Administración</div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-sm d-flex align-items-center gap-2"
            style={{ background: 'rgba(239,68,68,0.07)', color: '#f87171', border: '1px solid rgba(239,68,68,0.12)', borderRadius: '8px', fontSize: '13px' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = '#fca5a5' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#f87171' }}
          >
            <LogOut size={14} strokeWidth={1.5} /> <span className="d-none d-sm-inline">Salir</span>
          </button>
        </nav>

        {/* Main — Glass Panel */}
        <div
          className="flex-grow-1 d-flex flex-column"
          style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px 32px' }}
        >
          {/* Page title row */}
          <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', flexShrink: 0 }}>
                <Shield size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="fw-semibold mb-1" style={{ color: '#ffffff', fontSize: '1.4rem', letterSpacing: '-0.3px' }}>Usuarios del Sistema</h2>
                <p className="mb-0" style={{ color: '#71717a', fontSize: '13px' }}>Administra el acceso y permisos del sistema.</p>
              </div>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <div className="position-relative d-none d-md-block">
                <Search size={13} strokeWidth={1.5} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#52525b', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '13px', color: '#d4d4d8', minWidth: '220px', padding: '8px 12px 8px 34px', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(14,165,233,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
              <button
                className="btn d-flex align-items-center gap-2"
                onClick={() => handleShowModal()}
                style={{ background: '#0ea5e9', border: 'none', borderRadius: '10px', padding: '8px 18px', fontWeight: '500', fontSize: '13px', color: 'white', boxShadow: '0 4px 14px rgba(14,165,233,0.25)', whiteSpace: 'nowrap' }}
              >
                <UserPlus size={15} strokeWidth={1.5} /> Nuevo Usuario
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="d-md-none mb-3">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '13px', color: '#d4d4d8', padding: '8px 14px', outline: 'none' }}
            />
          </div>

          {error && (
            <div className="mb-4 p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', color: '#f87171', fontSize: '13px' }}>
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '10px', color: '#4ade80', fontSize: '13px' }}>
              {successMessage}
            </div>
          )}

          {/* Table wrapper */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden', flexGrow: 1 }}>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-5">
                <div className="mx-auto mb-3" style={{ opacity: 0.18 }}>
                  <Users size={48} strokeWidth={1} style={{ color: '#71717a' }} />
                </div>
                <p style={{ color: '#52525b', fontWeight: '500', fontSize: '14px' }}>No se encontraron usuarios</p>
              </div>
            ) : (
              <UsuariosTable
                users={filteredUsers}
                currentUserId={currentUserId}
                onEdit={handleShowModal}
                onDelete={handleDelete}
              />
            )}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '10px 20px' }}>
              <small style={{ fontSize: '12px', color: '#52525b' }}>{filteredUsers.length} usuario(s) registrado(s)</small>
            </div>
          </div>

          <div className="pt-4 text-end pe-1">
            <small style={{ fontSize: '11px', color: '#3f3f46' }}>Somyl S.A. &bull; Panel de Control</small>
          </div>
        </div>
      </div>

      <UsuarioModal
        show={showModal}
        onHide={handleCloseModal}
        onSave={handleSave}
        editingUser={editingUser}
        currentUserId={currentUserId}
      />

      <style>{`
        @keyframes blob1 {
          0%   { transform: translate(0px,   0px)   scale(1);    }
          33%  { transform: translate(80px,  -60px) scale(1.08); }
          66%  { transform: translate(-50px,  90px) scale(0.95); }
          100% { transform: translate(60px,   40px) scale(1.04); }
        }
        @keyframes blob2 {
          0%   { transform: translate(0px,    0px)   scale(1);    }
          33%  { transform: translate(-90px,  50px)  scale(1.06); }
          66%  { transform: translate(70px,  -80px)  scale(0.97); }
          100% { transform: translate(-40px, -30px)  scale(1.03); }
        }
        @keyframes blob3 {
          0%   { transform: translate(0px,   0px)    scale(1);    }
          33%  { transform: translate(-60px, 80px)   scale(1.1);  }
          66%  { transform: translate(100px, -40px)  scale(0.93); }
          100% { transform: translate(30px,  60px)   scale(1.05); }
        }
      `}</style>
    </div>
  )
}

export default UsuariosPage