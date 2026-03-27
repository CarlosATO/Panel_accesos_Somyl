import { useState } from 'react'
import { X, Lock, Save, AlertCircle } from 'lucide-react'

const COLORS = {
  navBg: '#2d1259',
  cardOn: 'rgba(255,255,255,0.12)',
  border: 'rgba(255,255,255,0.12)',
  text: '#ffffff',
  textDim: 'rgba(255,255,255,0.45)',
  accent: '#a78bfa',
  danger: '#f87171',
  success: '#34d399'
}

function ChangePasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden')
      return
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: new_password
        }),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('¡Contraseña cambiada exitosamente!')
        setTimeout(() => onClose(), 2000)
      } else {
        setError(data.error || 'Error al cambiar la contraseña')
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      padding: '20px'
    }} onClick={onClose}>
      
      <div style={{
        background: '#2d1259',
        border: `1px solid ${COLORS.border}`,
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        padding: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={20} style={{ color: COLORS.accent }} />
            <h2 style={{ color: COLORS.text, fontSize: '18px', fontWeight: '600', margin: 0 }}>Cambiar Contraseña</h2>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: COLORS.textDim, 
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: COLORS.textDim, fontSize: '12px', marginBottom: '6px' }}>
              Contraseña Actual
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
              placeholder="••••••••"
            />
          </div>

          {/* New Password */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: COLORS.textDim, fontSize: '12px', marginBottom: '6px' }}>
              Nueva Contraseña
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {/* Confirm New Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: COLORS.textDim, fontSize: '12px', marginBottom: '6px' }}>
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
              placeholder="Confirmar"
            />
          </div>

          {/* Messages */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: COLORS.danger,
              fontSize: '13px',
              marginBottom: '16px',
              padding: '10px',
              background: 'rgba(248,113,113,0.1)',
              borderRadius: '8px'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: COLORS.success,
              fontSize: '13px',
              marginBottom: '16px',
              padding: '10px',
              background: 'rgba(52,211,153,0.1)',
              borderRadius: '8px'
            }}>
              <AlertCircle size={16} />
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: COLORS.accent,
              color: COLORS.navBg,
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'opacity 0.2s',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <div className="spinner-border spinner-border-sm" role="status" />
            ) : (
              <>
                <Save size={18} />
                Guardar Cambios
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  )
}

export default ChangePasswordModal
