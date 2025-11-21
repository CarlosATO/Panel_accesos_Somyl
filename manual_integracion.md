📘 MANUAL DE INTEGRACIÓN SSO (Flask + React)
1. Fase de Preparación (Entorno y Puertos)
Antes de tocar código, configuramos el terreno.

A. Definir el Puerto Fijo: Cada proyecto debe tener su propio puerto reservado para no chocar.

Portal: 5000

Órdenes: 5001

Fibra: 5002

Flota: 5003

Herramientas: 5004

Acción: Editar el final del app.py (o run.py) del proyecto destino:

Python

if __name__ == '__main__':
    app.run(debug=True, port=500X) # Cambiar X por el número correcto
B. La Llave Maestra (.env): Copiar la clave compartida en el archivo .env del proyecto destino.

Bash

JWT_SECRET_KEY="sso_super_secret_key_2025_#998877_secure_v1"
C. Sincronización de Usuarios (Base de Datos): Asegurar que el usuario (ej. carlos@empresa.com) existe tanto en la tabla usuarios_sso del Portal como en la tabla de usuarios del proyecto destino, con el mismo email.

2. Fase Backend (Flask)
Debemos modificar 3 archivos en el backend del proyecto.

Paso 2.1: Habilitar CORS (app.py / __init__.py) Para que el Frontend (React) pueda hablar con el Backend en puertos distintos.

Python

from flask_cors import CORS

app = Flask(__name__)
# Habilitar CORS permisivo para desarrollo
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
Paso 2.2: La Ruta de Recepción (app.py) Creamos la "puerta trasera" que recibe el token y lo lanza al Frontend.

Python

from flask import redirect, request
import jwt

@app.route('/sso/login')
def sso_receiver():
    token = request.args.get('token')
    if not token: return "Error: Token no recibido", 400

    try:
        # Extraemos email solo para cosmética (la seguridad real va en auth.py)
        payload = jwt.decode(token, options={"verify_signature": False})
        email = payload.get('email', '')
    except:
        email = ''

    # REDIRECCIÓN AL FRONTEND (Puerto 5173 o el que use tu Vite)
    # Pasamos el token como parámetro en la URL
    frontend_url = f"http://localhost:5173/login?sso_token={token}&sso_user={email}"
    
    return redirect(frontend_url)
Paso 2.3: El Guardia Híbrido (auth.py) Actualizamos la lógica para que acepte tanto tokens viejos como los nuevos del SSO.

Función decode_token: Debe intentar decodificar primero con os.getenv('JWT_SECRET_KEY').

Función get_user_from_token: Debe buscar al usuario por email si el token viene del SSO.

3. Fase Frontend (React / Vite)
Solo tocamos el archivo del Login (Login.jsx, App.jsx, etc.).

Acción: Agregar este bloque useEffect al inicio del componente de Login para capturar el token "al vuelo".

JavaScript

import { useEffect } from 'react';

// Dentro de tu componente Login:
useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get('sso_token');
    const ssoUser = params.get('sso_user');

    if (ssoToken) {
        console.log("⚡️ SSO Token detectado. Ingresando...");
        
        // Guardamos las credenciales
        localStorage.setItem('authToken', ssoToken);
        localStorage.setItem('token', ssoToken); // Compatibilidad
        localStorage.setItem('userName', ssoUser || 'Usuario SSO');
        
        // Limpiamos la URL y entramos
        window.history.replaceState({}, document.title, "/");
        window.location.href = "/"; 
    }
}, []);
4. Fase Final (Conexión en el Portal)
Finalmente, vamos al proyecto Portal (app.py) y actualizamos el enlace para que apunte a la nueva ruta.

Python

links = {
    # Usar 127.0.0.1 y el puerto correcto del backend destino
    'nuevo_proyecto': f"http://127.0.0.1:500X/sso/login?token={token_sso}",
}
Diagrama del Flujo Final
Para que nunca se te olvide cómo funciona la "magia" que acabamos de crear, aquí está el esquema:

Configuración del Logout (Cierre de Ciclo)
Objetivo: Evitar que el usuario quede atrapado en el Login de la aplicación satélite al cerrar sesión. Al salir, debe ser devuelto automáticamente al Portal Central.

Archivo a modificar: El componente Frontend donde reside el botón "Salir" (ej: TopBar.jsx, Navbar.jsx, Sidebar.jsx o AuthContext.jsx).

Lógica Implementada:

Interceptar la acción de logout.

Limpiar credenciales locales (localStorage).

Forzar redirección externa hacia la Raíz del Portal.

Código Estándar para Replicar:
Sustituir la función de logout original por esta lógica:

JavaScript

const handleLogoutClick = () => {
    // 1. Ejecutar lógica interna de limpieza de React (si existe)
    // if (onLogout) onLogout(); 

    // 2. Limpieza de Seguridad (Borrar Tokens)
    localStorage.clear(); 
    // Opcional: localStorage.removeItem('authToken');

    // 3. REDIRECCIÓN DE RETORNO (Clave del Éxito)
    // Usamos 127.0.0.1 para coincidir con la cookie de sesión del Portal.
    // Apuntamos a la raíz "/" para que el Portal gestione el acceso.
    window.location.href = "http://127.0.0.1:5000/"; 
}
⚠️ Notas Críticas para el Documento:
Dominio Coherente: Si entraste al Portal por 127.0.0.1, el retorno debe ser a 127.0.0.1. No mezclar con localhost para no perder la cookie de sesión.

Ruta Raíz (/): Nunca redirigir directo a /dashboard. Siempre a /. El backend del Portal (app.py) es quien decide: si la sesión sigue viva, te pasa al dashboard; si no, te muestra el login. Esto evita errores 403 Forbidden.