import { useState } from 'react'

function UsuariosTable({ users, currentUserId, onEdit, onDelete }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span 
          className="badge"
          style={{ 
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            color: 'white',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600'
          }}
        >
          Admin
        </span>
      )
    }
    if (role === 'true' || role === true) {
      return (
        <span 
          className="badge"
          style={{ 
            background: '#dcfce7',
            color: '#16a34a',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600'
          }}
        >
          Activo
        </span>
      )
    }
    return (
      <span 
        className="badge"
        style={{ 
          background: '#f1f5f9',
          color: '#64748b',
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '600'
        }}
      >
        Sin acceso
      </span>
    )
  }

  const handleDeleteClick = (user) => {
    if (deleteConfirm === user.id) {
      onDelete(user.id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(user.id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0" style={{ fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
            <th 
              className="text-uppercase" 
              style={{ 
                padding: '16px 24px',
                fontSize: '11px',
                fontWeight: '700',
                color: '#64748b',
                letterSpacing: '0.5px',
                background: '#f8fafc'
              }}
            >
              Usuario
            </th>
            <th 
              className="text-uppercase text-center" 
              style={{ 
                padding: '16px 12px',
                fontSize: '11px',
                fontWeight: '700',
                color: '#64748b',
                letterSpacing: '0.5px',
                background: '#f8fafc'
              }}
            >
              Órdenes
            </th>
            <th 
              className="text-uppercase text-center" 
              style={{ 
                padding: '16px 12px',
                fontSize: '11px',
                fontWeight: '700',
                color: '#64748b',
                letterSpacing: '0.5px',
                background: '#f8fafc'
              }}
            >
              Construcción
            </th>
            <th 
              className="text-uppercase text-center" 
              style={{ 
                padding: '16px 12px',
                fontSize: '11px',
                fontWeight: '700',
                color: '#64748b',
                letterSpacing: '0.5px',
                background: '#f8fafc'
              }}
            >
              Flota
            </th>
            <th 
              className="text-uppercase text-center" 
              style={{ 
                padding: '16px 12px',
                fontSize: '11px',
                fontWeight: '700',
                color: '#64748b',
                letterSpacing: '0.5px',
                background: '#f8fafc'
              }}
            >
              Logística
            </th>
            <th 
              className="text-uppercase text-end" 
              style={{ 
                padding: '16px 24px',
                fontSize: '11px',
                fontWeight: '700',
                color: '#64748b',
                letterSpacing: '0.5px',
                background: '#f8fafc'
              }}
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr 
              key={user.id} 
              style={{ 
                borderBottom: index === users.length - 1 ? 'none' : '1px solid #f1f5f9',
                transition: 'background 0.2s'
              }}
            >
              <td style={{ padding: '16px 24px' }}>
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: user.is_superuser 
                        ? 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)'
                        : '#f1f5f9',
                      color: user.is_superuser ? 'white' : '#64748b',
                      fontSize: '15px',
                      fontWeight: '600'
                    }}
                  >
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>
                      {user.email}
                    </div>
                    <div className="d-flex align-items-center gap-2" style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {user.is_superuser && (
                        <span 
                          className="badge"
                          style={{ 
                            background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                            color: 'white',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '600'
                          }}
                        >
                          <i className="bi bi-shield-check me-1"></i>
                          Superusuario
                        </span>
                      )}
                      {String(currentUserId) === String(user.id) && (
                        <span style={{ color: '#0d9488' }}>
                          <i className="bi bi-person-check me-1"></i>
                          Tú
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td className="text-center align-middle" style={{ padding: '16px 12px' }}>
                {getRoleBadge(user.rol_ordenes)}
              </td>
              <td className="text-center align-middle" style={{ padding: '16px 12px' }}>
                {getRoleBadge(user.rol_produccion)}
              </td>
              <td className="text-center align-middle" style={{ padding: '16px 12px' }}>
                {getRoleBadge(user.rol_flota)}
              </td>
              <td className="text-center align-middle" style={{ padding: '16px 12px' }}>
                {getRoleBadge(user.rol_logistica)}
              </td>
              <td className="text-end align-middle" style={{ padding: '16px 24px' }}>
                <div className="d-flex justify-content-end gap-2">
                  <button 
                    className="btn btn-sm d-flex align-items-center justify-content-center"
                    onClick={() => onEdit(user)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#475569',
                      padding: 0,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#0d9488'
                      e.currentTarget.style.color = 'white'
                      e.currentTarget.style.borderColor = '#0d9488'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc'
                      e.currentTarget.style.color = '#475569'
                      e.currentTarget.style.borderColor = '#e2e8f0'
                    }}
                    title="Editar usuario"
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  
                  {String(currentUserId) !== String(user.id) && (
                    <button 
                      className="btn btn-sm d-flex align-items-center justify-content-center"
                      onClick={() => handleDeleteClick(user)}
                      style={{
                        minWidth: deleteConfirm === user.id ? '100px' : '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: deleteConfirm === user.id ? '#dc2626' : '#f8fafc',
                        border: deleteConfirm === user.id ? '1px solid #dc2626' : '1px solid #e2e8f0',
                        color: deleteConfirm === user.id ? 'white' : '#475569',
                        padding: deleteConfirm === user.id ? '0 12px' : 0,
                        transition: 'all 0.2s',
                        fontSize: '13px',
                        fontWeight: deleteConfirm === user.id ? '500' : '400'
                      }}
                      onMouseEnter={(e) => {
                        if (deleteConfirm !== user.id) {
                          e.currentTarget.style.background = '#fee2e2'
                          e.currentTarget.style.color = '#dc2626'
                          e.currentTarget.style.borderColor = '#fecaca'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (deleteConfirm !== user.id) {
                          e.currentTarget.style.background = '#f8fafc'
                          e.currentTarget.style.color = '#475569'
                          e.currentTarget.style.borderColor = '#e2e8f0'
                        }
                      }}
                      title={deleteConfirm === user.id ? 'Confirmar eliminación' : 'Eliminar usuario'}
                    >
                      {deleteConfirm === user.id ? (
                        <>¿Confirmar?</>
                      ) : (
                        <i className="bi bi-trash"></i>
                      )}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UsuariosTable