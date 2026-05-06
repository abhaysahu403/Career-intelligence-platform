# 🚀 Career Intelligence Platform - Production v1.0

> AI-Powered Career Intelligence & Interview Coaching Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-teal)](https://fastapi.tiangolo.com/)

## 📋 Overview

A comprehensive career intelligence platform that helps students and professionals prepare for technical interviews, validate certificates, analyze career readiness, and get personalized job recommendations.

### ✨ Key Features

- **🎤 AI Voice Interview Coach** - Real-time voice-based technical interviews with AI feedback
- **📄 Smart Resume Analysis** - PDF text extraction with ML-powered skill analysis
- **🎓 Certificate Validation** - OCR-based certificate authenticity verification
- **📊 Career Analytics** - Personalized readiness scoring and career insights
- **💼 Job Recommendations** - AI-matched job suggestions based on skills and experience
- **🎯 Skill Gap Analysis** - Identify weak areas and get improvement recommendations

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │    Backend      │      │   ML Service    │
│   (Next.js)     │◄────►│  (Spring Boot)  │◄────►│   (FastAPI)     │
│   Port: 3001    │      │   Port: 8080    │      │   Port: 8000    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                 │
                                 ▼
                         ┌─────────────────┐
                         │   PostgreSQL    │
                         │   Port: 5432    │
                         └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend (`cip-web`)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **PDF Processing**: PDF.js
- **Voice**: Web Speech API
- **HTTP Client**: Axios

### Backend (`cip-backend-lite`)
- **Framework**: Spring Boot 3.2
- **Language**: Java 17
- **Database**: PostgreSQL
- **ORM**: Hibernate/JPA
- **Security**: JWT Authentication
- **Build Tool**: Maven

### ML Service (`cip-ml`)
- **Framework**: FastAPI
- **Language**: Python 3.10+
- **AI Model**: Google Gemini AI
- **OCR**: Tesseract
- **PDF Processing**: PyPDF2
- **Image Processing**: OpenCV, Pillow

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Java 17+
- Python 3.10+
- PostgreSQL 14+
- Maven 3.8+

### 1. Clone Repository

```bash
git clone https://github.com/abhaysahu-cse/career-intelligence-platform-light.git
cd career-intelligence-platform-light
```

### 2. Database Setup

```sql
-- Create database
CREATE DATABASE career_intelligence;

-- Create user (optional)
CREATE USER cip_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE career_intelligence TO cip_user;
```

### 3. Backend Setup

```bash
cd cip-backend-lite

# Update application.yml with your database credentials
# src/main/resources/application.yml

# Build and run
mvn clean install
mvn spring-boot:run
```

Backend will start on `http://localhost:8080`

### 4. ML Service Setup

```bash
cd cip-ml

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GEMINI_API_KEY="your_gemini_api_key"  # Get from https://makersuite.google.com/app/apikey

# Run service
python main.py
```

ML Service will start on `http://localhost:8000`

### 5. Frontend Setup

```bash
cd cip-web

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
echo "NEXT_PUBLIC_ML_URL=http://localhost:8000" >> .env.local

# Run development server
npm run dev
```

Frontend will start on `http://localhost:3001`

## 🚀 Quick Start (All Services)

### Windows
```bash
start_all.bat
```

### Linux/Mac
```bash
# Terminal 1 - Backend
cd cip-backend-lite && mvn spring-boot:run

# Terminal 2 - ML Service
cd cip-ml && python main.py

# Terminal 3 - Frontend
cd cip-web && npm run dev
```

## 📖 API Documentation

### Backend Endpoints

#### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

#### Resume
- `POST /resume/upload-text` - Upload resume (text)
- `GET /resume/latest` - Get latest resume

#### Interview
- `POST /interview/start` - Start interview session
- `GET /interview/question/{id}` - Get next question
- `POST /interview/answer` - Submit answer
- `POST /interview/end` - End interview

#### Certificates
- `POST /certificates/upload` - Upload certificate
- `GET /certificates/user/{userId}` - Get user certificates
- `GET /certificates/{id}/result` - Get validation result

#### Jobs
- `GET /jobs` - List all jobs
- `GET /jobs/recommended` - Get personalized recommendations

### ML Service Endpoints

- `POST /ml/resume/analyze` - Analyze resume text
- `POST /ml/interview/question` - Generate interview question
- `POST /ml/interview/coach` - Evaluate interview answer
- `POST /ml/certificate/validate` - Validate certificate

## 🎯 Usage Guide

### 1. Create Account
1. Navigate to `http://localhost:3001`
2. Click "Sign Up"
3. Fill in details and create account

### 2. Complete Profile
1. Go to Profile page
2. Fill in personal information
3. Add technical skills
4. Upload resume PDF (or use profile data as fallback)

### 3. Start Interview
1. Navigate to Interview page
2. Select job role (e.g., "SDE")
3. Choose persona (Friendly/Strict/FAANG)
4. Click "Start Interview"
5. Answer questions using voice or text

### 4. Upload Certificates
1. Go to Certificates page
2. Upload certificate image/PDF
3. View authenticity score and validation results

### 5. View Analytics
1. Check Dashboard for overview
2. View Analytics page for detailed insights
3. Get personalized job recommendations

## 🔧 Configuration

### Environment Variables

#### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_ML_URL=http://localhost:8000
```

#### Backend (`application.yml`)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/career_intelligence
    username: your_username
    password: your_password

jwt:
  secret: your_jwt_secret_key_here
  expiration: 86400000

ml:
  service:
    url: http://localhost:8000
```

#### ML Service (`.env`)
```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/career_intelligence
```

## 📊 Database Schema

Key tables:
- `users` - User authentication
- `student_profiles` - Student information
- `resumes` - Resume data and analysis
- `interviews` - Interview sessions
- `interview_answers` - Interview responses
- `certificates` - Certificate uploads
- `certificate_results` - Validation results
- `jobs` - Job listings
- `scores` - Readiness scores

## 🎨 Features in Detail

### Resume Upload System
- **Primary**: Client-side PDF text extraction using PDF.js
- **Fallback**: Uses profile data if PDF extraction fails
- **ML Analysis**: Extracts skills, experience, education
- **Score Calculation**: Generates resume quality score

### AI Interview System
- **Voice Recognition**: Real-time speech-to-text
- **AI Questions**: Personalized based on resume
- **Real-time Feedback**: Instant evaluation and tips
- **Adaptive Difficulty**: Adjusts based on performance
- **Fallback Mode**: Works offline with local question bank

### Certificate Validation
- **OCR Processing**: Extracts text from images
- **Issuer Verification**: Checks against trusted issuers
- **Link Validation**: Verifies certificate URLs
- **QR Code Scanning**: Validates embedded QR codes
- **Authenticity Score**: 0-100 confidence rating

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify database credentials in `application.yml`
- Ensure port 8080 is available

### ML Service errors
- Verify Gemini API key is set
- Check Python dependencies are installed
- Ensure port 8000 is available

### Frontend build errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)
- Verify environment variables in `.env.local`

### PDF extraction not working
- Check browser console for errors
- Verify `/pdf.worker.mjs` is accessible
- Try the fallback (profile data) option

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

- **Abhay Sahu** - [@abhaysahu-cse](https://github.com/abhaysahu-cse)

## 🙏 Acknowledgments

- Google Gemini AI for interview question generation
- PDF.js for client-side PDF processing
- Spring Boot community
- Next.js team
- FastAPI framework

## 📞 Support

For support, email abhaysahucse@gmail.com or open an issue in the repository.

---

**⭐ Star this repository if you find it helpful!**
