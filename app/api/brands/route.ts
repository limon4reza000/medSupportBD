import { NextRequest, NextResponse } from "next/server";
import { ALL_PHARMA_COMPANIES } from "@/lib/data/pharmaCompanies";

export const dynamic = "force-dynamic";

const POPULAR_BRANDS_MAP: Record<string, string[]> = {
  "Square": ["Seclo", "Ace", "Tylace", "Filwel", "Ciprocin"],
  "Beximco": ["Napa", "Napa Extra", "Azith", "Tofen", "Bexitrol"],
  "Incepta": ["Osartil", "Pantobex", "Monas", "Alatrol"],
  "Renata": ["Maxpro", "Fexo", "Rolac", "Normanal"],
  "Opsonin": ["Finix", "De-Rash", "Opso Saline", "Renova"],
  "Eskayef": ["Losectil", "Tufnil", "Eskaycef", "Anaflex"],
  "ACME": ["Fast", "Nodoff", "Tenoloc", "Monkest"],
  "ACI": ["Afun", "Doxiva", "Biocal", "Tylok"],
  "Aristopharma": ["Lodipin", "Afant", "Rabitaz", "Arixon"],
  "Healthcare": ["Sergel", "Rupafin", "T-Mox", "Xinc"],
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").toLowerCase().trim();
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;

    const allBrands = ALL_PHARMA_COMPANIES.filter((c) => c.id !== "ALL").map((c, index) => {
      const cleanCount = parseInt(c.count.replace(/,/g, ""), 10) || 500;
      const inStock = Math.round(cleanCount * 0.94);
      const popular = POPULAR_BRANDS_MAP[c.id] || [`${c.label} Product A`, `${c.label} Product B`];

      return {
        id: `comp-${c.id.toLowerCase().replace(/\s+/g, "")}`,
        code: c.id.slice(0, 6).toUpperCase(),
        name: c.fullName,
        shortName: c.label,
        logoUrl: `/logos/${c.id.toLowerCase().replace(/\s+/g, "")}.png`,
        skuCount: cleanCount,
        inStockCount: inStock,
        isVerified: true,
        marketShareRank: index + 1,
        popularBrands: popular,
      };
    });

    let filtered = q
      ? allBrands.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.shortName.toLowerCase().includes(q) ||
            b.id.toLowerCase().includes(q) ||
            b.popularBrands.some((p) => p.toLowerCase().includes(q))
        )
      : allBrands;

    if (limit && limit > 0) {
      filtered = filtered.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      totalBrands: filtered.length,
      brands: filtered,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load brands." },
      { status: 500 }
    );
  }
}
