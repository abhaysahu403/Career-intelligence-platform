# 🏗️ System Architecture

## Overview
Career Intelligence Platform (CIP) is a microservices-based AI-powered interview preparation system with three main components: Frontend (Next.js), Backend (Spring Boot), and ML Service (FastAPI).

## High-Level Architecture

\\\
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                    (Next.js 14 - React 18)                       │
│  • Dashboard  • Interview  • Jobs  • Profile  • Analytics       │
└─────────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Port 8080)                     │
│                   Spring Boot 3.2 - Java 17                      │
│  • Authentication (JWT)  • Authorization  • Rate Limiting        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────────┐            ┌──────────────────────┐
│   BACKEND SERVICES   │            │     ML SERVICE       │
│   (Spring Boot)      │            │     (FastAPI)        │
│   Port: 8080         │←──────────→│   Port: 8000         │
│                      │   HTTP     │                      │
│ • Interview V3       │            │ • Gemini AI          │
│ • Resume Parser      │            │ • Resume Analysis    │
│ • Certificate        │            │ • Interview Eval     │
│ • Job Matching       │            │ • Certificate OCR    │
│ • Analytics          │            │ • Career Readiness   │
└──────────────────────┘            └──────────────────────┘
        ↓                                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                         │
│  • Users  • Interviews  • Certificates  • Jobs  • Analytics     │
└─────────────────────────────────────────────────────────────────┘
\\\

## Component Details

### 1. Frontend (Next.js 14)
**Technology Stack:**
- Framework: Next.js 14 with App Router
- Language: TypeScript
- Styling: TailwindCSS
- State: Zustand
- Animations: Framer Motion
- HTTP: Axios

**Key Features:**
- Server-side rendering (SSR)
- Client-side routing
- Real-time voice recognition
- Responsive design
- Progressive Web App (PWA) ready

### 2. Backend (Spring Boot 3.2)
**Technology Stack:**
- Framework: Spring Boot 3.2
- Language: Java 17
- Database: PostgreSQL 14+
- ORM: Hibernate/JPA
- Security: JWT + Spring Security
- Build: Maven

**Modules:**
- **Auth Module**: User authentication and authorization
- **Interview V3 Module**: AI-powered interview system
- **Certificate Module**: Certificate validation
- **Job Module**: Job matching engine
- **Analytics Module**: Performance tracking

### 3. ML Service (FastAPI)
**Technology Stack:**
- Framework: FastAPI
- Language: Python 3.10+
- AI: Google Gemini AI
- OCR: PaddleOCR, Tesseract
- Image: OpenCV, Pillow

**Services:**
- Gemini AI integration
- Resume parsing and analysis
- Interview answer evaluation
- Certificate OCR and validation
- Career readiness scoring

## Detailed Flow Diagrams

### Interview System Flow
\\\
User → Setup Interview → Pre-Interview Tips (Voice) → Start Interview
                                                              ↓
                                                    Question Generated (AI)
                                                              ↓
                                                    User Answers (Voice/Text)
                                                              ↓
                                                    Real-time Analytics
                                                              ↓
                                                    AI Evaluation
                                                              ↓
                                                    Next Question / End
                                                              ↓
                                                    Interview Report
\\\

### Certificate Validation Flow
\\\
User Uploads Certificate (PDF/Image)
            ↓
    Convert PDF to Images
            ↓
    OCR Extraction (PaddleOCR + Tesseract)
            ↓
    Text Analysis & Parsing
            ↓
    Issuer Matching (390+ institutions)
            ↓
    QR Code Detection & Verification
            ↓
    Tamper Detection
            ↓
    Authenticity Score (0-100)
            ↓
    Store Result in Database
\\\

### Job Matching Algorithm
\\\
Match Score = (Skill Match × 50%) + (Interview Performance × 30%) - (Gap Penalty × 20%)

Where:
- Skill Match: Jaccard similarity between user skills and job requirements
- Interview Performance: Latest interview score / 100
- Gap Penalty: Weak skills matching job critical skills
\\\

## Database Schema

### Core Tables

**users**
- id (PK)
- name
- email (unique)
- password (hashed)
- role (STUDENT/ADMIN/FACULTY)
- active (boolean)
- created_at
- updated_at

**interviews**
- id (PK)
- user_id (FK)
- interview_mode
- company
- round_type
- difficulty
- duration
- status
- overall_score
- created_at

