
import io

import easyocr
import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError

from hybrid_detector import analyze_hybrid


# Load the OCR model only when first needed.
reader = None


def get_reader():
    global reader

    if reader is None:
        reader = easyocr.Reader(
            ["en"],
            gpu=False
        )

    return reader


def analyze_screenshot(image_bytes: bytes):
    # Open the uploaded screenshot
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.load()
    except (UnidentifiedImageError, OSError, ValueError):
        raise ValueError(
            "Invalid image. Please upload a valid screenshot."
        )

    # Correct image orientation and convert to RGB
    image = ImageOps.exif_transpose(image).convert("RGB")

    # Extract text using OCR
    extracted_lines = get_reader().readtext(
        np.array(image),
        detail=0,
        paragraph=False
    )

    extracted_text = "\n".join(extracted_lines).strip()

    # No readable text found
    if not extracted_text:
        return {
            "risk_score": 0,
            "verdict": "inconclusive",
            "evidence": [],
            "extracted_text": "",
            "disclaimer": (
                "No readable text was detected. "
                "The screenshot could not be assessed."
            ),
        }

    # Reuse the existing scam detection engine
    result = analyze_hybrid(extracted_text)

    # Include OCR output in the response
    result["extracted_text"] = extracted_text

    
    result["disclaimer"] = (
    "Screenshot text was extracted using OCR and analyzed "
    "using Gemini AI and rule-based detection when available. "
    "OCR may miss or misread content. "
    "Risk scores are heuristic indicators, not verified "
    "probabilities of fraud. "
    "A low score does not guarantee safety."
    if result.get("analysis_mode") == "hybrid"
    else
    "Screenshot text was extracted using OCR and analyzed "
    "using rule-based detection because AI was unavailable. "
    "OCR may miss or misread content. "
    "A low score does not guarantee safety."
    )


    return result
