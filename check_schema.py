#!/usr/bin/env python3
"""
Script para verificar la estructura de la tabla usuarios_sso
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

# Obtener un usuario de ejemplo para ver las columnas
response = supabase.table('empresa_suscripciones').select("*").limit(1).execute()

if response.data:
    user = response.data[0]
    print("Columnas disponibles en usuarios_sso:")
    print("-" * 50)
    for key, value in user.items():
        print(f"  {key}: {type(value).__name__} = {value}")
else:
    print("No hay usuarios en la tabla")
