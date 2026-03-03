import { useState, useEffect } from 'react'
import { Modal, Form } from 'react-bootstrap'
import { Eye, EyeOff, Pencil, UserPlus, User, Mail, Lock, ShieldCheck, Building2, Truck, Package, Receipt, Users, Check, Plus, Info, LayoutGrid } from 'lucide-react'
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
      logistica: 'false',
      rrhh: 'false'
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
          logistica: String(editingUser.rol_logistica || 'false'),
          rrhh: String(editingUser.rol_rrhh || 'false')
        }
      })
        ; (async () => {
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
          logistica: 'false',
          rrhh: 'false'
        }
      })
    }
    setShowPassword(false)
  }, [editingUser, show])

  const handleSubmit = (e) => {
    e.preventDefault()
      ; (async () => {
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
    { key: 'ordenes', name: 'Adquisiciones', Icon: Receipt, accent: 'rgba(20,184,166,0.12)', accentBorder: 'rgba(20,184,166,0.25)', accentColor: '#2dd4bf' },
    { key: 'flota', name: 'Control Flota', Icon: Truck, accent: 'rgba(6,182,212,0.12)', accentBorder: 'rgba(6,182,212,0.25)', accentColor: '#22d3ee' },
    { key: 'produccion', name: 'Construcción', Icon: Building2, accent: 'rgba(124,58,237,0.12)', accentBorder: 'rgba(124,58,237,0.25)', accentColor: '#a78bfa' },
    { key: 'logistica', name: 'Logística', Icon: Package, accent: 'rgba(245,158,11,0.12)', accentBorder: 'rgba(245,158,11,0.25)', accentColor: '#fbbf24' },
    { key: 'rrhh', name: 'Recursos Humanos', Icon: Users, accent: 'rgba(236,72,153,0.12)', accentBorder: 'rgba(236,72,153,0.25)', accentColor: '#f472b6' }
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
    <>
      <style>{`
        .modal-dark .modal-content {
          background: #18181b;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
        }
        .modal-dark .modal-body { max-height: 70vh; overflow-y: auto; }
        .modal-dark .modal-body::-webkit-scrollbar { width: 5px; }
        .modal-dark .modal-body::-webkit-scrollbar-track { background: transparent; }
        .modal-dark .modal-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        .modal-dark input.form-control,
        .modal-dark input.form-control:focus {
          background: rgba(10,10,11,0.9) !important;
          border-color: rgba(255,255,255,0.1) !important;
          color: #d4d4d8 !important;
          box-shadow: none !important;
        }
        .modal-dark input.form-control::placeholder { color: #52525b !important; }
        .modal-dark .input-group-text-dark {
          background: rgba(10,10,11,0.9);
          border-color: rgba(255,255,255,0.1);
          color: #52525b;
        }
        .modal-dark .form-check-input {
          background-color: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
        }
        .modal-dark .form-check-input:checked {
          background-color: #0ea5e9;
          border-color: #0ea5e9;
        }
        .modal-backdrop { opacity: 0.75 !important; }
      `}</style>

      <Modal
        show={show}
        onHide={onHide}
        size="lg"
        centered
        backdrop="static"
        dialogClassName="modal-dark"
      >
        <Form onSubmit={handleSubmit}>
          {/* Header */}
          <Modal.Header
            className="border-0 pb-0"
            style={{ padding: '24px 24px 16px', background: 'transparent' }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: editingUser ? 'rgba(245,158,11,0.1)' : 'rgba(14,165,233,0.1)',
                  border: editingUser ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(14,165,233,0.25)',
                  color: editingUser ? '#fbbf24' : '#38bdf8'
                }}
              >
                {editingUser
                  ? <Pencil size={18} strokeWidth={1.5} />
                  : <UserPlus size={18} strokeWidth={1.5} />
                }
              </div>
              <div>
                <h5 className="mb-0" style={{ fontWeight: '700', color: '#f4f4f5' }}>
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h5>
                <p className="mb-0" style={{ fontSize: '12px', color: '#71717a' }}>
                  {editingUser ? 'Modifica los datos y permisos del usuario' : 'Completa los datos para crear un nuevo usuario'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onHide}
              style={{
                position: 'absolute',
                right: '20px',
                top: '20px',
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: '#71717a',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                lineHeight: 1
              }}
            >
              ✕
            </button>
          </Modal.Header>

          <Modal.Body style={{ padding: '24px' }}>
            {/* Datos básicos */}
            <div
              className="p-4 mb-4"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.07)'
              }}
            >
              <h6 className="mb-3 d-flex align-items-center gap-2" style={{ color: '#a1a1aa', fontWeight: '600', fontSize: '13px' }}>
                <User size={14} strokeWidth={1.5} />
                Información de Cuenta
              </h6>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" style={{ fontWeight: '500', fontSize: '12px', color: '#71717a', marginBottom: '6px' }}>
                    Correo electrónico
                  </label>
                  <div className="input-group">
                    <span
                      className="input-group-text"
                      style={{
                        background: 'rgba(10,10,11,0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRight: 'none',
                        color: '#52525b'
                      }}
                    >
                      <Mail size={14} strokeWidth={1.5} />
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      placeholder="usuario@empresa.com"
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      style={{
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderLeft: 'none',
                        padding: '10px 14px',
                        fontSize: '13px',
                        background: 'rgba(10,10,11,0.9)',
                        color: '#d4d4d8'
                      }}
                    />
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label" style={{ fontWeight: '500', fontSize: '12px', color: '#71717a', marginBottom: '6px' }}>
                    Contraseña{' '}
                    {editingUser && <span style={{ color: '#3f3f46', fontWeight: '400' }}>(dejar vacío para mantener)</span>}
                  </label>
                  <div className="input-group">
                    <span
                      className="input-group-text"
                      style={{
                        background: 'rgba(10,10,11,0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRight: 'none',
                        color: '#52525b'
                      }}
                    >
                      <Lock size={14} strokeWidth={1.5} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      value={formData.password}
                      placeholder={editingUser ? '••••••••' : 'Mínimo 8 caracteres'}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                      style={{
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderLeft: 'none',
                        borderRight: 'none',
                        padding: '10px 14px',
                        fontSize: '13px',
                        background: 'rgba(10,10,11,0.9)',
                        color: '#d4d4d8'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        background: 'rgba(10,10,11,0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderLeft: 'none',
                        color: '#52525b',
                        cursor: 'pointer',
                        padding: '0 12px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Superusuario */}
            <div
              className="p-4 mb-4"
              style={{
                background: formData.roles.admin ? 'rgba(14,165,233,0.06)' : 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: formData.roles.admin ? '1px solid rgba(14,165,233,0.2)' : '1px solid rgba(255,255,255,0.07)',
                transition: 'all 0.2s ease'
              }}
            >
              <div className="d-flex align-items-start gap-3">
                <div className="form-check form-switch" style={{ paddingLeft: '0' }}>
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
                      color: '#e4e4e7',
                      cursor: isSelf ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    <ShieldCheck size={14} strokeWidth={1.5} style={{ color: '#38bdf8' }} />
                    Superusuario
                  </label>
                  <p className="mb-0" style={{ fontSize: '12px', color: '#71717a' }}>
                    Acceso completo al panel de administración y gestión de usuarios
                  </p>
                  {isSelf && (
                    <div className="mt-2 d-flex align-items-center gap-2" style={{ fontSize: '11px', color: '#fbbf24' }}>
                      <Info size={11} strokeWidth={1.5} />
                      No puedes modificar tu propio rol de superusuario
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Permisos de aplicaciones */}
            <div>
              <h6 className="mb-3 d-flex align-items-center gap-2" style={{ color: '#a1a1aa', fontWeight: '600', fontSize: '13px' }}>
                <LayoutGrid size={14} strokeWidth={1.5} />
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
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.07)'
                        }}
                      >
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <div
                            className="d-flex align-items-center justify-content-center"
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '8px',
                              background: app.accent,
                              border: `1px solid ${app.accentBorder}`,
                              color: app.accentColor
                            }}
                          >
                            <app.Icon size={14} strokeWidth={1.5} />
                          </div>
                          <span style={{ fontWeight: '600', color: '#d4d4d8', fontSize: '13px' }}>
                            {app.name}
                          </span>
                        </div>

                        <div className="d-flex gap-2">
                          {[
                            { value: 'admin', label: 'Admin', activeBg: 'rgba(239,68,68,0.1)', activeColor: '#f87171', activeBorder: 'rgba(239,68,68,0.25)' },
                            { value: 'true', label: 'Usuario', activeBg: 'rgba(34,197,94,0.1)', activeColor: '#4ade80', activeBorder: 'rgba(34,197,94,0.25)' },
                            { value: 'false', label: 'Sin acceso', activeBg: 'rgba(255,255,255,0.06)', activeColor: '#a1a1aa', activeBorder: 'rgba(255,255,255,0.12)' }
                          ].map(option => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleRoleChange(app.key, option.value)}
                              style={{
                                flex: 1,
                                padding: '7px 4px',
                                borderRadius: '8px',
                                border: currentValue === option.value
                                  ? `1.5px solid ${option.activeBorder}`
                                  : '1.5px solid rgba(255,255,255,0.07)',
                                background: currentValue === option.value
                                  ? option.activeBg
                                  : 'transparent',
                                color: currentValue === option.value
                                  ? option.activeColor
                                  : '#3f3f46',
                                fontSize: '11px',
                                fontWeight: currentValue === option.value ? '600' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
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
              <h6 className="mb-3 d-flex align-items-center gap-2" style={{ color: '#a1a1aa', fontWeight: '600', fontSize: '13px' }}>
                <Building2 size={14} strokeWidth={1.5} />
                Accesos a Construcción
              </h6>
              {loadingProjects ? (
                <div style={{ color: '#52525b', fontSize: '13px' }}>Cargando proyectos...</div>
              ) : (
                <div className="row g-2">
                  {projects.length === 0 ? (
                    <div className="col-12" style={{ color: '#52525b', fontSize: '13px' }}>No hay proyectos disponibles</div>
                  ) : projects.map(p => (
                    <div key={p.id} className="col-md-6">
                      <label
                        htmlFor={`proj-${p.id}`}
                        className="d-flex align-items-center gap-2 p-3"
                        style={{
                          background: selectedProjects.has(p.id) ? 'rgba(14,165,233,0.06)' : 'rgba(255,255,255,0.03)',
                          borderRadius: '8px',
                          border: selectedProjects.has(p.id) ? '1px solid rgba(14,165,233,0.2)' : '1px solid rgba(255,255,255,0.07)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          className="form-check-input m-0"
                          type="checkbox"
                          checked={selectedProjects.has(p.id)}
                          onChange={() => toggleProject(p.id)}
                          id={`proj-${p.id}`}
                        />
                        <span style={{ fontSize: '13px', color: '#d4d4d8', fontWeight: '500' }}>{p.proyecto || p.nombre || `#${p.id}`}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Modal.Body>

          {/* Footer */}
          <Modal.Footer
            className="border-0"
            style={{ padding: '16px 24px 24px', gap: '10px', background: 'transparent', borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <button
              type="button"
              onClick={onHide}
              style={{
                padding: '10px 22px',
                borderRadius: '10px',
                fontWeight: '500',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: '#a1a1aa',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.15s ease'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 28px',
                borderRadius: '10px',
                fontWeight: '600',
                border: 'none',
                background: '#0ea5e9',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(14,165,233,0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              {editingUser ? (
                <><Check size={14} strokeWidth={2} /> Guardar Cambios</>
              ) : (
                <><Plus size={14} strokeWidth={2} /> Crear Usuario</>
              )}
            </button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default UsuarioModal