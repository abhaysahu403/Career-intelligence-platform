"""
OCR Engine - Extracts structured data from certificate images/PDFs
Primary: PaddleOCR | Fallback: Tesseract
"""
import re
import os
import cv2
import numpy as np
from pathlib import Path
from loguru import logger

# Optional imports with graceful fallback
try:
    from paddleocr import PaddleOCR
    # Initialize PaddleOCR without show_log parameter (not supported in all versions)
    _paddle_ocr = PaddleOCR(use_angle_cls=True, lang='en')
    USE_PADDLE = True
    logger.info("PaddleOCR initialized successfully")
except Exception as e:
    logger.warning(f"PaddleOCR not available: {e}. Falling back to Tesseract.")
    USE_PADDLE = False
    _paddle_ocr = None

try:
    import pytesseract
    USE_TESSERACT = True
except ImportError:
    USE_TESSERACT = False
    logger.warning("Tesseract not available")

try:
    from pdf2image import convert_from_path
    USE_PDF2IMAGE = True
except ImportError:
    USE_PDF2IMAGE = False

try:
    import fitz  # PyMuPDF
    USE_PYMUPDF = True
except ImportError:
    USE_PYMUPDF = False
    logger.warning("PyMuPDF not available")

try:
    from pyzbar import pyzbar
    USE_PYZBAR = True
except ImportError:
    USE_PYZBAR = False


def extract_data_from_image(file_path: str) -> dict:
    """
    Main extraction function. Handles PDF and images.
    Returns structured certificate data dict.
    
    STRATEGY:
    1. For PDFs: Use PyMuPDF to extract embedded text (no OCR needed!)
    2. For images: Try PaddleOCR, fallback to Tesseract
    """
    file_path = str(file_path)
    ext = Path(file_path).suffix.lower()

    logger.info(f"[OCR] Processing file: {file_path} ({ext})")

    # ── PDF: Use PyMuPDF for text extraction (FAST & RELIABLE) ──
    if ext == ".pdf":
        try:
            from .simple_pdf_extractor import extract_text_from_pdf
            full_text = extract_text_from_pdf(file_path)
            
            if full_text and len(full_text) > 50:
                logger.info(f"[OCR] PDF text extracted successfully: {len(full_text)} chars")
                
                # Parse the extracted text
                result = {
                    "name": extract_name(full_text),
                    "issuer": extract_issuer(full_text),
                    "certificate_title": extract_title(full_text),
                    "issue_date": extract_date(full_text),
                    "certificate_id": extract_certificate_id(full_text),
                    "registration_number": extract_registration(full_text),
                    "signatories": extract_signatories(full_text),
                    "qr_code_data": _extract_qr_from_pdf(file_path),  # Extract QR from PDF
                    "ocr_confidence": 0.95,  # High confidence for embedded text
                    "raw_text": full_text[:2000]
                }
                
                logger.info(f"[OCR] Extracted: name='{result['name']}', issuer='{result['issuer']}', date='{result['issue_date']}'")
                return result
            else:
                logger.warning(f"[OCR] PDF text extraction returned empty, falling back to OCR")
        except Exception as e:
            logger.error(f"[OCR] PDF extraction failed: {e}, falling back to OCR")
    
    # ── IMAGE or PDF fallback: Use OCR ──
    # PDF → image conversion
    if ext == ".pdf":
        img = _pdf_to_image(file_path)
    else:
        img = cv2.imread(file_path)

    if img is None:
        logger.error(f"[OCR] Failed to load image from: {file_path}")
        raise ValueError(f"Cannot load image from {file_path}")

    # QR/Barcode detection (before preprocessing changes the image)
    qr_data = _extract_qr_data(img.copy())

    # Preprocess
    processed = preprocess_image(img)

    # Run OCR
    text_lines, confidence = _run_ocr(processed)
    full_text = " ".join(text_lines)

    logger.info(f"[OCR] Extracted {len(text_lines)} lines, confidence={confidence:.2f}")
    logger.debug(f"[OCR] Full text (first 300 chars): {full_text[:300]}")

    result = {
        "name": extract_name(full_text),
        "issuer": extract_issuer(full_text),
        "certificate_title": extract_title(full_text),
        "issue_date": extract_date(full_text),
        "certificate_id": extract_certificate_id(full_text),
        "registration_number": extract_registration(full_text),
        "signatories": extract_signatories(full_text),
        "qr_code_data": qr_data,
        "ocr_confidence": confidence,
        "raw_text": full_text[:2000]  # Store first 2000 chars for debugging
    }

    logger.info(f"[OCR] Extracted: name='{result['name']}', issuer='{result['issuer']}', date='{result['issue_date']}'")
    return result


