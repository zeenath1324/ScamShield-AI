import re
from typing import List, Dict, Any, Tuple
from app.services.url_detector import analyze_url_static

# Regex patterns for message analysis
URGENCY_PATTERNS = [
    (r"\b(within\s*(?:24|48|12)\s*hours?)\b", "Tight Artificial Deadline", 25),
    (r"\b(immediately|act\s+now|urgent(?:ly)?|immediate\s+action\s+required)\b", "High-Pressure Urgency", 20),
    (r"\b(account\s+(?:will\s+be\s+)?(?:suspended|terminated|frozen|closed|locked|blocked))\b", "Account Suspension Threat", 30),
    (r"\b(final\s+warning|last\s+chance|take\s+action\s+before\s+it'?s\s+too\s+late)\b", "Coercive Pressure Cues", 20),
    (r"\b(legal\s+action|law\s+enforcement|arrest\s+warrant|police|court\s+summons)\b", "Legal & Enforcement Intimidation", 35),
]

CREDENTIAL_HARVESTING_PATTERNS = [
    (r"\b((?:share|send|enter|verify|provide)\s+(?:your\s+)?(?:otp|one-time\s+password|passcode|6-digit\s+code|verification\s+code))\b", "Request for One-Time Password (OTP)", 40),
    (r"\b((?:share|send|confirm|verify)\s+(?:your\s+)?(?:password|pin\s+number|security\s+questions))\b", "Direct Password or PIN Solicitation", 45),
    (r"\b((?:social\s+security\s+number|ssn|national\s+insurance|tax\s+id))\b", "High-Sensitivity Identity Solicitation", 35),
    (r"\b(seed\s+phrase|private\s+key|recovery\s+phrase|wallet\s+key)\b", "Crypto Seed Phrase Solicitation", 50),
]

FINANCIAL_PRESSURE_PATTERNS = [
    (r"\b(gift\s+cards?|itunes\s+card|apple\s+gift\s+card|steam\s+card|google\s+play\s+card)\b", "Unconventional Payment via Gift Card", 40),
    (r"\b(wire\s+transfer|western\s+union|moneygram)\b", "Irreversible Wire Transfer Request", 30),
    (r"\b(crypto(?:currency)?|bitcoin|btc|eth|usdt|deposit\s+to\s+wallet)\b", "Cryptocurrency Payment Solicitation", 25),
    (r"\b(unauthorized\s+(?:charge|transaction|payment|order)|charge\s+of\s+\$?\d+)\b", "Fabricated Transaction Scare", 25),
    (r"\b(invoice\s+(?:attached|due|paid|overdue)|subscription\s+renew(?:ed|al))\b", "Bogus Invoice / Renewal Scare", 20),
]

LOTTERY_PRIZE_PATTERNS = [
    (r"\b(you\s+(?:have\s+)?won|congratulations\s+winner|claim\s+your\s+prize|selected\s+to\s+receive)\b", "Unsolicited Prize / Lottery Claim", 35),
    (r"\b(\$?\d{1,3}(?:,\d{3})+(?:\.\d{2})?\s*(?:dollars|usd)?\s*(?:grant|lottery|prize|inheritance))\b", "High-Value Unearned Financial Claim", 30),
    (r"\b(beneficiary|unclaimed\s+estate|next\s+of\s+kin|foreign\s+diplomat)\b", "Classic Advance-Fee / Inheritance Scam", 40),
]

IMPERSONATION_PATTERNS = [
    (r"\b(internal\s+revenue\s+service|irs|hmrc|tax\s+refund|customs\s+and\s+border)\b", "Government / Tax Authority Impersonation", 35),
    (r"\b(usps|postal\s+service|fedex|dhl|ups)\s+(?:delivery|package|parcel|tracking|failure|address\s+missing)\b", "Parcel Delivery Failure Phish", 30),
    (r"\b(geek\s+squad|norton\s+(?:antivirus|security)|mcafee\s+subscription)\b", "Tech Support / Renewal Impersonation", 35),
    (r"\b(bank\s+fraud\s+department|security\s+alert\s+from\s+your\s+bank)\b", "Financial Institution Impersonation", 30),
]

GENERIC_GREETING_PATTERNS = [
    (r"^(dear\s+(?:customer|client|user|account\s+holder|member|valued\s+customer|sir\/?madam))\b", "Impersonal Generic Greeting", 15),
]

URL_EXTRACTOR = re.compile(r"https?://[^\s<>\"']+|www\.[^\s<>\"']+", re.IGNORECASE)

def redact_sensitive_input(text: str, max_length: int = 240) -> str:
    """
    Safely redacts prospective passwords, OTP codes, card numbers, and truncates text
    to preserve user privacy in database logs and UI summaries.
    """
    if not text:
        return ""
    
    # Redact prospective card numbers (13-19 digits)
    redacted = re.sub(r"\b(?:\d[ -]*?){13,19}\b", "[REDACTED-CARD-NUMBER]", text)
    # Redact prospective 6-digit OTPs
    redacted = re.sub(r"\b\d{6}\b", "[REDACTED-CODE]", redacted)
    # Redact prospective SSNs (XXX-XX-XXXX)
    redacted = re.sub(r"\b\d{3}-\d{2}-\d{4}\b", "[REDACTED-SSN]", redacted)
    # Redact passwords written in plain text (e.g. password: xyz)
    redacted = re.sub(r"(?i)(password|passcode|pin)\s*[:=]\s*\S+", r"\1: [REDACTED]", redacted)

    # Clean whitespace
    redacted = re.sub(r"\s+", " ", redacted).strip()

    if len(redacted) > max_length:
        return redacted[:max_length] + "…"
    return redacted

