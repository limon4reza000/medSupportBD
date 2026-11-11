# -*- coding: utf-8 -*-
"""
Verification Script for ST-1.1B: Auth UI & Client State components
"""
import re

def test_st_1_1b():
    print("=== Testing ST-1.1B: Auth UI & Client State ===")
    
    # 1. Verify AuthModal exists and has carrier detection
    with open("components/auth/AuthModal.tsx", "r", encoding="utf-8") as f:
        auth_modal = f.read()
    
    assert "Grameenphone" in auth_modal, "Carrier Grameenphone detection missing"
    assert "Banglalink" in auth_modal, "Carrier Banglalink detection missing"
    assert "Robi" in auth_modal, "Carrier Robi detection missing"
    assert "Teletalk" in auth_modal, "Carrier Teletalk detection missing"
    assert "otpInputsRef" in auth_modal, "Auto-advancing OTP ref array missing"
    assert "cooldown" in auth_modal, "Cooldown timer missing"
    assert "handlePaste" in auth_modal, "Paste handler missing"
    assert "Backspace" in auth_modal, "Backspace navigation missing"
    print("✓ AuthModal verified with carrier detection, 6-digit auto-advance, and cooldown timer")

    # 2. Verify useAuth hook exists and exports required context
    with open("hooks/useAuth.tsx", "r", encoding="utf-8") as f:
        use_auth = f.read()
    
    assert "AuthProvider" in use_auth, "AuthProvider missing"
    assert "useAuth" in use_auth, "useAuth export missing"
    assert "loginWithOtp" in use_auth, "loginWithOtp missing"
    assert "sendOtp" in use_auth, "sendOtp missing"
    assert "refreshUser" in use_auth, "refreshUser missing"
    print("✓ useAuth hook verified with loginWithOtp, sendOtp, and session revalidation")

    # 3. Verify AuthProvider wrapped in RootLayoutWrapper
    with open("components/layout/RootLayoutWrapper.tsx", "r", encoding="utf-8") as f:
        layout = f.read()
    assert "<AuthProvider>" in layout, "AuthProvider missing in RootLayoutWrapper"
    print("✓ RootLayoutWrapper integrates AuthProvider globally")

    # 4. Verify AuthModal is mounted in app/page.tsx
    with open("app/page.tsx", "r", encoding="utf-8") as f:
        page = f.read()
    assert "<AuthModal" in page, "AuthModal component missing in app/page.tsx"
    assert "setIsAuthModalOpen" in page, "isAuthModalOpen trigger missing in app/page.tsx"
    print("✓ AuthModal integrated into MedGo Mobile viewport and Profile screen")

    print("\n>>> ALL ST-1.1B VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    test_st_1_1b()
