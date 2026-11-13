import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const query = (searchParams.get("query") || "").toLowerCase().trim();
    const stockFilter = searchParams.get("stockFilter") || "ALL";

    // Use enriched catalog
    const catalog = db.getEnrichedCatalog();

    let filtered = catalog.filter((item) => {
      if (companyId && companyId !== "ALL") {
        if (!item.manufacturer.toLowerCase().includes(companyId.toLowerCase())) {
          return false;
        }
      }

      if (query) {
        const matchBrand = item.brandName.toLowerCase().includes(query);
        const matchGen = item.genericName.toLowerCase().includes(query);
        const matchMfg = item.manufacturer.toLowerCase().includes(query);
        if (!matchBrand && !matchGen && !matchMfg) return false;
      }

      if (stockFilter === "IN_STOCK") {
        return item.availableStockBoxes > 15;
      } else if (stockFilter === "LOW_STOCK") {
        return item.availableStockBoxes > 0 && item.availableStockBoxes <= 15;
      } else if (stockFilter === "OUT_OF_STOCK") {
        return item.availableStockBoxes === 0;
      }

      return true;
    });

    // Sort by available stock
    filtered.sort((a, b) => b.availableStockBoxes - a.availableStockBoxes);

    return NextResponse.json({
      success: true,
      count: filtered.length,
      items: filtered.slice(0, 100), // top 100 for responsive performance
    });
  } catch (error: any) {
    console.error("Failed to fetch company stock status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stock status" },
      { status: 500 }
    );
  }
}
