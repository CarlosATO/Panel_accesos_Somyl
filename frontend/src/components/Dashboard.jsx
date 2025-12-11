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
    // 👇 AGREGA ESTE BLOQUE 👇
    { 
      key: 'logistica', 
      name: 'Logística', 
      description: 'Inventario y Stock de Proyectos', 
      icon: 'bi-box-seam', 
      color: '#f59e0b', 
      category: 'logistics' 
    },
    // 👆 FIN DEL BLOQUE 👆
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
    <div className="min-vh-100 d-flex flex-column" style={{ background: '#f1f5f9' }}>
      {/* Header */}
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
              <img
                src="/logo-somyl.ico"
                alt="Somyl"
                style={{ width: 48, height: 'auto', display: 'block' }}
              />
              <span style={{ fontWeight: 700, fontSize: '18px', color: 'rgba(255,255,255,0.95)' }} className="d-none d-sm-inline">Portal Unificado</span>
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

      <div className="d-flex flex-grow-1">
        {/* Sidebar mejorado */}
        <div 
          className="bg-white d-none d-lg-block" 
          style={{ 
            width: '280px', 
            minHeight: 'calc(100vh - 72px)',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div className="p-4 flex-grow-1">
            <div 
              className="text-uppercase fw-bold mb-4" 
              style={{ 
                letterSpacing: '1.2px',
                fontSize: '11px',
                color: '#94a3b8'
              }}
            >
              Categorías
            </div>
            
            <div className="d-flex flex-column gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="btn text-start d-flex align-items-center gap-3"
                  style={{
                    backgroundColor: selectedCategory === cat.id ? '#f0fdfa' : 'transparent',
                    color: selectedCategory === cat.id ? '#0d9488' : '#64748b',
                    fontWeight: selectedCategory === cat.id ? '600' : '500',
                    fontSize: '14px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: selectedCategory === cat.id ? '1px solid #99f6e4' : '1px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <i className={`bi ${cat.icon}`} style={{ fontSize: '18px', width: '24px' }}></i>
                  {cat.name}
                </button>
              ))}
            </div>

            {user?.is_superuser && (
              <>
                <hr className="my-4" style={{ borderColor: '#e2e8f0' }} />
                <div 
                  className="text-uppercase fw-bold mb-4" 
                  style={{ 
                    letterSpacing: '1.2px',
                    fontSize: '11px',
                    color: '#94a3b8'
                  }}
                >
                  Administración
                </div>
                <button
                  onClick={() => navigate('/admin')}
                  className="btn text-start d-flex align-items-center gap-3 w-100"
                  style={{
                    color: '#0d9488',
                    fontWeight: '500',
                    fontSize: '14px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid transparent',
                    transition: 'all 0.2s ease',
                    background: 'transparent'
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
                  <i className="bi bi-people" style={{ fontSize: '18px', width: '24px' }}></i>
                  Usuarios SSO
                </button>
              </>
            )}
          </div>

          {/* Footer del sidebar */}
          <div className="p-4 border-top" style={{ borderColor: '#e2e8f0' }}>
            <div className="d-flex align-items-center gap-3">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email?.split('@')[0]}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {user.is_superuser ? 'Administrador' : 'Usuario'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-grow-1 p-4 p-lg-5" style={{ maxWidth: '1400px' }}>
          <div className="mb-5">
            <h1 className="mb-2" style={{ color: '#0f172a', fontWeight: '700', fontSize: '28px' }}>
              Aplicaciones Empresariales
            </h1>
            <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
              Accede a tus herramientas de trabajo de forma centralizada
            </p>
          </div>

          {/* Grid de apps con altura fija */}
          <div className="row g-4">
            {filteredApps.map(app => {
              const roleValue = user[`rol_${app.key}`]
              const hasAccess = roleValue === 'admin' || roleValue === 'true' || roleValue === true
              const isMaintenance = app.maintenance
              const isDisabled = !hasAccess && !isMaintenance

              return (
                <div key={app.key} className="col-12 col-sm-6 col-xl-3">
                  <div 
                    className="card h-100 border-0"
                    style={{
                      borderRadius: '16px',
                      transition: 'all 0.3s ease',
                      opacity: (isMaintenance || isDisabled) ? '0.6' : '1',
                      overflow: 'hidden',
                      boxShadow: (isMaintenance || isDisabled) ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.08)',
                      cursor: (isMaintenance || isDisabled) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onMouseEnter={(e) => {
                      if (!isMaintenance && !isDisabled) {
                        e.currentTarget.style.transform = 'translateY(-6px)'
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMaintenance && !isDisabled) {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
                      }
                    }}
                  >
                    {/* Header con icono */}
                    <div 
                      style={{ 
                        background: `linear-gradient(135deg, ${app.color} 0%, ${app.color}cc 100%)`,
                        padding: '28px',
                        textAlign: 'center'
                      }}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                        style={{
                          width: '64px',
                          height: '64px',
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontSize: '28px'
                        }}
                      >
                        <i className={`bi ${app.icon}`}></i>
                      </div>
                    </div>

                    {/* Contenido con altura fija */}
                    <div 
                      className="card-body d-flex flex-column" 
                      style={{ 
                        padding: '24px',
                        flex: '1 1 auto'
                      }}
                    >
                      <h5 
                        className="mb-2" 
                        style={{ 
                          fontWeight: '600', 
                          color: '#0f172a', 
                          fontSize: '17px' 
                        }}
                      >
                        {app.name}
                      </h5>
                      <p 
                        className="mb-0" 
                        style={{ 
                          color: '#64748b', 
                          fontSize: '14px', 
                          lineHeight: '1.5',
                          flex: '1 1 auto',
                          minHeight: '42px'
                        }}
                      >
                        {app.description}
                      </p>
                      
                      {/* Botón siempre al fondo */}
                      <div style={{ marginTop: '20px' }}>
                        {isMaintenance ? (
                          <div 
                            className="text-center py-2 px-3" 
                            style={{ 
                              backgroundColor: '#fef3c7',
                              color: '#92400e',
                              fontSize: '13px',
                              fontWeight: '500',
                              borderRadius: '10px',
                              border: '1px solid #fde68a'
                            }}
                          >
                            <i className="bi bi-cone-striped me-2"></i>
                            En Mantenimiento
                          </div>
                        ) : isDisabled ? (
                          <button 
                            className="btn w-100 py-2" 
                            disabled
                            style={{
                              backgroundColor: '#f1f5f9',
                              color: '#94a3b8',
                              border: 'none',
                              fontSize: '14px',
                              fontWeight: '500',
                              borderRadius: '10px'
                            }}
                          >
                            <i className="bi bi-lock me-2"></i>
                            Sin Acceso
                          </button>
                        ) : (
                          <a 
                            href={links[app.key]} 
                            className="btn w-100 text-white py-2 d-flex align-items-center justify-content-center gap-2"
                            style={{
                              background: `linear-gradient(135deg, ${app.color} 0%, ${app.color}dd 100%)`,
                              border: 'none',
                              fontSize: '14px',
                              fontWeight: '600',
                              borderRadius: '10px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Acceder
                            <i className="bi bi-arrow-right"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredApps.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-inbox" style={{ fontSize: '64px', color: '#cbd5e1' }}></i>
              <p className="text-muted mt-3 mb-0">No hay aplicaciones en esta categoría</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard