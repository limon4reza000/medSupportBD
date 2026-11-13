import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const activeOnly = searchParams.get("activeOnly") !== "false";
    const now = new Date();

    let offers = db.tradeOffers.filter((o) => {
      if (activeOnly) {
        if (!o.isActive) return false;
        if (new Date(o.endDate) < now) return false;
      }
      return true;
    });

    // Enrich with medicine details
    const enrichedOffers = offers.map((offer) => {
      const med = db.getMedicine(offer.medicineId);
      const companyName = med?.manufacturer || "Pharmaceutical Depot";
      return {
        ...offer,
        medicine: med
          ? {
              id: med.id,
              brandName: med.brandName,
              genericName: med.genericName,
              manufacturer: med.manufacturer,
              dosageForm: med.dosageForm,
              strength: med.strength,
              piecesPerStrip: med.piecesPerStrip,
              stripsPerBox: med.stripsPerBox,
              mrpPerPiece: med.mrpPerPiece,
              tradePricePerPiece: med.tradePricePerPiece,
              boxTradePrice: Number((Number(med.tradePricePerPiece) * med.piecesPerStrip * med.stripsPerBox).toFixed(2)),
              boxMrp: Number((Number(med.mrpPerPiece) * med.piecesPerStrip * med.stripsPerBox).toFixed(2)),
            }
          : null,
        companyName,
      };
    });

    // Filter by company if requested
    const filtered = companyId && companyId !== "ALL"
      ? enrichedOffers.filter((o) =>
          o.companyName.toLowerCase().includes(companyId.toLowerCase())
        )
      : enrichedOffers;

    return NextResponse.json({
      success: true,
      count: filtered.length,
      offers: filtered,
    });
  } catch (error: any) {
    console.error("Failed to fetch trade offers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch promotional trade offers" },
      { status: 500 }
    );
  }
}
