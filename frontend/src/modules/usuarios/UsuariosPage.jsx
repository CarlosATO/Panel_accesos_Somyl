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
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#f1f5f9' }}>
        <div className="text-center">
          <div 
            className="spinner-border" 
            role="status" 
            style={{ width: '3rem', height: '3rem', color: '#0d9488', borderWidth: '3px' }}
          >
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3" style={{ color: '#64748b' }}>Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100" style={{ background: '#f1f5f9' }}>
      {/* Header */}
      <nav 
        className="navbar shadow-sm" 
        style={{ 
          background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
          padding: '16px 0'
        }}
      >
        <div className="container-fluid px-4">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-light d-flex align-items-center justify-content-center"
              onClick={() => navigate('/')}
              style={{ 
                borderRadius: '10px', 
                width: '40px',
                height: '40px',
                padding: 0,
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <i className="bi bi-arrow-left" style={{ fontSize: '18px' }}></i>
            </button>
            <div>
              <h1 className="mb-0 text-white" style={{ fontSize: '20px', fontWeight: '700' }}>
                <i className="bi bi-people-fill me-2"></i>
                Gestión de Usuarios
              </h1>
              <p className="mb-0 text-white-50" style={{ fontSize: '13px' }}>
                Administra el acceso y permisos del sistema
              </p>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-4 py-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Alertas */}
        {error && (
          <div 
            className="alert d-flex align-items-center mb-4" 
            style={{ 
              borderRadius: '12px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '16px 20px'
            }}
          >
            <i className="bi bi-exclamation-circle-fill me-3" style={{ fontSize: '20px' }}></i>
            <div style={{ fontSize: '14px' }}>{error}</div>
          </div>
        )}

        {successMessage && (
          <div 
            className="alert d-flex align-items-center mb-4" 
            style={{ 
              borderRadius: '12px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#16a34a',
              padding: '16px 20px'
            }}
          >
            <i className="bi bi-check-circle-fill me-3" style={{ fontSize: '20px' }}></i>
            <div style={{ fontSize: '14px' }}>{successMessage}</div>
          </div>
        )}

        {/* Card principal */}
        <div 
          className="card border-0" 
          style={{ 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' 
          }}
        >
          {/* Header del card */}
          <div 
            className="card-header bg-white d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3"
            style={{ 
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              borderRadius: '16px 16px 0 0'
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <div 
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                  color: 'white',
                  fontSize: '20px'
                }}
              >
                <i className="bi bi-people"></i>
              </div>
              <div>
                <h5 className="mb-0" style={{ fontWeight: '600', color: '#0f172a' }}>
                  Usuarios del Sistema
                </h5>
                <p className="mb-0" style={{ fontSize: '13px', color: '#64748b' }}>
                  {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
              {/* Buscador */}
              <div className="position-relative">
                <i 
                  className="bi bi-search position-absolute" 
                  style={{ 
                    left: '14px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    fontSize: '14px'
                  }}
                ></i>
                <input
                  type="text"
                  placeholder="Buscar por email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                  style={{
                    paddingLeft: '40px',
                    paddingRight: '16px',
                    height: '42px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    minWidth: '220px'
                  }}
                />
              </div>

              {/* Botón crear */}
              <button
                className="btn text-white d-flex align-items-center justify-content-center gap-2"
                onClick={() => handleShowModal()}
                style={{
                  background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 20px',
                  height: '42px',
                  fontWeight: '600',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
                }}
              >
                <i className="bi bi-plus-lg"></i>
                <span>Nuevo Usuario</span>
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="card-body p-0">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-5">
                <div 
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#f1f5f9'
                  }}
                >
                  <i className="bi bi-people" style={{ fontSize: '32px', color: '#94a3b8' }}></i>
                </div>
                <h5 style={{ color: '#475569', fontWeight: '600' }}>
                  {searchTerm ? 'No se encontraron resultados' : 'No hay usuarios registrados'}
                </h5>
                <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
                  {searchTerm ? 'Intenta con otro término de búsqueda' : 'Comienza agregando tu primer usuario al sistema'}
                </p>
                {!searchTerm && (
                  <button 
                    className="btn text-white d-inline-flex align-items-center gap-2"
                    onClick={() => handleShowModal()}
                    style={{
                      background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 24px',
                      fontWeight: '600'
                    }}
                  >
                    <i className="bi bi-plus-circle"></i>
                    Crear Primer Usuario
                  </button>
                )}
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