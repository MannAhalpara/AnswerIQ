from db import supabase
import sys

def run_sql():
    sql = """
    create table if not exists public.uploads (
      id uuid not null default gen_random_uuid (),
      department_id uuid null,
      course_id uuid null,
      type text null,
      uploaded_by uuid null,
      file_name text null,
      created_at timestamp without time zone null default now(),
      constraint uploads_pkey primary key (id),
      constraint uploads_course_id_fkey foreign KEY (course_id) references courses (id),
      constraint uploads_department_id_fkey foreign KEY (department_id) references departments (id),
      constraint uploads_type_check check (
        (
          type = any (
            array[
              'question_paper'::text,
              'reference_answer'::text,
              'student_answer'::text
            ]
          )
        )
      )
    );

    create table if not exists public.questions (
      id uuid not null default gen_random_uuid (),
      course_id uuid null,
      faculty_id uuid null,
      question_text text not null,
      reference_answer text not null,
      max_marks integer not null,
      created_at timestamp without time zone null default now(),
      constraint questions_pkey primary key (id),
      constraint questions_course_id_fkey foreign KEY (course_id) references courses (id) on delete CASCADE,
      constraint questions_faculty_id_fkey foreign KEY (faculty_id) references faculty (id) on delete CASCADE
    ); 

    create table if not exists public.answers (
      id uuid not null default gen_random_uuid (),
      student_id uuid null,
      course_id uuid null,
      question_id uuid null,
      faculty_id uuid null,
      answer_text text not null,
      created_at timestamp without time zone null default now(),
      upload_id uuid null,
      constraint answers_pkey primary key (id),
      constraint answers_course_id_fkey foreign KEY (course_id) references courses (id) on delete CASCADE,
      constraint answers_faculty_id_fkey foreign KEY (faculty_id) references faculty (id) on delete CASCADE,
      constraint answers_question_id_fkey foreign KEY (question_id) references questions (id) on delete CASCADE,
      constraint answers_student_id_fkey foreign KEY (student_id) references students (id) on delete CASCADE,
      constraint answers_upload_id_fkey foreign KEY (upload_id) references uploads (id)
    );
    """
    
    print("🚀 Attempting to setup database tables...")
    try:
        # Supabase Python client doesn't support direct SQL execution anymore in some versions
        # We handle this by printing the SQL and advising the user
        print("\nIMPORTANT: Please run the following SQL in your Supabase SQL Editor if you haven't already:\n")
        print(sql)
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    run_sql()
