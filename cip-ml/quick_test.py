#!/usr/bin/env python3
"""Quick test of certificate validator"""
import sys
import os

print("Testing Certificate Validator...")
print("=" * 60)

# Test 1: Check imports
print("\n1. Checking imports...")
try:
    from services.certificate_validator.engine import validate_certificate_pipeline
    print("✅ Engine imported")
except Exception as e:
    print(f"❌ Failed to import engine: {e}")
    sys.exit(1)

# Test 2: Find a test certificate
print("\n2. Finding test certificate...")
test_file = "../cip-backend-lite/uploads/1/2026-05-06/f3e31b6c_OCI_Devloper_Professional.pdf"
if not os.path.exists(test_file):
    print(f"❌ Test file not found: {test_file}")
    sys.exit(1)
print(f"✅ Found: {os.path.basename(test_file)}")

# Test 3: Run validation
print("\n3. Running validation (this may take 30-60 seconds on first run)...")
print("   PaddleOCR will download models on first use...")

try:
    result = validate_certificate_pipeline(test_file, 'quick-test')
    
    print("\n" + "=" * 60)
    print("RESULTS:")
    print("=" * 60)
    print(f"Score: {result['authenticity_score']}/100")
    print(f"Status: {result['status']}")
    print(f"Confidence: {result['confidence_level']}")
    print(f"OCR Confidence: {result['extracted_data']['ocr_confidence']:.2%}")
    print(f"Processing Time: {result['processing_time_ms']}ms")
    
    print("\nExtracted Data:")
    print(f"  Name: {result['extracted_data']['name'] or '(not found)'}")
    print(f"  Issuer: {result['extracted_data']['issuer'] or '(not found)'}")
    print(f"  Date: {result['extracted_data']['issue_date'] or '(not found)'}")
    print(f"  Cert ID: {result['extracted_data']['certificate_id'] or '(not found)'}")
    
    print("\nIssuer Validation:")
    print(f"  Valid: {result['issuer_validation']['issuer_valid']}")
    print(f"  Matched: {result['issuer_validation']['matched_name']}")
    print(f"  Confidence: {result['issuer_validation']['issuer_confidence']:.0%}")
    
    print("\n" + "=" * 60)
    
    if result['authenticity_score'] == 35:
        print("❌ FAILED: Score is still 35 (OCR not working)")
        print("\nDEBUG INFO:")
        print(f"  OCR Confidence: {result['extracted_data']['ocr_confidence']}")
        print(f"  Raw Text Length: {len(result['extracted_data'].get('raw_text', ''))}")
        sys.exit(1)
    elif result['authenticity_score'] < 50:
        print("⚠️  WARNING: Score is low but OCR is working")
        sys.exit(0)
    else:
        print("✅ SUCCESS: Certificate validation is working!")
        sys.exit(0)
        
except Exception as e:
    print(f"\n❌ FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
