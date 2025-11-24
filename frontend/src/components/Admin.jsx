import { useState, useEffect } from 'react'
import { Modal, Button, Form, Table, Alert } from 'react-bootstrap'

function Admin({ user }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    roles: {
      admin: false,
      ordenes: false,
      fibra: false,
      flota: false,
      herramientas: false
    }
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        setError('Error al cargar usuarios')
      }
    } catch (error) {
      setError('Error de conexión')
    }
    setLoading(false)
  }

  const handleShowModal = (user = null) => {
    setEditingUser(user)
    if (user) {
      setFormData({
        email: user.email,
        password: '',
        roles: {
          admin: user.is_superuser || user.rol_admin || false,
          ordenes: user.rol_ordenes || false,
          fibra: user.rol_fibra || false,
          flota: user.rol_flota || false,
          herramientas: user.rol_herramientas || false
        }
      })
    } else {
      setFormData({
        email: '',
        password: '',
        roles: {
          admin: false,
          ordenes: false,
          fibra: false,
          flota: false,
          herramientas: false
        }
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users'
      const method = editingUser ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        fetchUsers()
        handleCloseModal()
      } else {
        setError(data.error || 'Error al guardar usuario')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Eliminar usuario?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        fetchUsers()
      } else {
        setError('Error al eliminar usuario')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  // Toggling superusuario now happens only in the Edit modal.

  const handleRoleChange = (role, checked) => {
    setFormData(prev => ({
      ...prev,
      roles: {
        ...prev.roles,
        [role]: checked
      }
    }))
  }

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  }

  return (
    <div className="container-fluid min-vh-100 bg-light py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Administración de Usuarios SSO</h1>
            <Button variant="primary" onClick={() => handleShowModal()}>
              <i className="bi bi-plus-circle me-2"></i>
              Crear Usuario
            </Button>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <div className="card">
            <div className="card-body">
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Admin</th>
                    <th>Órdenes</th>
                    <th>Fibra</th>
                    <th>Flota</th>
                    <th>Herramientas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.email}</td>
                      <td>{(u.is_superuser || u.rol_admin) ? 'Sí' : 'No'}</td>
                      <td>{u.rol_ordenes ? 'Sí' : 'No'}</td>
                      <td>{u.rol_fibra ? 'Sí' : 'No'}</td>
                      <td>{u.rol_flota ? 'Sí' : 'No'}</td>
                      <td>{u.rol_herramientas ? 'Sí' : 'No'}</td>
                      <td>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleShowModal(u)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        {/* Toggle handled only via Edit modal — not from table */}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(u.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Crear/Editar Usuario */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? 'Editar Usuario' : 'Crear Usuario'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña {editingUser && '(dejar vacío para no cambiar)'}</Form.Label>
              <Form.Control
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required={!editingUser}
              />
            </Form.Group>

            <div className="mb-3">
              <Form.Label>Roles</Form.Label>
              <div className="row">
                {Object.entries(formData.roles).map(([role, checked]) => (
                  <div key={role} className="col-md-4">
                    <Form.Check
                      type="checkbox"
                        label={role.charAt(0).toUpperCase() + role.slice(1)}
                        checked={checked}
                        disabled={role === 'admin' && editingUser && String(editingUser.id) === String(user.id)}
                        onChange={(e) => handleRoleChange(role, e.target.checked)}
                    />
                  </div>
                ))}
                  {editingUser && String(editingUser.id) === String(user.id) && (
                    <div className="mt-2 text-muted small">No puedes revocar tu propio rol de superusuario desde aquí.</div>
                  )}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingUser ? 'Actualizar' : 'Crear'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}

export default Admin