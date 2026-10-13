import re
from urllib.parse import urlparse
from typing import List, Dict, Any, Tuple

# Maintained list of common URL shortener hostnames
URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "ow.ly",
    "goo.gl", "rebrand.ly", "cutt.ly", "shorturl.at", "tiny.cc",
    "rb.gy", "v.gd", "tr.im", "s.id", "soo.gd"
}

# Suspicious or heavily abused Top Level Domains (TLDs)
SUSPICIOUS_TLDS = {
    "xyz", "top", "work", "click", "buzz", "country", "loan", "stream",
    "racing", "faith", "party", "gdn", "mom", "date", "men", "fit",
    "tk", "ml", "ga", "cf", "gq"
}

# High-profile brands frequently targeted by phishing impersonations
TARGET_BRANDS = [
    "paypal", "apple", "microsoft", "google", "amazon", "netflix",
    "chase", "wellsfargo", "bankofamerica", "citibank", "facebook",
    "instagram", "whatsapp", "telegram", "binance", "coinbase",
    "metamask", "usps", "fedex", "dhl", "ups", "irs", "gov", "hmrc"
]

# Legitimate exact domains for these brands
LEGITIMATE_BRAND_DOMAINS = {
    "paypal": ["paypal.com"],
    "apple": ["apple.com", "icloud.com"],
    "microsoft": ["microsoft.com", "live.com", "office.com"],
    "google": ["google.com", "gmail.com"],
    "amazon": ["amazon.com", "amazon.co.uk", "amazon.de"],
    "netflix": ["netflix.com"],
    "chase": ["chase.com"],
    "wellsfargo": ["wellsfargo.com"],
    "bankofamerica": ["bankofamerica.com"],
    "citibank": ["citi.com", "citibank.com"],
    "facebook": ["facebook.com", "fb.com"],
    "instagram": ["instagram.com"],
    "whatsapp": ["whatsapp.com"],
    "telegram": ["telegram.org", "t.me"],
    "binance": ["binance.com"],
    "coinbase": ["coinbase.com"],
    "metamask": ["metamask.io"],
    "usps": ["usps.com"],
    "fedex": ["fedex.com"],
    "dhl": ["dhl.com"],
    "ups": ["ups.com"],
}

IP_V4_PATTERN = re.compile(r"^(\d{1,3}\.){3}\d{1,3}$")

def normalize_url(raw_url: str) -> str:
    """
    Clean and normalize URL for static analysis without network calls.
    """
    raw_url = raw_url.strip()
    if not raw_url:
        return ""
    if not (raw_url.startswith("http://") or raw_url.startswith("https://") or raw_url.startswith("//")):
        # Treat as domain or schema-less URL
        raw_url = "https://" + raw_url
    return raw_url

