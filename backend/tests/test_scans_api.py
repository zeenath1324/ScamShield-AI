import pytest

def get_auth_token(client, email, name="Test User"):
    reg = client.post("/api/auth/register", json={
        "full_name": name,
        "email": email,
        "password": "Password123!"
    })
    return reg.json()["access_token"]

def test_analyze_url_api_persistence_and_stats(client):
    token = get_auth_token(client, "user1@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. New user stats should be 0
    stats0 = client.get("/api/dashboard/stats", headers=headers)
    assert stats0.status_code == 200
    assert stats0.json()["total_scans"] == 0
    assert len(stats0.json()["recent_scans"]) == 0

    # 2. Analyze a suspicious URL
    scan_res = client.post("/api/scans/analyze", json={
        "scan_type": "url",
        "url": "http://192.168.1.55/update"
    }, headers=headers)
    assert scan_res.status_code == 201
    scan_data = scan_res.json()
    assert scan_data["risk_score"] > 30
    assert scan_data["scan_type"] == "url"
    scan_id = scan_data["id"]

    # 3. Check dashboard stats incremented
    stats1 = client.get("/api/dashboard/stats", headers=headers)
    assert stats1.status_code == 200
    assert stats1.json()["total_scans"] == 1
    assert len(stats1.json()["recent_scans"]) == 1

    # 4. Fetch single scan
    get_res = client.get(f"/api/scans/{scan_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == scan_id

def test_user_scan_isolation(client):
    token_a = get_auth_token(client, "alice_iso@example.com")
    token_b = get_auth_token(client, "bob_iso@example.com")
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Alice creates a scan
    alice_scan = client.post("/api/scans/analyze", json={
        "scan_type": "url",
        "url": "https://suspicious-test.xyz"
    }, headers=headers_a).json()
    scan_id = alice_scan["id"]

    # Bob tries to view Alice's scan -> 404 unauthorized
    bob_view = client.get(f"/api/scans/{scan_id}", headers=headers_b)
    assert bob_view.status_code == 404

    # Bob tries to delete Alice's scan -> 404 unauthorized
    bob_del = client.delete(f"/api/scans/{scan_id}", headers=headers_b)
    assert bob_del.status_code == 404

    # Bob's history list should be empty
    bob_list = client.get("/api/scans", headers=headers_b).json()
    assert bob_list["total"] == 0

def test_input_validation_empty_and_excessive(client):
    token = get_auth_token(client, "val_user@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Empty URL
    res_empty_url = client.post("/api/scans/analyze", json={
        "scan_type": "url",
        "url": ""
    }, headers=headers)
    assert res_empty_url.status_code == 422

    # Empty Message
    res_empty_msg = client.post("/api/scans/analyze", json={
        "scan_type": "message",
        "message": ""
    }, headers=headers)
    assert res_empty_msg.status_code == 422

    # Excessive message length (> 15000 characters)
    huge_msg = "A" * 16000
    res_huge = client.post("/api/scans/analyze", json={
        "scan_type": "message",
        "message": huge_msg
    }, headers=headers)
    assert res_huge.status_code == 422

def test_filter_sort_and_deletion(client):
    token = get_auth_token(client, "filter_user@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Create 2 scans: 1 clean URL, 1 urgent high risk message
    client.post("/api/scans/analyze", json={
        "scan_type": "url",
        "url": "https://example.com/safe"
    }, headers=headers)

    s2 = client.post("/api/scans/analyze", json={
        "scan_type": "message",
        "message": "URGENT: Enter your 6-digit code OTP immediately to prevent account suspension!"
    }, headers=headers).json()

    # Filter by risk_category=high
    res_high = client.get("/api/scans?risk_category=high", headers=headers).json()
    assert res_high["total"] == 1
    assert res_high["items"][0]["id"] == s2["id"]

    # Filter by scan_type=url
    res_url = client.get("/api/scans?scan_type=url", headers=headers).json()
    assert res_url["total"] == 1
    assert res_url["items"][0]["scan_type"] == "url"

    # Delete single scan
    del_res = client.delete(f"/api/scans/{s2['id']}", headers=headers)
    assert del_res.status_code == 200

    # Clear all remaining
    clear_res = client.delete("/api/scans", headers=headers)
    assert clear_res.status_code == 200

    total_left = client.get("/api/scans", headers=headers).json()["total"]
    assert total_left == 0
