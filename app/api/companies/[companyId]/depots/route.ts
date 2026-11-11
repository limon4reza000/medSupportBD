import { NextRequest, NextResponse } from "next/server";
import { ALL_PHARMA_COMPANIES } from "@/lib/data/pharmaCompanies";
import { db } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
  try {
    const companyId = params.companyId;
    const company = ALL_PHARMA_COMPANIES.find(
      (c) => c.id.toLowerCase() === companyId.toLowerCase() || c.label.toLowerCase() === companyId.toLowerCase()
    );

    if (!company) {
      return NextResponse.json(
        { success: false, error: `Pharmaceutical company '${companyId}' not found.` },
        { status: 404 }
      );
    }

    const allDepots = db.getDistributors ? db.getDistributors() : (db.distributors || []);
    
    // Find matching depots
    let matchingDepots = allDepots.filter(
      (d) =>
        d.companyName.toLowerCase().includes(company.id.toLowerCase()) ||
        d.name.toLowerCase().includes(company.id.toLowerCase())
    );

    // If no direct depot name match, associate with central distribution hubs
    if (matchingDepots.length === 0) {
      matchingDepots = allDepots.slice(0, 2);
    }

    const depots = matchingDepots.map((d) => ({
      id: d.id,
      name: d.name,
      companyId: company.id,
      companyName: company.fullName,
      address: d.address,
      thana: d.thana,
      district: d.district,
      contactPhone: d.contactNo,
      operatingHours: d.operatingHours || "8:00 AM - 8:00 PM",
      isColdChainCertified: !!d.coldChainAvailable,
      orderCutoffTime: "14:00",
      coveredThanas: ["Dhanmondi", "Tejgaon", "Mohammadpur", "Mirpur", "Gulshan", "Uttara"],
      dispatchSchedules: ["11:00 AM", "03:00 PM", "06:00 PM"],
    }));

    return NextResponse.json({
      success: true,
      companyId: company.id,
      companyName: company.fullName,
      depotsCount: depots.length,
      depots,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load company depots." },
      { status: 500 }
    );
  }
}
