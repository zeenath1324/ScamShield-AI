import httpx
import json

BASE_URL = "http://127.0.0.1:8000/api"

def run_verification():
    client = httpx.Client(timeout=10.0)
    print("[1] Testing Root & Health Check...")
    r = client.get("http://127.0.0.1:8000/")
    assert r.status_code == 200
    print("    Health:", r.json())

    # User registration
    user_email = "test.operator@scamshield.ai"
    print(f"\n[2] Registering User: {user_email}...")
    reg_res = client.post(f"{BASE_URL}/auth/register", json={
        "full_name": "Chief Security Officer",
        "email": user_email,
        "password": "SuperSecretPassword123!"
    })
    if reg_res.status_code == 400:
        # Already registered in dev database, let's login
        print("    User already exists, proceeding to login...")
        login_res = client.post(f"{BASE_URL}/auth/login", json={
            "email": user_email,
            "password": "SuperSecretPassword123!"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token = login_res.json()["access_token"]
    else:
        assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
        token = reg_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    print(f"    Token acquired: {token[:20]}...")

    # Fetch current user
    me_res = client.get(f"{BASE_URL}/auth/me", headers=headers)
    assert me_res.status_code == 200
    user_data = me_res.json()
    print(f"    Authenticated as: {user_data['full_name']} ({user_data['email']}), role={user_data['role']}")

    # Initial stats check
    stats_res = client.get(f"{BASE_URL}/dashboard/stats", headers=headers)
    assert stats_res.status_code == 200
    print(f"    Current user total scans: {stats_res.json()['total_scans']}")

    # Scan 1: Phishing URL analysis
    print("\n[3] Scanning Deceptive URL (http://paypal-security-verification.xyz/login)...")
    s1 = client.post(f"{BASE_URL}/scans/analyze", json={
        "scan_type": "url",
        "url": "http://paypal-security-verification.xyz/login"
    }, headers=headers)
    assert s1.status_code == 201, f"URL scan failed: {s1.text}"
    s1_data = s1.json()
    print(f"    Scan #1: Score={s1_data['risk_score']}/100, Category={s1_data['risk_category']}")
    print(f"    Indicators Triggered: {[i['name'] for i in s1_data['detected_indicators']]}")

    # Scan 2: Urgent SMS / Email with OTP harvesting
    print("\n[4] Scanning Urgent Message with OTP Harvesting...")
    urgent_msg = (
        "URGENT: Your bank account will be suspended within 24 hours due to suspicious transactions. "
        "Please reply immediately and verify your 6-digit code OTP to confirm ownership!"
    )
    s2 = client.post(f"{BASE_URL}/scans/analyze", json={
        "scan_type": "message",
        "subject": "Action Required: Account Suspended",
        "message": urgent_msg
    }, headers=headers)
    assert s2.status_code == 201, f"Message scan failed: {s2.text}"
    s2_data = s2.json()
    print(f"    Scan #2: Score={s2_data['risk_score']}/100, Category={s2_data['risk_category']}")
    print(f"    Indicators Triggered: {[i['name'] for i in s2_data['detected_indicators']]}")

    # Scan 3: Low-risk legitimate message
    print("\n[5] Scanning Low-Risk Clean Message...")
    clean_msg = "Hello team, please find the quarterly report attached for tomorrow's review meeting. Best regards."
    s3 = client.post(f"{BASE_URL}/scans/analyze", json={
        "scan_type": "message",
        "message": clean_msg
    }, headers=headers)
    assert s3.status_code == 201
    s3_data = s3.json()
    print(f"    Scan #3: Score={s3_data['risk_score']}/100, Category={s3_data['risk_category']}")

    # Re-check Dashboard stats
    print("\n[6] Verifying Live Dashboard Database Stats...")
    stats_updated = client.get(f"{BASE_URL}/dashboard/stats", headers=headers)
    assert stats_updated.status_code == 200
    st = stats_updated.json()
    print(f"    Total Scans in DB: {st['total_scans']}")
    print(f"    High Risk: {st['high_risk_count']}, Suspicious: {st['suspicious_count']}, Low: {st['low_risk_count']}")
    assert st['total_scans'] >= 3

    # Check History List & Filtering
    print("\n[7] Verifying History Search & Filtering...")
    hist_high = client.get(f"{BASE_URL}/scans?risk_category=high", headers=headers)
    assert hist_high.status_code == 200
    print(f"    High risk items in history: {hist_high.json()['total']}")

    hist_url = client.get(f"{BASE_URL}/scans?scan_type=url", headers=headers)
    assert hist_url.status_code == 200
    print(f"    URL scans in history: {hist_url.json()['total']}")

    # If first user is admin, test admin metrics
    if user_data['role'] == 'admin':
        print("\n[8] Verifying Admin Console Metrics...")
        admin_res = client.get(f"{BASE_URL}/admin/metrics", headers=headers)
        assert admin_res.status_code == 200
        print("    Admin Metrics:", admin_res.json())

    print("\n>>> ALL LIVE WORKFLOW TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    run_verification()
