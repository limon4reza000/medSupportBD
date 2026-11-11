import { NextRequest, NextResponse } from "next/server";
import { ALL_PHARMA_COMPANIES } from "@/lib/data/pharmaCompanies";
import { db } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").toLowerCase().trim();

    const allDepots = db.getDistributors ? db.getDistributors() : (db.distributors || []);

    const companies = ALL_PHARMA_COMPANIES.filter((c) => c.id !== "ALL").map((c) => {
      // Find associated depots from mockDb
      const matchingDepots = allDepots.filter(
        (d) =>
          d.companyName.toLowerCase().includes(c.id.toLowerCase()) ||
          d.name.toLowerCase().includes(c.id.toLowerCase())
      );

      return {
        id: c.id,
        name: c.fullName,
        shortName: c.label,
        skuCount: c.count,
        depotsCount: matchingDepots.length || 1,
        depots: matchingDepots.map((d) => ({
          id: d.id,
          name: d.name,
          address: d.address,
          thana: d.thana,
          district: d.district,
          contactNo: d.contactNo,
          operatingHours: d.operatingHours,
          coldChainAvailable: d.coldChainAvailable,
          verificationBadge: d.verificationBadge,
        })),
        isDgdaVerified: true,
        headquarters: "Dhaka, Bangladesh",
      };
    });

    const filtered = search
      ? companies.filter(
          (c) =>
            c.name.toLowerCase().includes(search) ||
            c.shortName.toLowerCase().includes(search) ||
            c.id.toLowerCase().includes(search)
        )
      : companies;

    return NextResponse.json({
      success: true,
      total: filtered.length,
      companies: filtered,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load pharmaceutical companies." },
      { status: 500 }
    );
  }
}
