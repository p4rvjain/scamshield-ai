from hybrid_detector import analyze_hybrid
from ai_detector import analyze_with_ai
from fastapi import UploadFile, File
from screenshot_detector import analyze_screenshot
from url_detector import analyze_url
from fastapi import HTTPException
from pydantic import BaseModel, Field
from detector import analyze_text
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="ScamShield AI",
    description="AI-powered scam detection backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

@app.get("/")
def home():
    return {
        "project": "ScamShield AI",
        "status": "online",
        "message": "Cybersecurity engine initialized"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ScamShield AI Backend"
    }

class ScanRequest(BaseModel):
    message: str = Field(min_length=1, max_length=10000)


@app.post("/api/scan")
def scan_message(request: ScanRequest):
    result = analyze_text(request.message)

    return {
        "status": "success",
        "message": request.message,
        **result
    }

class URLScanRequest(BaseModel):
    url: str


@app.post("/api/scan-url")
def scan_url(request: URLScanRequest):
    try:
        return analyze_url(request.url)
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

@app.post("/api/scan-screenshot")
async def scan_screenshot(file: UploadFile = File(...)):
    # Accept supported image formats
    allowed_types = {
        "image/png",
        "image/jpeg",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only PNG, JPG, and WEBP images are supported."
        )

    # Limit uploaded files to 5 MB
    max_size = 5 * 1024 * 1024

    image_bytes = await file.read(max_size + 1)

    if len(image_bytes) > max_size:
        raise HTTPException(
            status_code=413,
            detail="Screenshot must be smaller than 5 MB."
        )

    try:
        return analyze_screenshot(image_bytes)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

@app.post("/api/scan-ai")
def scan_ai(request: ScanRequest):
    try:
        return analyze_with_ai(request.message)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        print(f"Gemini analysis failed: {error}")

        raise HTTPException(
            status_code=503,
            detail="AI analysis is temporarily unavailable. Please try again."
        )

@app.post("/api/scan-hybrid")
def scan_hybrid(request: ScanRequest):
    try:
        return analyze_hybrid(request.message)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        print(f"Hybrid analysis failed: {error}")

        raise HTTPException(
            status_code=500,
            detail="Unable to analyze the message."
        )

@app.post("/api/scan-url-hybrid")
def scan_url_hybrid(request: URLScanRequest):
    # First run the existing URL-specific detector.
    url_result = analyze_url(request.url)

    # Then run AI-assisted analysis of the URL text.
    hybrid_result = analyze_hybrid(
        "Assess this URL for potential phishing or scam "
        "indicators based only on its text and structure. "
        "Do not visit the website or assume it is malicious: "
        + request.url
    )

    # Preserve the URL-specific score and evidence.
    # Include AI context separately.
    
    # Choose safety advice based on score and detected findings.
    risk_score = url_result["risk_score"]
    findings = url_result.get("evidence", [])

    if risk_score >= 60:
        recommended_action = (
            "Strong warning signs were detected. "
            "Do not enter passwords, OTPs, or payment details. "
            "Avoid opening the URL until you can verify "
            "the destination through an official source."
        )

    elif risk_score >= 25:
        recommended_action = (
            "Suspicious URL patterns were detected. "
            "Avoid entering sensitive information. "
            "Verify the destination through an independently "
            "obtained official website or contact method."
        )

    elif findings:
        recommended_action = (
            "Minor or inconclusive URL warning signs were "
            "detected. These do not establish that the "
            "website is malicious. Check the exact domain "
            "and verify the destination before sharing "
            "sensitive information."
        )

    else:
        recommended_action = (
            "No suspicious URL patterns were detected by "
            "the current checks. This does not verify that "
            "the website is safe. Confirm the exact domain "
            "and avoid entering sensitive information unless "
            "you trust the destination."
        )

    return {
        **url_result,
        
"summary": (
    hybrid_result.get("summary", "")
    + " This assessment is based on URL text and "
    "structure only. No live website content or "
    "domain reputation was verified."
),

        "scam_type": hybrid_result.get(
            "scam_type", "Unknown"
        ),
        
        "recommended_action": recommended_action,

        "analysis_mode": hybrid_result.get(
            "analysis_mode", "rule_fallback"
        ),
        "ai_score": hybrid_result.get("ai_score"),
    }

# ScamShield Academy — educational AI coach
from typing import Literal
from academy_coach import coach_reply

class CoachHistoryItem(BaseModel):
    role: Literal['user', 'assistant']
    text: str = Field(min_length=1, max_length=1500)

class CoachRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1500)
    history: list[CoachHistoryItem] = Field(default_factory=list, max_length=8)

@app.post('/api/academy/coach')
def academy_coach(request: CoachRequest):
    try:
        return {'reply': coach_reply(request.message, [item.model_dump() for item in request.history])}
    except Exception as error:
        print(f'Academy coach failed: {type(error).__name__}: {error}')
        raise HTTPException(status_code=503, detail='AI coach is temporarily unavailable. Please try again.')
