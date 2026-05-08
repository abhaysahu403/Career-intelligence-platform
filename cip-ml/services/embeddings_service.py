"""
Embeddings Service - Phase 1: Semantic Similarity Scoring
Provides text embedding generation and similarity calculation
"""
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Global model instance (loaded once)
_model = None

def _get_model():
    """Lazy load the sentence transformer model"""
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("🤖 Loading Sentence Transformer model...")
            _model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
            logger.info("✅ Sentence Transformer model loaded successfully")
        except Exception as e:
            logger.error(f"❌ Failed to load Sentence Transformer model: {e}")
            raise RuntimeError(f"Model loading failed: {e}")
    return _model


def generate_embedding(text: str) -> Dict[str, Any]:
    """
    Generate embedding vector for input text
    
    Args:
        text: Input text to generate embedding for
        
    Returns:
        Dictionary containing:
        - embedding: List of floats representing the embedding vector
        - dimension: Size of the embedding vector
        - model: Name of the model used
    """
    try:
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        model = _get_model()
        logger.info(f"🤖 Generating embedding (text length: {len(text)})")
        
        embedding = model.encode(text)
        
        result = {
            "embedding": embedding.tolist(),
            "dimension": len(embedding),
            "model": "sentence-transformers/all-MiniLM-L6-v2"
        }
        
        logger.info(f"✅ Embedding generated: dimension={result['dimension']}")
        return result
        
    except Exception as e:
        logger.error(f"❌ Embedding generation failed: {e}")
        raise


def calculate_similarity(text1: str, text2: str) -> Dict[str, Any]:
    """
    Calculate semantic similarity between two texts using cosine similarity
    
    Args:
        text1: First text
        text2: Second text
        
    Returns:
        Dictionary containing:
        - similarity: Cosine similarity score (0-1)
        - score: Similarity as percentage (0-100)
        - method: Similarity calculation method
        - model: Name of the model used
    """
    try:
        if not text1 or not text1.strip():
            raise ValueError("text1 cannot be empty")
        if not text2 or not text2.strip():
            raise ValueError("text2 cannot be empty")
        
        model = _get_model()
        logger.info(f"📊 Calculating similarity between texts")
        
        # Generate embeddings
        embedding1 = model.encode(text1)
        embedding2 = model.encode(text2)
        
        # Calculate cosine similarity
        from sklearn.metrics.pairwise import cosine_similarity
        similarity = cosine_similarity([embedding1], [embedding2])[0][0]
        score = float(similarity * 100)
        
        result = {
            "similarity": float(similarity),
            "score": score,
            "method": "cosine",
            "model": "sentence-transformers/all-MiniLM-L6-v2"
        }
        
        logger.info(f"✅ Similarity calculated: {similarity:.4f} (score: {score:.2f})")
        return result
        
    except Exception as e:
        logger.error(f"❌ Similarity calculation failed: {e}")
        raise


def batch_generate_embeddings(texts: List[str]) -> Dict[str, Any]:
    """
    Generate embeddings for multiple texts in batch
    
    Args:
        texts: List of texts to generate embeddings for
        
    Returns:
        Dictionary containing:
        - embeddings: List of embedding vectors
        - dimension: Size of each embedding vector
        - count: Number of embeddings generated
        - model: Name of the model used
    """
    try:
        if not texts:
            raise ValueError("Texts list cannot be empty")
        
        model = _get_model()
        logger.info(f"🤖 Generating {len(texts)} embeddings in batch")
        
        embeddings = model.encode(texts)
        
        result = {
            "embeddings": [emb.tolist() for emb in embeddings],
            "dimension": len(embeddings[0]) if len(embeddings) > 0 else 0,
            "count": len(embeddings),
            "model": "sentence-transformers/all-MiniLM-L6-v2"
        }
        
        logger.info(f"✅ Batch embeddings generated: {result['count']} embeddings")
        return result
        
    except Exception as e:
        logger.error(f"❌ Batch embedding generation failed: {e}")
        raise
