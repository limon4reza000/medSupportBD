import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pharmacyId = searchParams.get("pharmacyId") || "pharm-01";
    const filter = searchParams.get("filter") || "ALL";

    let stocks = db.getPharmacyStock(pharmacyId);

    if (filter === "LOW_STOCK") {
      stocks = stocks.filter((s) => s.isLowStock || s.quantity <= 10);
    } else if (filter === "NEAR_EXPIRY") {
      stocks = stocks.filter((s) => s.isNearExpiry);
    } else if (filter === "IN_STOCK") {
      stocks = stocks.filter((s) => s.quantity > 0);
    }

    const movements = db.stockMovements.filter((m) => m.pharmacyId === pharmacyId).slice(0, 20);

    const totalSkus = db.getPharmacyStock(pharmacyId).length;
    const lowStockCount = db.getPharmacyStock(pharmacyId).filter((s) => s.quantity <= 10).length;
    const nearExpiryCount = db.getPharmacyStock(pharmacyId).filter((s) => s.isNearExpiry).length;

    return NextResponse.json({
      success: true,
      count: stocks.length,
      summary: {
        totalSkus,
        lowStockCount,
        nearExpiryCount,
      },
      stocks,
      movements,
    });
  } catch (error: any) {
    console.error("Failed to fetch pharmacy inventory:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pharmacy inventory" },
      { status: 500 }
    );
  }
}
