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
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const handleDelete = async (userId) => {
    const result = await deleteUser(userId)
    if (result.success) {
      setSuccessMessage('Usuario eliminado exitosamente')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

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

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#f8fafc' }}>
        <div className="text-center">
          <div 
            className="spinner-border" 
            role="status" 
            style={{ 
              width: '3rem', 
              height: '3rem', 
              color: '#0d9488',
              borderWidth: '3px'
            }}
          >
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100" style={{ background: '#f8fafc' }}>
      {/* Header — make it consistent with Dashboard */}
      <nav className="navbar navbar-expand-lg shadow-sm" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container-fluid px-4">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-light d-flex align-items-center gap-2"
              onClick={() => navigate(-1)}
              style={{ borderRadius: '8px', padding: '8px 14px', fontWeight: 500, border: 'none' }}
            >
              <i className="bi bi-arrow-left"></i>
              <span className="d-none d-sm-inline">Volver</span>
            </button>
            <div className="d-flex flex-column ms-2">
              <div style={{ color: 'white', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="bi bi-people-fill" style={{ fontSize: '20px' }}></i>
                Gestión de Usuarios SSO
              </div>
              <small style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', marginTop: 2 }}>Administra el acceso y permisos de usuarios del sistema</small>
            </div>
          </div>

          <div className="d-flex align-items-center">
            <button
              className="btn btn-light d-flex align-items-center gap-2"
              onClick={() => handleShowModal()}
              style={{ borderRadius: '8px', padding: '8px 14px', fontWeight: 600, fontSize: 14, border: 'none', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
            >
              <i className="bi bi-plus-circle-fill"></i>
              <span className="d-none d-sm-inline">Nuevo Usuario</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <div className="container pb-5" style={{ marginTop: '20px' }}>
        {/* Alertas */}
        {error && (
          <div 
            className="alert border-0 d-flex align-items-center mb-4" 
            role="alert"
            style={{ 
              borderRadius: '12px',
              background: '#fef2f2',
              color: '#991b1b',
              padding: '16px 20px',
              fontSize: '14px'
            }}
          >
            <i className="bi bi-exclamation-circle-fill me-3" style={{ fontSize: '20px' }}></i>
            <div>{error}</div>
          </div>
        )}

        {successMessage && (
          <div 
            className="alert border-0 d-flex align-items-center mb-4" 
            role="alert"
            style={{ 
              borderRadius: '12px',
              background: '#f0fdf4',
              color: '#166534',
              padding: '16px 20px',
              fontSize: '14px'
            }}
          >
            <i className="bi bi-check-circle-fill me-3" style={{ fontSize: '20px' }}></i>
            <div>{successMessage}</div>
          </div>
        )}

        {/* Tabla o mensaje vacío */}
        {users.length === 0 ? (
          <div 
            className="card border-0 text-center py-5"
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <i className="bi bi-people" style={{ fontSize: '64px', color: '#d1d5db' }}></i>
            <h5 className="mt-4 mb-2" style={{ color: '#6b7280' }}>No hay usuarios registrados</h5>
            <p className="text-muted mb-4">Comienza agregando tu primer usuario al sistema</p>
            <button 
              className="btn d-inline-flex align-items-center gap-2 mx-auto"
              onClick={() => handleShowModal()}
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontWeight: '600'
              }}
            >
              <i className="bi bi-plus-circle"></i>
              Crear Primer Usuario
            </button>
          </div>
        ) : (
          <UsuariosTable 
            users={users}
            onEdit={handleShowModal}
            onDelete={handleDelete}
          />
        )}
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