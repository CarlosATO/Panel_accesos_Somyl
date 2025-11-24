import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import { UsuariosPage } from './modules/usuarios'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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
        }
      } catch (error) {
        console.log('Not authenticated')
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Navigate to="/" />} />
          <Route path="/" element={user ? <Dashboard user={user} setUser={setUser} /> : <Login setUser={setUser} />} />
          <Route path="/admin" element={user?.is_superuser ? <UsuariosPage /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
