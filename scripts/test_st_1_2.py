# -*- coding: utf-8 -*-
"""
Verification Script for ST-1.2: 6-Role RBAC & Multi-Tenant Isolation
"""
import urllib.request
import urllib.error
import json

BASE_URL = "http://localhost:3000"

def make_request(path, data=None, method="GET", token=None):
    headers = {}
    if data is not None:
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = f"Bearer {token}"
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

def login_as(phone, role):
    s, res = make_request("/api/auth/login", {
        "identifier": phone,
        "otp": "412736",
        "role": role
    }, method="POST")
    assert s == 200, f"Login failed: {res}"
    return res.get("token")

def test_st_1_2():
    print("=== Testing ST-1.2: 6-Role RBAC & Multi-Tenant Isolation ===")

    # 1. Login as Pharmacy Owner
    po_token = login_as("01711409821", "PHARMACY_OWNER")
    print("1. Logged in as PHARMACY_OWNER: token obtained")

    # 2. Check Permissions Endpoint for Pharmacy Owner
    s, res = make_request("/api/auth/permissions", token=po_token)
    print(f"2. Owner Permissions: Status={s}, count={len(res.get('permissions', []))}")
    assert s == 200
    assert "VIEW_FINANCES" in res.get("permissions", [])
    assert "MANAGE_STAFF" in res.get("permissions", [])

    # 3. Query Finances as Pharmacy Owner (Allowed)
    s, res = make_request("/api/pharmacies/credit?pharmacyId=pharm-01", token=po_token)
    print(f"3. Owner Credit Access: Status={s}, creditLimit={res.get('creditLimit')}, available={res.get('availableCredit')}")
    assert s == 200, f"Expected 200, got {s}"

    # 4. Login as Retail Pharmacy Staff
    staff_token = login_as("01711409822", "RETAIL_PHARMACY")
    print("4. Logged in as RETAIL_PHARMACY (Staff): token obtained")

    # 5. Check Staff Permissions (VIEW_FINANCES must be ABSENT)
    s, res = make_request("/api/auth/permissions", token=staff_token)
    print(f"5. Staff Permissions: Status={s}, hasFinances={'VIEW_FINANCES' in res.get('permissions', [])}")
    assert s == 200
    assert "VIEW_FINANCES" not in res.get("permissions", []), "Staff should NOT have VIEW_FINANCES"

    # 6. Query Finances as Staff (Must be 403 FORBIDDEN)
    s, res = make_request("/api/pharmacies/credit?pharmacyId=pharm-01", token=staff_token)
    print(f"6. Staff Credit Access (Blocked): Status={s}, code={res.get('code')}")
    assert s == 403, f"Expected 403 Forbidden for Staff finances, got {s}"
    assert res.get("code") == "INSUFFICIENT_PERMISSIONS"

    # 7. Login as Beximco MPO
    bex_mpo_token = login_as("01819001122", "SALES_REP")
    print("7. Logged in as Beximco MPO: token obtained")

    # 8. Query Beximco Order as Beximco MPO (Allowed)
    s, res = make_request("/api/orders/ORD-20261111-BEX-002", token=bex_mpo_token)
    print(f"8. Beximco MPO queries Beximco Order: Status={s}, success={res.get('success')}")
    assert s == 200, f"Expected 200, got {s}"

    # 9. Query Square Order as Beximco MPO (Must be 403 TENANT VIOLATION)
    s, res = make_request("/api/orders/ORD-20261111-SQU-001", token=bex_mpo_token)
    print(f"9. Beximco MPO queries Square Order (Blocked): Status={s}, code={res.get('code')}")
    assert s == 403, f"Expected 403 Forbidden cross-company access, got {s}"
    assert res.get("code") == "TENANT_ISOLATION_VIOLATION"

    print("\n>>> ALL ST-1.2 VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    test_st_1_2()
