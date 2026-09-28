# Certificate Validator - Dependency Installation Script (Windows PowerShell)
# Run this to install all required dependencies for certificate validation

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Certificate Validator - Dependency Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  Warning: Not running as Administrator" -ForegroundColor Yellow
    Write-Host "   Some installations may require admin privileges" -ForegroundColor Yellow
    Write-Host ""
}

# Step 1: Check and install system dependencies
Write-Host "Step 1: Checking system dependencies..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green

# Check if Chocolatey is installed
$chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

if ($chocoInstalled) {
    Write-Host "✅ Chocolatey is installed" -ForegroundColor Green
    
    # Check Tesseract
    $tesseractInstalled = Get-Command tesseract -ErrorAction SilentlyContinue
    if (-not $tesseractInstalled) {
        Write-Host "Installing Tesseract OCR..." -ForegroundColor Yellow
        choco install tesseract -y
    } else {
        Write-Host "✅ Tesseract is already installed" -ForegroundColor Green
    }
    
    # Check Poppler
    $popplerPath = "C:\Program Files\poppler"
    if (-not (Test-Path $popplerPath)) {
        Write-Host "Installing Poppler..." -ForegroundColor Yellow
        choco install poppler -y
    } else {
        Write-Host "✅ Poppler is already installed" -ForegroundColor Green
    }
    
} else {
    Write-Host "❌ Chocolatey is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install system dependencies manually:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Install Chocolatey (recommended)" -ForegroundColor Cyan
    Write-Host "  Run in PowerShell (Admin):" -ForegroundColor Gray
    Write-Host "  Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" -ForegroundColor Gray
    Write-Host "  Then run: choco install tesseract poppler -y" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 2: Manual installation" -ForegroundColor Cyan
    Write-Host "  1. Tesseract: https://github.com/UB-Mannheim/tesseract/wiki" -ForegroundColor Gray
    Write-Host "  2. Poppler: https://github.com/oschwartz10612/poppler-windows/releases" -ForegroundColor Gray
    Write-Host ""
    Write-Host "After installation, add to PATH:" -ForegroundColor Yellow
    Write-Host "  - C:\Program Files\Tesseract-OCR" -ForegroundColor Gray
    Write-Host "  - C:\Program Files\poppler-xx\Library\bin" -ForegroundColor Gray
    Write-Host ""
    
    $continue = Read-Host "Have you installed Tesseract and Poppler? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Installation cancelled. Please install system dependencies first." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Step 2: Installing Python packages..." -ForegroundColor Green
Write-Host "--------------------------------------" -ForegroundColor Green

pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Python packages" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Verifying installation..." -ForegroundColor Green
Write-Host "----------------------------------" -ForegroundColor Green

# Test imports
python -c @"
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
    print('❌ Tesseract: FAILED (check if system binary is installed and in PATH)')

try:
    from pdf2image import convert_from_path
    print('✅ pdf2image: OK')
except Exception as e:
    errors.append('❌ pdf2image: ' + str(e))
    print('❌ pdf2image: FAILED (check if poppler is installed and in PATH)')

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
    print('✅ PaddleOCR: OK (will download models on first use)')
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
"@

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "✅ Installation Complete!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start the ML service: python main.py" -ForegroundColor Gray
    Write-Host "2. Test with a certificate:" -ForegroundColor Gray
    Write-Host "   python -c `"from services.certificate_validator.engine import validate_certificate_pipeline; print(validate_certificate_pipeline('path/to/cert.pdf', 'test-001'))`"" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host "❌ Installation Failed" -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the errors above and:" -ForegroundColor Yellow
    Write-Host "1. Ensure Tesseract is installed and in PATH" -ForegroundColor Gray
    Write-Host "2. Ensure Poppler is installed and in PATH" -ForegroundColor Gray
    Write-Host "3. Try running: pip install -r requirements.txt manually" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To check PATH:" -ForegroundColor Cyan
    Write-Host "  tesseract --version" -ForegroundColor Gray
    Write-Host "  pdftoppm -v" -ForegroundColor Gray
    Write-Host ""
    exit 1
}
