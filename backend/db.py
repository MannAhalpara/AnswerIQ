from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Missing Supabase environment variables")

# Create client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# -------------------------------
# GENERIC HELPERS (VERY USEFUL)
# -------------------------------

def fetch_all(table: str):
    return supabase.table(table).select("*").execute().data


def fetch_by_id(table: str, id: str):
    return supabase.table(table).select("*").eq("id", id).single().execute().data


def insert_data(table: str, data: dict):
    return supabase.table(table).insert(data).execute().data


def insert_bulk(table: str, data: list):
    return supabase.table(table).insert(data).execute().data


def update_data(table: str, id: str, data: dict):
    return supabase.table(table).update(data).eq("id", id).execute().data


def delete_data(table: str, id: str):
    return supabase.table(table).delete().eq("id", id).execute().data