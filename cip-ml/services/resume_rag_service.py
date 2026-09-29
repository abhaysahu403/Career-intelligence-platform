"""
Resume RAG Service - Phase 2: RAG-based Resume Parsing
Provides resume parsing with embeddings and semantic search
"""
import logging
import json
import re
import os
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

# In-memory storage for resume embeddings (use Redis/DB in production)
_resume_store: Dict[str, Dict[str, Any]] = {}

# Global models
_sentence_model = None
_gemini_model = None


def _get_sentence_model():
    """Lazy load the sentence transformer model"""
    global _sentence_model
    if _sentence_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("🤖 Loading Sentence Transformer model for RAG...")
            _sentence_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
            logger.info("✅ Sentence Transformer model loaded")
        except Exception as e:
            logger.error(f"❌ Failed to load Sentence Transformer: {e}")
            raise RuntimeError(f"Model loading failed: {e}")
    return _sentence_model


def _get_gemini_model():
    """Lazy load the Gemini model"""
    global _gemini_model
    if _gemini_model is None:
        try:
            import google.generativeai as genai
            api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
            if not api_key:
                logger.warning("⚠️ GEMINI_API_KEY not found, RAG parsing will use fallback")
                return None
            
            genai.configure(api_key=api_key)
            _gemini_model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp"))
            logger.info("✅ Gemini model configured for RAG")
        except Exception as e:
            logger.warning(f"⚠️ Failed to configure Gemini: {e}")
            return None
    return _gemini_model


def _extract_json_from_response(text: str) -> dict:
    """Extract JSON from Gemini response, handling markdown formatting"""
    cleaned = text.strip()
    
    # Remove markdown code blocks
    if cleaned.startswith("```"):
        cleaned = re.sub(r'```json\n?', '', cleaned)
        cleaned = re.sub(r'```\n?', '', cleaned)
    
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON: {e}")
        logger.error(f"Response text: {cleaned[:500]}")
        raise


def _fallback_parse_resume(text: str) -> Dict[str, Any]:
    """Fallback resume parsing when Gemini is unavailable"""
    logger.info("📝 Using fallback resume parsing")
    
    # Simple keyword-based extraction
    skills = []
    experience = []
    projects = []
    education = []
    
    # Extract skills (common programming languages and technologies)
    skill_keywords = [
        'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Rust',
        'React', 'Angular', 'Vue', 'Node.js', 'Django', 'Flask', 'Spring',
        'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
        'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
        'Git', 'CI/CD', 'Agile', 'Scrum'
    ]
    
    text_lower = text.lower()
    for skill in skill_keywords:
        if skill.lower() in text_lower:
            skills.append(skill)
    
    # Basic score based on content length and skills found
    score = min(100, 30 + len(skills) * 5 + len(text) / 100)
    
    return {
        "skills": skills[:15],  # Limit to top 15 skills
        "experience": experience,
        "projects": projects,
        "education": education,
        "score": round(score, 1)
    }


