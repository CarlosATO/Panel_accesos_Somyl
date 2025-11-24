import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Dashboard({ user, setUser }) {
  const [links, setLinks] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/dashboard', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setLinks(data.links)
          // Actualizar el usuario con los datos del backend
          if (data.user) {
            setUser(data.user)
          }
          console.log('User data:', data.user)
          console.log('Is superuser:', data.user?.is_superuser)
        } else {
          navigate('/login')
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error)
      }
      setLoading(false)
    }
    fetchDashboard()
  }, [navigate, setUser])

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { 
        method: 'POST',
        credentials: 'include'
      })
      setUser(null)
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  }

  const apps = [
    { key: 'ordenes', name: 'Órdenes de Pago', description: 'Gestión de pagos y finanzas', icon: 'bi-receipt-cutoff', color: '#5C9EC6' },
    { key: 'fibra', name: 'Gestión Fibra', description: 'Control de despliegue', icon: 'bi-diagram-3', color: '#69B07C' },
    { key: 'flota', name: 'Control Flota', description: 'Vehículos y mantenimiento', icon: 'bi-truck', color: '#E9A34D' },
    { key: 'herramientas', name: 'Herramientas', description: 'Módulo en mantenimiento', icon: 'bi-cone-striped', color: '#A67BB3', maintenance: true }
  ]

  return (
    <div className="min-vh-100 bg-light">
      {/* Top Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#875A7B' }}>
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <i className="bi bi-grid-3x3-gap-fill me-2"></i>
            Portal
          </a>
          <div className="d-flex align-items-center">
            {/* Admin link removed from top bar (only in sidebar) */}
            <span className="text-white me-3">{user.email}</span>
            <button className="btn btn-outline-light" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i>
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className="d-flex">
        <div className="bg-white border-end" style={{ width: '200px', minHeight: 'calc(100vh - 56px)' }}>
          <div className="p-3">
            <div className="text-muted text-uppercase fw-bold small mb-3" style={{ letterSpacing: '0.5px' }}>
              CATEGORÍAS
            </div>
            <div className="mb-2 p-2 rounded" style={{ backgroundColor: '#875A7B', color: 'white' }}>
              <i className="bi bi-house-door me-2"></i>
              Todas las Apps
            </div>
            <div className="mb-2 p-2 text-muted" style={{ cursor: 'pointer' }}>
              <i className="bi bi-cash-stack me-2"></i>
              Finanzas
            </div>
            <div className="mb-2 p-2 text-muted" style={{ cursor: 'pointer' }}>
              <i className="bi bi-diagram-3 me-2"></i>
              Operaciones
            </div>
            <div className="mb-2 p-2 text-muted" style={{ cursor: 'pointer' }}>
              <i className="bi bi-truck me-2"></i>
              Logística
            </div>
            {user?.is_superuser && (
              <>
                <hr className="my-3" />
                <div className="text-muted text-uppercase fw-bold small mb-3" style={{ letterSpacing: '0.5px' }}>
                  ADMINISTRACIÓN
                </div>
                  <div
                  onClick={() => navigate('/admin')} 
                  className="mb-2 p-2 rounded"
                  style={{ 
                    color: '#875A7B', 
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <i className="bi bi-people me-2"></i>
                  Usuarios SSO
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 p-4">
          <div className="mb-4">
            <h1 className="h3 mb-1">Apps</h1>
            <p className="text-muted">Selecciona la aplicación a la que deseas acceder</p>
          </div>

          <div className="row g-4">
            {apps.map(app => {
              // Los roles en la BD pueden ser: 'admin', 'true', 'false' (o booleanos true/false)
              // Consideramos acceso cuando el valor es 'admin' o 'true' (o boolean true)
              const roleValue = user[`rol_${app.key}`]
              const hasAccess = roleValue === 'admin' || roleValue === 'true' || roleValue === true
              const isMaintenance = app.maintenance
              const isDisabled = !hasAccess && !isMaintenance

              return (
                <div key={app.key} className="col-lg-3 col-md-4 col-sm-6">
                  <div className={`card h-100 shadow-sm ${(isMaintenance || isDisabled) ? 'opacity-50' : ''}`} style={{ cursor: (isMaintenance || isDisabled) ? 'not-allowed' : 'pointer', pointerEvents: (isDisabled || isMaintenance) ? 'none' : 'auto' }}>
                    <div className="card-body text-center p-4">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                        style={{
                          width: '60px',
                          height: '60px',
                          backgroundColor: app.color,
                          color: 'white',
                          fontSize: '30px'
                        }}
                      >
                        <i className={`bi ${app.icon}`}></i>
                      </div>
                      <h5 className="card-title mb-2">{app.name}</h5>
                      <p className="card-text text-muted small mb-3">{app.description}</p>
                      {isMaintenance ? (
                        <span className="badge bg-secondary">En Reparación</span>
                      ) : isDisabled ? (
                        <button className="btn btn-secondary btn-sm" disabled>Sin acceso</button>
                      ) : (
                        <a href={links[app.key]} className="btn btn-primary btn-sm">
                          Entrar
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard