import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Wallet, GitBranch, Truck, Receipt, Package, Building2, Users, ShieldCheck, LogOut, Calendar, Lock, Wrench } from 'lucide-react'

function Dashboard({ user, setUser }) {
  const [links, setLinks] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const navigate = useNavigate()

  // SOMYL CORPORATE IDENTITY - DARK PREMIUM
  const brandCyan = '#0ea5e9' // Sky Blue accent
  const brandNavy = '#0f172a' // Slate 900 (kept for reference)

  // Categorías - iconos unificados en acento cyan monocromático
  const apps = [
    { key: 'ordenes', name: 'Adquisiciones', description: 'Gestión de pagos y finanzas', Icon: Receipt, color: '#0ea5e9', category: 'finance' },
    { key: 'flota', name: 'Control Flota', description: 'Vehículos y mantenimiento', Icon: Truck, color: '#0ea5e9', category: 'logistics' },
    { key: 'logistica', name: 'Logística', description: 'Inventario y Stock de Proyectos', Icon: Package, color: '#0ea5e9', category: 'logistics' },
    { key: 'produccion', name: 'Construcción', description: 'Gestión de obras y producción', Icon: Building2, color: '#0ea5e9', category: 'logistics' },
    { key: 'rrhh', name: 'Recursos Humanos', description: 'Gestión de Personal y Nómina', Icon: Users, color: '#0ea5e9', category: 'finance' },
  ]

  const categories = [
    { id: 'all', name: 'Todas las Apps', Icon: LayoutGrid },
    { id: 'finance', name: 'Finanzas', Icon: Wallet },
    { id: 'operations', name: 'Operaciones', Icon: GitBranch },
    { id: 'logistics', name: 'Logística', Icon: Truck }
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
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: '#0a0a0a' }}>
        <div className="text-center">
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: brandCyan, borderWidth: '3px' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 fw-medium" style={{ color: '#52525b', fontSize: '13px', letterSpacing: '0.5px' }}>Cargando Módulos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 d-flex p-3 gap-3" style={{ background: '#09090b', color: '#d4d4d8', position: 'relative', overflow: 'hidden' }}>

      {/* ── Ambient Glow Layer ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Blob 1 — Cyan top-left */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: '45vw',
          height: '45vw',
          borderRadius: '50%',
          background: '#0ea5e9',
          opacity: 0.13,
          filter: 'blur(120px)',
          animation: 'blob1 22s infinite alternate ease-in-out'
        }} />
        {/* Blob 2 — Indigo bottom-right */}
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-5%',
          width: '40vw',
          height: '40vw',
          borderRadius: '50%',
          background: '#4f46e5',
          opacity: 0.11,
          filter: 'blur(130px)',
          animation: 'blob2 26s infinite alternate ease-in-out',
          animationDelay: '2s'
        }} />
        {/* Blob 3 — Emerald top-right */}
        <div style={{
          position: 'absolute',
          top: '5%',
          right: '10%',
          width: '30vw',
          height: '30vw',
          borderRadius: '50%',
          background: '#10b981',
          opacity: 0.09,
          filter: 'blur(110px)',
          animation: 'blob3 18s infinite alternate ease-in-out',
          animationDelay: '4s'
        }} />
      </div>

      {/* ── Sidebar — Floating Glass Panel ── */}
      <div
        className="d-none d-lg-flex flex-column"
        style={{
          width: '240px',
          flexShrink: 0,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          position: 'sticky',
          top: '1rem',
          height: 'calc(100vh - 2rem)',
          zIndex: 10,
          transition: 'all 0.3s ease',
          overflow: 'hidden'
        }}
      >
        {/* Logo Section */}
        <div className="p-4 d-flex align-items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '8px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <img src="/logo-somyl.ico" alt="Somyl" style={{ width: 26, height: 'auto', display: 'block' }} />
          </div>
          <span style={{ fontWeight: 600, fontSize: '17px', color: '#f4f4f5', letterSpacing: '0.3px' }}>Somyl Portal</span>
        </div>

        {/* Navigation */}
        <div className="p-4 flex-grow-1 overflow-auto custom-scrollbar">
          <div className="text-uppercase fw-bold mb-3" style={{ fontSize: '10px', color: '#52525b', letterSpacing: '1.2px' }}>
            Navegación
          </div>

          <div className="d-flex flex-column gap-1 mb-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="btn text-start d-flex align-items-center gap-3 w-100"
                style={{
                  backgroundColor: selectedCategory === cat.id ? 'rgba(14, 165, 233, 0.12)' : 'transparent',
                  color: selectedCategory === cat.id ? '#38bdf8' : '#71717a',
                  fontWeight: selectedCategory === cat.id ? '600' : '400',
                  fontSize: '14px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: selectedCategory === cat.id ? '1px solid rgba(14, 165, 233, 0.2)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== cat.id) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                    e.currentTarget.style.color = '#e4e4e7'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== cat.id) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#71717a'
                  }
                }}
              >
                {selectedCategory === cat.id && (
                  <div style={{ position: 'absolute', left: 0, top: '22%', bottom: '22%', width: '3px', background: 'linear-gradient(180deg, #38bdf8, #0ea5e9)', borderRadius: '0 3px 3px 0' }}></div>
                )}
                <cat.Icon size={16} strokeWidth={1.5} style={{ opacity: selectedCategory === cat.id ? 1 : 0.6, flexShrink: 0 }} />
                {cat.name}
              </button>
            ))}
          </div>

          {user?.is_superuser && (
            <>
              <div className="text-uppercase fw-bold mb-3" style={{ fontSize: '10px', color: '#52525b', letterSpacing: '1.2px' }}>
                Sistema
              </div>
              <button
                onClick={() => navigate('/admin')}
                className="btn text-start d-flex align-items-center gap-3 w-100"
                style={{
                  color: '#71717a',
                  fontWeight: '400',
                  fontSize: '14px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = '#e4e4e7'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#71717a'
                }}
              >
                <ShieldCheck size={16} strokeWidth={1.5} style={{ opacity: 0.6, flexShrink: 0 }} />
                Administración
              </button>
            </>
          )}
        </div>

        {/* User Card */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="d-flex align-items-center gap-3 p-3 rounded-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', color: 'white', fontSize: '13px', fontWeight: '600' }}>
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-grow-1">
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#f4f4f5' }} className="text-truncate">
                {user.full_name || 'Usuario'}
              </div>
              <div style={{ fontSize: '11px', color: '#52525b' }}>{user.is_superuser ? 'Administrador' : 'Conectado'}</div>
            </div>
          </div>
          <button
            className="btn w-100 d-flex justify-content-center align-items-center gap-2"
            onClick={handleLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.07)',
              color: '#f87171',
              borderRadius: '8px',
              padding: '9px 16px',
              border: '1px solid rgba(239, 68, 68, 0.12)',
              fontSize: '13px',
              fontWeight: '400',
              transition: 'all 0.2s ease',
              letterSpacing: '0.2px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
              e.currentTarget.style.color = '#fca5a5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.07)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.12)'
              e.currentTarget.style.color = '#f87171'
            }}
          >
            <LogOut size={14} strokeWidth={1.5} /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* ── Main Content — Floating Glass Panel ── */}
      <div
        className="flex-grow-1 d-flex flex-column overflow-auto"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '20px',
          minHeight: 0,
          position: 'relative',
          zIndex: 10
        }}
      >
        <div className="p-4 p-md-5">
          {/* Mobile Header */}
          <div className="d-lg-none d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="d-flex align-items-center gap-2">
              <img src="/logo-somyl.ico" alt="Somyl" style={{ width: 22, height: 'auto' }} />
              <span className="fw-semibold" style={{ color: '#f4f4f5', fontSize: '15px' }}>Portal Somyl</span>
            </div>
            <button onClick={handleLogout} className="btn btn-sm d-flex align-items-center" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px' }}>
              <LogOut size={14} strokeWidth={1.5} />
            </button>
          </div>

          <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
              <h1 className="fw-semibold mb-2" style={{ color: '#ffffff', fontSize: '2rem', letterSpacing: '-0.5px' }}>
                ¡Hola, {user.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Usuario'}! 👋
              </h1>
              <p className="mb-0" style={{ color: '#71717a', fontSize: '14px' }}>Selecciona un módulo empresarial para comenzar a trabajar.</p>
            </div>
            <div className="d-none d-md-flex align-items-center gap-2" style={{ fontSize: '12px', color: '#94a3b8', background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Calendar size={13} strokeWidth={1.5} style={{ opacity: 0.6, flexShrink: 0 }} />
              {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div className="row g-4 justify-content-start">
            {filteredApps.map(app => {
              const roleValue = user[`rol_${app.key}`]
              const hasAccess = roleValue === 'admin' || roleValue === 'true' || roleValue === true
              const isMaintenance = app.maintenance
              const isDisabled = !hasAccess && !isMaintenance

              return (
                <div key={app.key} className="col-6 col-sm-4 col-md-3 col-xl-2 d-flex justify-content-center">
                  <a
                    href={isDisabled || isMaintenance ? '#' : links[app.key]}
                    className="text-decoration-none w-100 d-flex flex-column align-items-center"
                    style={{ cursor: isDisabled || isMaintenance ? 'not-allowed' : 'pointer' }}
                    onClick={(e) => {
                      if (isDisabled || isMaintenance) e.preventDefault()
                    }}
                  >
                    <div
                      className="w-100 d-flex align-items-center justify-content-center"
                      style={{
                        aspectRatio: '1/1',
                        borderRadius: '22px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: isDisabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                        border: isDisabled ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(255,255,255,0.08)',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        if (!isDisabled && !isMaintenance) {
                          e.currentTarget.style.transform = 'translateY(-5px)'
                          e.currentTarget.style.background = 'rgba(14, 165, 233, 0.08)'
                          e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.25)'
                          e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(14, 165, 233, 0.1)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.background = isDisabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)'
                        e.currentTarget.style.borderColor = isDisabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      {/* Status Indicator */}
                      <div className="position-absolute top-0 end-0 mt-2 me-2">
                        {!isDisabled && !isMaintenance && (
                          <div
                            title="Online"
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: '#22c55e',
                              boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)',
                              animation: 'pulse 2s infinite'
                            }}
                          ></div>
                        )}
                        {isDisabled && !isMaintenance && (
                          <Lock size={10} strokeWidth={2} style={{ color: '#3f3f46' }} title="Sin Acceso" />
                        )}
                        {isMaintenance && (
                          <Wrench size={10} strokeWidth={1.5} style={{ color: '#f59e0b' }} title="En Mantenimiento" />
                        )}
                      </div>

                      {/* App Icon */}
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '16px',
                          background: isDisabled ? 'rgba(255,255,255,0.03)' : 'rgba(14, 165, 233, 0.08)',
                          color: isDisabled ? '#3f3f46' : '#38bdf8',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <app.Icon size={28} strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* App Title */}
                    <h6
                      className="fw-medium text-center mt-3 px-1"
                      style={{
                        color: isDisabled ? '#3f3f46' : '#a1a1aa',
                        fontSize: '13px',
                        lineHeight: '1.3',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {app.name}
                    </h6>
                  </a>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-auto p-4 pe-5 text-end">
          <small style={{ fontSize: '11px', color: '#64748b' }}>
            © {new Date().getFullYear()} Somyl S.A. Portal Fibra Óptica Integrado.
          </small>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 5px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        @keyframes blob1 {
          0%   { transform: translate(0px,   0px)   scale(1);    }
          33%  { transform: translate(80px,  -60px) scale(1.08); }
          66%  { transform: translate(-50px,  90px) scale(0.95); }
          100% { transform: translate(60px,   40px) scale(1.04); }
        }
        @keyframes blob2 {
          0%   { transform: translate(0px,    0px)   scale(1);    }
          33%  { transform: translate(-90px,  50px)  scale(1.06); }
          66%  { transform: translate(70px,  -80px)  scale(0.97); }
          100% { transform: translate(-40px, -30px)  scale(1.03); }
        }
        @keyframes blob3 {
          0%   { transform: translate(0px,   0px)    scale(1);    }
          33%  { transform: translate(-60px, 80px)   scale(1.1);  }
          66%  { transform: translate(100px, -40px)  scale(0.93); }
          100% { transform: translate(30px,  60px)   scale(1.05); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default Dashboard