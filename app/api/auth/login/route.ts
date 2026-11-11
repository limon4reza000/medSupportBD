import { NextRequest, NextResponse } from "next/server";
import { SEED_USERS, IAuthUser } from "@/lib/auth/rbac";
import { UserRole } from "@/types/domain";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password, role } = body;

    const normalizedIdentifier = (identifier || "").trim().replace(/[\s-]/g, "");

    if (!normalizedIdentifier) {
      return NextResponse.json(
        { success: false, error: "Please enter your mobile number or corporate email." },
        { status: 400 }
      );
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
        fullName: "Registered Pharmacy Chemist",
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

    const response = NextResponse.json({
      success: true,
      message: `Signed in successfully as ${user.fullName} (${user.role})`,
      user: authenticatedUser,
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
