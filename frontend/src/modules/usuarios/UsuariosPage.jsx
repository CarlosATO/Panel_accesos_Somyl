import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#f8fafc' }}>
        <div className="text-center">
          <div
            className="spinner-border"
            role="status"
            style={{ width: '3rem', height: '3rem', color: brandCyan, borderWidth: '3px' }}
          >
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-secondary fw-medium">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: '#f8fafc' }}>
      {/* Header Corporativo (Navy Blue) - Consistente con Dashboard */}
      <nav
        className="navbar navbar-expand-lg shadow-sm sticky-top"
        style={{
          background: brandNavy,
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          zIndex: 1030
        }}
      >
        <div className="container-fluid px-4 md:px-5">
          <a className="navbar-brand d-flex align-items-center gap-3 text-white" href="#" style={{ fontWeight: '600' }} onClick={() => navigate('/')}>
            <div style={{ background: 'white', padding: '6px', borderRadius: '8px' }}>
              <img src="/logo-somyl.ico" alt="Somyl" style={{ width: 32, height: 'auto', display: 'block' }} />
            </div>
            <div className="d-flex flex-column">
              <span style={{ fontWeight: 600, fontSize: '18px', letterSpacing: '0.5px' }}>Portal Unificado</span>
              <span style={{ fontSize: '11px', opacity: 0.7, fontWeight: 400 }}>Módulo de Administración</span>
            </div>
          </a>

          <div className="d-flex align-items-center gap-4">
            <button className="btn btn-sm d-flex align-items-center gap-2" onClick={handleLogout}
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', borderRadius: '8px', padding: '8px 16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <i className="bi bi-box-arrow-right"></i> <span className="d-none d-sm-inline">Salir</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="d-flex flex-grow-1">
        {/* Sidebar Consistente */}
        <div
          className="bg-white d-none d-lg-flex shadow-sm"
          style={{
            width: '280px',
            borderRight: '1px solid #e2e8f0',
            flexDirection: 'column',
            position: 'sticky',
            top: '70px',
            height: 'calc(100vh - 70px)',
            zIndex: 1020
          }}
        >
          <div className="p-4 flex-grow-1">
            <div className="text-uppercase fw-bold mb-3" style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '1px' }}>
              Navegación
            </div>
            <button
              onClick={() => navigate('/')}
              className="btn text-start d-flex align-items-center gap-3 w-100 mb-2"
              style={{ color: '#64748b', fontWeight: '500', fontSize: '14px', padding: '10px 16px', borderRadius: '8px', border: 'none' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <i className="bi bi-grid-3x3-gap" style={{ fontSize: '16px' }}></i> Volver al Dashboard
            </button>
            <button
              className="btn text-start d-flex align-items-center gap-3 w-100"
              style={{ backgroundColor: '#e0f2fe', color: '#0284c7', fontWeight: '600', fontSize: '14px', padding: '10px 16px', borderRadius: '8px', border: 'none' }}
            >
              <i className="bi bi-people" style={{ fontSize: '16px' }}></i> Gestión de Usuarios
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 p-4 p-lg-5 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Usuarios del Sistema</h2>
              <p className="text-muted mb-0" style={{ fontSize: '14px' }}>Administra el acceso y permisos del sistema.</p>
            </div>

            {/* Search box inline with title on large screens, or stacked */}
            <div className="d-flex gap-3">
              <div className="position-relative d-none d-md-block">
                <i className="bi bi-search position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control ps-5"
                  style={{ borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', minWidth: '250px' }}
                />
              </div>
              <button
                className="btn text-white d-flex align-items-center gap-2 shadow-sm"
                onClick={() => handleShowModal()}
                style={{ background: brandCyan, border: 'none', borderRadius: '8px', padding: '8px 20px', fontWeight: '600', fontSize: '14px' }}
              >
                <i className="bi bi-plus-lg"></i> Nuevo Usuario
              </button>
            </div>
          </div>

          {error && <div className="alert alert-danger shadow-sm border-0 mb-4" style={{ borderRadius: '12px', fontSize: '14px' }}>{error}</div>}
          {successMessage && <div className="alert alert-success shadow-sm border-0 mb-4" style={{ borderRadius: '12px', fontSize: '14px' }}>{successMessage}</div>}

          <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="card-body p-0">
              {/* Mobile Search visible only on small screens */}
              <div className="d-md-none p-3 border-bottom">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                />
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mx-auto mb-3 text-secondary opacity-25">
                    <i className="bi bi-people" style={{ fontSize: '48px' }}></i>
                  </div>
                  <h6 className="text-secondary fw-bold">No se encontraron usuarios</h6>
                </div>
              ) : (
                <UsuariosTable
                  users={filteredUsers}
                  currentUserId={currentUserId}
                  onEdit={handleShowModal}
                  onDelete={handleDelete}
                />
              )}
            </div>
            {/* Footer de Tabla */}
            <div className="card-footer bg-light border-top border-light py-3 px-4">
              <small className="text-muted">{filteredUsers.length} usuario(s) registrado(s)</small>
            </div>
          </div>

          <div className="mt-auto pt-4 text-center">
            <small className="text-muted">Somyl S.A. &bull; Panel de Control</small>
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
    </div>
  )
}

export default UsuariosPage