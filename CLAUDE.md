# CLAUDE.md — Career Intelligence Platform (CIP)

## ⚡ OUTPUT RULES (READ FIRST, ALWAYS FOLLOW)
- NO paragraphs. Use bullets, code blocks, inline comments only.
- NO filler: no "Great!", no "Sure!", no "I'll help you with...", no summaries after doing work.
- NO re-reading files you already read this session unless content changed.
- NO rewriting entire files to change 3 lines — use targeted edits only.
- Prefer `str_replace` / patch over full rewrites.
- When task is done → STOP. Don't explain what you just did.
- Errors → show error + fix. Not explanation of why errors happen in general.
- If unsure → ask ONE short question. Not 5 clarifying questions.
- Code comments: only where logic is non-obvious. Not "// set the variable".

---

## 🗂️ MONOREPO MAP (don't explore, use this)

- Real project root is nested: `cip-backend-lite/` (this repo's top level is just a wrapper — `cip-backend-lite` is its own git repo, not a registered submodule)

```
cip-backend-lite/
├── cip-web/          → Next.js 14 + TypeScript + TailwindCSS (port 3000)
├── cip-backend/      → 9 Spring Boot 3.2 / Java 17 microservices + API Gateway (gateway on 8080)
├── cip-ml/           → FastAPI + Python 3.10 + Gemini AI (port 8000, single main.py, no routers/)
├── database/         → Plain PostgreSQL SQL scripts (create_dbs.sql, seed_real_jobs.sql, demo_queries.sql) — NOT Flyway
├── docs/, storage/, uploads/
├── docker-compose.yml
└── .env / .env.example
```

---

## 🔌 SERVICE DETAILS

### cip-web (Next.js 14)
- State: Zustand
- Styling: TailwindCSS
- Forms: React Hook Form + Zod
- Charts: Recharts
- Animation: Framer Motion
- HTTP: Axios → `http://localhost:8080` (gateway, no `/api` prefix — routes are `/auth`, `/student`, `/resume`, etc., not `/api/...`)
- Build: `npm run build` | Dev: `npm run dev`
- Key dirs (actual): `app/(app)/{analytics,dashboard,faculty,interview,jobs,profile,roadmap,settings}`, `app/(app)/dashboard/certificates`, `app/(app)/faculty/{create-interview,dashboard}`, `app/(app)/interview/{custom,demo,join,live,report,result,setup}`, `app/auth/{login,signup}`, `app/api/health`

### cip-backend — 9 separate Maven microservices + API Gateway (NOT one Spring Boot app)
- Java 17, Maven, each service is its own module under `cip-backend/`
- Gateway: `cip-backend/api-gateway` (Spring Cloud Gateway, reactive, port 8080) — routes by path prefix to backend services, applies `JwtAuthFilter`, handles CORS (allows `http://localhost:3000`)
- Redis used by gateway (rate limiting / session support)
- Services (module → package → route prefix → port):
  | Service | Package | Gateway route prefix | Port |
  |---|---|---|---|
  | auth-service | `com.cip.auth` | `/auth/**` | 8081 |
  | student-service | `com.cip.student` | `/student/**` | 8082 |
  | interview-service | `com.cip.interview` | `/interview/**` | 8083 |
  | resume-service | `com.cip.resume` | `/resume/**` | 8084 |
  | certificate-service | `com.cip.certificate` | `/certificates/**` | 8085 |
  | job-service | `com.cip.job` | `/jobs/**` | 8086 |
  | recommendation-service | `com.cip.recommendation` | `/roadmap/**`, `/recommendations/**` | 8087 |
  | score-service | `com.cip.score` | `/score/**` | 8088 |
  | analytics-service | `com.cip.analytics` | `/analytics/**` | 8089 |
- Each service: `controller/`, `service/`, own DB (Postgres, one DB per service — see `database/create_dbs.sql`)
- Talks to ML: `http://localhost:8000` (or `ML_SERVICE_URL` in docker)
- Run single service: `cd cip-backend/<service>-service && mvn spring-boot:run`
- Config: `src/main/resources/application.yml` per service (gateway config: `cip-backend/api-gateway/src/main/resources/application.yml`)

### cip-ml (FastAPI)
- Python 3.10+, uvicorn, single `main.py` (no `routers/` split — don't assume one exists)
- AI: Google Gemini AI (`google-generativeai`)
- OCR: PaddleOCR (primary), Tesseract (fallback)
- PDF: PyMuPDF, CV: OpenCV, ML: scikit-learn
- Run: `uvicorn main:app --reload --port 8000`
- Real endpoints (all under `/ml/...`, plus `/` and `/health`):
  `/ml/embeddings/generate`, `/ml/similarity/calculate`, `/ml/embeddings/batch`,
  `/ml/resume/rag-parse`, `/ml/resume/context`, `/ml/resume/embeddings`, `/ml/resume/analyze`, `/ml/resume/upload`,
  `/ml/interview/question`, `/ml/interview/evaluate`, `/ml/interview/coach`,
  `/ml/readiness`, `/ml/recommend`, `/ml/certificate/validate`, `/ml/batch/analyze`

### database/
- PostgreSQL 14+, one database per microservice (see `create_dbs.sql`): `cip_auth`, `cip_students`, `cip_resumes`, `cip_scores`, `cip_interviews`, `cip_jobs`, `cip_recommendations`, `cip_certificate`, `cip_analytics`
- **No Flyway** — plain `.sql` scripts (`create_dbs.sql`, `seed_real_jobs.sql`, `demo_queries.sql`, `commends.sql`, `show_questions_commands.sql`) + `jobs.json` seed
- Actual `@Table` entities found: `users`, `student_profiles`, `interviews`, `resumes`, `scores`, `jobs`, `certificates`, `certificate_results`
- Flyway migrations are a planned addition, not yet present — see TODO below

---

## 🛠️ COMMON COMMANDS

```bash
# Frontend
cd cip-backend-lite/cip-web && npm run dev
cd cip-backend-lite/cip-web && npm run build
cd cip-backend-lite/cip-web && npm run lint

# Backend — run one microservice
cd cip-backend-lite/cip-backend/<name>-service && mvn spring-boot:run
cd cip-backend-lite/cip-backend/<name>-service && mvn clean package -DskipTests
cd cip-backend-lite/cip-backend/<name>-service && mvn test

# ML
cd cip-backend-lite/cip-ml && uvicorn main:app --reload --port 8000
cd cip-backend-lite/cip-ml && pip install -r requirements.txt

# All services + infra (Postgres, Redis, gateway, 8 services, ML, frontend)
cd cip-backend-lite && docker-compose up --build
```

---

## 🧱 ARCHITECTURE RULES (don't violate these)

- Frontend NEVER calls cip-ml directly → always via api-gateway (8080)
- `api-gateway` is the single entry point for all frontend requests — it routes to the 9 backend microservices by path prefix, don't add a new gateway or bypass it
- JWT validated via gateway's `JwtAuthFilter` — don't bypass
- Each microservice owns its own database — don't cross-query another service's DB directly, go through its API
- No Flyway yet — raw SQL changes go in `database/` for now; once Flyway is introduced (planned), migrations become mandatory and this rule updates
- Gemini AI calls live only in cip-ml — never in backend/frontend
- CORS handled in api-gateway config — don't add frontend proxy hacks
- Route prefixes have NO `/api` — it's `/auth`, `/student`, `/interview`, `/resume`, `/certificates`, `/jobs`, `/roadmap`, `/recommendations`, `/score`, `/analytics`

---

## 📐 CODING STANDARDS

### TypeScript (cip-web)
- Strict mode ON — no `any`, no `@ts-ignore`
- Functional components only — no class components
- Zod schema first, then infer types: `z.infer<typeof schema>`
- API calls in `lib/api/` — not inline in components
- Zustand stores in `store/` — one file per domain

### Java (cip-backend, applies per microservice)
- `@Service` layer between `@Controller` and repository — no logic in controllers
- DTOs for request/response — never expose entities directly
- All exceptions handled in `@ControllerAdvice`
- No `System.out.println` — use SLF4J logger
- Transactions on service methods, not repositories
- Cross-service calls go through the gateway or a REST client — never import another service's internal classes (they're separate Maven modules/JVMs)

### Python (cip-ml)
- Pydantic models for all request/response schemas
- Async endpoints (`async def`) for all I/O-bound operations
- Gemini calls wrapped in try/except with fallback
- PaddleOCR → Tesseract fallback pattern must be preserved
- No global state — use FastAPI dependency injection

---

## 🚫 NEVER DO
- Don't install new npm/pip/maven packages without asking
- Don't touch `security/` config or `JwtAuthFilter` without explicit instruction
- Don't run `DROP TABLE` or destructive SQL
- Don't commit `.env` files or API keys — **`.env.example` currently has a real Gemini key committed; rotate it and replace with a placeholder ASAP**
- Don't change ports (3000 web, 8080 gateway, 8081–8089 microservices, 8000 ml) — docker-compose and gateway routes depend on them
- Don't merge two microservices into one module — keep the per-service boundary even for small changes

---

## 🎯 FEATURE CONTEXT

| Feature | Backend service | Gateway route prefix | ML endpoint | Frontend route |
|---|---|---|---|---|
| Auth | auth-service | `/auth` | — | `/auth/login`, `/auth/signup` |
| Student profile | student-service | `/student` | — | `/(app)/profile` |
| Interview Coach | interview-service | `/interview` | `/ml/interview/*` | `/(app)/interview/*` |
| Resume Analysis | resume-service | `/resume` | `/ml/resume/*` | (via dashboard/profile) |
| Certificate Validation | certificate-service | `/certificates` | `/ml/certificate/validate` | `/(app)/dashboard/certificates` |
| Job Matching | job-service | `/jobs` | `/ml/recommend` | `/(app)/jobs` |
| Recommendation / Roadmap | recommendation-service | `/roadmap`, `/recommendations` | `/ml/recommend` | `/(app)/roadmap` |
| Score | score-service | `/score` | `/ml/readiness` | (feeds analytics/dashboard) |
| Analytics | analytics-service | `/analytics` | — | `/(app)/analytics` |
| Faculty | (student/interview services) | — | — | `/(app)/faculty/{dashboard,create-interview}` |

---

## 🔢 SCALE CONSTANTS (unverified against current seed data — confirm before hardcoding)
- Interview questions: 250+
- Certificate institutions registry: 390+
- Job listings: 100+
- Supported companies: 14
- Supported branches: 7
- Supported job roles: 11
- Match Score formula: `(Skill Match × 50%) + (Interview Score × 30%) - (Gap Penalty × 20%)`
- Certificate authenticity score: 0–100
- Resume score: 0–100
- Career readiness score: 0–100

---

## 💾 ENV VARIABLES (from `cip-backend-lite/.env.example`)
```
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=cip_user
DB_PASSWORD=
DB_NAME=career_intelligence

# Redis (used by api-gateway)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# Auth
JWT_SECRET=
JWT_EXPIRATION=86400

# ML
GEMINI_API_KEY=

# Service URLs / ports
ML_SERVICE_URL=http://ml-service:8000
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_ML_URL=http://localhost:8000
API_GATEWAY_PORT=8080
AUTH_SERVICE_PORT=8081
STUDENT_SERVICE_PORT=8082
INTERVIEW_SERVICE_PORT=8083
RESUME_SERVICE_PORT=8084
CERTIFICATE_SERVICE_PORT=8085
JOB_SERVICE_PORT=8086
# (+ recommendation/score/analytics service ports 8087-8089, see .env.example)

# Storage
STORAGE_TYPE=local
STORAGE_PATH=/app/storage
UPLOAD_MAX_SIZE=10485760
SPRING_PROFILES_ACTIVE=docker
```

---

## 📌 TODO (agreed next steps)
- [ ] Rotate leaked Gemini API key in `.env.example`, replace with placeholder
- [ ] Introduce Flyway migrations per microservice (each service owns its schema — migrations should live under that service's module, not one shared `database/` folder)
