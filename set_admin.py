#!/usr/bin/env python3
"""
Script para activar el rol de administrador a un usuario específico.
Uso: python set_admin.py <email>
"""
import sys
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

def set_admin_role(email):
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        print("ERROR: SUPABASE_URL o SUPABASE_KEY no definidas en .env")
        return
    
    supabase = create_client(url, key)
    
    # Buscar usuario por email
    response = supabase.table('usuarios_sso').select('*').eq('email', email).execute()
    
    if not response.data:
        print(f"Usuario con email '{email}' no encontrado.")
        return
    
    user = response.data[0]
    print(f"\nUsuario encontrado: {user['email']}")
    print(f"Roles actuales:")
    print(f"  - Admin: {user.get('rol_admin', False)}")
    print(f"  - Órdenes: {user.get('rol_ordenes', False)}")
    print(f"  - Fibra: {user.get('rol_fibra', False)}")
    print(f"  - Flota: {user.get('rol_flota', False)}")
    print(f"  - Herramientas: {user.get('rol_herramientas', False)}")
    
    # Actualizar el nuevo campo is_superuser
    supabase.table('usuarios_sso').update({'is_superuser': True}).eq('id', user['id']).execute()
    
    print(f"\n✓ Rol de administrador activado para {email}")
    print(f"Ahora puedes acceder al módulo de gestión de usuarios en el portal.")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python set_admin.py <email>")
        print("Ejemplo: python set_admin.py carlosalegria@me.com")
        sys.exit(1)
    
    email = sys.argv[1]
    set_admin_role(email)
