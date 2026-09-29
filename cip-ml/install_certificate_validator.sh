#!/bin/bash
# Certificate Validator - Dependency Installation Script
# Run this to install all required dependencies for certificate validation

echo "=========================================="
echo "Certificate Validator - Dependency Setup"
echo "=========================================="
echo ""

# Check OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
else
    OS="unknown"
fi

echo "Detected OS: $OS"
echo ""

# Install system dependencies
echo "Step 1: Installing system dependencies..."
echo "----------------------------------------"

if [ "$OS" == "linux" ]; then
    echo "Installing Tesseract OCR and Poppler..."
    sudo apt-get update
    sudo apt-get install -y tesseract-ocr poppler-utils
    
elif [ "$OS" == "mac" ]; then
    echo "Installing Tesseract OCR and Poppler via Homebrew..."
    brew install tesseract poppler
    
elif [ "$OS" == "windows" ]; then
    echo "⚠️  Windows detected. Please install manually:"
    echo "   1. Tesseract: choco install tesseract"
    echo "   2. Poppler: choco install poppler"
    echo "   3. Add to PATH:"
    echo "      - C:\\Program Files\\Tesseract-OCR"
    echo "      - C:\\Program Files\\poppler-xx\\Library\\bin"
    echo ""
    echo "Or download from:"
    echo "   - Tesseract: https://github.com/UB-Mannheim/tesseract/wiki"
    echo "   - Poppler: https://github.com/oschwartz10612/poppler-windows/releases"
    echo ""
    read -p "Press Enter after installing system dependencies..."
fi

echo ""
echo "Step 2: Installing Python packages..."
echo "--------------------------------------"
pip install -r requirements.txt

echo ""
echo "Step 3: Verifying installation..."
echo "----------------------------------"

# Test imports
python -c "
import sys
errors = []

try:
    import cv2
    print('✅ OpenCV:', cv2.__version__)
except Exception as e:
    errors.append('❌ OpenCV: ' + str(e))
    print('❌ OpenCV: FAILED')

try:
    import pytesseract
    version = pytesseract.get_tesseract_version()
    print('✅ Tesseract:', version)
except Exception as e:
    errors.append('❌ Tesseract: ' + str(e))
    print('❌ Tesseract: FAILED (check if system binary is installed)')

try:
    from pdf2image import convert_from_path
    print('✅ pdf2image: OK')
except Exception as e:
    errors.append('❌ pdf2image: ' + str(e))
    print('❌ pdf2image: FAILED (check if poppler is installed)')

try:
    import fitz
    print('✅ PyMuPDF:', fitz.version)
except Exception as e:
    errors.append('❌ PyMuPDF: ' + str(e))
    print('❌ PyMuPDF: FAILED')

try:
    from pyzbar import pyzbar
    print('✅ pyzbar: OK')
except Exception as e:
    errors.append('❌ pyzbar: ' + str(e))
    print('❌ pyzbar: FAILED')

try:
    from paddleocr import PaddleOCR
    print('✅ PaddleOCR: OK (downloading models on first use...)')
except Exception as e:
    print('⚠️  PaddleOCR: Not installed (will use Tesseract fallback)')

try:
    from rapidfuzz import fuzz
    print('✅ RapidFuzz: OK')
except Exception as e:
    errors.append('❌ RapidFuzz: ' + str(e))
    print('❌ RapidFuzz: FAILED')

try:
    from scipy import ndimage
    print('✅ SciPy: OK')
except Exception as e:
    errors.append('❌ SciPy: ' + str(e))
    print('❌ SciPy: FAILED')

try:
    from skimage import filters
    print('✅ scikit-image: OK')
except Exception as e:
    errors.append('❌ scikit-image: ' + str(e))
    print('❌ scikit-image: FAILED')

if errors:
    print('')
    print('⚠️  Some dependencies failed to install:')
    for err in errors:
        print('  ', err)
    sys.exit(1)
else:
    print('')
    print('✅ All dependencies installed successfully!')
    sys.exit(0)
"

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Installation Complete!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Start the ML service: python main.py"
    echo "2. Test with a certificate:"
    echo "   python -c \"from services.certificate_validator.engine import validate_certificate_pipeline; print(validate_certificate_pipeline('path/to/cert.pdf', 'test-001'))\""
    echo ""
else
    echo ""
    echo "=========================================="
    echo "❌ Installation Failed"
    echo "=========================================="
    echo ""
    echo "Please check the errors above and:"
    echo "1. Ensure system dependencies are installed (Tesseract, Poppler)"
    echo "2. Check that they are in your PATH"
    echo "3. Try running: pip install -r requirements.txt manually"
    echo ""
    exit 1
fi
