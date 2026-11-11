import { NextRequest, NextResponse } from "next/server";
import { ALL_PHARMA_COMPANIES } from "@/lib/data/pharmaCompanies";
import { db } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || searchParams.get("q") || "").toLowerCase().trim();

    const allDepots = db.getDistributors ? db.getDistributors() : (db.distributors || []);

    const companies = ALL_PHARMA_COMPANIES.filter((c) => c.id !== "ALL").map((c, index) => {
      // Find associated depots from mockDb
      let matchingDepots = allDepots.filter(
        (d) =>
          d.companyName.toLowerCase().includes(c.id.toLowerCase()) ||
          d.name.toLowerCase().includes(c.id.toLowerCase())
      );

      if (matchingDepots.length === 0) {
        matchingDepots = [allDepots[index % allDepots.length]];
      }

      const cleanCount = parseInt(c.count.replace(/,/g, ""), 10) || 500;
      const minOrder = c.id === "Square" ? 3000 : c.id === "Beximco" ? 2000 : 1500;

      return {
        id: c.id,
        name: c.fullName,
        shortName: c.label,
        code: c.id.slice(0, 4).toUpperCase(),
        logoUrl: `/logos/${c.id.toLowerCase()}.png`,
        dgdaManufacturerNo: `MFG-LIC-${String(1001 + index).padStart(4, "0")}`,
        skuCount: cleanCount,
        depotsCount: matchingDepots.length,
        minimumOrderAmount: minOrder,
        supportPhone: "+880 2-9876543",
        supportEmail: `orderdesk@${c.id.toLowerCase().replace(/\s+/g, "")}.com.bd`,
        isDgdaVerified: true,
        headquarters: "Dhaka, Bangladesh",
        depots: matchingDepots.map((d) => ({
          id: d.id,
          name: d.name,
          address: d.address,
          thana: d.thana,
          district: d.district,
          contactPhone: d.contactNo,
          operatingHours: d.operatingHours || "8:00 AM - 9:00 PM",
          isColdChainCertified: !!d.coldChainAvailable,
          orderCutoffTime: "14:00",
        })),
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