# ── Preprocessing ───────────────────────────────────────────────────────────

def preprocess_image(img: np.ndarray) -> np.ndarray:
    """
    Image preprocessing pipeline:
    1. Convert to grayscale
    2. Denoise
    3. Deskew
    4. Binarize (adaptive threshold)
    5. Upscale if needed
    """
    # Convert to grayscale
    if len(img.shape) == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img.copy()

    # Upscale small images for better OCR
    h, w = gray.shape
    if h < 1000 or w < 1000:
        scale = max(1000 / h, 1000 / w)
        gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

    # Denoise
    denoised = cv2.fastNlMeansDenoising(gray, h=10, templateWindowSize=7, searchWindowSize=21)

    # Deskew
    deskewed = _deskew(denoised)

    # Adaptive threshold (handles uneven lighting)
    binary = cv2.adaptiveThreshold(
        deskewed, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 31, 10
    )

    return binary


def _deskew(img: np.ndarray) -> np.ndarray:
    """Correct skew in scanned documents"""
    try:
        coords = np.column_stack(np.where(img > 0))
        if len(coords) < 10:
            return img
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle
        if abs(angle) < 0.5:
            return img
        (h, w) = img.shape
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        return rotated
    except Exception:
        return img


def _pdf_to_image(pdf_path: str) -> np.ndarray:
    """Convert first page of PDF to OpenCV image"""
    if USE_PYMUPDF:
        try:
            doc = fitz.open(pdf_path)
            if len(doc) > 0:
                page = doc.load_page(0)
                # Zoom for higher resolution OCR
                pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
                img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
                # Convert to BGR for OpenCV
                if pix.n == 4:
                    img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
                elif pix.n == 3:
                    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
                elif pix.n == 1:
                    img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
                return img
        except Exception as e:
            logger.error(f"[PyMuPDF] Failed: {e}")

    if USE_PDF2IMAGE:
        try:
            pages = convert_from_path(pdf_path, dpi=200, first_page=1, last_page=1)
            if pages:
                pil_img = pages[0]
                img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
                return img
        except Exception as e:
            logger.error(f"[PDF2Image] Failed: {e}")

    # Fallback: try to read directly
    img = cv2.imread(pdf_path)
    return img


# ── OCR Runners ─────────────────────────────────────────────────────────────

def _run_ocr(img: np.ndarray) -> tuple[list, float]:
    """Run OCR on processed image. Returns (text_lines, confidence)."""
    if USE_PADDLE:
        return _run_paddle(img)
    elif USE_TESSERACT:
        return _run_tesseract(img)
    else:
        logger.error("[OCR] No OCR engine available!")
        return [], 0.0


def _run_paddle(img: np.ndarray) -> tuple[list, float]:
    """PaddleOCR extraction"""
    try:
        result = _paddle_ocr.ocr(img, cls=True)
        if not result or not result[0]:
            return [], 0.0
        lines = []
        confidences = []
        for line in result[0]:
            text, conf = line[1]
            lines.append(text)
            confidences.append(conf)
        avg_conf = sum(confidences) / len(confidences) if confidences else 0.0
        return lines, avg_conf
    except Exception as e:
        logger.error(f"[PaddleOCR] Error: {e}")
        if USE_TESSERACT:
            return _run_tesseract(img)
        return [], 0.0


def _run_tesseract(img: np.ndarray) -> tuple[list, float]:
    """Tesseract OCR extraction"""
    try:
        data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
        lines = []
        confidences = []
        current_line = []
        current_block = -1

        for i, word in enumerate(data["text"]):
            if word.strip():
                conf = data["conf"][i]
                if conf > 0:
                    block = data["block_num"][i]
                    line_num = data["line_num"][i]
                    key = (block, line_num)
                    current_line.append(word)
                    confidences.append(conf)

        full_text = pytesseract.image_to_string(img)
        lines = [l.strip() for l in full_text.split('\n') if l.strip()]
        avg_conf = sum(confidences) / len(confidences) / 100.0 if confidences else 0.0
        return lines, avg_conf
    except Exception as e:
        logger.error(f"[Tesseract] Error: {e}")
        return [], 0.0


# ── QR/Barcode Detection ────────────────────────────────────────────────────

