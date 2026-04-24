import os
import sys
# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import supabase

def run_diagnostic():
    print("--- DIAGNOSTIC START ---")
    
    # 1. Check all courses
    courses = supabase.table("courses").select("id, name").execute()
    print(f"Total Courses: {len(courses.data)}")
    for c in courses.data:
        print(f" - Course ID: {c['id']}, Name: {c['name']}")
        
    # 2. Check all questions
    questions = supabase.table("questions").select("course_id").execute()
    print(f"Total Question Rows: {len(questions.data)}")
    
    # Map questions to course IDs
    q_course_ids = set()
    for q in questions.data:
        q_course_ids.add(q['course_id'])
        
    print(f"Unique Course IDs in Questions Table: {q_course_ids}")
    
    # 3. Check for specific Course "AI ML" (User mentioned)
    for c in courses.data:
        if "AI" in c['name'] or "ML" in c['name']:
            has_ref = c['id'] in q_course_ids
            print(f"Check Result for '{c['name']}': {has_ref} (Searching for ID: {c['id']})")
    
    print("--- DIAGNOSTIC END ---")

if __name__ == "__main__":
    run_diagnostic()
