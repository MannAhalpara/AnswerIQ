from Image_extracter import extract_images_from_pdf
from OCR import run_ocr_on_images


def main(pdf_path, mode="student"):
    print(f"Step 1: Extracting images from PDF for {mode} mode...")
    image_paths = extract_images_from_pdf(pdf_path)

    print("\nStep 2: Running OCR...")
    extracted_text = run_ocr_on_images(image_paths, mode=mode)

    print(f"\n✅ Structured Extraction Result ({mode}):\n")
    print(extracted_text)
    
    print("\nPipeline completed successfully!")

    return extracted_text


if __name__ == "__main__":
    pdf_path = input("Enter PDF path: ")
    mode_input = input("Enter mode (faculty/student, default is 'student'): ").strip().lower()
    
    mode = "faculty" if mode_input == "faculty" else "student"
    
    main(pdf_path, mode=mode)