# 📚 API Documentation

## Base URLs
- **Backend**: http://localhost:8080
- **ML Service**: http://localhost:8000

## Authentication

All protected endpoints require JWT token in Authorization header:
\\\
Authorization: Bearer <token>
\\\

---

## Auth Endpoints

### 1. Register User
**POST** \/auth/signup\

**Request Body:**
\\\json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Test@123",
  "role": "STUDENT"
}
\\\

**Response (201):**
\\\json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
\\\

### 2. Login
**POST** \/auth/login\

**Request Body:**
\\\json
{
  "email": "john@example.com",
  "password": "Test@123"
}
\\\

**Response (200):**
\\\json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
\\\

### 3. Get Profile
**GET** \/auth/me\

**Headers:**
\\\
Authorization: Bearer <token>
X-User-Email: john@example.com
\\\

**Response (200):**
\\\json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "active": true
  }
}
\\\

---

## Interview V3 Endpoints

### 1. Get Interview Configuration
**GET** \/interview/v3/config\

**Response (200):**
\\\json
{
  "success": true,
  "data": {
    "companies": ["Google", "Amazon", "Microsoft", ...],
    "roles": ["Frontend Developer", "Backend Developer", ...],
    "branches": ["CSE", "ECE", "Mechanical", ...],
    "roundTypes": ["TECHNICAL", "HR", "BEHAVIORAL"],
    "difficulties": ["EASY", "MEDIUM", "HARD"],
    "durations": [15, 30, 45, 60]
  }
}
\\\

### 2. Get Pre-Interview Tips
**GET** \/interview/v3/tips?roundType=TECHNICAL&difficulty=MEDIUM&duration=30\

**Response (200):**
\\\json
{
  "success": true,
  "data": {
    "welcomeMessage": "Welcome to your technical interview...",
    "tips": [
      {
        "order": 1,
        "icon": "🎯",
        "title": "Structure Your Answers",
        "description": "Use the STAR method...",
        "voiceText": "First instruction: Structure your answers..."
      }
    ],
    "estimatedDuration": 2
  }
}
\\\

### 3. Start Interview
**POST** \/interview/v3/start\

**Request Body:**
\\\json
{
  "interviewMode": "COMPANY_SPECIFIC",
  "company": "Google",
  "roundType": "TECHNICAL",
  "duration": 30,
  "difficulty": "MEDIUM"
}
\\\

**Response (200):**
\\\json
{
  "success": true,
  "data": {
    "interviewId": 123,
    "questions": [
      {
        "index": 0,
        "text": "Explain the difference between var, let, and const",
        "category": "JavaScript",
        "difficulty": "MEDIUM"
      }
    ],
    "totalQuestions": 10,
    "duration": 30
  }
}
\\\

### 4. Submit Answer
**POST** \/interview/v3/answer\

**Request Body:**
\\\json
{
  "interviewId": 123,
  "questionIndex": 0,
  "answer": "var is function-scoped, let and const are block-scoped...",
  "timeTaken": 120
}
\\\

**Response (200):**
\\\json
{
  "success": true,
  "data": {
    "feedback": "Good explanation! You covered the key differences...",
    "score": 85,
    "strengths": ["Clear explanation", "Good examples"],
    "improvements": ["Could mention hoisting"],
    "nextQuestion": {
      "index": 1,
      "text": "What is closure in JavaScript?"
    }
  }
}
\\\

---

## Job Endpoints

### 1. Get Recommended Jobs
**GET** \/jobs/recommended\

**Response (200):**
\\\json
{
  "success": true,
  "data": [
    {
      "job": {
        "id": 1,
        "company": "Google",
        "role": "Software Engineer",
        "location": "Bengaluru",
        "employmentType": "FULL_TIME",
        "salaryRange": "₹15-25 LPA",
        "requiredSkills": ["Java", "Spring Boot", "React"],
        "sourceUrl": "https://careers.google.com/..."
      },
      "matchPercentage": 85
    }
  ]
}
\\\

### 2. Filter Jobs
**GET** \/jobs/filter?type=INTERNSHIP&location=Bengaluru&experience=FRESHER\

**Query Parameters:**
- type: INTERNSHIP | FULL_TIME | PART_TIME
- location: City name
- experience: FRESHER | 1_2_YEARS | 3_5_YEARS | 5_PLUS_YEARS

---

## Certificate Endpoints

### 1. Upload Certificate
**POST** \/certificates/upload\

**Content-Type:** \multipart/form-data\

**Form Data:**
- file: Certificate file (PDF/Image)

**Response (200):**
\\\json
{
  "success": true,
  "data": {
    "certificateId": 456,
    "fileName": "certificate.pdf",
    "uploadDate": "2026-05-07T10:30:00"
  }
}
\\\

### 2. Get Certificates
**GET** \/certificates\

**Response (200):**
\\\json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "fileName": "certificate.pdf",
      "uploadDate": "2026-05-07T10:30:00",
      "result": {
        "authenticityScore": 89,
        "isGenuine": true,
        "issuerName": "IEEE",
        "validationMethod": "OCR_AND_ISSUER_MATCH"
      }
    }
  ]
}
\\\

---

## Analytics Endpoints

### 1. Get User Analytics
**GET** \/analytics\

**Response (200):**
\\\json
{
  "success": true,
  "data": {
    "readiness": 68,
    "risk": "LOW",
    "resumeScore": 65,
    "interviewScore": 58,
    "totalAttempts": 2,
    "weakSkills": ["system design", "edge cases"],
    "progressHistory": [
      {"date": "Mon", "score": 40},
      {"date": "Tue", "score": 55}
    ]
  }
}
\\\

---

## Error Responses

### 400 Bad Request
\\\json
{
  "success": false,
  "message": "Email already registered",
  "error": "BAD_REQUEST"
}
\\\

### 401 Unauthorized
\\\json
{
  "success": false,
  "message": "Invalid email or password",
  "error": "UNAUTHORIZED"
}
\\\

### 404 Not Found
\\\json
{
  "success": false,
  "message": "Resource not found",
  "error": "NOT_FOUND"
}
\\\

### 500 Internal Server Error
\\\json
{
  "success": false,
  "message": "Internal server error",
  "error": "INTERNAL_SERVER_ERROR"
}
\\\

---

**Last Updated**: May 7, 2026
