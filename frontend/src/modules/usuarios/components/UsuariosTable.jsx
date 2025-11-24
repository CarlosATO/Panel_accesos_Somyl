/**
 * Componente Tabla de Usuarios
 * Muestra lista de usuarios con acciones
 */
import { Table, Button, Badge } from 'react-bootstrap'

function UsuariosTable({ users, onEdit, onDelete }) {
  const getRoleBadge = (role) => {
    if (role === 'admin') return <Badge bg="danger">Admin</Badge>
    if (role === 'true' || role === true) return <Badge bg="success">Activo</Badge>
    return <Badge bg="secondary">Sin acceso</Badge>
  }

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Email</th>
          <th>Órdenes</th>
          <th>Fibra</th>
          <th>Flota</th>
          <th>Herramientas</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.email}</td>
            
            <td>{getRoleBadge(user.rol_ordenes)}</td>
            <td>{getRoleBadge(user.rol_fibra)}</td>
            <td>{getRoleBadge(user.rol_flota)}</td>
            <td>{getRoleBadge(user.rol_herramientas)}</td>
            <td>
              <Button 
                variant="warning" 
                size="sm" 
                className="me-2"
                onClick={() => onEdit(user)}
              >
                <i className="bi bi-pencil"></i> Editar
              </Button>
              
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => {
                  if (window.confirm(`¿Eliminar usuario ${user.email}?`)) {
                    onDelete(user.id)
                  }
                }}
              >
                <i className="bi bi-trash"></i> Eliminar
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default UsuariosTable
