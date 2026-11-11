# -*- coding: utf-8 -*-
"""
Verification Test Suite for ST-1.11B:
Dashboard UI — Financial KPIs & Inventory Health
"""
import urllib.request
import re
import sys

BASE_URL = "http://localhost:3000"

def main():
    print("=== Testing ST-1.11B: Dashboard UI — Financial KPIs & Inventory Health ===")

    # 1. Verify BusinessAnalyticsScreen component structure
    print("1. Verifying BusinessAnalyticsScreen.tsx component:")
    with open("components/dashboard/BusinessAnalyticsScreen.tsx", "r", encoding="utf-8") as f:
        comp_text = f.read()

    assert "Total Purchase" in comp_text, "Missing Total Purchase KPI"
    assert "Retail Sales" in comp_text, "Missing Retail Sales card"
    assert "POS Unlinked" in comp_text, "Missing POS Unlinked status indicator"
    assert "Outstanding Balance" in comp_text, "Missing Outstanding Balance KPI"
    assert "creditUtilizationPercent" in comp_text, "Missing credit utilization progress bar"
    assert "Available Credit" in comp_text, "Missing Available Credit KPI"
    assert "Inventory Health & Alerts" in comp_text, "Missing Inventory Health section"
    assert "Low Stock" in comp_text, "Missing Low Stock badge"
    assert "Out Stock" in comp_text, "Missing Out of Stock badge"
    assert "nearExpiryCount" in comp_text, "Missing Near Expiry badge"
    assert "Reorder Suggestions" in comp_text, "Missing Reorder Suggestions drawer"
    assert "Order Lifecycle Pipeline" in comp_text, "Missing Order Lifecycle Pipeline"
    assert "recentDispatched" in comp_text, "Missing Active Van Dispatch snapshot"
    assert "isMasked" in comp_text and "••••••" in comp_text, "Missing staff financial privacy shield"
    print("   ✓ All KPI cards, utilization progress bars, inventory alerts, and privacy shields verified.")

    # 2. Verify page.tsx integration
    print("2. Verifying page.tsx integration:")
    with open("app/page.tsx", "r", encoding="utf-8") as f:
        page_text = f.read()

    assert "BusinessAnalyticsScreen" in page_text, "Missing BusinessAnalyticsScreen import"
    assert '"BUSINESS_ANALYTICS"' in page_text, "Missing BUSINESS_ANALYTICS in MobileScreen type"
    assert 'setActiveScreen("BUSINESS_ANALYTICS")' in page_text, "Missing setActiveScreen(BUSINESS_ANALYTICS) action"
    assert "Business Analytics & Financial Health" in page_text, "Missing Home Screen Business Analytics shortcut banner"
    assert 'activeScreen === "BUSINESS_ANALYTICS"' in page_text, "Missing activeScreen === BUSINESS_ANALYTICS block"
    print("   ✓ page.tsx routing and Home Screen executive banner verified.")

    # 3. Verify Live HTTP Server compiles and renders
    print("3. Verifying Live Server Response:")
    req = urllib.request.Request(f"{BASE_URL}")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        html = resp.read().decode("utf-8")
        assert "MedGo" in html or "Business" in html or "Explore" in html
        print(f"   ✓ Live server returned HTTP 200 OK (Content length: {len(html)} bytes)")

    print("\n>>> ALL ST-1.11B VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    main()
