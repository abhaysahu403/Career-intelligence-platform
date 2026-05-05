# CIP v2.0-lite API Documentation

## Base URL
```
http://localhost:8080
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Additionally, include the user ID in the header:
```
X-User-Id: <user-id>
```

---

## 🔐 Authentication APIs

### 1. Register User
**POST** `/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Test@123",
  "role": "STUDENT"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "expiresIn": 86400
  }
}
```

### 2. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Test@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "expiresIn": 86400
  }
}
```

### 3. Get Profile
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <token>
X-User-Email: john@example.com
```

**Response:**
```json
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
```

### 4. Logout
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 📄 Resume APIs

### 1. Upload Resume
**POST** `/resume/upload`

**Headers:**
```
Authorization: Bearer <token>
X-User-Id: 1
Content-Type: multipart/form-data
```

**Form Data:**
```
file: <resume.pdf>
```

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded. Parsing in progress.",
  "data": {
    "id": "resume-123",
    "userId": 1,
    "fileName": "resume.pdf",
    "fileUrl": "/uploads/1/resume-123.pdf",
    "parseStatus": "PENDING",
    "uploadedAt": "2026-05-05T10:00:00Z"
  }
}
```

### 2. Get All Resumes
**GET** `/resume`

**Headers:**
```
Authorization: Bearer <token>
X-User-Id: 1
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "resume-123",
      "fileName": "resume.pdf",
      "parseStatus": "COMPLETED",
      "resumeScore": 85.5,
      "uploadedAt": "2026-05-05T10:00:00Z"
    }
  ]
}
```

### 3. Get Latest Resume
**GET** `/resume/latest`

**Headers:**
```
Authorization: Bearer <token>
X-User-Id: 1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "resume-123",
    "fileName": "resume.pdf",
    "parseStatus": "COMPLETED",
    "resumeScore": 85.5,
    "parsedData": {
      "skills": ["Java", "Python", "React"],
      "experience": "3 years",
      "education": "B.Tech Computer Science"
    }
  }
}
```

---

## 🎤 Interview APIs

### 1. Start Interview
**POST** `/interview/start`

**Headers:**
```
Authorization: Bearer <token>
X-User-Id: 1
```

**Request Body:**
```json
{
  "type": "TECHNICAL",
  "jobRole": "Software Engineer",
  "numberOfQuestions": 5,
  "questions": [
    {
      "index": 0,
      "question": "What is polymorphism?",
      "topic": "OOP",
      "difficulty": "MEDIUM"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interview started",
  "data": {
    "id": 1,
    "userId": 1,
    "type": "TECHNICAL",
    "status": "IN_PROGRESS",
    "totalQuestions": 5,
    "answeredQuestions": 0,
    "startedAt": "2026-05-05T10:00:00Z"
  }
}
```

### 2. Submit Answer
**POST** `/interview/answer`

**Headers:**
```
Authorization: Bearer <token>
X-User-Id: 1
```

**Request Body:**
```json
{
  "interviewId": 1,
  "questionIndex": 0,
  "question": "What is polymorphism?",
  "answer": "Polymorphism allows objects to take many forms...",
  "score": 85.0,
  "topic": "OOP",
  "difficulty": "MEDIUM",
  "feedback": "Good explanation",
  "timeTakenSeconds": 120
}
```

**Response:**
```json
{
  "success": true,
  "message": "Answer recorded",
  "data": {
    "id": 1,
    "answeredQuestions": 1,
    "totalQuestions": 5
  }
}
```

### 3. End Interview
**POST** `/interview/end?interviewId=1`

**Headers:**
```
Authorization: Bearer <token>
X-User-Id: 1
```

**Response:**
```json
{
  "success": true,
  "message": "Interview completed",
  "data": {
    "id": 1,
    "status": "COMPLETED",
    "totalScore": 82.5,
    "feedback": {
      "overallScore": 82.5,
      "completedQuestions": 5,
      "weakTopics": ["DSA"],
      "latestFeedback": "Good performance overall"
    }
  }
}
```

### 4. Get Interview Result
**GET** `/interview/result/{id}`

**Headers:**
```
Authorization: Bearer <token>
X-User-Id: 1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "totalScore": 82.5,
    "status": "COMPLETED",
    "answers": [...],
    "feedback": {...}
  }
}
```

### 5. Get Interview History
**GET** `/interview/history`

**Headers:**
```
Authorization: Bearer <token>
X-User-Id: 1
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "TECHNICAL",
      "totalScore": 82.5,
      "startedAt": "2026-05-05T10:00:00Z",
      "completedAt": "2026-05-05T10:30:00Z"
    }
  ]
}
```

---

## 💼 Job APIs

### 1. Get All Jobs
**GET** `/jobs?page=0&size=20`

