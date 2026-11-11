# -*- coding: utf-8 -*-
"""
Master Integration Test Runner for MedGo Phase 1: Core Foundation
Runs all 11 sub-task verification test suites.
"""
import subprocess
import sys

SCRIPTS = [
    "scripts/test_st_1_1a.py",
    "scripts/test_st_1_1b.py",
    "scripts/test_st_1_2.py",
    "scripts/test_st_1_3.py",
    "scripts/test_st_1_4.py",
    "scripts/test_st_1_5.py",
    "scripts/test_st_1_6.py",
    "scripts/test_st_1_7.py",
    "scripts/test_st_1_8.py",
    "scripts/test_st_1_9.py",
    "scripts/test_st_1_10.py",
    "scripts/test_st_1_11a.py",
    "scripts/test_st_1_11b.py",
    "scripts/test_st_1_11c.py",
    "scripts/test_st_db_1.py",
    "scripts/test_st_db_2.py",
    "scripts/test_st_db_3.py",
    "scripts/test_st_db_4.py",
    "scripts/test_st_db_5.py",
]

def main():
    print("=" * 70)
    print("MEDGO — PHASE 1: CORE FOUNDATION MASTER INTEGRATION TEST SUITE")
    print("=" * 70)

    all_passed = True
    for script in SCRIPTS:
        print(f"\n---> Executing {script}...")
        result = subprocess.run([sys.executable, script], capture_output=True, text=True)
        if result.returncode == 0:
            print(result.stdout.strip())
            print(f"PASSED: {script}")
        else:
            print(result.stdout)
            print(result.stderr)
            print(f"FAILED: {script}")
            all_passed = False
            break

    print("\n" + "=" * 70)
    if all_passed:
        print("ALL 14 SUB-TASK TEST SUITES PASSED FLAWLESSLY! PHASE 1 IS PRODUCTION READY.")
    else:
        print("SOME TESTS FAILED.")
    print("=" * 70)

    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    main()
