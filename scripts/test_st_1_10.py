# -*- coding: utf-8 -*-
"""
Verification Script for ST-1.10: Atomic Order Decomposition & FEFO Stock Reservation Engine
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

def test_st_1_10():
    print("=== Testing ST-1.10: Atomic Order Decomposition Engine ===")

    # 1. Multi-Company Checkout (Napa from Beximco + Seclo from Square)
    checkout_items = [
        {"medicineId": "med-01", "orderedQty": 10, "orderedUnit": "BOX"},
        {"medicineId": "med-02", "orderedQty": 5, "orderedUnit": "BOX"}
    ]
    s, res = make_request("/api/orders/checkout", {
        "pharmacyId": "pharm-01",
        "items": checkout_items,
        "deliveryNotes": "Urgent chemist replenishment"
    })
    print(f"1. Atomic Multi-Company Checkout: Status={s}, isMultiCompany={res.get('isMultiCompany')}, totalOrders={res.get('totalOrdersCreated')}")
    assert s == 200, f"Expected 200, got {s}"
    assert res.get("totalOrdersCreated") == 2, "Expected 2 company orders (1 Beximco, 1 Square)"

    # 2. Verify Distinct Company Orders & DGDA Challan Separation
    orders = res.get("companyOrders", [])
    bex_order = next((o for o in orders if "Beximco" in o.get("companyName")), None)
    second_order = next((o for o in orders if o != bex_order), None)
    assert bex_order is not None, "Beximco order missing"
    assert second_order is not None, "Second company order missing"
    assert bex_order.get("orderNumber") != second_order.get("orderNumber"), "Order numbers must be distinct"
    print(f"2. Decomposed Orders: Beximco Order #{bex_order.get('orderNumber')}, Second Order ({second_order.get('companyName')}) #{second_order.get('orderNumber')}")

    # 3. Verify FEFO Physical Batch Allocation Breakdown
    allocated = res.get("data", {}).get("allocatedItems", [])
    assert len(allocated) >= 2, "Allocated items missing"
    for item in allocated:
        breakdown = item.get("batchBreakdown", [])
        print(f"3. Item {item.get('brandName')}: Batches Allocated = {len(breakdown)}")
        assert len(breakdown) > 0, f"No FEFO batches allocated for {item.get('brandName')}"
        for b in breakdown:
            assert b.get("batchNumber"), "Batch number missing"
            assert b.get("expiryDate"), "Expiry date missing"

    # 4. Verify Financial Ledger Entry
    ledger_id = res.get("data", {}).get("ledgerTxId")
    print(f"4. Ledger Transaction Recorded: {ledger_id}")
    assert ledger_id, "Ledger transaction ID missing"

    # 5. Test Shortage Rollback (Order exceeding credit or depot stock)
    s, res = make_request("/api/orders/checkout", {
        "pharmacyId": "pharm-01",
        "items": [{"medicineId": "med-01", "orderedQty": 50000, "orderedUnit": "BOX"}]
    })
    print(f"5. Shortage / Risk Rollback: Status={s}, error={res.get('error')}")
    assert s in [409, 403, 400], f"Expected 409/403/400 for shortage/credit rejection, got {s}"

    print("\n>>> ALL ST-1.10 VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    test_st_1_10()