**Headers:**
```
Authorization: Bearer <token>
X-User-Id: 1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "company": "Google",
        "role": "Software Engineer",
        "description": "...",
        "minimumReadinessScore": 70.0,
        "requiredSkills": ["Java", "Python"],
        "active": true
      }
    ],
    "totalElements": 50,
    "totalPages": 3
  }
}
```

### 2. Get Job by ID
**GET** `/jobs/{id}`

**Headers:**
```
Authorization: Bearer <token>
X-User-Id: 1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "company": "Google",
    "role": "Software Engineer",
    "description": "...",
    "minimumReadinessScore": 70.0,
    "requiredSkills": ["Java", "Python"]
  }
}
```

### 3. Get Recommended Jobs
**GET** `/jobs/recommended`

**Headers:**
```
Authorization: Bearer <token>
X-User-Id: 1
```

**Optional Query Parameters:**
- `readiness` - User's readiness score (auto-fetched if not provided)
- `skills` - Comma-separated skills (auto-fetched if not provided)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "job": {
        "id": 1,
        "company": "Google",
        "role": "Software Engineer"
      },
      "matchPercentage": 85,
      "readinessMatch": true,
      "matchedSkills": ["Java", "Python"],
      "missingSkills": ["Kubernetes"]
    }
  ]
}
```

---

## 📊 Score APIs

### 1. Get User Score
**GET** `/score`

**Headers:**
```
Authorization: Bearer <token>
X-User-Id: 1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "readiness": 75.5,
    "level": "Job Ready",
    "resumeScore": 85.0,
    "interviewScore": 70.0,
    "academicScore": 0.0,
    "recommendation": "Focus on DSA and system design",
    "calculatedAt": "2026-05-05T10:00:00Z"
  }
}
```

### 2. Update Score (Admin Only)
**POST** `/score/update`

**Headers:**
```
Authorization: Bearer <token>
X-User-Role: ADMIN
```

**Request Body:**
```json
{
  "userId": 1,
  "resumeScore": 85.0,
  "interviewScore": 70.0,
  "academicScore": 80.0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Score updated",
  "data": {
    "userId": 1,
    "readiness": 75.5,
    "level": "Job Ready"
  }
}
```

---

## 🛡️ Certificate APIs

### 1. Upload Certificate
**POST** `/certificate/upload`

**Headers:**
```
Authorization: Bearer <token>
X-User-Id: 1
Content-Type: multipart/form-data
```

**Form Data:**
```
file: <certificate.pdf>
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate uploaded successfully. Processing started.",
  "data": {
    "certificateId": 1,
    "status": "PENDING",
    "fileName": "certificate.pdf",
    "createdAt": "2026-05-05T10:00:00Z"
  }
}
```

### 2. Get Certificate Result
**GET** `/certificate/{id}`

**Headers:**
```
Authorization: Bearer <token>
X-User-Id: 1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "certificateId": 1,
    "authenticityScore": 95,
    "status": "AUTHENTIC",
    "confidenceLevel": "HIGH",
    "extractedData": {
      "name": "John Doe",
      "course": "AWS Certified",
      "issueDate": "2026-01-01"
    },
    "warnings": []
  }
}
```

### 3. Get User Certificates
**GET** `/certificate/user?page=0&size=10`

**Headers:**
```
Authorization: Bearer <token>
X-User-Id: 1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "certificates": [
      {
        "id": 1,
        "fileName": "certificate.pdf",
        "status": "COMPLETED",
        "authenticityScore": 95,
        "createdAt": "2026-05-05T10:00:00Z"
      }
    ],
    "total": 5,
    "page": 0,
    "size": 10
  }
}
```

---

## 📈 Analytics APIs

### 1. Get User Analytics
**GET** `/analytics`

**Headers:**
```
Authorization: Bearer <token>
X-User-Id: 1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "totalInterviews": 10,
    "averageScore": 82.5,
    "strongSkills": ["Java", "Python"],
    "weakSkills": ["DSA", "System Design"],
    "improvementRate": 15.5,
    "lastActivity": "2026-05-05T10:00:00Z"
  }
}
```

---

## 🏥 Health Check

### Health Status
**GET** `/actuator/health`

**Response:**
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL"
      }
    },
    "diskSpace": {
      "status": "UP"
    }
  }
}
```

---

## ❌ Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `413` - Payload Too Large
- `500` - Internal Server Error

---

## 📝 Notes

1. **File Upload Limits**: Maximum 10MB per file
2. **Rate Limiting**: Not implemented in v2.0-lite
3. **Pagination**: Default page size is 20, max is 100
4. **Date Format**: ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
5. **Async Processing**: Resume and certificate processing happens asynchronously

---

**Version**: 2.0.0-lite  
**Last Updated**: May 5, 2026
