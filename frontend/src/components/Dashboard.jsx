import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Dashboard({ user, setUser }) {
  const [links, setLinks] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
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
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: '#f8fafc' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem', color: '#0d9488 !important' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando aplicaciones...</p>
        </div>
      </div>
    )
  }

  const apps = [
    { key: 'ordenes', name: 'Órdenes de Pago', description: 'Gestión de pagos y finanzas', icon: 'bi-receipt-cutoff', color: '#0d9488', category: 'finance' },
    { key: 'fibra', name: 'Gestión Fibra', description: 'Control de despliegue', icon: 'bi-diagram-3', color: '#14b8a6', category: 'operations' },
    { key: 'flota', name: 'Control Flota', description: 'Vehículos y mantenimiento', icon: 'bi-truck', color: '#06b6d4', category: 'logistics' },
    { key: 'herramientas', name: 'Herramientas', description: 'Módulo en mantenimiento', icon: 'bi-cone-striped', color: '#64748b', maintenance: true, category: 'operations' }
  ]

  const categories = [
    { id: 'all', name: 'Todas las Apps', icon: 'bi-grid-3x3-gap' },
    { id: 'finance', name: 'Finanzas', icon: 'bi-cash-stack' },
    { id: 'operations', name: 'Operaciones', icon: 'bi-diagram-3' },
    { id: 'logistics', name: 'Logística', icon: 'bi-truck' }
  ]

  const filteredApps = selectedCategory === 'all' 
    ? apps 
    : apps.filter(app => app.category === selectedCategory)

  return (
    <div className="min-vh-100" style={{ background: '#f8fafc' }}>
      {/* Header moderno */}
      <nav 
        className="navbar navbar-expand-lg shadow-sm" 
        style={{ 
          background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="container-fluid px-4">
          <a className="navbar-brand d-flex align-items-center text-white" href="#" style={{ fontWeight: '600', fontSize: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Logo (fixed small size) */}
              <img
                src="/logo-somyl.ico"
                alt="Somyl"
                style={{ width: 48, height: 'auto', display: 'block' }}
              />
              {/* App name next to logo. Hide on very small screens and keep responsive sizing */}
              <span style={{ fontWeight: 700, fontSize: '18px', color: 'rgba(255,255,255,0.95)', display: 'inline-block' }} className="d-none d-sm-inline">Portal Unificado</span>
              <span style={{ fontWeight: 700, fontSize: '16px', color: 'rgba(255,255,255,0.95)', display: 'inline-block' }} className="d-inline d-sm-none">Portal</span>
            </div>
          </a>
          <div className="d-flex align-items-center gap-3">
            <div className="text-white d-none d-md-flex align-items-center" style={{ fontSize: '14px' }}>
              <i className="bi bi-person-circle me-2" style={{ fontSize: '20px' }}></i>
              <span style={{ opacity: '0.95' }}>{user.email}</span>
            </div>
            <button 
              className="btn btn-light btn-sm d-flex align-items-center gap-2" 
              onClick={handleLogout}
              style={{ 
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: '500',
                border: 'none'
              }}
            >
              <i className="bi bi-box-arrow-right"></i>
              <span className="d-none d-sm-inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="d-flex">
        {/* Sidebar elegante */}
        <div 
          className="bg-white" 
          style={{ 
            width: '260px', 
            minHeight: 'calc(100vh - 72px)',
            borderRight: '1px solid #e5e7eb',
            padding: '24px 0'
          }}
        >
          <div className="px-3">
            <div 
              className="text-muted text-uppercase fw-bold mb-3" 
              style={{ 
                letterSpacing: '0.8px',
                fontSize: '11px',
                paddingLeft: '12px'
              }}
            >
              CATEGORÍAS
            </div>
            
            {categories.map(cat => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="mb-2 p-3 rounded d-flex align-items-center"
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedCategory === cat.id ? '#f0fdfa' : 'transparent',
                  color: selectedCategory === cat.id ? '#0d9488' : '#6b7280',
                  fontWeight: selectedCategory === cat.id ? '600' : '500',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  border: selectedCategory === cat.id ? '1px solid #99f6e4' : '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== cat.id) {
                    e.currentTarget.style.backgroundColor = '#f9fafb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== cat.id) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <i className={`bi ${cat.icon} me-3`} style={{ fontSize: '18px' }}></i>
                {cat.name}
              </div>
            ))}

            {user?.is_superuser && (
              <>
                <hr className="my-4" style={{ opacity: '0.1' }} />
                <div 
                  className="text-muted text-uppercase fw-bold mb-3" 
                  style={{ 
                    letterSpacing: '0.8px',
                    fontSize: '11px',
                    paddingLeft: '12px'
                  }}
                >
                  ADMINISTRACIÓN
                </div>
                <div
                  onClick={() => navigate('/admin')}
                  className="mb-2 p-3 rounded d-flex align-items-center"
                  style={{
                    cursor: 'pointer',
                    color: '#0d9488',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    border: '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0fdfa'
                    e.currentTarget.style.border = '1px solid #99f6e4'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.border = '1px solid transparent'
                  }}
                >
                  <i className="bi bi-people me-3" style={{ fontSize: '18px' }}></i>
                  Usuarios SSO
                </div>
              </>
            )}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-grow-1 p-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="mb-4" style={{ padding: '0 8px' }}>
            <h1 className="h2 mb-2" style={{ color: '#1f2937', fontWeight: '700' }}>
              Aplicaciones Empresariales
            </h1>
            <p className="text-muted" style={{ fontSize: '15px' }}>
              Accede a tus herramientas de trabajo de forma centralizada
            </p>
          </div>

          <div className="row g-4" style={{ padding: '0 8px' }}>
            {filteredApps.map(app => {
              const roleValue = user[`rol_${app.key}`]
              const hasAccess = roleValue === 'admin' || roleValue === 'true' || roleValue === true
              const isMaintenance = app.maintenance
              const isDisabled = !hasAccess && !isMaintenance

              return (
                <div key={app.key} className="col-xl-3 col-lg-4 col-md-6">
                  <div 
                    className={`card h-100 border-0 ${(isMaintenance || isDisabled) ? '' : 'shadow-sm'}`}
                    style={{
                      cursor: (isMaintenance || isDisabled) ? 'not-allowed' : 'pointer',
                      pointerEvents: (isDisabled || isMaintenance) ? 'none' : 'auto',
                      borderRadius: '16px',
                      transition: 'all 0.3s',
                      opacity: (isMaintenance || isDisabled) ? '0.5' : '1',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (!isMaintenance && !isDisabled) {
                        e.currentTarget.style.transform = 'translateY(-8px)'
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.12)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMaintenance && !isDisabled) {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    {/* Header colorido */}
                    <div 
                      style={{ 
                        background: `linear-gradient(135deg, ${app.color} 0%, ${app.color}dd 100%)`,
                        padding: '24px',
                        textAlign: 'center'
                      }}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                        style={{
                          width: '70px',
                          height: '70px',
                          backgroundColor: 'rgba(255, 255, 255, 0.25)',
                          color: 'white',
                          fontSize: '32px',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <i className={`bi ${app.icon}`}></i>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="card-body p-4">
                      <h5 className="card-title mb-2" style={{ fontWeight: '600', color: '#1f2937', fontSize: '18px' }}>
                        {app.name}
                      </h5>
                      <p className="card-text text-muted mb-4" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                        {app.description}
                      </p>
                      
                      {isMaintenance ? (
                        <div 
                          className="badge w-100 py-2" 
                          style={{ 
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            fontSize: '13px',
                            fontWeight: '500',
                            borderRadius: '8px'
                          }}
                        >
                          <i className="bi bi-cone-striped me-1"></i>
                          En Mantenimiento
                        </div>
                      ) : isDisabled ? (
                        <button 
                          className="btn w-100 py-2" 
                          disabled
                          style={{
                            backgroundColor: '#f3f4f6',
                            color: '#9ca3af',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            borderRadius: '8px'
                          }}
                        >
                          <i className="bi bi-lock me-1"></i>
                          Sin Acceso
                        </button>
                      ) : (
                        <a 
                          href={links[app.key]} 
                          className="btn w-100 text-white py-2"
                          style={{
                            background: `linear-gradient(135deg, ${app.color} 0%, ${app.color}dd 100%)`,
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: '600',
                            borderRadius: '8px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.02)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)'
                          }}
                        >
                          Acceder
                          <i className="bi bi-arrow-right ms-2"></i>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredApps.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-inbox" style={{ fontSize: '64px', color: '#d1d5db' }}></i>
              <p className="text-muted mt-3">No hay aplicaciones en esta categoría</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard