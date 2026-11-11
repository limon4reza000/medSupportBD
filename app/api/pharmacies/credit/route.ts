import { NextRequest, NextResponse } from "next/server";
import { requirePermission, enforceTenantBoundary } from "@/lib/auth/guards";
import { Permission } from "@/lib/auth/rbac";
import { initialPharmacies } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Enforce VIEW_FINANCES permission (Pharmacy Owner only; Staff blocked)
    const authResult = requirePermission(req, Permission.VIEW_FINANCES);
    if ("errorResponse" in authResult) {
      return authResult.errorResponse;
    }
    const user = authResult.user;

    // 2. Multi-tenant target isolation
    const url = new URL(req.url);
    const targetPharmacyId = url.searchParams.get("pharmacyId") || user.pharmacyId || "pharm-01";

    const tenantCheck = enforceTenantBoundary(user, { pharmacyId: targetPharmacyId });
    if (!tenantCheck.isAllowed) {
      return NextResponse.json(
        { success: false, error: tenantCheck.error, code: "TENANT_VIOLATION" },
        { status: 403 }
      );
    }

    const pharmacy = initialPharmacies.find((p) => p.id === targetPharmacyId);
    if (!pharmacy) {
      return NextResponse.json(
        { success: false, error: "Pharmacy not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      pharmacyId: pharmacy.id,
      tradeName: pharmacy.tradeName,
      creditLimit: pharmacy.creditLimit,
      currentBalance: pharmacy.currentBalance,
      availableCredit: pharmacy.creditLimit - pharmacy.currentBalance,
      creditStatus: pharmacy.currentBalance > pharmacy.creditLimit * 0.9 ? "WARNING" : "ACTIVE",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve credit details." },
      { status: 500 }
    );
  }
}
