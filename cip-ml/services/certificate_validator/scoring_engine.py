"""
Scoring Engine - Computes final authenticity score with explainable reasons
Formula: Dynamic weights based on certificate type + bonus/penalty system
"""
from loguru import logger
from datetime import datetime
import re


def compute_authenticity_score(
    ocr_result: dict,
    issuer_result: dict,
    id_result: dict,
    tamper_result: dict
) -> dict:
    """
    Compute weighted authenticity score with dynamic weights and bonus/penalty system.
    All inputs are expected to have confidence/score values in [0, 1].
    Returns score (0-100), status, confidence, reasons, warnings.
    """

    # ── Component Scores ────────────────────────────────────────────────────

    # OCR score: based on extraction confidence + completeness of fields
    ocr_conf = float(ocr_result.get("ocr_confidence", 0.0))
    ocr_completeness = _ocr_completeness(ocr_result)
    ocr_score = (ocr_conf * 0.6 + ocr_completeness * 0.4)
    ocr_score = max(0.0, min(ocr_score, 1.0))

    # Issuer score: direct confidence from validator
    issuer_score = float(issuer_result.get("issuer_confidence", 0.0))

    # ID score: from ID validator
    id_score = float(id_result.get("id_score", 0.5))

    # Tamper score: inverted (high tampering = low score)
    tampering_score = float(tamper_result.get("tampering_score", 0.0))
    anti_tamper_score = 1.0 - tampering_score
    anti_tamper_score = max(0.0, min(anti_tamper_score, 1.0))

    # ── Dynamic Weights Based on Certificate Type ──────────────────────────
    issuer_type = issuer_result.get("issuer_type", "unknown")
    
    if issuer_type == "tech_company":
        # Tech companies have strong ID verification and QR codes
        W_OCR = 0.25
        W_ISSUER = 0.30
        W_ID = 0.25
        W_TAMPER = 0.20
    elif issuer_type == "university":
        # Universities have weaker ID systems but strong issuer validation
        W_OCR = 0.35
        W_ISSUER = 0.30
        W_ID = 0.15
        W_TAMPER = 0.20
    elif issuer_type == "edtech":
        # EdTech platforms have QR verification
        W_OCR = 0.20
        W_ISSUER = 0.25
        W_ID = 0.30
        W_TAMPER = 0.25
    elif issuer_type == "professional_body":
        # Professional bodies have strict ID and verification
        W_OCR = 0.25
        W_ISSUER = 0.30
        W_ID = 0.25
        W_TAMPER = 0.20
    else:
        # Default weights
        W_OCR = 0.30
        W_ISSUER = 0.25
        W_ID = 0.20
        W_TAMPER = 0.25

    raw_score = (
        W_OCR * ocr_score +
        W_ISSUER * issuer_score +
        W_ID * id_score +
        W_TAMPER * anti_tamper_score
    )

    # ── Bonus/Penalty System ────────────────────────────────────────────────
    bonus_points = 0
    penalty_points = 0
    
    # BONUS POINTS
    # +10: QR URL verified and matches certificate details
    if id_result.get("qr_verified") and id_result.get("qr_matches"):
        bonus_points += 10
        logger.info("[Score] +10 bonus: QR verified and matches")
    
    # +5: Certificate not expired
    date_valid = _validate_date(ocr_result.get("issue_date"))
    if date_valid and not date_valid.get("expired"):
        bonus_points += 5
        logger.info("[Score] +5 bonus: Certificate not expired")
    
    # +5: Issuer has high trust score (>90% confidence)
    if issuer_score > 0.90:
        bonus_points += 5
        logger.info("[Score] +5 bonus: High trust issuer")
    
    # +5: All key fields extracted successfully
    if ocr_completeness >= 0.95:
        bonus_points += 5
        logger.info("[Score] +5 bonus: All fields extracted")
    
    # PENALTY POINTS
    # -20: Certificate expired
    if date_valid and date_valid.get("expired"):
        penalty_points += 20
        logger.info("[Score] -20 penalty: Certificate expired")
    
    # -15: QR URL doesn't match certificate ID
    if id_result.get("qr_valid") and not id_result.get("qr_matches"):
        penalty_points += 15
        logger.info("[Score] -15 penalty: QR doesn't match certificate")
    
    # -10: Issuer domain mismatch
    if issuer_result.get("domain_mismatch"):
        penalty_points += 10
        logger.info("[Score] -10 penalty: Issuer domain mismatch")
    
    # -25: Tampering detected with high confidence
    if tamper_result.get("tampering_detected") and tampering_score > 0.65:
        penalty_points += 25
        logger.info(f"[Score] -25 penalty: High tampering detected (score={tampering_score:.2f})")
    
    # -10: Missing critical fields (name or issuer)
    if not ocr_result.get("name") or not ocr_result.get("issuer"):
        penalty_points += 10
        logger.info("[Score] -10 penalty: Missing critical fields")

    # Apply bonus and penalties
    final_score = int(round(raw_score * 100)) + bonus_points - penalty_points
    final_score = max(0, min(final_score, 100))

    # ── Status Classification ───────────────────────────────────────────────
    if final_score >= 85:
        status = "Genuine"
    elif final_score >= 70:
        status = "Likely Genuine"
    elif final_score >= 50:
        status = "Suspicious"
    elif final_score >= 30:
        status = "Likely Fake"
    else:
        status = "Fake"

    # ── Confidence Level ────────────────────────────────────────────────────
    # High confidence when score is far from the boundary thresholds
    boundary_distances = [
        abs(final_score - 85),
        abs(final_score - 70),
        abs(final_score - 50),
        abs(final_score - 30),
    ]
    min_distance = min(boundary_distances)

    if min_distance >= 15:
        confidence = "High"
    elif min_distance >= 8:
        confidence = "Medium"
    else:
        confidence = "Low"

    # ── Explainable Reasons ─────────────────────────────────────────────────
    reasons = []
    warnings = []

    # Positive reasons
    if ocr_conf >= 0.9:
        reasons.append("High OCR confidence — text is clearly readable")
    elif ocr_conf >= 0.75:
        reasons.append("Good OCR confidence")

    if ocr_completeness >= 0.8:
        reasons.append("All key fields extracted successfully (name, issuer, date, ID)")
    elif ocr_completeness >= 0.6:
        reasons.append("Most key fields present")

    if issuer_result.get("issuer_valid"):
        matched = issuer_result.get("matched_name", "")
        inst_type = issuer_result.get("issuer_type", "")
        if matched:
            reasons.append(f"Issuer verified: '{matched}' is a recognized {inst_type}")
        else:
            reasons.append("Issuer is a recognized institution")

    if issuer_result.get("accredited"):
        reasons.append("Institution is accredited")

    if id_result.get("id_valid"):
        if id_result.get("cert_id_valid"):
            reasons.append("Certificate ID format matches institution's pattern")
        if id_result.get("qr_valid"):
            reasons.append("QR code verified and links to trusted source")
        if id_result.get("qr_verified") and id_result.get("qr_matches"):
            reasons.append("QR verification successful — certificate details match")

    if not tamper_result.get("tampering_detected"):
        reasons.append("No signs of digital tampering detected")
    elif tampering_score < 0.3:
        reasons.append("Low tampering indicators")

    if ocr_result.get("signatories"):
        reasons.append(f"Signatory information found")
    
    if date_valid and not date_valid.get("expired"):
        reasons.append("Certificate is currently valid")

    # Negative reasons / warnings
    if ocr_conf < 0.5:
        warnings.append(f"Low OCR confidence ({ocr_conf:.0%}) — document may be low quality or handwritten")

    if not ocr_result.get("issuer"):
        warnings.append("Issuer name could not be extracted")

    if not issuer_result.get("issuer_valid"):
        conf = issuer_result.get("issuer_confidence", 0.0)
        if conf > 0.5:
            warnings.append(f"Issuer partially matches registry (confidence: {conf:.0%})")
        else:
            warnings.append("Issuer not found in recognized institution registry")

    if not ocr_result.get("certificate_id") and not ocr_result.get("qr_code_data"):
        warnings.append("No certificate ID or QR code found — harder to independently verify")

    if not ocr_result.get("issue_date"):
        warnings.append("Issue date not found")
    elif date_valid and date_valid.get("expired"):
        warnings.append(f"Certificate expired on {date_valid.get('expiry_date', 'unknown date')}")
    elif date_valid and date_valid.get("future_date"):
        warnings.append("Issue date is in the future — suspicious")

    for issue in tamper_result.get("issues", []):
        warnings.append(f"Forensic alert: {issue}")

    if ocr_completeness < 0.4:
        warnings.append("Several key fields are missing from the certificate")

    logger.info(
        f"[Score] final={final_score} (bonus={bonus_points}, penalty={penalty_points}), "
        f"status={status}, conf={confidence}, "
        f"ocr={ocr_score:.2f}, issuer={issuer_score:.2f}, id={id_score:.2f}, tamper={anti_tamper_score:.2f}"
    )

    return {
        "score": final_score,
        "status": status,
        "confidence": confidence,
        "reasons": reasons,
        "warnings": warnings,
        "bonus_points": bonus_points,
        "penalty_points": penalty_points,
        "component_scores": {
            "ocr": round(ocr_score, 3),
            "issuer": round(issuer_score, 3),
            "id": round(id_score, 3),
            "anti_tamper": round(anti_tamper_score, 3)
        },
        "weights_used": {
            "ocr": W_OCR,
            "issuer": W_ISSUER,
            "id": W_ID,
            "tamper": W_TAMPER
        }
    }


