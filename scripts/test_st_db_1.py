#!/usr/bin/env python3
"""
MedGo ST-DB-1 Verification Test Suite
Tests unified analytics aggregation API and activities stream
"""

import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://localhost:3000"

def run_tests():
    print("=" * 70)
    print("Starting ST-DB-1: Dashboard Backend Aggregation API & Activities Stream")
    print("=" * 70)

    # 1. Test 401 Unauthorized when no credentials provided
    print("\n[Test 1] Verifying 401 Unauthorized without token...")
    req = urllib.request.Request(f"{BASE_URL}/api/dashboard/analytics")
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"FAILED: Expected 401, got {resp.getcode()}")
            return False
    except urllib.error.HTTPError as e:
        if e.code == 401:
            print("PASSED: 401 returned as expected for unauthenticated request.")
        else:
            print(f"FAILED: Unexpected status code: {e.code}")
            return False

    # 2. Login as Pharmacy Owner (Owner Role)
    print("\n[Test 2] Authenticating as Pharmacy Owner...")
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
        assert res["success"] is True, "Login failed"
        owner_token = res.get("token") or res.get("data", {}).get("token")
        print(f"PASSED: Authenticated successfully. Token: {owner_token[:15]}...")

    owner_headers = {
        "Authorization": f"Bearer {owner_token}",
        "Cookie": cookies,
        "Content-Type": "application/json"
    }

    # 3. Query Default Dashboard Analytics (Monthly, All Companies, Purchase)
    print("\n[Test 3] Verifying 5 Core Contract Nodes in Default Analytics Response...")
    req = urllib.request.Request(f"{BASE_URL}/api/dashboard/analytics", headers=owner_headers)
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        assert res["success"] is True, f"Request failed: {res}"
        data = res["data"]
        
        # Verify 5 Core Nodes
        for node in ["overviewCards", "filters", "barChart", "lineChart", "recentActivities"]:
            assert node in data, f"Missing core node: {node}"
        print("PASSED: All 5 core nodes present in response.")

        # Verify Overview Cards
        cards = data["overviewCards"]
        assert "totalPurchase" in cards, "Missing totalPurchase card"
        assert "totalSales" in cards, "Missing totalSales card"
        assert "outstandingBalance" in cards, "Missing outstandingBalance card"
        assert "inventory" in cards, "Missing inventory card"

        assert cards["totalPurchase"]["amount"] is not None and cards["totalPurchase"]["amount"] > 0
        assert cards["totalSales"]["isAvailable"] is False, "totalSales should be in POS Standby mode"
        assert cards["outstandingBalance"]["amount"] is not None
        assert cards["inventory"]["totalStockItems"] > 0
        print(f"PASSED: Overview cards populated with real DB figures: Total Purchase = ৳{cards['totalPurchase']['amount']:,}, Outstanding = ৳{cards['outstandingBalance']['amount']:,}, Stock Items = {cards['inventory']['totalStockItems']}")

    # 4. Test Multi-Period Filtering (daily, weekly, monthly, yearly, custom)
    print("\n[Test 4] Verifying Date Horizon Filtering...")
    periods = [
        ("daily", "Today"),
        ("weekly", "Last 7 Days"),
        ("monthly", "This Month"),
        ("yearly", "This Year"),
    ]
    for p_key, p_label in periods:
        req = urllib.request.Request(f"{BASE_URL}/api/dashboard/analytics?period={p_key}", headers=owner_headers)
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            assert res["data"]["filters"]["label"] == p_label, f"Expected {p_label}, got {res['data']['filters']['label']}"
            print(f"  - Period '{p_key}' correctly resolved to '{p_label}'")
    
    # Custom Range
    req = urllib.request.Request(
        f"{BASE_URL}/api/dashboard/analytics?period=custom&startDate=2026-10-01T00:00:00Z&endDate=2026-11-01T00:00:00Z",
        headers=owner_headers
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        assert res["data"]["filters"]["label"] == "Custom Range"
        print("  - Custom Range correctly resolved to 'Custom Range'")
    print("PASSED: Date Horizon Filtering verified.")

    # 5. Test Dynamic Bar Chart Types
    print("\n[Test 5] Verifying Dynamic Bar Chart Datasets across Analytics Types...")
    chart_types = [
        ("purchase", "Purchase Analytics"),
        ("company_purchase", "Company-wise Purchase Distribution"),
        ("medicine_purchase", "Medicine-wise Purchase Ranking"),
    ]
    for c_type, expected_title in chart_types:
        req = urllib.request.Request(f"{BASE_URL}/api/dashboard/analytics?type={c_type}", headers=owner_headers)
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            bc = res["data"]["barChart"]
            assert bc["title"] == expected_title, f"Expected {expected_title}, got {bc['title']}"
            assert len(bc["categories"]) > 0, f"Expected categories for {c_type}"
            assert len(bc["series"][0]["data"]) == len(bc["categories"]), "Series data length mismatch"
            print(f"  - Type '{c_type}' correctly generated: title='{bc['title']}', categories={bc['categories'][:3]}")
    print("PASSED: Dynamic Bar Chart datasets verified.")

    # 6. Test Line Chart Multi-Series Structure
    print("\n[Test 6] Verifying Line Chart Multi-Series Structure...")
    req = urllib.request.Request(f"{BASE_URL}/api/dashboard/analytics", headers=owner_headers)
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        lc = res["data"]["lineChart"]
        assert len(lc["lines"]) == 2, f"Expected 2 lines, got {len(lc['lines'])}"
        line_names = [l["name"] for l in lc["lines"]]
        assert "Purchase Spend" in line_names
        assert "Retail Sales (POS)" in line_names
        print(f"PASSED: Line chart contains both series: {line_names}")

    # 7. Test Unified Recent Activities Stream
    print("\n[Test 7] Verifying Recent Activities Stream...")
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        acts = res["data"]["recentActivities"]
        assert len(acts) > 0, "Expected at least one activity item"
        for act in acts:
            assert act["type"] in ["PURCHASE", "ORDER", "PAYMENT"], f"Invalid activity type: {act['type']}"
            assert act["referenceId"], "Missing referenceId"
            assert act["entityName"], "Missing entityName"
            assert act["status"], "Missing status"
            assert act["timestamp"], "Missing timestamp"
        # Verify chronologically descending
        timestamps = [a["timestamp"] for a in acts]
        assert timestamps == sorted(timestamps, reverse=True), "Activities not sorted descending by timestamp"
        print(f"PASSED: {len(acts)} activities chronologically sorted with types {[a['type'] for a in acts[:4]]}")

    # 8. Test Multi-Tenant Isolation for Sales Rep (MPO)
    print("\n[Test 8] Verifying Multi-Tenant Isolation for MPO Role...")
    mpo_login = json.dumps({
        "identifier": "01819001122",
        "password": "Password123!",
        "role": "SALES_REP"
    }).encode("utf-8")
    mpo_req = urllib.request.Request(
        f"{BASE_URL}/api/auth/login",
        data=mpo_login,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(mpo_req) as resp:
        mpo_cookies = resp.headers.get("Set-Cookie", "")
        res = json.loads(resp.read().decode("utf-8"))
        mpo_token = res.get("token") or res.get("data", {}).get("token")
    
    mpo_headers = {"Authorization": f"Bearer {mpo_token}", "Cookie": mpo_cookies, "Content-Type": "application/json"}

    # Attempt to query Square Pharmaceuticals with Beximco credentials -> must 403
    mpo_violating_req = urllib.request.Request(
        f"{BASE_URL}/api/dashboard/analytics?companyId=comp-square",
        headers=mpo_headers
    )
    try:
        with urllib.request.urlopen(mpo_violating_req) as resp:
            print("FAILED: Expected 403 for cross-tenant query, but succeeded")
            return False
    except urllib.error.HTTPError as e:
        if e.code == 403:
            print("PASSED: 403 TENANT_ISOLATION_VIOLATION correctly enforced when MPO queries another company.")
        else:
            print(f"FAILED: Unexpected status code: {e.code}")
            return False

    print("\n" + "=" * 70)
    print("ALL ST-DB-1 TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)
    return True

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
