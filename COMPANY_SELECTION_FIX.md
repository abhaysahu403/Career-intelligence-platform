# 🔧 Company Selection Dropdown Fix

## Issue
The company selection dropdown in the interview setup page is showing only "Google" instead of all companies from the database.

## Root Cause Analysis

### Backend Status: ✅ CORRECT
The backend is **already correctly implemented**:

1. **Database has multiple companies** (via Flyway migrations):
   - Google, Amazon, Microsoft, Flipkart
   - TCS, Infosys, Cognizant, Accenture
   - Gateway Group, Argusoft
   - AWS, Azure, GCP, Cloud Nexus

2. **API endpoint works correctly**:
   ```java
   // InterviewV3Service.java
   public ConfigurationOptions getConfigurationOptions() {
       List<String> companies = companyQuestionRepository.findAllCompanyNames();
       // Returns all distinct company names from database
   }
   ```

3. **SQL Query is correct**:
   ```java
   @Query("SELECT DISTINCT cq.companyName FROM CompanyQuestion cq ORDER BY cq.companyName")
   List<String> findAllCompanyNames();
   ```

### Frontend Status: ✅ CORRECT
The frontend code is also **correctly implemented**:

```typescript
// interview/setup/page.tsx
<select value={company} onChange={(e) => setCompany(e.target.value)}>
  <option value="">Choose a company...</option>
  {config?.companies.map((c) => (
    <option key={c} value={c}>{c}</option>
  ))}
</select>
```

## Possible Issues

### 1. Database Not Seeded
**Check**: Flyway migrations might not have run

**Solution**:
```bash
cd cip-backend-lite
mvn clean install
mvn spring-boot:run
```

Check logs for:
```
Flyway: Migrating schema to version 7 - seed company questions
Flyway: Migrating schema to version 10 - add new companies and hr questions
```

### 2. API Not Returning Data
**Check**: Test the API endpoint directly

**Test**:
```bash
curl http://localhost:8080/interview/v3/config
```

**Expected Response**:
```json
{
  "status": "success",
  "data": {
    "companies": [
      "Accenture", "AWS", "Amazon", "Argusoft", "Azure",
      "Cloud Nexus", "Cognizant", "Flipkart", "GCP",
      "Gateway Group", "Google", "Infosys", "Microsoft", "TCS"
    ],
    "roles": [...],
    "branches": [...],
    "difficulties": ["EASY", "MEDIUM", "HARD", "FAANG"],
    "personas": [...],
    "durations": [10, 20, 30, 45, 60]
  }
}
```

### 3. Frontend Not Loading Config
**Check**: Browser console for errors

**Debug**:
```typescript
// Add this to interview/setup/page.tsx
useEffect(() => {
  console.log('📋 Config loaded:', config);
  console.log('📋 Companies:', config?.companies);
}, [config]);
```

## Quick Fix Steps

### Step 1: Verify Database
```sql
-- Connect to PostgreSQL
psql -U postgres -d cip_db

-- Check if companies exist
SELECT DISTINCT company_name FROM company_questions ORDER BY company_name;
```

**Expected Output**:
```
 company_name
--------------
 Accenture
 AWS
 Amazon
 Argusoft
 Azure
 Cloud Nexus
 Cognizant
 Flipkart
 GCP
 Gateway Group
 Google
 Infosys
 Microsoft
 TCS
(14 rows)
```

### Step 2: Restart Backend
```bash
cd cip-backend-lite
mvn clean install
mvn spring-boot:run
```

### Step 3: Test API
```bash
curl http://localhost:8080/interview/v3/config | jq '.data.companies'
```

### Step 4: Clear Frontend Cache
```bash
cd cip-web
rm -rf .next
npm run dev
```

### Step 5: Test in Browser
1. Open http://localhost:3000/interview/setup
2. Open DevTools Console (F12)
3. Check for config loading
4. Select "Company-Specific" mode
5. Verify dropdown shows all companies

## If Still Not Working

### Manual Database Seed
If Flyway didn't run, manually execute the SQL:

```bash
cd cip-backend-lite/src/main/resources/db/migration
psql -U postgres -d cip_db -f V7__seed_company_questions.sql
psql -U postgres -d cip_db -f V10__add_new_companies_and_hr_questions.sql
```

