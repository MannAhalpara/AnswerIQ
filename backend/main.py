from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import bcrypt
from db import supabase
from ocr_service import jobs, process_ocr_job
import jwt
import os
import uuid
import shutil
from datetime import datetime, timedelta
import sys

# Add Evaluation folder to path so we can import evaluation.py
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Evaluation")))
from evaluation import score_answer

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

class LoginRequest(BaseModel):
    email: str
    password: str

class UpdatePasswordRequest(BaseModel):
    new_password: str

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/admin/login")
async def admin_login(request: LoginRequest):
    try:
        # Fetch admin by email
        result = supabase.table("admins").select("*").eq("email", request.email).execute()
        if not result.data:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        admin = result.data[0]
        if not verify_password(request.password, admin["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Create JWT token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": admin["id"], "role": "admin"}, expires_delta=access_token_expires
        )

        return {
            "token": access_token,
            "token_type": "bearer",
            "user": {
                "id": admin["id"],
                "name": admin["name"],
                "email": admin["email"]
            }
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.post("/faculty/login")
async def faculty_login(request: LoginRequest):
    try:
        # Fetch faculty by email
        result = supabase.table("faculty").select("*").eq("email", request.email).execute()
        if not result.data:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        faculty = result.data[0]
        if not verify_password(request.password, faculty["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Create JWT token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": faculty["id"], "role": "faculty"}, expires_delta=access_token_expires
        )

        return {
            "token": access_token,
            "token_type": "bearer",
            "user": {
                "id": faculty["id"],
                "name": faculty["name"],
                "email": faculty["email"],
                "department_id": faculty["department_id"]
            }
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

# Dependency to get current user
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None or role is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": user_id, "role": role}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/protected")
async def protected_route(current_user: dict = Depends(get_current_user)):
    return {"message": f"Hello {current_user['role']} with ID {current_user['id']}"}

@app.get("/faculty/dashboard-data")
async def get_faculty_dashboard_data(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    faculty_id = current_user["id"]
    
    try:
        # Get faculty info
        faculty_resp = supabase.table("faculty").select("*").eq("id", faculty_id).single().execute()
        faculty = faculty_resp.data
        
        # Get courses assigned to this faculty
        courses_resp = supabase.table("courses").select("*").eq("faculty_id", faculty_id).execute()
        courses = courses_resp.data
        course_ids = [c["id"] for c in courses]
        
        if not course_ids:
            return {
                "faculty_name": faculty["name"],
                "total_students": 0,
                "pending_evaluations": 0,
                "completed_evaluations": 0,
                "assigned_subjects": [],
                "students_list": []
            }
            
        # Get all students enrolled in these courses
        course_students_resp = supabase.table("course_students").select("student_id, course_id, students(id, name, usn)").in_("course_id", course_ids).execute()
        
        # Get all evaluation sessions for these courses to determine completion status
        sessions_resp = supabase.table("evaluation_sessions").select("*").in_("course_id", course_ids).execute()
        sessions_map = {(s["course_id"], s["student_id"]): s for s in sessions_resp.data}
        
        # Aggregate unique students
        unique_student_ids = set()
        students_list = []
        
        for item in course_students_resp.data:
            student = item["students"]
            if not student: continue
            
            unique_student_ids.add(student["id"])
            
            # Find subject name for this student's course
            course_name = next((c["name"] for c in courses if c["id"] == item["course_id"]), "N/A")
            
            # Check if answer sheet uploaded
            ans_check = supabase.table("answers").select("id").eq("course_id", item["course_id"]).eq("student_id", student["id"]).limit(1).execute()
            
            # Check status from evaluation_sessions
            session = sessions_map.get((item["course_id"], student["id"]))
            
            if session and session.get("status") == "completed":
                status = "Completed"
            elif ans_check.data:
                status = "Pending Evaluation"
            else:
                status = "Pending Upload"
            
            students_list.append({
                "id": f"{student['id']}-{item['course_id']}",
                "raw_student_id": student['id'],
                "raw_course_id": item['course_id'],
                "name": student["name"],
                "usn": student.get("usn", "N/A"),
                "subject": course_name,
                "status": status,
                "avatarSeed": hash(student["id"]) % 100
            })
            
        pending_count = len([s for s in students_list if s["status"] == "Pending Evaluation"])
        completed_count = len([s for s in students_list if s["status"] == "Completed"])
        
        return {
            "faculty_name": faculty["name"],
            "total_students": len(unique_student_ids),
            "pending_evaluations": pending_count,
            "completed_evaluations": completed_count,
            "assigned_subjects": [
                {"code": c["code"], "name": c["name"]} for c in courses
            ],
            "students_list": students_list
        }
        
    except Exception as e:
        print(f"Error fetching faculty dashboard data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/faculty/past-evaluations")
async def get_faculty_past_evaluations(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Not authorized")

    faculty_id = current_user["id"]
    try:
        # Get courses for this faculty
        courses_resp = supabase.table("courses").select("id, name").eq("faculty_id", faculty_id).execute()
        courses = courses_resp.data or []
        course_ids = [c["id"] for c in courses]

        if not course_ids:
            return {"evaluations": []}

        # Fetch completed evaluation sessions for these courses
        sessions_resp = supabase.table("evaluation_sessions").select("id, student_id, course_id, completed_at, total_marks, students(id, name, usn), courses(id, name)").in_("course_id", course_ids).eq("status", "completed").execute()

        sessions = sessions_resp.data or []

        # compute stats
        total_evaluations = len(sessions)
        this_month_count = 0
        marks_sum = 0
        marks_count = 0
        student_ids = set()

        result = []
        for s in sessions:
            student = s.get("students") or {}
            course = s.get("courses") or {}
            date_val = s.get("completed_at") or s.get("started_at")
            # format date as human readable string if available
            date_str = None
            if date_val:
                try:
                    dt = date_val if isinstance(date_val, str) else str(date_val)
                    date_str = dt
                except Exception:
                    date_str = str(date_val)

            # stats accumulation
            if s.get("student_id"):
                student_ids.add(s.get("student_id"))

            if s.get("total_marks") is not None:
                try:
                    marks_sum += float(s.get("total_marks"))
                    marks_count += 1
                except Exception:
                    pass

            # this month check
            try:
                if date_str:
                    dt_parsed = datetime.fromisoformat(date_str.replace('Z', '+00:00')) if 'T' in date_str or 'Z' in date_str else datetime.fromisoformat(date_str)
                    now_dt = datetime.utcnow()
                    if dt_parsed.year == now_dt.year and dt_parsed.month == now_dt.month:
                        this_month_count += 1
            except Exception:
                # ignore parse errors for this_month
                pass

            result.append({
                "id": s.get("id"),
                "name": student.get("name") or "Unknown",
                "usn": student.get("usn") or "",
                "subject": course.get("name") or "",
                "marks": s.get("total_marks") if s.get("total_marks") is not None else "",
                "date": date_str,
            })

        average_marks = (marks_sum / marks_count) if marks_count > 0 else None
        return {
            "evaluations": result,
            "stats": {
                "total_evaluations": total_evaluations,
                "this_month": this_month_count,
                "average_marks": average_marks,
                "students_evaluated": len(student_ids),
            }
        }
    except Exception as e:
        print(f"Error fetching past evaluations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/faculty/update-password")
async def update_faculty_password(request: UpdatePasswordRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Not authorized")
    faculty_id = current_user["id"]
    try:
        # Validate new password constraints
        if len(request.new_password) < 8:
            raise HTTPException(status_code=400, detail="New password must be at least 8 characters long")
        if not any(c.isupper() for c in request.new_password) or not any(c.islower() for c in request.new_password):
            raise HTTPException(status_code=400, detail="Password must contain both uppercase and lowercase letters")
        if not any(c.isdigit() for c in request.new_password):
            raise HTTPException(status_code=400, detail="Password must contain at least one number")
        # Hash new password
        hashed_password = get_password_hash(request.new_password)
        # Update password
        supabase.table("faculty").update({"password": hashed_password}).eq("id", faculty_id).execute()
        return {"message": "Password updated successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/dashboard/data")
async def get_dashboard_data():
    try:
        # Fetch all required data
        departments = supabase.table("departments").select("*").execute().data
        courses = supabase.table("courses").select("*").execute().data
        faculty = supabase.table("faculty").select("*").execute().data
        students = supabase.table("students").select("*").execute().data
        course_students = supabase.table("course_students").select("*").execute().data

        # Determine which courses have reference answers uploaded (Set of Course IDs)
        # We fetch all course_ids that have entries in the questions table
        questions_resp = supabase.table("questions").select("course_id").execute()
        courses_with_references = set()
        if questions_resp.data:
            for q in questions_resp.data:
                cid = str(q.get("course_id", "")).strip().lower()
                if cid:
                    courses_with_references.add(cid)
        
        from datetime import datetime
        print(f"🔍 [Dashboard Sync @ {datetime.now().strftime('%H:%M:%S')}] Found {len(courses_with_references)} unique courses with references.")
        if len(courses_with_references) > 0:
            print(f"📦 Active Course IDs: {list(courses_with_references)[:5]}...")

        # Map faculty by ID for quick lookup
        faculty_map = {f["id"]: f for f in faculty}
        
        # Map student counts by course ID
        course_student_counts = {}
        for cs in course_students:
            cid = cs["course_id"]
            course_student_counts[cid] = course_student_counts.get(cid, 0) + 1

        # Map total (unique) students by department ID
        dept_student_counts = {}
        for student in students:
            did = student["department_id"]
            dept_student_counts[did] = dept_student_counts.get(did, 0) + 1

        # Structure courses into departments
        response_data = []
        for dept in departments:
            dept_id = dept["id"]
            dept_courses = []
            
            for course in courses:
                if course["department_id"] == dept_id:
                    fid = course.get("faculty_id")
                    f_info = faculty_map.get(fid, {"name": "Unassigned", "email": ""})
                    
                    dept_courses.append({
                        "id": course["id"],
                        "name": course["name"],
                        "code": course["code"],
                        "faculty": {
                            "name": f_info["name"],
                            "email": f_info.get("email", ""),
                            "designation": f_info.get("designation", "Faculty")
                        },
                        "referenceUploaded": str(course["id"]).strip().lower() in courses_with_references,
                        "students": [{"id": i} for i in range(course_student_counts.get(course["id"], 0))]
                    })
            
            response_data.append({
                "id": dept["id"],
                "name": dept["name"],
                "description": f"Department of {dept['name']}", # Default description
                "total_students": dept_student_counts.get(dept["id"], 0),
                "courses": dept_courses
            })

        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard data: {str(e)}")

@app.get("/admin/course/{course_id}")
async def get_course_details(course_id: str):
    try:
        # Get course info
        course_result = supabase.table("courses").select("*").eq("id", course_id).execute()
        if not course_result.data:
            raise HTTPException(status_code=404, detail="Course not found")
        course = course_result.data[0]
        
        # Get faculty info
        faculty = supabase.table("faculty").select("*").eq("id", course["faculty_id"]).single().execute().data
        
        # Get department info
        department = supabase.table("departments").select("*").eq("id", course["department_id"]).single().execute().data
        
        # Get students enrolled in this course
        # Note: students table has id, name, usn
        students_result = supabase.table("course_students").select("student_id, students(id, name, usn)").eq("course_id", course_id).execute()
        
        # Format students list
        students = []
        for item in students_result.data:
            if not item.get("students"): continue
            s = item["students"]
            
            # Check if answer sheet is already uploaded for this course/student
            ans_check = supabase.table("answers").select("id").eq("course_id", course_id).eq("student_id", s["id"]).execute()
            
            students.append({
                "id": s["id"],
                "name": s["name"],
                "usn": s.get("usn", "N/A"),
                "uploadStatus": "Uploaded" if ans_check.data else "Pending",
                "avatarSeed": hash(s["id"]) % 100
            })

        # Check if reference is uploaded
        ref_check = supabase.table("questions").select("id").eq("course_id", course_id).execute()

        return {
            "id": course["id"],
            "name": course["name"],
            "code": course["code"],
            "department": department,
            "faculty": faculty,
            "students": students,
            "referenceUploaded": len(ref_check.data) > 0
        }
    except Exception as e:
        print(f"Error fetching course details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/upload/reference")
async def upload_reference(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    course_id: str = Form(...),
    department_id: str = Form(...),
    faculty_id: str = Form(...),
    admin_id: str = Form(...)
):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "Pending", "message": "Queueing process..."}
    
    # Save file temporarily
    temp_file_path = f"temp_{job_id}_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    metadata = {
        "course_id": course_id,
        "department_id": department_id,
        "faculty_id": faculty_id,
        "uploaded_by": admin_id
    }
    
    background_tasks.add_task(process_ocr_job, job_id, temp_file_path, "faculty", metadata, supabase)
    
    return {"job_id": job_id}

@app.post("/admin/upload/answer")
async def upload_answer(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    course_id: str = Form(...),
    student_id: str = Form(...),
    department_id: str = Form(...),
    faculty_id: str = Form(...),
    admin_id: str = Form(...)
):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "Pending", "message": "Queueing process..."}
    
    temp_file_path = f"temp_{job_id}_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    metadata = {
        "course_id": course_id,
        "student_id": student_id,
        "department_id": department_id,
        "faculty_id": faculty_id,
        "uploaded_by": admin_id
    }
    
    background_tasks.add_task(process_ocr_job, job_id, temp_file_path, "student", metadata, supabase)
    
    return {"job_id": job_id}

