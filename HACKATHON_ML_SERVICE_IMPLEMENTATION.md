# 🤖 ML Service Implementation Guide - Hackathon Day 1

## ✅ Backend Implementation Complete!

All three phases have been implemented in the Java backend:
- ✅ **Phase 1**: Semantic Similarity Scoring
- ✅ **Phase 2**: RAG-based Resume Parsing  
- ✅ **Phase 3**: RAG-based Question Generation

Now we need to implement the corresponding ML service endpoints.

---

## 📝 Required ML Service Endpoints

### Phase 1: Semantic Similarity

#### 1. Generate Embedding
**Endpoint**: `POST /ml/embeddings/generate`

**Request**:
```json
{
  "text": "Machine learning is a subset of AI"
}
```

**Response**:
```json
{
  "embedding": [0.123, -0.456, 0.789, ...],
  "dimension": 384,
  "model": "sentence-transformers/all-MiniLM-L6-v2"
}
```

#### 2. Calculate Similarity
**Endpoint**: `POST /ml/similarity/calculate`

**Request**:
```json
{
  "text1": "User's answer",
  "text2": "Ideal answer"
}
```

**Response**:
```json
{
  "similarity": 0.85,
  "score": 85.0,
  "method": "cosine",
  "model": "sentence-transformers/all-MiniLM-L6-v2"
}
```

---

### Phase 2: RAG Resume Parsing

#### 3. RAG-based Resume Parsing
**Endpoint**: `POST /ml/resume/rag-parse`

**Request**:
```json
{
  "text": "Full resume text content..."
}
```

**Response**:
```json
{
  "skills": ["Python", "Java", "Machine Learning"],
  "experience": [
    {
      "title": "Software Engineer",
      "company": "Tech Corp",
      "duration": "2 years",
      "description": "Developed ML models..."
    }
  ],
  "projects": [
    {
      "name": "AI Chatbot",
      "description": "Built using NLP...",
      "technologies": ["Python", "TensorFlow"]
    }
  ],
  "education": [
    {
      "degree": "B.Tech",
      "institution": "XYZ University",
      "year": "2022"
    }
  ],
  "score": 85.0,
  "embeddings": {
    "skills": [0.1, 0.2, ...],
    "experience": [0.3, 0.4, ...],
    "projects": [0.5, 0.6, ...]
  }
}
```

#### 4. Get Resume Context
**Endpoint**: `POST /ml/resume/context`

**Request**:
```json
{
  "resume_id": "resume-123",
  "query": "Java programming"
}
```

**Response**:
```json
{
  "context": "Candidate has 2 years of Java experience at Tech Corp, worked on microservices project using Spring Boot...",
  "relevance_score": 0.92
}
```

#### 5. Generate Resume Embeddings
**Endpoint**: `POST /ml/resume/embeddings`

**Request**:
```json
{
  "sections": {
    "skills": "Python, Java, Machine Learning, TensorFlow",
    "experience": "Software Engineer at Tech Corp for 2 years...",
    "projects": "AI Chatbot using NLP and TensorFlow..."
  }
}
```

**Response**:
```json
{
  "embeddings": {
    "skills": [0.1, 0.2, 0.3, ...],
    "experience": [0.4, 0.5, 0.6, ...],
    "projects": [0.7, 0.8, 0.9, ...]
  }
}
```

---

### Phase 3: RAG-based Question Generation

#### 6. Generate Question with Resume Context
**Endpoint**: `POST /ml/interview/question` (Update existing)

**Request** (Enhanced):
```json
{
  "job_role": "Software Engineer",
  "type": "technical",
  "difficulty": "medium",
  "previous_topics": ["Data Structures", "Algorithms"],
  "resume_summary": "Skills: Python, Java. Experience: 2 positions. Projects: 3 projects.",
  "resume_skills": ["Python", "Java", "Machine Learning"],
  "resume_context": "Candidate worked on AI Chatbot project using NLP and TensorFlow",
  "use_resume_context": true
}
```

