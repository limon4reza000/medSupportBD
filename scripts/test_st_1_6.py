# -*- coding: utf-8 -*-
"""
Verification Script for ST-1.6: Multi-Attribute Medicine Search Engine
"""
import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://localhost:3000"

def make_request(path):
    t0 = time.perf_counter()
    req = urllib.request.Request(f"{BASE_URL}{path}")
    try:
        with urllib.request.urlopen(req) as resp:
            elapsed_ms = (time.perf_counter() - t0) * 1000
            return resp.status, json.loads(resp.read().decode("utf-8")), elapsed_ms
    except urllib.error.HTTPError as e:
        elapsed_ms = (time.perf_counter() - t0) * 1000
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body), elapsed_ms
        except:
            return e.code, body, elapsed_ms

def test_st_1_6():
    print("=== Testing ST-1.6: Multi-Attribute Medicine Search Engine ===")

    # 1. Search Brand Name ("Napa")
    s, res, elapsed = make_request("/api/medicines?q=Napa&limit=10")
    print(f"1. Search 'Napa': Status={s}, matches={res.get('totalMatches')}, serverMs={res.get('durationMs')}ms, roundtrip={elapsed:.1f}ms")
    assert s == 200, f"Expected 200, got {s}"
    assert res.get("totalMatches") > 0, "Expected matches for Napa"
    assert any("Napa" in m.get("name") for m in res.get("medicines", []))

    # 2. Search Generic Molecule ("Paracetamol") across manufacturers
    s, res, elapsed = make_request("/api/medicines?q=Paracetamol&limit=20")
    print(f"2. Search Generic 'Paracetamol': Status={s}, matches={res.get('totalMatches')}, serverMs={res.get('durationMs')}ms")
    assert s == 200
    assert res.get("totalMatches") >= 5, "Expected multi-brand matches for Paracetamol"

    # 3. Facet Filter by Manufacturer ("Square")
    s, res, elapsed = make_request("/api/medicines?manufacturer=Square&limit=10")
    print(f"3. Facet Filter 'Square': Status={s}, matches={res.get('totalMatches')}")
    assert s == 200
    for m in res.get("medicines", []):
        assert "Square" in m.get("manufacturer", {}).get("name"), f"Unexpected manufacturer: {m.get('manufacturer')}"

    # 4. Sorting by Price Ascending (price_asc)
    s, res, elapsed = make_request("/api/medicines?q=Paracetamol&sortBy=price_asc&limit=10")
    print(f"4. Sort price_asc: Status={s}")
    assert s == 200
    prices = [m.get("tradePrice") for m in res.get("medicines", [])]
    assert prices == sorted(prices), f"Prices not sorted ascending: {prices}"

    # 5. Bengali Transliteration Test ("নাপা" -> Napa)
    encoded_bn = urllib.parse.quote("নাপা")
    s, res, elapsed = make_request(f"/api/medicines?q={encoded_bn}&limit=5")
    print(f"5. Transliteration 'নাপা': Status={s}, matches={res.get('totalMatches')}, resolvedQuery={res.get('query')}")
    assert s == 200
    assert "napa" in res.get("query").lower(), "Bengali transliteration to napa failed"
    assert res.get("totalMatches") > 0

    # 6. Benchmark sub-50ms server execution time
    timings = []
    for q in ["seclo", "ace", "pantoprazole", "azithromycin", "montelukast"]:
        _, r, _ = make_request(f"/api/medicines?q={q}&limit=20")
        timings.append(r.get("durationMs", 0))
    avg_server_ms = sum(timings) / len(timings)
    print(f"6. Performance Benchmark: Timings={timings}, Avg Server Time = {avg_server_ms:.2f}ms")
    assert avg_server_ms < 50.0, f"Benchmark failed: average server time {avg_server_ms}ms exceeds 50ms"

    print("\n>>> ALL ST-1.6 VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    test_st_1_6()