def _ocr_completeness(ocr_result: dict) -> float:
    """Score how complete the extracted data is (0-1)"""
    fields = {
        "name": 0.25,
        "issuer": 0.25,
        "issue_date": 0.15,
        "certificate_title": 0.15,
        "certificate_id": 0.20
    }

    score = 0.0
    for field, weight in fields.items():
        if ocr_result.get(field) and str(ocr_result[field]).strip():
            score += weight

    return score


def _validate_date(date_str: str) -> dict:
    """
    Validate certificate date.
    Returns dict with: valid, expired, future_date, expiry_date
    """
    if not date_str:
        return {"valid": False, "expired": False, "future_date": False}
    
    try:
        # Parse various date formats
        date_formats = [
            "%B %d, %Y",  # November 28, 2025
            "%d %B %Y",   # 28 November 2025
            "%B %Y",      # November 2025
            "%Y-%m-%d",   # 2025-11-28
            "%d/%m/%Y",   # 28/11/2025
            "%m/%d/%Y",   # 11/28/2025
            "%d-%m-%Y",   # 28-11-2025
        ]
        
        parsed_date = None
        for fmt in date_formats:
            try:
                parsed_date = datetime.strptime(date_str.strip(), fmt)
                break
            except ValueError:
                continue
        
        if not parsed_date:
            return {"valid": False, "expired": False, "future_date": False}
        
        now = datetime.now()
        
        # Check if date is in the future (suspicious)
        future_date = parsed_date > now
        
        # Assume certificates are valid for 5 years (can be customized per issuer)
        # For now, we don't have expiry dates, so we just check if issue date is reasonable
        # A certificate issued more than 10 years ago might be expired
        years_old = (now - parsed_date).days / 365.25
        expired = years_old > 10
        
        return {
            "valid": True,
            "expired": expired,
            "future_date": future_date,
            "issue_date": parsed_date.strftime("%Y-%m-%d"),
            "years_old": round(years_old, 1)
        }
        
    except Exception as e:
        logger.debug(f"[Date] Failed to parse date '{date_str}': {e}")
        return {"valid": False, "expired": False, "future_date": False}

