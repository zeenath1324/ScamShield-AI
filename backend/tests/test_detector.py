import pytest
from app.services.url_detector import analyze_url_static, normalize_url
from app.services.message_detector import analyze_message_static, redact_sensitive_input
from app.services.risk_engine import evaluate_scan, calculate_risk_score, determine_risk_category

def test_url_clean_legitimate():
    url = "https://example.com/documentation/guide"
    norm, indicators = analyze_url_static(url)
    assert norm == url
    assert len(indicators) == 0

def test_url_ip_hostname():
    url = "http://192.168.1.100/login"
    norm, indicators = analyze_url_static(url)
    ids = [i["id"] for i in indicators]
    assert "url_ip_hostname" in ids
    assert "url_no_https" in ids

def test_url_brand_impersonation_and_suspicious_tld():
    url = "http://paypal-security-verification.xyz/account/login"
    norm, indicators = analyze_url_static(url)
    ids = [i["id"] for i in indicators]
    assert any("brand_impersonation" in i for i in ids)
    assert "url_suspicious_tld" in ids
    assert "url_no_https" in ids

def test_url_at_symbol_trick():
    url = "https://legitbank.com@malicious-phish-domain.com/secure"
    norm, indicators = analyze_url_static(url)
    ids = [i["id"] for i in indicators]
    assert "url_userinfo_at_symbol" in ids

def test_url_shortener_detection():
    url = "https://bit.ly/3xY89Ab"
    norm, indicators = analyze_url_static(url)
    ids = [i["id"] for i in indicators]
    assert "url_shortener" in ids

def test_message_clean_low_risk():
    msg = "Hi Sarah, please review the minutes from today's staff meeting when you have a moment. Thanks!"
    urls, indicators = analyze_message_static(msg)
    assert len(indicators) == 0
    res = evaluate_scan("message", message=msg)
    assert res["risk_category"] == "low"
    assert res["risk_score"] < 30

def test_message_high_risk_urgency_and_otp():
    msg = (
        "URGENT: Your account will be suspended within 24 hours due to suspicious activity. "
        "Please immediately reply and send your 6-digit code OTP to verify your identity!"
    )
    urls, indicators = analyze_message_static(msg)
    assert len(indicators) >= 2
    res = evaluate_scan("message", message=msg)
    assert res["risk_category"] == "high"
    assert res["risk_score"] >= 60

def test_message_giftcard_payment_scam():
    msg = (
        "Notice: You have an unpaid tax bill from the Internal Revenue Service. "
        "To avoid arrest warrant and legal action, purchase a $500 Apple gift card and reply with the numbers."
    )
    res = evaluate_scan("message", message=msg)
    assert res["risk_category"] == "high"
    assert any("gift_card" in i["id"] or "gift" in i["name"].lower() for i in res["detected_indicators"])

def test_combined_scan():
    url = "http://secure-apple-id.click/verify"
    msg = "Dear user, your Apple ID is frozen. Click link immediately."
    res = evaluate_scan("combined", url=url, message=msg)
    assert res["risk_category"] == "high"
    assert res["risk_score"] >= 60
    assert len(res["detected_indicators"]) >= 2

def test_redact_sensitive_input():
    sensitive_text = "Here is my code 482910 and card 4111 2222 3333 4444 and password: SuperSecretPassword!"
    redacted = redact_sensitive_input(sensitive_text)
    assert "482910" not in redacted
    assert "4111 2222 3333 4444" not in redacted
    assert "SuperSecretPassword" not in redacted
    assert "[REDACTED" in redacted
