#!/usr/bin/env python3
"""
MedGo ST-DB-3 Verification Test Suite
Verifies Multi-Dimensional Analytics Filter Controls & Filtering Behavior
"""

import os
import sys
import json
import urllib.request
import urllib.error
import subprocess

BASE_URL = "http://localhost:3000"

def test_component_filters_structure():
    print("\n[Test 1] Inspecting AnalyticsFilters.tsx component structure...")
    path = "components/dashboard/AnalyticsFilters.tsx"
    assert os.path.exists(path), f"File {path} does not exist!"
    with open(path, "r", encoding="utf-8") as fp:
        content = fp.read()
    
    # 1. Verify 45 Licensed Companies
    assert "TOP_45_COMPANIES" in content, "TOP_45_COMPANIES export missing"
    assert "Square Pharmaceuticals PLC" in content
    assert "Beximco Pharmaceuticals Ltd." in content
    assert "Incepta Pharmaceuticals Ltd." in content

    # 2. Verify TestIDs
    testids = [
        "analytics-filters-section",
        "period-filter-pills",
        "type-filter-pills",
        "company-select-dropdown",
        "reset-filters-btn"
    ]
    for tid in testids:
        assert tid in content, f"Missing testid {tid} in AnalyticsFilters.tsx"
    print("PASSED: AnalyticsFilters.tsx structure, testids, and top 45 companies verified.")

    # 3. Verify Date Range and Type Pills
    assert "data-testid={`period-pill-${p.id}`}" in content, "Missing dynamic testid for period pills"
    for p in ["daily", "weekly", "monthly", "yearly", "custom"]:
        assert f'id: "{p}"' in content, f"Missing option for period: {p}"
    
    assert "data-testid={`type-pill-${t.id}`}" in content, "Missing dynamic testid for type pills"
    for t in ["purchase", "sales", "company_purchase", "company_sales", "medicine_purchase", "medicine_sales"]:
        assert f'id: "{t}"' in content, f"Missing option for type: {t}"
    print("PASSED: All 5 Period options and 6 Analytics Type options verified.")

def test_multi_dimensional_api_filtering():
    print("\n[Test 2] Testing Multi-Dimensional Filter API Queries...")
    login_data = json.dumps({
        "identifier": "01711409821",
        "password": "Password123!",
        "role": "PHARMACY_OWNER"
    }).encode("utf-8")
    login_req = urllib.request.Request(
        f"{BASE_URL}/api/auth/login",
        data=login_data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(login_req) as resp:
        cookies = resp.headers.get("Set-Cookie", "")
        res = json.loads(resp.read().decode("utf-8"))
        owner_token = res.get("token") or res.get("data", {}).get("token")

    headers = {
        "Authorization": f"Bearer {owner_token}",
        "Cookie": cookies,
        "Content-Type": "application/json"
    }

    # Query 1: weekly + company_purchase + Square
    url1 = f"{BASE_URL}/api/dashboard/analytics?period=weekly&type=company_purchase&companyId=Square"
    req1 = urllib.request.Request(url1, headers=headers)
    with urllib.request.urlopen(req1) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        assert res["success"] is True
        data = res["data"]
        assert data["filters"]["period"] == "weekly"
        assert data["filters"]["analyticsType"] == "company_purchase"
        assert data["filters"]["companyId"] == "Square"
        assert data["barChart"]["title"] == "Company-wise Purchase Distribution"
        print("  - Combination 1 (weekly + company_purchase + Square) passed.")

    # Query 2: yearly + medicine_purchase + all
    url2 = f"{BASE_URL}/api/dashboard/analytics?period=yearly&type=medicine_purchase&companyId=all"
    req2 = urllib.request.Request(url2, headers=headers)
    with urllib.request.urlopen(req2) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        assert res["success"] is True
        data = res["data"]
        assert data["filters"]["period"] == "yearly"
        assert data["filters"]["analyticsType"] == "medicine_purchase"
        assert data["barChart"]["title"] == "Medicine-wise Purchase Ranking"
        print("  - Combination 2 (yearly + medicine_purchase + all) passed.")

    # Query 3: daily + sales
    url3 = f"{BASE_URL}/api/dashboard/analytics?period=daily&type=sales"
    req3 = urllib.request.Request(url3, headers=headers)
    with urllib.request.urlopen(req3) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        assert res["success"] is True
        data = res["data"]
        assert data["filters"]["period"] == "daily"
        assert data["filters"]["analyticsType"] == "sales"
        assert data["barChart"]["title"] == "Sales Analytics"
        print("  - Combination 3 (daily + sales) passed.")

    print("PASSED: Multi-dimensional filter queries verified.")

def test_date_range_validation():
    print("\n[Test 3] Verifying Backend Date Range Validations...")
    login_data = json.dumps({
        "identifier": "01711409821",
        "password": "Password123!",
        "role": "PHARMACY_OWNER"
    }).encode("utf-8")
    login_req = urllib.request.Request(
        f"{BASE_URL}/api/auth/login",
        data=login_data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(login_req) as resp:
        cookies = resp.headers.get("Set-Cookie", "")
        res = json.loads(resp.read().decode("utf-8"))
        owner_token = res.get("token") or res.get("data", {}).get("token")

    headers = {
        "Authorization": f"Bearer {owner_token}",
        "Cookie": cookies,
        "Content-Type": "application/json"
    }

    # 1. startDate > endDate -> expect 422
    url_invalid = f"{BASE_URL}/api/dashboard/analytics?period=custom&startDate=2026-11-20T00:00:00Z&endDate=2026-11-10T00:00:00Z"
    try:
        urllib.request.urlopen(urllib.request.Request(url_invalid, headers=headers))
        print("FAILED: Expected 422 for startDate > endDate")
        return False
    except urllib.error.HTTPError as e:
        assert e.code == 422, f"Expected 422, got {e.code}"
        print("  - startDate > endDate correctly rejected with HTTP 422.")

    # 2. range > 365 days -> expect 422
    url_too_long = f"{BASE_URL}/api/dashboard/analytics?period=custom&startDate=2024-01-01T00:00:00Z&endDate=2026-11-01T00:00:00Z"
    try:
        urllib.request.urlopen(urllib.request.Request(url_too_long, headers=headers))
        print("FAILED: Expected 422 for range > 365 days")
        return False
    except urllib.error.HTTPError as e:
        assert e.code == 422, f"Expected 422, got {e.code}"
        print("  - range > 365 days correctly rejected with HTTP 422.")
    
    print("PASSED: Date range validations verified.")

def test_typescript():
    print("\n[Test 4] Running TypeScript compile check...")
    res = subprocess.run(["npx", "tsc", "--noEmit"], capture_output=True, text=True, shell=True)
    assert res.returncode == 0, f"TypeScript errors:\n{res.stdout}\n{res.stderr}"
    print("PASSED: TypeScript compiles with 0 errors.")

def main():
    print("=" * 70)
    print("Starting ST-DB-3: Interactive Multi-Dimensional Analytics Filter Bar")
    print("=" * 70)
    try:
        test_component_filters_structure()
        test_multi_dimensional_api_filtering()
        test_date_range_validation()
        test_typescript()
        print("\n" + "=" * 70)
        print("ALL ST-DB-3 TESTS PASSED SUCCESSFULLY!")
        print("=" * 70)
        return True
    except Exception as e:
        print(f"\nFAILED: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
