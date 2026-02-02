import { useState, useEffect } from 'react'
import { Modal, Button, Form, Table, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

function Admin({ user, setUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  // SOMYL CORPORATE IDENTITY
  const brandCyan = '#00AEEF'
  const brandNavy = '#002855'

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    roles: {
      admin: false,
      ordenes: false,
      flota: false,
      produccion: false,
      logistica: false
    }
  })

  useEffect(() => {
    fetchUsers()
  }, [])

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

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      })
      setUser(null)
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
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
          flota: user.rol_flota || false,
          produccion: user.rol_produccion || false,
          logistica: user.rol_logistica || false
        }
      })
    } else {
      setFormData({
        email: '',
        password: '',
        roles: {
          admin: false,
          ordenes: false,
          flota: false,
          produccion: false,
          logistica: false
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
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: '#f8fafc' }}>
        <div className="text-center">
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: brandCyan, borderWidth: '4px' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-secondary fw-medium">Cargando Administración...</p>
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
            <div className="d-none d-md-block text-end">
              <div style={{ fontSize: '14px', color: 'white', fontWeight: '500' }}>{user.email}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Administrador</div>
            </div>

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
              Sistema
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
              <i className="bi bi-people" style={{ fontSize: '16px' }}></i> Usuarios & Permisos
            </button>
          </div>

          <div className="p-4 border-top border-light">
            <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', background: brandCyan, color: 'white', fontWeight: 'bold' }}>
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }} className="text-truncate">{user.full_name || 'Admin'}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>En línea</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido Principal Admin */}
        <div className="flex-grow-1 p-4 p-lg-5 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Gestión de Usuarios</h2>
              <p className="text-muted mb-0" style={{ fontSize: '14px' }}>Administra accesos y permisos del portal.</p>
            </div>
            <button
              className="btn text-white d-flex align-items-center gap-2 shadow-sm"
              onClick={() => handleShowModal()}
              style={{ background: brandCyan, border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '600' }}
            >
              <i className="bi bi-plus-lg"></i> Nuevo Usuario
            </button>
          </div>

          {error && <Alert variant="danger" className="mb-4 shadow-sm border-0">{error}</Alert>}

          <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="card-body p-0">
              <Table hover responsive className="mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="py-3 px-4 border-0 text-secondary text-uppercase small" style={{ fontWeight: '600' }}>Usuario</th>
                    <th className="py-3 px-4 border-0 text-secondary text-uppercase small" style={{ fontWeight: '600' }}>Permisos Asignados</th>
                    <th className="py-3 px-4 border-0 text-secondary text-uppercase small text-end" style={{ fontWeight: '600' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', background: '#f1f5f9', color: '#64748b', fontSize: '12px' }}>
                            <i className="bi bi-person-fill"></i>
                          </div>
                          <div>
                            <div className="fw-medium text-dark">{u.email}</div>
                            <div className="small text-muted">ID: {u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="d-flex flex-wrap gap-1">
                          {(u.is_superuser || u.rol_admin) && <span className="badge bg-dark bg-opacity-75">Admin</span>}
                          {u.rol_ordenes && <span className="badge" style={{ background: '#10b981' }}>Finanzas</span>}
                          {u.rol_flota && <span className="badge" style={{ background: '#0ea5e9' }}>Flota</span>}
                          {u.rol_produccion && <span className="badge" style={{ background: '#f97316' }}>Construcción</span>}
                          {u.rol_logistica && <span className="badge" style={{ background: '#f59e0b' }}>Logística</span>}
                          {(!u.rol_ordenes && !u.rol_flota && !u.rol_produccion && !u.rol_logistica && !u.is_superuser && !u.rol_admin) &&
                            <span className="badge bg-light text-secondary border">Sin Acceso</span>
                          }
                        </div>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <button className="btn btn-light btn-sm me-2 text-primary" onClick={() => handleShowModal(u)} style={{ borderRadius: '6px' }}>
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button className="btn btn-light btn-sm text-danger" onClick={() => handleDelete(u.id)} style={{ borderRadius: '6px' }}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center py-5 text-muted">No se encontraron usuarios</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>

          <div className="mt-auto pt-4 text-center">
            <small className="text-muted">Somyl S.A. &bull; Panel de Control</small>
          </div>
        </div>
      </div>

      {/* Modal - Estilizado */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: brandNavy }}>
            {editingUser ? 'Editar Acceso' : 'Nuevo Usuario'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="pt-4">
            {error && <Alert variant="danger" style={{ fontSize: '13px' }}>{error}</Alert>}

            <Form.Group className="mb-4">
              <Form.Label className="small text-secondary fw-bold text-uppercase">Correo Corporativo</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><i className="bi bi-envelope"></i></span>
                <Form.Control type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} required className="border-start-0" placeholder="usuario@somyl.cl" />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small text-secondary fw-bold text-uppercase">Contraseña {editingUser && '(Opcional)'}</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><i className="bi bi-key"></i></span>
                <Form.Control type="password" value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} required={!editingUser} className="border-start-0" placeholder="••••••••" />
              </div>
            </Form.Group>

            <div className="mb-2">
              <Form.Label className="small text-secondary fw-bold text-uppercase mb-3">Asignación de Roles</Form.Label>
              <div className="d-flex flex-column gap-2">
                <div className="form-check form-switch p-3 rounded border d-flex justify-content-between align-items-center" style={{ background: '#f8fafc' }}>
                  <label className="form-check-label fw-medium mb-0" htmlFor="role-admin">Administrador Total</label>
                  <input className="form-check-input ms-0" type="checkbox" id="role-admin" checked={formData.roles.admin}
                    disabled={editingUser && String(editingUser.id) === String(user.id)}
                    onChange={(e) => handleRoleChange('admin', e.target.checked)} />
                </div>

                <div className="row g-2">
                  {/* Ordenes */}
                  <div className="col-6">
                    <div className="form-check p-3 rounded border h-100" style={{ borderColor: formData.roles.ordenes ? '#10b981' : '#e2e8f0', background: formData.roles.ordenes ? '#ecfdf5' : 'white' }}>
                      <input className="form-check-input" type="checkbox" id="role-ordenes" checked={formData.roles.ordenes} onChange={(e) => handleRoleChange('ordenes', e.target.checked)} />
                      <label className="form-check-label ms-2 small fw-semibold" htmlFor="role-ordenes">Finanzas</label>
                    </div>
                  </div>
                  {/* Flota */}
                  <div className="col-6">
                    <div className="form-check p-3 rounded border h-100" style={{ borderColor: formData.roles.flota ? '#0ea5e9' : '#e2e8f0', background: formData.roles.flota ? '#f0f9ff' : 'white' }}>
                      <input className="form-check-input" type="checkbox" id="role-flota" checked={formData.roles.flota} onChange={(e) => handleRoleChange('flota', e.target.checked)} />
                      <label className="form-check-label ms-2 small fw-semibold" htmlFor="role-flota">Control Flota</label>
                    </div>
                  </div>
                  {/* Logistica */}
                  <div className="col-6">
                    <div className="form-check p-3 rounded border h-100" style={{ borderColor: formData.roles.logistica ? '#f59e0b' : '#e2e8f0', background: formData.roles.logistica ? '#fffbeb' : 'white' }}>
                      <input className="form-check-input" type="checkbox" id="role-logistica" checked={formData.roles.logistica} onChange={(e) => handleRoleChange('logistica', e.target.checked)} />
                      <label className="form-check-label ms-2 small fw-semibold" htmlFor="role-logistica">Logística</label>
                    </div>
                  </div>
                  {/* Construccion */}
                  <div className="col-6">
                    <div className="form-check p-3 rounded border h-100" style={{ borderColor: formData.roles.produccion ? '#f97316' : '#e2e8f0', background: formData.roles.produccion ? '#fff7ed' : 'white' }}>
                      <input className="form-check-input" type="checkbox" id="role-produccion" checked={formData.roles.produccion} onChange={(e) => handleRoleChange('produccion', e.target.checked)} />
                      <label className="form-check-label ms-2 small fw-semibold" htmlFor="role-produccion">Construcción</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 pb-4">
            <Button variant="light" onClick={handleCloseModal} className="px-4">Cancelar</Button>
            <Button onClick={handleSubmit} className="px-4 text-white hover-shadow" style={{ background: brandCyan, border: 'none' }}>
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}

export default Admin