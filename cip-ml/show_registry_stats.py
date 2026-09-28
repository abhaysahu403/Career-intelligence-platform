import json

data = json.load(open('services/certificate_validator/data/issuer_registry.json'))
certs = data['certification_bodies']
unis = data['universities']

print("=" * 60)
print("CERTIFICATE VALIDATOR - INSTITUTION REGISTRY STATS")
print("=" * 60)

# Breakdown by type
types = {}
for c in certs:
    t = c['type']
    types[t] = types.get(t, 0) + 1

print("\n=== CERTIFICATION BODIES BY TYPE ===")
for t, count in sorted(types.items(), key=lambda x: -x[1]):
    print(f"  {t:25s}: {count:3d}")

print(f"\nTotal Certification Bodies: {len(certs)}")
print(f"Total Universities: {len(unis)}")
print(f"Grand Total: {len(certs) + len(unis)}")

print("\n=== KEY ADDITIONS ===")
print("✅ IEEE, ACM, BCS, IET - Engineering professional bodies")
print("✅ Skill India, PMKVY, NSDC - Government skill development")
print("✅ SOF, IOI, IMO, IPhO, NTSE, KVPY - Olympiads & competitions")
print("✅ Cambridge, IB, Edexcel, College Board - International boards")
print("✅ IELTS, TOEFL, Cambridge English, Goethe - Language tests")
print("✅ MCI, NMC, DCI, BCI, COA - Indian professional councils")
print("✅ RBI, SEBI, IRDAI, NISM, IIBF - Finance & Banking")
print("✅ CFA, FRM, CAIA, SOA - Finance certifications")
print("✅ SHRM, HRCI, CIPD - HR certifications")
print("✅ Great Learning, Simplilearn, upGrad - Indian EdTech")
print("✅ Meta, Salesforce, SAP, Adobe - Tech giants")
print("✅ Infosys, TCS, Wipro, HCL - Indian IT companies")

print("\n" + "=" * 60)
