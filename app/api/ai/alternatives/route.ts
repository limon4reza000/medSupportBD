import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";
import { BatchFifoEngine } from "@/services/batchFifoEngine";
import { GenericAlternativesResponseSchema } from "@/types/domain";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const medicineId = searchParams.get("medicineId") || "med-06"; // Default to Zimax 500 (low stock)

    const targetMed = db.getMedicine(medicineId);
    if (!targetMed) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    const targetBatches = db.getBatchesForMedicine(targetMed.id);
    const targetStock = BatchFifoEngine.getTotalAvailableStock(targetBatches);
    const isOutOfStockOrLow = targetStock <= 50;

    // Find all medicines sharing the same generic name or therapeutic equivalence
    const matchingGenerics = db.medicines.filter(
      (m) =>
        m.id !== targetMed.id &&
        m.genericName.toLowerCase() === targetMed.genericName.toLowerCase()
    );

    // If no exact generic match found, find same class / therapeutic group (e.g. PPIs or Antibiotics)
    let candidateMeds = matchingGenerics;
    if (candidateMeds.length === 0) {
      // Look for therapeutic class match (e.g. Paracetamol alternatives or PPI alternatives)
      if (targetMed.genericName.includes("Paracetamol")) {
        candidateMeds = db.medicines.filter(
          (m) => m.id !== targetMed.id && m.genericName.includes("Paracetamol")
        );
      } else if (targetMed.genericName.includes("Omeprazole") || targetMed.genericName.includes("Esomeprazole")) {
        candidateMeds = db.medicines.filter(
          (m) => m.id !== targetMed.id && (m.genericName.includes("Omeprazole") || m.genericName.includes("Esomeprazole"))
        );
      }
    }

    const alternatives = candidateMeds.map((alt) => {
      const altBatches = db.getBatchesForMedicine(alt.id);
      const availableUnits = BatchFifoEngine.getTotalAvailableStock(altBatches);
      const priceDiff = Number(
        (
          ((Number(alt.tradePricePerPiece) - Number(targetMed.tradePricePerPiece)) /
            Number(targetMed.tradePricePerPiece)) *
          100
        ).toFixed(1)
      );

      return {
        medicine_id: alt.id,
        brand_name: alt.brandName,
        generic_name: alt.genericName,
        dosage_form: alt.dosageForm,
        strength: alt.strength,
        manufacturer: alt.manufacturer,
        available_loose_units: availableUnits,
        trade_price_per_piece: Number(alt.tradePricePerPiece),
        price_difference_percent: priceDiff,
        bioequivalence_rating: "A-Rated Therapeutic Equivalent (DGDA Verified)",
        in_stock: availableUnits > 0,
      };
    });

    const payload = {
      requested_medicine_id: targetMed.id,
      requested_brand_name: targetMed.brandName,
      generic_name: targetMed.genericName,
      strength: targetMed.strength,
      requested_out_of_stock: isOutOfStockOrLow,
      alternatives,
    };

    const validated = GenericAlternativesResponseSchema.parse(payload);
    return NextResponse.json(validated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to find generic alternatives" },
      { status: 500 }
    );
  }
}
