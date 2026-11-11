import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";
import { serverCartStore } from "@/lib/cart/cartStore";
import { resolveUser } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = resolveUser(req);
    const { searchParams } = new URL(req.url);
    const pharmacyId = searchParams.get("pharmacyId") || user?.pharmacyId || "pharm-01";

    const storedItems = serverCartStore.get(pharmacyId) || [];

    // Group items by manufacturer
    const clustersMap = new Map<string, any>();

    let grossTradeTotal = 0;
    let totalItemsCount = 0;

    for (const item of storedItems) {
      const med = db.getMedicine(item.medicineId);
      if (!med) continue;

      const mfgName = med.manufacturer || "General Pharmaceuticals";
      const unitType = item.unitType || "BOX";
      const stripsPerBox = med.stripsPerBox || 10;
      const piecesPerStrip = med.piecesPerStrip || 10;
      const totalUnitsPerBox = stripsPerBox * piecesPerStrip;

      const unitTradePrice = unitType === "BOX"
        ? (med.tradePricePerBox || Number((med.tradePricePerPiece * totalUnitsPerBox).toFixed(2)))
        : unitType === "STRIP"
        ? Number((med.tradePricePerPiece * piecesPerStrip).toFixed(2))
        : Number(med.tradePricePerPiece.toFixed(2));

      const lineTotal = Number((unitTradePrice * item.quantity).toFixed(2));
      grossTradeTotal += lineTotal;
      totalItemsCount += item.quantity;

      // Trade Scheme bonus calculation (e.g. 10+1 free scheme)
      let bonusQuantity = 0;
      let bonusUnit = "STRIP";
      let bonusDescription = "";
      if (item.quantity >= 10) {
        bonusQuantity = Math.floor(item.quantity / 10);
        bonusDescription = `Trade Scheme: Buy 10 ${unitType}es Get ${bonusQuantity} ${bonusUnit} Free`;
      }

      const itemDetail = {
        medicineId: med.id,
        name: med.brandName,
        genericName: med.genericName,
        strength: med.strength,
        dosageForm: med.dosageForm,
        unitType,
        quantity: item.quantity,
        tradePrice: unitTradePrice,
        lineTotal,
        bonusQuantity,
        bonusUnit,
        bonusDescription,
      };

      if (!clustersMap.has(mfgName)) {
        const minOrder = mfgName.includes("Beximco") ? 2000 : mfgName.includes("Square") ? 2000 : 1500;
        clustersMap.set(mfgName, {
          companyId: `comp-${mfgName.toLowerCase().replace(/\s+/g, "")}`,
          companyName: mfgName,
          companyCode: mfgName.slice(0, 4).toUpperCase(),
          minimumOrderAmount: minOrder,
          clusterSubtotal: 0,
          isMovMet: false,
          items: [],
        });
      }

      const cluster = clustersMap.get(mfgName);
      cluster.items.push(itemDetail);
      cluster.clusterSubtotal = Number((cluster.clusterSubtotal + lineTotal).toFixed(2));
      cluster.isMovMet = cluster.clusterSubtotal >= cluster.minimumOrderAmount;
    }

    const companyClusters = Array.from(clustersMap.values());
    const statutoryChemistDiscount = Number((grossTradeTotal * 0.03).toFixed(2));
    const netGrandTotal = Number((grossTradeTotal - statutoryChemistDiscount).toFixed(2));

    return NextResponse.json({
      success: true,
      pharmacyId,
      totalItemsCount,
      totalUniqueMedicines: storedItems.length,
      companyClusters,
      financialSummary: {
        grossTradeTotal: Number(grossTradeTotal.toFixed(2)),
        statutoryChemistDiscount,
        discountPercent: 3.0,
        netGrandTotal,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load cart." },
      { status: 500 }
    );
  }
}
