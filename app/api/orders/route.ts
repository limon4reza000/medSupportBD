import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";
import { OrderStatus } from "@/types/domain";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pharmacyId = searchParams.get("pharmacyId") || "pharm-01";
    const status = searchParams.get("status");

    let orders = db.orders.filter((o) => !o.pharmacyId || o.pharmacyId === pharmacyId);

    if (status && status !== "ALL") {
      orders = orders.filter((o) => {
        if (status === "ACTIVE") {
          return (
            o.status === OrderStatus.PROCESSING ||
            o.status === OrderStatus.ALLOCATED ||
            o.status === OrderStatus.DISPATCHED ||
            o.status === OrderStatus.SUBMITTED
          );
        }
        return o.status === status;
      });
    }

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error("Failed to fetch pharmacy orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
