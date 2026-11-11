# -*- coding: utf-8 -*-
"""
Verification Script for ST-1.1A: Auth API, OTP delivery, session cookies, and lockout protection
"""
import urllib.request
import urllib.error
import json

BASE_URL = "http://localhost:3000"

def make_request(path, data=None, method="GET", headers=None):
    if headers is None:
        headers = {}
    url = f"{BASE_URL}{path}"
    req_data = json.dumps(data).encode("utf-8") if data is not None else None
    if data is not None:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            cookie = resp.headers.get("Set-Cookie", "")
            return resp.status, json.loads(body), cookie
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body), ""
        except:
            return e.code, body, ""

def test_auth_api():
    print("=== Testing ST-1.1A: Auth API & Token Security ===")
    
    # 1. Test Send OTP
    test_phone = "01711409821"
    status, res, _ = make_request("/api/auth/otp", {
        "action": "send",
        "target": test_phone,
        "type": "phone"
    }, method="POST")
    print(f"1. Send OTP: Status={status}, success={res.get('success')}, demoCode={res.get('demoCode')}")
    assert status == 200, f"Expected 200, got {status}"
    demo_code = res.get("demoCode")
    assert demo_code and len(demo_code) == 6, "Expected 6-digit code"

    # 2. Test Invalid OTP verification
    status, res, _ = make_request("/api/auth/otp", {
        "action": "verify",
        "target": test_phone,
        "code": "000000",
        "type": "phone"
    }, method="POST")
    print(f"2. Invalid OTP: Status={status}, success={res.get('success')}, remaining={res.get('remainingAttempts')}")
    assert status == 401, f"Expected 401, got {status}"
    assert res.get("remainingAttempts") == 4, "Expected 4 attempts left"

    # 3. Test Valid OTP verification
    status, res, _ = make_request("/api/auth/otp", {
        "action": "verify",
        "target": test_phone,
        "code": demo_code,
        "type": "phone"
    }, method="POST")
    print(f"3. Valid OTP Verify: Status={status}, success={res.get('success')}")
    assert status == 200, f"Expected 200, got {status}"

    # 4. Test Login with OTP & Cookie issuance
    status, res, cookie = make_request("/api/auth/login", {
        "identifier": test_phone,
        "otp": "412736",
        "role": "PHARMACY_OWNER"
    }, method="POST")
    print(f"4. Login: Status={status}, success={res.get('success')}, token={res.get('token')[:20]}..., cookiePresent={'medgo_session' in cookie}")
    assert status == 200, f"Expected 200, got {status}"
    assert "medgo_session" in cookie, "Expected medgo_session cookie in Set-Cookie header"
    token = res.get("token")

    # 5. Test Session Retrieval (/api/auth/me) with Cookie
    cookie_val = cookie.split(";")[0]
    status, res, _ = make_request("/api/auth/me", method="GET", headers={"Cookie": cookie_val})
    print(f"5. Session /me: Status={status}, user={res.get('user', {}).get('fullName')}, pharmacy={res.get('pharmacy', {}).get('tradeName')}")
    assert status == 200, f"Expected 200, got {status}"
    assert res.get("user", {}).get("fullName"), "Expected user fullName"

    # 6. Test Lockout after 5 incorrect attempts on a separate number
    lock_phone = "01799887766"
    make_request("/api/auth/otp", {"action": "send", "target": lock_phone, "type": "phone"}, method="POST")
    for i in range(5):
        s, r, _ = make_request("/api/auth/otp", {"action": "verify", "target": lock_phone, "code": "999999", "type": "phone"}, method="POST")
    
    print(f"6. Lockout Test: Status={s}, isLocked={r.get('isLocked')}")
    assert s == 429, f"Expected 429 Locked, got {s}"
    assert r.get("isLocked") == True, "Expected isLocked == True"

    print("\n>>> ALL ST-1.1A VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    test_auth_api()
