from db import supabase

try:
    res = supabase.table("departments").select("*").execute()
    print("✅ Connected successfully!")
    print("Data:", res.data)
except Exception as e:
    print("❌ Connection failed!")
    print(e)