import fitz  # PyMuPDF
import os

def extract_images_from_pdf(pdf_path, output_folder="answer_sheet"):
    os.makedirs(output_folder, exist_ok=True)

    pdf_name = os.path.splitext(os.path.basename(pdf_path))[0]
    doc = fitz.open(pdf_path)

    image_paths = []

    for page_number in range(len(doc)):
        page = doc[page_number]
        
        # Use a scaling factor of 2.0 for higher resolution (approx 144 DPI)
        # This significantly improves OCR accuracy for small text.
        zoom = 2.0
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat)

        image_filename = os.path.join(
            output_folder,
            f"{pdf_name}_page_{page_number + 1}.png"
        )

        pix.save(image_filename)
        image_paths.append(image_filename)

    print(f"Total pages rendered as images: {len(image_paths)}")
    return image_paths