def _extract_qr_from_pdf(pdf_path: str) -> str:
    """
    Extract QR code from PDF by rendering page as image.
    Uses PyMuPDF to render the first page at high resolution.
    """
    if not USE_PYMUPDF:
        logger.debug("[QR] PyMuPDF not available, cannot extract QR from PDF")
        return ""
    
    try:
        doc = fitz.open(pdf_path)
        if len(doc) == 0:
            return ""
        
        # Render first page at 2x resolution for better QR detection
        page = doc.load_page(0)
        pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
        
        # Convert to numpy array
        img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
        
        # Convert to BGR for OpenCV
        if pix.n == 4:  # RGBA
            img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
        elif pix.n == 3:  # RGB
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        elif pix.n == 1:  # Grayscale
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        
        doc.close()
        
        # Now detect QR from the rendered image
        qr_data = _extract_qr_data(img)
        if qr_data:
            logger.info(f"[QR] Extracted QR from PDF: {qr_data[:50]}...")
        return qr_data
        
    except Exception as e:
        logger.error(f"[QR] Failed to extract QR from PDF: {e}")
        return ""


def _extract_qr_data(img: np.ndarray) -> str:
    """Extract QR code or barcode data from image"""
    if USE_PYZBAR:
        try:
            decoded = pyzbar.decode(img)
            if decoded:
                return decoded[0].data.decode("utf-8")
        except Exception as e:
            logger.debug(f"[QR] pyzbar failed: {e}")

    # OpenCV QR detector fallback
    try:
        qr_detector = cv2.QRCodeDetector()
        data, _, _ = qr_detector.detectAndDecode(img)
        if data:
            return data
    except Exception:
        pass

    return ""


# ── Field Extraction (Regex + NLP rules) ────────────────────────────────────

def extract_name(text: str) -> str:
    """Extract recipient name from certificate text"""
    # Exclude common false positives
    EXCLUDED_PHRASES = [
        "to verify", "this is to certify", "certificate of", "completion",
        "achievement", "excellence", "hereby certify", "awarded to",
        "presented to", "certify that", "this certifies", "has successfully",
        "machine learning", "engineering", "science", "applications"
    ]
    
    patterns = [
        # NPTEL style: Name appears after course title, before scores
        r"(?:applications|course|program)\s+([A-Z][A-Z\s]{5,40})\s+\d+",
        # Traditional patterns
        r"(?:This is to certify|hereby certify|awarded to|presented to|certify that)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,4})",
        r"(?:Name|Student|Candidate|Recipient)\s*[:\-–]\s*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,4})",
        r"^([A-Z][A-Z\s]{5,40})$",  # All-caps name on its own line
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.MULTILINE | re.IGNORECASE)
        if match:
            name = match.group(1).strip()
            # Check if it's a false positive
            if any(excluded in name.lower() for excluded in EXCLUDED_PHRASES):
                continue
            if 3 < len(name) < 60 and len(name.split()) >= 2:
                return name
    return ""


