import { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'

function UsuarioModal({ show, onHide, onSave, editingUser, currentUserId }) {
  // Estado del formulario de usuario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    roles: {
      admin: false,
      ordenes: 'false',
      fibra: 'false',
      flota: 'false',
      herramientas: 'false',
      logistica: 'false',
      produccion: 'false'
    }
  })
  const [showPassword, setShowPassword] = useState(false)

  // Estados para la gestión de proyectos (Producción)
  const [projects, setProjects] = useState([]) // Todos los proyectos disponibles
  const [selectedProjects, setSelectedProjects] = useState([]) // IDs seleccionados
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [isSaving, setIsSaving] = useState(false) // Nuevo estado para bloquear el botón mientras guarda

  // 1. Cargar datos del usuario al abrir modal
  useEffect(() => {
    if (editingUser) {
      setFormData({
        email: editingUser.email,
        password: '',
        roles: {
          admin: editingUser.is_superuser || editingUser.rol_admin || false,
          ordenes: String(editingUser.rol_ordenes || 'false'),
          fibra: String(editingUser.rol_fibra || 'false'),
          flota: String(editingUser.rol_flota || 'false'),
          herramientas: String(editingUser.rol_herramientas || 'false'),
          logistica: String(editingUser.rol_logistica || 'false'),
          produccion: String(editingUser.rol_produccion || 'false')
        }
      })
      // Si ya viene con rol de usuario, cargar sus proyectos
      if (String(editingUser.rol_produccion) === 'true' || String(editingUser.rol_produccion) === 'usuario') {
        fetchUserProjects(editingUser.id)
      } else {
        setSelectedProjects([])
      }
    } else {
      // Usuario Nuevo
      setFormData({
        email: '',
        password: '',
        roles: {
          admin: false,
          ordenes: 'false',
          fibra: 'false',
          flota: 'false',
          herramientas: 'false',
          logistica: 'false',
          produccion: 'false'
        }
      })
      setSelectedProjects([])
    }
    setShowPassword(false)
    setIsSaving(false)
  }, [editingUser, show])

  // 2. Cargar lista maestra de proyectos (Solo si es necesario)
  useEffect(() => {
    // Si el modal está abierto y el rol seleccionado es 'usuario'/'true', cargamos la lista
    if (show && (formData.roles.produccion === 'true' || formData.roles.produccion === 'usuario')) {
      fetchAllProjects()
    }
  }, [show, formData.roles.produccion])

  // --- FUNCIONES DE API PARA PROYECTOS ---

  const fetchAllProjects = async () => {
    try {
      setLoadingProjects(true)
      const response = await fetch('/api/proyectos', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Error cargando proyectos:", error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const fetchUserProjects = async (userId) => {
    try {
      const response = await fetch(`/api/mis-accesos/${userId}`, { credentials: 'include' })
      if (response.ok) {
        const ids = await response.json()
        setSelectedProjects(ids)
      }
    } catch (error) {
      console.error("Error cargando permisos:", error)
    }
  }

  // Modificado para que retorne una Promesa y lance error si falla
  const saveProjectPermissions = async (userId, projectIds) => {
    console.log(`💾 Enviando permisos a Python. Usuario: ${userId}, Proyectos: ${projectIds}`);
    const response = await fetch('/api/admin/asignar-proyectos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        proyectos_ids: projectIds
      }),
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor al guardar proyectos')
    }
    console.log("✅ Permisos guardados correctamente en BD");
  }

  // --- MANEJADORES DE EVENTOS ---

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true) // Bloqueamos botones para evitar doble click

    try {
      // 1. CRUCIAL: Primero guardamos los proyectos (Si estamos editando y es usuario de producción)
      const shouldSaveProjects = editingUser && (formData.roles.produccion === 'true' || formData.roles.produccion === 'usuario');

      if (shouldSaveProjects) {
         // Esperamos explícitamente a que esto termine antes de seguir
         await saveProjectPermissions(editingUser.id, selectedProjects)
      }

      // 2. Si los proyectos se guardaron bien (o no era necesario), guardamos el usuario
      // Esta función (onSave) es la que cierra el modal al final
      await onSave(formData)

    } catch (error) {
      console.error("❌ Error grave al guardar:", error)
      alert("Hubo un error al guardar los permisos. Verifica que el servidor Python esté corriendo.")
      setIsSaving(false) // Desbloqueamos si hubo error
    }
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

  const handleProjectToggle = (projectId) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId)
      } else {
        return [...prev, projectId]
      }
    })
  }

  const handleSelectAllProjects = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([])
    } else {
      setSelectedProjects(projects.map(p => p.id))
    }
  }

  const apps = [
    { key: 'ordenes', name: 'Órdenes de Pago', icon: 'bi-receipt-cutoff', color: '#0d9488' },
    { key: 'fibra', name: 'Gestión Fibra', icon: 'bi-diagram-3', color: '#14b8a6' },
    { key: 'flota', name: 'Control Flota', icon: 'bi-truck', color: '#06b6d4' },
    { key: 'logistica', name: 'Logística', icon: 'bi-box-seam', color: '#f59e0b' },
    { key: 'produccion', name: 'Producción', icon: 'bi-hammer', color: '#fb923c' },
    { key: 'herramientas', name: 'Herramientas', icon: 'bi-tools', color: '#64748b' }
  ]

  const isSelf = editingUser && String(editingUser.id) === String(currentUserId)
  const showProjectSelector = (formData.roles.produccion === 'true' || formData.roles.produccion === 'usuario')

  return (
    <Modal 
      show={show} 
      onHide={!isSaving ? onHide : undefined} // Evita cerrar si está guardando
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
            disabled={isSaving}
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
                  <span className="input-group-text" style={{ background: 'white', borderRight: 'none', color: '#94a3b8' }}>
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isSaving}
                    style={{ borderLeft: 'none' }}
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label" style={{ fontWeight: '500', fontSize: '13px', color: '#374151' }}>
                  Contraseña {editingUser && <span style={{ color: '#94a3b8', fontWeight: '400' }}>(dejar vacío para mantener)</span>}
                </label>
                <div className="input-group">
                  <span className="input-group-text" style={{ background: 'white', borderRight: 'none', color: '#94a3b8' }}>
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    value={formData.password}
                    placeholder={editingUser ? '••••••••' : 'Mínimo 8 caracteres'}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    disabled={isSaving}
                    style={{ borderLeft: 'none', borderRight: 'none' }}
                  />
                  <button
                    type="button"
                    className="input-group-text"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSaving}
                    style={{ background: 'white', borderLeft: 'none', cursor: 'pointer' }}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Superusuario */}
          <div className="p-4 mb-4" style={{ background: formData.roles.admin ? '#f0fdfa' : '#f8fafc', borderRadius: '12px', border: formData.roles.admin ? '1px solid #99f6e4' : '1px solid #e2e8f0' }}>
            <div className="d-flex align-items-start gap-3">
              <div className="form-check form-switch" style={{ paddingLeft: '0' }}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="superuser-switch"
                  checked={!!formData.roles.admin}
                  disabled={isSelf || isSaving}
                  onChange={(e) => handleRoleChange('admin', e.target.checked)}
                  style={{ width: '44px', height: '24px', cursor: isSelf || isSaving ? 'not-allowed' : 'pointer', marginLeft: 0 }}
                />
              </div>
              <div className="flex-grow-1">
                <label htmlFor="superuser-switch" className="form-check-label d-flex align-items-center gap-2 mb-1" style={{ fontWeight: '600', color: '#0f172a' }}>
                  Superusuario
                </label>
                <p className="mb-0 text-muted" style={{ fontSize: '13px' }}>Acceso completo al panel de administración.</p>
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
                    <div className="p-3 h-100" style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <div className="d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', borderRadius: '8px', background: app.color, color: 'white' }}>
                          <i className={`bi ${app.icon}`}></i>
                        </div>
                        <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>{app.name}</span>
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
                            disabled={isSaving}
                            style={{
                              background: currentValue === option.value ? option.bg : 'white',
                              color: currentValue === option.value ? option.color : '#94a3b8',
                              border: `1.5px solid ${currentValue === option.value ? option.border : '#e2e8f0'}`,
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: currentValue === option.value ? '600' : '500'
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

          {/* --- SECCIÓN NUEVA: ASIGNACIÓN DE PROYECTOS --- */}
          {editingUser && showProjectSelector && (
            <div className="mt-4 pt-4 border-top">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="mb-0 d-flex align-items-center gap-2" style={{ color: '#fb923c', fontWeight: '700' }}>
                  <i className="bi bi-hammer"></i>
                  Acceso a Proyectos (Producción)
                </h6>
                <button 
                  type="button" 
                  className="btn btn-sm btn-link text-decoration-none"
                  onClick={handleSelectAllProjects}
                  disabled={isSaving}
                  style={{ fontSize: '13px', color: '#fb923c' }}
                >
                  {selectedProjects.length === projects.length ? 'Desmarcar todos' : 'Marcar todos'}
                </button>
              </div>

              {loadingProjects ? (
                <div className="text-center py-3 text-muted">Cargando proyectos...</div>
              ) : projects.length === 0 ? (
                <div className="alert alert-warning">No hay proyectos disponibles en el sistema.</div>
              ) : (
                <div 
                  className="p-3" 
                  style={{ 
                    background: '#fff7ed', 
                    borderRadius: '12px', 
                    border: '1px solid #ffedd5',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}
                >
                  <div className="row g-2">
                    {projects.map(project => (
                      <div className="col-md-6" key={project.id}>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`proj-${project.id}`}
                            checked={selectedProjects.includes(project.id)}
                            onChange={() => handleProjectToggle(project.id)}
                            disabled={isSaving}
                            style={{ cursor: 'pointer', borderColor: '#fdba74' }}
                          />
                          <label 
                            className="form-check-label" 
                            htmlFor={`proj-${project.id}`}
                            style={{ fontSize: '13px', color: '#431407', cursor: 'pointer' }}
                          >
                            {project.proyecto}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="form-text mt-2">
                <i className="bi bi-info-circle me-1"></i>
                Selecciona los proyectos que este usuario podrá ver y gestionar.
              </div>
            </div>
          )}

          {!editingUser && showProjectSelector && (
            <div className="mt-4 alert alert-info">
              <i className="bi bi-info-circle-fill me-2"></i>
              Para asignar proyectos específicos, primero crea el usuario y luego edítalo.
            </div>
          )}

        </Modal.Body>

        {/* Footer */}
        <Modal.Footer className="border-0" style={{ padding: '16px 24px 24px', gap: '12px' }}>
          <Button 
            variant="light" 
            onClick={onHide} 
            disabled={isSaving}
            style={{ padding: '12px 24px', borderRadius: '10px' }}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={isSaving}
            style={{
              background: editingUser ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' : 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '10px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              opacity: isSaving ? 0.7 : 1
            }}
          >
            {isSaving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Guardando...
              </>
            ) : (
              editingUser ? <><i className="bi bi-check-lg me-2"></i>Guardar Cambios</> : <><i className="bi bi-plus-lg me-2"></i>Crear Usuario</>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default UsuarioModal