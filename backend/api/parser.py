import os
from PyPDF2 import PdfReader
import docx

def extract_text_from_file(file_path, filename):
    """
    Extracts text from a given file path based on its extension.
    Supported formats: .pdf, .docx
    """
    text = ""
    ext = os.path.splitext(filename)[1].lower()

    try:
        if ext == '.pdf':
            with open(file_path, 'rb') as f:
                reader = PdfReader(f)
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
                        
        elif ext == '.docx':
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        
        else:
            raise ValueError(f"Unsupported file type: {ext}")
            
    except Exception as e:
        print(f"Error extracting text from {filename}: {str(e)}")
        # In production we might want to log this properly or re-raise
        raise e
        
    return text.strip()
