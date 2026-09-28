from services.certificate_validator.engine import validate_certificate_pipeline

result = validate_certificate_pipeline(
    '../cip-backend-lite/uploads/1/2026-05-06/de4eb1ec_Programming_In_Java__1_.pdf',
    'test-nptel'
)

print(f"Score: {result['authenticity_score']}/100")
print(f"Status: {result['status']}")
print(f"Issuer: {result['issuer_validation']['matched_name']}")
print(f"Name: {result['extracted_data']['name']}")
print(f"Cert ID: {result['extracted_data']['certificate_id']}")
