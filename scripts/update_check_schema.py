#!/usr/bin/env python3
"""
Script to update check_schema.py to include a sample query for empresa_suscripciones (MercadoPago).
"""
import io
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
check_file = ROOT / 'check_schema.py'

snippet = '''
# --- Auto-added: empresa_suscripciones check (MercadoPago) ---
try:
    response = supabase.table('empresa_suscripciones').select('*').limit(1).execute()
    if response.data:
        print("\\nempresa_suscripciones: columnas disponibles:")
        for key, value in response.data[0].items():
            print(f"  {key}: {type(value).__name__} = {value}")
    else:
        print("\\nempresa_suscripciones: tabla vacía o no existe")
except Exception as e:
    print("\\nempresa_suscripciones: error al consultar – ", e)
# --- End auto-added ---
'''

if not check_file.exists():
    print(f"check_schema.py no encontrado en {check_file}")
    raise SystemExit(1)

content = check_file.read_text(encoding='utf-8')
if 'empresa_suscripciones' in content:
    print('check_schema.py ya contiene referencias a empresa_suscripciones. No se hacen cambios.')
else:
    backup = check_file.with_suffix('.py.bak')
    check_file.replace(backup)
    new_content = backup.read_text(encoding='utf-8') + '\n\n' + snippet
    check_file.write_text(new_content, encoding='utf-8')
    print(f'check_schema.py actualizado. Backup guardado en {backup}')
