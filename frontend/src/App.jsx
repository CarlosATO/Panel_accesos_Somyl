import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import SubscriptionWall from './components/SubscriptionWall'
import BillingPage from './components/BillingPage'
import { UsuariosPage } from './modules/usuarios'
import FacturacionPage from './pages/Facturacion'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubscriptionLocked, setIsSubscriptionLocked] = useState(false)

  // Function to check subscription status
  const checkSubscriptionStatus = async () => {
    if (!user) return false

    try {
      const response = await fetch('/api/billing/status', {
        credentials: 'include'
      })
      
      if (response.status === 403) {
        const data = await response.json()
        if (data.locked) {
          return true // Subscription is locked
        }
      }
      
      return false // Subscription is active or no restriction
    } catch (error) {
      console.error('Error checking subscription:', error)
      return false // Allow access if there's an error
    }
  }

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/dashboard', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          
          // Check subscription status after setting user
          if (data.user) {
            const locked = await checkSubscriptionStatus()
            setIsSubscriptionLocked(locked)
          }
        }
      } catch (error) {
        console.log('Not authenticated')
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  // Re-check subscription when user changes
  useEffect(() => {
    if (user) {
      checkSubscriptionStatus().then(setIsSubscriptionLocked)
    } else {
      setIsSubscriptionLocked(false)
    }
  }, [user])

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{ background: '#3d1a6e' }}
      >
        <div
          className="spinner-border"
          role="status"
          style={{ color: '#a78bfa', width: '2.5rem', height: '2.5rem', borderWidth: '3px' }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App" style={{ background: '#3d1a6e', minHeight: '100vh' }}>
        <Routes>
          <Route path="/login" element={<Navigate to="/" />} />
          <Route 
            path="/" 
            element={
              user ? (
                isSubscriptionLocked ? (
                  <SubscriptionWall onClose={() => setIsSubscriptionLocked(false)} />
                ) : (
                  <Dashboard user={user} setUser={setUser} />
                )
              ) : (
                <Login setUser={setUser} />
              )
            } 
          />
          <Route 
            path="/admin" 
            element={
              user?.is_superuser ? (
                isSubscriptionLocked ? (
                  <SubscriptionWall onClose={() => setIsSubscriptionLocked(false)} />
                ) : (
                  <UsuariosPage />
                )
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/facturacion" 
            element={
              user ? (
                isSubscriptionLocked ? (
                  <SubscriptionWall onClose={() => setIsSubscriptionLocked(false)} />
                ) : (
                  <FacturacionPage user={user} setUser={setUser} />
                )
              ) : (
                <Navigate to="/" />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
