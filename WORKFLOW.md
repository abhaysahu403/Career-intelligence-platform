# 🚀 Career Intelligence Platform — Complete Project Workflow

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                               │
│                    http://localhost:3000                             │
│              Next.js 14 Frontend (TypeScript + React)               │
└────────────────────────┬────────────────────────────────────────────┘
                         │
           ┌─────────────┴──────────────┐
           │                            │
           ▼                            ▼
┌──────────────────┐          ┌──────────────────────┐
│  Spring Boot     │          │   FastAPI ML Service  │
│  Backend         │          │   (Python)            │
│  Port: 8080      │          │   Port: 8000          │
│  Java 17         │          │   AI / ML Engine      │
└────────┬─────────┘          └──────────────────────┘
         │
         ▼
┌──────────────────┐
│  H2 Database     │
│  (File on disk)  │
│  ./data/cipdb    │
└──────────────────┘
```

---

## 2. TECHNOLOGY STACK

### Frontend (cip-web)
| Technology     | Purpose                              |
|----------------|--------------------------------------|
| Next.js 14     | React framework with routing         |
| TypeScript     | Type-safe JavaScript                 |
| TailwindCSS    | Styling                              |
| Framer Motion  | Animations                           |
| Zustand        | Global state (user, score)           |
| Axios          | HTTP requests to backend             |
| React Query    | Data fetching and caching            |
| Recharts       | Charts and graphs                    |
| PDF.js         | Extract text from PDF resumes        |
| Web Speech API | Browser microphone for voice input   |
| js-cookie      | Store JWT token in browser           |

### Backend (cip-backend-lite)
| Technology       | Purpose                              |
|------------------|--------------------------------------|
| Java 17          | Programming language                 |
| Spring Boot 3.2  | REST API framework                   |
| Maven            | Build and dependency manager         |
| Spring Security  | Authentication and authorization     |
| JWT (jjwt)       | Token-based login                    |
| BCrypt           | Password hashing                     |
| Hibernate / JPA  | ORM — Java objects to DB tables      |
| H2 Database      | Embedded file-based database         |
| Lombok           | Auto-generate boilerplate code       |
| Spring Actuator  | Health check endpoint                |

### ML Service (cip-ml)
| Technology         | Purpose                              |
|--------------------|--------------------------------------|
| Python 3.10+       | Programming language                 |
| FastAPI            | REST API framework                   |
| Google Gemini AI   | Generate questions + evaluate answers|
| scikit-learn       | ML scoring algorithms                |
| numpy              | Numerical computations               |
| rapidfuzz          | Fuzzy text matching                  |
| ElevenLabs (opt.)  | Text-to-speech audio feedback        |
| Kafka (opt.)       | Event streaming between services     |
| uvicorn            | ASGI server to run FastAPI           |

---

## 3. COMPLETE USER JOURNEY — STEP BY STEP

```
STEP 1: User opens http://localhost:3000
         ↓
    Landing Page loads
    (Navbar, Hero, Features, HowItWorks, Demo, CTA, Footer)

STEP 2: User clicks "Sign Up"
         ↓
    /auth/signup page loads
    User fills: Name, Email, Password
         ↓
    POST http://localhost:8080/auth/signup
         ↓
    Backend: hashes password → saves user → generates JWT token
         ↓
    Token saved in browser cookie (cip_token)
    User redirected to /dashboard

STEP 3: Dashboard loads
         ↓
    GET /score        → readiness score (0-100)
    GET /analytics    → interview history, weak skills
    GET /jobs/recommended → matched job listings
         ↓
    Shows: Score cards, Progress chart, Job matches, Skill matrix

STEP 4: User goes to Interview page
         ↓
    Selects Role (SDE, Frontend, Backend, etc.)
    Selects Persona (Friendly / Strict / FAANG)
    Clicks "Start"
         ↓
    POST /interview/start → creates session in DB
    GET  /ml/interview/question → AI generates first question
    Browser microphone activates

STEP 5: Interview runs (voice-based)
         ↓
    AI speaks the question (browser TTS or ElevenLabs)
    User speaks answer → Web Speech API converts to text
    After 2.5 seconds of silence → answer is finalized
         ↓
    POST /ml/interview/coach → AI evaluates answer
    Returns: score, what was good, what was missing, ideal answer, tip
         ↓
    POST /interview/answer → saves Q&A + score to database
    AI speaks feedback back to user
    Next question loads automatically

