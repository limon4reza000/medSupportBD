import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

// DGDA Drug License Format Regex:
// e.g. DL-DHK-2024-8841, DL-CTG-1029, DGDA-PH-99214, DA-12345, DC-88492
const DGDA_LICENSE_REGEX = /^(DL-[A-Z]{2,4}-\d{4}-\d{2,6}|DL-[A-Z]{2,4}-\d{3,6}|DGDA-PH-\d{4,8}|[A-Z]{2}-\d{4,8})$/i;

// Bangladesh Geographic Coordinate Bounds:
// Latitude: 20.5° N to 26.7° N
// Longitude: 88.0° E to 92.7° E
function isValidBangladeshCoordinates(lat: number, lng: number): boolean {
  return lat >= 20.5 && lat <= 26.7 && lng >= 88.0 && lng <= 92.7;
}

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

      const availableCredit = Number((pharmacy.creditLimit - pharmacy.currentBalance).toFixed(2));
      const usedPercent = Math.min(100, Math.round((pharmacy.currentBalance / pharmacy.creditLimit) * 100));

      return NextResponse.json({
        success: true,
        pharmacy: {
          ...pharmacy,
          availableCredit,
          usedCreditPercent: usedPercent,
          creditStatus: usedPercent > 90 ? "WARNING" : "ACTIVE",
          licenseExpiryDate: pharmacy.licenseExpiryDate || "2027-12-31T23:59:59.000Z",
          pharmacistName: pharmacy.pharmacistName || "Md. Nazmul Karim, B.Pharm",
          pharmacistRegNumber: pharmacy.pharmacistRegNumber || "PR-88219-BPC",
          isCompliant: !pharmacy.isCreditBlocked && pharmacy.isLocationVerified,
        },
      });
    }

    let list = db.pharmacies;
    if (thana) {
      list = list.filter((p) => p.thana.toLowerCase() === thana.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      total: list.length,
      pharmacies: list.map((p) => {
        const availableCredit = Number((p.creditLimit - p.currentBalance).toFixed(2));
        const usedPercent = Math.min(100, Math.round((p.currentBalance / p.creditLimit) * 100));
        return {
          ...p,
          availableCredit,
          usedCreditPercent: usedPercent,
          creditStatus: usedPercent > 90 ? "WARNING" : "ACTIVE",
          isCompliant: !p.isCreditBlocked && p.isLocationVerified,
        };
      }),
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
    const {
      id = "pharm-01",
      tradeName,
      drugLicenseNo,
      licenseExpiryDate,
      pharmacistName,
      pharmacistRegNumber,
      taxId,
      phone,
      address,
      thana,
      district,
      latitude,
      longitude,
    } = body;

    const pharmacy = db.getPharmacy(id);
    if (!pharmacy) {
      return NextResponse.json({ success: false, error: "Pharmacy not found." }, { status: 404 });
    }

    // 1. Validate DGDA Drug License Format if modified
    if (drugLicenseNo) {
      const cleanLicense = drugLicenseNo.trim();
      if (!DGDA_LICENSE_REGEX.test(cleanLicense)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid DGDA Drug License format. Expected format: DL-DHK-2024-XXXX, DGDA-PH-XXXX, or DA-XXXX.",
            code: "INVALID_DGDA_LICENSE_FORMAT",
          },
          { status: 422 }
        );
      }
      pharmacy.drugLicenseNo = cleanLicense;
    }

    // 2. Validate License Expiry Date
    if (licenseExpiryDate) {
      const expiry = new Date(licenseExpiryDate);
      if (isNaN(expiry.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid license expiration date format." },
          { status: 422 }
        );
      }
      if (expiry.getTime() < Date.now()) {
        pharmacy.isCreditBlocked = true; // Block orders if license is expired
        pharmacy.licenseExpiryDate = expiry.toISOString();
        return NextResponse.json(
          {
            success: false,
            error: "Cannot register an expired DGDA Drug License. Wholesale ordering will be suspended.",
            code: "LICENSE_EXPIRED",
            pharmacy,
          },
          { status: 422 }
        );
      }
      pharmacy.licenseExpiryDate = expiry.toISOString();
      pharmacy.isCreditBlocked = false;
    }

    // 3. Validate GPS Coordinates if provided
    if (typeof latitude === "number" && typeof longitude === "number") {
      if (!isValidBangladeshCoordinates(latitude, longitude)) {
        return NextResponse.json(
          {
            success: false,
            error: "Location coordinates must be within Bangladesh territory (Lat: 20.5°-26.7°, Lng: 88.0°-92.7°).",
            code: "COORDINATES_OUT_OF_BOUNDS",
          },
          { status: 422 }
        );
      }
      pharmacy.latitude = Number(latitude.toFixed(6));
      pharmacy.longitude = Number(longitude.toFixed(6));
      pharmacy.isLocationVerified = true;
    }

    // Update other fields
    if (tradeName) pharmacy.tradeName = tradeName.trim();
    if (taxId) pharmacy.taxId = taxId.trim();
    if (phone) pharmacy.phone = phone.trim();
    if (address) pharmacy.address = address.trim();
    if (thana) pharmacy.thana = thana.trim();
    if (district) pharmacy.district = district.trim();
    if (pharmacistName) (pharmacy as any).pharmacistName = pharmacistName.trim();
    if (pharmacistRegNumber) (pharmacy as any).pharmacistRegNumber = pharmacistRegNumber.trim();

    return NextResponse.json({
      success: true,
      message: "Pharmacy profile and DGDA compliance records updated successfully.",
      pharmacy: {
        ...pharmacy,
        availableCredit: Number((pharmacy.creditLimit - pharmacy.currentBalance).toFixed(2)),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update pharmacy profile." },
      { status: 500 }
    );
  }
}