def extract_issuer(text: str) -> str:
    """Extract issuing institution name"""
    patterns = [
        r"(?:Issued by|Issued By|Issuer|Institute|University|College|School|Academy|Organisation)\s*[:\-–]?\s*([A-Z][A-Za-z\s&,\.]{5,80})",
        r"((?:University|Institute|College|Academy|School|Board|Council|IIT|IIM|NIT|AIIMS)\s+of\s+[A-Z][A-Za-z\s]{3,50})",
        r"((?:IIT|IIM|NIT|BITS|AIIMS|VIT|MIT|Harvard|Stanford|Oxford|Cambridge|IGNOU)\s*[A-Za-z\s,\.]{0,40})",
        # Tech companies - add these patterns
        r"(Oracle(?:\s+Cloud)?(?:\s+Infrastructure)?)",
        r"(Amazon\s+Web\s+Services|AWS)",
        r"(Microsoft(?:\s+Azure)?)",
        r"(Google(?:\s+Cloud)?)",
        r"(IBM(?:\s+Cloud)?)",
        r"(Cisco)",
        r"(Red\s+Hat)",
        # NPTEL and Indian platforms
        r"(NPTEL)",
        r"(SWAYAM)",
        r"(Coursera)",
        r"(edX)",
        r"(Udemy)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.MULTILINE | re.IGNORECASE)
        if match:
            issuer = match.group(1).strip()
            # Clean trailing punctuation
            issuer = re.sub(r"[,\.\-–]+$", "", issuer).strip()
            if 3 < len(issuer) < 100:
                return issuer
    return ""


def extract_title(text: str) -> str:
    """Extract certificate/degree title"""
    patterns = [
        # NPTEL style: Course title before name (multi-line)
        r"(Machine\s+Learning\s+for\s+[A-Za-z\s]+applications)",
        r"(Programming\s+in\s+[A-Za-z\s]+)",
        r"(Introduction\s+to\s+[A-Za-z\s]+)",
        r"(Data\s+Structures\s+and\s+Algorithms)",
        r"([A-Z][A-Za-z\s]+(?:for|in|and|of)\s+[A-Z][A-Za-z\s]+(?:applications|engineering|science))",
        # Tech certifications - specific patterns first
        r"((?:Oracle|AWS|Google|Microsoft|Azure|Cisco|Red Hat|IBM|SAP|Salesforce|Meta)\s+(?:Cloud|Certified|Professional|Associate|Developer|Administrator|Architect|Engineer|Specialist)[^\n]{0,80})",
        # Traditional patterns
        r"(?:Certificate of|Certificate in|Degree of|Diploma in|Award of)\s+([A-Za-z\s&,\.]{5,80})",
        r"(?:Bachelor|Master|Doctor|PhD|B\.Tech|M\.Tech|MBA|BCA|MCA|B\.Sc|M\.Sc)\s+(?:of\s+)?(?:in\s+)?([A-Za-z\s&,\.]{3,60})",
        r"((?:Course|Program|Programme)\s+(?:Completion|Certificate|Award)\s+in\s+[A-Za-z\s&,\.]{5,60})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            title = match.group(1).strip() if match.lastindex else match.group(0).strip()
            if len(title) > 5:
                return title
    return ""


def extract_date(text: str) -> str:
    """Extract issue/completion date"""
    patterns = [
        # "Jan-Apr 2025" format (NPTEL style)
        r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[-\s](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})",
        # "November 28, 2025" format
        r"((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})",
        # "28 November 2025" format
        r"(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December),?\s+\d{4})",
        # With labels
        r"(?:Date|Dated|Issued on|Date of Issue|Completion Date|Valid from)\s*[:\-–]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})",
        r"(?:Date|Dated|Issued on|Date of Issue|Completion Date|Valid from)\s*[:\-–]?\s*(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})",
        # Month Year only
        r"((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})",
        # ISO format
        r"(\d{4}-\d{2}-\d{2})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return ""


def extract_certificate_id(text: str) -> str:
    """Extract certificate ID/number"""
    patterns = [
        # NPTEL pattern first (highest priority): NPTEL25CS49S542800054
        r"\b(NPTEL\d{2}[A-Z]{2}\d{2}[A-Z]\d+)\b",
        # Oracle pattern: 102725261OCID25CP
        r"\b(\d{9,15}[A-Z]{2,10}\d{2,4}[A-Z]{2,4})\b",
        # With labels
        r"(?:Certificate\s+(?:No|Number|ID)|Cert\.?\s*(?:No|ID))\s*[:\-–#]?\s*([A-Z0-9\-\/]{4,30})",
        r"(?:Serial|Reg\.?\s*No)\s*[:\-–#]?\s*([A-Z0-9\-\/]{4,30})",
        # Pattern like CERT-2024-12345
        r"\b([A-Z]{2,6}[-\/]?\d{4}[-\/]?\d{4,8})\b",
        # Generic alphanumeric (but not Roll No which is just numbers)
        r"\b([A-Z]{2,4}\d{8,15})\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            cert_id = match.group(1).strip()
            # Exclude "Roll No" matches
            if cert_id.lower() not in ['roll no', 'jan-apr', 'jan', 'apr']:
                return cert_id
    return ""


def extract_registration(text: str) -> str:
    """Extract registration/enrollment number"""
    patterns = [
        r"(?:Registration|Enrollment|Enrolment)\s*(?:No|Number|ID)?\s*[:\-–#]?\s*([A-Z0-9\/\-]{4,25})",
        r"\bReg\.?\s*No\.?\s*[:\-]?\s*([A-Z0-9\/\-]{4,25})\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return ""


def extract_signatories(text: str) -> list:
    """Extract signatories/signers"""
    signatories = []
    patterns = [
        r"(?:Signed by|Signature of|Authorised by|Authorized by)\s*[:\-–]?\s*([A-Z][a-zA-Z\s\.]{3,50})",
        r"(?:Director|Principal|Dean|Registrar|HOD|Chairman)\s+([A-Z][a-zA-Z\s\.]{3,40})",
    ]
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for m in matches:
            name = m.strip()
            if name and name not in signatories:
                signatories.append(name)
    return signatories[:5]  # Max 5