STEP 6: User ends interview
         ↓
    POST /interview/end → calculates average score
    Readiness score updates in database
    Summary page shows: overall score, per-question breakdown,
    weak areas, recommendations

STEP 7: User uploads Resume
         ↓
    PDF.js extracts text from PDF in browser
    POST /resume/upload-text → saves to backend
    POST /ml/resume/analyze → AI extracts skills, calculates score
    Resume score updates readiness

STEP 8: User uploads Certificate
         ↓
    POST /certificate/upload → saves file info
    POST /ml/certificate/validate → OCR reads certificate
    Checks against known issuer registry
    Returns authenticity score (0-100)

STEP 9: User views Jobs page
         ↓
    GET /jobs/recommended → backend matches skills to jobs
    Shows: company, role, match %, matched skills, missing skills

STEP 10: User views Analytics
          ↓
    GET /analytics → interview history, average scores
    Shows: progress chart, skill radar, weak topic forensics
```

---

## 4. AUTHENTICATION WORKFLOW

```
┌─────────────┐     POST /auth/signup      ┌─────────────────┐
│   Browser   │ ─────────────────────────► │  AuthController │
│             │  {name, email, password}    │                 │
│             │                            │  1. Check email │
│             │                            │     exists?     │
│             │                            │  2. BCrypt hash │
│             │                            │     password    │
│             │                            │  3. Save User   │
│             │                            │     to DB       │
│             │                            │  4. Generate    │
│             │                            │     JWT token   │
│             │ ◄───────────────────────── │                 │
│             │  {token, userId, name...}  │                 │
│             │                            └─────────────────┘
│  Saves token│
│  in cookie  │
│  (cip_token)│
└─────────────┘

Every request after login:
┌─────────────┐   Authorization: Bearer eyJhbG...   ┌────────────┐
│   Browser   │ ──────────────────────────────────► │ JwtFilter  │
│             │                                     │            │
│             │                                     │ 1. Extract │
│             │                                     │    token   │
│             │                                     │ 2. Decode  │
│             │                                     │    email   │
│             │                                     │ 3. Load    │
│             │                                     │    user    │
│             │                                     │ 4. Verify  │
│             │                                     │    valid?  │
│             │                                     │    ↓       │
│             │                                     │ Controller │
└─────────────┘                                     └────────────┘
```

---

## 5. INTERVIEW WORKFLOW (DETAILED)

```
User clicks START
      │
      ▼
POST /interview/start
→ DB: interviews table
  { id: 5, userId: 1, status: IN_PROGRESS, jobRole: "SDE" }
      │
      ▼
GET /interview/question/5
→ ML generates question using Gemini AI
  (or fallback question bank if no API key)
      │
      ▼
Browser speaks question aloud (TTS)
      │
      ▼
User speaks answer → Web Speech API → text transcript
      │
      ▼
2.5 seconds silence detected → answer finalized
      │
      ▼
POST /interview/evaluate
→ ML scores the answer:
  { score: 82, good: "...", missing: "...", ideal: "...", tip: "..." }
      │
      ▼
POST /interview/answer
→ DB: interview_answers table
  { interviewId: 5, question: "...", answer: "...", score: 82 }
      │
      ▼
Browser speaks feedback aloud
      │
      ▼
Next question loads → repeat cycle
      │
      ▼
User clicks STOP
      │
      ▼
POST /interview/end?interviewId=5
→ Average all answer scores: (82+75+90)/3 = 82.3
→ DB: interviews updated { status: COMPLETED, totalScore: 82.3 }
→ DB: scores updated { interviewScore: 82.3 }
→ Readiness recalculated
      │
      ▼
Summary page shown
```

---

## 6. READINESS SCORE FORMULA

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   Readiness = (Resume Score  × 40%)                 │
│             + (Interview Score × 40%)               │
│             + (Academic Score × 20%)                │
│                                                     │
│   Example:                                          │
│   Resume Score    = 80  →  80 × 0.4 = 32           │
│   Interview Score = 70  →  70 × 0.4 = 28           │
│   Academic Score  = 60  →  60 × 0.2 = 12           │
│                            ─────────────            │
│   Readiness Score          =    72 / 100            │
│                                                     │
│   Level:                                            │
│   ≥ 75  →  "Job Ready"   🟢                        │
│   50-74 →  "Developing"  🟡                        │
│   < 50  →  "Beginner"    🔴                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 7. ML SERVICE WORKFLOW

```
                    ┌─────────────────────────────┐
                    │      FastAPI ML Service      │
                    │       Port: 8000             │
                    └──────────────┬──────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
          ▼                        ▼                        ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Resume Analyzer │   │Interview Evaluator│   │Certificate       │
