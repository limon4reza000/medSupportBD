# -*- coding: utf-8 -*-
"""
Verification Script for ST-1.7: Brands & Manufacturer Showcase
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

def test_st_1_7():
    print("=== Testing ST-1.7: Brands & Manufacturer Showcase ===")

    # 1. Fetch Brands Directory
    s, res = make_request("/api/brands")
    print(f"1. Brands Directory: Status={s}, totalBrands={res.get('totalBrands')}")
    assert s == 200, f"Expected 200, got {s}"
    assert res.get("totalBrands") >= 40, "Expected at least 40 brands"

    # 2. Check Top Ranked Brands (Square, Incepta, Beximco)
    brands = res.get("brands", [])
    top_brand = brands[0]
    assert "Square" in top_brand.get("name"), "Top brand expected Square"
    assert top_brand.get("marketShareRank") == 1
    assert "Seclo" in top_brand.get("popularBrands", [])
    print(f"2. Verified Top Brand: {top_brand.get('name')}, popular={top_brand.get('popularBrands')}")

    # 3. Search Brand ("Beximco")
    s, res = make_request("/api/brands?q=Beximco")
    print(f"3. Search 'Beximco': Status={s}, total={res.get('totalBrands')}")
    assert s == 200
    assert res.get("totalBrands") >= 1
    bex = res.get("brands")[0]
    assert "Beximco" in bex.get("name")
    assert "Napa" in bex.get("popularBrands", [])

    # 4. Search by Popular Product Brand Name ("Napa")
    s, res = make_request("/api/brands?q=Napa")
    print(f"4. Search by product 'Napa': Status={s}, matches={res.get('totalBrands')}")
    assert s == 200
    assert any("Beximco" in b.get("name") for b in res.get("brands", []))

    # 5. UI Verification in app/page.tsx
    with open("app/page.tsx", "r", encoding="utf-8") as f:
        page = f.read()
    assert "animate-marquee-left" in page, "Marquee ticker missing in page.tsx"
    assert "setIsAllBrandsModalOpen" in page, "All brands modal state missing in page.tsx"
    assert "Top Brands" in page or "Brands" in page, "Brands section header missing in page.tsx"
    print("5. UI Verification: Marquee ticker carousel and View All Brands modal verified in page.tsx")

    print("\n>>> ALL ST-1.7 VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    test_st_1_7()
