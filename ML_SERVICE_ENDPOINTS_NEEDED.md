# 🤖 ML Service Endpoints - Phase 1 Implementation

## ✅ Backend Changes Complete!

The Java backend has been updated with semantic similarity scoring. Now we need to implement the corresponding ML service endpoints.

---

## 📝 Required ML Service Endpoints

### 1. **Embedding Generation Endpoint**

**Endpoint**: `POST /ml/embeddings/generate`

**Request**:
```json
{
  "text": "This is the text to generate embeddings for"
}
```

**Response**:
```json
{
  "embedding": [0.123, -0.456, 0.789, ...],  // Array of floats (384 or 768 dimensions)
  "dimension": 384,
  "model": "sentence-transformers/all-MiniLM-L6-v2"
}
```

**Python Implementation** (FastAPI):
```python
from fastapi import APIRouter
from sentence_transformers import SentenceTransformer
from pydantic import BaseModel

router = APIRouter()

# Load model once at startup
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

class EmbeddingRequest(BaseModel):
    text: str

class EmbeddingResponse(BaseModel):
    embedding: list[float]
    dimension: int
    model: str

@router.post("/ml/embeddings/generate", response_model=EmbeddingResponse)
async def generate_embedding(request: EmbeddingRequest):
    """
    Generate embedding vector for input text using Sentence Transformers
    """
    try:
        # Generate embedding
        embedding = model.encode(request.text)
        
        return EmbeddingResponse(
            embedding=embedding.tolist(),
            dimension=len(embedding),
            model="sentence-transformers/all-MiniLM-L6-v2"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")
```

---

### 2. **Semantic Similarity Calculation Endpoint**

**Endpoint**: `POST /ml/similarity/calculate`

**Request**:
```json
{
  "text1": "User's answer to the interview question",
  "text2": "Ideal answer or expected response"
}
```

**Response**:
```json
{
  "similarity": 0.85,      // Cosine similarity (0-1)
  "score": 85.0,           // Converted to 0-100 scale
  "method": "cosine",
  "model": "sentence-transformers/all-MiniLM-L6-v2"
}
```

**Python Implementation** (FastAPI):
```python
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class SimilarityRequest(BaseModel):
    text1: str
    text2: str

class SimilarityResponse(BaseModel):
    similarity: float
    score: float
    method: str
    model: str

@router.post("/ml/similarity/calculate", response_model=SimilarityResponse)
async def calculate_similarity(request: SimilarityRequest):
    """
    Calculate semantic similarity between two texts using cosine similarity
    """
    try:
        # Generate embeddings for both texts
        embedding1 = model.encode(request.text1)
        embedding2 = model.encode(request.text2)
        
        # Calculate cosine similarity
        similarity = cosine_similarity([embedding1], [embedding2])[0][0]
        
        # Convert to 0-100 scale
        score = float(similarity * 100)
        
        return SimilarityResponse(
            similarity=float(similarity),
            score=score,
            method="cosine",
            model="sentence-transformers/all-MiniLM-L6-v2"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Similarity calculation failed: {str(e)}")
```

---

## 📦 Required Python Dependencies

Add to `requirements.txt`:
```txt
sentence-transformers==2.2.2
scikit-learn==1.3.0
numpy==1.24.3
```

Install:
```bash
pip install sentence-transformers scikit-learn numpy
```

---

## 🔧 Complete ML Service File Structure

Create a new file: `ml-service/app/routers/embeddings.py`