**Response**:
```json
{
  "question": "I see you worked on an AI Chatbot using NLP. Can you explain how you handled intent classification in your chatbot?",
  "topic": "Natural Language Processing",
  "difficulty": "medium",
  "ideal_answer": "Intent classification can be handled using...",
  "personalized": true,
  "resume_reference": "AI Chatbot project"
}
```

---

## 🐍 Complete Python Implementation

### File Structure:
```
ml-service/
├── app/
│   ├── main.py
│   ├── routers/
│   │   ├── embeddings.py      (NEW - Phase 1)
│   │   ├── resume_rag.py      (NEW - Phase 2)
│   │   └── interview.py       (UPDATE - Phase 3)
│   └── services/
│       ├── embedding_service.py
│       └── rag_service.py
└── requirements.txt
```

---

### 1. Embeddings Router (`app/routers/embeddings.py`)

```python
from fastapi import APIRouter, HTTPException
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Load model once at startup
try:
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    logger.info("✅ Sentence Transformer model loaded")
except Exception as e:
    logger.error(f"❌ Failed to load model: {e}")
    model = None

class EmbeddingRequest(BaseModel):
    text: str

class EmbeddingResponse(BaseModel):
    embedding: list[float]
    dimension: int
    model: str

class SimilarityRequest(BaseModel):
    text1: str
    text2: str

class SimilarityResponse(BaseModel):
    similarity: float
    score: float
    method: str
    model: str

@router.post("/ml/embeddings/generate", response_model=EmbeddingResponse)
async def generate_embedding(request: EmbeddingRequest):
    """Generate embedding for text"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        logger.info(f"🤖 Generating embedding (text length: {len(request.text)})")
        embedding = model.encode(request.text)
        
        return EmbeddingResponse(
            embedding=embedding.tolist(),
            dimension=len(embedding),
            model="sentence-transformers/all-MiniLM-L6-v2"
        )
    except Exception as e:
        logger.error(f"❌ Embedding generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ml/similarity/calculate", response_model=SimilarityResponse)
async def calculate_similarity(request: SimilarityRequest):
    """Calculate semantic similarity between two texts"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        logger.info(f"📊 Calculating similarity")
        
        embedding1 = model.encode(request.text1)
        embedding2 = model.encode(request.text2)
        
        similarity = cosine_similarity([embedding1], [embedding2])[0][0]
        score = float(similarity * 100)
        
        logger.info(f"✅ Similarity: {similarity:.4f} (score: {score:.2f})")
        
        return SimilarityResponse(
            similarity=float(similarity),
            score=score,
            method="cosine",
            model="sentence-transformers/all-MiniLM-L6-v2"
        )
    except Exception as e:
        logger.error(f"❌ Similarity calculation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

---

### 2. Resume RAG Router (`app/routers/resume_rag.py`)

```python
from fastapi import APIRouter, HTTPException
from sentence_transformers import SentenceTransformer
from pydantic import BaseModel
import google.generativeai as genai
import logging
import os
import re

logger = logging.getLogger(__name__)
router = APIRouter()

# Load models
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-pro')

class ResumeRagRequest(BaseModel):
    text: str

class ResumeContextRequest(BaseModel):
    resume_id: str
    query: str

class ResumeEmbeddingsRequest(BaseModel):
    sections: dict[str, str]

# In-memory storage for resume embeddings (use Redis/DB in production)
resume_store = {}