### Force Flyway Migration
```bash
cd cip-backend-lite
mvn flyway:clean
mvn flyway:migrate
mvn spring-boot:run
```

## Verification Checklist

- [ ] Database has company_questions table
- [ ] Table has 100+ rows with multiple companies
- [ ] Backend API returns companies list
- [ ] Frontend loads config successfully
- [ ] Dropdown shows all companies
- [ ] Selecting a company works

## Expected Behavior

### Before Fix
```
Company Dropdown:
┌─────────────────────┐
│ Choose a company... │
│ Google              │ ← Only one option
└─────────────────────┘
```

### After Fix
```
Company Dropdown:
┌─────────────────────┐
│ Choose a company... │
│ Accenture           │
│ AWS                 │
│ Amazon              │
│ Argusoft            │
│ Azure               │
│ Cloud Nexus         │
│ Cognizant           │
│ Flipkart            │
│ GCP                 │
│ Gateway Group       │
│ Google              │
│ Infosys             │
│ Microsoft           │
│ TCS                 │
└─────────────────────┘
```

## Companies in Database

| Company | Questions | Categories |
|---------|-----------|------------|
| **Google** | 20+ | System Design, DSA, HR |
| **Amazon** | 15+ | System Design, Leadership, HR |
| **Microsoft** | 15+ | System Design, Coding, HR |
| **Flipkart** | 10+ | System Design, Backend, HR |
| **TCS** | 10+ | Java, Backend, HR |
| **Infosys** | 10+ | Java, Backend, HR |
| **Cognizant** | 10+ | Java, Backend, HR |
| **Accenture** | 10+ | Java, Backend, HR |
| **Gateway Group** | 10+ | Spring, Java, Architecture |
| **Argusoft** | 10+ | Spring Boot, JPA, Backend |
| **AWS** | 10+ | Cloud, DevOps, Architecture |
| **Azure** | 5+ | Cloud, Security, PaaS |
| **GCP** | 5+ | Cloud, Data Engineering |
| **Cloud Nexus** | 5+ | Multi-Cloud, Architecture |

## Technical Details

### Database Schema
```sql
CREATE TABLE company_questions (
    id BIGSERIAL PRIMARY KEY,
    company_name VARCHAR(255),
    role VARCHAR(255),
    difficulty VARCHAR(50),
    question TEXT NOT NULL,
    ideal_answer TEXT,
    tags TEXT[],
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_company_name ON company_questions(company_name);
CREATE INDEX idx_role ON company_questions(role);
CREATE INDEX idx_difficulty ON company_questions(difficulty);
```

### API Flow
```
Frontend (interview/setup/page.tsx)
    ↓
    GET /interview/v3/config
    ↓
InterviewV3Controller.getConfiguration()
    ↓
InterviewV3Service.getConfigurationOptions()
    ↓
CompanyQuestionRepository.findAllCompanyNames()
    ↓
SQL: SELECT DISTINCT company_name FROM company_questions
    ↓
Returns: ["Accenture", "AWS", "Amazon", ...]
    ↓
Frontend renders dropdown with all companies
```

## Debugging Commands

### Check Backend Logs
```bash
tail -f cip-backend-lite/logs/application.log | grep "company"
```

### Check Database Connection
```bash
psql -U postgres -d cip_db -c "SELECT COUNT(*) FROM company_questions;"
```

### Check API Response
```bash
curl -X GET http://localhost:8080/interview/v3/config \
  -H "Content-Type: application/json" | jq
```

### Check Frontend Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Filter: "config"
4. Check response payload

## Success Criteria

✅ API returns 14 companies  
✅ Dropdown shows all 14 companies  
✅ Selecting a company works  
✅ Starting interview with selected company works  
✅ Interview questions are company-specific  

## Contact

If issue persists after following all steps:
1. Check backend logs for errors
2. Verify database connection
3. Test API endpoint directly
4. Check frontend console for errors
5. Verify Flyway migrations ran successfully

---

**Status**: Backend and Frontend code is correct. Issue is likely database not seeded or API not accessible.
