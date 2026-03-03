import { useState } from 'react'
import { Pencil, Trash2, ShieldCheck } from 'lucide-react'

function UsuariosTable({ users, currentUserId, onEdit, onDelete }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span
          style={{
            background: 'rgba(59,130,246,0.1)',
            color: '#60a5fa',
            border: '1px solid rgba(59,130,246,0.2)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.3px'
          }}
        >
          Admin
        </span>
      )
    }
    if (role === 'true' || role === true) {
      return (
        <span
          style={{
            background: 'rgba(34,197,94,0.1)',
            color: '#4ade80',
            border: '1px solid rgba(34,197,94,0.2)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.3px'
          }}
        >
          Activo
        </span>
      )
    }
    return (
      <span
        style={{
          background: 'rgba(255,255,255,0.04)',
          color: '#52525b',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '0.3px'
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
    <div style={{ overflowX: 'auto', background: 'transparent' }}>
      <style>{`
        .somyl-table, .somyl-table th, .somyl-table td,
        .somyl-table tbody tr, .somyl-table thead tr {
          background-color: transparent !important;
          color: inherit;
        }
        .somyl-table tbody tr:hover td,
        .somyl-table tbody tr:hover th {
          background-color: rgba(255,255,255,0.03) !important;
        }
      `}</style>
      <table className="somyl-table w-100" style={{ fontSize: '14px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <th className="py-3 px-4 text-uppercase" style={{ fontSize: '11px', fontWeight: '600', color: '#52525b', letterSpacing: '0.6px', background: 'transparent', border: 'none' }}>Usuario</th>
            <th className="py-3 px-4 text-uppercase text-center" style={{ fontSize: '11px', fontWeight: '600', color: '#52525b', letterSpacing: '0.6px', background: 'transparent', border: 'none' }}>Órdenes</th>
            <th className="py-3 px-4 text-uppercase text-center" style={{ fontSize: '11px', fontWeight: '600', color: '#52525b', letterSpacing: '0.6px', background: 'transparent', border: 'none' }}>Construcción</th>
            <th className="py-3 px-4 text-uppercase text-center" style={{ fontSize: '11px', fontWeight: '600', color: '#52525b', letterSpacing: '0.6px', background: 'transparent', border: 'none' }}>Flota</th>
            <th className="py-3 px-4 text-uppercase text-center" style={{ fontSize: '11px', fontWeight: '600', color: '#52525b', letterSpacing: '0.6px', background: 'transparent', border: 'none' }}>Logística</th>
            <th className="py-3 px-4 text-uppercase text-center" style={{ fontSize: '11px', fontWeight: '600', color: '#52525b', letterSpacing: '0.6px', background: 'transparent', border: 'none' }}>RRHH</th>
            <th className="py-3 px-4 text-uppercase text-end" style={{ fontSize: '11px', fontWeight: '600', color: '#52525b', letterSpacing: '0.6px', background: 'transparent', border: 'none' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                transition: 'background 0.15s ease'
              }}
            >
              <td style={{ padding: '16px 24px', background: 'transparent', border: 'none' }}>
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: user.is_superuser
                        ? 'rgba(14,165,233,0.12)'
                        : 'rgba(255,255,255,0.06)',
                      border: user.is_superuser
                        ? '1px solid rgba(14,165,233,0.25)'
                        : '1px solid rgba(255,255,255,0.08)',
                      color: user.is_superuser ? '#38bdf8' : '#71717a',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', color: '#e4e4e7', fontSize: '13.5px' }}>
                      {user.email}
                    </div>
                    <div className="d-flex align-items-center gap-2" style={{ marginTop: '2px' }}>
                      {user.is_superuser && (
                        <span className="d-flex align-items-center gap-1" style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '600' }}>
                          <ShieldCheck size={11} strokeWidth={2} />
                          Superusuario
                        </span>
                      )}
                      {String(currentUserId) === String(user.id) && (
                        <span style={{ fontSize: '11px', color: '#52525b' }}>(Tú)</span>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td className="text-center" style={{ background: 'transparent', border: 'none' }}>{getRoleBadge(user.rol_ordenes)}</td>
              <td className="text-center" style={{ background: 'transparent', border: 'none' }}>{getRoleBadge(user.rol_produccion)}</td>
              <td className="text-center" style={{ background: 'transparent', border: 'none' }}>{getRoleBadge(user.rol_flota)}</td>
              <td className="text-center" style={{ background: 'transparent', border: 'none' }}>{getRoleBadge(user.rol_logistica)}</td>
              <td className="text-center" style={{ background: 'transparent', border: 'none' }}>{getRoleBadge(user.rol_rrhh)}</td>
              <td className="text-end" style={{ padding: '16px 24px', background: 'transparent', border: 'none' }}>
                <div className="d-flex justify-content-end gap-2">
                  <button
                    onClick={() => onEdit(user)}
                    title="Editar"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#38bdf8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(14,165,233,0.12)'
                      e.currentTarget.style.borderColor = 'rgba(14,165,233,0.3)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                    }}
                  >
                    <Pencil size={13} strokeWidth={1.5} />
                  </button>

                  {String(currentUserId) !== String(user.id) && (
                    <button
                      onClick={() => handleDeleteClick(user)}
                      title="Eliminar"
                      style={{
                        height: '32px',
                        minWidth: deleteConfirm === user.id ? '84px' : '32px',
                        borderRadius: '8px',
                        border: deleteConfirm === user.id
                          ? '1px solid rgba(239,68,68,0.4)'
                          : '1px solid rgba(255,255,255,0.08)',
                        background: deleteConfirm === user.id
                          ? 'rgba(239,68,68,0.15)'
                          : 'rgba(255,255,255,0.05)',
                        color: deleteConfirm === user.id ? '#f87171' : '#71717a',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        fontSize: '12px',
                        fontWeight: deleteConfirm === user.id ? '600' : '400',
                        padding: deleteConfirm === user.id ? '0 12px' : '0',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {deleteConfirm === user.id
                        ? 'Confirmar'
                        : <Trash2 size={13} strokeWidth={1.5} />
                      }
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