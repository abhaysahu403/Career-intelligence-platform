# CIP v2.0-lite - Quick Start Guide

## 🚀 Overview
Career Intelligence Platform (CIP) v2.0-lite is a lightweight monolith version that helps students prepare for job interviews through AI-powered resume analysis, mock interviews, and personalized job recommendations.

## 📋 Prerequisites
- **Java 17+** (for backend)
- **Node.js 16+** (for frontend)
- **Python 3.9+** (for ML service)
- **PostgreSQL 14+** (database)

## 🏗️ Architecture
```
cip-backend-lite/  → Spring Boot monolith (Port 8080)
cip-ml/            → FastAPI ML service (Port 8000)
cip-web/           → React frontend (Port 3000)
```

## ⚙️ Setup Instructions

### 1. Database Setup
```bash
# Create database
createdb cip_db

# Or using psql
psql -U postgres
CREATE DATABASE cip_db;
\q
```

### 2. Backend Setup
```bash
cd cip-backend-lite

# Build
mvn clean package -DskipTests

# Run
java -jar target/cip-backend-lite-2.0.0.jar
```

**Environment Variables:**
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_NAME` - Database name (default: cip_db)
- `DB_USER` - Database user (default: postgres)
- `DB_PASSWORD` - Database password (default: cip123)
- `ML_SERVICE_URL` - ML service URL (default: http://localhost:8000)
- `JWT_SECRET` - JWT secret key
- `STORAGE_PATH` - File storage path (default: ./uploads)

### 3. ML Service Setup
```bash
cd cip-ml

# Install dependencies
pip install -r requirements.txt

# Run
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. Frontend Setup
```bash
cd cip-web

# Install dependencies
npm install

# Run development server
npm run dev

# Or build for production
npm run build
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:8080/actuator/health
```

### Register User
```bash
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Test@123"}'
```

### Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Test@123"}'
```

## 📊 Key Features

### 1. Resume Analysis
- Upload PDF/DOCX resumes
- AI-powered skill extraction
- ATS score calculation
- Improvement suggestions

### 2. Mock Interviews
- Technical & behavioral interviews
- Real-time answer evaluation
- Personalized feedback
- Performance tracking

### 3. Job Recommendations
- AI-matched job listings
- Skill gap analysis
- Readiness score calculation
- Application tracking

### 4. Certificate Validation
- OCR-based certificate verification
- Authenticity scoring
- Issuer validation
- Tamper detection

## 🔧 Configuration

### Backend (application.yml)
```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/cip_db
    username: postgres
    password: cip123

jwt:
  secret: your-secret-key
  expiry: 86400000  # 24 hours

ml:
  service:
    url: http://localhost:8000

storage:
  local:
    path: ./uploads
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080
VITE_ML_URL=http://localhost:8000
```

## 📁 Project Structure
```
cip-backend-lite/
├── src/main/java/com/cip/
│   ├── auth/          # Authentication & authorization
│   ├── resume/        # Resume upload & parsing
│   ├── interview/     # Mock interview system
│   ├── job/           # Job recommendations
│   ├── score/         # Readiness score engine
│   ├── certificate/   # Certificate validation
│   ├── analytics/     # User analytics
│   └── common/        # Shared utilities
├── src/main/resources/
│   └── application.yml
└── pom.xml

cip-ml/
├── main.py            # FastAPI application
├── models/            # ML models
├── services/          # Business logic
└── requirements.txt

cip-web/
├── src/
│   ├── components/    # React components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   └── utils/         # Utilities
└── package.json
```

## 🐛 Troubleshooting

### Backend won't start
- Check if port 8080 is available
- Verify database connection
- Check Java version (must be 17+)

### ML service errors
- Ensure Python 3.9+ is installed
- Install all requirements: `pip install -r requirements.txt`
- Check if port 8000 is available

### Database connection failed
- Verify PostgreSQL is running
- Check credentials in application.yml
- Ensure database `cip_db` exists

### Frontend build errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version (16+)
- Verify API URL in .env file

## 📝 API Documentation
See [API-DOCS.md](./API-DOCS.md) for complete API reference.

## 🔐 Security Notes
- Change default JWT secret in production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Implement rate limiting
- Regular security audits

## 📞 Support
For issues or questions:
- GitHub Issues: [Create an issue](https://github.com/abhaysahu-cse/career-intelligence-platform-light/issues)
- Email: support@cip.com

## 📄 License
MIT License - See LICENSE file for details

---

**Version**: 2.0.0-lite  
**Last Updated**: May 5, 2026  
**Status**: Production Ready
