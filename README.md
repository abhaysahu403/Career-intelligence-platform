# Career Intelligence Platform (CIP) v2.0-lite

> AI-powered career preparation platform for students - Lightweight monolith architecture

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-17+-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)

## 🎯 Overview

Career Intelligence Platform (CIP) helps students prepare for job interviews through:
- **AI-Powered Resume Analysis** - Get instant feedback and ATS scores
- **Mock Interviews** - Practice with AI-generated questions
- **Job Recommendations** - Find jobs matching your skills
- **Certificate Validation** - Verify certificate authenticity

## ✨ Key Features

### 📄 Resume Intelligence
- Upload PDF/DOCX resumes
- AI-powered skill extraction
- ATS compatibility scoring
- Personalized improvement suggestions

### 🎤 Mock Interviews
- Technical & behavioral interviews
- Real-time answer evaluation
- Detailed feedback and scoring
- Performance tracking over time

### 💼 Smart Job Matching
- AI-based job recommendations
- Skill gap analysis
- Readiness score calculation
- Match percentage for each job

### 🛡️ Certificate Verification
- OCR-based text extraction
- Authenticity scoring
- Issuer validation
- Tamper detection

### 📊 Analytics Dashboard
- Career readiness score
- Skill strength analysis
- Progress tracking
- Personalized recommendations

## 🏗️ Architecture

**v2.0-lite** uses a simplified monolith architecture:

```
┌─────────────────┐
│   React Web     │  Port 3000
│   (Frontend)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Spring Boot    │  Port 8080
│   (Backend)     │
│   - Auth        │
│   - Resume      │
│   - Interview   │
│   - Jobs        │
│   - Score       │
│   - Certificate │
└────────┬────────┘
         │
         ├──────────┐
         ▼          ▼
┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │  FastAPI ML  │
│  (Database)  │  │  (AI Engine) │
└──────────────┘  └──────────────┘
```

### Technology Stack

**Backend:**
- Spring Boot 3.2.0
- Java 17
- PostgreSQL 14
- JWT Authentication
- Async Processing (@Async)

**Frontend:**
- React 18
- Vite
- TailwindCSS
- Axios

**ML Service:**
- FastAPI
- Python 3.9+
- Transformers
- OpenCV
- Tesseract OCR

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 16+
- Python 3.9+
- PostgreSQL 14+

### 1. Clone Repository
```bash
git clone https://github.com/abhaysahu-cse/career-intelligence-platform-light.git
cd career-intelligence-platform-light
```

### 2. Setup Database
```bash
createdb cip_db
```

### 3. Start Backend
```bash
cd cip-backend-lite
mvn clean package -DskipTests
java -jar target/cip-backend-lite-2.0.0.jar
```

### 4. Start ML Service
```bash
cd cip-ml
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 5. Start Frontend
```bash
cd cip-web
npm install
npm run dev
```

### 6. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **ML Service**: http://localhost:8000
- **API Docs**: http://localhost:8080/actuator

## 📚 Documentation

- [Quick Start Guide](./START-GUIDE.md) - Detailed setup instructions
- [API Documentation](./API-DOCS.md) - Complete API reference
- [API Endpoints](./API_ENDPOINTS.md) - Endpoint summary

## 🧪 Testing

### Run Backend Tests
```bash
cd cip-backend-lite
mvn test
```

### Test APIs
```bash
# Health check
curl http://localhost:8080/actuator/health

# Register user
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Test@123"}'

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Test@123"}'
```

## 📁 Project Structure

```
career-intelligence-platform-light/
├── cip-backend-lite/       # Spring Boot backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/cip/
│   │       │   ├── auth/
│   │       │   ├── resume/
│   │       │   ├── interview/
│   │       │   ├── job/
│   │       │   ├── score/
│   │       │   ├── certificate/
│   │       │   └── common/
│   │       └── resources/
│   └── pom.xml
│
├── cip-ml/                 # FastAPI ML service
│   ├── main.py
│   ├── models/
│   ├── services/
│   └── requirements.txt
│
├── cip-web/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
├── README.md
├── START-GUIDE.md
└── API-DOCS.md
```

## 🔧 Configuration

### Backend Environment Variables
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cip_db
DB_USER=postgres
DB_PASSWORD=cip123
ML_SERVICE_URL=http://localhost:8000
JWT_SECRET=your-secret-key
STORAGE_PATH=./uploads
```

### Frontend Environment Variables
```bash
VITE_API_URL=http://localhost:8080
VITE_ML_URL=http://localhost:8000
```

## 🎯 Roadmap

### v2.1 (Planned)
- [ ] Real-time interview with video
- [ ] Advanced analytics dashboard
- [ ] Company-specific interview prep
- [ ] Mobile app (React Native)

### v2.2 (Future)
- [ ] Peer-to-peer mock interviews
- [ ] Interview scheduling
- [ ] Resume builder
- [ ] Job application tracking

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Abhay Sahu** - *Initial work* - [@abhaysahu-cse](https://github.com/abhaysahu-cse)

## 🙏 Acknowledgments

- OpenAI for GPT models
- Hugging Face for transformer models
- Spring Boot community
- React community

## 📞 Support

- **Email**: abhaysahu.cse@example.com
- **GitHub Issues**: [Create an issue](https://github.com/abhaysahu-cse/career-intelligence-platform-light/issues)
- **Documentation**: [Wiki](https://github.com/abhaysahu-cse/career-intelligence-platform-light/wiki)

## 📊 Project Status

**Current Version**: 2.0.0-lite  
**Status**: ✅ Production Ready  
**Last Updated**: May 5, 2026

---

<div align="center">
  <strong>Built with ❤️ for students preparing for their dream jobs</strong>
</div>