@router.post("/ml/resume/rag-parse")
async def rag_parse_resume(request: ResumeRagRequest):
    """Parse resume with RAG - extract structured data and generate embeddings"""
    try:
        logger.info(f"📚 RAG parsing resume (length: {len(request.text)})")
        
        # Use Gemini to extract structured data
        prompt = f"""
        Extract the following information from this resume in JSON format:
        - skills: list of technical skills
        - experience: list of work experiences (title, company, duration, description)
        - projects: list of projects (name, description, technologies)
        - education: list of education (degree, institution, year)
        - score: overall resume quality score (0-100)
        
        Resume:
        {request.text}
        
        Return ONLY valid JSON, no markdown formatting.
        """
        
        response = gemini_model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Clean markdown formatting if present
        result_text = re.sub(r'```json\n?', '', result_text)
        result_text = re.sub(r'```\n?', '', result_text)
        
        import json
        parsed_data = json.loads(result_text)
        
        # Generate embeddings for each section
        embeddings = {}
        for section, content in parsed_data.items():
            if section != "score" and content:
                if isinstance(content, list):
                    content_str = " ".join([str(item) for item in content])
                else:
                    content_str = str(content)
                
                embedding = model.encode(content_str)
                embeddings[section] = embedding.tolist()
        
        parsed_data["embeddings"] = embeddings
        
        # Store in memory (use DB in production)
        resume_id = f"resume_{hash(request.text)}"
        resume_store[resume_id] = {
            "data": parsed_data,
            "text": request.text
        }
        
        logger.info(f"✅ RAG parsing completed with {len(embeddings)} embeddings")
        return parsed_data
        
    except Exception as e:
        logger.error(f"❌ RAG parsing failed: {e}")
        # Fallback to basic parsing
        return {
            "skills": [],
            "experience": [],
            "projects": [],
            "education": [],
            "score": 50.0,
            "error": str(e)
        }

@router.post("/ml/resume/context")
async def get_resume_context(request: ResumeContextRequest):
    """Get relevant resume context using semantic search"""
    try:
        logger.info(f"🔍 Getting context for query: {request.query}")
        
        # Get resume from store
        if request.resume_id not in resume_store:
            return {"context": "", "relevance_score": 0.0}
        
        resume_data = resume_store[request.resume_id]
        resume_text = resume_data["text"]
        
        # Generate query embedding
        query_embedding = model.encode(request.query)
        
        # Split resume into chunks
        chunks = resume_text.split('\n\n')
        
        # Find most relevant chunks
        from sklearn.metrics.pairwise import cosine_similarity
        chunk_embeddings = [model.encode(chunk) for chunk in chunks if chunk.strip()]
        
        if not chunk_embeddings:
            return {"context": "", "relevance_score": 0.0}
        
        similarities = cosine_similarity([query_embedding], chunk_embeddings)[0]
        
        # Get top 3 most relevant chunks
        top_indices = similarities.argsort()[-3:][::-1]
        relevant_chunks = [chunks[i] for i in top_indices if similarities[i] > 0.3]
        
        context = " ".join(relevant_chunks)
        relevance_score = float(similarities[top_indices[0]]) if len(top_indices) > 0 else 0.0
        
        logger.info(f"✅ Context retrieved: {len(context)} chars, relevance: {relevance_score:.2f}")
        
        return {
            "context": context,
            "relevance_score": relevance_score
        }
        
    except Exception as e:
        logger.error(f"❌ Context retrieval failed: {e}")
        return {"context": "", "relevance_score": 0.0}

