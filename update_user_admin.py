#!/usr/bin/env python3
"""
Script para actualizar rol_ordenes a 'admin' para habilitar permisos de administrador
"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print("ERROR: SUPABASE_URL o SUPABASE_KEY no definidas")
    exit(1)

supabase = create_client(url, key)

email = "carlosalegria@me.com"

# Buscar usuario
response = supabase.table('usuarios_sso').select('*').eq('email', email).execute()

if not response.data:
    print(f"Usuario {email} no encontrado")
    exit(1)

user = response.data[0]
print(f"Usuario encontrado: {user['email']}")
print(f"rol_ordenes actual: {user.get('rol_ordenes')}")

# Actualizar a admin
supabase.table('usuarios_sso').update({'rol_ordenes': 'admin'}).eq('id', user['id']).execute()

print(f"\n✓ Usuario {email} actualizado con rol_ordenes='admin'")
print("Cierra sesión y vuelve a iniciar sesión para ver el módulo de Usuarios SSO")
