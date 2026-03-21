import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Navbar'
import { AlertCircle, CheckCircle2, Clock, ChevronDown, ChevronUp, Edit2, LogOut } from 'lucide-react'

// ── DATIX Design System ──────────────────────────────────────────────────────
const COLORS = {
  bg:        '#3d1a6e',
  navBg:     '#2d1259',
  cardOn:    'rgba(255,255,255,0.12)',
  cardOff:   'rgba(255,255,255,0.04)',
  cardHover: 'rgba(255,255,255,0.20)',
  border:    'rgba(255,255,255,0.12)',
  text:      '#ffffff',
  textDim:   'rgba(255,255,255,0.45)',
  accent:    '#a78bfa',
  danger:    '#f87171',
  success:   '#4ade80',
}

function FacturacionPanel({ user, onLogout }) {
  const navigate = useNavigate()
  const [empresa, setEmpresa] = useState(null)
  const [auditoria, setAuditoria] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showAuditoria, setShowAuditoria] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState('VENCIDA')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const rut = '76.693.850-3' // RUT SOMYL - Hardcoded por ahora

  // ── Cargar datos de la empresa ────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/billing/company/${rut}`, { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setEmpresa(data)
        } else {
          setError('Error cargando datos de la empresa')
        }

        // Cargar auditoria
        const auditResp = await fetch('/api/billing/auditoria', { credentials: 'include' })
        if (auditResp.ok) {
          const auditData = await auditResp.json()
          setAuditoria(auditData.historial || [])
        }
      } catch (err) {
        setError('Error cargando datos: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // ── Cambiar estado de suscripción ─────────────────────────────────────────
  const handleChangeStatus = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const response = await fetch('/api/billing/change-status', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: empresa.empresa_id,
          nuevo_estado: nuevoEstado,
          motivo: motivo
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setEmpresa({ ...empresa, estado: nuevoEstado })
        setShowModal(false)
        setMotivo('')
        setNuevoEstado('VENCIDA')
        
        // Notificar al Dashboard que se actualizó el estado
        localStorage.setItem('subscriptionUpdated', JSON.stringify({
          timestamp: Date.now(),
          estado: nuevoEstado
        }))
        window.dispatchEvent(new Event('subscriptionStateChanged'))
        
        // Recargar auditoria
        const auditResp = await fetch('/api/billing/auditoria', { credentials: 'include' })
        if (auditResp.ok) {
          const auditData = await auditResp.json()
          setAuditoria(auditData.historial || [])
        }
      } else {
        setError(data.error || 'Error cambiando estado')
      }
    } catch (err) {
      setError('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: COLORS.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: COLORS.text, fontSize: '18px' }}>Cargando...</div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: COLORS.bg, minHeight: '100vh', color: COLORS.text }}>
      <Navbar user={user} currentTab="facturacion" onLogout={onLogout} />

      {/* ── Contenido Principal ────────────────────────────────────────────── */}
      <div style={{ padding: '30px 40px' }}>
        {error && (
          <div style={{
            backgroundColor: 'rgba(248,113,113,0.1)',
            border: '1px solid ' + COLORS.danger,
            color: COLORS.danger,
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: 'rgba(74,222,128,0.1)',
            border: '1px solid ' + COLORS.success,
            color: COLORS.success,
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <CheckCircle2 size={20} />
            {success}
          </div>
        )}

        {/* ── Card: Información de la Empresa ────────────────────────────── */}
        {empresa && (
          <div style={{
            backgroundColor: COLORS.cardOn,
            border: '1px solid ' + COLORS.border,
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '25px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Información de la Empresa</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ color: COLORS.textDim, fontSize: '12px' }}>RUT</label>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>{empresa.rut_empresa}</p>
              </div>
              <div>
                <label style={{ color: COLORS.textDim, fontSize: '12px' }}>Empresa</label>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>{empresa.nombre_empresa || 'SOMYL'}</p>
              </div>

              <div>
                <label style={{ color: COLORS.textDim, fontSize: '12px' }}>Estado Actual</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: empresa.estado === 'ACTIVA' ? COLORS.success : COLORS.danger
                  }} />
                  <span style={{ fontSize: '16px', fontWeight: '500', color: empresa.estado === 'ACTIVA' ? COLORS.success : COLORS.danger }}>
                    {empresa.estado}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ color: COLORS.textDim, fontSize: '12px' }}>Plan</label>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>{empresa.plan || 'Premium'}</p>
              </div>

              <div>
                <label style={{ color: COLORS.textDim, fontSize: '12px' }}>Precio Mensual</label>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>{empresa.precio_uf || 16} UF</p>
              </div>

              <div>
                <label style={{ color: COLORS.textDim, fontSize: '12px' }}>Vencimiento</label>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>
                  {empresa.fecha_vencimiento 
                    ? new Date(empresa.fecha_vencimiento).toLocaleDateString('es-CL') 
                    : 'No definido'}
                </p>
              </div>
            </div>

            {/* ── Botón Cambiar Estado ────────────────────────────────────── */}
            <button
              onClick={() => setShowModal(true)}
              style={{
                backgroundColor: COLORS.accent,
                color: COLORS.bg,
                border: 'none',
                padding: '12px 25px',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '20px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              <Edit2 size={16} /> Cambiar Estado
            </button>
          </div>
        )}

        {/* ── Card: Historial de Cambios ─────────────────────────────────── */}
        <div style={{
          backgroundColor: COLORS.cardOn,
          border: '1px solid ' + COLORS.border,
          borderRadius: '12px',
          padding: '25px'
        }}>
          <div
            onClick={() => setShowAuditoria(!showAuditoria)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: showAuditoria ? '20px' : '0'
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Historial de Cambios</h2>
            {showAuditoria ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>

          {showAuditoria && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid ' + COLORS.border }}>
                    <th style={{ textAlign: 'left', padding: '10px', color: COLORS.textDim, fontSize: '12px' }}>Fecha</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: COLORS.textDim, fontSize: '12px' }}>Usuario</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: COLORS.textDim, fontSize: '12px' }}>Estado Anterior</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: COLORS.textDim, fontSize: '12px' }}>Estado Nuevo</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: COLORS.textDim, fontSize: '12px' }}>Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {auditoria.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid ' + COLORS.borderOff }}>
                      <td style={{ padding: '10px', fontSize: '13px' }}>
                        {new Date(item.fecha_cambio).toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '10px', fontSize: '13px' }}>
                        {item.usuarios_sso?.email || 'Sistema'}
                      </td>
                      <td style={{ padding: '10px', fontSize: '13px' }}>
                        <span style={{
                          backgroundColor: 'rgba(248,113,113,0.2)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {item.estado_anterior}
                        </span>
                      </td>
                      <td style={{ padding: '10px', fontSize: '13px' }}>
                        <span style={{
                          backgroundColor: 'rgba(74,222,128,0.2)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {item.estado_nuevo}
                        </span>
                      </td>
                      <td style={{ padding: '10px', fontSize: '13px', color: COLORS.textDim }}>
                        {item.motivo || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: Cambiar Estado ──────────────────────────────────────────── */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: COLORS.bg,
            border: '1px solid ' + COLORS.border,
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
              ⚠️ Cambiar Estado de Suscripción
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: COLORS.textDim, fontSize: '12px', marginBottom: '8px' }}>
                Nuevo Estado
              </label>
              <select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: COLORS.cardOn,
                  border: '1px solid ' + COLORS.border,
                  borderRadius: '6px',
                  color: COLORS.text,
                  fontSize: '14px'
                }}
              >
                <option value="ACTIVA">ACTIVA</option>
                <option value="VENCIDA">VENCIDA</option>
                <option value="SUSPENDIDA">SUSPENDIDA</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: COLORS.textDim, fontSize: '12px', marginBottom: '8px' }}>
                Motivo (Opcional)
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Escribe el motivo del cambio..."
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: COLORS.cardOn,
                  border: '1px solid ' + COLORS.border,
                  borderRadius: '6px',
                  color: COLORS.text,
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: COLORS.cardOn,
                  border: '1px solid ' + COLORS.border,
                  color: COLORS.text,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleChangeStatus}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: COLORS.danger,
                  border: 'none',
                  color: COLORS.text,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                {saving ? 'Guardando...' : 'Cambiar Estado'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FacturacionPanel
