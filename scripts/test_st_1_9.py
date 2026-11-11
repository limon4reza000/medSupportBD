# -*- coding: utf-8 -*-
"""
Verification Script for ST-1.9: Multi-Company Unified Checkout Validation
"""
import urllib.request
import urllib.error
import json

BASE_URL = "http://localhost:3000"

def make_request(path, data=None, method="POST"):
    headers = {"Content-Type": "application/json"}
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

def test_st_1_9():
    print("=== Testing ST-1.9: Multi-Company Unified Checkout Validation ===")

    # 1. Valid multi-company checkout items (Beximco Napa Extra 10 boxes, Square Seclo 5 boxes)
    valid_items = [
        {"medicineId": "med-01", "quantity": 10, "unitType": "BOX"},
        {"medicineId": "med-02", "quantity": 5, "unitType": "BOX"},
    ]
    s, res = make_request("/api/orders/checkout/validate", {
        "pharmacyId": "pharm-01",
        "paymentMethod": "CREDIT",
        "items": valid_items
    })
    print(f"1. Unified Checkout Validation: Status={s}, isValid={res.get('isValid')}, warnings={res.get('warnings')}")
    assert s == 200, f"Expected 200, got {s}"
    assert res.get("isValid") == True, "Expected valid checkout"
    assert len(res.get("companies", [])) == 2, "Expected 2 company breakdown cards"

    # 2. Check 3% Statutory Chemist Discount
    gross = res.get("grossTotal")
    discount = res.get("chemistDiscount")
    net = res.get("netPayable")
    print(f"2. Bill Breakdown: Gross=৳{gross}, Discount (3%)=৳{discount}, Net=৳{net}")
    assert round(gross * 0.03, 2) == discount, "3% discount calculation error"
    assert round(gross - discount, 2) == net, "Net payable calculation error"

    # 3. Test Below Minimum Order Value (1 box Napa = ৳490 < Beximco MOV ৳2000)
    low_mov_items = [
        {"medicineId": "med-01", "quantity": 1, "unitType": "BOX"}
    ]
    s, res = make_request("/api/orders/checkout/validate", {
        "pharmacyId": "pharm-01",
        "paymentMethod": "CASH",
        "items": low_mov_items
    })
    print(f"3. Low MOV Test: Status={s}, isValid={res.get('isValid')}, warnings={res.get('warnings')}")
    assert s == 200
    assert res.get("isValid") == False, "Expected MOV warning"
    assert any("below minimum order" in w for w in res.get("warnings", []))

    # 4. Test Cash on Delivery bypassing credit limit checks
    s, res = make_request("/api/orders/checkout/validate", {
        "pharmacyId": "pharm-01",
        "paymentMethod": "CASH",
        "items": valid_items
    })
    print(f"4. COD Payment Terms: Status={s}, isValid={res.get('isValid')}")
    assert s == 200
    assert res.get("isValid") == True

    print("\n>>> ALL ST-1.9 VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    test_st_1_9()
