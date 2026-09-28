# 🎤 AI Interview System - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [How It Works](#how-it-works)
4. [Interview Modes](#interview-modes)
5. [Technology Stack](#technology-stack)
6. [Interview Flow](#interview-flow)
7. [AI Evaluation](#ai-evaluation)
8. [Real-time Analytics](#real-time-analytics)
9. [API Endpoints](#api-endpoints)
10. [Code Structure](#code-structure)
11. [Examples](#examples)

---

## Overview

The AI Interview System is an intelligent interview preparation platform that conducts realistic technical, HR, and behavioral interviews using Google Gemini AI. It provides real-time feedback, voice recognition, and comprehensive performance analytics.

### Key Features
- ✅ **AI-Powered Questions**: Dynamic question generation using Gemini AI
- ✅ **Voice Recognition**: Real-time speech-to-text for answers
- ✅ **Pre-Interview Tips**: 5 voice-guided instructions before each interview
- ✅ **Multiple Interview Modes**: Company, Role, Branch, Resume-based
- ✅ **Real-time Analytics**: Confidence, eye contact, voice clarity tracking
- ✅ **Instant Feedback**: AI evaluates answers and provides suggestions
- ✅ **250+ Questions**: Curated from top companies (Google, Amazon, Microsoft, etc.)
- ✅ **Comprehensive Reports**: Detailed performance analysis after interview

### Use Cases
1. **Job Preparation**: Practice for real job interviews
2. **Skill Assessment**: Evaluate technical and soft skills
3. **Interview Training**: Learn how to answer different question types
4. **Confidence Building**: Get comfortable with interview scenarios

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER STARTS INTERVIEW                         │
│  • Selects mode (Company/Role/Branch/Resume)                    │
│  • Chooses difficulty (Easy/Medium/Hard)                         │
│  • Sets duration (15/30/45 minutes)                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Spring Boot)                         │
│  • Creates interview session                                     │
│  • Fetches pre-interview tips                                    │
│  • Loads question bank                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND - PRE-INTERVIEW TIPS                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Instruction 1: Structure your answers (STAR method)      │ │
│  │  Instruction 2: Take brief pauses to think                │ │
│  │  Instruction 3: Maintain eye contact with camera          │ │
│  │  Instruction 4: Speak clearly and confidently             │ │
│  │  Instruction 5: Ask for clarification if needed           │ │
│  └───────────────────────────────────────────────────────────┘ │
│  • Voice synthesis reads each instruction                        │
│  • Auto-advances after each instruction                          │
│  • User can skip to start interview immediately                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              INTERVIEW STARTS - QUESTION 1                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  AI: "Tell me about a challenging project you worked on" │ │
│  └───────────────────────────────────────────────────────────┘ │
│  • Voice synthesis reads question                                │
│  • Camera activates (optional)                                   │
│  • Microphone activates for answer                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              USER ANSWERS (Voice/Text)                           │
│  • Speech recognition converts voice to text                     │
│  • Real-time transcript displayed                                │
│  • Silence detection (2.5s) auto-submits answer                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND SENDS TO ML SERVICE                         │
│  POST /ml/interview/evaluate                                     │
│  {                                                               │
│    "question": "Tell me about a challenging project...",         │
│    "answer": "I worked on a microservices project...",           │
│    "context": "Technical Interview - Backend Role"               │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              ML SERVICE (Gemini AI Evaluation)                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Gemini AI analyzes:                                      │ │
│  │  • Relevance to question                                  │ │
│  │  • Technical accuracy                                     │ │
│  │  • Communication clarity                                  │ │
│  │  • Depth of knowledge                                     │ │
│  │  • Structure (STAR method)                                │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Returns:                                                         │
│  {                                                               │
│    "score": 85,                                                  │
│    "feedback": "Good answer! You explained the problem well...", │
│    "strengths": ["Clear communication", "Technical depth"],      │
│    "improvements": ["Add more metrics", "Explain impact"]        │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND SHOWS FEEDBACK                             │
│  • Score: 85/100                                                 │
│  • AI Feedback displayed                                         │
│  • Strengths highlighted                                         │
│  • Improvements suggested                                        │
│  • Next question loads automatically                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              REAL-TIME ANALYTICS (During Interview)              │
│  • Confidence Level: 75%                                         │
│  • Eye Contact: Good                                             │
│  • Voice Clarity: 85%                                            │
│  • Emotion: Confident                                            │
│  • Posture: Stable                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              INTERVIEW ENDS                                      │
│  • All questions answered OR time limit reached                  │
│  • Final score calculated                                        │
│  • Comprehensive report generated                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              INTERVIEW REPORT                                    │
│  • Overall Score: 78/100                                         │
│  • Question-wise breakdown                                       │
│  • Strengths & Weaknesses                                        │
│  • Improvement suggestions                                       │
│  • Comparison with average                                       │
│  • Recommended next steps                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## How It Works

### 1. Interview Configuration

User selects:
```javascript
{
  "interviewMode": "COMPANY_SPECIFIC",  // or ROLE_BASED, BRANCH_BASED, RESUME_BASED
  "company": "Google",                   // if COMPANY_SPECIFIC
  "role": "Backend Developer",           // if ROLE_BASED
  "branch": "CSE",                       // if BRANCH_BASED
  "roundType": "TECHNICAL",              // TECHNICAL, HR, BEHAVIORAL
  "difficulty": "MEDIUM",                // EASY, MEDIUM, HARD
  "duration": 30                         // minutes
}
```

### 2. Pre-Interview Tips System

**5 Essential Instructions:**

1. **Structure Your Answers (STAR Method)**
   - Situation: Describe the context
   - Task: Explain your responsibility
   - Action: Detail what you did
   - Result: Share the outcome

2. **Take Brief Pauses**
   - Think before answering
   - It's okay to take 2-3 seconds
   - Shows thoughtfulness

3. **Maintain Eye Contact**
   - Look at the camera
   - Shows confidence
   - Builds connection

4. **Speak Clearly**
   - Moderate pace
   - Clear pronunciation
   - Confident tone

5. **Ask for Clarification**
   - If question unclear, ask
   - Shows engagement
   - Better than wrong answer

**Voice Synthesis:**
```javascript
const utterance = new SpeechSynthesisUtterance(instructionText);
utterance.rate = 0.95;  // Slightly slower for clarity
utterance.pitch = 1.0;
utterance.volume = 1.0;
window.speechSynthesis.speak(utterance);
```

### 3. Question Generation

**Static Questions (250+):**
```sql
-- Company-specific questions
SELECT * FROM company_questions 
WHERE company = 'Google' 
AND round_type = 'TECHNICAL' 
AND difficulty = 'MEDIUM'
ORDER BY RANDOM() 
LIMIT 10;

-- Role-based questions
SELECT * FROM role_questions 
WHERE role = 'Backend Developer' 
AND difficulty = 'MEDIUM'
ORDER BY RANDOM() 
LIMIT 10;

-- Branch-based questions
SELECT * FROM branch_questions 
WHERE branch = 'CSE' 
AND difficulty = 'MEDIUM'
ORDER BY RANDOM() 
LIMIT 10;
```

**Dynamic Questions (AI-Generated):**
```python
# If RESUME_BASED mode
prompt = f"""
Generate 10 technical interview questions for a candidate with this resume:
{resume_text}

Focus on:
- Projects mentioned
- Skills listed
- Experience level
- Technologies used

Questions should be:
- Specific to their experience
- Progressive difficulty
- Mix of technical and behavioral
"""

questions = gemini_ai.generate(prompt)
```

### 4. Speech Recognition

**Web Speech API:**
```javascript
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

recognition.onresult = (event) => {
  let finalTranscript = '';
  let interimTranscript = '';
  
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      finalTranscript += transcript + ' ';
    } else {
      interimTranscript += transcript;
    }
  }
  
  setTranscript(prev => prev + finalTranscript);
  setInterimTranscript(interimTranscript);
};

// Auto-submit after 2.5 seconds of silence
let silenceTimer;
recognition.onresult = () => {
  clearTimeout(silenceTimer);
  silenceTimer = setTimeout(() => {
    submitAnswer();
  }, 2500);
};
```

### 5. AI Evaluation (Gemini AI)

**Evaluation Prompt:**
```python
def evaluate_answer(question, answer, context):
    prompt = f"""
    You are an expert technical interviewer. Evaluate this interview answer.
    
    Question: {question}
    Answer: {answer}
    Context: {context}
    
    Evaluate based on:
    1. Relevance (0-25 points): Does answer address the question?
    2. Technical Accuracy (0-25 points): Is the information correct?
    3. Depth (0-25 points): How detailed and thorough?
    4. Communication (0-25 points): Clarity and structure?
    
    Provide:
    - Total Score (0-100)
    - Detailed Feedback (2-3 sentences)
    - Strengths (2-3 points)
    - Areas for Improvement (2-3 points)
    
    Format as JSON:
    {{
      "score": 85,
      "feedback": "...",
      "strengths": ["...", "..."],
      "improvements": ["...", "..."]
    }}
    """
    
    response = gemini_model.generate_content(prompt)
    return json.loads(response.text)
```

**Scoring Criteria:**

| Aspect | Weight | Description |
|--------|--------|-------------|
| Relevance | 25% | Answer addresses the question |
| Technical Accuracy | 25% | Information is correct |
| Depth | 25% | Detailed and thorough explanation |
| Communication | 25% | Clear, structured, confident |

### 6. Real-time Analytics

**Tracked Metrics:**

1. **Confidence Level (0-100)**
   ```javascript
   // Based on:
   - Voice volume
   - Speech rate
   - Pause frequency
   - Filler words ("um", "uh")
   ```

2. **Eye Contact (Good/Average/Poor)**
   ```javascript
   // Using face detection:
   - Face position relative to camera
   - Gaze direction
   - Looking away frequency
   ```

3. **Voice Clarity (0-100)**
   ```javascript
   // Based on:
   - Speech recognition confidence
   - Audio quality
   - Pronunciation clarity
   ```

4. **Emotion Detection**
   ```javascript
   // Detected emotions:
   - Confident
   - Nervous
   - Neutral
   - Excited
   ```

5. **Posture (Stable/Unstable)**
   ```javascript
   // Based on:
   - Body movement
   - Head position
   - Fidgeting detection
   ```

---

## Interview Modes

### 1. Company-Specific Interview

**Supported Companies (14):**
- Google
- Amazon
- Microsoft
- Meta (Facebook)
- Apple
- Netflix
- Tesla
- Adobe
- Salesforce
- Oracle
- IBM
- Intel
- Nvidia
- Qualcomm

**Question Types:**
- Company culture questions
- Real questions asked in past interviews
- Company-specific technologies
- Leadership principles (Amazon)
- Design philosophy (Apple)

**Example:**
```
Company: Google
Question: "How would you design a URL shortener like bit.ly?"
Expected: System design, scalability, database choice, caching
```

### 2. Role-Based Interview

**Supported Roles (11):**
- Frontend Developer
- Backend Developer
- Full Stack Developer
- Mobile Developer
- DevOps Engineer
- Data Scientist
- Machine Learning Engineer
- Cloud Architect
- QA Engineer
- Product Manager
- UI/UX Designer

**Question Types:**
- Role-specific technical questions
- Tools and technologies
- Best practices
- Problem-solving scenarios

**Example:**
```
Role: Backend Developer
Question: "Explain the difference between SQL and NoSQL databases. When would you use each?"
Expected: Understanding of database types, use cases, trade-offs
```

### 3. Branch-Based Interview

**Supported Branches (7):**
- Computer Science (CSE)
- Information Technology (IT)
- Electronics & Communication (ECE)
- Electrical Engineering (EE)
- Mechanical Engineering (ME)
- Civil Engineering (CE)
- Chemical Engineering (CHE)

**Question Types:**
- Core subject questions
- Branch-specific concepts
- Practical applications
- Industry relevance

**Example:**
```
Branch: CSE
Question: "Explain the concept of virtual memory and page replacement algorithms."
Expected: OS concepts, algorithms (LRU, FIFO), practical understanding
```

### 4. Resume-Based Interview

**How it works:**
1. User uploads resume
2. AI extracts: Projects, Skills, Experience
3. Generates personalized questions
4. Focuses on resume content

**Question Types:**
- Project deep-dives
- Technology stack questions
- Problem-solving in projects
- Challenges faced

**Example:**
```
Resume: "Built a microservices-based e-commerce platform using Spring Boot"
Question: "In your e-commerce project, how did you handle inter-service communication?"
Expected: REST APIs, message queues, service discovery, error handling
```

---

## Technology Stack

### Frontend
```javascript
// Speech Recognition
- Web Speech API (webkitSpeechRecognition)
- Real-time transcription
- Silence detection

// Voice Synthesis
- Web Speech API (SpeechSynthesisUtterance)
- Text-to-speech for questions and tips

// Video
- MediaDevices API (getUserMedia)
- Camera access for face tracking

// State Management
- React useState, useEffect, useRef
- Zustand for global state
```

### Backend
```java
// Spring Boot Components
- @RestController: REST APIs
- @Service: Business logic
- @Repository: Database access
- @Entity: JPA entities

// Database
- PostgreSQL
- JPA/Hibernate
- Flyway migrations

// External APIs
- ML Service (FastAPI)
- Gemini AI (via ML Service)
```

### ML Service
```python
# AI Model
- Google Gemini AI (gemini-pro)
- Temperature: 0.7 (balanced creativity)
- Max tokens: 2048

# Libraries
- FastAPI: Web framework
- google-generativeai: Gemini SDK
- pydantic: Data validation
```

---

## Interview Flow

### Complete Flow Diagram

```
START
  ↓
[User Selects Configuration]
  ↓
[Backend Creates Session]
  ↓
[Frontend Loads Pre-Interview Tips]
  ↓
[Tip 1: Structure Answers] → Voice reads → Wait 3s
  ↓
[Tip 2: Take Pauses] → Voice reads → Wait 3s
  ↓
[Tip 3: Eye Contact] → Voice reads → Wait 3s
  ↓
[Tip 4: Speak Clearly] → Voice reads → Wait 3s
  ↓
[Tip 5: Ask Clarification] → Voice reads → Wait 3s
  ↓
[Tips Complete - Start Interview]
  ↓
[Enable Camera & Microphone]
  ↓
[Load Question 1]
  ↓
[Voice reads question]
  ↓
[User answers (voice/text)]
  ↓
[Speech recognition converts to text]
  ↓
[Silence detected (2.5s) → Auto-submit]
  ↓
[Send to ML Service for evaluation]
  ↓
[Gemini AI evaluates answer]
  ↓
[Receive score & feedback]
  ↓
[Display feedback to user]
  ↓
[Track analytics (confidence, eye contact, etc.)]
  ↓
[Load next question]
  ↓
[Repeat until all questions answered OR time up]
  ↓
[Calculate final score]
  ↓
[Generate comprehensive report]
  ↓
[Display report to user]
  ↓
END
```

---

## API Endpoints

### 1. Get Interview Configuration
```http
GET /interview/v3/config
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "companies": ["Google", "Amazon", "Microsoft", ...],
    "roles": ["Frontend Developer", "Backend Developer", ...],
    "branches": ["CSE", "IT", "ECE", ...],
    "roundTypes": ["TECHNICAL", "HR", "BEHAVIORAL"],
    "difficulties": ["EASY", "MEDIUM", "HARD"],
    "durations": [15, 30, 45]
  }
}
```

### 2. Get Pre-Interview Tips
```http
GET /interview/v3/tips?roundType=TECHNICAL&difficulty=MEDIUM&duration=30
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "welcomeMessage": "Welcome! Let's prepare you for success...",
    "tips": [
      {
        "order": 1,
        "icon": "📝",
        "title": "Structure Your Answers",
        "description": "Use the STAR method...",
        "voiceText": "First instruction: Structure your answers using the STAR method..."
      },
      ...
    ],
    "estimatedDuration": 60
  }
}
```

### 3. Start Interview
```http
POST /interview/v3/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "interviewMode": "COMPANY_SPECIFIC",
  "company": "Google",
  "roundType": "TECHNICAL",
  "difficulty": "MEDIUM",
  "duration": 30
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "interviewId": 123,
    "questions": [
      {
        "index": 0,
        "text": "Tell me about a challenging project...",
        "type": "BEHAVIORAL",
        "expectedDuration": 180
      },
      ...
    ],
    "totalQuestions": 10,
    "startTime": "2026-05-07T10:30:00"
  }
}
```

### 4. Submit Answer
```http
POST /interview/v3/answer
Authorization: Bearer <token>
Content-Type: application/json

{
  "interviewId": 123,
  "questionIndex": 0,
  "answer": "I worked on a microservices project...",
  "timeTaken": 120
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 85,
    "feedback": "Great answer! You clearly explained...",
    "strengths": [
      "Clear problem statement",
      "Good technical depth"
    ],
    "improvements": [
      "Add more metrics",
      "Explain the impact"
    ],
    "nextQuestion": {
      "index": 1,
      "text": "How do you handle errors in distributed systems?"
    }
  }
}
```

### 5. End Interview
```http
POST /interview/v3/end
Authorization: Bearer <token>
Content-Type: application/json

{
  "interviewId": 123
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overallScore": 78,
    "totalQuestions": 10,
    "answeredQuestions": 10,
    "averageScore": 78,
    "strengths": ["Communication", "Technical knowledge"],
    "weaknesses": ["System design", "Edge cases"],
    "recommendation": "Focus on system design patterns...",
    "reportUrl": "/interview/report/123"
  }
}
```

---

## Code Structure

### Backend

```
cip-backend-lite/src/main/java/com/cip/interview/
├── controller/
│   └── InterviewV3Controller.java       # REST endpoints
├── service/
│   └── InterviewV3Service.java          # Main service logic
├── entity/
│   ├── InterviewV3Session.java          # Interview session
│   ├── InterviewResponse.java           # User answers
│   ├── CompanyQuestion.java             # Company questions
│   ├── RoleQuestion.java                # Role questions
│   └── BranchQuestion.java              # Branch questions
├── repository/
│   ├── InterviewV3Repository.java
│   ├── InterviewResponseRepository.java
│   ├── CompanyQuestionRepository.java
│   ├── RoleQuestionRepository.java
│   └── BranchQuestionRepository.java
└── dto/
    └── InterviewDtos.java               # Data transfer objects
```

### Frontend

```
cip-web/app/(app)/interview/
├── setup/
│   └── page.tsx                         # Interview configuration
├── live/
│   └── page.tsx                         # Live interview page
├── report/
│   └── [id]/page.tsx                    # Interview report
└── page.tsx                             # Interview home

cip-web/components/
└── PreInterviewTips.tsx                 # Pre-interview tips component
```

---

## Examples

### Example 1: Technical Interview (Google)

**Configuration:**
```json
{
  "company": "Google",
  "roundType": "TECHNICAL",
  "difficulty": "HARD",
  "duration": 45
}
```

**Sample Questions:**
1. "Design a distributed cache system like Redis"
2. "Implement LRU cache with O(1) operations"
3. "How would you design Google Search?"
4. "Explain CAP theorem with examples"
5. "Design a rate limiter for an API"

**Evaluation Criteria:**
- System design thinking
- Scalability considerations
- Trade-off analysis
- Code quality
- Communication

### Example 2: Behavioral Interview (Amazon)

**Configuration:**
```json
{
  "company": "Amazon",
  "roundType": "BEHAVIORAL",
  "difficulty": "MEDIUM",
  "duration": 30
}
```

**Sample Questions (Leadership Principles):**
1. "Tell me about a time you disagreed with your manager"
2. "Describe a situation where you had to make a difficult decision"
3. "Give an example of when you took ownership of a problem"
4. "Tell me about a time you failed"
5. "Describe how you handled a tight deadline"

**Evaluation Criteria:**
- STAR method usage
- Leadership principles alignment
- Self-awareness
- Problem-solving approach
- Learning from experience

---

## Performance Metrics

- **Question Generation**: < 1 second
- **AI Evaluation**: 2-3 seconds per answer
- **Speech Recognition**: Real-time (< 100ms latency)
- **Voice Synthesis**: < 500ms to start
- **Overall Interview**: 15-45 minutes (user-configured)

---

## Future Enhancements

1. **Video Recording**: Record and playback interviews
2. **Peer Interviews**: Practice with other users
3. **Mock Interview Scheduling**: Schedule with mentors
4. **Advanced Analytics**: Detailed performance trends
5. **Multi-language Support**: Interviews in regional languages
6. **Industry-Specific**: Finance, Healthcare, etc.
7. **Coding Challenges**: Integrated code editor
8. **Whiteboard**: Virtual whiteboard for system design

---

**Last Updated**: May 7, 2026
**Version**: 2.0.0
