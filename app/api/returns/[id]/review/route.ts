import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";
import { ReturnStatus } from "@/types/domain";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const returnId = params.id;
    const body = await req.json();
    const { status, rejectionNote, reviewerId } = body;

    if (!status || (status !== ReturnStatus.APPROVED && status !== ReturnStatus.REJECTED)) {
      return NextResponse.json(
        { success: false, error: "Status must be 'APPROVED' or 'REJECTED'." },
        { status: 400 }
      );
    }

    const claim = db.getReturnRequest(returnId);
    if (!claim) {
      return NextResponse.json(
        { success: false, error: `Return claim '${returnId}' not found.` },
        { status: 404 }
      );
    }

    const success = db.reviewReturnRequest(
      claim.id,
      status as ReturnStatus,
      rejectionNote,
      reviewerId || "Mahmudul Hasan (Authorized MPO)"
    );

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to process review." },
        { status: 500 }
      );
    }

    const updated = db.getReturnRequest(claim.id);
    const pharmacy = db.getPharmacy(claim.pharmacyId);

    return NextResponse.json({
      success: true,
      message: `Return claim ${claim.returnNumber} has been ${status.toLowerCase()}.`,
      returnRequest: updated,
      pharmacyBalance: pharmacy?.currentBalance,
      availableCredit: pharmacy ? Math.max(0, pharmacy.creditLimit - pharmacy.currentBalance) : 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to review return request." },
      { status: 500 }
    );
  }
}