def parse_resume_with_rag(text: str, resume_id: str = None) -> Dict[str, Any]:
    """
    Parse resume with RAG - extract structured data and generate embeddings
    
    Args:
        text: Resume text content
        resume_id: Optional resume identifier (if not provided, will generate one)
        
    Returns:
        Dictionary containing:
        - resume_id: The ID used to store this resume
        - skills: List of technical skills
        - experience: List of work experiences
        - projects: List of projects
        - education: List of education entries
        - score: Overall resume quality score (0-100)
        - embeddings: Dictionary of section embeddings
    """
    try:
        logger.info(f"📚 RAG parsing resume (length: {len(text)} chars)")
        
        # Generate or use provided resume_id
        if resume_id is None:
            resume_id = f"resume_{hash(text)}"
        
        gemini_model = _get_gemini_model()
        
        if gemini_model is None:
            # Use fallback parsing
            parsed_data = _fallback_parse_resume(text)
        else:
            # Use Gemini for structured extraction
            prompt = f"""
Extract the following information from this resume in JSON format:
- skills: list of technical skills (strings)
- experience: list of work experiences, each with: title, company, duration, description
- projects: list of projects, each with: name, description, technologies (list)
- education: list of education entries, each with: degree, institution, year
- score: overall resume quality score (0-100) based on completeness, clarity, and relevance

Resume:
{text}

Return ONLY valid JSON, no markdown formatting, no explanations.
Example format:
{{
  "skills": ["Python", "Java"],
  "experience": [{{"title": "Engineer", "company": "Tech Corp", "duration": "2 years", "description": "Built systems"}}],
  "projects": [{{"name": "AI Bot", "description": "Chatbot", "technologies": ["Python", "TensorFlow"]}}],
  "education": [{{"degree": "B.Tech", "institution": "University", "year": "2022"}}],
  "score": 75.0
}}
"""
            
            try:
                response = gemini_model.generate_content(prompt)
                parsed_data = _extract_json_from_response(response.text)
                logger.info("✅ Gemini parsing successful")
            except Exception as e:
                logger.warning(f"⚠️ Gemini parsing failed: {e}, using fallback")
                parsed_data = _fallback_parse_resume(text)
        
        # Generate embeddings for each section
        sentence_model = _get_sentence_model()
        embeddings = {}
        
        for section, content in parsed_data.items():
            if section != "score" and content:
                # Convert content to string
                if isinstance(content, list):
                    if len(content) > 0 and isinstance(content[0], dict):
                        # List of dicts - extract all text
                        content_str = " ".join([
                            " ".join([str(v) for v in item.values()])
                            for item in content
                        ])
                    else:
                        # List of strings
                        content_str = " ".join([str(item) for item in content])
                else:
                    content_str = str(content)
                
                if content_str.strip():
                    embedding = sentence_model.encode(content_str)
                    embeddings[section] = embedding.tolist()
        
        parsed_data["embeddings"] = embeddings
        
        # Store in memory for later retrieval
        _resume_store[resume_id] = {
            "data": parsed_data,
            "text": text
        }
        
        logger.info(f"✅ RAG parsing completed with {len(embeddings)} embeddings")
        logger.info(f"📦 Stored resume with ID: {resume_id}")
        
        # Add resume_id to response
        parsed_data["resume_id"] = resume_id
        
        return parsed_data
        
    except Exception as e:
        logger.error(f"❌ RAG parsing failed: {e}")
        # Return fallback result
        return {
            "resume_id": resume_id or "unknown",
            "skills": [],
            "experience": [],
            "projects": [],
            "education": [],
            "score": 50.0,
            "embeddings": {},
            "error": str(e)
        }


def get_resume_context(resume_id: str, query: str) -> Dict[str, Any]:
    """
    Get relevant resume context using semantic search
    
    Args:
        resume_id: Resume identifier
        query: Query/topic to search for
        
    Returns:
        Dictionary containing:
        - context: Relevant resume text
        - relevance_score: Relevance score (0-1)
    """
    try:
        logger.info(f"🔍 Getting context for resume {resume_id}, query: {query}")
        
        # Get resume from store
        if resume_id not in _resume_store:
            logger.warning(f"⚠️ Resume {resume_id} not found in store")
            return {"context": "", "relevance_score": 0.0}
        
        resume_data = _resume_store[resume_id]
        resume_text = resume_data["text"]
        
        # Generate query embedding
        sentence_model = _get_sentence_model()
        query_embedding = sentence_model.encode(query)
        
        # Split resume into chunks (paragraphs)
        chunks = [chunk.strip() for chunk in resume_text.split('\n\n') if chunk.strip()]
        
        if not chunks:
            return {"context": "", "relevance_score": 0.0}
        
        # Generate embeddings for all chunks
        chunk_embeddings = [sentence_model.encode(chunk) for chunk in chunks]
        
        # Calculate similarities
        from sklearn.metrics.pairwise import cosine_similarity
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


def generate_resume_embeddings(sections: Dict[str, str]) -> Dict[str, Any]:
    """
    Generate embeddings for resume sections
    
    Args:
        sections: Dictionary mapping section names to content
        
    Returns:
        Dictionary containing:
        - embeddings: Dictionary mapping section names to embedding vectors
    """
    try:
        logger.info(f"🤖 Generating embeddings for {len(sections)} sections")
        
        sentence_model = _get_sentence_model()
        embeddings = {}
        
        for section_name, section_content in sections.items():
            if section_content and section_content.strip():
                embedding = sentence_model.encode(section_content)
                embeddings[section_name] = embedding.tolist()
        
        logger.info(f"✅ Generated {len(embeddings)} embeddings")
        
        return {"embeddings": embeddings}
        
    except Exception as e:
        logger.error(f"❌ Embeddings generation failed: {e}")
        raise