def analyze_message_static(message: str, subject: str = "") -> Tuple[List[str], List[Dict[str, Any]]]:
    """
    Performs purely static analysis of message content and subject text.
    Identifies deceptive psychological triggers and extracts embedded URLs for static analysis.
    """
    full_text = f"{subject}\n{message}".strip()
    indicators: List[Dict[str, Any]] = []
    extracted_urls: List[str] = []

    # Check Urgency
    for pattern, name, weight in URGENCY_PATTERNS:
        match = re.search(pattern, full_text, re.IGNORECASE)
        if match:
            indicators.append({
                "id": "msg_urgency_" + name.lower().replace(" ", "_"),
                "name": name,
                "severity": "high" if weight >= 30 else "medium",
                "category": "Psychological Manipulation",
                "weight": weight,
                "description": f"The message employs psychological pressure: '{match.group(1)}'.",
                "why_it_matters": "Scammers manufacture artificial panic to stop you from thinking critically or verifying the claim through independent channels.",
                "evidence": match.group(1)
            })
            break

    # Check Credential Harvesting
    for pattern, name, weight in CREDENTIAL_HARVESTING_PATTERNS:
        match = re.search(pattern, full_text, re.IGNORECASE)
        if match:
            indicators.append({
                "id": "msg_credentials_" + name.lower().replace(" ", "_"),
                "name": name,
                "severity": "high",
                "category": "Credential Harvesting",
                "weight": weight,
                "description": f"The message explicitly solicits sensitive authentication data: '{match.group(1)}'.",
                "why_it_matters": "Legitimate banks and technology companies NEVER ask you to share one-time passcodes (OTPs), PINs, or passwords over chat, SMS, or email.",
                "evidence": match.group(1)
            })
            break

    # Check Financial Pressure
    for pattern, name, weight in FINANCIAL_PRESSURE_PATTERNS:
        match = re.search(pattern, full_text, re.IGNORECASE)
        if match:
            indicators.append({
                "id": "msg_financial_" + name.lower().replace(" ", "_"),
                "name": name,
                "severity": "high" if weight >= 30 else "medium",
                "category": "Financial Demand",
                "weight": weight,
                "description": f"The message demands financial settlement using an unconventional or alarmist channel: '{match.group(1)}'.",
                "why_it_matters": "Requests to settle bills via gift cards, cryptocurrency, or sudden wire transfers are nearly 100% indicative of fraudulent operations.",
                "evidence": match.group(1)
            })
            break

    # Check Lottery & Prize Claims
    for pattern, name, weight in LOTTERY_PRIZE_PATTERNS:
        match = re.search(pattern, full_text, re.IGNORECASE)
        if match:
            indicators.append({
                "id": "msg_lottery_" + name.lower().replace(" ", "_"),
                "name": name,
                "severity": "high" if weight >= 35 else "medium",
                "category": "Advance-Fee Fraud",
                "weight": weight,
                "description": f"Unsolicited claim of a reward or payout: '{match.group(1)}'.",
                "why_it_matters": "You cannot win a contest or lottery you never entered. These messages inevitably require an upfront 'processing fee' or personal identity theft.",
                "evidence": match.group(1)
            })
            break

    # Check Impersonation
    for pattern, name, weight in IMPERSONATION_PATTERNS:
        match = re.search(pattern, full_text, re.IGNORECASE)
        if match:
            indicators.append({
                "id": "msg_impersonation_" + name.lower().replace(" ", "_"),
                "name": name,
                "severity": "high" if weight >= 35 else "medium",
                "category": "Brand / Entity Impersonation",
                "weight": weight,
                "description": f"The message mimics an authoritative brand, delivery courier, or government entity: '{match.group(1)}'.",
                "why_it_matters": "Brand impersonation exploits assumed trust to manipulate victims into clicking links or revealing information.",
                "evidence": match.group(1)
            })
            break

    # Check Generic Greeting
    for pattern, name, weight in GENERIC_GREETING_PATTERNS:
        match = re.search(pattern, full_text.strip(), re.IGNORECASE | re.MULTILINE)
        if match:
            indicators.append({
                "id": "msg_generic_greeting",
                "name": name,
                "severity": "low",
                "category": "Style Anomaly",
                "weight": weight,
                "description": f"The sender uses a non-specific greeting: '{match.group(1)}'.",
                "why_it_matters": "Legitimate service providers where you maintain an account usually address you by your verified name, not generic greetings.",
                "evidence": match.group(1)
            })
            break

    # Extract embedded URLs from message text
    url_matches = URL_EXTRACTOR.findall(full_text)
    for raw_u in url_matches:
        extracted_urls.append(raw_u)
        _, u_indicators = analyze_url_static(raw_u)
        for ind in u_indicators:
            # Prefix URL indicators found inside message
            ind_copy = ind.copy()
            ind_copy["id"] = "msg_embedded_" + ind_copy["id"]
            ind_copy["category"] = "Embedded Link: " + ind_copy["category"]
            indicators.append(ind_copy)

    # Check for excessive capitalization (SHOUTING)
    alpha_chars = [c for c in full_text if c.isalpha()]
    if len(alpha_chars) > 25:
        upper_ratio = sum(1 for c in alpha_chars if c.isupper()) / len(alpha_chars)
        if upper_ratio > 0.5:
            indicators.append({
                "id": "msg_excessive_caps",
                "name": "Excessive Capitalization (Shouting)",
                "severity": "low",
                "category": "Presentation Anomaly",
                "weight": 10,
                "description": f"Over {int(upper_ratio * 100)}% of letters are capitalized.",
                "why_it_matters": "Professional business communications adhere to standard editorial casing. Excessive capitals denote aggressive emotional manipulation.",
                "evidence": full_text[:60]
            })

    return extracted_urls, indicators
