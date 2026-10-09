
import ipaddress
import re
from urllib.parse import urlsplit


SHORTENERS = {
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "is.gd",
    "cutt.ly",
    "shorturl.at",
}

SUSPICIOUS_KEYWORDS = {
    "verify",
    "verification",
    "secure-update",
    "account-update",
    "password-reset",
    "claim-prize",
    "urgent",
    "suspended",
}

# Trusted domains used for detecting obvious brand impersonation.
# This is a limited heuristic list, not a domain reputation database.
TRUSTED_DOMAINS = {
    "google.com",
    "paypal.com",
    "microsoft.com",
    "microsoftonline.com",
    "amazon.com",
    "apple.com",
    "netflix.com",
    "facebook.com",
    "instagram.com",
}


def detect_brand_impersonation(hostname: str):
    host_labels = hostname.split(".")

    for trusted_domain in TRUSTED_DOMAINS:
        # Genuine domain and its subdomains are excluded.
        if (
            hostname == trusted_domain
            or hostname.endswith("." + trusted_domain)
        ):
            continue

        trusted_labels = trusted_domain.split(".")
        brand = trusted_labels[0]

        # Case 1: Complete trusted domain embedded
        # inside an unrelated hostname.
        for index in range(
            len(host_labels) - len(trusted_labels) + 1
        ):
            if (
                host_labels[
                    index:index + len(trusted_labels)
                ] == trusted_labels
            ):
                return trusted_domain

        # Case 2: Brand name used in a different domain
        # alongside account/login-related terminology.
        suspicious_terms = {
            "login",
            "signin",
            "secure",
            "security",
            "verify",
            "verification",
            "account",
            "password",
            "support",
            "update",
        }

        hostname_tokens = set(
            re.split(r"[.-]", hostname)
        )

        if (
            brand in hostname_tokens
            and hostname_tokens.intersection(suspicious_terms)
        ):
            return trusted_domain

    return None



def has_unusual_hostname_label(hostname: str) -> bool:
    labels = hostname.split(".")

    # Inspect subdomain labels and the main domain label.
    # Ignore the final suffix (such as com).
    for label in labels[:-1]:
        if not label.isalpha() or len(label) < 12:
            continue

        vowels = sum(char in "aeiou" for char in label)
        vowel_ratio = vowels / len(label)

        # A limited heuristic for long, consonant-heavy labels.
        if vowel_ratio < 0.15:
            return True

    return False

def analyze_url(url: str):
    url = url.strip()

    if not url:
        raise ValueError("Please enter a URL.")

    # Require an explicit HTTP or HTTPS scheme.
    if not re.match(r"^https?://", url, re.IGNORECASE):
        url = "https://" + url

    try:
        parsed = urlsplit(url)
        hostname = parsed.hostname
        port = parsed.port
    except ValueError:
        raise ValueError("Invalid URL format.")

    if (
        parsed.scheme.lower() not in {"http", "https"}
        or not hostname
        or any(char.isspace() for char in url)
        or parsed.username is not None
        or parsed.password is not None
    ):
        raise ValueError("Invalid or unsupported URL.")

    if port is not None and not 1 <= port <= 65535:
        raise ValueError("Invalid port.")

    hostname = hostname.lower().rstrip(".")

    score = 0
    evidence = []

    def add_finding(title, explanation, severity, points):
        nonlocal score
        score += points
        evidence.append({
            "title": title,
            "explanation": explanation,
            "severity": severity,
        })

    # Check 1: IP address as host
    # Check 1: IP address as host
    is_ip_address = False

    try:
        ipaddress.ip_address(hostname)
        is_ip_address = True
        add_finding(
            "IP-based URL",
            "The URL uses an IP address instead of a domain name.",
            "high",
            25,
        )
    except ValueError:
        pass

    # Check 2: HTTP instead of HTTPS
    if parsed.scheme.lower() == "http":
        add_finding(
            "Unencrypted HTTP",
            "The URL uses HTTP rather than HTTPS.",
            "medium",
            15,
        )

    # Check 3: Known URL shortener
    if hostname in SHORTENERS:
        add_finding(
            "Shortened URL",
            "A URL shortener hides the final destination.",
            "medium",
            20,
        )

    # Check 4: Suspicious keywords
    searchable = (
        hostname + parsed.path + "?" + parsed.query
    ).lower()

    matched = [
        word
        for word in SUSPICIOUS_KEYWORDS
        if word in searchable
    ]

    if matched:
        add_finding(
            "Suspicious URL keywords",
            "Potential phishing-related terms found: "
            + ", ".join(sorted(matched)),
            "medium",
            20,
        )

    # Check 5: Deep subdomain structure
    if (
    hostname.count(".") >= 3
    and hostname not in SHORTENERS
    and not is_ip_address
    ):
        add_finding(
            "Complex subdomain structure",
            "Multiple subdomain levels may obscure the real domain.",
            "medium",
            15,
        )

    # Check 6: Trusted-domain impersonation
    if not is_ip_address:
        impersonated_domain = detect_brand_impersonation(
            hostname
        )

        if impersonated_domain:
            add_finding(
                "Potential brand impersonation",
                (
                    f"The hostname contains "
                    f"'{impersonated_domain}' but is not "
                    f"part of that trusted domain. "
                    "This can mislead users about the "
                    "actual website destination."
                ),
                "high",
                60,
            )

    # Check 6: Excessive URL length
    if len(url) > 120:
        add_finding(
            "Unusually long URL",
            "Long URLs can conceal misleading parameters.",
            "low",
            10,
        )

    # Check 8: Unusual hostname pattern
    if not is_ip_address and has_unusual_hostname_label(
        hostname
    ):
        add_finding(
            "Unusual hostname pattern",
            (
                "The hostname contains a long, "
                "consonant-heavy label. This can occur "
                "in automatically generated domains, "
                "but is not proof of malicious activity."
            ),
            "low",
            10,
        )

    score = min(score, 100)

    if score >= 60:
        verdict = "high_risk"
    elif score >= 25:
        verdict = "suspicious"
    else:
        verdict = "low_risk"

    return {
        "url": url,
        "hostname": hostname,
        "risk_score": score,
        "verdict": verdict,
        "evidence": evidence,
        "disclaimer": (
            "Heuristic URL screening only. "
            "No live reputation lookup was performed. "
            "A low score does not guarantee safety."
        ),
    }
