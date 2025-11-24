/**
 * Página de Gestión de Usuarios SSO
 * Componente principal del módulo de usuarios
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Button, Alert, Spinner } from 'react-bootstrap'
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

  // Toggle moved to Edit modal only — backend prevents self-revocation

  // fetch the current user's id so the modal can prevent self-revocation in UI
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
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    )
  }

  return (
    <Container className="py-4">
      <div className="mb-3 d-flex align-items-center">
        <button className="btn btn-outline-secondary me-3" onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-people me-2"></i>
          Gestión de Usuarios SSO
        </h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <i className="bi bi-plus-circle me-1"></i>
          Nuevo Usuario
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {users.length === 0 ? (
        <Alert variant="info">No hay usuarios registrados</Alert>
      ) : (
        <UsuariosTable 
          users={users}
          onEdit={handleShowModal}
          onDelete={handleDelete}
        />
      )}

      <UsuarioModal
        show={showModal}
        onHide={handleCloseModal}
        onSave={handleSave}
        editingUser={editingUser}
        currentUserId={currentUserId}
      />
    </Container>
  )
}

export default UsuariosPage