@app.get("/admin/job-status/{job_id}")
async def get_job_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]

@app.get("/admin/past-uploads")
async def get_past_uploads():
    try:
        # Fetch uploads with related information
        result = supabase.table("uploads").select(
            "id, type, file_name, created_at, departments(name), courses(name)"
        ).order("created_at", desc=True).execute()
        
        formatted_records = []
        for upload in result.data:
            type_map = {
                "question_paper": "Question Paper",
                "reference_answer": "Reference Answer",
                "student_answer": "Student Answer"
            }
            display_type = type_map.get(upload["type"], upload["type"].replace("_", " ").title())

            formatted_records.append({
                "id": upload["id"],
                "department": upload["departments"]["name"] if upload.get("departments") else "General",
                "course": upload["courses"]["name"] if upload.get("courses") else "N/A",
                "fileName": upload["file_name"], # This now contains student name if applicable
                "type": display_type,
                "uploadedBy": "Admin", 
                "date": datetime.fromisoformat(upload["created_at"].replace("Z", "+00:00")).strftime("%b %d, %Y")
            })
            
        return formatted_records
    except Exception as e:
        # Return empty list if table doesn't exist or other DB errors occur
        # rather than crashing the page
        print(f"🔹 Past Uploads: returning empty list due to: {str(e)}")
        return []

