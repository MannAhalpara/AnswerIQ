import os
import sys
import shutil
import json
import uuid
from typing import Dict

# Add Project root to path to import components
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from AI_OCR.Image_extracter import extract_images_from_pdf
    from AI_OCR.OCR import run_ocr_on_images
except ImportError as e:
    print(f"⚠️ Warning: Could not import AI OCR components: {e}")

# Global job status store
jobs: Dict[str, dict] = {}

def update_job_status(job_id: str, status: str, message: str = ""):
    if job_id in jobs:
        jobs[job_id]["status"] = status
        if message:
            jobs[job_id]["message"] = message

def normalize_question_number(q_num: str) -> str:
    """Normalizes question numbers: converts circled digits to plain, removes all prefixes."""
    if not q_num:
        return ""
    
    # Map circled numbers to plain digits
    circle_map = {
        '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5',
        '⑥': '6', '⑦': '7', '⑧': '8', '⑨': '9', '⑩': '10',
        '⑪': '11', '⑫': '12', '⑬': '13', '⑭': '14', '⑮': '15',
        '⑯': '16', '⑰': '17', '⑱': '18', '⑲': '19', '⑳': '20'
    }
    
    normalized = str(q_num).strip()
    for circle, digit in circle_map.items():
        normalized = normalized.replace(circle, digit)
    
    # Remove common prefixes and symbols like Q, Q-, Q., Question, #
    import re
    # Remove anything that's not alphanumeric at the start, or common labels
    normalized = re.sub(r'^(question|q|#)[-\.\s]?', '', normalized, flags=re.IGNORECASE)
    # Further clean any leading non-alphanumeric characters (like dashes, dots)
    normalized = re.sub(r'^[^a-zA-Z0-9]+', '', normalized)
    
    return normalized.strip()

