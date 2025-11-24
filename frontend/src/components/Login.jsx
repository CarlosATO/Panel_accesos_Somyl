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
      className="min-vh-100 d-flex align-items-center justify-content-center" 
      style={{ 
        background: '#f8fafc',
        width: '100%'
      }}
    >
      <div className="col-11 col-sm-10 col-md-6 col-lg-5 col-xl-4 px-3">
        <div 
          className="card border-0" 
          style={{ 
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden'
          }}
        >
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
              padding: '40px 40px 32px',
              textAlign: 'center'
            }}
          >
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
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }}
            >
                      {/* Use user-provided icon if present. Prefer svg/png if available, otherwise fall back to ico. */}
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
                letterSpacing: '-0.5px'
              }}
            >
              Portal de Accesos
            </h2>
            <p 
              style={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '15px',
                margin: 0,
                fontWeight: '400'
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
            color: '#6b7280',
            fontSize: '13px',
            fontWeight: '400'
          }}
        >
          © 2024 Somyl SA. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}

export default Login