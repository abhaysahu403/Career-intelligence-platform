from services.certificate_validator.ocr_engine import extract_name, extract_title, extract_date, extract_certificate_id, extract_issuer

text = """No. of credits recommended: 3 or 4
To verify the certificate
Roll No:
Jan-Apr 2025
(12 week course)
Machine Learning for Engineering and science applications ABHAY SAHU
24.03/25
30/75
54
1786
NPTEL25CS49S542800054"""

print("=== NPTEL Certificate Extraction Test ===")
print(f"Name: '{extract_name(text)}'")
print(f"Title: '{extract_title(text)}'")
print(f"Date: '{extract_date(text)}'")
print(f"Cert ID: '{extract_certificate_id(text)}'")
print(f"Issuer: '{extract_issuer(text)}'")
