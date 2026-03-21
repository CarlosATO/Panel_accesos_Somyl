import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Navbar'
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Send, LogOut, FileText } from 'lucide-react'

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

function FacturacionUsuario({ user, onLogout }) {
  const navigate = useNavigate()
  const [empresa, setEmpresa] = useState(null)
  const [solicitudes, setSolicitudes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showSolicitudes, setShowSolicitudes] = useState(false)
  const [selectedTipo, setSelectedTipo] = useState('FACTURA_ELECTRONICA')
  const [monto, setMonto] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const rut = '76.002.581-K' // RUT SOMYL

  // Opciones de pago disponibles
  const opcionesPago = [
    {
      id: 'LIQUIDACION',
      nombre: 'Directo por liquidación de Sueldo',
      monto: 500000,
      moneda: 'CLP',
      descripcion: 'Se debe agregar  mensualmente  como empleado de SOMYL',
      icono: '💰'
    },
    {
      id: 'FACTURA_ELECTRONICA',
      nombre: 'Factura Electrónica',
      monto: '15 UF',
      moneda: '+ IVA (~$733.000)',
      descripcion: 'Factura electrónica. Solicita el trámite con nosotros.',
      icono: '📄',
      solicitable: true
    },
    {
      id: 'TRANSFERENCIA',
      nombre: 'Transferencia Bancaria',
      monto: 500000,
      moneda: 'CLP',
      descripcion: 'Transferencia directa a cuenta de Carlos Alegria, sin factura',
      icono: '🏦'
    }
  ]

  // Cargar datos
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

        // Cargar solicitudes
        const solResp = await fetch('/api/billing/solicitudes', { credentials: 'include' })
        if (solResp.ok) {
          const solData = await solResp.json()
          setSolicitudes(solData.solicitudes || [])
        }
      } catch (err) {
        setError('Error cargando datos: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Enviar solicitud de facturación
  const handleSolicitar = async () => {
    try {
      setSaving(true)
      setError('')

      const response = await fetch('/api/billing/solicitar-facturacion', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: empresa.empresa_id,
          tipo_solicitud: selectedTipo,
          monto_solicitado: monto ? parseFloat(monto) : null
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setShowModal(false)
        setSelectedTipo('FACTURA_ELECTRONICA')
        setMonto('')
        
        // Recargar solicitudes
        const solResp = await fetch('/api/billing/solicitudes', { credentials: 'include' })
        if (solResp.ok) {
          const solData = await solResp.json()
          setSolicitudes(solData.solicitudes || [])
        }

        // Limpiar success después de 5 segundos
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(data.error || 'Error enviando solicitud')
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

        {/* ── Card: Estado Actual ────────────────────────────────────────── */}
        {empresa && (
          <div style={{
            backgroundColor: COLORS.cardOn,
            border: '1px solid ' + COLORS.border,
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '25px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Estado de Suscripción</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: empresa.estado === 'ACTIVA' ? COLORS.success : COLORS.danger
              }} />
              <span style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: empresa.estado === 'ACTIVA' ? COLORS.success : COLORS.danger
              }}>
                {empresa.estado === 'ACTIVA' ? '✅ ACTIVA - Plataforma funcionando' : '❌ VENCIDA - Acceso bloqueado'}
              </span>
            </div>
          </div>
        )}

        {/* ── Card: Opciones de Pago ────────────────────────────────────── */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>Opciones de Pago</h2>
            <p style={{ color: COLORS.textDim, fontSize: '16px' }}>Selecciona el método que más te acomode para tu suscripción</p>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '24px', 
            justifyContent: 'center',
            alignItems: 'stretch'
          }}>
            {opcionesPago.map((opcion) => (
              <div key={opcion.id} style={{
                backgroundColor: COLORS.cardOn,
                border: '1px solid ' + COLORS.border,
                borderRadius: '20px',
                padding: '32px',
                flex: '1',
                minWidth: '300px',
                maxWidth: '380px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)'
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)'
                e.currentTarget.style.borderColor = COLORS.accent
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'
                e.currentTarget.style.borderColor = COLORS.border
              }}
              >
                {/* Header */}
                <div style={{ 
                  fontSize: '48px', 
                  marginBottom: '20px',
                  background: 'rgba(255,255,255,0.05)',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {opcion.icono}
                </div>
                
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>{opcion.nombre}</h3>
                
                {/* Price */}
                <div style={{ marginBottom: '25px' }}>
                  <div style={{ 
                    fontSize: '32px', 
                    fontWeight: '800', 
                    color: COLORS.accent,
                    marginBottom: '5px' 
                  }}>
                     ${opcion.monto.toLocaleString ? opcion.monto.toLocaleString('es-CL') : opcion.monto}
                  </div>
                  <div style={{ fontSize: '14px', color: COLORS.textDim, fontWeight: '500' }}>
                     {opcion.moneda}
                  </div>
                </div>
                
                <div style={{ 
                  height: '1px', 
                  width: '100%', 
                  backgroundColor: COLORS.border, 
                  marginBottom: '25px' 
                }} />
                
                {/* Description */}
                <p style={{ 
                  color: COLORS.textDim, 
                  fontSize: '15px', 
                  lineHeight: '1.6', 
                  marginBottom: '30px',
                  flex: 1 
                }}>
                  {opcion.descripcion}
                </p>

                {/* Button */}
                {opcion.solicitable ? (
                  <button
                    onClick={() => {
                      setSelectedTipo(opcion.id)
                      setShowModal(true)
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: COLORS.accent,
                      color: COLORS.bg,
                      border: 'none',
                      padding: '14px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(167, 139, 250, 0.3)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Send size={18} /> Solicitar Factura
                  </button>
                ) : (
                  <div style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    color: COLORS.textDim,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: '1px solid ' + COLORS.border,
                    cursor: 'default'
                  }}>
                    Solo Informativo
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Card: Historial de Solicitudes ────────────────────────────── */}
        <div style={{
          backgroundColor: COLORS.cardOn,
          border: '1px solid ' + COLORS.border,
          borderRadius: '12px',
          padding: '25px'
        }}>
          <div
            onClick={() => setShowSolicitudes(!showSolicitudes)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: showSolicitudes ? '20px' : '0'
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Historial de Solicitudes</h2>
            {showSolicitudes ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>

          {showSolicitudes && (
            <div style={{ overflowX: 'auto' }}>
              {solicitudes.length === 0 ? (
                <div style={{ textAlign: 'center', color: COLORS.textDim, padding: '20px' }}>
                  No hay solicitudes registradas
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid ' + COLORS.border }}>
                      <th style={{ textAlign: 'left', padding: '10px', color: COLORS.textDim, fontSize: '12px' }}>Fecha</th>
                      <th style={{ textAlign: 'left', padding: '10px', color: COLORS.textDim, fontSize: '12px' }}>Tipo</th>
                      <th style={{ textAlign: 'left', padding: '10px', color: COLORS.textDim, fontSize: '12px' }}>Monto</th>
                      <th style={{ textAlign: 'left', padding: '10px', color: COLORS.textDim, fontSize: '12px' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((sol, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid ' + COLORS.borderOff }}>
                        <td style={{ padding: '10px', fontSize: '13px' }}>
                          {new Date(sol.fecha_solicitud).toLocaleDateString('es-CL')}
                        </td>
                        <td style={{ padding: '10px', fontSize: '13px' }}>{sol.tipo_solicitud}</td>
                        <td style={{ padding: '10px', fontSize: '13px' }}>
                          {sol.monto_solicitado ? `$${sol.monto_solicitado.toLocaleString('es-CL')}` : '-'}
                        </td>
                        <td style={{ padding: '10px', fontSize: '13px' }}>
                          <span style={{
                            backgroundColor: sol.estado === 'PENDIENTE' 
                              ? 'rgba(251,146,60,0.2)' 
                              : 'rgba(74,222,128,0.2)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: sol.estado === 'PENDIENTE' ? '#fb923c' : COLORS.success
                          }}>
                            {sol.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: Solicitud de Facturación ────────────────────────────────── */}
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
              📄 Confirmar Solicitud de Facturación
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: COLORS.textDim, marginBottom: '10px' }}>
                Estás a punto de solicitar una facturación electrónica.
              </p>
              <p style={{ color: COLORS.textDim, marginBottom: '15px' }}>
                <strong>Se contactarán contigo a través de email para coordinar.</strong>
              </p>
              <div style={{
                backgroundColor: COLORS.cardOff,
                border: '1px solid ' + COLORS.border,
                borderRadius: '8px',
                padding: '15px'
              }}>
                <p style={{ fontSize: '13px', color: COLORS.text, marginBottom: '8px' }}>
                  <strong>Contacto:</strong> Carlos Alegria
                </p>
                <p style={{ fontSize: '13px', color: COLORS.text }}>
                  <strong>Fono:</strong> 9 2081 7988
                </p>
              </div>
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
                onClick={handleSolicitar}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: COLORS.accent,
                  border: 'none',
                  color: COLORS.bg,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                {saving ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FacturacionUsuario
