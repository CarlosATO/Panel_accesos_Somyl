import { useState } from 'react'

function UsuariosTable({ users, currentUserId, onEdit, onDelete }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // SOMYL CORPORATE COLORS
  const brandCyan = '#00AEEF'
  const brandNavy = '#002855'

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span
          className="badge"
          style={{
            background: brandNavy,
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
            background: '#e0f2fe', // Light Cyan
            color: '#0284c7', // Darker Cyan/Blue
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
          color: '#94a3b8',
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
      <table className="table table-hover mb-0 align-middle" style={{ fontSize: '14px' }}>
        <thead className="bg-light">
          <tr>
            <th className="py-3 px-4 text-secondary text-uppercase small border-0" style={{ fontWeight: '600' }}>Usuario</th>
            <th className="py-3 px-4 text-secondary text-uppercase small text-center border-0" style={{ fontWeight: '600' }}>Órdenes</th>
            <th className="py-3 px-4 text-secondary text-uppercase small text-center border-0" style={{ fontWeight: '600' }}>Construcción</th>
            <th className="py-3 px-4 text-secondary text-uppercase small text-center border-0" style={{ fontWeight: '600' }}>Flota</th>
            <th className="py-3 px-4 text-secondary text-uppercase small text-center border-0" style={{ fontWeight: '600' }}>Logística</th>
            <th className="py-3 px-4 text-secondary text-uppercase small text-center border-0" style={{ fontWeight: '600' }}>RRHH</th>
            <th className="py-3 px-4 text-secondary text-uppercase small text-end border-0" style={{ fontWeight: '600' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr
              key={user.id}
              style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}
            >
              <td style={{ padding: '16px 24px' }}>
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: user.is_superuser ? brandNavy : '#f1f5f9',
                      color: user.is_superuser ? 'white' : '#64748b',
                      fontSize: '15px',
                      fontWeight: '600'
                    }}
                  >
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                      {user.email}
                    </div>
                    <div className="d-flex align-items-center gap-2" style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {user.is_superuser && (
                        <span className="text-primary fw-bold" style={{ fontSize: '11px', color: brandCyan }}>
                          <i className="bi bi-shield-check me-1"></i> Superusuario
                        </span>
                      )}
                      {String(currentUserId) === String(user.id) && (
                        <span className="text-secondary">
                          (Tú)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td className="text-center">{getRoleBadge(user.rol_ordenes)}</td>
              <td className="text-center">{getRoleBadge(user.rol_produccion)}</td>
              <td className="text-center">{getRoleBadge(user.rol_flota)}</td>
              <td className="text-center">{getRoleBadge(user.rol_logistica)}</td>
              <td className="text-center">{getRoleBadge(user.rol_rrhh)}</td>
              <td className="text-end" style={{ padding: '16px 24px' }}>
                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-sm d-flex align-items-center justify-content-center border-0 text-primary bg-light"
                    onClick={() => onEdit(user)}
                    style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                    title="Editar"
                  >
                    <i className="bi bi-pencil-fill"></i>
                  </button>

                  {String(currentUserId) !== String(user.id) && (
                    <button
                      className={`btn btn-sm d-flex align-items-center justify-content-center border-0 ${deleteConfirm === user.id ? 'btn-danger text-white' : 'text-danger bg-light'}`}
                      onClick={() => handleDeleteClick(user)}
                      style={{ height: '32px', borderRadius: '8px', minWidth: deleteConfirm === user.id ? '80px' : '32px', transition: 'all 0.2s' }}
                      title="Eliminar"
                    >
                      {deleteConfirm === user.id ? 'Confirmar' : <i className="bi bi-trash-fill"></i>}
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