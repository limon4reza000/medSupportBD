import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pharmacyId = searchParams.get("pharmacyId") || "pharm-01";
    const status = searchParams.get("status");

    let invoices = db.getInvoices(pharmacyId);

    if (status && status !== "ALL") {
      invoices = invoices.filter((i) => i.status === status);
    }

    const totalInvoiced = invoices.reduce((sum, i) => sum + (Number(i.netPayable) || 0), 0);
    const totalUnpaid = invoices.reduce((sum, i) => sum + (Number(i.dueAmount) || 0), 0);
    const totalPaid = invoices.reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0);

    return NextResponse.json({
      success: true,
      count: invoices.length,
      summary: {
        totalInvoiced,
        totalUnpaid,
        totalPaid,
      },
      invoices,
    });
  } catch (error: any) {
    console.error("Failed to fetch invoices:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
