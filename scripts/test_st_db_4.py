#!/usr/bin/env python3
"""
MedGo ST-DB-4 Verification Test Suite
Verifies Dynamic Business Analytics Bar Chart implementation and dynamic binding
"""

import os
import sys
import json
import urllib.request
import subprocess

BASE_URL = "http://localhost:3000"

def test_bar_chart_component():
    print("\n[Test 1] Inspecting DynamicBarChart component implementation...")
    path = "components/dashboard/DashboardCharts.tsx"
    assert os.path.exists(path), f"File {path} not found"
    with open(path, "r", encoding="utf-8") as fp:
        content = fp.read()

    assert "export function DynamicBarChart" in content
    assert 'data-testid="dynamic-bar-chart"' in content
    assert 'data-testid="dynamic-bar-chart-empty"' in content
    assert 'role="graphics-document"' in content
    assert 'rx="10"' in content
    assert "#205493" in content
    assert "bg-white" in content
    assert "hoveredIdx" in content
    assert "formatTooltipVal" in content
    assert "isLoading" in content
    print("PASSED: DynamicBarChart SVG elements, testids, rounded blue bars, white card styling, compact hover tooltip, and empty states verified.")

def test_api_all_bar_chart_types():
    print("\n[Test 2] Querying API across all 6 Analytics Types...")
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

    test_cases = [
        ("purchase", "Purchase Analytics", "Procurement Spend (৳)"),
        ("sales", "Sales Analytics", "Sales Dispensed (৳)"),
        ("company_purchase", "Company-wise Purchase Distribution", "Procurement Amount (৳)"),
        ("company_sales", "Company-wise Sales Distribution", "Sales Dispensed (৳)"),
        ("medicine_purchase", "Medicine-wise Purchase Ranking", "Procurement Spend (৳)"),
        ("medicine_sales", "Medicine-wise Sales Ranking", "Sales Units Dispensed"),
    ]

    for type_param, expected_title, expected_ylabel in test_cases:
        url = f"{BASE_URL}/api/dashboard/analytics?type={type_param}"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            assert res["success"] is True, f"Failed for type={type_param}"
            bc = res["data"]["barChart"]
            assert bc["title"] == expected_title, f"Expected title '{expected_title}', got '{bc['title']}'"
            assert bc["yAxisLabel"] == expected_ylabel, f"Expected ylabel '{expected_ylabel}', got '{bc['yAxisLabel']}'"
            assert len(bc["categories"]) > 0, f"Expected categories for type={type_param}"
            assert len(bc["series"]) == 1, "Expected 1 series"
            assert len(bc["series"][0]["data"]) == len(bc["categories"]), "Series data length mismatch"
            # Verify all data values are non-negative numbers
            for v in bc["series"][0]["data"]:
                assert isinstance(v, (int, float)) and v >= 0, f"Invalid value: {v}"
            print(f"  - Analytics Type '{type_param}' passed: title='{bc['title']}', categories={len(bc['categories'])}")

    print("PASSED: All 6 analytics types dynamically populate Bar Chart.")

def test_typescript():
    print("\n[Test 3] Running TypeScript compile check...")
    res = subprocess.run(["npx", "tsc", "--noEmit"], capture_output=True, text=True, shell=True)
    assert res.returncode == 0, f"TypeScript errors:\n{res.stdout}\n{res.stderr}"
    print("PASSED: TypeScript compiles with 0 errors.")

def main():
    print("=" * 70)
    print("Starting ST-DB-4: Dynamic Business Analytics Bar Chart")
    print("=" * 70)
    try:
        test_bar_chart_component()
        test_api_all_bar_chart_types()
        test_typescript()
        print("\n" + "=" * 70)
        print("ALL ST-DB-4 TESTS PASSED SUCCESSFULLY!")
        print("=" * 70)
        return True
    except Exception as e:
        print(f"\nFAILED: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

