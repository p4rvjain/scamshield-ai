
import re


def analyze_text(message: str):
    text = re.sub(r"\s+", " ", message.lower()).strip()

    evidence = []
    score = 0

    rules = [
        {
            "pattern": (
                r"\b(?:urgent|immediately|act now|"
                r"within \d+ minutes?|last chance)\b"
            ),
            "title": "Urgency detected",
            "explanation": (
                "The message uses urgency or time pressure "
                "to encourage immediate action."
            ),
            "weight": 15,
        },
        {
            "pattern": (
                r"\b(?:otp|password|pin|login details|"
                r"verify your account|verify your identity|"
                r"confirm your identity)\b"
            ),
            "title": "Sensitive information request",
            "explanation": (
                "The message requests or refers to identity "
                "verification or sensitive account information."
            ),
            "weight": 25,
        },
        {
            "pattern": (
                r"\b(?:registration fee|processing fee|"
                r"pay now|send money|refundable fee)\b"
            ),
            "title": "Suspicious payment language",
            "explanation": (
                "The message contains payment-related language "
                "commonly associated with scams."
            ),
            "weight": 25,
        },
        {
            "pattern": r"https?://[^\s]+|www\.[^\s]+",
            "title": "External link detected",
            "explanation": (
                "The message contains a link whose destination "
                "has not been independently verified."
            ),
            "weight": 10,
        },
        {
            "pattern": (
                r"\baccount\b.{0,50}"
                r"\b(?:blocked|suspended|locked|frozen)\b"
                r"|\b(?:lottery winner|won.{0,20}prize)\b"
            ),
            "title": "Account threat or scam language",
            "explanation": (
                "The message mentions an account restriction "
                "or language commonly used in scam attempts."
            ),
            "weight": 20,
        },
        {
            "pattern": (
                r"\b(?:call|contact|phone|dial|ring)\b"
                r".{0,35}"
                r"(?:\+?\d[\d\s().-]{7,}\d)"
            ),
            "title": "Callback number requested",
            "explanation": (
                "The message directs the recipient to call "
                "a supplied phone number. Verify that number "
                "using an independent official source."
            ),
            "weight": 15,
        },
    ]

    for rule in rules:
        if re.search(rule["pattern"], text, re.IGNORECASE):
            score += rule["weight"]

            evidence.append({
                "title": rule["title"],
                "explanation": rule["explanation"],
                "severity": (
                    "high"
                    if rule["weight"] >= 20
                    else "medium"
                ),
            })

    score = min(score, 100)

    if score >= 60:
        verdict = "high_risk"
    elif score >= 25:
        verdict = "suspicious"
    else:
        verdict = "low_detected_risk"

    return {
        "risk_score": score,
        "verdict": verdict,
        "evidence": evidence,
        "disclaimer": (
            "Rule-based screening only. "
            "Indicators are not proof of fraud. "
            "A low score does not guarantee safety."
        ),
    }
