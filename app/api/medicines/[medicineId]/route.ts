import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";
import { BatchFifoEngine } from "@/services/batchFifoEngine";
import { PackagingEngine } from "@/services/packagingEngine";
import { PackagingUnit } from "@/types/domain";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { medicineId: string } }
) {
  try {
    const medicineId = params.medicineId;
    const med = db.getMedicine(medicineId);

    if (!med) {
      return NextResponse.json(
        { success: false, error: `Medicine with ID '${medicineId}' not found.` },
        { status: 404 }
      );
    }

    const batches = db.getBatchesForMedicine(med.id);
    const availableStockPieces = BatchFifoEngine.getTotalAvailableStock(batches);
    const activeOffer = db.getOfferForMedicine(med.id);

    // Packaging normalization
    const stripsPerBox = med.stripsPerBox || 10;
    const piecesPerStrip = med.piecesPerStrip || 10;
    const totalUnitsPerBox = stripsPerBox * piecesPerStrip;
    const availableStockBoxes = Math.floor(availableStockPieces / totalUnitsPerBox);

    // Pricing formulas & Chemist Margin
    const tradePricePerBox = med.tradePricePerBox || Number((med.tradePricePerPiece * totalUnitsPerBox).toFixed(2));
    const tradePricePerStrip = Number((tradePricePerBox / stripsPerBox).toFixed(2));
    const tradePricePerPiece = Number(med.tradePricePerPiece.toFixed(3));

    const mrpPerBox = med.mrpPerBox || Number((med.mrpPerPiece * totalUnitsPerBox).toFixed(2));
    const mrpPerStrip = Number((mrpPerBox / stripsPerBox).toFixed(2));
    const mrpPerPiece = Number(med.mrpPerPiece.toFixed(2));

    const chemistMarginPercent = mrpPerBox > 0
      ? Number((((mrpPerBox - tradePricePerBox) / mrpPerBox) * 100).toFixed(1))
      : 12.0;

    // Regulatory & clinical taxonomy
    const isPrescriptionRequired = !!med.requiresPrescription;
    const requiresRefrigeration = !!(med.requiresColdChain || (med as any).requiresRefrigeration);

    return NextResponse.json({
      success: true,
      medicine: {
        id: med.id,
        name: med.brandName,
        genericName: med.genericName,
        strength: med.strength,
        dosageForm: med.dosageForm,
        therapeuticClass: med.therapeuticClass || "Pharmaceutical",
        manufacturer: {
          id: med.manufacturer,
          name: med.manufacturer,
          code: med.manufacturer.slice(0, 4).toUpperCase(),
        },
        packaging: {
          stripsPerBox,
          piecesPerStrip,
          totalUnitsPerBox,
          unitType: "BOX",
          packDescription: `${stripsPerBox} x ${piecesPerStrip}'s pack in printed carton`,
        },
        pricing: {
          mrpPerBox,
          mrpPerStrip,
          mrpPerPiece,
          tradePricePerBox,
          tradePricePerStrip,
          tradePricePerPiece,
          chemistMarginPercent,
          vatIncluded: true,
        },
        commercial: {
          minOrderQuantity: med.minOrderQuantity || 1,
          availableStockBoxes,
          availableStockPieces,
          isPrescriptionRequired,
          requiresRefrigeration,
          isNarcotic: false,
        },
        batches: batches.map((b) => ({
          id: b.id,
          batchNumber: b.batchNumber,
          manufacturingDate: b.manufacturingDate,
          expiryDate: b.expiryDate,
          availableLooseUnits: b.availableLooseUnits,
          reservedLooseUnits: b.reservedLooseUnits,
        })),
        activeOffer,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load medicine." },
      { status: 500 }
    );
  }
}
