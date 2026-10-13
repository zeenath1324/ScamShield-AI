import pytest
from app.core.security import verify_password, decode_access_token

def test_register_and_login_success(client):
    # Register
    reg_payload = {
        "full_name": "Alice Security",
        "email": "alice@example.com",
        "password": "StrongPassword123!"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "alice@example.com"
    assert data["user"]["full_name"] == "Alice Security"

    # Login
    login_payload = {
        "email": "alice@example.com",
        "password": "StrongPassword123!"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == "alice@example.com"

def test_register_duplicate_email(client):
    payload = {
        "full_name": "Bob Analyst",
        "email": "bob@example.com",
        "password": "SecurePassword987!"
    }
    res1 = client.post("/api/auth/register", json=payload)
    assert res1.status_code == 201

    # Duplicate attempt
    res2 = client.post("/api/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already registered" in res2.json()["detail"]

def test_login_invalid_password(client):
    payload = {
        "full_name": "Charlie Defender",
        "email": "charlie@example.com",
        "password": "CorrectPassword123!"
    }
    client.post("/api/auth/register", json=payload)

    # Bad login
    res = client.post("/api/auth/login", json={
        "email": "charlie@example.com",
        "password": "WrongPassword!"
    })
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]

def test_unauthorized_access(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401
    assert "Authentication required" in res.json()["detail"]

def test_authenticated_me_and_profile_update(client):
    reg = client.post("/api/auth/register", json={
        "full_name": "Dana Whitehat",
        "email": "dana@example.com",
        "password": "SecurePassword123!"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # GET /api/auth/me
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "dana@example.com"

    # Update profile
    patch_res = client.patch("/api/users/me", json={"full_name": "Dana Senior"}, headers=headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["full_name"] == "Dana Senior"
