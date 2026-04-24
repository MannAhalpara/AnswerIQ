from db import supabase
import bcrypt

# Function to hash password
def hash_password(password: str):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

# -------------------
# ADMIN PASSWORD
# -------------------
admin_email = "examination@example.com"
admin_password = "admin1234"

hashed_admin = hash_password(admin_password)

admin_result = supabase.table("admins").select("*").eq("email", admin_email).single().execute()
if admin_result.error:
    raise Exception(f"Failed to query admin account: {admin_result.error}")

if admin_result.data:
    supabase.table("admins").update({
        "password": hashed_admin
    }).eq("email", admin_email).execute()
    print("✅ Admin password updated")
else:
    supabase.table("admins").insert({
        "email": admin_email,
        "password": hashed_admin,
        "name": "Admin"
    }).execute()
    print("✅ Admin account created")

# -------------------
# FACULTY PASSWORDS
# -------------------
faculty_list = supabase.table("faculty").select("*").execute().data

for faculty in faculty_list:
    name = faculty["name"].split()[0].lower()  # first name
    password = name + "1234"

    hashed = hash_password(password)

    supabase.table("faculty").update({
        "password": hashed
    }).eq("id", faculty["id"]).execute()

    print(f"✅ Updated: {faculty['name']} → {password}")