from google import genai
from PIL import Image
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# 🔑 API Client Initialization
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

# Using the most stable "normal" model identifier
MODEL_ID = "gemini-flash-latest"

def run_ocr_on_images(image_paths, mode="student"):
    """
    OCR function that processes images.
    - Faculty Mode: Consolidated call (all images at once) for cross-page context.
    - Student Mode: Direct OCR (page-by-page) for high precision and stability.
    """
    images = []
    for path in image_paths:
        if os.path.exists(path):
            with Image.open(path) as img:
                # We need to keep the image data in memory or use the path
                # Gemini SDK can take PIL images, but we must ensure they are readable
                images.append(img.copy())
        else:
            print(f"Warning: File not found: {path}")

    if not images:
        return json.dumps({"error": "No images provided or found"}, indent=2)

    # Base prompt that handles OCR, Cleaning, and Structuring
    system_instruction = f"""
You are an expert OCR and data extraction system for educational documents.
Analyze the provided image(s) of an answer sheet and extract the content into the required JSON format.

DOCUMENT MODE: {mode.upper()}

STRICT RULES:
1. VERBATIM EXTRACTION: Extract text EXACTLY as written. 
   - DO NOT fix spelling or grammar.
   - DO NOT rephrase or summarize.
2. CLEANING: Remove repeated headers, footers, page numbers, and dates.
3. MATH/FORMULAS: Keep equations and symbols exactly as they appear.

REQUIRED JSON STRUCTURE:
{
    f'''
[FACULTY MODE]
- Extract: question_number, question_text, max_marks, and reference_answer.
- Example: 
  [
    {{
      "question_number": "1",
      "question_text": "...",
      "max_marks": 5,
      "reference_answer": "..."
    }}
  ]''' if mode == 'faculty' else
    f'''
[STUDENT MODE]
- Extract: question_number, question_text, and student_answer.
- Example: 
  [
    {{
      "question_number": "1",
      "question_text": "...",
      "student_answer": "..."
    }}
  ]'''
}

Output ONLY the raw JSON array. No markdown code blocks, no preamble.
"""

    try:
        all_results = []

        if mode == "student":
            print(f"[Student Mode] Processing {len(images)} images individually (Direct OCR)...")
            for i, img in enumerate(images):
                print(f"  Page {i+1}/{len(images)}...")
                response = client.models.generate_content(
                    model=MODEL_ID,
                    contents=[img, system_instruction]
                )
                
                raw_output = response.text.strip()
                if raw_output.startswith("```json"):
                    raw_output = raw_output[7:-3].strip()
                elif raw_output.startswith("```"):
                    raw_output = raw_output[3:-3].strip()
                
                try:
                    page_data = json.loads(raw_output)
                    if isinstance(page_data, list):
                        all_results.extend(page_data)
                    elif isinstance(page_data, dict):
                        all_results.append(page_data)
                except Exception as je:
                    print(f"  ⚠️ Warning: Failed to parse JSON for page {i+1}: {je}")
            
            return json.dumps(all_results, indent=2)

        else:
            # Faculty Mode: Consolidated processing
            print(f"[Faculty Mode] Sending {len(images)} images to Gemini for consolidated processing...")
            response = client.models.generate_content(
                model=MODEL_ID,
                contents=images + [system_instruction]
            )
            
            raw_output = response.text.strip()
            if raw_output.startswith("```json"):
                raw_output = raw_output[7:-3].strip()
            elif raw_output.startswith("```"):
                raw_output = raw_output[3:-3].strip()
                
            json_data = json.loads(raw_output)
            return json.dumps(json_data, indent=2)

    except Exception as e:
        error_msg = f"AI OCR Error: {str(e)}"
        print(f"Error: {error_msg}")
        return json.dumps({"error": error_msg}, indent=2)