# -*- coding: utf-8 -*-
"""
Verification Test Suite for ST-1.11A:
Dashboard Analytics Aggregation Engine & Multi-Tenant Scoping
"""
import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://localhost:3000"

def login(identifier, password, role):
    payload = json.dumps({"identifier": identifier, "password": password, "role": role}).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}/api/auth/login",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        cookies = resp.headers.get("Set-Cookie", "")
        body = json.loads(resp.read().decode("utf-8"))
        token = body.get("data", {}).get("token")
        return token, cookies

def main():
    print("=== Testing ST-1.11A: Dashboard Analytics Aggregation Engine ===")

    # 1. Test Unauthenticated Access
    print("1. Unauthenticated Access:")
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/dashboard/analytics")
        urllib.request.urlopen(req)
        print("FAIL: Expected 401 Unauthorized")
        sys.exit(1)
    except urllib.error.HTTPError as e:
        print(f"   Status={e.code} (Correctly rejected)")
        assert e.code == 401, f"Expected 401, got {e.code}"

    # 2. Login as Pharmacy Owner
    owner_token, owner_cookies = login("01711409821", "DemoPass@123", "PHARMACY_OWNER")
    owner_headers = {"Cookie": owner_cookies, "Authorization": f"Bearer {owner_token}"}

    # 2. Test Invalid Date Range (startDate > endDate)
    print("2. Invalid Date Range Query:")
    try:
        url = f"{BASE_URL}/api/dashboard/analytics?period=custom&startDate=2026-12-01T00:00:00Z&endDate=2026-11-01T00:00:00Z"
        req = urllib.request.Request(url, headers=owner_headers)
        urllib.request.urlopen(req)
        print("FAIL: Expected 422 Unprocessable Entity")
        sys.exit(1)
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode("utf-8"))
        print(f"   Status={e.code}, error={body.get('error')}")
        assert e.code == 422, f"Expected 422, got {e.code}"

    # 3. Test Standard Period Aggregation (This Month)
    print("3. Pharmacy Owner Standard Period Aggregation (This Month):")
    req = urllib.request.Request(f"{BASE_URL}/api/dashboard/analytics?period=this_month", headers=owner_headers)
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        body = json.loads(resp.read().decode("utf-8"))
        data = body["data"]

        fin = data["financialOverview"]
        print(f"   Total Purchase This Month: ৳{fin['totalPurchasePeriod']}")
        print(f"   Total Purchase Year: ৳{fin['totalPurchaseYear']}")
        print(f"   Outstanding Balance: ৳{fin['totalOutstandingBalance']}")
        print(f"   Available Credit: ৳{fin['availableCreditLimit']}")
        assert fin["totalPurchasePeriod"] > 0
        assert fin["totalPurchaseYear"] >= fin["totalPurchasePeriod"]
        assert fin["totalOutstandingBalance"] > 0
        assert fin["availableCreditLimit"] > 0

        # Verify Trailing 6 Months
        months = data["purchaseAnalytics"]["monthlyPurchases"]
        print(f"   Trailing Months: {[m['month'] + ':' + str(m['amount']) for m in months]}")
        assert len(months) == 6

        # Verify Company Breakdown
        companies = data["purchaseAnalytics"]["companyPurchases"]
        print(f"   Company Breakdown: {[c['companyName'] + ':' + str(c['percentage']) + '%' for c in companies]}")
        assert len(companies) > 0

        # Verify Top Medicines
        top_meds = data["purchaseAnalytics"]["topPurchasedMedicines"]
        print(f"   Top Medicines: {[m['name'] + ' (' + str(m['boxes']) + ' boxes)' for m in top_meds]}")
        assert len(top_meds) > 0

        # Verify Inventory Insights
        inv = data["inventoryInsights"]
        print(f"   Inventory: Low={inv['lowStockCount']}, Out={inv['outOfStockCount']}, NearExpiry={inv['nearExpiryCount']}")
        assert inv["totalMedicinesCount"] > 0

        # Verify Orders Pipeline
        orders = data["orderOverview"]
        print(f"   Orders Pipeline: Total={orders['totalOrders']}, ByStatus={orders['byStatus']}")
        assert orders["totalOrders"] > 0

        # Verify Sales Analytics Distinction (Unlinked POS)
        sales = data["salesAnalytics"]
        print(f"   Sales Analytics: Available={sales['isAvailable']}, Reason={sales['reason']}")
        assert sales["isAvailable"] is False
        assert sales["reason"] == "POS_MODULE_UNLINKED"

    # 4. Test Company Filter
    print("4. Company Filter Scoping (Beximco):")
    req = urllib.request.Request(f"{BASE_URL}/api/dashboard/analytics?period=this_month&companyId=Beximco", headers=owner_headers)
    with urllib.request.urlopen(req) as resp:
        body = json.loads(resp.read().decode("utf-8"))
        data = body["data"]
        companies = data["purchaseAnalytics"]["companyPurchases"]
        print(f"   Filtered Companies: {[c['companyName'] for c in companies]}")
        assert all("Beximco" in c["companyName"] for c in companies)

    # 5. Test Staff RBAC Privacy Masking
    print("5. Staff RBAC Privacy Masking:")
    staff_token, staff_cookies = login("01711998877", "DemoPass@123", "RETAIL_PHARMACY")
    staff_headers = {"Cookie": staff_cookies, "Authorization": f"Bearer {staff_token}"}

    req = urllib.request.Request(f"{BASE_URL}/api/dashboard/analytics?period=this_month", headers=staff_headers)
    with urllib.request.urlopen(req) as resp:
        body = json.loads(resp.read().decode("utf-8"))
        data = body["data"]
        fin = data["financialOverview"]
        print(f"   Staff Masked Purchase: {fin['totalPurchasePeriod']}")
        print(f"   Staff Masked Balance: {fin['totalOutstandingBalance']}")
        print(f"   Staff Masked Credit: {fin['availableCreditLimit']}")
        print(f"   Staff Masked Notice: {fin['maskedNotice']}")
        assert fin["totalPurchasePeriod"] is None
        assert fin["totalOutstandingBalance"] is None
        assert fin["availableCreditLimit"] is None
        assert data["rbac"]["financesMasked"] is True

        # Inventory insights should still be available to staff
        assert data["inventoryInsights"]["totalMedicinesCount"] > 0
        assert data["orderOverview"]["totalOrders"] > 0

    # 6. Test MPO Cross-Tenant Isolation
    print("6. MPO Cross-Tenant Isolation:")
    mpo_token, mpo_cookies = login("01711223344", "DemoPass@123", "SALES_REP")
    mpo_headers = {"Cookie": mpo_cookies, "Authorization": f"Bearer {mpo_token}"}

    try:
        # Beximco MPO attempting to query Square
        url = f"{BASE_URL}/api/dashboard/analytics?period=this_month&companyId=comp-square"
        req = urllib.request.Request(url, headers=mpo_headers)
        urllib.request.urlopen(req)
        print("FAIL: Expected 403 Forbidden for cross-company MPO query")
        sys.exit(1)
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode("utf-8"))
        print(f"   Status={e.code}, code={body.get('code')}")
        assert e.code == 403
        assert body.get("code") == "TENANT_ISOLATION_VIOLATION"

    print("\n>>> ALL ST-1.11A VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    main()
