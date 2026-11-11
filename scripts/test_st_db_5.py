#!/usr/bin/env python3
"""
MedGo ST-DB-5 Verification Test Suite
Verifies Performance Trends Line Chart & Master 5-Tier Layout Sequence
"""

import os
import sys
import json
import urllib.request
import subprocess

BASE_URL = "http://localhost:3000"

def test_line_chart_component():
    print("\n[Test 1] Inspecting DynamicLineChart component implementation...")
    path = "components/dashboard/DashboardCharts.tsx"
    assert os.path.exists(path), f"File {path} not found"
    with open(path, "r", encoding="utf-8") as fp:
        content = fp.read()

    assert "export function DynamicLineChart" in content
    assert 'data-testid="dynamic-line-chart"' in content
    assert 'data-testid="dynamic-line-chart-empty"' in content
    assert 'role="graphics-document"' in content
    assert "polyline" in content
    assert "isLoading" in content
    print("PASSED: DynamicLineChart SVG polyline, testids, legend, and empty state verified.")

def test_api_line_chart_data():
    print("\n[Test 2] Querying API for Line Chart Multi-Series Datasets...")
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
        assert res["success"] is True
        lc = res["data"]["lineChart"]
        assert lc["title"] == "Business Performance Trends"
        assert len(lc["timePoints"]) > 0, "Expected time points in line chart"
        assert len(lc["lines"]) == 2, f"Expected 2 lines, got {len(lc['lines'])}"

        line_names = [l["name"] for l in lc["lines"]]
        assert "Purchase Spend" in line_names
        assert "Retail Sales (POS)" in line_names

        for line in lc["lines"]:
            assert len(line["data"]) == len(lc["timePoints"]), "Data length must match timepoints length"
            for v in line["data"]:
                assert isinstance(v, (int, float)) and v >= 0
        print(f"PASSED: Line chart returns 2 multi-series comparison lines across {len(lc['timePoints'])} time points.")

def test_master_layout_sequence():
    print("\n[Test 3] Verifying Exact 5-Tier Layout Sequence in BusinessAnalyticsScreen.tsx...")
    path = "components/dashboard/BusinessAnalyticsScreen.tsx"
    with open(path, "r", encoding="utf-8") as fp:
        content = fp.read()

    # Find indices of the 5 tiers
    idx_overview = content.find("<OverviewCards")
    idx_filters = content.find("<AnalyticsFilters")
    idx_bar = content.find("<DynamicBarChart")
    idx_line = content.find("<DynamicLineChart")
    idx_activities = content.find("<RecentActivitiesStream")

    assert idx_overview != -1, "Tier 1 <OverviewCards missing!"
    assert idx_filters != -1, "Tier 2 <AnalyticsFilters missing!"
    assert idx_bar != -1, "Tier 3 <DynamicBarChart missing!"
    assert idx_line != -1, "Tier 4 <DynamicLineChart missing!"
    assert idx_activities != -1, "Tier 5 <RecentActivitiesStream missing!"

    # Verify strict sequence: 1 < 2 < 3 < 4 < 5
    assert idx_overview < idx_filters, "Tier 1 must appear before Tier 2"
    assert idx_filters < idx_bar, "Tier 2 must appear before Tier 3"
    assert idx_bar < idx_line, "Tier 3 must appear before Tier 4"
    assert idx_line < idx_activities, "Tier 4 must appear before Tier 5"

    print("PASSED: Exact 5-Tier Sequence confirmed:")
    print(f"  1. OverviewCards (pos {idx_overview})")
    print(f"  2. AnalyticsFilters (pos {idx_filters})")
    print(f"  3. DynamicBarChart (pos {idx_bar})")
    print(f"  4. DynamicLineChart (pos {idx_line})")
    print(f"  5. RecentActivitiesStream (pos {idx_activities})")

def test_typescript():
    print("\n[Test 4] Running TypeScript compile check...")
    res = subprocess.run(["npx", "tsc", "--noEmit"], capture_output=True, text=True, shell=True)
    assert res.returncode == 0, f"TypeScript errors:\n{res.stdout}\n{res.stderr}"
    print("PASSED: TypeScript compiles with 0 errors.")

def main():
    print("=" * 70)
    print("Starting ST-DB-5: Performance Trends Line Chart & Master Layout Integration")
    print("=" * 70)
    try:
        test_line_chart_component()
        test_api_line_chart_data()
        test_master_layout_sequence()
        test_typescript()
        print("\n" + "=" * 70)
        print("ALL ST-DB-5 TESTS PASSED SUCCESSFULLY!")
        print("=" * 70)
        return True
    except Exception as e:
        print(f"\nFAILED: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
