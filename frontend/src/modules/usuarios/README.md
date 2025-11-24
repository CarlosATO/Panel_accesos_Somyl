# Módulo de Gestión de Usuarios SSO

Este módulo contiene toda la lógica y UI para administrar usuarios del sistema SSO.

## 📁 Estructura

```
modules/usuarios/
├── index.js                    # Punto de entrada del módulo
├── UsuariosPage.jsx           # Componente principal (página completa)
├── useUsuarios.js             # Hook personalizado para lógica de estado
├── usuariosService.js         # Servicio para llamadas API
└── components/                # Componentes reutilizables
    ├── UsuarioModal.jsx       # Modal para crear/editar usuarios
    └── UsuariosTable.jsx      # Tabla de usuarios con acciones
```

## 🎯 Funcionalidades

- ✅ Listar todos los usuarios
- ✅ Crear nuevos usuarios
- ✅ Editar usuarios existentes
- ✅ Eliminar usuarios
- ✅ Gestionar roles por aplicación (Admin/Usuario/Sin acceso)
- ✅ Validación de formularios
- ✅ Mensajes de éxito/error

## 🔧 Uso

### Importar el módulo completo
```jsx
import { UsuariosPage } from './modules/usuarios'

// En tu router
<Route path="/admin" element={<UsuariosPage />} />
```

### Usar el servicio directamente
```jsx
import { usuariosService } from './modules/usuarios'

// Obtener usuarios
const users = await usuariosService.getAll()

// Crear usuario
await usuariosService.create({
  email: 'nuevo@example.com',
  password: '123456',
  roles: {
    ordenes: 'admin',
    fibra: 'true',
    flota: 'false',
    herramientas: 'false'
  }
})
```

### Usar el hook personalizado
```jsx
import { useUsuarios } from './modules/usuarios'

function MiComponente() {
  const { users, loading, error, createUser } = useUsuarios()
  
  // ... usar los datos y funciones
}
```

## 🎨 Componentes

### UsuariosPage
Página completa con toda la funcionalidad de gestión de usuarios.

### UsuarioModal
Modal reutilizable para formulario de creación/edición.

**Props:**
- `show`: boolean - Mostrar/ocultar modal
- `onHide`: function - Callback al cerrar
- `onSave`: function - Callback al guardar
- `editingUser`: object|null - Usuario a editar (null para crear)

### UsuariosTable
Tabla con lista de usuarios y acciones.

**Props:**
- `users`: array - Lista de usuarios
- `onEdit`: function - Callback al editar
- `onDelete`: function - Callback al eliminar

## 🔌 API Endpoints

El módulo consume estos endpoints:

- `GET /api/admin/users` - Listar usuarios
- `POST /api/admin/users` - Crear usuario
- `PUT /api/admin/users/:id` - Actualizar usuario
- `DELETE /api/admin/users/:id` - Eliminar usuario

## 📝 Estructura de Datos

```javascript
{
  id: "uuid",
  email: "usuario@example.com",
  password_hash: "hash",
  rol_ordenes: "admin" | "true" | "false",
  rol_fibra: "admin" | "true" | "false",
  rol_flota: "admin" | "true" | "false",
  rol_herramientas: "admin" | "true" | "false"
}
```

## 🚀 Modificaciones

Para agregar funcionalidades:

1. **Nueva columna en tabla**: Editar `components/UsuariosTable.jsx`
2. **Nuevo campo en formulario**: Editar `components/UsuarioModal.jsx`
3. **Nueva lógica de negocio**: Editar `useUsuarios.js` o `usuariosService.js`
4. **Nueva página**: Crear en el mismo nivel que `UsuariosPage.jsx`

## ⚠️ Importante

- Todas las peticiones incluyen `credentials: 'include'` para mantener la sesión
- Los roles pueden ser: `'admin'`, `'true'`, o `'false'` (como string)
- El hook `useUsuarios` maneja automáticamente loading y error states
