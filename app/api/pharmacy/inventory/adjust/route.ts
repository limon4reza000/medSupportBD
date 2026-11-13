import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      pharmacyId = "pharm-01",
      stockId,
      quantityDelta,
      movementType,
      reason,
      referenceId,
    } = body;

    if (!stockId || quantityDelta === undefined || quantityDelta === 0) {
      return NextResponse.json(
        { success: false, error: "stockId and a non-zero quantityDelta are required." },
        { status: 400 }
      );
    }

    const result = db.adjustPharmacyStock(
      pharmacyId,
      stockId,
      Number(quantityDelta),
      movementType || (quantityDelta > 0 ? "MANUAL_IN" : "AUDIT_ADJUSTMENT"),
      reason,
      referenceId
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Stock updated successfully. New balance: ${result.stock?.quantity} boxes.`,
      stock: result.stock,
      recentMovements: db.stockMovements.filter((m) => m.pharmacyId === pharmacyId).slice(0, 10),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to adjust inventory." },
      { status: 500 }
    );
  }
}
