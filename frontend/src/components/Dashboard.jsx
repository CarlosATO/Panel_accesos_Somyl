import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Dashboard({ user, setUser }) {
  const [links, setLinks] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const navigate = useNavigate()

  // SOMYL CORPORATE IDENTITY - TECH MINIMALIST
  const brandCyan = '#0ea5e9' // Sky Blue
  const brandNavy = '#0f172a' // Slate 900

  // Categorías con colores tech
  const apps = [
    { key: 'ordenes', name: 'Adquisiciones', description: 'Gestión de pagos y finanzas', icon: 'bi-receipt-cutoff', color: '#10b981', category: 'finance' },
    { key: 'flota', name: 'Control Flota', description: 'Vehículos y mantenimiento', icon: 'bi-truck', color: '#0ea5e9', category: 'logistics' },
    { key: 'logistica', name: 'Logística', description: 'Inventario y Stock de Proyectos', icon: 'bi-box-seam', color: '#f59e0b', category: 'logistics' },
    { key: 'produccion', name: 'Construcción', description: 'Gestión de obras y producción', icon: 'bi-building', color: '#f97316', category: 'logistics' },
    { key: 'rrhh', name: 'Recursos Humanos', description: 'Gestión de Personal y Nómina', icon: 'bi-people', color: '#db2777', category: 'finance' },
  ]

  const categories = [
    { id: 'all', name: 'Todas las Apps', icon: 'bi-grid-3x3-gap' },
    { id: 'finance', name: 'Finanzas', icon: 'bi-wallet2' },
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
    <div className="min-vh-100 d-flex" style={{ background: '#f8fafc' }}>

      {/* Sidebar Dark/Tech */}
      <div
        className="d-none d-lg-flex flex-column shadow-lg"
        style={{
          width: '280px',
          background: brandNavy,
          color: '#e2e8f0',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 1020,
          transition: 'all 0.3s ease'
        }}
      >
        {/* Logo Section */}
        <div className="p-4 d-flex align-items-center gap-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div style={{ background: 'white', padding: '6px', borderRadius: '8px' }}>
            <img src="/logo-somyl.ico" alt="Somyl" style={{ width: 28, height: 'auto', display: 'block' }} />
          </div>
          <span style={{ fontWeight: 600, fontSize: '18px', color: '#f8fafc', letterSpacing: '0.5px' }}>Somyl Portal</span>
        </div>

        {/* Navigation */}
        <div className="p-4 flex-grow-1 overflow-auto custom-scrollbar">
          <div className="text-uppercase fw-bold mb-3" style={{ fontSize: '11px', color: '#64748b', letterSpacing: '1px' }}>
            Navegación
          </div>

          <div className="d-flex flex-column gap-2 mb-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="btn text-start d-flex align-items-center gap-3 w-100"
                style={{
                  backgroundColor: selectedCategory === cat.id ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                  color: selectedCategory === cat.id ? '#38bdf8' : '#cbd5e1',
                  fontWeight: selectedCategory === cat.id ? '600' : '500',
                  fontSize: '14px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: selectedCategory === cat.id ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid transparent',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== cat.id) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
                    e.currentTarget.style.color = '#f8fafc'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== cat.id) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#cbd5e1'
                  }
                }}
              >
                <i className={`bi ${cat.icon}`} style={{ fontSize: '18px', opacity: selectedCategory === cat.id ? 1 : 0.8 }}></i>
                {cat.name}
                {selectedCategory === cat.id && (
                  <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', background: '#38bdf8', borderRadius: '0 4px 4px 0' }}></div>
                )}
              </button>
            ))}
          </div>

          {user?.is_superuser && (
            <>
              <div className="text-uppercase fw-bold mb-3" style={{ fontSize: '11px', color: '#64748b', letterSpacing: '1px' }}>
                Sistema
              </div>
              <button
                onClick={() => navigate('/admin')}
                className="btn text-start d-flex align-items-center gap-3 w-100"
                style={{
                  color: '#cbd5e1',
                  fontWeight: '500',
                  fontSize: '14px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.color = '#f8fafc'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#cbd5e1'
                }}
              >
                <i className="bi bi-shield-lock" style={{ fontSize: '18px', opacity: 0.8 }}></i>
                Administración
              </button>
            </>
          )}
        </div>

        {/* User Card */}
        <div className="p-4 border-top" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="d-flex align-items-center gap-3 p-3 rounded-3 mb-3" style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-grow-1">
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }} className="text-truncate">
                {user.full_name || 'Usuario'}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{user.is_superuser ? 'Administrador' : 'Conectado'}</div>
            </div>
          </div>
          <button
            className="btn w-100 d-flex justify-content-center align-items-center gap-2"
            onClick={handleLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              borderRadius: '8px',
              padding: '10px 16px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ef4444'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
              e.currentTarget.style.color = '#ef4444'
            }}
          >
            <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column h-100 overflow-auto">
        <div className="p-4 p-md-5">
          {/* Mobile Header (Only visible on small screens since sidebar hides) */}
          <div className="d-lg-none d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <img src="/logo-somyl.ico" alt="Somyl" style={{ width: 24, height: 'auto' }} />
              <span className="fw-bold" style={{ color: brandNavy }}>Portal Somyl</span>
            </div>
            <button onClick={handleLogout} className="btn btn-sm btn-outline-danger">
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>

          <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
              <h1 className="fw-bold mb-2" style={{ color: '#0f172a', fontSize: '2.2rem', letterSpacing: '-0.5px' }}>
                ¡Hola, {user.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Usuario'}! 👋
              </h1>
              <p className="text-secondary mb-0" style={{ fontSize: '15px' }}>Selecciona un módulo empresarial para comenzar a trabajar.</p>
            </div>
            <div className="d-none d-md-block text-secondary" style={{ fontSize: '13px', background: 'white', padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <i className="bi bi-calendar3 me-2"></i>
              {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div className="row g-3">
            {filteredApps.map(app => {
              const roleValue = user[`rol_${app.key}`]
              const hasAccess = roleValue === 'admin' || roleValue === 'true' || roleValue === true
              const isMaintenance = app.maintenance
              const isDisabled = !hasAccess && !isMaintenance

              return (
                <div key={app.key} className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 d-flex">
                  <div
                    className="card border-0 shadow-sm w-100"
                    style={{
                      borderRadius: '16px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: 'white',
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid #f1f5f9'
                    }}
                    onMouseEnter={(e) => {
                      if (!isDisabled && !isMaintenance) {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                        e.currentTarget.style.borderColor = app.color + '40'
                        const button = e.currentTarget.querySelector('.launch-btn')
                        if (button) {
                          button.style.backgroundColor = app.color
                          button.style.color = 'white'
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
                      e.currentTarget.style.borderColor = '#f1f5f9'
                      const button = e.currentTarget.querySelector('.launch-btn')
                      if (button) {
                        button.style.backgroundColor = '#f8fafc'
                        button.style.color = '#475569'
                      }
                    }}
                  >
                    {/* Top Color Accent Line */}
                    <div style={{ height: '4px', background: isDisabled ? '#cbd5e1' : app.color, width: '100%' }}></div>

                    <div className="card-body p-4 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-4">
                        <div
                          className="rounded-4 d-flex align-items-center justify-content-center"
                          style={{
                            width: '48px',
                            height: '48px',
                            background: isDisabled ? '#f1f5f9' : `${app.color}15`,
                            color: isDisabled ? '#94a3b8' : app.color,
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <i className={`bi ${app.icon}`} style={{ fontSize: '22px' }}></i>
                        </div>
                        {!isDisabled && !isMaintenance && (
                          <div className="d-flex align-items-center gap-2" style={{ background: '#f0fdf4', padding: '4px 8px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }}></div>
                            <span style={{ fontSize: '10px', color: '#166534', fontWeight: '600' }}>ONLINE</span>
                          </div>
                        )}
                        {isDisabled && !isMaintenance && (
                          <span className="badge rounded-pill bg-light text-secondary border" style={{ fontSize: '10px' }}><i className="bi bi-lock-fill"></i> Bloqueado</span>
                        )}
                        {isMaintenance && (
                          <span className="badge rounded-pill bg-warning text-dark border-0" style={{ fontSize: '10px' }}>En Mantención</span>
                        )}
                      </div>

                      <h6 className="fw-bold mb-2" style={{ color: isDisabled ? '#94a3b8' : '#0f172a', fontSize: '17px' }}>
                        {app.name}
                      </h6>
                      <p className="text-secondary mb-4 flex-grow-1" style={{ fontSize: '13px', lineHeight: '1.5', opacity: isDisabled ? 0.6 : 1 }}>
                        {app.description}
                      </p>

                      <div>
                        {isMaintenance ? (
                          <button className="btn w-100 disabled text-white fw-bold py-2" style={{ fontSize: '13px', background: '#f59e0b', borderRadius: '8px' }}>
                            Volvemos Pronto
                          </button>
                        ) : isDisabled ? (
                          <button className="btn w-100 btn-light text-secondary disabled py-2" style={{ fontSize: '13px', borderRadius: '8px' }}>
                            Solicitar Acceso
                          </button>
                        ) : (
                          <a
                            href={links[app.key]}
                            className="btn w-100 fw-bold py-2 launch-btn d-flex align-items-center justify-content-center gap-2"
                            style={{
                              background: '#f8fafc',
                              color: '#475569',
                              border: '1px solid #e2e8f0',
                              fontSize: '13.5px',
                              borderRadius: '8px',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Ingresar al Módulo <i className="bi bi-box-arrow-up-right" style={{ fontSize: '13px' }}></i>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-auto p-4 text-center">
          <small className="text-muted" style={{ fontSize: '12px' }}>
            © {new Date().getFullYear()} Somyl S.A. Portal Fibra Óptica Integrado.
          </small>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 4px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}

export default Dashboard