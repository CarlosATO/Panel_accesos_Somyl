import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login({ setUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // DATIX CORPORATE IDENTITY - Nuevo tema púrpura
  const brandPurple = '#a78bfa'   // Púrpura claro acento
  const brandDark = '#2d1259'   // Dark purple (nav color)
  const brandBg = '#3d1a6e'   // Fondo principal

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Usamos path relativo que será proxuado por Vite
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Guardamos token y datos de usuario
        localStorage.setItem('sso_token', data.token)
        localStorage.setItem('sso_user', JSON.stringify(data.user))

        // Actualizamos contexto
        setUser(data.user)
        navigate('/')
      } else {
        setError(data.error || 'Credenciales incorrectas')
      }
    } catch (error) {
      setError('Error de conexión con el servidor')
    }
    setLoading(false)
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative"
      style={{
        background: `radial-gradient(ellipse at 60% 20%, #5b21b6 0%, #3d1a6e 45%, #1e0a3c 100%)`,
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Puntos luminosos sobre fondo púrpura */}
      <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      {/* Puntos animados */}
      {[
        { top: '15%', left: '10%', delay: '0s' },
        { top: '80%', right: '15%', delay: '2s' },
        { top: '40%', right: '5%', delay: '4s' }
      ].map((dot, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: dot.top, left: dot.left, right: dot.right,
            width: '4px', height: '4px',
            background: brandPurple,
            borderRadius: '50%',
            boxShadow: `0 0 10px 2px ${brandPurple}`,
            animation: `pulse 3s infinite ${dot.delay}`,
            opacity: 0.6
          }}
        />
      ))}

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.5); opacity: 1; box-shadow: 0 0 20px 4px ${brandPurple}60; }
            100% { transform: scale(1); opacity: 0.4; }
          }
        `}
      </style>

      {/* --- TARJETA DE LOGIN --- */}
      <div className="col-11 col-sm-9 col-md-6 col-lg-5 col-xl-4 px-3 position-relative" style={{ zIndex: 10 }}>
        <div
          className="card border-0"
          style={{
            borderRadius: '16px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)', // Glassmorphism
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div className="text-center pt-4 pb-2">
            <div style={{ marginBottom: '16px' }}>
              <img
                src="/logo_datix.png"
                alt="DATIX SpA"
                style={{ width: '220px', height: 'auto', margin: '0 auto', display: 'block' }}
              />
            </div>

            <h2 className="fw-bold text-white mb-1" style={{ fontSize: '24px', letterSpacing: '0.5px' }}>
              Acceso a Portal Somyl S.A.
            </h2>
            <p className="text-white-50 mb-0" style={{ fontSize: '14px', fontWeight: 300 }}>
              Soluciones Tecnológicas Integrales
            </p>
          </div>

          <div className="card-body p-4 p-md-5">
            {error && (
              <div
                className="alert d-flex align-items-center"
                role="alert"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <span className="me-2">⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="form-label text-white-50 fw-semibold"
                  style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}
                >
                  Correo Corporativo
                </label>
                <input
                  type="email"
                  className="form-control form-control-lg text-white"
                  id="email"
                  placeholder="usuario@datix.cl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    fontSize: '15px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = brandPurple
                    e.target.style.boxShadow = `0 0 0 2px ${brandPurple}30`
                    e.target.style.background = 'rgba(0, 0, 0, 0.4)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.background = 'rgba(0, 0, 0, 0.2)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="form-label text-white-50 fw-semibold"
                  style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  className="form-control form-control-lg text-white"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    fontSize: '15px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = brandPurple
                    e.target.style.boxShadow = `0 0 0 2px ${brandPurple}30`
                    e.target.style.background = 'rgba(0, 0, 0, 0.4)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.background = 'rgba(0, 0, 0, 0.2)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn w-100 fw-bold py-3 text-white mt-2"
                style={{
                  background: `linear-gradient(135deg, #2d1259 0%, #1a0a40 100%)`,
                  border: `1px solid rgba(167,139,250,0.35)`,
                  borderRadius: '12px',
                  fontSize: '14px',
                  letterSpacing: '1px',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                disabled={loading}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.borderColor = brandPurple
                  e.target.style.boxShadow = `0 10px 20px -10px rgba(167,139,250,0.4)`
                  e.target.style.background = `linear-gradient(135deg, #1a0a40 0%, #2d1259 100%)`
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.borderColor = `rgba(167,139,250,0.35)`
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'
                  e.target.style.background = `linear-gradient(135deg, #2d1259 0%, #1a0a40 100%)`
                }}
              >
                {loading ? 'Autenticando...' : 'Ingresar al Portal'}
              </button>
            </form>
          </div>

          <div className="text-center pb-4 pt-2 border-top border-secondary border-opacity-25 mx-4">
            <small className="text-white-50" style={{ fontSize: '11px', opacity: 0.6 }}>
              Portal de Gestión Integral - DATIX
            </small>
          </div>
        </div>

        <p className="text-center mt-4 text-white-50" style={{ fontSize: '9px', fontWeight: 700, opacity: 0.7, letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>
          &copy; 2026 SOLUCIONES TECNOLÓGICAS DATIX SPA | DE LA INFORMACIÓN AL ÉXITO
        </p>
      </div>
    </div>
  )
}