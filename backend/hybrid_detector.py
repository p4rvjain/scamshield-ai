
from detector import analyze_text
from ai_detector import analyze_with_ai


def analyze_hybrid(message: str):
    if not message.strip():
        raise ValueError("Message cannot be empty.")

    # Always run the local detector first.
    rule_result = analyze_text(message)

    try:
        ai_result = analyze_with_ai(message)

        ai_score = max(
            0, min(100, int(ai_result["risk_score"]))
        )
        rule_score = rule_result["risk_score"]

        # Weighted combination:
        # 70% AI + 30% rule-based
        combined_score = round(
            ai_score * 0.7 + rule_score * 0.3
        )

        if combined_score >= 60:
            verdict = "high_risk"
        elif combined_score >= 25:
            verdict = "suspicious"
        else:
            verdict = "low_detected_risk"

        
        ai_evidence = ai_result.get("red_flags", [])
        rule_evidence = rule_result.get("evidence", [])

        # Group similar findings by their underlying threat.
        def evidence_category(title):
            title = title.lower()

            if any(word in title for word in [
                "otp", "password", "credential",
                "sensitive information", "identity"
            ]):
                return "credentials"

            if any(word in title for word in [
                "urgency", "urgent", "pressure",
                "threat", "fear"
            ]):
                return "urgency"

            if any(word in title for word in [
                "account", "blocked", "locked",
                "suspended"
            ]):
                return "account_restriction"

            if any(word in title for word in [
                "link", "url", "domain"
            ]):
                return "link"

            if any(word in title for word in [
                "payment", "money", "fee"
            ]):
                return "payment"

            return title.strip()

        combined_evidence = []
        seen_categories = set()

        # Prioritize AI explanations, then add unique
        # rule-based findings.
        for finding in ai_evidence + rule_evidence:
            category = evidence_category(
                finding.get("title", "")
            )

            if category not in seen_categories:
                seen_categories.add(category)
                combined_evidence.append(finding)

        return {
            "risk_score": combined_score,
            "verdict": verdict,
            "evidence": combined_evidence,
            "summary": ai_result.get("summary", ""),
            "scam_type": ai_result.get(
                "scam_type", "Unknown"
            ),
            "recommended_action": ai_result.get(
                "recommended_action",
                "Verify suspicious requests independently."
            ),
            "ai_score": ai_score,
            "rule_score": rule_score,
            "analysis_mode": "hybrid",
            "disclaimer": (
                "AI-assisted and rule-based screening. "
                "Risk scores are heuristic indicators, "
                "not verified probabilities of fraud."
            ),
        }

    except Exception as error:
        print(f"Gemini unavailable; using rules: {error}")

        return {
            **rule_result,
            "summary": (
                "AI analysis is unavailable. "
                "This assessment uses rule-based detection."
            ),
            "scam_type": "Not determined",
            "recommended_action": (
                "Avoid sharing credentials or sending money. "
                "Verify requests using official channels."
            ),
            "ai_score": None,
            "rule_score": rule_result["risk_score"],
            "analysis_mode": "rule_fallback",
        }
