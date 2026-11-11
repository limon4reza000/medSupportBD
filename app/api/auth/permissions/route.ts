import { NextRequest, NextResponse } from "next/server";
import { resolveUser } from "@/lib/auth/guards";
import { ROLE_PERMISSIONS, UserRole } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = resolveUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const permissions = ROLE_PERMISSIONS[user.role] || [];

    let tenant = null;
    if (user.pharmacyId) {
      tenant = { type: "PHARMACY", id: user.pharmacyId, name: user.pharmacyName || "Pharmacy" };
    } else if (user.companyId) {
      tenant = { type: "COMPANY", id: user.companyId, name: user.companyName || "Pharma Company" };
    } else if (user.depotId) {
      tenant = { type: "DEPOT", id: user.depotId, name: "Distribution Depot" };
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
      },
      role: user.role,
      permissions,
      tenant,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load role permissions." },
      { status: 500 }
    );
  }
}
