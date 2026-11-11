import { NextRequest, NextResponse } from "next/server";
import { SEED_USERS, IAuthUser } from "@/lib/auth/rbac";
import { UserRole } from "@/types/domain";
import { normalizeTarget, verifyOtpCode } from "@/lib/auth/otpStore";
import { initialPharmacies } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password, otp, role } = body;

    const normalizedIdentifier = normalizeTarget(identifier || "", "phone");

    if (!normalizedIdentifier) {
      return NextResponse.json(
        { success: false, error: "Please enter your mobile number or corporate email." },
        { status: 400 }
      );
    }

    // If OTP provided, verify it first
    if (otp) {
      const otpResult = verifyOtpCode(normalizedIdentifier, otp);
      if (!otpResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: otpResult.error || "Invalid verification code.",
            remainingAttempts: otpResult.remainingAttempts,
            isLocked: otpResult.isLocked,
          },
          { status: otpResult.isLocked ? 429 : 401 }
        );
      }
    }

    // Match existing seed user by phone or email
    let user = SEED_USERS.find(
      (u) =>
        u.phone.replace(/[\s-]/g, "").includes(normalizedIdentifier) ||
        u.email.toLowerCase() === normalizedIdentifier.toLowerCase()
    );

    // If not found in seed, create or hydrate dynamically for requested role
    if (!user) {
      const assignedRole = (role as UserRole) || UserRole.PHARMACY_OWNER;
      user = {
        id: `user-${Date.now().toString(36)}`,
        phone: normalizedIdentifier.startsWith("01") ? normalizedIdentifier : "01711000000",
        email: normalizedIdentifier.includes("@") ? normalizedIdentifier : `${normalizedIdentifier}@medgo.pharm`,
        fullName: assignedRole === UserRole.SALES_REP ? "Tanvir Hasan (MPO)" : "Registered Pharmacy Chemist",
        role: assignedRole,
        pharmacyId: "pharm-01",
        pharmacyName: "Green Care Pharmacy & Med Store",
        isVerified: true,
      };
    }

    // Generate cryptographic-style session token
    const token = `mgtok_${Buffer.from(`${user.id}:${user.role}:${Date.now()}`).toString("base64")}`;

    const authenticatedUser: IAuthUser = {
      ...user,
      token,
    };

    // Load pharmacy credit details for pharmacy roles
    const pharmacy = initialPharmacies.find((p) => p.id === (user?.pharmacyId || "pharm-01")) || initialPharmacies[0];

    const response = NextResponse.json({
      success: true,
      message: `Signed in successfully as ${user.fullName} (${user.role})`,
      user: {
        ...authenticatedUser,
        creditLimit: pharmacy.creditLimit,
        creditBalance: pharmacy.creditLimit - pharmacy.currentBalance,
        outstandingBalance: pharmacy.currentBalance,
      },
      token,
    });

    // Set secure auth cookie
    response.cookies.set("medgo_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Authentication failed." },
      { status: 500 }
    );
  }
}
