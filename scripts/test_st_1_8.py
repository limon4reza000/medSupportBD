# -*- coding: utf-8 -*-
"""
Verification Script for ST-1.8: Company-Wise Cart Engine & Trade Schemes
"""
import urllib.request
import urllib.error
import json

BASE_URL = "http://localhost:3000"

def make_request(path, data=None, method="GET"):
    headers = {}
    if data is not None:
        headers["Content-Type"] = "application/json"
    req_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(f"{BASE_URL}{path}", data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except:
            return e.code, body

def test_st_1_8():
    print("=== Testing ST-1.8: Company-Wise Cart Engine & Trade Schemes ===")

    # 1. Sync multi-company items to cart (Napa Extra 10 boxes, Seclo 20 5 boxes)
    sync_items = [
        {"medicineId": "med-01", "quantity": 10, "unitType": "BOX"},
        {"medicineId": "med-02", "quantity": 5, "unitType": "BOX"},
    ]
    s, res = make_request("/api/cart/sync", {
        "pharmacyId": "pharm-01",
        "items": sync_items
    }, method="POST")
    print(f"1. Cart Sync: Status={s}, success={res.get('success')}, itemCount={res.get('itemCount')}")
    assert s == 200, f"Expected 200, got {s}"

    # 2. Fetch Decomposed Cart Summary
    s, res = make_request("/api/cart?pharmacyId=pharm-01")
    print(f"2. Cart Summary: Status={s}, clusters={len(res.get('companyClusters', []))}")
    assert s == 200, f"Expected 200, got {s}"
    clusters = res.get("companyClusters", [])
    assert len(clusters) >= 2, f"Expected at least 2 company clusters, got {len(clusters)}"

    # 3. Verify Trade Scheme Bonus (+1 Strip Free on 10 boxes of Napa)
    bex_cluster = next((c for c in clusters if "Beximco" in c.get("companyName")), None)
    assert bex_cluster is not None, "Beximco cluster missing"
    napa_item = bex_cluster.get("items")[0]
    print(f"3. Napa Item: qty={napa_item.get('quantity')}, bonusQty={napa_item.get('bonusQuantity')}, desc={napa_item.get('bonusDescription')}")
    assert napa_item.get("bonusQuantity") == 1, "Expected 1 bonus strip for 10 boxes"

    # 4. Verify Financial Summary & 3% Chemist Discount
    fin = res.get("financialSummary", {})
    gross = fin.get("grossTradeTotal")
    discount = fin.get("statutoryChemistDiscount")
    net = fin.get("netGrandTotal")
    print(f"4. Financials: Gross=৳{gross}, Discount (3%)=৳{discount}, Net=৳{net}")
    assert round(gross * 0.03, 2) == discount, "3% discount formula mismatch"
    assert round(gross - discount, 2) == net, "Net total formula mismatch"

    # 5. Test Negative Quantity Rejection (Must return 422)
    s, res = make_request("/api/cart/sync", {
        "pharmacyId": "pharm-01",
        "items": [{"medicineId": "med-01", "quantity": -5}]
    }, method="POST")
    print(f"5. Negative Quantity: Status={s}, error={res.get('error')}")
    assert s == 422, f"Expected 422 for negative quantity, got {s}"

    print("\n>>> ALL ST-1.8 VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    test_st_1_8()
