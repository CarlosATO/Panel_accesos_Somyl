import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FacturacionPanel from '../components/Facturacion/FacturacionPanel'
import FacturacionUsuario from '../components/Facturacion/FacturacionUsuario'

function FacturacionPage({ user, setUser }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      // Redirigir a login si no hay usuario
      navigate('/login')
    } else {
      setIsLoading(false)
    }
  }, [user, navigate])

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' })
      setUser(null)
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (isLoading) {
    return <div style={{ backgroundColor: '#3d1a6e', minHeight: '100vh' }} />
  }

  // Mostrar panel del superusuario
  if (user?.is_superuser) {
    return <FacturacionPanel user={user} onLogout={handleLogout} />
  }

  // Mostrar panel de usuario autorizado
  if (user?.is_billing_admin) {
    return <FacturacionUsuario user={user} onLogout={handleLogout} />
  }

  // Si no tiene permisos, redirigir al Dashboard en lugar de mostrar error
  useEffect(() => {
    navigate('/')
  }, [navigate])

  return <div style={{ backgroundColor: '#3d1a6e', minHeight: '100vh' }} />
}

export default FacturacionPage
