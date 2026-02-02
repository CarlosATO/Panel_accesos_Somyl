import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login({ setUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // SOMYL CORPORATE IDENTITY
  const brandCyan = '#00AEEF'
  const brandNavy = '#002855' // Deep Navy
  const brandDark = '#0f172a'

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
        // Fondo: Gradiente Corporativo Profesional (Navy to Dark)
        background: `radial-gradient(circle at 50% 0%, ${brandNavy} 0%, ${brandDark} 100%)`,
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {/* --- EFECTOS DE FONDO (RED DE FIBRA / CONECTIVIDAD) --- */}

      {/* Malla de red sutil */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          pointerEvents: 'none'
        }}
      />

      {/* Destello Azul Somyl (Cyan) */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${brandCyan}20 0%, transparent 70%)`,
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }}
      />

      {/* Puntos animados (Nodos de red) */}
      {[
        { top: '15%', left: '10%', delay: '0s' },
        { top: '80%', right: '15%', delay: '2s' },
        { top: '40%', right: '5%', delay: '4s' }
      ].map((dot, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: dot.top,
            left: dot.left,
            right: dot.right,
            width: '4px',
            height: '4px',
            background: brandCyan,
            borderRadius: '50%',
            boxShadow: `0 0 10px 2px ${brandCyan}`,
            animation: `pulse 3s infinite ${dot.delay}`,
            opacity: 0.6
          }}
        />
      ))}

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.5); opacity: 1; box-shadow: 0 0 20px 4px ${brandCyan}60; }
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
          <div className="text-center pt-5 pb-2">
            <div
              style={{
                width: '80px',
                height: '80px',
                background: 'white',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: `0 0 30px ${brandCyan}40`,
                padding: '12px'
              }}
            >
              <img
                src="/logo-somyl.ico"
                alt="Somyl S.A."
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <h2 className="fw-bold text-white mb-1" style={{ fontSize: '24px', letterSpacing: '0.5px' }}>
              Portal de Accesos
            </h2>
            <p className="text-white-50 mb-0" style={{ fontSize: '14px', fontWeight: 300 }}>
              Somyl servicios de Construcción e Ingeniería
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
                  placeholder="usuario@somyl.cl"
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
                    e.target.style.borderColor = brandCyan
                    e.target.style.boxShadow = `0 0 0 2px ${brandCyan}30`
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
                    e.target.style.borderColor = brandCyan
                    e.target.style.boxShadow = `0 0 0 2px ${brandCyan}30`
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
                  background: brandCyan,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  letterSpacing: '0.5px',
                  boxShadow: `0 4px 15px ${brandCyan}40`,
                  transition: 'all 0.2s',
                  textTransform: 'uppercase'
                }}
                disabled={loading}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)'
                  e.target.style.boxShadow = `0 6px 20px ${brandCyan}60`
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = `0 4px 15px ${brandCyan}40`
                }}
              >
                {loading ? 'Autenticando...' : 'Ingresar al Portal'}
              </button>
            </form>
          </div>

          <div className="text-center pb-4 pt-2 border-top border-secondary border-opacity-25 mx-4">
            <small className="text-white-50" style={{ fontSize: '11px' }}>
              Portal de Gestión Integral
            </small>
          </div>
        </div>

        <p className="text-center mt-4 text-white-50" style={{ fontSize: '12px', fontWeight: 300 }}>
          &copy; {new Date().getFullYear()} Somyl S.A. | Ingeniería y Telecomunicaciones
        </p>
      </div>
    </div>
  )
}