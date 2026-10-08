import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";
import { BatchFifoEngine } from "@/services/batchFifoEngine";

export async function GET(
  req: NextRequest,
  { params }: { params: { medicineId: string } }
) {
  const medicineId = params.medicineId;
  const med = db.getMedicine(medicineId);

  if (!med) {
    return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
  }

  const batches = db.getBatchesForMedicine(med.id);
  const availableStock = BatchFifoEngine.getTotalAvailableStock(batches);
  const activeOffer = db.getOfferForMedicine(med.id);

  return NextResponse.json({
    ...med,
    availableStockPieces: availableStock,
    batches,
    activeOffer,
  });
}
