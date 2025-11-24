import { useState, useEffect } from 'react'
import { usuariosService } from './usuariosService'

export function useUsuarios() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await usuariosService.getAll()
      setUsers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const createUser = async (userData) => {
    try {
      setError('')
      await usuariosService.create(userData)
      await fetchUsers()
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const updateUser = async (userId, userData) => {
    try {
      setError('')
      await usuariosService.update(userId, userData)
      await fetchUsers()
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const deleteUser = async (userId) => {
    try {
      setError('')
      await usuariosService.delete(userId)
      await fetchUsers()
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  }
}