│                  │   │                  │   │Validator         │
│ Input: text      │   │ Input: Q + Answer│   │                  │
│                  │   │                  │   │ Input: image/PDF │
│ Output:          │   │ Output:          │   │                  │
│ - skills list    │   │ - score (0-100)  │   │ Output:          │
│ - resume score   │   │ - what was good  │   │ - authenticity   │
│ - skill gaps     │   │ - what's missing │   │   score          │
│ - job fit %      │   │ - ideal answer   │   │ - issuer check   │
└──────────────────┘   │ - improvement tip│   │ - warnings       │
                       └──────────────────┘   └──────────────────┘
          │                        │
          ▼                        ▼
┌──────────────────┐   ┌──────────────────┐
│ Career Readiness │   │ Job Recommender  │
│                  │   │                  │
│ Input:           │   │ Input:           │
│ - resume score   │   │ - user skills    │
│ - interview score│   │ - readiness score│
│ - academic score │   │ - job list       │
│                  │   │                  │
│ Output:          │   │ Output:          │
│ - readiness %    │   │ - ranked jobs    │
│ - level          │   │ - match %        │
│ - recommendation │   │ - missing skills │
└──────────────────┘   └──────────────────┘
```

---

## 8. DATABASE TABLES

```
┌──────────────────────────────────────────────────────────────┐
│                        H2 DATABASE                           │
│                   ./data/cipdb.mv.db                         │
├──────────────┬───────────────────────────────────────────────┤
│ TABLE        │ COLUMNS                                       │
├──────────────┼───────────────────────────────────────────────┤
│ users        │ id, name, email, password(hashed),            │
│              │ role, active, created_at                      │
├──────────────┼───────────────────────────────────────────────┤
│ resumes      │ id, user_id, file_name, file_url,             │
│              │ parse_status, resume_score, resume_text,      │
│              │ parsed_skills, uploaded_at                    │
├──────────────┼───────────────────────────────────────────────┤
│ interviews   │ id, user_id, type, job_role, status,          │
│              │ total_questions, answered_questions,          │
│              │ total_score, feedback, started_at,            │
│              │ completed_at                                  │
├──────────────┼───────────────────────────────────────────────┤
│ interview_   │ id, interview_id, question_index, question,   │
│ answers      │ answer, score, topic, difficulty, feedback,   │
│              │ time_taken_seconds, answered_at               │
├──────────────┼───────────────────────────────────────────────┤
│ jobs         │ id, company, role, description,               │
│              │ minimum_readiness_score, required_skills,     │
│              │ experience_level, domain, active              │
├──────────────┼───────────────────────────────────────────────┤
│ scores       │ id, user_id, readiness, level, resume_score,  │
│              │ interview_score, academic_score,              │
│              │ recommendation, calculated_at                 │
├──────────────┼───────────────────────────────────────────────┤
│ certificates │ id, user_id, file_name, file_url, status,     │
│              │ authenticity_score, confidence_level,         │
│              │ extracted_data, warnings, created_at          │
└──────────────┴───────────────────────────────────────────────┘
```

---

## 9. ALL API ENDPOINTS

```
BASE URL: http://localhost:8080

AUTH
  POST   /auth/signup              Register new user
  POST   /auth/login               Login, get JWT token
  GET    /auth/me                  Get my profile
  POST   /auth/logout              Logout

RESUME
  POST   /resume/upload            Upload PDF file
  POST   /resume/upload-text       Upload resume as text
  GET    /resume                   Get all my resumes
  GET    /resume/latest            Get my latest resume

INTERVIEW
  POST   /interview/start          Start new interview session
  POST   /interview/answer         Submit one answer
  POST   /interview/end            End interview, get final score
  GET    /interview/result/:id     Get result of one interview
  GET    /interview/history        Get all my past interviews

JOBS
  GET    /jobs                     List all jobs (paginated)
  GET    /jobs/:id                 Get one job by ID
  GET    /jobs/recommended         Get jobs matched to my skills

SCORE
  GET    /score                    Get my readiness score
  POST   /score/update             Update score (admin)

