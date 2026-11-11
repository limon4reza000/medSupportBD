# -*- coding: utf-8 -*-
"""
Verification Script for ST-1.5: Medicine Catalog & Clinical Taxonomy
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

def test_st_1_5():
    print("=== Testing ST-1.5: Medicine Catalog & Clinical Taxonomy ===")

    # 1. Fetch Napa Extra (med-01)
    s, res = make_request("/api/medicines/med-01")
    print(f"1. Fetch Napa Extra (med-01): Status={s}, success={res.get('success')}")
    assert s == 200, f"Expected 200, got {s}"
    med = res.get("medicine", {})
    assert "Napa" in med.get("name"), "Brand name mismatch"
    assert "Paracetamol" in med.get("genericName"), "Generic name mismatch"

    # 2. Verify Packaging Math
    pkg = med.get("packaging", {})
    strips_per_box = pkg.get("stripsPerBox")
    pieces_per_strip = pkg.get("piecesPerStrip")
    total_units = pkg.get("totalUnitsPerBox")
    print(f"2. Packaging Math: {strips_per_box} strips/box * {pieces_per_strip} pcs/strip = {total_units} units/box")
    assert strips_per_box > 0 and pieces_per_strip > 0, "Invalid packaging numbers"
    assert total_units == strips_per_box * pieces_per_strip, "Packaging math formula failed"

    # 3. Verify Pricing Math & Chemist Margin
    pricing = med.get("pricing", {})
    mrp_box = pricing.get("mrpPerBox")
    tp_box = pricing.get("tradePricePerBox")
    margin_pct = pricing.get("chemistMarginPercent")
    print(f"3. Pricing Math: MRP=৳{mrp_box}, TP=৳{tp_box}, Chemist Margin={margin_pct}%")
    assert tp_box < mrp_box, "Trade price must be less than MRP"
    expected_margin = round(((mrp_box - tp_box) / mrp_box) * 100, 1)
    assert abs(margin_pct - expected_margin) <= 0.2, f"Margin mismatch: {margin_pct} vs {expected_margin}"

    # 4. Verify Regulatory & Cold Chain Flags
    comm = med.get("commercial", {})
    assert "isPrescriptionRequired" in comm, "Rx flag missing"
    assert "requiresRefrigeration" in comm, "Refrigeration flag missing"
    print(f"4. Regulatory Flags: Rx={comm.get('isPrescriptionRequired')}, ColdChain={comm.get('requiresRefrigeration')}")

    # 5. Non-existent medicine ID
    s, res = make_request("/api/medicines/med-nonexistent-999")
    print(f"5. Non-existent Medicine: Status={s}, success={res.get('success')}")
    assert s == 404, f"Expected 404, got {s}"

    print("\n>>> ALL ST-1.5 VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    test_st_1_5()