# ----------------- EVALUATION APIS -----------------

class StartSessionRequest(BaseModel):
    course_id: str
    student_id: str

@app.post("/faculty/evaluation/start")
async def start_evaluation_session(req: StartSessionRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    faculty_id = current_user["id"]
    
    try:
        # Check if session exists
        res = supabase.table("evaluation_sessions").select("*").eq("course_id", req.course_id).eq("student_id", req.student_id).eq("faculty_id", faculty_id).execute()
        
        if res.data:
            session = res.data[0]
        else:
            # Create session
            new_session = {
                "course_id": req.course_id,
                "student_id": req.student_id,
                "faculty_id": faculty_id,
                "status": "in_progress",
                "total_marks": 0
            }
            create_res = supabase.table("evaluation_sessions").insert(new_session).execute()
            if not create_res.data:
                 raise HTTPException(status_code=500, detail="Failed to create session")
            session = create_res.data[0]
            
        return {"session_id": session["id"], "status": session["status"]}
        
    except Exception as e:
        print(f"Error starting evaluation session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/faculty/evaluation/session/{session_id}")
async def get_evaluation_session(session_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    try:
        session_res = supabase.table("evaluation_sessions").select("*, students(*), courses(*), faculty(*)").eq("id", session_id).single().execute()
        if not session_res.data:
            raise HTTPException(status_code=404, detail="Session not found")
            
        session_data = session_res.data
        course_id = session_data["course_id"]
        student_id = session_data["student_id"]
        
        # Fetch Answers + related Questions
        answers_res = supabase.table("answers").select("*, questions(*)").eq("course_id", course_id).eq("student_id", student_id).order("question_id").execute()
        
        # Fetch existing Evaluations
        evals_res = supabase.table("evaluations").select("*").eq("session_id", session_id).execute()
        evals_map = {ev["answer_id"]: ev for ev in evals_res.data}
        
        import re
        questions_list = []
        for ans in answers_res.data:
            if not ans.get("questions"):
                 continue
            q = ans["questions"]
            
            ev = evals_map.get(ans["id"])
            
            raw_qnum = q.get("question_number", "Q?")
            
            # Look for something like Q-1, Q1, etc.
            q_match = re.search(r'Q[^\d]*(\d+)', raw_qnum, re.IGNORECASE)
            if q_match:
                q_digits = q_match.group(1)
                sort_val = int(q_digits)
                clean_qnum = f"Q-{q_digits}"
            else:
                clean_qnum = raw_qnum
                sort_val = 999
            
            questions_list.append({
                "answer_id": ans["id"],
                "question_id": q["id"],
                "question_number": clean_qnum,
                "_sort_val": sort_val,
                "question_text": q["question_text"],
                "max_marks": q["max_marks"],
                "reference_answer": q["reference_answer"],
                "student_answer": ans["answer_text"],
                "evaluation": ev  # will be None if not evaluated yet
            })
            
        questions_list.sort(key=lambda x: x["_sort_val"])
        for item in questions_list:
            del item["_sort_val"]
            
        return {
            "session": {
                "id": session_data["id"],
                "status": session_data["status"],
                "total_marks": session_data["total_marks"]
            },
            "student": {
                "name": session_data["students"]["name"],
                "usn": session_data["students"]["usn"]
            },
            "course": {
                "name": session_data["courses"]["name"]
            },
            "faculty": {
                "name": session_data["faculty"]["name"]
            },
            "items": questions_list
        }
    except Exception as e:
        print(f"Error fetching session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/faculty/evaluation/run/{answer_id}")
async def run_evaluation(answer_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    try:
        # Get answer + related question
        ans_res = supabase.table("answers").select("*, questions(*)").eq("id", answer_id).single().execute()
        if not ans_res.data or not ans_res.data.get("questions"):
             raise HTTPException(status_code=404, detail="Answer or Question not found")
             
        ans = ans_res.data
        q = ans["questions"]
        
        # Get session
        session_res = supabase.table("evaluation_sessions").select("id").eq("course_id", ans["course_id"]).eq("student_id", ans["student_id"]).execute()
        if not session_res.data:
            raise HTTPException(status_code=400, detail="Evaluation session not started")
        session_id = session_res.data[0]["id"]
        
        # Call evaluation.py python logic
        result = score_answer(
            question=q["question_text"],
            student_answer=ans["answer_text"],
            reference_answer=q["reference_answer"],
            max_marks=q["max_marks"]
        )
        
        # Save evaluation to db
        final_marks = result["final_score"]
        similarity_score = result["breakdown"]["semantic_similarity"]["score"]
        concept_score = result["breakdown"]["concept_coverage"]["score"]
        keywords_score = result["breakdown"]["keyword_matching"]["score"]
        
        # Concept & keyword info will be attached as JSON feedback effectively, but let's store standard score.
        # Format a nice feedback
        c_cov = len(result["breakdown"]["concept_coverage"].get("covered", []))
        c_tot = result["breakdown"]["concept_coverage"].get("total_concepts", 0)
        feedback_text = "Good" # Default
        
        new_eval = {
            "session_id": session_id,
            "answer_id": answer_id,
            "similarity_score": similarity_score,
            "keywords_score": keywords_score,
            "concept_score": concept_score,
            "final_marks": final_marks,
            "feedback": feedback_text
        }
        
        # Upsert
        check = supabase.table("evaluations").select("id").eq("answer_id", answer_id).execute()
        if check.data:
            eval_info = supabase.table("evaluations").update(new_eval).eq("id", check.data[0]["id"]).execute()
        else:
            eval_info = supabase.table("evaluations").insert(new_eval).execute()
            
        return {
            "evaluation": eval_info.data[0],
            "raw_result": result # pass raw back to frontend if they want to render breakdown visually
        }
        
    except Exception as e:
        print(f"Error running evaluation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

class EditEvaluationRequest(BaseModel):
    final_marks: float
    feedback: str
    
@app.put("/faculty/evaluation/{evaluation_id}")
async def edit_evaluation(evaluation_id: str, req: EditEvaluationRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    try:
        updated = supabase.table("evaluations").update({
            "final_marks": req.final_marks,
            "feedback": req.feedback
        }).eq("id", evaluation_id).execute()
        
        if not updated.data:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        return {"success": True, "evaluation": updated.data[0]}
    except Exception as e:
        print(f"Error updating evaluation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/faculty/evaluation/session/{session_id}/complete")
async def complete_session(session_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    try:
        # Sum total marks
        evals = supabase.table("evaluations").select("final_marks").eq("session_id", session_id).execute()
        total = sum([e.get("final_marks", 0) for e in evals.data]) if evals.data else 0
        
        updated = supabase.table("evaluation_sessions").update({
            "status": "completed",
            "total_marks": total,
            "completed_at": datetime.utcnow().isoformat()
        }).eq("id", session_id).execute()
        
        return {"success": True, "session": updated.data[0]}
    except Exception as e:
        print(f"Error completing session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)