@router.post("/ml/resume/embeddings")
async def generate_resume_embeddings(request: ResumeEmbeddingsRequest):
    """Generate embeddings for resume sections"""
    try:
        logger.info(f"🤖 Generating embeddings for {len(request.sections)} sections")
        
        embeddings = {}
        for section_name, section_content in request.sections.items():
            if section_content and section_content.strip():
                embedding = model.encode(section_content)
                embeddings[section_name] = embedding.tolist()
        
        logger.info(f"✅ Generated {len(embeddings)} embeddings")
        
        return {"embeddings": embeddings}
        
    except Exception as e:
        logger.error(f"❌ Embeddings generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

---

### 3. Update Interview Router (`app/routers/interview.py`)

Add resume context support to question generation:

```python
@router.post("/ml/interview/question")
async def generate_question(request: QuestionRequest):
    """Generate interview question with optional resume context"""
    try:
        logger.info(f"🎯 Generating question for {request.job_role}")
        
        # Build prompt with resume context if available
        if request.use_resume_context and request.resume_context:
            prompt = f"""
            Generate a personalized technical interview question for a {request.job_role} position.
            
            Candidate's Background:
            {request.resume_summary}
            
            Relevant Experience:
            {request.resume_context}
            
            Skills: {', '.join(request.resume_skills)}
            
            Previous topics covered: {', '.join(request.previous_topics)}
            Difficulty: {request.difficulty}
            
            Generate a question that:
            1. References their specific experience or projects
            2. Tests their understanding of technologies they've used
            3. Is at {request.difficulty} difficulty level
            4. Avoids topics already covered: {', '.join(request.previous_topics)}
            
            Format:
            Question: [personalized question referencing their experience]
            Topic: [topic name]
            Ideal Answer: [brief ideal answer]
            """
        else:
            # Generic question (existing logic)
            prompt = f"""
            Generate a technical interview question for a {request.job_role} position.
            Difficulty: {request.difficulty}
            Avoid these topics: {', '.join(request.previous_topics)}
            
            Format:
            Question: [question]
            Topic: [topic]
            Ideal Answer: [answer]
            """
        
        response = gemini_model.generate_content(prompt)
        result = parse_question_response(response.text)
        
        result["personalized"] = bool(request.use_resume_context and request.resume_context)
        
        logger.info(f"✅ Question generated (personalized: {result['personalized']})")
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Question generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

---

### 4. Update `main.py`

```python
from fastapi import FastAPI
from app.routers import embeddings, resume_rag, interview

app = FastAPI(title="CIP ML Service")

# Register routers
app.include_router(embeddings.router, tags=["embeddings"])
app.include_router(resume_rag.router, tags=["resume-rag"])
app.include_router(interview.router, tags=["interview"])

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

---

### 5. Update `requirements.txt`

```txt
fastapi==0.104.1
uvicorn==0.24.0
sentence-transformers==2.2.2
scikit-learn==1.3.0
numpy==1.24.3
google-generativeai==0.3.1
pydantic==2.5.0
```

---

## 🧪 Testing

### Test Phase 1 (Semantic Similarity):
```bash
# Test embedding generation
curl -X POST http://localhost:8000/ml/embeddings/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "Machine learning is awesome"}'

# Test similarity calculation
curl -X POST http://localhost:8000/ml/similarity/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "text1": "Machine learning is a subset of AI",
    "text2": "ML is part of artificial intelligence"
  }'
```

### Test Phase 2 (RAG Resume):
```bash
# Test RAG resume parsing
curl -X POST http://localhost:8000/ml/resume/rag-parse \
  -H "Content-Type: application/json" \
  -d '{"text": "John Doe\nSoftware Engineer\nSkills: Python, Java\nExperience: 2 years at Tech Corp"}'
```

### Test Phase 3 (Personalized Questions):
```bash
# Test question generation with resume context
curl -X POST http://localhost:8000/ml/interview/question \
  -H "Content-Type: application/json" \
  -d '{
    "job_role": "Software Engineer",
    "difficulty": "medium",
    "resume_summary": "Skills: Python, Java. Projects: AI Chatbot",
    "resume_context": "Built AI Chatbot using NLP and TensorFlow",
    "use_resume_context": true
  }'
```

---

## ✅ Implementation Checklist

- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Create `app/routers/embeddings.py`
- [ ] Create `app/routers/resume_rag.py`
- [ ] Update `app/routers/interview.py`
- [ ] Update `app/main.py`
- [ ] Test all endpoints
- [ ] Verify backend integration
- [ ] Test end-to-end interview flow

---

## 🎯 Expected Behavior

### When User Starts Interview:
1. Backend fetches user's resume
2. Backend extracts resume summary and skills
3. Backend sends to ML service with resume context
4. ML service generates personalized question
5. Question references candidate's specific experience

### Example Personalized Question:
```
"I see you worked on an AI Chatbot project using NLP and TensorFlow. 
Can you explain how you handled intent classification in your chatbot?"
```

vs Generic Question:
```
"Explain how intent classification works in NLP."
```

---

## 🚀 Ready to Deploy!

Backend is fully implemented ✅
ML Service implementation guide complete ✅
All three phases covered ✅

**Next**: Implement ML service endpoints and test!
