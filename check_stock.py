import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
supabase = create_client(url, key)

print('=== VERIFICANDO STOCK DEL PRODUCTO ESPECÍFICO ===')
# Verificar stock del producto que el usuario mencionó (10302520211)
response = supabase.table('product_locations').select('*, products(code, name), locations(full_code)').eq('products.code', '10302520211').execute()
if response.data:
    print('Stock del KIT RETENCIÓN D.13,6MM 120M SPAN 200M (10302520211):')
    for item in response.data:
        print(f'  ID: {item["id"]}')
        print(f'  Ubicación: {item["locations"]["full_code"]}')
        print(f'  Cantidad: {item["quantity"]}')
        print(f'  Warehouse: {item["warehouse_id"]}')
        print()
else:
    print('No se encontró stock para este producto')

print('=== VERIFICANDO MOVEMENTS MÁS RECIENTES ===')
# Verificar los movements más recientes para ver si incluyen rack operations
response = supabase.table('movements').select('*').eq('type', 'OUTBOUND').order('created_at', desc=True).limit(3).execute()
if response.data:
    for movement in response.data:
        other_data = movement.get('other_data', {})
        # Handle case where other_data might be a string
        if isinstance(other_data, str):
            try:
                import json
                other_data = json.loads(other_data)
            except:
                other_data = {}
        print(f'Movement: {movement["document_number"]}')
        print(f'  Product ID: {movement["product_id"]}')
        print(f'  Quantity: {movement["quantity"]}')
        print(f'  Is Rack: {other_data.get("is_rack", "N/A")}')
        print(f'  Source ID: {other_data.get("source_id", "N/A")}')
        print()