/**
 * Servicio para gestión de usuarios SSO
 * Maneja todas las peticiones API relacionadas con usuarios
 */

const API_BASE = '/api/admin/users'

export const usuariosService = {
  /**
   * Obtener todos los usuarios
   */
  async getAll() {
    const response = await fetch(API_BASE, {
      credentials: 'include'
    })
    if (!response.ok) {
      throw new Error('Error al cargar usuarios')
    }
    const data = await response.json()
    return data.users
  },

  /**
   * Crear un nuevo usuario
   */
  async create(userData) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData),
      credentials: 'include'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al crear usuario')
    }
    
    return await response.json()
  },

  /**
   * Actualizar un usuario existente
   */
  async update(userId, userData) {
    const response = await fetch(`${API_BASE}/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData),
      credentials: 'include'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al actualizar usuario')
    }
    
    return await response.json()
  },

  /**
   * Eliminar un usuario
   */
  async delete(userId) {
    const response = await fetch(`${API_BASE}/${userId}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al eliminar usuario')
    }
    
    return await response.json()
  }
}
