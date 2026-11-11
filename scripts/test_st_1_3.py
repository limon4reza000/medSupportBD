# -*- coding: utf-8 -*-
"""
Verification Script for ST-1.3: Pharmacy Compliance Module
"""
import urllib.request
import urllib.error
import json

BASE_URL = "http://localhost:3000"

def make_request(path, data=None, method="GET"):
    headers = {}
    if data is not None:
        headers["Content-Type"] = "application/json"
    req_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(f"{BASE_URL}{path}", data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except:
            return e.code, body

def test_st_1_3():
    print("=== Testing ST-1.3: Pharmacy Compliance Module ===")

    # 1. Fetch Pharmacy Profile with Credit Progress Info
    s, res = make_request("/api/pharmacies?id=pharm-01")
    print(f"1. Pharmacy Profile: Status={s}, name={res.get('pharmacy', {}).get('tradeName')}, credit={res.get('pharmacy', {}).get('creditLimit')}")
    assert s == 200, f"Expected 200, got {s}"
    pharmacy = res.get("pharmacy", {})
    assert pharmacy.get("availableCredit") is not None, "availableCredit missing"
    assert pharmacy.get("usedCreditPercent") is not None, "usedCreditPercent missing"
    assert pharmacy.get("creditStatus") in ["ACTIVE", "WARNING"], "creditStatus invalid"

    # 2. Test Invalid DGDA License Format (Must return 422)
    s, res = make_request("/api/pharmacies", {
        "id": "pharm-01",
        "drugLicenseNo": "INVALID_LICENSE_123"
    }, method="PUT")
    print(f"2. Invalid License Format: Status={s}, error={res.get('error')}")
    assert s == 422, f"Expected 422 for invalid license, got {s}"
    assert res.get("code") == "INVALID_DGDA_LICENSE_FORMAT"

    # 3. Test Invalid Coordinates Out of Bangladesh Bounds (Must return 422)
    s, res = make_request("/api/pharmacies", {
        "id": "pharm-01",
        "latitude": 51.5074,  # London
        "longitude": -0.1278
    }, method="PUT")
    print(f"3. Out of Bounds Coordinates: Status={s}, error={res.get('error')}")
    assert s == 422, f"Expected 422 for coordinates outside Bangladesh, got {s}"
    assert res.get("code") == "COORDINATES_OUT_OF_BOUNDS"

    # 4. Test Valid DGDA License and Bangladesh GPS Coordinates Update (Must return 200 OK)
    s, res = make_request("/api/pharmacies", {
        "id": "pharm-01",
        "drugLicenseNo": "DL-DHK-2024-9988",
        "pharmacistName": "Md. Rafiqul Islam, B.Pharm",
        "latitude": 23.74652,
        "longitude": 90.37605
    }, method="PUT")
    print(f"4. Valid Update: Status={s}, message={res.get('message')}")
    assert s == 200, f"Expected 200, got {s}"
    updated = res.get("pharmacy", {})
    assert updated.get("drugLicenseNo") == "DL-DHK-2024-9988"
    assert updated.get("latitude") == 23.74652
    assert updated.get("isLocationVerified") == True

    # 5. Verify UI File Integrity
    with open("app/page.tsx", "r", encoding="utf-8") as f:
        page = f.read()
    assert "Wholesale Credit Facilities" in page, "Credit progress card missing in page.tsx"
    assert "DGDA Compliance & Geolocation" in page, "Compliance edit modal missing in page.tsx"
    print("5. UI Verification: Credit Progress Bar and Geolocation Edit modal verified in page.tsx")

    print("\n>>> ALL ST-1.3 VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    test_st_1_3()
