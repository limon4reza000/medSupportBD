import { NextRequest, NextResponse } from "next/server";
import { serverCartStore, ICartItemPayload } from "@/lib/cart/cartStore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pharmacyId = "pharm-01", items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Items array is required for synchronization." },
        { status: 400 }
      );
    }

    // Validate quantities
    for (const item of items) {
      if (typeof item.quantity !== "number" || item.quantity < 1) {
        return NextResponse.json(
          { success: false, error: "Item quantity must be a positive integer greater than or equal to 1." },
          { status: 422 }
        );
      }
    }

    const cleanItems: ICartItemPayload[] = items.map((i) => ({
      medicineId: String(i.medicineId),
      quantity: Math.max(1, Math.floor(i.quantity)),
      unitType: i.unitType || "BOX",
    }));

    serverCartStore.set(pharmacyId, cleanItems);

    return NextResponse.json({
      success: true,
      message: "Cart synchronized successfully.",
      syncedAt: new Date().toISOString(),
      itemCount: cleanItems.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to synchronize cart." },
      { status: 500 }
    );
  }
}
