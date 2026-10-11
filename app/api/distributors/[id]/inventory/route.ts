import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const distributor = db.getDistributor(id);

    if (!distributor) {
      return NextResponse.json(
        { error: "Distributor depot not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const inventory = db.getDistributorInventory(id, search, limit);

    return NextResponse.json({
      success: true,
      distributor,
      totalItems: inventory.length,
      inventory,
    });
  } catch (error: any) {
    console.error("[API distributor inventory error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch distributor inventory", message: error.message },
      { status: 500 }
    );
  }
}
