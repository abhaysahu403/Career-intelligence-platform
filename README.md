# 🚀 Career Intelligence Platform (CIP)

> AI-Powered Interview Preparation & Job Matching System

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-teal)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎯 Overview

Career Intelligence Platform (CIP) is an enterprise-grade AI-powered system for interview preparation, certificate validation, and intelligent job matching. Built with microservices architecture and designed for cloud deployment on Kubernetes/EKS.

### 🌟 Key Features

- **AI Interview Coach** - Real-time voice interviews with Google Gemini AI
- **Smart Resume Analysis** - Automated parsing and skill extraction
- **Certificate Validation** - OCR-based verification with 390+ institution registry
- **Intelligent Job Matching** - AI-powered recommendations based on skills and performance
- **Career Analytics** - Comprehensive readiness scoring and gap analysis

---

## 🏗️ Architecture

### Microservices-Based Design

```
┌─────────────────────────────────────────────────┐
│           Frontend (Next.js 14)                 │
│              cip-web/                           │
└─────────────────┬───────────────────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────────────────┐
│           API Gateway (Port 8080)               │
│          Spring Cloud Gateway                   │
└─────────┬───────────────────────────────────────┘
          │
    ┌─────┴──────┬─────────┬─────────┬──────────┐
    │            │         │         │          │
┌───▼──┐  ┌─────▼───┐ ┌───▼────┐ ┌──▼─────┐ ┌──▼──────┐
│ Auth │  │Interview│ │  Job   │ │ Resume │ │ +6 more │
│Service│ │ Service │ │Service │ │Service │ │ services│
└───────┘  └─────────┘ └────────┘ └────────┘ └─────────┘
                         │
                    ┌────▼────┐
                    │   ML    │
                    │ Service │
                    │(FastAPI)│
                    └─────────┘
```

### Services

**Backend Microservices (Java Spring Boot):**
- `api-gateway` - Main entry point & routing
- `auth-service` - Authentication & JWT management
- `interview-service` - Interview session management
- `job-service` - Job listings & search
- `certificate-service` - Certificate validation
- `resume-service` - Resume parsing & storage
- `recommendation-service` - Job recommendations
- `score-service` - Career readiness scoring
- `student-service` - User profile management
- `analytics-service` - Performance analytics

**ML Service (Python FastAPI):**
- `cip-ml` - Google Gemini AI integration, OCR, resume analysis

**Frontend (TypeScript Next.js):**
- `cip-web` - Responsive web application

---

## 📁 Project Structure

```
career-intelligence-platform/
├── cip-backend-lite/              # Main application directory
│   ├── cip-backend/               # Java microservices
│   │   ├── api-gateway/
│   │   ├── auth-service/
│   │   ├── interview-service/
│   │   ├── job-service/
│   │   ├── certificate-service/
│   │   ├── resume-service/
│   │   ├── recommendation-service/
│   │   ├── score-service/
│   │   ├── student-service/
│   │   ├── analytics-service/
│   │   ├── common-lib/           # Shared utilities
│   │   ├── pom.xml               # Parent POM
│   │   └── docker-compose.yml
│   │
│   ├── cip-ml/                   # Python ML Service
│   │   ├── services/
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── cip-web/                  # Next.js Frontend
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── database/                 # Database scripts
│   │   ├── create_dbs.sql
│   │   ├── seed_real_jobs.sql
│   │   └── demo_queries.sql
│   │
│   ├── docs/                     # Documentation
│   ├── storage/                  # File storage
│   └── uploads/                  # User uploads
│
├── ARCHITECTURE.md               # Detailed architecture
└── README.md                     # This file
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, TailwindCSS, Zustand |
| **Backend** | Spring Boot 3.2, Java 17, Spring Cloud Gateway |
| **ML Service** | FastAPI, Python 3.10+, Google Gemini AI |
| **OCR** | PaddleOCR, Tesseract |
| **Database** | PostgreSQL 14+ |
| **Message Queue** | Kafka (optional) |
| **Cache** | Redis (optional) |
| **Container** | Docker, Docker Compose |
| **Orchestration** | Kubernetes, AWS EKS |
| **CI/CD** | GitHub Actions |

---

## 🚀 Quick Start

### Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Docker & Docker Compose (optional)

### Local Development

#### 1. Clone Repository
```bash
git clone <repository-url>
cd career-intelligence-platform/cip-backend-lite
```

#### 2. Database Setup
```bash
# Create database
psql -U postgres
CREATE DATABASE career_intelligence;
\q

# Run migrations
psql -U postgres -d career_intelligence -f database/create_dbs.sql
psql -U postgres -d career_intelligence -f database/seed_real_jobs.sql
```

#### 3. Start Backend Services
```bash
cd cip-backend
mvn clean install
# Start each service individually or use Docker Compose
docker-compose up -d
```

#### 4. Start ML Service
```bash
cd cip-ml
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

#### 5. Start Frontend
```bash
cd cip-web
npm install
npm run dev
```

#### Access URLs:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- ML Service: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🐳 Docker Deployment

### Build All Images
```bash
cd cip-backend-lite

# Build backend services
cd cip-backend && mvn clean package
for service in auth-service interview-service job-service; do
    docker build -t cip-$service:latest $service/
done

# Build ML service
cd ../cip-ml
docker build -t cip-ml:latest .

# Build frontend
cd ../cip-web
docker build -t cip-web:latest .
```

### Run with Docker Compose
```bash
docker-compose up -d
```

---

## ☸️ Kubernetes Deployment

### Prerequisites
- AWS EKS cluster running
- kubectl configured
- ECR repositories created

### Deploy to EKS
```bash
# Tag and push images to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag cip-auth-service:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/cip-auth-service:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/cip-auth-service:latest

# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmaps/
kubectl apply -f k8s/secrets/
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress.yaml
```

---

## 📚 Documentation

- [Architecture Details](ARCHITECTURE.md)
- [API Documentation](cip-backend-lite/docs/API.md)
- [ML Service Guide](cip-backend-lite/docs/ML_SERVICE.md)
- [Certificate Validator](cip-backend-lite/docs/CERTIFICATE_VALIDATOR.md)
- [Interview System](cip-backend-lite/docs/INTERVIEW_SYSTEM.md)

---

## 🧪 Testing

```bash
# Backend tests
cd cip-backend
mvn test

# ML service tests
cd cip-ml
pytest

# Frontend tests
cd cip-web
npm test
```

---

## 📈 Monitoring

- **Health Checks**: `/actuator/health` on each service
- **Metrics**: Prometheus metrics exposed on `/actuator/prometheus`
- **Logs**: Centralized logging with ELK stack (optional)

---

## 🔒 Security

- JWT-based authentication
- API Gateway rate limiting
- Input validation on all endpoints
- SQL injection protection
- XSS prevention
- CORS configuration
- Secrets managed via Kubernetes Secrets / AWS Secrets Manager

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👥 Team

Developed by the CIP Team

---

## 📞 Support

For issues and questions, please create an issue in the GitHub repository.

---

**Made with ❤️ for career development**
