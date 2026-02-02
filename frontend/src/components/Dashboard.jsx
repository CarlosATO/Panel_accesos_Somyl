import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Dashboard({ user, setUser }) {
  const [links, setLinks] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const navigate = useNavigate()

  // SOMYL CORPORATE IDENTITY
  const brandCyan = '#00AEEF'
  const brandNavy = '#002855'

  // Categorías con colores actualizados (para mantener distinción visual pero menos agresiva)
  // Finanzas: Verde Esmeralda | Operaciones: Azul Real | Logística: Naranja/Ámbar
  const apps = [
    { key: 'ordenes', name: 'Órdenes de Pago', description: 'Gestión de pagos y finanzas', icon: 'bi-receipt-cutoff', color: '#10b981', category: 'finance' },
    { key: 'flota', name: 'Control Flota', description: 'Vehículos y mantenimiento', icon: 'bi-truck', color: '#0ea5e9', category: 'logistics' },
    { key: 'logistica', name: 'Logística', description: 'Inventario y Stock de Proyectos', icon: 'bi-box-seam', color: '#f59e0b', category: 'logistics' },
    { key: 'produccion', name: 'Construcción', description: 'Gestión de obras y producción', icon: 'bi-building', color: '#f97316', category: 'logistics' },
    { key: 'rrhh', name: 'Recursos Humanos', description: 'Gestión de Personal y Nómina', icon: 'bi-people', color: '#ec4899', category: 'finance' },
  ]

  const categories = [
    { id: 'all', name: 'Todas las Apps', icon: 'bi-grid-3x3-gap' },
    { id: 'finance', name: 'Finanzas', icon: 'bi-cash-stack' },
    { id: 'operations', name: 'Operaciones', icon: 'bi-diagram-3' },
    { id: 'logistics', name: 'Logística', icon: 'bi-truck' }
  ]

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
          // If authorization fails, clear user state instead of navigating
          // This prevents the redirect loop (/login -> / -> Dashboard -> /login)
          setUser(null)
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

  // AUTO-LOGOUT LOGIC (10 Minutes)
  useEffect(() => {
    const INACTIVITY_LIMIT = 10 * 60 * 1000 // 10 minutes
    let timeoutId

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        console.log('Auto-logout por inactividad')
        handleLogout()
      }, INACTIVITY_LIMIT)
    }

    // Eventos a monitorear para actividad
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']

    // Iniciar timer
    resetTimer()

    // Agregar listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer)
    })

    // Cleanup al desmontar
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      events.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, []) // Solo al montar

  const filteredApps = selectedCategory === 'all'
    ? apps
    : apps.filter(app => app.category === selectedCategory)

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: '#f8fafc' }}>
        <div className="text-center">
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: brandCyan, borderWidth: '4px' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-secondary fw-medium">Cargando Módulos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: '#f8fafc' }}>
      {/* Header Corporativo (Navy Blue) */}
      <nav
        className="navbar navbar-expand-lg shadow-sm sticky-top"
        style={{
          background: brandNavy,
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          zIndex: 1030
        }}
      >
        <div className="container-fluid px-4 md:px-5">
          <a className="navbar-brand d-flex align-items-center gap-3 text-white" href="#" style={{ fontWeight: '600' }}>
            <div style={{ background: 'white', padding: '6px', borderRadius: '8px' }}>
              <img
                src="/logo-somyl.ico"
                alt="Somyl"
                style={{ width: 32, height: 'auto', display: 'block' }}
              />
            </div>
            <span style={{ fontWeight: 600, fontSize: '18px', letterSpacing: '0.5px' }}>Portal Unificado</span>
          </a>

          <div className="d-flex align-items-center gap-4">
            <div className="d-none d-md-block text-end">
              <div style={{ fontSize: '14px', color: 'white', fontWeight: '500' }}>{user.email}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>{user.is_superuser ? 'Administrador' : 'Usuario'}</div>
            </div>

            <button
              className="btn btn-sm d-flex align-items-center gap-2"
              onClick={handleLogout}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                borderRadius: '8px',
                padding: '8px 16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <i className="bi bi-box-arrow-right"></i>
              <span className="d-none d-sm-inline">Salir</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <div
          className="bg-white d-none d-lg-flex shadow-sm"
          style={{
            width: '280px',
            minHeight: 'calc(100vh - 70px)',
            borderRight: '1px solid #e2e8f0',
            flexDirection: 'column',
            position: 'sticky',
            top: '70px',
            height: 'calc(100vh - 70px)',
            zIndex: 1020
          }}
        >
          <div className="p-4 flex-grow-1 overflow-auto">
            <div
              className="text-uppercase fw-bold mb-3"
              style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '1px' }}
            >
              Navegación
            </div>

            <div className="d-flex flex-column gap-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="btn text-start d-flex align-items-center gap-3 w-100"
                  style={{
                    backgroundColor: selectedCategory === cat.id ? '#e0f2fe' : 'transparent', // Light Cyan bg
                    color: selectedCategory === cat.id ? '#0284c7' : '#64748b', // Darker Cyan text
                    fontWeight: selectedCategory === cat.id ? '600' : '500',
                    fontSize: '14px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <i className={`bi ${cat.icon}`} style={{ fontSize: '16px' }}></i>
                  {cat.name}
                </button>
              ))}
            </div>

            {user?.is_superuser && (
              <>
                <hr className="my-4 text-muted opacity-25" />
                <div
                  className="text-uppercase fw-bold mb-3"
                  style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '1px' }}
                >
                  Sistema
                </div>
                <button
                  onClick={() => navigate('/admin')}
                  className="btn text-start d-flex align-items-center gap-3 w-100"
                  style={{
                    color: '#475569',
                    fontWeight: '500',
                    fontSize: '14px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <i className="bi bi-shield-lock" style={{ fontSize: '16px' }}></i>
                  Administración
                </button>
              </>
            )}
          </div>

          <div className="p-4 border-top border-light">
            <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: '36px',
                  height: '36px',
                  background: brandCyan,
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }} className="text-truncate">
                  {user.full_name || 'Usuario'}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Conectado</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-grow-1 p-4 p-lg-5 d-flex flex-column"> {/* added d-flex flex-column */}
          <div>
            <div className="d-flex justify-content-between align-items-end mb-5 border-bottom pb-4">
              <div>
                <h1 className="fw-bold mb-1" style={{ color: brandNavy, fontSize: '2rem' }}>
                  Bienvenido a los  {user.full_name?.split(' ')[0] || 'Modulos Empresariales'}
                </h1>
                <p className="text-secondary mb-0">Selecciona un módulo para comenzar a trabajar.</p>
              </div>
              <div className="d-none d-md-block text-secondary" style={{ fontSize: '13px' }}>
                {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            <div className="row g-4">
              {filteredApps.map(app => {
                const roleValue = user[`rol_${app.key}`]
                const hasAccess = roleValue === 'admin' || roleValue === 'true' || roleValue === true
                const isMaintenance = app.maintenance
                const isDisabled = !hasAccess && !isMaintenance

                return (
                  <div key={app.key} className="col-12 col-md-6 col-xl-4 col-xxl-3">
                    <div
                      className="card h-100 border-0 shadow-sm"
                      style={{
                        borderRadius: '12px',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        background: 'white',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        if (!isDisabled && !isMaintenance) {
                          e.currentTarget.style.transform = 'translateY(-3px)'
                          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                      }}
                    >
                      <div className="card-body p-3 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: '42px',
                              height: '42px',
                              background: isDisabled ? '#f1f5f9' : `${app.color}15`,
                              color: isDisabled ? '#94a3b8' : app.color
                            }}
                          >
                            <i className={`bi ${app.icon}`} style={{ fontSize: '20px' }}></i>
                          </div>
                          {!isDisabled && !isMaintenance && (
                            <span className="badge rounded-pill bg-light text-secondary border" style={{ fontSize: '10px' }}>Activo</span>
                          )}
                        </div>

                        <h6 className="fw-bold mb-1" style={{ color: isDisabled ? '#94a3b8' : '#1e293b', fontSize: '15px' }}>{app.name}</h6>
                        <p className="text-secondary small mb-3 flex-grow-1" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                          {app.description}
                        </p>

                        <div>
                          {isMaintenance ? (
                            <button className="btn w-100 btn-warning disabled opacity-75 text-white fw-bold py-1" style={{ fontSize: '13px' }}>
                              Mantenimiento
                            </button>
                          ) : isDisabled ? (
                            <button className="btn w-100 btn-light text-secondary disabled py-1" style={{ fontSize: '13px' }}>
                              <i className="bi bi-lock-fill me-2"></i> Sin Acceso
                            </button>
                          ) : (
                            <a
                              href={links[app.key]}
                              className="btn w-100 fw-bold py-1.5"
                              style={{
                                background: brandCyan,
                                color: 'white',
                                border: 'none',
                                fontSize: '13px',
                                borderRadius: '6px',
                                boxShadow: `0 2px 4px -1px ${brandCyan}40`
                              }}
                              onMouseEnter={(e) => e.target.style.filter = 'brightness(110%)'}
                              onMouseLeave={(e) => e.target.style.filter = 'none'}
                            >
                              Entrar <i className="bi bi-arrow-right-short ms-1" style={{ fontSize: '14px', verticalAlign: 'middle' }}></i>
                            </a>
                          )}
                        </div>
                      </div>
                      <div style={{ height: '3px', background: isDisabled ? '#e2e8f0' : app.color }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-auto pt-5 text-center px-4">
            <div className="border-top border-light-subtle w-100 pt-4">
              <small className="text-muted" style={{ fontSize: '12px' }}>
                © {new Date().getFullYear()} Somyl S.A. Portal Corporativo Integrado.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard