import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const thana = searchParams.get("thana");

    if (id) {
      const pharmacy = db.getPharmacy(id);
      if (!pharmacy) {
        return NextResponse.json({ success: false, error: "Pharmacy not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, pharmacy });
    }

    let list = db.pharmacies;
    if (thana) {
      list = list.filter((p) => p.thana.toLowerCase() === thana.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      total: list.length,
      pharmacies: list.map((p) => ({
        ...p,
        availableCredit: Number((p.creditLimit - p.currentBalance).toFixed(2)),
        isCompliant: !p.isCreditBlocked && p.isLocationVerified,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load pharmacies." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id = "pharm-01", tradeName, drugLicenseNo, taxId, phone, address, thana, district, latitude, longitude } = body;

    const pharmacy = db.getPharmacy(id);
    if (!pharmacy) {
      return NextResponse.json({ success: false, error: "Pharmacy not found." }, { status: 404 });
    }

    if (tradeName) pharmacy.tradeName = tradeName.trim();
    if (drugLicenseNo) pharmacy.drugLicenseNo = drugLicenseNo.trim();
    if (taxId) pharmacy.taxId = taxId.trim();
    if (phone) pharmacy.phone = phone.trim();
    if (address) pharmacy.address = address.trim();
    if (thana) pharmacy.thana = thana.trim();
    if (district) pharmacy.district = district.trim();
    if (typeof latitude === "number") pharmacy.latitude = latitude;
    if (typeof longitude === "number") pharmacy.longitude = longitude;

    return NextResponse.json({
      success: true,
      message: "Pharmacy profile and DGDA compliance records updated successfully.",
      pharmacy,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update pharmacy profile." },
      { status: 500 }
    );
  }
}
