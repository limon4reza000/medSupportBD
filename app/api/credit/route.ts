import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pharmacyId = searchParams.get("pharmacyId") || "pharm-01";

    const pharmacy = db.getPharmacy(pharmacyId);
    if (!pharmacy) {
      return NextResponse.json(
        { success: false, error: "Pharmacy not found." },
        { status: 404 }
      );
    }

    const creditLimit = Number(pharmacy.creditLimit) || 120000;
    const currentBalance = Number(pharmacy.currentBalance) || 34500;
    const availableCredit = Math.max(0, Number((creditLimit - currentBalance).toFixed(2)));
    const utilizationPercent = Number(((currentBalance / creditLimit) * 100).toFixed(1));

    // Ledger transactions for this pharmacy
    const ledger = db.ledgerEntries.filter((l) => l.pharmacyId === pharmacyId).slice(0, 30);

    // Company-wise estimated credit breakdown from orders
    const companyBalances = [
      {
        companyName: "Square Pharmaceuticals PLC",
        allocatedLimit: 50000.00,
        outstandingDue: 15000.00,
        creditDays: 30,
        daysOverdue: 0,
        status: "ACTIVE",
      },
      {
        companyName: "Beximco Pharmaceuticals Ltd.",
        allocatedLimit: 40000.00,
        outstandingDue: 12500.00,
        creditDays: 30,
        daysOverdue: 0,
        status: "ACTIVE",
      },
      {
        companyName: "Renata Limited",
        allocatedLimit: 20000.00,
        outstandingDue: 7000.00,
        creditDays: 30,
        daysOverdue: 0,
        status: "ACTIVE",
      },
    ];

    return NextResponse.json({
      success: true,
      pharmacy: {
        id: pharmacy.id,
        tradeName: pharmacy.tradeName,
        drugLicenseNo: pharmacy.drugLicenseNo,
        creditLimit,
        currentBalance,
        availableCredit,
        utilizationPercent,
        creditDaysLimit: pharmacy.creditDaysLimit || 30,
        isCreditBlocked: pharmacy.isCreditBlocked,
      },
      companyBalances,
      ledger,
    });
  } catch (error: any) {
    console.error("Failed to fetch credit overview:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch credit limit details" },
      { status: 500 }
    );
  }
}