def analyze_url_static(raw_url: str) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Performs purely static analysis of URL structure and string characteristics.
    NEVER visits, queries, or resolves the host.
    """
    normalized = normalize_url(raw_url)
    indicators = []

    try:
        parsed = urlparse(normalized)
    except Exception:
        indicators.append({
            "id": "url_malformed",
            "name": "Malformed URL Structure",
            "severity": "medium",
            "category": "Structure",
            "weight": 25,
            "description": "The URL cannot be parsed as a standard web address.",
            "why_it_matters": "Malformed or non-standard URLs often exploit browser parsing quirks.",
            "evidence": raw_url[:100]
        })
        return normalized, indicators

    host = (parsed.hostname or "").lower()
    path = parsed.path.lower()
    query = parsed.query.lower()
    scheme = parsed.scheme.lower()
    full_str = normalized.lower()

    # 1. Non-HTTPS Check
    if scheme == "http":
        indicators.append({
            "id": "url_no_https",
            "name": "Insecure HTTP Protocol",
            "severity": "medium",
            "category": "Transport Security",
            "weight": 15,
            "description": "The URL uses unencrypted HTTP rather than HTTPS.",
            "why_it_matters": "Legitimate organizations handling user accounts and payments virtually always enforce HTTPS. Plain HTTP exposes communications to eavesdropping.",
            "evidence": "http://"
        })

    # 2. IP Address Hostname
    clean_host = host.split(":")[0]
    if IP_V4_PATTERN.match(clean_host):
        indicators.append({
            "id": "url_ip_hostname",
            "name": "IP Address as Hostname",
            "severity": "high",
            "category": "Host Deception",
            "weight": 40,
            "description": f"The URL directly points to an IP address ({clean_host}) instead of a registered domain name.",
            "why_it_matters": "Legitimate public services use domain names. Direct IP addresses are commonly used by attackers to bypass domain reputation blocklists.",
            "evidence": clean_host
        })

    # 3. Punycode / Internationalized Domain Name (IDN) Homoglyph
    if "xn--" in host:
        indicators.append({
            "id": "url_punycode",
            "name": "Punycode / Homoglyph Encoding Detected",
            "severity": "high",
            "category": "Evasion & Impersonation",
            "weight": 35,
            "description": "The domain contains 'xn--', which indicates punycode character substitution.",
            "why_it_matters": "Attackers use lookalike Cyrillic or Greek characters (e.g., replacing Latin 'a' or 'o') to create deceptive visual replicas of legitimate brand domains.",
            "evidence": host
        })

    # 4. URL Shortener Service
    if clean_host in URL_SHORTENERS:
        indicators.append({
            "id": "url_shortener",
            "name": "URL Shortener Service Used",
            "severity": "medium",
            "category": "Obfuscation",
            "weight": 20,
            "description": f"The link uses a known URL shortening redirector ({clean_host}).",
            "why_it_matters": "Shortened links obscure the final destination domain, making it impossible to verify the authenticity of the target without unfolding it.",
            "evidence": clean_host
        })

    # 5. Suspicious TLD
    domain_parts = clean_host.split(".")
    if len(domain_parts) >= 2:
        tld = domain_parts[-1]
        if tld in SUSPICIOUS_TLDS:
            indicators.append({
                "id": "url_suspicious_tld",
                "name": f"High-Risk Top-Level Domain (.{tld})",
                "severity": "medium",
                "category": "Domain Reputation",
                "weight": 20,
                "description": f"The domain uses the '.{tld}' extension, which has a statistically high correlation with disposable spam and phishing domains.",
                "why_it_matters": "Cheap, unvetted TLDs are heavily leveraged by cybercriminals for short-lived phishing campaigns.",
                "evidence": f".{tld}"
            })

    # 6. Embedded User Authentication Trick (URL with '@')
    if "@" in parsed.netloc:
        indicators.append({
            "id": "url_userinfo_at_symbol",
            "name": "Misleading '@' Symbol in URL Authority",
            "severity": "high",
            "category": "Deceptive Structure",
            "weight": 40,
            "description": "The URL contains an '@' character before the host.",
            "why_it_matters": "Browsers interpret everything before '@' as username credentials, while the actual web request goes to the host after '@'. Attackers use this to display 'trusted-bank.com@malicious-site.com'.",
            "evidence": parsed.netloc
        })

    # 7. Brand Impersonation in Subdomains or Path
    for brand in TARGET_BRANDS:
        if brand in full_str:
            legit_domains = LEGITIMATE_BRAND_DOMAINS.get(brand, [f"{brand}.com"])
            # Check if actual domain matches legitimate domain
            is_legit = any(clean_host == ld or clean_host.endswith(f".{ld}") for ld in legit_domains)
            if not is_legit:
                # Brand is mentioned in the host or subdomain, but it's not the legit brand domain!
                if brand in clean_host:
                    indicators.append({
                        "id": f"url_brand_impersonation_{brand}",
                        "name": f"Deceptive Brand Keyword '{brand.title()}' in Untrusted Host",
                        "severity": "high",
                        "category": "Brand Impersonation",
                        "weight": 40,
                        "description": f"The hostname contains '{brand}', but does not belong to the authentic {brand.title()} domain hierarchy.",
                        "why_it_matters": f"Attackers commonly register misleading domain combinations like '{brand}-security-update' or 'verify-{brand}' to deceive victims.",
                        "evidence": clean_host
                    })
                    break

    # 8. Excessive Subdomains (Domain Typosquatting / Cloaking)
    if len(domain_parts) > 4:
        indicators.append({
            "id": "url_excessive_subdomains",
            "name": "Excessive Subdomain Nesting",
            "severity": "medium",
            "category": "Deceptive Structure",
            "weight": 20,
            "description": f"The URL has {len(domain_parts)} domain parts, indicating deep subdomain hierarchy.",
            "why_it_matters": "Deep subdomain chains often push the real destination domain out of sight on mobile screens or attempt to simulate legitimate company domains.",
            "evidence": clean_host
        })

    # 9. Excessive Hyphens in Hostname
    hyphen_count = clean_host.count("-")
    if hyphen_count >= 3:
        indicators.append({
            "id": "url_excessive_hyphens",
            "name": "Excessive Hyphens in Domain Name",
            "severity": "medium",
            "category": "Host Deception",
            "weight": 20,
            "description": f"The domain contains {hyphen_count} hyphens.",
            "why_it_matters": "Phishing domains frequently chain together hyphenated keywords (e.g. 'account-update-login-security.com') to look authoritative.",
            "evidence": clean_host
        })

    # 10. Suspicious Keywords in Path or Query
    suspicious_path_keywords = [
        "login", "signin", "verify", "secure", "account", "banking",
        "wallet", "password", "credential", "auth", "confirm", "recovery"
    ]
    detected_path_keywords = [k for k in suspicious_path_keywords if k in path or k in query]
    if detected_path_keywords and clean_host not in URL_SHORTENERS:
        # If combined with suspicious TLD or brand or non-https, this elevates suspicion
        indicators.append({
            "id": "url_sensitive_action_keyword",
            "name": f"Sensitive Action Keyword in URL Path ({', '.join(detected_path_keywords[:3])})",
            "severity": "low",
            "category": "Sensitive Flow",
            "weight": 10,
            "description": f"The URL targets an authentication or account recovery workflow ('{detected_path_keywords[0]}').",
            "why_it_matters": "Phishing sites often mimic login and verification pages to harvest credentials.",
            "evidence": path[:80]
        })

    # 11. Suspicious Port Number
    if parsed.port and parsed.port not in (80, 443):
        indicators.append({
            "id": "url_unusual_port",
            "name": f"Non-Standard Port ({parsed.port})",
            "severity": "medium",
            "category": "Network Anomaly",
            "weight": 25,
            "description": f"The web request is addressed to custom port {parsed.port} rather than standard web ports 80/443.",
            "why_it_matters": "Unusual ports are frequently used for temporary command-and-control servers or bypass hosting filters.",
            "evidence": f":{parsed.port}"
        })

    return normalized, indicators