async def process_ocr_job(job_id: str, file_path: str, mode: str, metadata: dict, supabase_client):
    """
    Background task to process PDF through OCR and save to Database.
    Automatically cleans up files after completion.
    """
    temp_img_folder = f"temp_images_{job_id}"
    
    try:
        # Step 1: Extract Images
        update_job_status(job_id, "Extracting", "Extracting images from PDF...")
        image_paths = extract_images_from_pdf(file_path, output_folder=temp_img_folder)
        
        if not image_paths:
            raise Exception("No images could be extracted from the PDF.")

        # Step 2: Run AI OCR
        update_job_status(job_id, "OCR", "Running AI OCR on extracted images...")
        json_result_str = run_ocr_on_images(image_paths, mode=mode)
        
        try:
            extracted_data = json.loads(json_result_str)
            if isinstance(extracted_data, dict) and "error" in extracted_data:
                raise Exception(extracted_data["error"])
        except Exception as e:
            raise Exception(f"Failed to process AI OCR output: {str(e)}")

        # Step 3: Save to Database
        update_job_status(job_id, "Saving", "Storing extracted data in Database...")
        
        course_id = metadata.get("course_id")
        
        # Get Course Code for formatting
        course_resp = supabase_client.table("courses").select("code").eq("id", course_id).single().execute()
        course_code = course_resp.data.get("code", "COURSE") if course_resp.data else "COURSE"

        if mode == "faculty":
            # Overwrite Logic: Delete old questions for this course before inserting new ones
            print(f"🗑️ Overwriting: Deleting existing questions for course {course_id}")
            supabase_client.table("questions").delete().eq("course_id", course_id).execute()

            # Store in questions table
            questions_to_insert = []
            for item in extracted_data:
                q_num_raw = str(item.get("question_number", ""))
                clean_q_num = normalize_question_number(q_num_raw)
                # target format: ICT101 Q-1
                formatted_q_num = f"{course_code} Q-{clean_q_num}" if clean_q_num else ""
                
                questions_to_insert.append({
                    "course_id": course_id,
                    "faculty_id": metadata.get("faculty_id"),
                    "question_number": formatted_q_num,
                    "question_text": item.get("question_text", ""),
                    "reference_answer": item.get("reference_answer", ""),
                    "max_marks": int(item.get("max_marks", 0))
                })
            if questions_to_insert:
                supabase_client.table("questions").insert(questions_to_insert).execute()
        else:
            # Student mode: Store in answers table
            student_id = metadata.get("student_id")
            faculty_id = metadata.get("faculty_id")
            
            # Overwrite Logic: Delete old answers for this student/course
            print(f"🗑️ Overwriting: Deleting existing answers for student {student_id} in course {course_id}")
            supabase_client.table("answers").delete().eq("student_id", student_id).eq("course_id", course_id).execute()

            # Fetch reference questions for this course to map student answers
            questions_resp = supabase_client.table("questions").select("id", "question_number").eq("course_id", course_id).execute()
            # Map of formatted_q_num -> question_id
            questions_map = {q["question_number"]: q["id"] for q in questions_resp.data}
            
            # Create a list for database insertion
            answers_to_insert = []
            answered_question_ids = set()

            # First, process answers provided by the student
            for item in extracted_data:
                q_num_raw = str(item.get("question_number", ""))
                clean_q_num = normalize_question_number(q_num_raw)
                # target format: ICT101 Q-1
                formatted_q_num = f"{course_code} Q-{clean_q_num}" if clean_q_num else ""
                
                q_id = questions_map.get(formatted_q_num)
                if q_id:
                    answered_question_ids.add(q_id)
                
                answers_to_insert.append({
                    "student_id": student_id,
                    "course_id": course_id,
                    "question_id": q_id, # Can be None if AI hallucinated a question number
                    "question_number": formatted_q_num,
                    "faculty_id": faculty_id,
                    "answer_text": item.get("student_answer", ""),
                    "upload_id": None # Will be updated if needed
                })
            
            # Second, identify missing answers (questions student didn't answer)
            for q in questions_resp.data:
                if q["id"] not in answered_question_ids:
                    print(f"📝 Recording missing answer for student {student_id}, question {q['question_number']}")
                    answers_to_insert.append({
                        "student_id": student_id,
                        "course_id": course_id,
                        "question_id": q["id"],
                        "question_number": q["question_number"],
                        "faculty_id": faculty_id,
                        "answer_text": "not answered",
                        "upload_id": None
                    })
            
            if answers_to_insert:
                supabase_client.table("answers").insert(answers_to_insert).execute()

        # Step 4: Create Upload Record (Only on success)
        display_filename = os.path.basename(file_path)
        if mode == "student" and student_id:
            try:
                student_res = supabase_client.table("students").select("name").eq("id", student_id).single().execute()
                if student_res.data:
                    display_filename = f"{student_res.data['name']} - {display_filename}"
            except:
                pass

        upload_data = {
            "department_id": metadata.get("department_id"),
            "course_id": course_id,
            "type": "reference_answer" if mode == "faculty" else "student_answer",
            "uploaded_by": metadata.get("uploaded_by"),
            "file_name": display_filename
        }
        upload_resp = supabase_client.table("uploads").insert(upload_data).execute()
        
        # Link answers to the new upload record if possible
        if upload_resp.data and mode == "student":
            new_upload_id = upload_resp.data[0]["id"]
            supabase_client.table("answers").update({"upload_id": new_upload_id}).eq("student_id", student_id).eq("course_id", course_id).is_("upload_id", "null").execute()

        update_job_status(job_id, "Completed", "Success! Data processed and saved.")

    except Exception as e:
        print(f"❌ OCR Job Failed: {str(e)}")
        update_job_status(job_id, "Failed", str(e))
    
    finally:
        # Cleanup
        print(f"🧹 Cleaning up temporary files for job {job_id}")
        if os.path.exists(file_path):
            os.remove(file_path)
        if os.path.exists(temp_img_folder):
            shutil.rmtree(temp_img_folder)
