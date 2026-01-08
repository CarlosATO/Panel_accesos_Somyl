import { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { usuariosService } from '../usuariosService'

function UsuarioModal({ show, onHide, onSave, editingUser, currentUserId }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    roles: {
      admin: false,
      ordenes: 'false',
      flota: 'false',
      produccion: 'false',
      logistica: 'false'
    }
  })
  const [showPassword, setShowPassword] = useState(false)
  const [projects, setProjects] = useState([])
  const [selectedProjects, setSelectedProjects] = useState(new Set())
  const [loadingProjects, setLoadingProjects] = useState(false)

  useEffect(() => {
    if (editingUser) {
      setFormData({
        email: editingUser.email,
        password: '',
        roles: {
          admin: editingUser.is_superuser || editingUser.rol_admin || false,
          ordenes: String(editingUser.rol_ordenes || 'false'),
          flota: String(editingUser.rol_flota || 'false'),
          produccion: String(editingUser.rol_produccion || 'false'),
            logistica: String(editingUser.rol_logistica || 'false')
        }
      })
      ;(async () => {
        setLoadingProjects(true)
        try {
          const resp = await fetch('/api/proyectos', { credentials: 'include' })
          const proyectos = resp.ok ? await resp.json() : []
          setProjects(proyectos || [])

          const accesosResp = await fetch(`/api/mis-accesos/${editingUser.id}`, { credentials: 'include' })
          const accesos = accesosResp.ok ? await accesosResp.json() : []
          setSelectedProjects(new Set(accesos || []))
        } catch (e) {
          setProjects([])
          setSelectedProjects(new Set())
        } finally {
          setLoadingProjects(false)
        }
      })()
    } else {
      setFormData({
        email: '',
        password: '',
        roles: {
          admin: false,
          ordenes: 'false',
          flota: 'false',
          produccion: 'false',
            logistica: 'false'
        }
      })
    }
    setShowPassword(false)
  }, [editingUser, show])

  const handleSubmit = (e) => {
    e.preventDefault()
    ;(async () => {
      const result = await onSave(formData)
      try {
        if (result && result.success) {
          const targetId = editingUser ? editingUser.id : (result.user && result.user.id)
          if (targetId) {
            await usuariosService.assignProjects(targetId, Array.from(selectedProjects))
          }
        }
      } catch (err) {
        console.error('Error asignando proyectos:', err)
      }
    })()
  }

  const handleRoleChange = (role, value) => {
    setFormData(prev => ({
      ...prev,
      roles: {
        ...prev.roles,
        [role]: value
      }
    }))
  }

  const apps = [
    { key: 'ordenes', name: 'Órdenes de Pago', icon: 'bi-receipt-cutoff', color: '#0d9488' },
    { key: 'flota', name: 'Control Flota', icon: 'bi-truck', color: '#06b6d4' },
    { key: 'produccion', name: 'Construcción', icon: 'bi-buildings', color: '#7c3aed' },
    { key: 'logistica', name: 'Logística', icon: 'bi-box-seam', color: '#f59e0b' },
    
  ]

  const toggleProject = (pid) => {
    setSelectedProjects(prev => {
      const copy = new Set(prev)
      if (copy.has(pid)) copy.delete(pid)
      else copy.add(pid)
      return copy
    })
  }

  const isSelf = editingUser && String(editingUser.id) === String(currentUserId)

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg" 
      centered
      backdrop="static"
    >
      <Form onSubmit={handleSubmit}>
        {/* Header */}
        <Modal.Header 
          className="border-0 pb-0"
          style={{ padding: '24px 24px 16px' }}
        >
          <div className="d-flex align-items-center gap-3">
            <div 
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: editingUser 
                  ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
                  : 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                color: 'white',
                fontSize: '20px'
              }}
            >
              <i className={`bi ${editingUser ? 'bi-pencil' : 'bi-person-plus'}`}></i>
            </div>
            <div>
              <h5 className="mb-0" style={{ fontWeight: '700', color: '#0f172a' }}>
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h5>
              <p className="mb-0" style={{ fontSize: '13px', color: '#64748b' }}>
                {editingUser ? 'Modifica los datos y permisos del usuario' : 'Completa los datos para crear un nuevo usuario'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={onHide}
            style={{ position: 'absolute', right: '24px', top: '24px' }}
          ></button>
        </Modal.Header>

        <Modal.Body style={{ padding: '24px' }}>
          {/* Datos básicos */}
          <div 
            className="p-4 mb-4"
            style={{ 
              background: '#f8fafc', 
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}
          >
            <h6 className="mb-3 d-flex align-items-center gap-2" style={{ color: '#475569', fontWeight: '600' }}>
              <i className="bi bi-person"></i>
              Información de Cuenta
            </h6>
            
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label" style={{ fontWeight: '500', fontSize: '13px', color: '#374151' }}>
                  Correo electrónico
                </label>
                <div className="input-group">
                  <span 
                    className="input-group-text"
                    style={{ 
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRight: 'none',
                      color: '#94a3b8'
                    }}
                  >
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    placeholder="usuario@empresa.com"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{
                      border: '1px solid #e2e8f0',
                      borderLeft: 'none',
                      padding: '12px 16px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label" style={{ fontWeight: '500', fontSize: '13px', color: '#374151' }}>
                  Contraseña {editingUser && <span style={{ color: '#94a3b8', fontWeight: '400' }}>(dejar vacío para mantener)</span>}
                </label>
                <div className="input-group">
                  <span 
                    className="input-group-text"
                    style={{ 
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRight: 'none',
                      color: '#94a3b8'
                    }}
                  >
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    value={formData.password}
                    placeholder={editingUser ? '••••••••' : 'Mínimo 8 caracteres'}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderLeft: 'none',
                      borderRight: 'none',
                      padding: '12px 16px',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    type="button"
                    className="input-group-text"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ 
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderLeft: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Superusuario */}
          <div 
            className="p-4 mb-4"
            style={{ 
              background: formData.roles.admin ? '#f0fdfa' : '#f8fafc', 
              borderRadius: '12px',
              border: formData.roles.admin ? '1px solid #99f6e4' : '1px solid #e2e8f0',
              transition: 'all 0.2s'
            }}
          >
            <div className="d-flex align-items-start gap-3">
              <div 
                className="form-check form-switch"
                style={{ paddingLeft: '0' }}
              >
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="superuser-switch"
                  checked={!!formData.roles.admin}
                  disabled={isSelf}
                  onChange={(e) => handleRoleChange('admin', e.target.checked)}
                  style={{
                    width: '44px',
                    height: '24px',
                    cursor: isSelf ? 'not-allowed' : 'pointer',
                    marginLeft: 0
                  }}
                />
              </div>
              <div className="flex-grow-1">
                <label 
                  htmlFor="superuser-switch" 
                  className="form-check-label d-flex align-items-center gap-2 mb-1"
                  style={{ 
                    fontWeight: '600', 
                    color: '#0f172a',
                    cursor: isSelf ? 'not-allowed' : 'pointer'
                  }}
                >
                  <i className="bi bi-shield-check" style={{ color: '#0d9488' }}></i>
                  Superusuario
                </label>
                <p className="mb-0" style={{ fontSize: '13px', color: '#64748b' }}>
                  Acceso completo al panel de administración y gestión de usuarios
                </p>
                {isSelf && (
                  <div 
                    className="mt-2 d-flex align-items-center gap-2"
                    style={{ fontSize: '12px', color: '#f59e0b' }}
                  >
                    <i className="bi bi-info-circle"></i>
                    No puedes modificar tu propio rol de superusuario
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Permisos de aplicaciones */}
          <div>
            <h6 className="mb-3 d-flex align-items-center gap-2" style={{ color: '#475569', fontWeight: '600' }}>
              <i className="bi bi-grid"></i>
              Permisos de Aplicaciones
            </h6>
            
            <div className="row g-3">
              {apps.map(app => {
                const currentValue = String(formData.roles[app.key])
                return (
                  <div key={app.key} className="col-md-6">
                    <div 
                      className="p-3 h-100"
                      style={{ 
                        background: '#f8fafc', 
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <div
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: app.color,
                            color: 'white',
                            fontSize: '14px'
                          }}
                        >
                          <i className={`bi ${app.icon}`}></i>
                        </div>
                        <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>
                          {app.name}
                        </span>
                      </div>
                      
                      <div className="d-flex gap-2">
                        {[
                          { value: 'admin', label: 'Admin', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
                          { value: 'true', label: 'Usuario', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
                          { value: 'false', label: 'Sin acceso', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' }
                        ].map(option => (
                          <button
                            key={option.value}
                            type="button"
                            className="btn btn-sm flex-fill"
                            onClick={() => handleRoleChange(app.key, option.value)}
                            style={{
                              background: currentValue === option.value ? option.bg : 'white',
                              color: currentValue === option.value ? option.color : '#94a3b8',
                              border: `1.5px solid ${currentValue === option.value ? option.border : '#e2e8f0'}`,
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: currentValue === option.value ? '600' : '500',
                              padding: '8px 4px',
                              transition: 'all 0.2s'
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {/* Accesos a Construcción */}
          <div className="mt-4">
            <h6 className="mb-3 d-flex align-items-center gap-2" style={{ color: '#475569', fontWeight: '600' }}>
              <i className="bi bi-building"></i>
              Accesos a Construcción
            </h6>
            {loadingProjects ? (
              <div>Cargando proyectos...</div>
            ) : (
              <div className="row g-2">
                {projects.length === 0 ? (
                  <div className="col-12 text-muted">No hay proyectos disponibles</div>
                ) : projects.map(p => (
                  <div key={p.id} className="col-md-6">
                    <div className="form-check p-3" style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <input className="form-check-input" type="checkbox" checked={selectedProjects.has(p.id)} onChange={() => toggleProject(p.id)} id={`proj-${p.id}`} />
                      <label className="form-check-label ms-2" htmlFor={`proj-${p.id}`}>{p.proyecto || p.nombre || `#${p.id}`}</label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal.Body>

        {/* Footer */}
        <Modal.Footer 
          className="border-0"
          style={{ padding: '16px 24px 24px', gap: '12px' }}
        >
          <Button 
            variant="light" 
            onClick={onHide}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              fontWeight: '500',
              border: '1px solid #e2e8f0',
              color: '#475569'
            }}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            style={{
              background: editingUser 
                ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
                : 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '10px',
              fontWeight: '600',
              boxShadow: editingUser 
                ? '0 4px 12px rgba(245, 158, 11, 0.3)'
                : '0 4px 12px rgba(13, 148, 136, 0.3)'
            }}
          >
            {editingUser ? (
              <>
                <i className="bi bi-check-lg me-2"></i>
                Guardar Cambios
              </>
            ) : (
              <>
                <i className="bi bi-plus-lg me-2"></i>
                Crear Usuario
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default UsuarioModal