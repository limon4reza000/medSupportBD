# -*- coding: utf-8 -*-
"""
Verification Script for ST-1.4: Company & Depot Directory
"""
import urllib.request
import urllib.error
import json

BASE_URL = "http://localhost:3000"

def make_request(path):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except:
            return e.code, body

def test_st_1_4():
    print("=== Testing ST-1.4: Company & Depot Directory ===")

    # 1. Query full company directory
    s, res = make_request("/api/companies")
    print(f"1. Company Directory: Status={s}, total={res.get('total')}")
    assert s == 200, f"Expected 200, got {s}"
    total = res.get("total", 0)
    assert total >= 40, f"Expected at least 40 companies, found {total}"

    # 2. Verify Square Pharma profile and depots
    companies = res.get("companies", [])
    square = next((c for c in companies if c.get("id") == "Square"), None)
    assert square is not None, "Square Pharmaceuticals missing"
    assert square.get("isDgdaVerified") == True, "DGDA verified flag missing"
    assert square.get("supportPhone"), "Support phone missing for direct calling"
    assert len(square.get("depots", [])) > 0, "Linked depots missing for Square"
    print(f"2. Verified Square: depots={len(square.get('depots'))}, supportPhone={square.get('supportPhone')}")

    # 3. Search filter by company name
    s, res = make_request("/api/companies?search=Beximco")
    print(f"3. Search 'Beximco': Status={s}, count={res.get('total')}")
    assert s == 200
    assert res.get("total") >= 1
    beximco = res.get("companies")[0]
    assert "Beximco" in beximco.get("name")

    # 4. Query Company Depots endpoint (/api/companies/Beximco/depots)
    s, res = make_request("/api/companies/Beximco/depots")
    print(f"4. Beximco Depots Endpoint: Status={s}, depotsCount={res.get('depotsCount')}")
    assert s == 200, f"Expected 200, got {s}"
    depots = res.get("depots", [])
    assert len(depots) > 0, "No depots returned for Beximco"
    depot = depots[0]
    assert depot.get("contactPhone"), "Depot contactPhone missing for direct dispatch calls"
    assert depot.get("operatingHours"), "Operating hours missing"
    assert "isColdChainCertified" in depot, "Cold chain certification flag missing"

    # 5. Non-existent company test
    s, res = make_request("/api/companies/NonExistentPharma123/depots")
    print(f"5. Non-Existent Company: Status={s}, success={res.get('success')}")
    assert s == 404, f"Expected 404, got {s}"

    print("\n>>> ALL ST-1.4 VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    test_st_1_4()
