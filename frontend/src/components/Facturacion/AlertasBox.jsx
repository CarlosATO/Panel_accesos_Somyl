import { useState, useEffect } from 'react'
import { Bell, X, CheckCircle2, AlertCircle } from 'lucide-react'

const COLORS = {
  bg:        '#3d1a6e',
  cardOn:    'rgba(255,255,255,0.12)',
  border:    'rgba(255,255,255,0.12)',
  text:      '#ffffff',
  textDim:   'rgba(255,255,255,0.45)',
  accent:    '#a78bfa',
  danger:    '#f87171',
  success:   '#4ade80',
}

function AlertasBox({ user, onMarkRead }) {
  const [alertas, setAlertas] = useState([])
  const [showPanel, setShowPanel] = useState(false)
  const [loading, setLoading] = useState(false)

  // Cargar alertas al abrir el panel
  useEffect(() => {
    if (showPanel) {
      fetchAlertas()
    }
  }, [showPanel])

  const fetchAlertas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/billing/alertas', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setAlertas(data.alertas || [])
      }
    } catch (err) {
      console.error('Error cargando alertas:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (alertaId) => {
    try {
      const response = await fetch(`/api/billing/alertas/${alertaId}/marcar-leida`, {
        method: 'PUT',
        credentials: 'include'
      })
      if (response.ok) {
        // Remover alerta de la lista
        setAlertas(alertas.filter(a => a.id !== alertaId))
        onMarkRead?.()
      }
    } catch (err) {
      console.error('Error marcando alerta:', err)
    }
  }

  const unreadCount = alertas.length

  return (
    <div style={{ position: 'relative' }}>
      {/* ── Botón de Alertas ────────────────────────────────────────────────── */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          color: COLORS.text,
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            backgroundColor: COLORS.danger,
            color: COLORS.text,
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {unreadCount}
          </div>
        )}
      </button>

      {/* ── Panel de Alertas ────────────────────────────────────────────────── */}
      {showPanel && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          backgroundColor: COLORS.bg,
          border: '1px solid ' + COLORS.border,
          borderRadius: '8px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          minWidth: '320px',
          maxWidth: '400px',
          zIndex: 1000,
          marginTop: '10px'
        }}>
          {/* ── Header ───────────────────────────────────────────────────── */}
          <div style={{
            padding: '15px',
            borderBottom: '1px solid ' + COLORS.border,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Alertas</h3>
            <button
              onClick={() => setShowPanel(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: COLORS.text,
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Contenido ────────────────────────────────────────────────── */}
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: COLORS.textDim }}>
                Cargando...
              </div>
            ) : unreadCount === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: COLORS.textDim }}>
                ✅ No tienes alertas nuevas
              </div>
            ) : (
              alertas.map((alerta) => (
                <div key={alerta.id} style={{
                  padding: '15px',
                  borderBottom: '1px solid ' + COLORS.border,
                  display: 'flex',
                  gap: '12px'
                }}>
                  <div style={{ marginTop: '2px' }}>
                    {alerta.tipo_alerta === 'FACTURACION_PENDIENTE' ? (
                      <AlertCircle size={20} color={COLORS.danger} />
                    ) : (
                      <CheckCircle2 size={20} color={COLORS.success} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', lineHeight: '1.4', marginBottom: '8px' }}>
                      {alerta.mensaje}
                    </p>
                    <p style={{ fontSize: '11px', color: COLORS.textDim }}>
                      {new Date(alerta.fecha_alerta).toLocaleString('es-CL')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleMarkAsRead(alerta.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: COLORS.accent,
                      cursor: 'pointer',
                      padding: '4px',
                      fontSize: '12px'
                    }}
                  >
                    ✓
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AlertasBox