CERTIFICATE
  POST   /certificate/upload       Upload certificate file
  GET    /certificate/:id          Get validation result
  GET    /certificate/user         Get all my certificates

ANALYTICS
  GET    /analytics                Get my interview analytics

HEALTH
  GET    /actuator/health          Check if server is alive

─────────────────────────────────────────────────────────────
ML SERVICE: http://localhost:8000

  POST   /ml/resume/analyze        Analyze resume text
  POST   /ml/interview/question    Generate next question
  POST   /ml/interview/evaluate    Evaluate an answer
  POST   /ml/interview/coach       Full coaching with feedback
  POST   /ml/readiness             Compute career readiness
  POST   /ml/recommend             Recommend jobs
  POST   /ml/certificate/validate  Validate certificate
  GET    /health                   ML service health check
  GET    /docs                     Interactive API docs
```

---

## 10. REQUEST FLOW — HOW EVERY API CALL WORKS

```
Frontend (Browser)
      │
      │  HTTP Request
      │  Headers: Authorization: Bearer <token>
      │           X-User-Id: 1
      │           Content-Type: application/json
      ▼
JwtFilter.java
      │  Reads token from Authorization header
      │  Decodes email from token
      │  Loads user from database
      │  Marks request as authenticated
      ▼
SecurityConfig.java
      │  Is this route public or protected?
      │  Public: /auth/signup, /auth/login → pass through
      │  Protected: everything else → check token
      ▼
Controller (e.g. InterviewController.java)
      │  Runs the business logic
      │  Reads X-User-Id header to know which user
      ▼
Repository (e.g. InterviewRepository.java)
      │  Runs SQL query on H2 database
      │  SELECT / INSERT / UPDATE
      ▼
ApiResponse.java
      │  Wraps result in standard format:
      │  { success: true, message: "...", data: {...} }
      ▼
HTTP Response → back to Frontend
```

---

## 11. HOW TO START THE PROJECT

```
TERMINAL 1 — ML Service
  cd cip-ml
  python main.py
  → Starts on http://localhost:8000

TERMINAL 2 — Backend
  cd cip-backend-lite
  $env:PATH = "C:\maven\apache-maven-3.9.6\bin;" + $env:PATH
  mvn spring-boot:run
  → Starts on http://localhost:8080

TERMINAL 3 — Frontend
  cd cip-web
  npm run dev
  → Starts on http://localhost:3000

OPEN BROWSER → http://localhost:3000
```

---

## 12. PAGES IN THE WEB APP

```
PUBLIC PAGES (no login needed)
  /                    Landing page
  /auth/login          Login form
  /auth/signup         Signup form

PROTECTED PAGES (login required)
  /dashboard           Main overview with scores and charts
  /interview           AI voice interview coach
  /dashboard/certificates        Certificate upload and validation
  /dashboard/certificates/upload Upload new certificate
  /jobs                Job listings and recommendations
  /analytics           Detailed progress analytics
  /profile             User profile and skills
  /roadmap             Personalized learning roadmap
  /settings            Account settings
```

---

## 13. DATA FLOW DIAGRAM

```
USER ACTION          FRONTEND           BACKEND           ML SERVICE
─────────────────────────────────────────────────────────────────────
Sign Up         →  POST /auth/signup  →  Save user to DB
                ←  JWT token          ←

Upload Resume   →  Extract PDF text   →  POST /resume/upload-text
                                      →  POST /ml/resume/analyze  →  Analyze text
                                      ←  skills, score            ←
                ←  Resume score shown ←

Start Interview →  POST /interview/start → Create session in DB
                ←  interview ID       ←
                →  GET /interview/question/5
                                      →  POST /ml/interview/question → Generate Q
                                      ←  question text              ←
                ←  Question displayed ←

Answer Question →  Voice → text       →  POST /interview/evaluate
                                      →  POST /ml/interview/coach  →  Score answer
                                      ←  score, feedback           ←
                →  POST /interview/answer → Save to DB
                ←  Next question      ←

End Interview   →  POST /interview/end → Avg scores, update DB
                ←  Final score        ←  Readiness recalculated

View Dashboard  →  GET /score         ←  Readiness score from DB
                →  GET /analytics     ←  Interview history from DB
                →  GET /jobs/recommended ← Matched jobs from DB
```

---

*Generated for Career Intelligence Platform v1.0*
