import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";
import { ReturnStatus } from "@/types/domain";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pharmacyId = searchParams.get("pharmacyId") || "pharm-01";
    const status = searchParams.get("status");

    let returns = db.getReturnRequests(pharmacyId);

    if (status && status !== "ALL") {
      returns = returns.filter((r) => r.status === status);
    }

    return NextResponse.json({
      success: true,
      count: returns.length,
      returns,
    });
  } catch (error: any) {
    console.error("Failed to fetch returns:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch return claims" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      pharmacyId = "pharm-01",
      orderId,
      companyName,
      reason,
      notes,
      items,
    } = body;

    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "orderId and at least one return item are required." },
        { status: 400 }
      );
    }

    const order = db.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order '${orderId}' not found.` },
        { status: 404 }
      );
    }

    // Verify order is delivered
    if (order.status !== "DELIVERED" && order.status !== "COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          error: `Return requests are only permitted for delivered orders. Current order status: ${order.status}.`,
        },
        { status: 422 }
      );
    }

    let calculatedTotalRefund = 0;
    const validatedItems = [];

    for (const it of items) {
      const med = db.getMedicine(it.medicineId);
      const unitPrice = Number(it.unitPrice || (med ? med.tradePricePerPiece * med.piecesPerStrip * med.stripsPerBox : 490));
      const qty = Number(it.quantity) || 1;
      const refund = Number((unitPrice * qty).toFixed(2));
      calculatedTotalRefund += refund;

      validatedItems.push({
        id: `ritm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        returnId: "",
        medicineId: it.medicineId,
        brandName: it.brandName || med?.brandName || "Medicine",
        batchNumber: it.batchNumber || "BATCH-RETURN",
        quantity: qty,
        unitPrice,
        totalRefund: refund,
      });
    }

    const returnNumber = `RET-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const returnId = `ret-${Date.now()}`;

    const newClaim = {
      id: returnId,
      returnNumber,
      pharmacyId,
      orderId: order.id,
      orderNumber: order.orderNumber || order.id,
      companyName: companyName || order.companyName || "Pharmaceutical Depot",
      reason: reason || "DAMAGED_PACKAGING",
      notes: notes || "Submitted by pharmacy owner for verification",
      status: ReturnStatus.SUBMITTED,
      totalAmount: calculatedTotalRefund,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: validatedItems.map((it) => ({ ...it, returnId })),
    };

    db.addReturnRequest(newClaim);

    // Emit notification to pharmacy and assigned MPO
    db.addNotification({
      id: `notif-${Date.now()}`,
      pharmacyId,
      title: "Return Claim Submitted",
      message: `Return request ${returnNumber} for ${newClaim.companyName} (৳${calculatedTotalRefund.toLocaleString()}) submitted. Awaiting representative review.`,
      type: "STATUS_CHANGE",
      metadata: { returnId, returnNumber },
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Return claim ${returnNumber} submitted successfully.`,
      returnRequest: newClaim,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit return claim." },
      { status: 500 }
    );
  }
}