```python
from fastapi import APIRouter, HTTPException
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel
import numpy as np
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Load model once at startup (singleton pattern)
try:
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    logger.info("✅ Sentence Transformer model loaded successfully")
except Exception as e:
    logger.error(f"❌ Failed to load Sentence Transformer model: {e}")
    model = None

# Request/Response Models
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

# Endpoints
@router.post("/ml/embeddings/generate", response_model=EmbeddingResponse)
async def generate_embedding(request: EmbeddingRequest):
    """
    Generate embedding vector for input text
    
    Used for semantic similarity calculations in interview answer evaluation.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        logger.info(f"🤖 Generating embedding for text (length: {len(request.text)})")
        
        # Generate embedding
        embedding = model.encode(request.text)
        
        logger.info(f"✅ Embedding generated (dimension: {len(embedding)})")
        
        return EmbeddingResponse(
            embedding=embedding.tolist(),
            dimension=len(embedding),
            model="sentence-transformers/all-MiniLM-L6-v2"
        )
    except Exception as e:
        logger.error(f"❌ Embedding generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")

@router.post("/ml/similarity/calculate", response_model=SimilarityResponse)
async def calculate_similarity(request: SimilarityRequest):
    """
    Calculate semantic similarity between two texts
    
    Uses cosine similarity on sentence embeddings.
    Returns similarity score on 0-100 scale.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        logger.info(f"📊 Calculating similarity (text1: {len(request.text1)} chars, text2: {len(request.text2)} chars)")
        
        # Generate embeddings for both texts
        embedding1 = model.encode(request.text1)
        embedding2 = model.encode(request.text2)
        
        # Calculate cosine similarity
        similarity = cosine_similarity([embedding1], [embedding2])[0][0]
        
        # Convert to 0-100 scale
        score = float(similarity * 100)
        
        logger.info(f"✅ Similarity calculated: {similarity:.4f} (score: {score:.2f})")
        
        return SimilarityResponse(
            similarity=float(similarity),
            score=score,
            method="cosine",
            model="sentence-transformers/all-MiniLM-L6-v2"
        )
    except Exception as e:
        logger.error(f"❌ Similarity calculation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Similarity calculation failed: {str(e)}")

@router.get("/ml/embeddings/health")
async def health_check():
    """Health check for embeddings service"""
    return {
        "status": "healthy" if model is not None else "unhealthy",
        "model_loaded": model is not None,
        "model_name": "sentence-transformers/all-MiniLM-L6-v2"
    }
```

---

## 🔗 Register Router in Main App

In `ml-service/app/main.py`, add:

```python
from app.routers import embeddings

# Register router
app.include_router(embeddings.router, tags=["embeddings"])
```

---

## 🧪 Testing the Endpoints

### Test Embedding Generation:
```bash
curl -X POST http://localhost:8000/ml/embeddings/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "What is machine learning?"}'
```

### Test Similarity Calculation:
```bash
curl -X POST http://localhost:8000/ml/similarity/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "text1": "Machine learning is a subset of artificial intelligence",
    "text2": "ML is part of AI that enables computers to learn from data"
  }'
```

Expected response:
```json
{
  "similarity": 0.78,
  "score": 78.0,
  "method": "cosine",
  "model": "sentence-transformers/all-MiniLM-L6-v2"
}
```

---

## ✅ Backend Integration Status

### What's Already Done:
1. ✅ `MlServiceClient.java` - Added `generateEmbedding()` and `calculateSemanticSimilarity()` methods
2. ✅ `SemanticScoringService.java` - Created service for semantic similarity scoring
3. ✅ `InterviewService.java` - Updated to use hybrid scoring (60% LLM + 40% Semantic)

### What Happens Now:
When a user submits an answer:
1. Backend calls ML service for LLM evaluation (existing)
2. Backend calls ML service for semantic similarity (NEW)
3. Backend combines scores: `Final = (LLM × 0.6) + (Semantic × 0.4)`
4. Response includes all three scores: `llm_score`, `semantic_score`, `score` (final)

---

## 🎯 Next Steps

1. **Implement ML Service Endpoints** (above code)
2. **Test Endpoints** (curl commands above)
3. **Test End-to-End**:
   - Start interview
   - Answer a question
   - Check logs for semantic similarity calculation
   - Verify combined score in response

4. **Monitor Logs**:
   - Backend: Look for "📊 Calculating semantic similarity"
   - ML Service: Look for "✅ Similarity calculated"

---

## 📊 Expected Log Output

### Backend Logs:
```
📝 Evaluating answer with semantic similarity
🤖 Attempting ML service for answer evaluation
✅ Semantic similarity score: 78.5
📊 Combined score: LLM=85.0 (60%), Semantic=78.5 (40%), Final=82.4
✅ ML service evaluation completed: LLM=85.0, Semantic=78.5, Final=82.4
```

### ML Service Logs:
```
📊 Calculating similarity (text1: 150 chars, text2: 200 chars)
✅ Similarity calculated: 0.7850 (score: 78.50)
```

---

## 🚀 Ready to Test!

Once ML service endpoints are implemented, the semantic similarity scoring will work automatically!

**Backend is ready ✅**
**ML Service needs implementation ⏳**
