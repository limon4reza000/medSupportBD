import { NextRequest, NextResponse } from "next/server";
import { SEED_USERS } from "@/lib/auth/rbac";
import { initialPharmacies } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("medgo_session")?.value || req.headers.get("Authorization")?.replace("Bearer ", "");

    let activeUser = SEED_USERS[0]; // Default to primary pharmacy owner for instant seamless experience

    if (token && token.startsWith("mgtok_")) {
      try {
        const decoded = Buffer.from(token.replace("mgtok_", ""), "base64").toString("utf-8");
        const [userId, role] = decoded.split(":");
        const matched = SEED_USERS.find((u) => u.id === userId);
        if (matched) {
          activeUser = matched;
        }
      } catch (e) {
        // Fallback to default
      }
    }

    const pharmacy = initialPharmacies.find((p) => p.id === (activeUser.pharmacyId || "pharm-01")) || initialPharmacies[0];

    return NextResponse.json({
      success: true,
      user: activeUser,
      pharmacy: {
        id: pharmacy.id,
        tradeName: pharmacy.tradeName,
        drugLicenseNo: pharmacy.drugLicenseNo,
        taxId: pharmacy.taxId,
        ownerName: pharmacy.ownerName,
        phone: pharmacy.phone,
        address: pharmacy.address,
        thana: pharmacy.thana,
        district: pharmacy.district,
        creditLimit: pharmacy.creditLimit,
        currentBalance: pharmacy.currentBalance,
        availableCredit: pharmacy.creditLimit - pharmacy.currentBalance,
        isLocationVerified: pharmacy.isLocationVerified,
        coordinates: {
          latitude: pharmacy.latitude,
          longitude: pharmacy.longitude,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load session profile." },
      { status: 500 }
    );
  }
}
