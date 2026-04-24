import os
import sys

# Simulate what ocr_service.py does
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from AI_OCR.Image_extracter import extract_images_from_pdf
    from AI_OCR.OCR import run_ocr_on_images
    print("✅ Success: Imported AI_OCR components successfully!")
    print(f"extract_images_from_pdf: {extract_images_from_pdf}")
except ImportError as e:
    print(f"❌ Error: Could not import AI OCR components: {e}")
    sys.exit(1)
