"""
Simple PDF Text Extractor using PyMuPDF (fitz)
No OCR needed - just extracts embedded text from PDF
"""
import fitz  # PyMuPDF
from loguru import logger


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract all text from PDF using PyMuPDF.
    This works for PDFs with embedded text (most certificates).
    No OCR needed!
    """
    try:
        doc = fitz.open(pdf_path)
        text = ""
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text += page.get_text()
        
        doc.close()
        
        logger.info(f"[PDF] Extracted {len(text)} characters from {pdf_path}")
        return text.strip()
        
    except Exception as e:
        logger.error(f"[PDF] Failed to extract text: {e}")
        return ""


def extract_text_from_image(image_path: str) -> str:
    """
    For image files, we still need OCR.
    This is a placeholder - will return empty for now.
    """
    logger.warning(f"[PDF] Image OCR not available for: {image_path}")
    return ""
