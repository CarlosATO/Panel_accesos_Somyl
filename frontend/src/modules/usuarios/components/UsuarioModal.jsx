import { useState, useEffect } from 'react'
import { Eye, EyeOff, Pencil, UserPlus, User, Lock, ShieldCheck } from 'lucide-react'
import { usuariosService } from '../usuariosService'

// ── DATIX Design System ──────────────────────────────────────────────────────
const COLORS = {
  bg:        '#3d1a6e',
  navBg:     '#2d1259',
  navActive: 'rgba(255,255,255,0.15)',
  cardOff:   'rgba(255,255,255,0.04)',
  border:    'rgba(255,255,255,0.12)',
  borderOff: 'rgba(255,255,255,0.05)',
  text:      '#ffffff',
  textDim:   'rgba(255,255,255,0.45)',
  accent:    '#a78bfa',
  danger:    '#f87171',
  success:   '#34d399',
}

function UsuarioModal({ show, onHide, onSave, editingUser, currentUserId }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    roles: {
      admin: false,
      billing: false,
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
          billing: editingUser.is_billing_admin || false,
          ordenes: String(editingUser.rol_ordenes || 'false'),
          flota: String(editingUser.rol_flota || 'false'),
          produccion: String(editingUser.rol_produccion || 'false'),
          logistica: String(editingUser.rol_logistica || 'false'),
          rrhh: String(editingUser.rol_rrhh || 'false')
        }
      });
      (async () => {
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
          billing: false,
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
    e.preventDefault();
    (async () => {
      const result = await onSave(formData)
      try {
        if (result && result.success) {
          const targetId = editingUser ? editingUser.id : (result.user && result.user.id)
          if (targetId) {
            await usuariosService.assignProjects(targetId, Array.from(selectedProjects))
          }
        }
      } catch (err) {
        console.error('Error:', err)
      }
    })()
  }

  const handleRoleChange = (role, value) => {
    setFormData(prev => ({
      ...prev,
      roles: { ...prev.roles, [role]: value }
    }))
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: COLORS.navBg,
        borderRadius: '16px',
        border: `1px solid ${COLORS.border}`,
        maxWidth: '600px',
        width: '90%',
        maxHeight: '85vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 24px',
          borderBottom: `1px solid ${COLORS.borderOff}`,
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(167, 139, 250, 0.15)',
              border: `1px solid rgba(167, 139, 250, 0.3)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.accent
            }}>
              {editingUser ? <Pencil size={18} /> : <UserPlus size={18} />}
            </div>
            <div>
              <h2 style={{ color: COLORS.text, fontSize: '16px', fontWeight: '700', margin: 0 }}>
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <p style={{ color: COLORS.textDim, fontSize: '12px', margin: '4px 0 0 0' }}>
                {editingUser ? 'Modifica los datos y permisos' : 'Completa los datos para crear usuario'}
              </p>
            </div>
          </div>
          <button
            onClick={onHide}
            style={{
              position: 'absolute',
              right: '16px',
              top: '16px',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: COLORS.textDim,
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = COLORS.text }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.textDim }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Información de Cuenta */}
          <div style={{
            background: COLORS.cardOff,
            border: `1px solid ${COLORS.borderOff}`,
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h3 style={{ color: COLORS.text, fontSize: '13px', fontWeight: '600', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={14} /> Información de Cuenta
            </h3>

            {/* Email */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', color: COLORS.textDim, fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                Correo Electrónico
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!!editingUser}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.08)',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: COLORS.text,
                  fontSize: '13px',
                  opacity: editingUser ? 0.6 : 1
                }}
                onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.12)'; e.target.style.borderColor = COLORS.accent }}
                onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = COLORS.border }}
              />
            </div>

            {/* Password - solo si es nuevo usuario */}
            {!editingUser && (
              <div>
                <label style={{ display: 'block', color: COLORS.textDim, fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Mínimo 8 caracteres"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.08)',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '8px',
                      padding: '10px 12px 10px 40px',
                      color: COLORS.text,
                      fontSize: '13px'
                    }}
                    onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.12)'; e.target.style.borderColor = COLORS.accent }}
                    onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = COLORS.border }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: COLORS.textDim,
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Permisos */}
          <div style={{
            background: COLORS.cardOff,
            border: `1px solid ${COLORS.borderOff}`,
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h3 style={{ color: COLORS.text, fontSize: '13px', fontWeight: '600', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={14} /> Permisos
            </h3>

            {/* Admin toggle */}
            <RoleToggle
              id="admin"
              label="Administrador del Sistema"
              hint="Acceso total a todas las funciones"
              checked={formData.roles.admin}
              disabled={editingUser && String(editingUser.id) === String(currentUserId)}
              onChange={v => handleRoleChange('admin', v)}
            />

            {/* Billing toggle */}
            <RoleToggle
              id="billing"
              label="Gestor de Facturación"
              hint="Puede ver precios y gestionar suscripciones"
              checked={formData.roles.billing}
              onChange={v => handleRoleChange('billing', v)}
            />

            {/* Módulos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
              {[
                { id: 'ordenes', label: 'Adquisiciones' },
                { id: 'flota', label: 'Control Flota' },
                { id: 'produccion', label: 'Construcción' },
                { id: 'logistica', label: 'Logística' },
                { id: 'rrhh', label: 'RRHH' },
              ].map(m => (
                <label key={m.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: formData.roles[m.id] === 'true' ? 'rgba(167, 139, 250, 0.15)' : COLORS.cardOff,
                  border: `1px solid ${formData.roles[m.id] === 'true' ? 'rgba(167, 139, 250, 0.3)' : COLORS.borderOff}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.roles[m.id] === 'true'}
                    onChange={e => handleRoleChange(m.id, e.target.checked ? 'true' : 'false')}
                    style={{ accentColor: COLORS.accent, width: '14px', height: '14px' }}
                  />
                  <span style={{ color: COLORS.text, fontSize: '13px', fontWeight: '500' }}>{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: `1px solid ${COLORS.borderOff}`, paddingTop: '16px' }}>
            <button
              type="button"
              onClick={onHide}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${COLORS.border}`,
                color: COLORS.textDim,
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                background: COLORS.accent,
                border: 'none',
                color: '#1a0a40',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}

// ── Toggle para permisos principales ──
function RoleToggle({ id, label, hint, checked, disabled, onChange }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 12px',
      marginBottom: '8px',
      borderRadius: '8px',
      background: checked ? 'rgba(167, 139, 250, 0.15)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${checked ? 'rgba(167, 139, 250, 0.3)' : 'rgba(255,255,255,0.08)'}`,
      transition: 'all 0.2s'
    }}>
      <div>
        <div style={{ color: COLORS.text, fontSize: '13px', fontWeight: '500' }}>{label}</div>
        {hint && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{hint}</div>}
      </div>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={e => onChange(e.target.checked)}
        style={{
          width: '18px',
          height: '18px',
          accentColor: COLORS.accent,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1
        }}
      />
    </div>
  )
}

export default UsuarioModal
