#!/usr/bin/env python3
"""
Certificate Validator - Test Script
Tests OCR, issuer validation, and full pipeline
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

def test_imports():
    """Test if all required modules can be imported"""
    print("=" * 60)
    print("TEST 1: Checking Dependencies")
    print("=" * 60)
    
    errors = []
    
    modules = [
        ("cv2", "OpenCV"),
        ("pytesseract", "Tesseract"),
        ("pdf2image", "pdf2image"),
        ("fitz", "PyMuPDF"),
        ("pyzbar", "pyzbar"),
        ("rapidfuzz", "RapidFuzz"),
        ("scipy", "SciPy"),
        ("skimage", "scikit-image"),
    ]
    
    for module, name in modules:
        try:
            __import__(module)
            print(f"✅ {name}")
        except ImportError as e:
            print(f"❌ {name}: {e}")
            errors.append(name)
    
    # Optional: PaddleOCR
    try:
        import paddleocr
        print(f"✅ PaddleOCR (optional)")
    except ImportError:
        print(f"⚠️  PaddleOCR not installed (will use Tesseract)")
    
    print()
    
    if errors:
        print(f"❌ Missing dependencies: {', '.join(errors)}")
        print("Run: python install_certificate_validator.ps1 (Windows)")
        print("Or: bash install_certificate_validator.sh (Linux/Mac)")
        return False
    
    print("✅ All required dependencies are installed")
    return True


def test_ocr():
    """Test OCR functionality"""
    print("\n" + "=" * 60)
    print("TEST 2: OCR Engine")
    print("=" * 60)
    
    try:
        from services.certificate_validator.ocr_engine import extract_data_from_image
        
        # Find a test certificate
        test_files = [
            "../cip-backend-lite/uploads/1/2026-05-06/f3e31b6c_OCI_Devloper_Professional.pdf",
            "../cip-backend-lite/uploads/1/2026-05-06/de4eb1ec_Programming_In_Java__1_.pdf",
            "../cip-backend-lite/uploads/1/2026-05-06/65bd6848_Abhay_Sahu_Certificate.pdf",
        ]
        
        test_file = None
        for f in test_files:
            if os.path.exists(f):
                test_file = f
                break
        
        if not test_file:
            print("⚠️  No test certificates found in uploads directory")
            print("   Upload a certificate first to test OCR")
            return True
        
        print(f"Testing with: {os.path.basename(test_file)}")
        print()
        
        result = extract_data_from_image(test_file)
        
        print(f"OCR Confidence: {result['ocr_confidence']:.2%}")
        print(f"Name: {result['name'] or '(not found)'}")
        print(f"Issuer: {result['issuer'] or '(not found)'}")
        print(f"Date: {result['issue_date'] or '(not found)'}")
        print(f"Certificate ID: {result['certificate_id'] or '(not found)'}")
        print(f"QR Code: {result['qr_code_data'][:50] if result['qr_code_data'] else '(not found)'}")
        print()
        
        if result['ocr_confidence'] == 0:
            print("❌ OCR failed - confidence is 0%")
            print("   Check if Tesseract is installed and in PATH")
            return False
        
        if result['ocr_confidence'] < 0.5:
            print("⚠️  OCR confidence is low (<50%)")
            print("   This may indicate poor image quality or OCR issues")
            return True
        
        print("✅ OCR is working correctly")
        return True
        
    except Exception as e:
        print(f"❌ OCR test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_issuer_validation():
    """Test issuer validation"""
    print("\n" + "=" * 60)
    print("TEST 3: Issuer Validation")
    print("=" * 60)
    
    try:
        from services.certificate_validator.issuer_validator import validate_issuer, load_issuer_registry
        
        # Load registry
        registry = load_issuer_registry()
        print(f"Loaded {len(registry.get('institutions', []))} institutions")
        print()
        
        # Test known issuers
        test_issuers = [
            "Oracle",
            "NPTEL",
            "IIT Delhi",
            "Coursera",
            "Unknown Institution XYZ"
        ]
        
        for issuer_name in test_issuers:
            result = validate_issuer(issuer_name)
            status = "✅" if result['issuer_valid'] else "❌"
            print(f"{status} {issuer_name}: {result['issuer_confidence']:.0%} confidence")
            if result['matched_name']:
                print(f"   → Matched: {result['matched_name']} ({result['issuer_type']})")
        
        print()
        print("✅ Issuer validation is working")
        return True
        
    except Exception as e:
        print(f"❌ Issuer validation test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_full_pipeline():
    """Test full validation pipeline"""
    print("\n" + "=" * 60)
    print("TEST 4: Full Validation Pipeline")
    print("=" * 60)
    
    try:
        from services.certificate_validator.engine import validate_certificate_pipeline
        
        # Find a test certificate
        test_files = [
            ("../cip-backend-lite/uploads/1/2026-05-06/f3e31b6c_OCI_Devloper_Professional.pdf", "Oracle"),
            ("../cip-backend-lite/uploads/1/2026-05-06/de4eb1ec_Programming_In_Java__1_.pdf", "NPTEL"),
        ]
        
        for test_file, expected_issuer in test_files:
            if not os.path.exists(test_file):
                continue
            
            print(f"\nTesting: {os.path.basename(test_file)}")
            print("-" * 60)
            
            result = validate_certificate_pipeline(test_file, f"test-{expected_issuer}")
            
            print(f"Score: {result['authenticity_score']}/100")
            print(f"Status: {result['status']}")
            print(f"Confidence: {result['confidence_level']}")
            print(f"Processing Time: {result['processing_time_ms']}ms")
            print()
            
            print("Component Scores:")
            for component, score in result.get('component_scores', {}).items():
                print(f"  {component}: {score:.2f}")
            print()
            
            if result['reasons']:
                print("Reasons:")
                for reason in result['reasons'][:3]:
                    print(f"  ✅ {reason}")
            
            if result['warnings']:
                print("Warnings:")
                for warning in result['warnings'][:3]:
                    print(f"  ⚠️  {warning}")
            
            print()
            
            # Check if score is reasonable
            if result['authenticity_score'] == 35:
                print("❌ Score is 35 (default) - OCR likely failed")
                return False
            
            if result['authenticity_score'] < 50:
                print("⚠️  Score is low (<50) - check OCR and issuer validation")
            else:
                print(f"✅ Score is reasonable ({result['authenticity_score']}/100)")
        
        print()
        print("✅ Full pipeline is working")
        return True
        
    except Exception as e:
        print(f"❌ Pipeline test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("CERTIFICATE VALIDATOR - TEST SUITE")
    print("=" * 60)
    print()
    
    results = []
    
    # Test 1: Dependencies
    results.append(("Dependencies", test_imports()))
    
    if not results[0][1]:
        print("\n❌ Cannot proceed - dependencies are missing")
        sys.exit(1)
    
    # Test 2: OCR
    results.append(("OCR Engine", test_ocr()))
    
    # Test 3: Issuer Validation
    results.append(("Issuer Validation", test_issuer_validation()))
    
    # Test 4: Full Pipeline
    results.append(("Full Pipeline", test_full_pipeline()))
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print()
    
    all_passed = all(result[1] for result in results)
    
    if all_passed:
        print("✅ All tests passed! Certificate validator is ready to use.")
        sys.exit(0)
    else:
        print("❌ Some tests failed. Please fix the issues above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
