import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";
import { BatchFifoEngine } from "@/services/batchFifoEngine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || searchParams.get("search") || "";
  const manufacturer = searchParams.get("manufacturer") || "";
  const dosageForm = searchParams.get("dosageForm") || "";
  const limitParam = searchParams.get("limit");
  const pageParam = searchParams.get("page");
  const isPaginated = searchParams.get("paginated") === "true" || !!pageParam;
  const singleId = searchParams.get("id");

  // Single medicine lookup by ID
  if (singleId) {
    const med = db.getMedicine(singleId);
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

  const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
  const limit = limitParam ? Math.max(1, parseInt(limitParam, 10)) : 50;

  // If paginated mode requested by Virtualized list or infinite scroll
  if (isPaginated) {
    const result = db.searchMedicinesPaginated(query, page, limit, {
      manufacturer,
      dosageForm,
    });
    return NextResponse.json(result);
  }

  // Legacy / unpaginated support for tests and other components
  const isUnfiltered = !query && (!manufacturer || manufacturer === "ALL") && (!dosageForm || dosageForm === "ALL") && !limitParam;
  if (isUnfiltered) {
    return NextResponse.json(db.getEnrichedCatalog());
  }

  const paginatedResult = db.searchMedicinesPaginated(query, 1, limit, {
    manufacturer,
    dosageForm,
  });

  return NextResponse.json(paginatedResult.medicines);
}
