from services.certificate_validator.issuer_validator import load_issuer_registry

registry = load_issuer_registry()
institutions = registry['institutions']

print(f"Total institutions: {len(institutions)}")
print("\nBreakdown by type:")

types = {}
for inst in institutions:
    t = inst.get('type', 'unknown')
    types[t] = types.get(t, 0) + 1

for t, count in sorted(types.items()):
    print(f"  {t}: {count}")

print("\nSample institutions:")
for inst in institutions[:10]:
    print(f"  - {inst['name']} ({inst['type']})")

print("\nMissing common institutions:")
missing = [
    "Great Learning", "Simplilearn", "upGrad", "Scaler Academy",
    "GeeksforGeeks", "InterviewBit", "LeetCode",
    "Meta", "Salesforce", "SAP", "Adobe",
    "IIT Guwahati", "IIT BHU", "IIT Ropar",
    "IIIT Bangalore", "IIIT Hyderabad", "IIIT Delhi",
    "Infosys", "TCS", "Wipro", "Accenture"
]

current_names = [inst['name'].lower() for inst in institutions]
for name in missing:
    if name.lower() not in ' '.join(current_names):
        print(f"  ❌ {name}")
