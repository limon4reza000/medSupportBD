import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";
import { BatchFifoEngine } from "@/services/batchFifoEngine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || searchParams.get("search") || "";
  const manufacturer = searchParams.get("manufacturer") || "";
  const dosageForm = searchParams.get("dosageForm") || "";
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  const isUnfiltered = !query && (!manufacturer || manufacturer === "ALL") && (!dosageForm || dosageForm === "ALL") && !limit;
  if (isUnfiltered) {
    return NextResponse.json(db.getEnrichedCatalog());
  }

  let filtered = db.medicines;

  if (query) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (med) =>
        med.brandName.toLowerCase().includes(q) ||
        med.genericName.toLowerCase().includes(q) ||
        med.manufacturer.toLowerCase().includes(q) ||
        med.strength.toLowerCase().includes(q) ||
        (med.darNo && med.darNo.toLowerCase().includes(q))
    );
  }

  if (manufacturer && manufacturer !== "ALL") {
    filtered = filtered.filter((med) =>
      med.manufacturer.toLowerCase().includes(manufacturer.toLowerCase())
    );
  }

  if (dosageForm && dosageForm !== "ALL") {
    filtered = filtered.filter((med) =>
      med.dosageForm.toLowerCase() === dosageForm.toLowerCase()
    );
  }

  if (limit && limit > 0) {
    filtered = filtered.slice(0, limit);
  }

  const result = filtered.map((med) => {
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
