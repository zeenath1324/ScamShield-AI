from typing import List, Dict, Any, Optional
from app.services.url_detector import analyze_url_static, normalize_url
from app.services.message_detector import analyze_message_static, redact_sensitive_input

LIMITATIONS_DISCLAIMER = (
    "ScamShield AI uses rule-based static heuristics to identify common deception patterns. "
    "Heuristic scores reflect observed risk indicators, not mathematical probabilities or absolute guarantees. "
    "A low score does not guarantee safety, as novel campaigns may evade known rules. Always verify sensitive requests out-of-band."
)

RECOMMENDED_ACTIONS_LIBRARY = {
    "high": [
        "Do not click any links, open attachments, or dial phone numbers listed in the message.",
        "Never enter credentials, passwords, or one-time verification codes (OTPs) into the referenced page.",
        "Verify independently by visiting the official website directly (type the authentic URL yourself in your browser).",
        "If financial or account details were already disclosed, immediately contact your financial institution to freeze cards and reset passwords.",
        "Report the suspicious message to the purported institution or forward it to your organization's security team."
    ],
    "suspicious": [
        "Exercise heightened caution before engaging with this sender or navigating to the link.",
        "Check whether you have an existing relationship with this organization and verify your account status directly via official apps or known numbers.",
        "Hover over links on desktop or inspect destination domains carefully before clicking.",
        "Do not feel pressured by artificial deadlines or demands for immediate resolution."
    ],
    "low": [
        "No high-confidence phishing indicators were identified by static inspection.",
        "Remain vigilant: ensure your browser displays a valid TLS certificate and matches the authentic domain name.",
        "Avoid sharing passwords or financial details on unverified platforms.",
        "If anything about the communication feels unusual, confirm directly with the sender through a known, trusted phone number."
    ]
}

def deduplicate_indicators(indicators: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Deduplicates indicators by ID or concept while retaining highest severity/weight.
    """
    seen_ids = set()
    unique_list = []
    
    for ind in indicators:
        iid = ind.get("id")
        if iid not in seen_ids:
            seen_ids.add(iid)
            unique_list.append(ind)
            
    return unique_list

def calculate_risk_score(indicators: List[Dict[str, Any]]) -> int:
    """
    Calculates composite score from deduplicated indicators.
    Applies diminishing marginal risk for repeated low-severity items,
    and caps at 100.
    """
    if not indicators:
        return 0

    total_weight = 0
    high_count = sum(1 for i in indicators if i.get("severity") == "high")
    med_count = sum(1 for i in indicators if i.get("severity") == "medium")
    low_count = sum(1 for i in indicators if i.get("severity") == "low")

    # Base weighted sum
    for ind in indicators:
        total_weight += ind.get("weight", 10)

    # If there is at least one high severity indicator (e.g. OTP harvesting, brand impersonation),
    # the minimum score should immediately enter the 'Suspicious' or 'High' bracket.
    if high_count >= 2:
        total_weight = max(total_weight, 70)
    elif high_count == 1:
        total_weight = max(total_weight, 50)
    elif med_count >= 2:
        total_weight = max(total_weight, 35)

    # Normalize within 0 - 100
    normalized_score = min(100, max(0, total_weight))
    return normalized_score

def determine_risk_category(score: int) -> str:
    """
    Heuristic risk bands:
    0-29: low
    30-59: suspicious
    60-100: high
    """
    if score >= 60:
        return "high"
    elif score >= 30:
        return "suspicious"
    else:
        return "low"

def generate_rule_explanation(risk_category: str, score: int, indicators: List[Dict[str, Any]], scan_type: str) -> str:
    """
    Generates transparent, plain-English summary explaining the rule evaluation.
    """
    if not indicators:
        return (
            f"Static heuristic analysis yielded a low observed risk score of {score}/100. "
            f"No prominent deception signatures (such as credential harvesting, brand impersonation, "
            f"or misleading domain structures) were flagged. Nonetheless, vigilance is recommended."
        )

    count = len(indicators)
    high_items = [i["name"] for i in indicators if i.get("severity") == "high"]
    med_items = [i["name"] for i in indicators if i.get("severity") == "medium"]

    summary_parts = [
        f"This {scan_type} scan yielded a score of {score}/100 ({risk_category.upper()} RISK) "
        f"based on {count} identified indicator{'s' if count != 1 else ''}."
    ]

    if high_items:
        summary_parts.append(
            f"Critical warning signals detected include: {', '.join(high_items[:3])}."
        )
    elif med_items:
        summary_parts.append(
            f"Notable warning signals detected include: {', '.join(med_items[:3])}."
        )

    summary_parts.append(
        "Review each indicator in the detailed breakdown below to understand the risk factors."
    )

    return " ".join(summary_parts)

def evaluate_scan(
    scan_type: str,
    url: Optional[str] = None,
    subject: Optional[str] = None,
    message: Optional[str] = None
) -> Dict[str, Any]:
    """
    Comprehensive static evaluation without network fetches.
    Returns complete structured assessment.
    """
    raw_indicators: List[Dict[str, Any]] = []
    normalized_url_str: Optional[str] = None
    redacted_preview: str = ""

    if scan_type == "url":
        clean_url = (url or "").strip()
        redacted_preview = clean_url[:150]
        if clean_url:
            normalized_url_str, url_indicators = analyze_url_static(clean_url)
            raw_indicators.extend(url_indicators)

    elif scan_type == "message":
        full_msg = (message or "").strip()
        subj = (subject or "").strip()
        redacted_preview = redact_sensitive_input(f"Subject: {subj} | {full_msg}" if subj else full_msg)
        extracted_urls, msg_indicators = analyze_message_static(full_msg, subj)
        raw_indicators.extend(msg_indicators)
        if extracted_urls:
            normalized_url_str = extracted_urls[0]

    elif scan_type == "combined":
        clean_url = (url or "").strip()
        full_msg = (message or "").strip()
        subj = (subject or "").strip()
        
        redacted_preview = f"URL: {clean_url[:60]} | " + redact_sensitive_input(f"Subject: {subj} | {full_msg}" if subj else full_msg, max_length=150)
        
        if clean_url:
            normalized_url_str, url_indicators = analyze_url_static(clean_url)
            raw_indicators.extend(url_indicators)

        _, msg_indicators = analyze_message_static(full_msg, subj)
        raw_indicators.extend(msg_indicators)

    # Deduplicate indicators
    final_indicators = deduplicate_indicators(raw_indicators)
    score = calculate_risk_score(final_indicators)
    category = determine_risk_category(score)
    explanation = generate_rule_explanation(category, score, final_indicators, scan_type)
    recommendations = RECOMMENDED_ACTIONS_LIBRARY.get(category, RECOMMENDED_ACTIONS_LIBRARY["low"])

    return {
        "scan_type": scan_type,
        "redacted_input_preview": redacted_preview or "No content provided",
        "normalized_url": normalized_url_str,
        "risk_score": score,
        "risk_category": category,
        "detected_indicators": final_indicators,
        "explanation": explanation,
        "recommended_actions": recommendations,
        "disclaimer": LIMITATIONS_DISCLAIMER
    }
