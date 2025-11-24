import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login({ setUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        navigate('/')
      } else {
        setError(data.error || 'Error al iniciar sesión')
      }
    } catch (error) {
      setError('Error de conexión')
    }
    setLoading(false)
  }

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative" 
      style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0d9488 100%)',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Fondo con patrón de fibra óptica */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(13, 148, 136, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.25) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.2) 0%, transparent 30%),
            radial-gradient(circle at 90% 90%, rgba(13, 148, 136, 0.35) 0%, transparent 40%)
          `,
          pointerEvents: 'none'
        }}
      />
      
      {/* Líneas decorativas tipo fibra óptica */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(45deg, transparent 48%, rgba(13, 148, 136, 0.1) 49%, rgba(13, 148, 136, 0.1) 51%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, rgba(20, 184, 166, 0.08) 49%, rgba(20, 184, 166, 0.08) 51%, transparent 52%)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none'
        }}
      />

      {/* Puntos brillantes simulando conexiones */}
      <div 
        style={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: '8px',
          height: '8px',
          background: 'radial-gradient(circle, #14b8a6 0%, transparent 70%)',
          borderRadius: '50%',
          boxShadow: '0 0 20px 5px rgba(20, 184, 166, 0.5)',
          animation: 'pulse 3s infinite'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          top: '70%',
          right: '15%',
          width: '6px',
          height: '6px',
          background: 'radial-gradient(circle, #0d9488 0%, transparent 70%)',
          borderRadius: '50%',
          boxShadow: '0 0 15px 4px rgba(13, 148, 136, 0.6)',
          animation: 'pulse 2.5s infinite 0.5s'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          top: '30%',
          right: '25%',
          width: '5px',
          height: '5px',
          background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
          borderRadius: '50%',
          boxShadow: '0 0 12px 3px rgba(6, 182, 212, 0.5)',
          animation: 'pulse 4s infinite 1s'
        }}
      />

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
          }
        `}
      </style>

      <div className="col-11 col-sm-10 col-md-6 col-lg-5 col-xl-4 px-3 position-relative" style={{ zIndex: 1 }}>
        <div 
          className="card border-0" 
          style={{ 
            borderRadius: '20px',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(13, 148, 136, 0.15)',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.97)'
          }}
        >
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #0f766e 100%)',
              padding: '40px 40px 32px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Efecto de brillo en el header */}
            <div 
              style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                pointerEvents: 'none'
              }}
            />
            
            <div 
              style={{ 
                width: '72px',
                height: '72px',
                background: 'white',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                padding: '12px',
                position: 'relative'
              }}
            >
              <img 
                src="/logo-somyl.ico" 
                alt="Somyl" 
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }} 
              />
            </div>
            <h2 
              className="fw-bold mb-2" 
              style={{ 
                color: 'white',
                fontSize: '28px',
                letterSpacing: '-0.5px',
                textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                position: 'relative'
              }}
            >
              Portal de Accesos
            </h2>
            <p 
              style={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '15px',
                margin: 0,
                fontWeight: '400',
                position: 'relative'
              }}
            >
              Somyl SA - Sistema Unificado
            </p>
          </div>

          <div className="card-body" style={{ padding: '40px' }}>
            {error && (
              <div 
                className="alert border-0 d-flex align-items-center" 
                role="alert"
                style={{ 
                  borderRadius: '12px',
                  background: '#fef2f2',
                  color: '#991b1b',
                  padding: '16px',
                  marginBottom: '24px',
                  fontSize: '14px'
                }}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  style={{ marginRight: '12px', flexShrink: 0 }}
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label 
                  htmlFor="email" 
                  className="form-label"
                  style={{ 
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}
                >
                  Correo electrónico
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="tu@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ 
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #e5e7eb',
                    fontSize: '15px',
                    transition: 'all 0.2s',
                    background: '#fafafa'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0d9488'
                    e.target.style.background = 'white'
                    e.target.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.08)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.background = '#fafafa'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div className="mb-4">
                <label 
                  htmlFor="password" 
                  className="form-label"
                  style={{ 
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ 
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #e5e7eb',
                    fontSize: '15px',
                    transition: 'all 0.2s',
                    background: '#fafafa'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0d9488'
                    e.target.style.background = 'white'
                    e.target.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.08)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.background = '#fafafa'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn w-100 text-white fw-semibold"
                style={{
                  background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  letterSpacing: '0.3px',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
                  marginTop: '8px'
                }}
                disabled={loading}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 8px 20px rgba(13, 148, 136, 0.35)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 12px rgba(13, 148, 136, 0.25)'
                }}
              >
                {loading ? (
                  <>
                    <span 
                      className="spinner-border spinner-border-sm me-2" 
                      role="status" 
                      aria-hidden="true"
                      style={{ width: '16px', height: '16px' }}
                    />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>
          </div>
        </div>

        <p 
          className="text-center mt-4"
          style={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '13px',
            fontWeight: '400'
          }}
        >
          © 2025 Somyl SA. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}

export default Login