**interview_responses**
- id (PK)
- interview_id (FK)
- question_index
- question_text
- user_answer
- ai_feedback
- score
- time_taken

**certificates**
- id (PK)
- user_id (FK)
- file_path
- file_name
- file_type
- upload_date

**certificate_results**
- id (PK)
- certificate_id (FK)
- authenticity_score
- is_genuine
- issuer_name
- validation_method
- extracted_text
- qr_data

**jobs**
- id (PK)
- company
- role
- location
- employment_type
- salary_range
- required_skills (array)
- source_url

## API Endpoints

### Authentication
- POST /auth/signup - Register new user
- POST /auth/login - User login
- GET /auth/me - Get user profile
- POST /auth/logout - Logout user

### Interview V3
- GET /interview/v3/config - Get interview configuration
- GET /interview/v3/tips - Get pre-interview tips
- POST /interview/v3/start - Start new interview
- POST /interview/v3/answer - Submit answer
- GET /interview/v3/session/{id} - Get interview session
- POST /interview/v3/end - End interview

### Jobs
- GET /jobs/recommended - Get recommended jobs
- GET /jobs/filter - Filter jobs by criteria
- GET /jobs/{id} - Get job details

### Certificates
- POST /certificates/upload - Upload certificate
- GET /certificates - Get user certificates
- GET /certificates/{id} - Get certificate details
- DELETE /certificates/{id} - Delete certificate

### Analytics
- GET /analytics - Get user analytics
- GET /analytics/career - Get career analysis

## Security

### Authentication Flow
1. User submits credentials
2. Backend validates and generates JWT token
3. Token includes: userId, email, role, name
4. Token expires in 24 hours
5. Frontend stores token in memory (Zustand)
6. All API requests include Authorization header

### Authorization
- Public routes: /auth/signup, /auth/login
- Protected routes: All others require valid JWT
- Role-based access: ADMIN can access admin endpoints

## Deployment Architecture

### Development
\\\
localhost:3000 (Frontend)
localhost:8080 (Backend)
localhost:8000 (ML Service)
localhost:5432 (PostgreSQL)
\\\

### Production (Recommended)
\\\
Frontend: Vercel / AWS Amplify
Backend: AWS Elastic Beanstalk / ECS
ML Service: AWS ECS (GPU instance)
Database: AWS RDS PostgreSQL
Storage: AWS S3 (for certificates/resumes)
CDN: CloudFront
\\\

## Performance Considerations

### Frontend
- Code splitting with Next.js
- Image optimization
- Lazy loading components
- Service worker for offline support

### Backend
- Connection pooling (HikariCP)
- Query optimization with indexes
- Caching with in-memory store
- Async processing for heavy tasks

### ML Service
- Model caching
- Batch processing for OCR
- Rate limiting for Gemini API
- Fallback mechanisms

## Monitoring & Logging

### Backend
- Spring Boot Actuator for health checks
- Structured logging with SLF4J
- Log levels: INFO, WARN, ERROR

### ML Service
- FastAPI built-in logging
- Request/response logging
- Error tracking

## Scalability

### Horizontal Scaling
- Frontend: Multiple instances behind load balancer
- Backend: Stateless design allows multiple instances
- ML Service: Queue-based processing for heavy tasks

### Database
- Read replicas for analytics queries
- Partitioning for large tables
- Regular vacuum and analyze

## Technology Choices

### Why Next.js?
- SSR for better SEO
- File-based routing
- Built-in optimization
- Great developer experience

### Why Spring Boot?
- Mature ecosystem
- Enterprise-grade security
- Easy integration with PostgreSQL
- Strong typing with Java

### Why FastAPI?
- High performance
- Async support
- Easy ML model integration
- Auto-generated API docs

### Why PostgreSQL?
- ACID compliance
- JSON support
- Full-text search
- Mature and reliable

## Future Enhancements

### Phase 1 (Q2 2026)
- Mobile app (React Native)
- Video interview recording
- Advanced analytics dashboard
- Multi-language support

### Phase 2 (Q3 2026)
- Group discussion feature
- Peer-to-peer mock interviews
- Company-specific tracks
- LinkedIn integration

### Phase 3 (Q4 2026)
- AI resume builder
- Salary negotiation coach
- Career path recommendations
- Enterprise version

---

**Last Updated**: May 7, 2026
**Version**: 2.0.0
