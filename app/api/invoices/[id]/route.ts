import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const invoiceId = params.id;
    const invoice = db.getInvoice(invoiceId);

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: `Invoice '${invoiceId}' not found.` },
        { status: 404 }
      );
    }

    const pharmacy = db.getPharmacy(invoice.pharmacyId);

    return NextResponse.json({
      success: true,
      invoice: {
        ...invoice,
        pharmacy: pharmacy
          ? {
              tradeName: pharmacy.tradeName,
              ownerName: pharmacy.ownerName,
              drugLicenseNo: pharmacy.drugLicenseNo,
              taxId: pharmacy.taxId || "TIN-9948271049",
              address: pharmacy.address,
              thana: pharmacy.thana,
              district: pharmacy.district,
              phone: pharmacy.phone,
            }
          : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve invoice." },
      { status: 500 }
    );
  }
}
