#!/usr/bin/env python3
"""
MedGo ST-DB-2 Verification Test Suite
Verifies Four Overview Cards & Recent Activities Stream Integration
"""

import os
import sys
import json
import urllib.request
import subprocess

BASE_URL = "http://localhost:3000"

def test_component_files():
    print("\n[Test 1] Inspecting component file exports and DOM testids...")
    files = [
        "components/dashboard/OverviewCards.tsx",
        "components/dashboard/RecentActivitiesStream.tsx",
        "components/dashboard/BusinessAnalyticsScreen.tsx"
    ]
    for f in files:
        assert os.path.exists(f), f"File {f} not found!"
        with open(f, "r", encoding="utf-8") as fp:
            content = fp.read()
            assert len(content) > 100, f"File {f} is empty or incomplete"
        print(f"  - File {f} exists and is verified.")

    # Check OverviewCards testids
    with open("components/dashboard/OverviewCards.tsx", "r", encoding="utf-8") as fp:
        oc = fp.read()
        for tid in ["overview-cards-container", "card-total-purchase", "card-total-sales", "card-outstanding-balance", "card-inventory"]:
            assert tid in oc, f"Missing testid {tid} in OverviewCards.tsx"
    print("PASSED: OverviewCards DOM testids verified.")

    # Check RecentActivitiesStream testids and types
    with open("components/dashboard/RecentActivitiesStream.tsx", "r", encoding="utf-8") as fp:
        ras = fp.read()
        assert "recent-activities-section" in ras, "Missing testid recent-activities-section"
        assert "PURCHASE" in ras and "PAYMENT" in ras and "ORDER" in ras, "Missing activity types handling"
    print("PASSED: RecentActivitiesStream testids and activity types verified.")

def test_api_overview_and_activities():
    print("\n[Test 2] Authenticating as Pharmacy Owner & Verifying API Contract...")
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

    req = urllib.request.Request(f"{BASE_URL}/api/dashboard/analytics?period=monthly", headers=headers)
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        assert res["success"] is True, "API call failed"
        data = res["data"]

        # Test Overview Cards schema
        cards = data.get("overviewCards")
        assert cards is not None, "overviewCards missing from data"
        assert cards["totalPurchase"]["amount"] > 0, "totalPurchase amount must be > 0"
        assert cards["totalPurchase"]["periodLabel"] != "", "periodLabel missing"
        assert cards["totalSales"]["isAvailable"] is False, "totalSales must be in POS Standby mode"
        assert cards["outstandingBalance"]["amount"] > 0, "outstandingBalance must be > 0"
        assert cards["outstandingBalance"]["creditLimit"] > 0, "creditLimit must be > 0"
        assert cards["inventory"]["totalStockItems"] > 0, "inventory totalStockItems must be > 0"
        print(f"PASSED: Overview cards data verified: Purchase=৳{cards['totalPurchase']['amount']:,}, Outstanding=৳{cards['outstandingBalance']['amount']:,}, SKUs={cards['inventory']['totalStockItems']}")

        # Test Recent Activities schema
        activities = data.get("recentActivities")
        assert activities is not None and len(activities) > 0, "recentActivities missing or empty"
        for act in activities:
            assert act["type"] in ["PURCHASE", "ORDER", "PAYMENT"], f"Invalid type: {act['type']}"
            assert act["referenceId"], "Missing referenceId"
            assert act["entityName"], "Missing entityName"
            assert act["timestamp"], "Missing timestamp"
        print(f"PASSED: {len(activities)} recent activities verified with types {[a['type'] for a in activities[:3]]}.")

def test_typescript():
    print("\n[Test 3] Running full TypeScript compile check...")
    res = subprocess.run(["npx", "tsc", "--noEmit"], capture_output=True, text=True, shell=True)
    assert res.returncode == 0, f"TypeScript errors:\n{res.stdout}\n{res.stderr}"
    print("PASSED: TypeScript compiles with 0 errors.")

def main():
    print("=" * 70)
    print("Starting ST-DB-2: Four Overview Cards & Recent Activities Stream")
    print("=" * 70)
    try:
        test_component_files()
        test_api_overview_and_activities()
        test_typescript()
        print("\n" + "=" * 70)
        print("ALL ST-DB-2 TESTS PASSED SUCCESSFULLY!")
        print("=" * 70)
        return True
    except Exception as e:
        print(f"\nFAILED: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
