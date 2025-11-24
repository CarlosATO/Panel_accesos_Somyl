/**
 * Componente Modal para crear/editar usuarios
 * Formulario reutilizable con validación
 */
import { useState, useEffect } from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'

function UsuarioModal({ show, onHide, onSave, editingUser, currentUserId }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    roles: {
      admin: false,
      ordenes: 'false',
      fibra: 'false',
      flota: 'false',
      herramientas: 'false'
    }
  })

  useEffect(() => {
    if (editingUser) {
      setFormData({
        email: editingUser.email,
        password: '',
        roles: {
          admin: editingUser.is_superuser || editingUser.rol_admin || false,
          ordenes: editingUser.rol_ordenes || 'false',
          fibra: editingUser.rol_fibra || 'false',
          flota: editingUser.rol_flota || 'false',
          herramientas: editingUser.rol_herramientas || 'false'
        }
      })
    } else {
      setFormData({
        email: '',
        password: '',
        roles: {
          admin: false,
          ordenes: 'false',
          fibra: 'false',
          flota: 'false',
          herramientas: 'false'
        }
      })
    }
  }, [editingUser, show])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleRoleChange = (role, value) => {
    setFormData({
      ...formData,
      roles: {
        ...formData.roles,
        [role]: value
      }
    })
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {editingUser ? 'Editar Usuario' : 'Crear Usuario'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="g-3">
            <Col lg={7}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  placeholder="usuario@tuempresa.com"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <div className="form-text">El email será el identificador para iniciar sesión.</div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Contraseña {editingUser && '(dejar en blanco para no cambiar)'}
                </Form.Label>
                <Form.Control
                  type="password"
                  value={formData.password}
                  placeholder={editingUser ? 'Dejar en blanco para mantener la actual' : ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                />
                {!editingUser && (
                  <div className="form-text">Asegúrate de usar una contraseña segura (mínimo 8 caracteres).</div>
                )}
              </Form.Group>
            </Col>
            <Col lg={5}>
              <div className="h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="mb-2 fw-bold">Estado</div>
                  <div className="small text-muted mb-3">Configura el acceso y roles del usuario</div>
                </div>
                <div className="text-end mt-3">
                  <small className="text-muted">Tip: puedes asignar superusuario para acceso Admin completo</small>
                </div>
              </div>
            </Col>
          </Row>

          <Form.Label>Permisos de Aplicaciones</Form.Label>
          <div className="border p-3 rounded bg-light">
            {/* Superuser */}
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Superusuario (acceso al módulo Admin)"
                checked={!!formData.roles.admin}
                disabled={editingUser && String(editingUser.id) === String(currentUserId)}
                onChange={(e) => handleRoleChange('admin', e.target.checked)}
              />
              {editingUser && String(editingUser.id) === String(currentUserId) && (
                <div className="text-muted small mt-1">No puedes revocar tu propio rol de superusuario desde aquí.</div>
              )}
            </Form.Group>
            
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">Órdenes de Pago</Form.Label>
                  <div>
                    <Form.Check inline type="radio" label="Admin" name="ordenes" checked={formData.roles.ordenes === 'admin'} onChange={() => handleRoleChange('ordenes', 'admin')} />
                    <Form.Check inline type="radio" label="Usuario" name="ordenes" checked={formData.roles.ordenes === 'true'} onChange={() => handleRoleChange('ordenes', 'true')} />
                    <Form.Check inline type="radio" label="Sin acceso" name="ordenes" checked={formData.roles.ordenes === 'false'} onChange={() => handleRoleChange('ordenes', 'false')} />
                  </div>
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Label className="fw-bold">Gestión Fibra</Form.Label>
                  <div>
                    <Form.Check inline type="radio" label="Admin" name="fibra" checked={formData.roles.fibra === 'admin'} onChange={() => handleRoleChange('fibra', 'admin')} />
                    <Form.Check inline type="radio" label="Usuario" name="fibra" checked={formData.roles.fibra === 'true'} onChange={() => handleRoleChange('fibra', 'true')} />
                    <Form.Check inline type="radio" label="Sin acceso" name="fibra" checked={formData.roles.fibra === 'false'} onChange={() => handleRoleChange('fibra', 'false')} />
                  </div>
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">Control Flota</Form.Label>
                  <div>
                    <Form.Check inline type="radio" label="Admin" name="flota" checked={formData.roles.flota === 'admin'} onChange={() => handleRoleChange('flota', 'admin')} />
                    <Form.Check inline type="radio" label="Usuario" name="flota" checked={formData.roles.flota === 'true'} onChange={() => handleRoleChange('flota', 'true')} />
                    <Form.Check inline type="radio" label="Sin acceso" name="flota" checked={formData.roles.flota === 'false'} onChange={() => handleRoleChange('flota', 'false')} />
                  </div>
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Label className="fw-bold">Herramientas</Form.Label>
                  <div>
                    <Form.Check inline type="radio" label="Admin" name="herramientas" checked={formData.roles.herramientas === 'admin'} onChange={() => handleRoleChange('herramientas', 'admin')} />
                    <Form.Check inline type="radio" label="Usuario" name="herramientas" checked={formData.roles.herramientas === 'true'} onChange={() => handleRoleChange('herramientas', 'true')} />
                    <Form.Check inline type="radio" label="Sin acceso" name="herramientas" checked={formData.roles.herramientas === 'false'} onChange={() => handleRoleChange('herramientas', 'false')} />
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            {editingUser ? 'Actualizar' : 'Crear'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default UsuarioModal
