import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";
import { BatchFifoEngine } from "@/services/batchFifoEngine";

export const dynamic = "force-dynamic";

// Bengali Phonetic Transliteration Map for common pharmaceutical brands and generics
const BENGALI_TRANSLITERATION_MAP: Record<string, string> = {
  "নাপা": "napa",
  "প্যারাসিটামল": "paracetamol",
  "সার্জেল": "sergel",
  "সেক্লো": "seclo",
  "অমিপ্রাজল": "omeprazole",
  "মন্টেলুকাস্ট": "montelukast",
  "মোনাস": "monas",
  "অ্যাজিল": "ace",
  "এসি": "ace",
  "ফেক্সো": "fexo",
  "রোসুভা": "rosuva",
  "টফেন": "tofen",
  "প্যান্টোপ্রাজল": "pantoprazole",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let query = (searchParams.get("q") || searchParams.get("search") || "").trim();
    const manufacturer = searchParams.get("manufacturer") || "";
    const dosageForm = searchParams.get("dosageForm") || searchParams.get("form") || "";
    const inStockOnly = searchParams.get("inStockOnly") === "true" || searchParams.get("inStock") === "true";
    const sortBy = searchParams.get("sortBy") || "relevance";
    const limitParam = searchParams.get("limit");
    const pageParam = searchParams.get("page");
    const singleId = searchParams.get("id");

    // Check Bengali transliteration
    const lowerQuery = query.toLowerCase();
    for (const [bn, en] of Object.entries(BENGALI_TRANSLITERATION_MAP)) {
      if (lowerQuery.includes(bn)) {
        query = query.replace(bn, en);
      }
    }

    // Single medicine lookup by ID
    if (singleId) {
      const med = db.getMedicine(singleId);
      if (!med) {
        return NextResponse.json({ success: false, error: "Medicine not found" }, { status: 404 });
      }
      const batches = db.getBatchesForMedicine(med.id);
      const availableStock = BatchFifoEngine.getTotalAvailableStock(batches);
      const activeOffer = db.getOfferForMedicine(med.id);
      return NextResponse.json({
        success: true,
        medicine: {
          ...med,
          availableStockPieces: availableStock,
          batches,
          activeOffer,
        },
      });
    }

    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
    const limit = limitParam ? Math.max(1, parseInt(limitParam, 10)) : 20;

    const startTime = performance.now();

    // Query database with pagination and filters
    const paginatedResult = db.searchMedicinesPaginated(query, page, limit, {
      manufacturer,
      dosageForm,
    });

    let medicines = paginatedResult.medicines;

    // Filter in-stock only if requested
    if (inStockOnly) {
      medicines = medicines.filter((m: any) => (m.availableStock || m.availableStockPieces || 0) > 0);
    }

    // Sorting
    if (sortBy === "price_asc") {
      medicines.sort((a: any, b: any) => (a.tradePricePerPiece || 0) - (b.tradePricePerPiece || 0));
    } else if (sortBy === "price_desc") {
      medicines.sort((a: any, b: any) => (b.tradePricePerPiece || 0) - (a.tradePricePerPiece || 0));
    } else if (sortBy === "margin") {
      medicines.sort((a: any, b: any) => {
        const marginA = a.mrpPerPiece > 0 ? (a.mrpPerPiece - a.tradePricePerPiece) / a.mrpPerPiece : 0;
        const marginB = b.mrpPerPiece > 0 ? (b.mrpPerPiece - b.tradePricePerPiece) / b.mrpPerPiece : 0;
        return marginB - marginA;
      });
    }

    const durationMs = Number((performance.now() - startTime).toFixed(2));

    // Formatted standardized response
    const responsePayload = {
      success: true,
      query,
      durationMs,
      totalMatches: paginatedResult.totalFiltered,
      page,
      limit,
      totalPages: Math.ceil(paginatedResult.totalFiltered / limit),
      filters: {
        activeManufacturer: manufacturer || "ALL",
        activeForm: dosageForm || "ALL",
        inStockOnly,
        sortBy,
      },
      medicines: medicines.map((m: any) => {
        const stripsPerBox = m.stripsPerBox || 10;
        const piecesPerStrip = m.piecesPerStrip || 10;
        const totalUnitsPerBox = stripsPerBox * piecesPerStrip;
        const tradePricePerBox = Number((m.tradePricePerPiece * totalUnitsPerBox).toFixed(2));
        const mrpPerBox = Number((m.mrpPerPiece * totalUnitsPerBox).toFixed(2));

        return {
          id: m.id,
          name: m.brandName,
          genericName: m.genericName,
          strength: m.strength,
          dosageForm: m.dosageForm,
          manufacturer: {
            id: m.manufacturer,
            name: m.manufacturer,
          },
          tradePrice: m.tradePricePerPiece,
          tradePricePerBox,
          mrp: m.mrpPerPiece,
          mrpPerBox,
          stripsPerBox,
          piecesPerStrip,
          totalUnitsPerBox,
          availableStock: m.availableStock || 1000,
          isPrescriptionRequired: !!m.requiresPrescription,
          requiresRefrigeration: !!m.requiresColdChain,
        };
      }),
    };

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to search medicines." },
      { status: 500 }
    );
  }
}
