import { NextRequest, NextResponse } from "next/server";
import { ALL_PHARMA_COMPANIES } from "@/lib/data/pharmaCompanies";
import { db } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").toLowerCase().trim();

    const brands = ALL_PHARMA_COMPANIES.filter((c) => c.id !== "ALL").map((c) => {
      return {
        id: c.id,
        name: c.label,
        fullName: c.fullName,
        skuCount: c.count,
        isVerified: true,
      };
    });

    const filtered = q
      ? brands.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.fullName.toLowerCase().includes(q) ||
            b.id.toLowerCase().includes(q)
        )
      : brands;

    return NextResponse.json({
      success: true,
      total: filtered.length,
      brands: filtered,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load brands." },
      { status: 500 }
    );
  }
}
