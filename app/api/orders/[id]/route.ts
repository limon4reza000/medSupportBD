import { NextRequest, NextResponse } from "next/server";
import { resolveUser, enforceTenantBoundary } from "@/lib/auth/guards";
import { UserRole } from "@/types/domain";
import { db } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

// Sample verified order directory across companies
const SEED_ORDERS: Record<string, any> = {
  "ORD-20261111-SQU-001": {
    id: "ORD-20261111-SQU-001",
    companyId: "comp-square",
    companyName: "Square Pharmaceuticals PLC",
    pharmacyId: "pharm-01",
    challanNumber: "CH-SQU-20261111-001",
    subtotal: 5400.00,
    status: "ALLOCATED",
    items: [
      { medicineName: "Seclo 20", quantity: 10, unitPrice: 540.00 }
    ],
  },
  "ORD-20261111-BEX-002": {
    id: "ORD-20261111-BEX-002",
    companyId: "comp-beximco",
    companyName: "Beximco Pharmaceuticals Ltd.",
    pharmacyId: "pharm-01",
    challanNumber: "CH-BEX-20261111-002",
    subtotal: 4350.00,
    status: "DISPATCHED",
    items: [
      { medicineName: "Napa Extra", quantity: 10, unitPrice: 435.00 }
    ],
  },
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = resolveUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const orderId = params.id;
    const order = db.orders.find((o) => o.id === orderId) || SEED_ORDERS[orderId];

    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order ${orderId} not found.` },
        { status: 404 }
      );
    }

    // Enforce Tenant Boundary:
    // - MPO can only see orders for their own company
    // - Pharmacy can only see orders for their own pharmacy
    const tenantCheck = enforceTenantBoundary(user, {
      companyId: order.companyId,
      pharmacyId: order.pharmacyId,
    });

    if (!tenantCheck.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: tenantCheck.error || "Cross-tenant access forbidden.",
          code: "TENANT_ISOLATION_VIOLATION",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve order." },
      { status: 500 }
    );
  }
}
