import { NextResponse } from "next/server";
import { db } from "@/lib/mockDb";
import { BatchFifoEngine } from "@/services/batchFifoEngine";

export async function GET() {
  const result = db.medicines.map((med) => {
    const batches = db.getBatchesForMedicine(med.id);
    const availableStock = BatchFifoEngine.getTotalAvailableStock(batches);
    const activeOffer = db.getOfferForMedicine(med.id);

    return {
      ...med,
      availableStockPieces: availableStock,
      batches,
      activeOffer,
    };
  });

  return NextResponse.json(result);
}
